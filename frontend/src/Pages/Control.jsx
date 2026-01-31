import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import { MdDeleteForever } from "react-icons/md";
import Footer from "../ui/Footer";
import { IoSearch } from "react-icons/io5";
import axiosInstance from "../instances/Axiosinstances";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const email = localStorage.getItem("email");
  const [password, setPassword] = useState("");
  const getAuthors = async () => {
    try {
      const response = await axiosInstance.get("/blog/author");
      setAuthors(response.data);
      setFilteredAuthors(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAuthors();
  }, []);

  useEffect(() => {
    filterAndSearch();
  }, [searchQuery, roleFilter, authors]);

  const handleRoleChange = (id, newRole) => {
    setUpdatedRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  const updateRole = async (email, id) => {
    const roleToUpdate = updatedRoles[id];
    if (!roleToUpdate) {
      toast.error("Please select a role before updating");
      return;
    }

    try {
      const response = await axiosInstance.put(
        "/blog/author/control/updateRole",
        { role: roleToUpdate, email }
      );
      if (response.status === 200) {
        // alert('Role updated successfully');
        toast.success("Role updated successfully");
        getAuthors();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const filterAndSearch = () => {
    let filtered = authors;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (author) =>
          author.name?.toLowerCase().includes(query) ||
          "" ||
          author.email?.toLowerCase().includes(query) ||
          ""
      );
    }

    if (roleFilter !== "") {
      filtered = filtered.filter((author) => author.role === roleFilter);
    }

    setFilteredAuthors(filtered);
  };

  const deleteAuthorByAdmin = async () => {
    setShowConfirm(true);
    setLoading(true);

    try {
      const response = await axiosInstance.delete(
        `/blog/author/deleteByAdmin/${email}`,
        { data: { email: authorEmail, password } }
      );
      
      if(response.status==200){
        toast.success(`${response.data.message}`);
        getAuthors();
        setPassword("")
      }
    } catch (err) {
      toast.error(`${response.data.message}`)
      console.log(err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setPassword("")
      toast.error(`unable to delete the author`);
      
    }
  };

  // Fetch posts from API
  const getPosts = async () => {
    try {
      const response = await axiosInstance.get("/blog/posts");
      setPosts(response.data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  function groupByCommunity(data) {
    const communityMap = {};

    data.forEach((item) => {
      const category = item.category || "Uncategorized";
      const author = item.authoremail;

      if (!communityMap[category]) {
        communityMap[category] = {
          communityName: category,
          Authors: new Set(),
          Posts: 0,
        };
      }

      communityMap[category].Authors.add(author);
      communityMap[category].Posts += 1;
    });

    // Convert to array and count unique authors
    const result = Object.values(communityMap).map((item) => ({
      communityName: item.communityName,
      Authors: item.Authors.size,
      Posts: item.Posts,
    }));

    return result;
  }

  const communities = groupByCommunity(posts);

  const handleCommunityCheckbox = (email, communityName) => {
    setAssignedCommunities((prev) => {
      const current = prev[email] || [];
      const isChecked = current.includes(communityName);
      return {
        ...prev,
        [email]: isChecked
          ? current.filter((c) => c !== communityName)
          : [...current, communityName],
      };
    });
  };

  const updateAssignedCommunities = async (email) => {
    console.log("updateAssignedCommunities email", email);
    const selectedCommunities = assignedCommunities[email] || [];
    console.log("selected commu", selectedCommunities);
    try {
      const response = await axiosInstance.put(
        `/blog/author/control/coordinatorUpdate`,
        {
          techCommunities: selectedCommunities,
          email: email,
        }
      );

      console.log(response.data);

      if (response.status === 201) {
        // alert("Communities updated successfully");
        toast.success("Tech community updated successfully");
      }
    } catch (err) {
      console.error("Error updating communities", err);
    }
  };

  useEffect(() => {
    if (Array.isArray(authors)) {
      setAssignedCommunities((prev) => {
        const newAssignments = { ...prev };
        authors.forEach((author) => {
          if (
            author?.email &&
            author?.community &&
            !newAssignments[author.email]
          ) {
            newAssignments[author.email] = [...author.community];
          }
        });
        return newAssignments;
      });
    }
  }, [authors]);

  // console.group("filteredAuthors",filteredAuthors)

  // console.log("authorCommusnity",authorCommunity)
  return (
    // <div className="relative w-full min-h-screen h-auto  bg-gradient-to-br from-gray-900 to-gray-700">
    <div className="min-h-screen h-auto relative w-full   bg-gradient-to-br from-gray-900 to-gray-800">
    
      <NavBar />
      <h1 className="md:text-4xl text-3xl font-bold my-5 text-white text-center  w-11/12 mx-auto">
        Control Panel
      </h1>

      {/* Search and Filter */}
      <div className="w-11/12 mx-auto flex  md:flex-row justify-between items-center gap-4 mb-6">
        <div 
        // className="md:w-1/3 w-3/5 px-4 py-2 flex items-center gap-2 justify-center rounded-md bg-gray-600 border border-white text-xs md:text-base text-white placeholder-gray-400"
        className="w-full max-w-md flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition"
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
          // className=" md:w-1/4 w-1/5 md:px-4 md:py-2 px-2 py-1 rounded bg-gray-600 text-xs md:text-base text-white"
          className="
            w-32 md:w-64
            px-3 py-2 md:px-5 md:py-2.5
            rounded-full
            bg-gray-800/80 backdrop-blur-md
            border border-gray-600
            text-xs md:text-sm
            text-white
            shadow-md
            cursor-pointer
            transition-all duration-200
            focus:outline-none
            focus:ring-1 focus:ring-teal-500/50
            hover:bg-gray-800
          "
        >
          <option className="bg-gray-800" value="">All Roles</option>
          <option className="bg-gray-800" value="student">Student</option>
          <option className="bg-gray-800" value="coordinator">Coordinator</option>
          <option className="bg-gray-800" value="admin">Admin</option>
        </select>
      </div>

      {
        [
          ...filteredAuthors.filter((author) => author.role === "admin"),
        ].length>0 &&
        <h1
        className={`${
          roleFilter === "admin" || roleFilter === ""
            ? "text-center text-2xl md:text-4xl mb-6 font-bold  text-white"
            : "hidden"
        }`}
      >
        Admins
      </h1>}
      {/* Author admin */}
      <div
        className={`${
          roleFilter === ""
            ? "h-auto md:mb-16 mb-10   grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-11/12 mx-auto mt-2"
            : roleFilter === "admin"
            ? "min-h-screen md:mb-16 mb-10 flex flex-col   md:grid  md:grid-cols-2 lg:grid-cols-3 gap-4 w-11/12 mx-auto mt-2"
            : "hidden"
        }`}
      >
        {[
          // First, filter authors based on their roles
          ...filteredAuthors.filter((author) => author.role === "admin"),
        ].map((author) => (
          <div
            key={author._id}
            className="bg-gray-900 w-11/12 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md"
          >
            <h2 className="flex justify-between items-center text-xl font-semibold text-white">
              {author.authorname}
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
            </h2>
            <p className="text-gray-400 text-xs md:text-base mt-2">
              {author.email}
            </p>

            <div className="md:flex justify-start md:space-x-4 items-center">
              <p className="text-gray-400 text-xs md:text-base mt-2">
                Role: {author.role}
              </p>
              <p
                className={`${
                  author.role === "student"
                    ? "hidden"
                    : "text-gray-400 text-xs md:text-base mt-2"
                }`}
              >
                Followers: {author.followers.length}
              </p>
              <p
                className={`${
                  author.role === "student"
                    ? "hidden"
                    : "text-gray-400 text-xs md:text-base mt-2"
                }`}
              >
                Posts: {author.posts.length}
              </p>
            </div>

            <div className="flex items-center mt-4">
              <select
                className="cursor-pointer mt-2 p-2  text-xs md:text-base mr-4 rounded bg-gray-800 text-white"
                value={updatedRoles[author._id] || author.role}
                onChange={(e) => handleRoleChange(author._id, e.target.value)}
              >
                <option value="student">Student</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>

              <button
                className="mt-2 md:px-4 px-2  text-xs md:text-base py-1 font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded"
                onClick={() => updateRole(author.email, author._id)}
              >
                Update Role
              </button>
            </div>

            {author.role === "coordinator" && (
              <div className="mt-4 text-white">
                <p className="mb-1 text-sm font-semibold">
                  Assign Tech Communities:
                </p>
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
                            community.communityName
                          ) || false
                        }
                        onChange={() =>
                          handleCommunityCheckbox(
                            author.email,
                            community.communityName
                          )
                        }
                        className="form-checkbox accent-green-500"
                      />
                      <span>{community.communityName}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => updateAssignedCommunities(author.email)}
                  className="mt-2 text-xs md:text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Save Communities
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {
          [
          ...filteredAuthors.filter((author) => author.role === "coordinator"),
        ].length>0 &&
        <h1
        className={`${
          roleFilter === "coordinator" || roleFilter === ""
            ? "text-center text-2xl md:text-4xl mb-6 font-bold  text-white"
            : "hidden"
        }`}
      >
        Coordinators
      </h1>}
      {/* Author Coordinators */}
      <div
        className={`${
          roleFilter === ""
            ? "h-auto md:mb-16 mb-10  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-11/12 mx-auto mt-2"
            : roleFilter === "coordinator"
            ? "min-h-screen h-auto md:mb-16 mb-10 flex flex-col  md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-11/12 mx-auto mt-2"
            : "hidden"
        }`}
      >
        {[
          // First, filter authors based on their roles
          ...filteredAuthors.filter((author) => author.role === "coordinator"),
        ].map((author) => (
          <div
            key={author._id}
            className="bg-gray-900 w-11/12 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md"
          >
            <h2 className="flex justify-between items-center text-xl font-semibold text-white">
              {author.authorname}
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
            </h2>
            <p className="text-gray-400 text-xs md:text-base mt-2">
              {author.email}
            </p>

            <div className="md:flex justify-start md:space-x-4 items-center">
              <p className="text-gray-400 text-xs md:text-base mt-2">
                Role: {author.role}
              </p>
              <p
                className={`${
                  author.role === "student"
                    ? "hidden"
                    : "text-gray-400 text-xs md:text-base mt-2"
                }`}
              >
                Followers: {author.followers.length}
              </p>
              <p
                className={`${
                  author.role === "student"
                    ? "hidden"
                    : "text-gray-400 text-xs md:text-base mt-2"
                }`}
              >
                Posts: {author.posts.length}
              </p>
            </div>

            <div className="flex items-center mt-4">
              <select
                className="cursor-pointer mt-2 p-2  text-xs md:text-base mr-4 rounded bg-gray-800 text-white"
                value={updatedRoles[author._id] || author.role}
                onChange={(e) => handleRoleChange(author._id, e.target.value)}
              >
                <option value="student">Student</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>

              <button
                className="mt-2 md:px-4 px-2  text-xs md:text-base py-1 font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded"
                onClick={() => updateRole(author.email, author._id)}
              >
                Update Role
              </button>
            </div>

            {author.role === "coordinator" && (
              <div className="mt-4 text-white">
                <p className="mb-1 text-sm font-semibold">
                  Assign Tech Communities:
                </p>
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
                            community.communityName
                          ) || false
                        }
                        onChange={() =>
                          handleCommunityCheckbox(
                            author.email,
                            community.communityName
                          )
                        }
                        className="form-checkbox accent-green-500"
                      />
                      <span>{community.communityName}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => updateAssignedCommunities(author.email)}
                  className="mt-2 text-xs md:text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Save Communities
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

     {
       [
          ...filteredAuthors.filter((author) => author.role === "student"),
        ].length>0 &&
      <h1
        className={`${
          roleFilter === "student" || roleFilter === ""
            ? "text-center text-2xl md:text-4xl mb-6 font-bold  text-white"
            : "hidden"
        }`}
      >
        Students
      </h1>}
      {/* Author students */}
      <div
        className={`${
          roleFilter === ""
            ? "h-auto md:mb-16 mb-10  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-11/12 mx-auto mt-2"
            : roleFilter === "student"
            ? " min-h-screen h-auto md:mb-16 mb-10  flex flex-col   md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-11/12 mx-auto mt-2"
            : "hidden"
        }`}
      >
        {[
          // First, filter authors based on their roles
          ...filteredAuthors.filter((author) => author.role === "student"),
        ].map((author) => (
          <div
            key={author._id}
            className="bg-gray-900 w-11/12 mx-auto md:w-full h-fit p-4 flex flex-col justify-between rounded-lg shadow-md"
          >
            <h2 className="flex justify-between items-center text-xl font-semibold text-white">
              {author.authorname}
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
            </h2>
            <p className="text-gray-400 text-xs md:text-base mt-2">
              {author.email}
            </p>

            <div className="flex items-center mt-4">
              <select
                className="cursor-pointer mt-2 p-2  text-xs md:text-base mr-4 rounded bg-gray-800 text-white"
                value={updatedRoles[author._id] || author.role}
                onChange={(e) => handleRoleChange(author._id, e.target.value)}
              >
                <option value="student">Student</option>
                <option value="coordinator">Coordinator</option>
              </select>

              <button
                className="mt-2 md:px-4 px-2  text-xs md:text-base py-1 font-semibold hover:bg-gray-500 bg-white text-gray-800 transition-all duration-200 rounded"
                onClick={() => updateRole(author.email, author._id)}
              >
                Update Role
              </button>
            </div>
          </div>
        ))}
      </div>
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
      <ToastContainer />
      {filteredAuthors.length>0 &&
       <Footer /> }
     
    </div>
  );
}

export default Control;
