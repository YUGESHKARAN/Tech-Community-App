import React, { useState, useEffect, useMemo } from "react";
import { MdDeleteForever, MdManageAccounts } from "react-icons/md";
import Footer from "../../ui/Footer";
import { IoSearch } from "react-icons/io5";
import axiosInstance from "../../instances/Axiosinstances";
import toast from "../../components/toaster/Toast";
import useGetCommunityAnalytics from "../../hooks/useGetCommunityAnalytics";
import NavBar from "../../ui/NavBar";
import useGetStudents from "../../hooks/admins/useGetStudents";
import useGetCoordinators from "../../hooks/admins/useGetCoordinators";
import useGetAdmins from "../../hooks/admins/useGetAdmins";
import { Link } from "react-router-dom";
import AdminCardLoader from "../../components/loaders/controls/AdminCardLoader";
import CoordinatorLoader from "../../components/loaders/controls/CoordinatorLoader";
import StudentLoader from "../../components/loaders/controls/StudentLoader";
import { getItem } from "../../utils/encode";
import highlightText from "../../hooks/highlightText";
import Fuse from "fuse.js";
// import Footer from "../../ui/Footer";
function Control() {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatedRoles, setUpdatedRoles] = useState({});
  const [assignedCommunities, setAssignedCommunities] = useState({});
  const [posts, setPosts] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authorEmail, setAuthorEmail] = useState("");
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const [password, setPassword] = useState("");
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [filteredCoordinators, setFilteredCoordinators] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const { communities } = useGetCommunityAnalytics();
  const [updateId , setUpdateId] = useState(null);
  const [ updateCommuntiyId, setUpdateCommunityId] = useState(null)

  const {
    students,
    totalStudents,
    loading: studentLoading,
    hasMore: studentHashMore,
    setStudents
  } = useGetStudents(email);
  const {
    coordinators,
    totalCoordinators,
    loading: coordinatorsLoading,
    hasMore: coordinatorHashMore,
    setCoordinators
  } = useGetCoordinators(email);

  const {
    admins,
    totalAdmins,
    loading: adminLoading,
    hasMore: adminHashMore,
    loadMore,
    setAdmins
  } = useGetAdmins(email);


