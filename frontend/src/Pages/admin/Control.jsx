import React, { useState, useEffect, useMemo, useRef } from "react";
import { MdDeleteForever, MdManageAccounts } from "react-icons/md";
import Footer from "../../ui/Footer";
import { IoCheckmark, IoSearch } from "react-icons/io5";
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
import { BsFilterLeft } from "react-icons/bs";
import formatCount from "../../utils/NumberConversion";
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
  const [updateId, setUpdateId] = useState(null);
  const [updateCommuntiyId, setUpdateCommunityId] = useState(null);

  const {
    students,
    totalStudents,
    loading: studentLoading,
    hasMore: studentHashMore,
    setStudents,
  } = useGetStudents(email);
  const {
    coordinators,
    totalCoordinators,
    loading: coordinatorsLoading,
    hasMore: coordinatorHashMore,
    setCoordinators,
  } = useGetCoordinators(email);

  const {
    admins,
    totalAdmins,
    loading: adminLoading,
    hasMore: adminHashMore,
    loadMore,
    setAdmins,
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
            item.email?.toLowerCase().includes(query),
        );
      }

      if (
        roleFilter !== "" &&
        roleFilter !== "admin" &&
        roleFilter !== "coordinator" &&
        roleFilter !== "student"
      ) {
        // If a specific role filter is set, apply it
      } else if (
        roleFilter === "admin" ||
        roleFilter === "coordinator" ||
        roleFilter === "student"
      ) {
        filtered = filtered.filter((item) => item.role === roleFilter);
      }

      return filtered;
    };

    setFilteredAdmins(applyFilters(admins));
    setFilteredCoordinators(applyFilters(coordinators));
    setFilteredStudents(applyFilters(students));
  }, [
    searchQuery,
    roleFilter,
    admins,
    coordinators,
    debouncedSearch,
    students,
  ]);

  const handleRoleChange = (id, newRole) => {
    setUpdatedRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  const reloadRoleLists = async () => {
    try {
      const [adminsRes, coordinatorsRes, studentsRes] = await Promise.all([
        axiosInstance.get(
          `/blog/analytics/view/admins/${email}?page=1&limit=20`,
        ),
        axiosInstance.get(
          `/blog/analytics/view/coordinators/${email}?page=1&limit=50`,
        ),
        axiosInstance.get(
          `/blog/analytics/view/users/${email}?page=1&limit=50`,
        ),
      ]);

      setAdmins(adminsRes.data.admins || []);
      setCoordinators(coordinatorsRes.data.coordinators || []);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error("Failed to reload role lists", err);
    }
  };

  const updateRole = async (userEmail, id) => {
    const roleToUpdate = updatedRoles[id];
    if (!roleToUpdate) {
      toast.warning("Warning", "Please select a role before updating");
      return;
    }

    setUpdateId(id);

    try {
      const response = await axiosInstance.put(
        `/blog/author/control/updateRole/${email}`,
        { role: roleToUpdate, userEmail },
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
    } finally {
      setUpdateId(null);
    }
  };

  const deleteAuthorByAdmin = async () => {
    setShowConfirm(true);
    if (!password) {
      toast.warning(
        "Required",
        "Your password is required to delete the user account",
      );
      setShowConfirm(false);
      return "";
    }
    setLoading(true);

    try {
      const response = await axiosInstance.delete(
        // `/blog/author/deleteByAdmin/${email}`,
        `/blog/admin/adminDelete/${email}`,
        { data: { email: authorEmail, password } },
      );

      if (response.status == 200) {
        toast.success("Deleted", `${response.data.message}`);
        // getAuthors();
        await reloadRoleLists();
        setPassword("");
      }
    } catch (err) {
      // toast.error(`${response.data.message}`);
      toast.error("Unauthorized", "unable to delete the author");
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
    setUpdateCommunityId(id);
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
    } finally {
      setUpdateCommunityId(null);
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

  const [showAuthorFilter, setShowAuthorFilter] = useState(false);
  const authorFilterRef = useRef();
  const FILTERS = [
  { value: "", label: "All" },
  { value: "coordinator", label: "Contributors" },
  { value: "student", label: "Students" },
];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        authorFilterRef.current &&
        !authorFilterRef.current.contains(event.target)
      ) {
        setShowAuthorFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <div className="min-h-screen h-auto relative w-full   theme">
      <NavBar />

      {/* <div className="w-full px-4 mx-auto flex width-max items-center gap-2 pt-3 pb-1 md:pb-3 md:pt-6">
              <MdManageAccounts className="text-green-400 text-xl md:text-3xl" />
              <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-white">
                Control Panel
              </h1>
            </div> */}

      <div className="flex px-4 mx-auto width-max items-center items-center gap-1 pt-3 md:gap-3">
        <MdManageAccounts className="text-emerald-500/70 text-lg md:text-3xl" />
        <h1 className="text-lg md:text-3xl font-semibold tracking-tight text-gray-100">
          Control Panel
        </h1>
      </div>

      {/* Search and Filter */}
      {/* <div className="w-full width-max px-4 py-2 mx-auto flex  md:flex-row  items-center gap-2 md:gap-3 mb-3 md:mb-6">
        <div
          // className="md:w-1/3 w-3/5 px-4 py-2 flex items-center gap-2 justify-center rounded-md bg-gray-600 border border-white text-xs md:text-sm text-white placeholder-gray-400"
          className="w-full max-w-md flex items-center gap-3 theme-fields-lite border border-gray-700 rounded-xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition"
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

        <div className="relative transition-all duration-300 cursor-pointer">
          <span
            onClick={() => {
              setShowAuthorFilter(true);
            }}
            className="reltive"
          >
            <BsFilterLeft className="text-gray-300  rounded-full p-0.5 text-3xl " />

            <IoCheckmark
              className={`${roleFilter !== "" ? "text-emerald-400" : "text-gray-300"} absolute bottom-1 right-0 transition-all duration-300`}
            />
          </span>

          <div
            ref={authorFilterRef}
            className={`${
              showAuthorFilter
                ? "absolute top-12 md:mt-0 right-1 md:left-0 z-50 px-2 py-1 w-32 overflow-hidden rounded-lg border border-[#30363d] theme shadow-2xl"
                : "hidden"
            }`}
            onClick={() => {
              setShowAuthorFilter(false);
            }}
          >
            <div className="py-1.5">
              <div
                onClick={() => {
                  setRoleFilter("");
                }}
              >
                <button
                  className="
                        w-full flex items-center gap-2
                        pl-3  md:py-1.5 py-1
                        text-xs text-gray-100
                        hover:theme-fields-lite/70
                        transition-all duration-200
                        rounded-lg
        
        
                
                      "
                >
                  <span className="flex items-center gap-2">
                    All{" "}
                    {roleFilter === "" && (
                      <IoCheckmark className="text-sm text-emerald-400" />
                    )}
                  </span>
                </button>
              </div>

              <div
                onClick={() => {
                  setRoleFilter("admin");
                }}
              >
                <button
                  className="
                        w-full flex items-center gap-2
                        pl-3  md:py-1.5 py-1
                        text-xs text-gray-100
                        hover:theme-fields-lite/70
                        transition-all duration-200
                        rounded-lg
        
                      "
                >
                  <span className="flex items-center gap-2">
                    {" "}
                    Admins{" "}
                    {roleFilter === "admin" && (
                      <IoCheckmark className="text-sm text-emerald-400" />
                    )}
                  </span>
                </button>
              </div>

              <div
                onClick={() => {
                  setRoleFilter("coordinator");
                }}
              >
                <button
                  className="
                        w-full flex items-center gap-2
                        pl-3  md:py-1.5 py-1
                        text-xs text-gray-100
                        hover:theme-fields-lite/70
                        transition-all duration-200
                        rounded-lg
        
                      "
                >
                  <span className="flex items-center gap-2">
                    {" "}
                    Contributors{" "}
                    {roleFilter === "coordinator" && (
                      <IoCheckmark className="text-sm text-emerald-400" />
                    )}
                  </span>
                </button>
              </div>

              <div
                onClick={() => {
                  setRoleFilter("student");
                }}
              >
                <button
                  className="
                        w-full flex items-center gap-2
                        pl-3  md:py-1.5 py-1
                        text-xs text-gray-100
                        hover:theme-fields-lite/70
                        transition-all duration-200
                        rounded-lg
        
                      "
                >
                  <span className="flex items-center gap-2">
                    {" "}
                    Users{" "}
                    {roleFilter === "student" && (
                      <IoCheckmark className="text-sm text-emerald-400" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}

       {/* Search + filter chips */}
            <div className="w-full max-w-[1800px] px-4 mx-auto px-auto justify-between flex flex-wrap mt-0 md:mt-4  items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="max-w-44 md:min-w-96 flex items-center gap-1 md:gap-3 theme-fields-lite border border-gray-700 rounded-lg md:rounded-xl px-3 md:px-3 py-1 md:py-1.5 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
                <IoSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-[11px] md:text-sm text-white placeholder-gray-400"
                />
              </div>
      
              <div className="flex gap-1 md:gap-2 mt-0 flex-wrap">
                {FILTERS.map((f) => {
                  const isActive = roleFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setRoleFilter(f.value)}
                      className={`md:text-xs text-[9px] font-medium px-2 md:px-3.5 py-0.5 md:py-1.5 rounded-xl md:rounded-2xl border transition-all duration-300 ${
                        isActive
                          ? "bg-emerald-500 text-black border-transparent"
                          : "bg-white/5 text-gray-400 border-white/10 hover:text-gray-200 hover:border-white/20"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

      {/* -------------------------------------------------Admins--------------------------------------- */}

      <h1
        // id="admins"
        className={`${
          roleFilter === "admin" || roleFilter === ""
            ? " w-full text-center text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium my-4 "
            : "hidden"
        } scroll-mt-24`}
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
          } width-max mx-auto`}
        >
          {filteredAdmins.length > 0 ? (
            filteredAdmins.map((author) => (
              <div
                key={author.id}
                className="theme w-full px-4 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md border md:border-neutral-800 border-neutral-700"
              >
                <div className="flex justify-between items-center text-xl font-semibold text-white">
                  <Link
                    to={`/viewProfile/${author.email}`}
                    className="flex items-start min-w-0 gap-2"
                  >
                    {!author.profile ? (
                      <div
                        className="w-9 h-9  rounded-full flex items-center justify-center  text-[9px] md:text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: avatarColor(author.name) }}
                      >
                        {initials(author.name)}
                      </div>
                    ) : (
                      <img
                        src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                        alt=""
                        className="w-9 h-9  border border-green-500/70 rounded-full object-cover"
                      />
                    )}
                    <span className="text-base truncate flex-1 min-w-0 font-semibold text-gray-200 truncate">
                      {/* {author.name} */}
                      {highlightText(author.name, debouncedSearch)}
                      <p className="text-gray-500 truncate text-xs md:text-xs mb-2">
                        {/* {author.email} */}
                        {highlightText(author.email, debouncedSearch)}
                      </p>
                    </span>
                  </Link>
                  {email !== author.email && (
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
                  )}
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
                    {/* Followers: {author.followerscount} */}
                    Followers: {formatCount(author.followerscount)}
                  </p>
                  <p
                    className={`${
                      author.role === "student"
                        ? "hidden"
                        : "text-gray-400 text-xs md:text-sm mt-2"
                    }`}
                  >
                    {/* Posts: {author.postsCount} */}
                    Posts: {formatCount(author.postsCount)}
                  </p>
                </div>

                <div className="flex items-center mt-4">
                  <select
                    className="cursor-pointer mt-2 p-2  text-xs md:text-sm mr-4 rounded bg-gray-800 text-white  disabled:cursor-not-allowed"
                    value={updatedRoles[author.id] || author.role}
                    onChange={(e) =>
                      handleRoleChange(author.id, e.target.value)
                    }
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
                    onClick={() =>
                      updateAssignedCommunities(author.email, author.id)
                    }
                    className="md:px-5 px-3 py-2 mt-4 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-xs  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={updateCommuntiyId === author.id}
                  >
                    {updateCommuntiyId === author.id
                      ? "Saving..."
                      : "Save Communities"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-center text-gray-400 text-sm md:text-base">
                {searchQuery
                  ? "No admins found matching your search"
                  : "No admins available"}
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
      ) : adminLoading ? (
        <AdminCardLoader roleFilter={roleFilter} />
      ) : (
        <p className=" text-center width-max mx-auto text-[10px] md:text-xs col-span-full py-4 text-gray-500">
          No Admins found
        </p>
      )}

      {/* -------------------------------------------------Coordinators----------------------------------------------------- */}

      <h1
        id="coordinators"
        className={`${
          roleFilter === "coordinator" || roleFilter === ""
            ? "w-full text-center text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium my-4 "
            : "hidden"
        } width-max mx-auto scroll-mt-24`}
      >
        Coordinators
      </h1>

      {coordinators.length > 0 ? (
        <div
          className={`${
            roleFilter === ""
              ? "h-auto  mb-10  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
              : roleFilter === "coordinator"
                ? "min-h-screen h-auto  mb-10 flex flex-col  md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
                : "hidden"
          } width-max mx-auto`}
        >
          {filteredCoordinators.length > 0 ? (
            filteredCoordinators.map((author) => (
              <div
                key={author.id}
                className="theme w-full px-4 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md border  border-neutral-700/70"
              >
                <div className="flex justify-between items-center text-xl font-semibold text-white">
                  <Link
                    to={`/viewProfile/${author.email}`}
                    className="flex items-start min-w-0 gap-2"
                  >
                    {!author.profile ? (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] md:text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: avatarColor(author.name) }}
                      >
                        {initials(author.name)}
                      </div>
                    ) : (
                      <img
                        src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                        alt=""
                        className="w-9 h-9 border border-green-500/70 rounded-full object-cover"
                      />
                    )}
                    <span className="text-base truncate flex-1 min-w-0 font-semibold text-gray-200 truncate">
                      {/* {author.name} */}
                      {highlightText(author.name, debouncedSearch)}
                      <p className="text-gray-500 truncate text-xs md:text-xs mb-2">
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
                    {/* Followers: {author.followerscount} */}
                    Followers: {formatCount(author.followerscount)}
                  </p>
                  <p
                    className={`${
                      author.role === "student"
                        ? "hidden"
                        : "text-gray-400 text-xs md:text-sm mt-2"
                    }`}
                  >
                    {/* Posts: {author.postsCount} */}
                    Posts: {formatCount(author.postsCount)}
                  </p>
                </div>

                <div className="flex items-center mt-4">
                  <select
                    className="cursor-pointer mt-2 p-2  text-xs md:text-sm mr-4 rounded bg-gray-800 text-white"
                    value={updatedRoles[author.id] || author.role}
                    onChange={(e) =>
                      handleRoleChange(author.id, e.target.value)
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="coordinator">Contributor</option>
                    <option value="student">User</option>
                  </select>

                  <button
                    className="mt-2 md:px-4 px-2  text-xs md:text-sm py-1 font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    onClick={() => updateRole(author.email, author.id)}
                    disabled={updateId === author.id}
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
                    onClick={() =>
                      updateAssignedCommunities(author.email, author.id)
                    }
                    className="md:px-5 px-3 py-2 mt-4 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-xs  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={updateCommuntiyId === author.id}
                  >
                    {updateCommuntiyId === author.id
                      ? "Saving..."
                      : "Save Communities"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-center text-gray-400 text-sm md:text-base">
                {searchQuery
                  ? "No contributors found matching your search"
                  : "No contributors available"}
              </p>
            </div>
          )}

          {filteredCoordinators.length > 0 &&
            coordinators.length > 0 &&
            coordinatorsLoading && (
              <div className="col-span-full flex justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Outer Oval Ring */}
                  <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                  {/* Inner Glow Pulse */}
                  {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                </div>
              </div>
            )}

          {searchQuery.length === 0 && !coordinatorHashMore && (
            <p className=" text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
              No more Contributors
            </p>
          )}
        </div>
      ) : coordinatorsLoading ? (
        <CoordinatorLoader roleFilter={roleFilter} />
      ) : (
        <p className=" text-center text-[10px] width-max mx-auto md:text-xs col-span-full py-4 text-gray-500">
          No Coordinators found
        </p>
      )}

      {/*------------------------------------------------------------- Students----------------------------------------------------------- */}

      <h1
        id="users"
        className={`${
          roleFilter === "student" || roleFilter === ""
            ? " w-full text-center text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-500 font-medium my-4 "
            : "hidden"
        } width-max mx-auto scroll-mt-24`}
      >
        Students
      </h1>

      {students.length > 0 ? (
        <div
          className={`${
            roleFilter === ""
              ? "h-auto md:mb-16 mb-10  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
              : roleFilter === "student"
                ? " min-h-screen h-auto md:mb-16 mb-10  flex flex-col   md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 mx-auto mt-2"
                : "hidden"
          } theme width-max mx-auto`}
        >
          {filteredStudents.length > 0 ? (
            filteredStudents.map((author) => (
              <div
                key={author.id}
                className="theme w-full px-4 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md border  border-neutral-700/70"
              >
                <div className="flex justify-between items-center text-xl font-semibold text-white">
                  <Link
                    to={`/viewProfile/${author.email}`}
                    className="flex items-start min-w-0 gap-2"
                  >
                    {!author.profile ? (
                      <div
                        className="w-9 h-9  rounded-full flex items-center justify-center text-[9px] md:text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: avatarColor(author.name) }}
                      >
                        {initials(author.name)}
                      </div>
                    ) : (
                      <img
                        src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                        alt=""
                        className="w-9 h-9  border border-green-500/70 rounded-full object-cover"
                      />
                    )}
                    <span className="text-xs min-w-0  flex-1 font-semibold text-gray-200">
                      {/* {author.name} */}
                      <p className="truncate">
                        {" "}
                        {highlightText(author.name, debouncedSearch)}
                      </p>
                      <p className="text-gray-500 truncate text-xs md:text-xs mb-2">
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
                    onChange={(e) =>
                      handleRoleChange(author.id, e.target.value)
                    }
                  >
                    <option value="student">User</option>
                    <option value="coordinator">Contributor</option>
                  </select>

                  <button
                    className="mt-2 md:px-4 px-2  text-xs md:text-sm py-1 font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    onClick={() => updateRole(author.email, author.id)}
                    disabled={updateId === author.id}
                  >
                    {updateId === author.id ? "Updating..." : "Update Role"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-center text-gray-400 text-sm md:text-base">
                {searchQuery
                  ? "No users found matching your search"
                  : "No users available"}
              </p>
            </div>
          )}

          {filteredStudents.length > 0 &&
            students.length > 0 &&
            studentLoading && (
              <div className="col-span-full flex justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Outer Oval Ring */}
                  <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                  {/* Inner Glow Pulse */}
                  {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                </div>
              </div>
            )}

          {searchQuery.length === 0 && !studentHashMore && (
            <p className=" text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
              No more Users
            </p>
          )}
        </div>
      ) : studentLoading ? (
        <StudentLoader roleFilter={roleFilter} />
      ) : (
        <p className=" text-center width-max mx-auto text-[10px] md:text-xs col-span-full py-4 text-gray-500">
          No Users found
        </p>
      )}

      {showConfirm && (
        <div className="fixed inset-0 h-full flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300">
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

      <Footer />
    </div>
  );
}

export default Control;