const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

   const fuse = useMemo(() => {
    return new Fuse([...admins, ...coordinators, ...students], {
      keys: ["name", "email"],
      threshold: 0.3, // lower = stricter search
    });
  }, [[...admins, ...coordinators, ...students]]);
  // Filter admins, coordinators, and students based on search and role
  useEffect(() => {
    const applyFilters = (data) => {
      let filtered = data;

      if (debouncedSearch.trim() !== "") {
        const query = debouncedSearch.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name?.toLowerCase().includes(query) ||
            item.email?.toLowerCase().includes(query)
        );
      }

      if (roleFilter !== "" && roleFilter !== "admin" && roleFilter !== "coordinator" && roleFilter !== "student") {
        // If a specific role filter is set, apply it
      } else if (roleFilter === "admin" || roleFilter === "coordinator" || roleFilter === "student") {
        filtered = filtered.filter((item) => item.role === roleFilter);
      }

      return filtered;
    };

    setFilteredAdmins(applyFilters(admins));
    setFilteredCoordinators(applyFilters(coordinators));
    setFilteredStudents(applyFilters(students));
  }, [searchQuery, roleFilter, admins, coordinators, debouncedSearch,  students]);

  const handleRoleChange = (id, newRole) => {
    setUpdatedRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  const reloadRoleLists = async () => {
    try {
      const [adminsRes, coordinatorsRes, studentsRes] = await Promise.all([
        axiosInstance.get(`/blog/analytics/view/admins/${email}?page=1&limit=20`),
        axiosInstance.get(`/blog/analytics/view/coordinators/${email}?page=1&limit=50`),
        axiosInstance.get(`/blog/analytics/view/users/${email}?page=1&limit=50`),
      ]);

      setAdmins(adminsRes.data.admins || []);
      setCoordinators(coordinatorsRes.data.coordinators || []);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error("Failed to reload role lists", err);
    }
  };

  const updateRole = async (email, id) => {
   
    const roleToUpdate = updatedRoles[id];
    if (!roleToUpdate) {
      toast.warning("Warning", "Please select a role before updating");
      return;
    }

    setUpdateId(id);

    try {
      const response = await axiosInstance.put(
        "/blog/author/control/updateRole",
        { role: roleToUpdate, email },
      );
      if (response.status === 200) {
       
        await reloadRoleLists();
        toast.success("Updated", "Role updated successfully");
        setUpdatedRoles((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
    finally{
      setUpdateId(null);
    }
  };

  const deleteAuthorByAdmin = async () => {
    setShowConfirm(true);
    setLoading(true);

    try {
      const response = await axiosInstance.delete(
        // `/blog/author/deleteByAdmin/${email}`,
        `/blog/admin/adminDelete/${email}`,
        { data: { email: authorEmail, password } },
      );

      if (response.status == 200) {
        toast.success(`${response.data.message}`);
        // getAuthors();
        setPassword("");
      }
    } catch (err) {
      // toast.error(`${response.data.message}`);
       toast.error(`unable to delete the author`);
      console.log(err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setPassword("");
     
    }
  };



  const handleCommunityCheckbox = (email, categoryname) => {
    setAssignedCommunities((prev) => {
      const current = prev[email] || [];
      const isChecked = current.includes(categoryname);
      return {
        ...prev,
        [email]: isChecked
          ? current.filter((c) => c !== categoryname)
          : [...current, categoryname],
      };
    });
  };

  const updateAssignedCommunities = async (email, id) => {
    // console.log("updateAssignedCommunities email", email);
    setUpdateCommunityId(id)
    const selectedCommunities = assignedCommunities[email] || [];
    // console.log("selected commu", selectedCommunities);
    try {
      const response = await axiosInstance.put(
        `/blog/author/control/coordinatorUpdate`,
        {
          techCommunities: selectedCommunities,
          email: email,
        },
      );

      // console.log(response.data);

      if (response.status === 201) {
        // alert("Communities updated successfully");
        toast.success("Saved", "Tech community saved successfully");
      }
    } catch (err) {
      console.error("Error updating communities", err);
    }
    finally{
      setUpdateCommunityId(null)
    }
  };

  useEffect(() => {
    const allAuthors = [...admins, ...coordinators, ...students];

    setAssignedCommunities((prev) => {
      const newAssignments = { ...prev };

      allAuthors.forEach((author) => {
        if (
          author?.email &&
          Array.isArray(author.community) &&
          !newAssignments[author.email]
        ) {
          newAssignments[author.email] = [...author.community];
        }
      });

      return newAssignments;
    });
  }, [admins, coordinators, students]);

  // console.group("filteredAuthors",filteredAuthors)
  // console.log("communities", communities);
  // console.log("analytics", comm);

  // console.log("authorCommusnity",authorCommunity)
  //  console.log("students", students)
  const avatarColor = (name) => {
    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
    ];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  };

  const initials = (name) => name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    // <div className="relative w-full min-h-screen h-auto  bg-gradient-to-br from-gray-900 to-gray-700">
    <div className="min-h-screen h-auto relative w-full   bg-gray-900">
      <NavBar />
      {/* <h1 className="md:text-4xl text-3xl font-semibold my-5 text-white text-left  w-full px-4 mx-auto">
       <MdManageAccounts/> Control Panel
      </h1> */}

       <div className="w-full px-4 mx-auto flex items-center gap-3 pt-6 pb-3 md:py-6">
              <MdManageAccounts className="text-green-400 text-3xl" />
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Control Panel
              </h1>
            </div>

      {/* Search and Filter */}
      <div className="w-full px-4 py-2 mx-auto flex  md:flex-row justify-between items-center gap-4 mb-6">
        <div
          // className="md:w-1/3 w-3/5 px-4 py-2 flex items-center gap-2 justify-center rounded-md bg-gray-600 border border-white text-xs md:text-sm text-white placeholder-gray-400"
          className="w-full max-w-md flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition"
        >
          <IoSearch className="text-white" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // className="w-full bg-gray-600   focus:outline-none focus:ring-0"
            className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          // className=" md:w-1/4 w-1/5 md:px-4 md:py-2 px-2 py-1 rounded bg-gray-600 text-xs md:text-sm text-white"
          className="
            w-20 md:w-64
            px-2 py-2 md:px-5 md:py-2
            rounded-full
            bg-gray-900/50 backdrop-blur-md
            border border-gray-600
            text-xs md:text-sm
            text-white
            shadow-md
            cursor-pointer
            transition-all duration-200
            focus:outline-none
            focus:ring-1 focus:ring-teal-500/50
            hover:bg-gray-900
          "
        >
          <option className="bg-gray-900" value="">
            All Roles
          </option>

           <option className="bg-gray-900" value="admin">
            Admins
          </option>
          
           <option className="bg-gray-900" value="coordinator">
            Contributors
          </option>
         
          <option className="bg-gray-900" value="student">
            Users
          </option>
         
        </select>
      </div>

      {/* -------------------------------------------------Admins--------------------------------------- */}

        <h1
        className={`${
          roleFilter === "admin" || roleFilter === ""
            ? " mx-4 text-center text-sm md:text-base  tracking-widest uppercase text-gray-400  font-semibold mb-6"
            : "hidden"
        }`}
      >
        Admins
      </h1>
      

      {admins.length > 0 ? (
        <div
          className={`${
            roleFilter === ""
              ? "h-auto  mb-10   grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
              : roleFilter === "admin"
                ? "min-h-screen md:mb-16 mb-10 flex flex-col   md:grid  md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
                : "hidden"
          }`}
        >
          {filteredAdmins.length > 0 ? (
            filteredAdmins.map((author) => (
            <div
              key={author.id}
              className="bg-gray-900 w-full px-4 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md border md:border-neutral-800 border-neutral-700"
            >
              <div className="flex justify-between items-center text-xl font-semibold text-white">
                <Link
                  to={`/viewProfile/${author.email}`}
                  className="flex items-start gap-2"
                >
                  {!author.profile ? (
                    <div
                      className="md:w-9 md:h-9 w-6 h-6 rounded-full flex items-center justify-center text-[9px] md:text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: avatarColor(author.name) }}
                    >
                      {initials(author.name)}
                    </div>
                  ) : (
                    <img
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                      alt=""
                      className="w-9 h-9 w-6 h-6 border border-green-500/70 rounded-full object-cover"
                    />
                  )}
                  <span className="text-base  flex-1 font-semibold text-gray-200 truncate">
                    {/* {author.name} */}
                       {highlightText(author.name, debouncedSearch)}
                    <p className="text-gray-500 text-xs md:text-xs mb-2">
                      {/* {author.email} */}
                       {highlightText(author.email, debouncedSearch)}
                    </p>
                  </span>
                </Link>
                {email!==author.email && <span
                  // onClick={() => deleteAuthorByAdmin(author.email)}
                  onClick={() => {
                    setAuthorEmail(author.email);
                    setShowConfirm(true);
                  }}
                  className="text-red-400 cursor-pointer"
                >
                  <MdDeleteForever />
                </span>}
              </div>
              {/* <p className="text-gray-600 text-xs md:text-sm mt-2">
              {author.email}
            </p> */}

              <div className="md:flex justify-start md:space-x-4 items-center">
                <p className="text-gray-400 text-xs md:text-sm mt-2">
                  Role: {author.role}
                </p>
                <p
                  className={`${
                    author.role === "student"
                      ? "hidden"
                      : "text-gray-400 text-xs md:text-sm mt-2"
                  }`}
                >
                  Followers: {author.followerscount}
                </p>
                <p
                  className={`${
                    author.role === "student"
                      ? "hidden"
                      : "text-gray-400 text-xs md:text-sm mt-2"
                  }`}
                >
                  Posts: {author.postsCount}
                </p>
              </div>

              <div className="flex items-center mt-4">
                <select
                  className="cursor-pointer mt-2 p-2  text-xs md:text-sm mr-4 rounded bg-gray-800 text-white  disabled:cursor-not-allowed"
                  value={updatedRoles[author.id] || author.role}
                  onChange={(e) => handleRoleChange(author.id, e.target.value)}
                  disabled={email === author.email}
                >
                  <option value="admin">Admin</option>
                  <option value="coordinator">Contributor</option>
                  <option value="student">User</option>
                </select>

                <button
                  className="mt-2 md:px-4 px-2  text-xs md:text-sm py-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white  font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded"
                  onClick={() => updateRole(author.email, author.id)}
                  disabled={email === author.email || updateId === author.id}
                >
                  {updateId === author.id ? "Updating..." : "Update Role"}
                </button>
              </div>

                <div className="mt-4 text-white">
                <p className="mb-3 text-sm ">Assign Tech Communities:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {communities.map((community, idx) => (
                    <label
                      key={idx}
                      className="flex items-center space-x-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={
                          assignedCommunities[author.email]?.includes(
                            community.categoryname,
                          ) || false
                        }
                        onChange={() =>
                          handleCommunityCheckbox(
                            author.email,
                            community.categoryname,
                          )
                        }
                        className="form-checkbox cursor-pointer accent-emerald-500"
                      />
                      <span>{community.categoryname}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => updateAssignedCommunities(author.email, author.id)}
                  className="md:px-5 px-3 py-2 mt-4 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-xs  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={updateCommuntiyId===author.id}
                >
                  {updateCommuntiyId===author.id?'Saving...':'Save Communities'}
                </button>
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-center text-gray-400 text-sm md:text-base">
                {searchQuery ? "No admins found matching your search" : "No admins available"}
              </p>
            </div>
          )}

          {filteredAdmins.length > 0 && admins.length > 0 && adminLoading && (
            <div className="col-span-full flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* Outer Oval Ring */}
                <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                {/* Inner Glow Pulse */}
                {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
              </div>
            </div>
          )}

          {searchQuery.length === 0 && !adminHashMore && (
            <p className=" text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
              No more Admins
            </p>
          )}
        </div>
      ) : (
        <AdminCardLoader roleFilter={roleFilter} />
      )}

      {/* -------------------------------------------------Coordinators----------------------------------------------------- */}

      <h1
        className={`${
          roleFilter === "coordinator" || roleFilter === ""
            ? " mx-4 text-center text-sm md:text-base  tracking-widest uppercase text-gray-400  font-semibold mb-6"
            : "hidden"
        }`}
      >
        Contributors
      </h1>

      {coordinators.length > 0 ? (
        <div
          className={`${
            roleFilter === ""
              ? "h-auto  mb-10  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
              : roleFilter === "coordinator"
                ? "min-h-screen h-auto  mb-10 flex flex-col  md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
                : "hidden"
          }`}
        >
          {filteredCoordinators.length > 0 ? (
            filteredCoordinators.map((author) => (
            <div
              key={author.id}
              className="bg-gray-900 w-full px-4 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md border  border-neutral-700/70"
            >
              <div className="flex justify-between items-center text-xl font-semibold text-white">
                <Link
                  to={`/viewProfile/${author.email}`}
                  className="flex items-start gap-2"
                >
                  {!author.profile ? (
                    <div
                      className="w-9 h-9 w-6 h-6 rounded-full flex items-center justify-center text-[9px] md:text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: avatarColor(author.name) }}
                    >
                      {initials(author.name)}
                    </div>
                  ) : (
                    <img
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                      alt=""
                      className="w-9 h-9 w-6 h-6 border border-green-500/70 rounded-full object-cover"
                    />
                  )}
                  <span className="text-base  flex-1 font-semibold text-gray-200 truncate">
                    {/* {author.name} */}
                     {highlightText(author.name, debouncedSearch)}
                    <p className="text-gray-500 text-xs md:text-xs mb-2">
                      {/* {author.email} */}
                        {highlightText(author.email, debouncedSearch)}
                    </p>
                  </span>
                </Link>
                <span
                  // onClick={() => deleteAuthorByAdmin(author.email)}
                  onClick={() => {
                    setAuthorEmail(author.email);
                    setShowConfirm(true);
                  }}
                  className="text-red-400 cursor-pointer"
                >
                  <MdDeleteForever />
                </span>
              </div>
          

              <div className="md:flex justify-start md:space-x-4 items-center">
                <p className="text-gray-400 text-xs md:text-sm mt-2">
                  Role: {author.role}
                </p>
                <p
                  className={`${
                    author.role === "student"
                      ? "hidden"
                      : "text-gray-400 text-xs md:text-sm mt-2"
                  }`}
                >
                  Followers: {author.followerscount}
                </p>
                <p
                  className={`${
                    author.role === "student"
                      ? "hidden"
                      : "text-gray-400 text-xs md:text-sm mt-2"
                  }`}
                >
                  Posts: {author.postsCount}
                </p>
              </div>

              <div className="flex items-center mt-4">
                <select
                  className="cursor-pointer mt-2 p-2  text-xs md:text-sm mr-4 rounded bg-gray-800 text-white"
                  value={updatedRoles[author.id] || author.role}
                  onChange={(e) => handleRoleChange(author.id, e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="coordinator">Contributor</option>
                  <option value="student">User</option>
                </select>

                <button
                  className="mt-2 md:px-4 px-2  text-xs md:text-sm py-1 font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  onClick={() => updateRole(author.email, author.id)}
                  disabled = {updateId === author.id}
                >
                  
                 {updateId === author.id ? "Updating..." : "Update Role"}
                </button>
              </div>

              <div className="mt-4 text-white">
                <p className="mb-3 text-sm ">Assign Tech Communities:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {communities.map((community, idx) => (
                    <label
                      key={idx}
                      className="flex items-center space-x-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={
                          assignedCommunities[author.email]?.includes(
                            community.categoryname,
                          ) || false
                        }
                        onChange={() =>
                          handleCommunityCheckbox(
                            author.email,
                            community.categoryname,
                          )
                        }
                        className="form-checkbox cursor-pointer accent-emerald-500"
                      />
                      <span>{community.categoryname}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => updateAssignedCommunities(author.email, author.id)}
                  className="md:px-5 px-3 py-2 mt-4 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-xs  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  
                  disabled = {updateCommuntiyId===author.id}
                >
                  {updateCommuntiyId === author.id?'Saving...':'Save Communities'}

                </button>
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-center text-gray-400 text-sm md:text-base">
                {searchQuery ? "No contributors found matching your search" : "No contributors available"}
              </p>
            </div>
          )}

          {filteredCoordinators.length > 0 && coordinators.length > 0 && coordinatorsLoading && (
            <div className="col-span-full flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* Outer Oval Ring */}
                <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                {/* Inner Glow Pulse */}
                {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
              </div>
            </div>
          )}

          { searchQuery.length === 0 && !coordinatorHashMore && (
            <p className=" text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
              No more Contributors
            </p>
          )}
        </div>
      ) : (
        <CoordinatorLoader roleFilter={roleFilter} />
      )}

      {/*------------------------------------------------------------- Students----------------------------------------------------------- */}


      <h1
        className={`${
          roleFilter === "student" || roleFilter === ""
            ? " mx-4 text-center text-sm md:text-base  tracking-widest uppercase text-gray-400  font-semibold mb-6"
            : "hidden"
        }`}
      >
        Users
      </h1>

      {students.length > 0 ? (
        <div
          className={`${
            roleFilter === ""
              ? "h-auto md:mb-16 mb-10  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
              : roleFilter === "student"
                ? " min-h-screen h-auto md:mb-16 mb-10  flex flex-col   md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
                : "hidden"
          } bg-gray-900`}
        >
          {filteredStudents.length > 0 ? (
            filteredStudents.map((author) => (
            <div
              key={author.id}
              className="bg-gray-900 w-full px-4 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md border  border-neutral-700/70"
            >
              <div className="flex justify-between items-center text-xl font-semibold text-white">
                <Link
                  to={`/viewProfile/${author.email}`}
                  className="flex items-start gap-2"
                >
                  {!author.profile ? (
                    <div
                      className="w-9 h-9 w-6 h-6 rounded-full flex items-center justify-center text-[9px] md:text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: avatarColor(author.name) }}
                    >
                      {initials(author.name)}
                    </div>
                  ) : (
                    <img
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                      alt=""
                      className="w-9 h-9 w-6 h-6 border border-green-500/70 rounded-full object-cover"
                    />
                  )}
                  <span className="text-base  flex-1 font-semibold text-gray-200 truncate">
                    {/* {author.name} */}
                    {highlightText(author.name, debouncedSearch)}
                    <p className="text-gray-500 text-xs md:text-xs mb-2">
                      {/* {author.email} */}
                       {highlightText(author.email, debouncedSearch)}
                    </p>
                  </span>
                </Link>
                <span
                  // onClick={() => deleteAuthorByAdmin(author.email)}
                  onClick={() => {
                    setAuthorEmail(author.email);
                    setShowConfirm(true);
                  }}
                  className="text-red-400 cursor-pointer"
                >
                  <MdDeleteForever />
                </span>
              </div>
              {/* <p className="text-gray-400 text-xs md:text-sm mt-2">
              {author.email}
            </p> */}

            <div className="md:flex justify-start md:space-x-4 items-center">
                <p className="text-gray-400 text-xs md:text-sm mt-2">
                  Role: {author.role}
                </p>
                </div>

              <div className="flex items-center mt-4">
                <select
                  className="cursor-pointer mt-2 p-2  text-xs md:text-sm mr-4 rounded bg-gray-800 text-white"
                  value={updatedRoles[author.id] || author.role}
                  onChange={(e) => handleRoleChange(author.id, e.target.value)}
                >
                  <option value="student">User</option>
                  <option value="coordinator">Contributor</option>
                </select>

                <button
                  className="mt-2 md:px-4 px-2  text-xs md:text-sm py-1 font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  onClick={() => updateRole(author.email, author.id)}
                  disabled = {updateId === author.id}
                >
                  {updateId === author.id ? "Updating..." : "Update Role"}
                </button>
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-center text-gray-400 text-sm md:text-base">
                {searchQuery ? "No users found matching your search" : "No users available"}
              </p>
            </div>
          )}

          {filteredStudents.length > 0 && students.length > 0 && studentLoading && (
            <div className="col-span-full flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* Outer Oval Ring */}
                <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                {/* Inner Glow Pulse */}
                {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
              </div>
            </div>
          )}

          { searchQuery.length === 0 && !studentHashMore && (
            <p className=" text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
              No more Users
            </p>
          )}
        </div>
      ) : (
        <StudentLoader roleFilter={roleFilter} />
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 max-w-sm animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-800">
                Confirm Deletion Author
              </h2>
            </div>

            <p className="text-gray-600 mb-2 text-sm leading-relaxed">
              Are you sure you want to delete this Author?
            </p>

            <form className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Enter Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none
               focus:ring-0 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300
               placeholder-gray-400 text-gray-900"
              />
            </form>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteAuthorByAdmin}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </div>
  );
}

export default Control;

// import { useState, useRef } from "react";
// import {
//   LayoutDashboard,
//   Users,
//   ShieldCheck,
//   GraduationCap,
//   UserCog,
//   BarChart2,
//   TrendingUp,
//   Trophy,
//   Globe,
//   LogOut,
//   Search,
//   Trash2,
//   ChevronDown,
//   BookOpen,
//   ListVideo,
// } from "lucide-react";
// import NavBar from "../../ui/NavBar";
// import useStatsSummary from "../../hooks/admins/useStatsSummary";
// import useGetCommunityAnalytics from "../../hooks/useGetCommunityAnalytics";
// import KPISkeleton from "../../components/loaders/dashboard/KPISkeleton";
// import PostCategorySkeleton from "../../components/loaders/dashboard/PostCategorySkeleton";
// import usePostsByMonthAnalaysis from "../../hooks/admins/usePostsByMonthAnalaysis";
// import PostsGaugeCardSkeleton from "../../components/loaders/dashboard/PostsGaugeCardSkeleton";
// import CommunityMembershipSkeleton from "../../components/loaders/dashboard/CommunityMembershipSkeleton";
// import Footer from "../../ui/Footer";
// import useTopContributors from "../../hooks/admins/useTopContributors";
// import { Link } from "react-router-dom";
// import TopContributorsSkeleton from "../../components/loaders/dashboard/TopContributorsSkeleton";
// import useGetContributors from "../../hooks/admins/useGetContributors";
// import ContributorsTableSkeleton from "../../components/loaders/dashboard/ContributorsTableSkeleton";
// import useGetStudents from "../../hooks/admins/useGetStudents";
// import StudentsTableSkeleton from "../../components/loaders/dashboard/StudentsTableSkeleton";

// // ── Mini bar chart ─────────────────────────────────────────────────────────────
// const MiniBar = ({ data, valueKey, labelKey, color = "#0004ff" }) => {
//   const max = Math.max(...data.map((d) => d.postscount));
//   const ticks = [
//     0,
//     Math.ceil(max * (33 / 100)),
//     Math.ceil(max * (66 / 100)),
//     max,
//   ];
//   const [hoveredIndex, setHoveredIndex] = useState(null);
//   // console.log("max", max);
//   // console.log("ticks", ticks);
//   return (
//     <div className="flex gap-3">
//       {/* Y-axis ticks */}
//       <div className="flex flex-col-reverse justify-between pb-5 shrink-0">
//         {ticks.map((t, i) => (
//           <span
//             key={i}
//             className="text-xs font-semibold text-gray-400 leading-none"
//           >
//             {t}
//           </span>
//         ))}
//       </div>

//       {/* Chart area — scrollable on x */}
//       <div className="flex-1 overflow-x-auto scrollbar-hide">
//         <div
//           className="flex flex-col gap-1"
//           style={{ minWidth: `${data.length * 90}px` }}
//         >
//           <div className="relative flex items-end justify-between h-36">
//             {/* Bars */}
//             {data.map((d, i) => (
//               <div
//                 key={i}
//                 className="flex-1 flex justify-center items-end h-full relative"
//                 onMouseEnter={() => setHoveredIndex(i)}
//                 onMouseLeave={() => setHoveredIndex(null)}
//               >
//                 {/* Tooltip */}
//                 {hoveredIndex === i && (
//                   <div className="absolute  top-0 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/10 text-white text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap z-10 shadow-lg">
//                     {d.postscount}
//                     <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
//                   </div>
//                 )}
//                 {/* Bar */}
//                 <div
//                   className="rounded-t-md transition-all duration-300 cursor-pointer"
//                   style={{
//                     width: "28px",
//                     height: `${(d.postscount / max) * 100}%`,
//                     background:
//                       hoveredIndex === i
//                         ? `linear-gradient(180deg, #ffffff 0%, ${color} 100%)`
//                         : color,
//                     minHeight: "4px",
//                   }}
//                 />
//               </div>
//             ))}
//           </div>

//           {/* X-axis labels */}
//           <div className="flex justify-between">
//             {data.map((d, i) => (
//               <span
//                 key={i}
//                 className="flex-1 font-semibold text-center text-[10px] text-gray-400"
//               >
//                 {d.categoryname}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// // ── Mini line chart ────────────────────────────────────────────────────────────

// const PostsGaugeCard = ({ data, year, setYear, target, setTarget }) => {

//   const current = data[data.length - 1]?.count ?? 0;
//   const previous = data[data.length - 2]?.count ?? 0;

//   const change =
//     previous > 0 ? (((current - previous) / previous) * 100).toFixed(1) : 0;

//   const isPositive = change >= 0;

//   const pct = Math.min((current / target) * 100, 100);

//   const max = Math.max(...data.map((d) => d.count));
//   const currentYear = new Date().getFullYear();
//   const yearOptions = [currentYear - 1, currentYear - 2];

//   return (
//     <div className="bg-[#0f172a]  border border-[#1e293b] rounded-xl p-4 flex flex-col">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <p className="text-sm md:text-base font-semibold text-gray-200">
//             Posts Published
//           </p>
//           <p className="text-[9px] md:text-[10px] text-gray-400">
//             Monthly performance vs target
//           </p>
//         </div>
//         {/* <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-[#1e293b] text-gray-200 text-xs rounded px-2 py-1 border border-[#334155]">
//           <option value="default">Default</option>
//           <option value="2026">2026</option>
//           <option value="2025">2025</option>
//           <option value="2024">2024</option>
//         </select> */}
//         <select
//           value={year}
//           onChange={(e) => setYear(e.target.value)}
//           className="bg-[#1e293b] text-gray-200 cursor-pointer text-xs rounded px-2 py-1 border border-[#334155]"
//         >
//           <option value="default">{currentYear}</option>
//           {yearOptions.map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* ✅ Gauge (Conic Gradient) */}
//       <div className="flex justify-center">
//         <div className="relative w-[180px] h-[100px] overflow-hidden">
//           {/* Circle */}
//           <div
//             className="absolute w-[180px] h-[180px] rounded-full"
//             style={{
//               background: `conic-gradient(
//                 #6366f1 ${pct * 1.8}deg,
//                 #1e293b ${pct * 1.8}deg 180deg,
//                 transparent 180deg
//               )`,
//               transform: "rotate(-90deg)",
//             }}
//           />

//           {/* Inner cut (to make it a ring) */}
//           <div className="absolute top-[20px] left-[20px] w-[140px] h-[140px] bg-[#0f172a] rounded-full" />

//           {/* Center Text */}
//           <div className="absolute inset-0 flex flex-col items-center justify-center mt-6 md:mt-4">
//             <span className="md:text-2xl text-lg font-bold text-white">
//               {pct.toFixed(1)}%
//             </span>

//             <span
//               className="mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
//               style={{
//                 backgroundColor: isPositive ? "#10b98122" : "#ef444422",
//                 color: isPositive ? "#10b981" : "#ef4444",
//               }}
//             >
//               {isPositive ? "+" : ""}
//               {change}%
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <p className="text-[10px] text-gray-500 text-center mt-2 leading-relaxed">
//         <span className="text-gray-300 font-semibold">{current} posts</span>{" "}
//         this month
//         {isPositive
//           ? ", higher than last month. Keep it up!"
//           : ", lower than last month. Time to engage!"}
//       </p>

//       {/* Sparkline */}
//       <div
//         className={`flex items-end justify-between gap-2 mt-4 pt-3 border-t border-[#1e293b] ${year!=="" && year != "default" ? "h-16" : "h-20"}`}
//       >
//         {data.map((d, i) => (
//           <div
//             key={i}
//             className="flex flex-col items-center justify-end gap-1 flex-1"
//           >
//             <span className="text-[9px] text-emerald-400 font-medium">
//               {d.count}
//             </span>

//             <div
//               className="w-2 rounded-full"
//               style={{
//                 height: `${Math.max((d.count / max) * 40, 10)}px`,
//                 backgroundColor: i === data.length - 1 ? "#6366f1" : "#1e293b",
//                 border: "1px solid",
//                 borderColor: i === data.length - 1 ? "#6366f1" : "#334155",
//               }}
//             />

//             <span className="text-[9px] text-center text-gray-400">
//               {d.month}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ── KPI Card ───────────────────────────────────────────────────────────────────
// const KPICard = ({
//   label,
//   value,
//   sub,
//   icon: Icon,
//   accent = "#10b981",
//   change,
//   changePositive = true,
// }) => (
//   <div className="bg-gray-800/70 border border-[#1e293b] rounded-xl p-3 md:p-5  flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
//     {/* Top — icon + name */}
//     <div className="flex items-center gap-2.5">
//       <div
//         className="md:w-10 md:h-10 w-10 h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
//         style={{ backgroundColor: accent }}
//       >
//         <Icon className="text-white text-xs" />
//       </div>
//       <div>
//         <p className="md:text-sm text-xs font-semibold md:font-bold text-gray-100">
//           {label}
//         </p>
//         <p className="text-[10px] text-gray-500">{sub || label}</p>
//       </div>
//     </div>
//     {/* Bottom — value + badge */}
//     <div className="flex items-end justify-end">
//       <span className="md:text-lg text-xs bg-gray-700/60 font-medium text-white rounded-full md:px-4 md:py-1.5 px-2 py-1">
//         {value && value}
//       </span>
//       {/* {change && (
//         <span
//           className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
//           style={{
//             backgroundColor: changePositive ? "#10b98122" : "#ef444422",
//             color: changePositive ? "#10b981" : "#ef4444",
//           }}
//         >
//           {changePositive ? "↑" : "↓"} {change}
//         </span>
//       )} */}
//     </div>
//   </div>
// );

// // ── Sidebar nav item ───────────────────────────────────────────────────────────
// const NavItem = ({ icon: Icon, label, active, showSideBar, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`${showSideBar ? "w-full" : "w-fit"} flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
//       active
//         ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
//         : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
//     }`}
//   >
//     <Icon size={17} />
//     {showSideBar && <span>{label}</span>}
//   </button>
// );

// // ── Main Dashboard ─────────────────────────────────────────────────────────────
// export default function Controls() {
//   const [activeSection, setActiveSection] = useState("overview");

//   const [showSideBar, setShowSidebar] = useState(true);
//   const email = localStorage.getItem("email");
//   const { statsSummary, statsLoader } = useStatsSummary(email);
//   const [year, setYear] = useState("");
//   const [target, setTarget] = useState(50);

//   const { communities, loading: postCategoryLoading } =
//     useGetCommunityAnalytics();
//   const { postsByMonth, loading: postsByMonthLoading } =
//     usePostsByMonthAnalaysis(email, year);

//   const [limit, setLimit] = useState(10);

//   const{topContributors, topContributorsLoading} = useTopContributors(email, limit);
//   const { contributors, totalContributors, loading:contributorsLoading, hasMore }  = useGetContributors(email);
//   const { students, totalStudents, loading:studentsLoading, hasMore:studentsHasMore }  = useGetStudents(email);

//   //  console.log("statsSummary",statsSummary)
//   //  console.log("communities",communities)
//   //  console.log("postsByMonth",postsByMonth);
//   // console.log("topContributors", topContributors);
//   // console.log("contributors", contributors);
//   // console.log("students", students);

//   return (
//     <div className="min-h-screen h-auto  relative bg-gray-900 text-white flex flex-col">
//       <NavBar />

//       <div className="md:flex h-full  bg-gray-900 text-white overflow-hidden">
//         {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
//         <aside
//           className={`${!showSideBar ? "w-20 py-5" : "md:w-80 shrink-0 bg-gray-900  flex flex-col py-5 px-3 gap-1"} transition-all duration-300  hidden`}
//         >
//           {/* Logo */}
//           <div
//             onClick={() => {
//               setShowSidebar((prev) => !prev);
//             }}
//             className="flex items-center gap-2.5 px-3 mb-6"
//           >
//             <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
//               <ShieldCheck size={17} className="text-emerald-400" />
//             </div>
//             <div className={`${!showSideBar ? "hidden" : "block"}`}>
//               <p className="text-xs font-bold text-gray-100">Admin Panel</p>
//               <p className="text-[10px] text-gray-500">Tech Community</p>
//             </div>
//           </div>

//           {/* Nav */}
//           <div className="flex flex-col px-3  gap-0.5">
//             <p
//               className={`${!showSideBar ? "hidden" : "block"} text-[9px] text-gray-600 font-semibold uppercase tracking-widest px-3 mb-1`}
//             >
//               Overview
//             </p>
//             <NavItem
//               icon={LayoutDashboard}
//               label="Dashboard"
//               showSideBar={showSideBar}
//               active={activeSection === "overview"}
//               // onClick={() => scrollTo(overviewRef, "overview")}
//             />
//             <NavItem
//               icon={BarChart2}
//               label="Analytics"
//               showSideBar={showSideBar}
//               active={activeSection === "analytics"}
//               // onClick={() => scrollTo(analyticsRef, "analytics")}
//             />
//           </div>

//           <div className="flex flex-col px-3 py-5 gap-0.5 mt-4">
//             <p
//               className={`text-[9px] text-gray-600 font-semibold uppercase tracking-widest px-3 mb-1 ${!showSideBar ? "hidden" : "block"}`}
//             >
//               Controls
//             </p>
//             <NavItem
//               icon={UserCog}
//               label="Control Panel"
//               active={activeSection === "control"}
//               // onClick={() => scrollTo(controlRef, "control")}
//             />
//           </div>

//           {/* Bottom admin info */}
//           {/* <div className="mt-auto border-t border-[#1e293b] pt-4 flex flex-col gap-2">
//           <div className="flex items-center gap-2.5 px-2">
//             <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400">
//               AD
//             </div>
//             <div>
//               <p className="text-xs font-medium text-gray-200">Admin</p>
//               <p className="text-[10px] text-gray-500">admin@ds.ac.in</p>
//             </div>
//           </div>
//           <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
//             <LogOut size={13} />
//             Logout
//           </button>
//         </div> */}
//         </aside>

//         {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
//         <main className="flex-1  px-3 md:px-6 py-6 space-y-10 scrollbar-hide">
//           {/* ── ZONE 2: KPI Cards ──────────────────────────────────────── */}
//           <section className="space-y-3">
//             {/* Row 1 — Users */}
//             {!statsLoader ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//                 <KPICard
//                   label="Total Users"
//                   value={statsSummary.totalUsers}
//                   sub="All members"
//                   icon={Users}
//                   change="8.2%"
//                   changePositive={true}
//                 />
//                 <KPICard
//                   label="Admins"
//                   value={statsSummary.admins}
//                   sub="Admins"
//                   icon={ShieldCheck}
//                   accent="#ec4899"
//                 />

//                 <KPICard
//                   label="Coordinators"
//                   value={statsSummary.coordinators}
//                   sub="Coordinators"
//                   icon={UserCog}
//                   accent="#f59e0b"
//                   change="2.3%"
//                   changePositive={true}
//                 />

//                 <KPICard
//                   label="Students"
//                   value={statsSummary.students}
//                   sub="Students"
//                   icon={GraduationCap}
//                   accent="#3b82f6"
//                   change="5.1%"
//                   changePositive={true}
//                 />

//                 <KPICard
//                   label="New Entry"
//                   value={`+${statsSummary.newThisMonth}`}
//                   sub="This Month"
//                   icon={TrendingUp}
//                   change="11%"
//                   changePositive={true}
//                 />
//               </div>
//             ) : (
//               <KPISkeleton />
//             )}
//           </section>

//           {/* ── ZONE 3: Analytics ──────────────────────────────────────── */}
//           <section
//             // ref={analyticsRef}
//             className="space-y-4"
//           >
//             <h2 className="md:text-2xl text-xl font-semibold text-emerald-400 ">
//               Analytics
//             </h2>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               <div className="md:hidden">
//                 {!postsByMonthLoading ? (
//                   <PostsGaugeCard
//                     data={postsByMonth}
//                     year={year}
//                     setYear={setYear}
//                     target={target}
//                     setTarget={setTarget}
//                   />
//                 ) : (
//                   <PostsGaugeCardSkeleton />
//                 )}
//               </div>

//               {/* Posts by Category */}
//               {!postCategoryLoading ? (
//                 <div className="bg-[#0f172a]  flex flex-col justify-between items-start  border border-[#1e293b] rounded-xl p-4">
//                   <div>
//                     <p className="text-sm md:text-base font-semibold text-gray-200 ">
//                       Posts by Category
//                     </p>
//                     <p className="text-[9px] md:text-[10px] text-gray-400 mb-4">
//                       Total posts in each domain
//                     </p>
//                   </div>
//                   <div className="flex flex-col w-full overflow-x-auto scrollbar-hide ">
//                     <MiniBar
//                       data={communities}
//                       // valueKey="postscount"
//                       labelKey="categoryname"
//                       color="#1121ff"
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <PostCategorySkeleton />
//               )}
//               <div className="hidden md:block">
//                 {!postsByMonthLoading ? (
//                   <PostsGaugeCard
//                     data={postsByMonth}
//                     year={year}
//                     setYear={setYear}
//                     target={target}
//                     setTarget={setTarget}
//                   />
//                 ) : (
//                   <PostsGaugeCardSkeleton />
//                 )}
//               </div>

//               {/* Community Membership */}
//               {!postCategoryLoading ? (
//                 <div className="bg-[#0f172a] flex flex-col justify-between items-start  border border-[#1e293b] rounded-xl p-4">
//                   <div>
//                     <p className="text-sm md:text-base font-semibold text-gray-200">
//                       Community Membership
//                     </p>
//                     {/* <p className="text-[10px] text-gray-400 mb-">Coordinators vs Students per domain</p> */}
//                     <div className="flex text-[10px] text-gray-400 gap-4 mt-1 mb-4">
//                       <div className="flex items-center gap-1.5">
//                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
//                         <span className="text-[10px] text-gray-400 font-semibold">
//                           Coordinators
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-1.5">
//                         <div className="w-2 h-2 rounded-full bg-blue-500" />
//                         <span className="text-[10px] text-gray-400 font-semibold">
//                           Students
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex flex-col w-full h-52 emerald-scrollbar pr-4 overflow-y-auto gap-2">
//                     {communities.map((c) => {
//                       const total = c.authorcount + c.followerscount;
//                       return (
//                         <div
//                           key={c.categoryname}
//                           className="flex items-center gap-2"
//                         >
//                           <span className="text-xs text-gray-400 font-semibold w-32 truncate">
//                             {c.categoryname}
//                           </span>

//                           <div className="flex-1 h-4 bg-[#1e293b] rounded-full overflow-hidden flex">
//                             {/* Coordinators */}
//                             <div
//                               className="h-full cursor-pointer bg-emerald-500/70 rounded-l-full flex items-center justify-center transition-all duration-300 group relative"
//                               style={{
//                                 width: `${(c.authorcount / (total || 1)) * 100}%`,
//                               }}
//                             >
//                               <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-[9px] text-gray-200 md:font-bold  whitespace-nowrap">
//                                 {((c.authorcount / (total || 1)) * 100).toFixed(
//                                   0,
//                                 )}
//                                 % · {c.authorcount}
//                               </span>
//                             </div>

//                             {/* Students */}
//                             <div
//                               className="h-full cursor-pointer bg-blue-500/50 flex items-center justify-center transition-all duration-300 group relative"
//                               style={{
//                                 width: `${(c.followerscount / (total || 1)) * 100}%`,
//                               }}
//                             >
//                               <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-[9px] text-gray-200 md:font-bold  whitespace-nowrap">
//                                 {(
//                                   (c.followerscount / (total || 1)) *
//                                   100
//                                 ).toFixed(0)}
//                                 % · {c.followerscount}
//                               </span>
//                             </div>
//                           </div>

//                           <span className="text-xs text-gray-300 font-semibold w-6 text-right">
//                             {total}
//                           </span>
//                         </div>
//                       );
//                     })}
//                     {communities.map((c) => {
//                       const total = c.authorcount + c.followerscount;
//                       return (
//                         <div
//                           key={c.categoryname}
//                           className="flex items-center gap-2"
//                         >
//                           <span className="text-xs text-gray-400 font-semibold w-32 truncate">
//                             {c.categoryname}
//                           </span>

//                           <div className="flex-1 h-4 bg-[#1e293b] rounded-full overflow-hidden flex">
//                             {/* Coordinators */}
//                             <div
//                               className="h-full cursor-pointer bg-emerald-500/70 rounded-l-full flex items-center justify-center transition-all duration-300 group relative"
//                               style={{
//                                 width: `${(c.authorcount / (total || 1)) * 100}%`,
//                               }}
//                             >
//                               <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-[9px] text-gray-200 md:font-bold  whitespace-nowrap">
//                                 {((c.authorcount / (total || 1)) * 100).toFixed(
//                                   0,
//                                 )}
//                                 % · {c.authorcount}
//                               </span>
//                             </div>

//                             {/* Students */}
//                             <div
//                               className="h-full cursor-pointer bg-blue-500/50 flex items-center justify-center transition-all duration-300 group relative"
//                               style={{
//                                 width: `${(c.followerscount / (total || 1)) * 100}%`,
//                               }}
//                             >
//                               <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-[9px] text-gray-200 md:font-bold  whitespace-nowrap">
//                                 {(
//                                   (c.followerscount / (total || 1)) *
//                                   100
//                                 ).toFixed(0)}
//                                 % · {c.followerscount}
//                               </span>
//                             </div>
//                           </div>

//                           <span className="text-xs text-gray-300 font-semibold w-6 text-right">
//                             {total}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ) : (
//                 <CommunityMembershipSkeleton />
//               )}

//               {/* User Growth */}
//               {/* <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
//                 <p className="text-sm font-semibold text-gray-200 mb-1">
//                   User Growth
//                 </p>
//                 <p className="text-[10px] text-gray-500 mb-3">
//                   Monthly new registrations
//                 </p>
//                 <div className="flex items-end justify-between gap-1 mb-1">
//                   {MOCK_GROWTH.map((g) => (
//                     <div
//                       key={g.month}
//                       className="flex flex-col items-center gap-1 flex-1"
//                     >
//                       <span className="text-[9px] text-emerald-400 font-medium">
//                         {g.count}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//                 <MiniLine data={MOCK_GROWTH} />
//                 <div className="flex justify-between mt-1">
//                   {MOCK_GROWTH.map((g) => (
//                     <span
//                       key={g.month}
//                       className="text-[9px] text-gray-600 flex-1 text-center"
//                     >
//                       {g.month}
//                     </span>
//                   ))}
//                 </div>
//               </div> */}

//               {/* Top Contributors */}
//              {!topContributorsLoading?
//              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
//                 <p className="text-sm font-semibold text-gray-200 mb-1">
//                   Top 10 Contributors
//                 </p>
//                 <p className="text-[10px] text-gray-400 mb-3">
//                   Ranked by post count
//                 </p>
//                 <div className="flex overflow-y-auto scrollbar-hide h-52 flex-col gap-2">
//                   {topContributors.map((u, i) => (
//                     <Link
//                     to={`/viewProfile/${u.email}`}
//                      key={i} className="flex cursor-pointer md:p-2 md:hover:bg-gray-800/50 rounded-lg items-center gap-3">
//                       <span
//                         className="md:text-[11px] text-[9px] bg-gray-800 rounded-full text-gray-300 px-2 py-1 md:px-3  md:py-1.5 md:font-bold font-semibold "
//                         style={{
//                           color:
//                             i < 3
//                               && ["#3ecc28", "#d4a52f", "#e0853f"][i]
//                               // : "#8799b3",
//                         }}
//                       >
//                         {i + 1}
//                       </span>
//                      {!u.profile ? <div
//                         className="md:w-8 md:h-8 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
//                         style={{ backgroundColor: avatarColor(u.name) }}
//                       >
//                         {initials(u.name)}
//                       </div> : <img src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${u.profile}`}
//                         alt=""
//                         className="md:w-8 md:h-8 w-6 h-6 border border-green-500/70 rounded-full object-cover"
//                       />}

//                       <span className="text-xs  flex-1 font-semibold text-gray-200 truncate">
//                         {u.name}
//                          <p className="md:text-[10px] hidden md:block text-[9px] text-gray-500 truncate">
//                           {u.email}
//                         </p>
//                       </span>
//                       <span className="text-[10px] text-emerald-400 font-medium">
//                         {u.postsCount} posts
//                       </span>
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//               :
//               <TopContributorsSkeleton />}
//             </div>
//           </section>

//           {/* ── ZONE 4: Users Tables ──────────────────────────────────── */}
//           <section className="space-y-4">
//             <h2 className="md:text-2xl text-xl font-semibold text-emerald-400">
//               Users
//             </h2>
//             <div className="md:flex overflow-hidden gap-4 items-start">
//               <div>
//              {!contributorsLoading && contributors.length > 0 ?
//               <AuthorsTable
//                 contributors={contributors}
//                 totalContributors={totalContributors}
//                 contributorsLoading={contributorsLoading}
//                 hasMore={hasMore}
//               />
//               :
//               <ContributorsTableSkeleton/>}

//               </div>

//               <div>
//               {!studentsLoading ?
//               <StudentsTable
//                 students={students}
//                 totalStudents={totalStudents}
//                 studentsLoading={studentsLoading}
//                 hasMore={studentsHasMore}
//               />
//               :
//               <StudentsTableSkeleton/>}
//               </div>

//             </div>
//           </section>

//           {/* bottom padding */}
//           <div className="h-10" />
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// }

// const avatarColor = (name) => {
//   const colors = [
//     "#10b981",
//     "#3b82f6",
//     "#f59e0b",
//     "#ec4899",
//     "#8b5cf6",
//     "#06b6d4",
//     "#f97316",
//   ];
//   return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
// };

// const initials = (name) => name?.slice(0, 2).toUpperCase() ?? "??";

// const RoleBadge = ({ role }) => {
//   const styles = {
//     admin: { bg: "#ec489918", color: "#ec4899", label: "Admin" },
//     coordinator: { bg: "#f59e0b18", color: "#f59e0b", label: "Coordinator" },
//     student: { bg: "#3b82f618", color: "#3b82f6", label: "Student" },
//   };
//   const s = styles[role] ?? styles.student;
//   return (
//     <span
//       className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
//       style={{ backgroundColor: s.bg, color: s.color }}
//     >
//       {s.label}
//     </span>
//   );
// };

// const TableHeader = ({ title, count, search, onSearch }) => (
//   <div className="flex items-center justify-between px-5 py-4 shrink-0">
//     <div className="flex items-center gap-2.5">
//       <h3 className="text-sm font-bold text-white">{title}</h3>
//       <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">
//         {count}
//       </span>
//     </div>
//     <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-44 focus-within:border-emerald-500/40 transition-colors">
//       <Search size={12} className="text-gray-500 shrink-0" />
//       <input
//         type="text"
//         placeholder="Search..."
//         value={search}
//         onChange={(e) => onSearch(e.target.value)}
//         className="bg-transparent outline-none text-xs text-gray-300 placeholder-gray-600 w-full"
//       />
//     </div>
//   </div>
// );

// const ColHead = ({ children, className = "" }) => (
//   <th
//     className={`text-[11px] font-medium text-gray-500 py-2.5 px-5 text-left border-b border-white/5 ${className}`}
//   >
//     {children}
//   </th>
// );

// // ── Authors Table (Admin + Coordinators) ──────────────────────────────────────
// const AuthorsTable = ({contributors, totalContributors, contributorsLoading,  hasMore}) => {
//     // const { contributors, totalContributors, loading:contributorsLoading, error, hasMore }  = useGetContributors(email);
//   const [search, setSearch] = useState("");
//   const filtered = contributors.filter(
//     (u) =>
//       u.name.toLowerCase().includes(search.toLowerCase()) ||
//       u.email.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl md:w-full  flex flex-col md:overflow-x-hidden overflow-x-scroll md:flex-1">
//       <TableHeader
//         title="Contributors"
//         count={totalContributors}
//         search={search}
//         onSearch={setSearch}
//         className="overflow-x-scroll"
//       />
//       <div className=" flex  flex-col flex-1 pb-4">
//         <table className="w-full table-fixed">
//           <thead>
//             <tr className="bg-white/[0.02]">
//               <ColHead className="w-[70%] md:w-[38%]">Name</ColHead>
//               <ColHead className="md:w-[16%] w-[30%] text-center">Role</ColHead>
//               <ColHead className="hidden md:table-cell w-[12%] text-center">Posts</ColHead>
//               <ColHead className="hidden md:table-cell w-[12%] text-center">Playlists</ColHead>
//               <ColHead className="hidden md:table-cell w-[11%] text-center">Followers</ColHead>
//               <ColHead className="hidden md:table-cell w-[11%] text-center">Following</ColHead>
//             </tr>
//           </thead>
//         </table>
//         {/* Scrollable body */}
//         <div
//           className="overflow-y-auto scrollbar-hide"
//           style={{ height: "260px" }}
//         >
//           <table className="w-full table-fixed">
//             <tbody>

//               {filtered.map((u, i) => (
//                 <tr
//                   key={u.email}

//                   className="border-b border-white/[0.04] md:hover:bg-white/[0.03]  transition-colors"
//                 >

//                   {/* Name */}
//                   <td className="py-3 px-5 w-[70%] md:w-[38%]">
//                      <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                        <div className="flex items-center gap-3">

//                         {!u.profile ? <div
//                         className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
//                         style={{ backgroundColor: avatarColor(u.name) }}
//                       >
//                         {initials(u.name)}
//                       </div> : <img src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${u.profile}`}
//                         alt=""
//                         className="w-8 h-8 border border-green-500/70 rounded-full object-cover"
//                       />}
//                       <div className="min-w-0">
//                         <p className="text-xs font-semibold text-gray-100 truncate">
//                           {u.name}
//                         </p>
//                         <p className="text-[10px] text-gray-500 truncate">
//                           {u.email}
//                         </p>
//                       </div>
//                     </div>
//                     </Link>
//                   </td>
//                   {/* Role */}
//                   <td className="py-3 px-5 w-[16%] text-center">
//                      <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                     <RoleBadge role={u.role} />
//                     </Link>
//                   </td>
//                   {/* Posts */}
//                   <td className="py-3 px-5 w-[12%] text-center hidden md:table-cell">
//                      <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                     <span className="text-xs text-gray-300">
//                       {u.postsCount}
//                     </span>
//                     </Link>
//                   </td>
//                   {/* Playlists */}
//                   <td className="py-3 px-5 w-[12%] text-center hidden md:table-cell">
//                      <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                     <span className="text-xs text-gray-300">
//                       {u.playlistCount}
//                     </span>
//                     </Link>
//                   </td>
//                   {/* Followers */}
//                   <td className="py-3 px-5 w-[11%] text-center hidden md:table-cell">
//                       <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                     <span className="text-xs text-gray-300">
//                       {u.followerscount}
//                     </span>
//                     </Link>
//                   </td>
//                   {/* Following */}
//                   <td className="py-3 px-5 w-[11%] text-center hidden md:table-cell">
//                       <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                     <span className="text-xs text-gray-300">
//                       {u.followingcount}
//                     </span>
//                     </Link>
//                   </td>
//                 </tr>
//               ))}

//               {!hasMore && (
//                 <tr>
//                   <td colSpan={6} className="text-center text-[10px] text-gray-400 py-2 md:py-4">
//                     No more contributors.
//                   </td>
//                 </tr>
//               )}
//               {contributorsLoading && contributors.length>0 && (
//                 <tr>
//                   <td colSpan={6} className="text-center py-4">
//                    <div className="col-span-full flex justify-center">
//                       <div className="relative flex items-center justify-center">
//                         {/* Outer Oval Ring */}
//                         <div className="w-4 h-4  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

//                         {/* Inner Glow Pulse */}
//                         {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//               { !contributorsLoading && contributors.length===0 && (
//                 <tr>
//                   <td colSpan={6} className="text-center text-[10px] text-gray-400 py-4">
//                     No contributors found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Students Table ─────────────────────────────────────────────────────────────
// const StudentsTable = ({ students, totalStudents, studentsLoading, hasMore }) => {
//   const [search, setSearch] = useState("");
//   const filtered = students.filter(
//     (u) =>
//       u.name.toLowerCase().includes(search.toLowerCase()) ||
//       u.email.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div className="bg-[#0f172a] border mt-4 md:mt-0 border-[#1e293b] rounded-2xl flex flex-col overflow-hidden md:w-[600px]">
//       <TableHeader
//         title="Students"
//         count={totalStudents}
//         search={search}
//         onSearch={setSearch}
//       />
//       <div className="overflow-hidden flex pb-4  flex-col">
//         <table className="w-full table-fixed">
//           <thead>
//             <tr className="bg-white/[0.02]">
//               <ColHead className="w-[70%]">Name</ColHead>
//               <ColHead className="w-[30%] text-center">Role</ColHead>
//             </tr>
//           </thead>
//         </table>
//         {/* Scrollable body */}
//         <div
//           className="overflow-y-auto scrollbar-hide"
//           style={{ height: "260px" }}
//         >
//           <table className="w-full table-fixed">
//             <tbody>
//               {filtered.map((u) => (
//                 <tr
//                   key={u.email}
//                   className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
//                 >
//                   {/* Name */}
//                   <td className="py-3 px-5 w-[70%]">
//                      <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                        <div className="flex items-center gap-3">

//                         {!u.profile ? <div
//                         className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
//                         style={{ backgroundColor: avatarColor(u.name) }}
//                       >
//                         {initials(u.name)}
//                       </div> : <img src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${u.profile}`}
//                         alt=""
//                         className="w-8 h-8 border border-green-500/70 rounded-full object-cover"
//                       />}
//                       <div className="min-w-0">
//                         <p className="text-xs font-semibold text-gray-100 truncate">
//                           {u.name}
//                         </p>
//                         <p className="text-[10px] text-gray-500 truncate">
//                           {u.email}
//                         </p>
//                       </div>
//                     </div>
//                     </Link>
//                   </td>
//                   {/* Role */}
//                   <td className="py-3 px-5 w-[30%] text-center">
//                     <Link to={`/viewProfile/${u.email}`} className="block w-full">
//                     <RoleBadge role={u.role} />
//                     </Link>
//                   </td>
//                 </tr>
//               ))}

//                {!hasMore && (
//                 <tr>
//                   <td colSpan={2} className="text-center text-[10px] text-gray-400 py-2 md:py-4">
//                     No more students.
//                   </td>
//                 </tr>
//               )}
//               {studentsLoading && students.length>0 && (
//                 <tr>
//                   <td colSpan={2} className="text-center py-4">
//                    <div className="col-span-full flex justify-center">
//                       <div className="relative flex items-center justify-center">
//                         {/* Outer Oval Ring */}
//                         <div className="w-4 h-4  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

//                         {/* Inner Glow Pulse */}
//                         {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               )}

//                 { !studentsLoading && students.length===0 && (
//                 <tr>
//                   <td colSpan={2} className="text-center text-[10px] text-gray-400 py-4">
//                     No students found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
