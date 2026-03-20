import React, { useState, useEffect, useRef, useMemo } from "react";
import user from "../images/user.png";
import NavBar from "../ui/NavBar";
import { Link } from "react-router-dom";
import axiosInstance from "../instances/Axiosinstances";
import Footer from "../ui/Footer";
import useGetAuthorPosts from "../hooks/useGetAuthorPost";
import useFetchCoordinators from "../hooks/useFetchCoordinators";
import getTimeAgo from "../components/DateCovertion";
import { IoEye, IoShareSocial } from "react-icons/io5";
import blog1 from "../images/img_not_found.png";
import { useNavigate } from "react-router-dom";
import useGetPostsByCategory from "../hooks/useGetPostsByCategory";
import useGetAuthorsPostsCategories from "../hooks/useGetAuthorsPostsCategories";
import BlogMiniSkeleton from "../components/loaders/BlogMiniSkeleton";
function TutorPlaylist() {
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const [domain, setDomain] = useState("");
  const { posts, loading, hasMore } = useGetPostsByCategory(email, domain);

  const { coordinators, fetchCoordinators } = useFetchCoordinators(role);
  const [title, setTitle] = useState("");
  const [postIds, setPostIds] = useState([]);
  const [searchCollaborator, setSearchCollaborator] = useState("");
  const [collaboratorsData, setCollaboratorsData] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const thumbnailInputRef = useRef(null);
  const [loader, setLoader] = useState(false);
  const { categories, setCategories } = useGetAuthorsPostsCategories(email);

  const navigate = useNavigate();

  const hanldeSubmit = async (e) => {
    e.preventDefault();
    if (postIds.length <= 1) {
      alert("Please select at least two posts to create the playlist.");
      return;
    }
    if (!title || !domain) {
      alert("Please fill all the fields.");
      return;
    }
    setLoader(true);
    const collaboratorsEmail = collaboratorsData.map((data) => {
      return data.email;
    });
    // console.log("emails", collaboratorsEmail)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("domain", domain);
    postIds.forEach((id) => formData.append("postIds", id));
    formData.append("thumbnail", thumbnail);
    formData.append("email", email);
    collaboratorsEmail.forEach((email) =>
      formData.append("collaboratorsEmail", email),
    );
    // console.log("email", email)

    try {
      const response = await axiosInstance.post("/blog/playlist/add", formData);

      if (response.status === 201) {
        setTitle("");
        setDomain("");
        setCollaboratorsData([]);
        setPostIds([]);
        setThumbnail(null);
        setPreviewThumbnail(null);
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = null;
        }
      }
      navigate("/yourTutorPlaylists");
    } catch (err) {
      console.log("error", err.message);
    } finally {
      setLoader(false);
    }
  };

  const handleChnageThumbnail = (e) => {
    if (e.target.files && e.target.files[0]) {
      // console.log("thumbnail", e.target.files[0]);
      setThumbnail(e.target.files[0]);
      const file = e.target.files[0];
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  const filteredCoordinators = useMemo(() => {
    if (!domain) return [];

    return coordinators.filter(
      (coord) =>
        Array.isArray(coord?.community) &&
        coord.community.includes(domain) &&
        coord.email !== email,
    );
  }, [coordinators, domain]);

  const searchedCoordinators = useMemo(() => {
    if (!searchCollaborator) return filteredCoordinators;

    const query = searchCollaborator.toLowerCase();
    return filteredCoordinators.filter((coord) => {
      const authorMatch = coord.authorname?.toLowerCase().includes(query);

      const emailMatch = coord.email?.toLowerCase().includes(query);

      const alreadySelected = collaboratorsData.some(
        (col) => col.email?.toLowerCase() === coord.email?.toLowerCase(),
      );

      return (authorMatch || emailMatch) && !alreadySelected;
    });
  }, [filteredCoordinators, searchCollaborator]);

  const handleCollaborators = (email, name, img) => {
    setCollaboratorsData((prev) => {
      const exists = prev.some((col) => col.email === email);

      if (exists) {
        return prev.filter((col) => col.email !== email);
      } else {
        return [...prev, { email, name, img }];
      }
    });

    setSearchCollaborator("");
  };

  const handlePostIds = (postId) => {
    setPostIds((prev) => {
      const exists = prev.some((pid) => pid === postId);
      if (exists) {
        return prev.filter((pid) => pid !== postId);
      } else {
        return [...prev, postId];
      }
    });
  };

  // console.log("posts", posts);
  // console.log("domain", domain);

  return (
    // bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800

    <div className="w-full min-h-screen bg-gray-900 relative">
      <NavBar />
      <div className="mb-8 mt-4 px-3 md:px-4 flex items-center justify-between">
        <div>
          <h1 className="md:text-3xl text-2xl font-bold font-bold text-white tracking-tight">
            Create Playlist
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Group posts to organize and publish domain-specific content for
            fellow developers.
          </p>
        </div>
      </div>

      {/* Guidelines Card */}

      <div className=" lg:hidden block px-3 mx-auto">
        <div
          className="
      w-full
      
      mx-auto
      rounded-xl
      border border-emerald-500/20
      bg-gradient-to-br from-emerald-500/5 to-transparent
      p-4 md:p-5
      mb-0
      md:mb-4
     
      
    "
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {/* <span className="text-emerald-400 text-lg">📌</span> */}
            <h2 className="text-sm text-white md:text-base font-semibold  tracking-wide">
              Playlist Guidelines
            </h2>
          </div>

          {/* Content */}
            <ul className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        Organize your <span className="">published posts</span>{" "}
                        into domain-specific playlists.
                      </p>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        A playlist must contain at least{" "}
                        <span className="">two posts</span> for meaningful
                        grouping.
                      </p>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        Add <span className="">collaborators</span> who
                        contributed to the content, resources, or development.
                      </p>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        <span className="text-gray-400">(Optional)</span> Upload
                        a thumbnail
                        <span className=""> (1280 × 720 px)</span> for better
                        visibility.
                      </p>
                    </li>
                  </ul>
        </div>
      </div>

      <form
        onSubmit={hanldeSubmit}
        className="w-full mx-auto px-3 md:px-4 pb-10 md:grid gap-10 lg:gap-0 lg:grid-cols-3"
      >
        {/* LEFT — PLAYLIST DETAILS */}
        <div className="lg:col-span-1 md:bg-gray-900/70 lg:w-11/12 md:border border-gray-800 rounded-2xl space-y-8">
          <div className=" md:p-6 p-2 space-y-10 shadow-lg">
            <h2 className="text-xl hidden lg:block font-semibold text-white">
              Playlist Details
            </h2>

            {/* Domain */}
            <div className="flex flex-col gap-2">
              <label className="text-sm  text-gray-300 font-medium">
                Select Domain <span className="text-red-500">*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => {
                  setPostIds([]);
                  setCollaboratorsData([]);
                  setDomain(e.target.value);
                }}
                className="bg-gray-950 cursor-pointer border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:border focus:border-emerald-500/40 outline-none"
              >
                <option value={""}>Choose Domain</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Collaborators */}
            <div className="relative flex flex-col gap-2">
              <label className="text-sm text-gray-300 font-medium">
                Hook Collaborators
              </label>

              <input
                type="text"
                placeholder="Search collaborators"
                value={searchCollaborator}
                onChange={(e) => setSearchCollaborator(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 text-sm focus:border focus:border-emerald-500/40 outline-none"
              />

              {/* Selected */}
              {collaboratorsData.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {collaboratorsData.map((data, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        handleCollaborators(
                          data.email,
                          data.authorname,
                          data.profile,
                        )
                      }
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-700 transition"
                    >
                      <img
                        src={
                          data.img
                            ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.img}`
                            : user
                        }
                        className="w-6 h-6 rounded-full object-cover border border-emerald-400 bg-white"
                        alt=""
                      />
                      <span className="text-xs text-gray-200">{data.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {searchCollaborator && searchedCoordinators.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 emerald-scrollbar overflow-y-auto max-h-48 ">
                  {searchedCoordinators.map((collaborator, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        handleCollaborators(
                          collaborator.email,
                          collaborator.authorname,
                          collaborator.profile,
                        )
                      }
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 cursor-pointer"
                    >
                      <img
                        src={
                          collaborator.profile
                            ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collaborator.profile}`
                            : user
                        }
                        className="w-6 h-6 rounded-full bg-white object-cover border border-emerald-400"
                        alt=""
                      />
                      <span className="text-sm text-gray-200">
                        {collaborator.authorname}
                      </span>
                    </div>
                  ))}
                  
                
                </div>
              )}
            </div>

            {/* Playlist Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300 font-medium">
                Playlist Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter playlist title"
                className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 text-sm focus:border focus:border-emerald-500/40 outline-none"
              />
            </div>

            {/* Thumbnail */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300 font-medium">
                Playlist Thumbnail 
                {/* <span className="text-red-500">*</span> */}
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleChnageThumbnail}
                ref={thumbnailInputRef}
                className="w-full mt-2 text-xs  text-gray-300 
                file:mr-4 file:px-2 file:py-1 file:rounded-md 
                file:border-0 file:bg-emerald-500/20 file:hover:bg-emerald-600/20 file:text-emerald-400 
                file:cursor-pointer"
              />
              {!previewThumbnail && (
                <div className="w-80 h-40 mt-3 rounded-xl flex items-center justify-center bg-gray-700">
                  <p className="text-gray-400 text-xs">No Thumbnail</p>
                </div>
              )}

              {previewThumbnail && (
                <div className="pt-3 space-y-2">
                  <p
                    onClick={() => {
                      setPreviewThumbnail(null);
                      setThumbnail(null);
                      if (thumbnailInputRef.current) {
                        thumbnailInputRef.current.value = null;
                      }
                    }}
                    className="text-xs text-red-400 cursor-pointer hover:underline"
                  >
                    Remove thumbnail
                  </p>
                  <img
                    src={previewThumbnail}
                    alt="Preview"
                    className="w-80 h-40 max-w-xs  object-cover rounded-xl border border-gray-700"
                    // className="w-full h-48 md:h-[28vh] object-cover rounded-xl border border-gray-700"
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-3 hidden md:block flex justify-start md:pt-0 pt-6">
              <button
                type="submit"
                disabled={loader}
                className="md:px-5 px-3 py-2 md:py-2 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm   text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {loader ? "Creating Playlist..." : "Create Playlist"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — POSTS */}

        <div className="lg:col-span-2 mt-7 md:mt-0 lg:w-11/12 space-y-6 h-fit">
          {posts?.length > 0 && (
            <h2 className="text-xl text-center md:text-left font-semibold text-white">
              Select Posts for Playlist
            </h2>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3  md:max-h-[700px] emerald-scrollbar md:overflow-y-auto gap-3 md:gap-5">
            {posts?.map((data, index) => (
              <div
                key={index}
                onClick={() => handlePostIds(data._id)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all duration-300
                ${
                  postIds.includes(data._id)
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-700 bg-gray-900 "
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div>
                    <p className="md:text-sm text-xs line-clamp-1 font-medium text-white">
                      {data.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getTimeAgo(data.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Image */}
                <img
                  src={
                    data.image
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                      : blog1
                  }
                  className="w-full h-48 md:h-36 rounded-xl object-cover mb-3"
                  alt=""
                />

                {/* Meta */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    {data.views.length} views
                  </span>
                  <span className="px-2 py-1 inline-block rounded-full text-emerald-400 bg-emerald-600/20">
                    {data.category}
                  </span>
                </div>
              </div>
            ))}
            


            {!posts.length > 0 && loading && <BlogMiniSkeleton />}
            {posts.length > 0 && loading && (
              <p className="col-span-full py-4 text-gray-500 text-center">
                loading...
              </p>
            )}

            {!hasMore && posts?.length > 0 && (
              <p className="text-center col-span-full py-4 text-gray-500">
                No more posts
              </p>
            )}
            {posts?.length == 0 && !loading && (
              <div className="flex flex-col col-span-full md:h-[400px] items-center md:mt-0 my-16 lg:w-11/12 mx-auto justify-center md:w-full text-white">
                {/* Guidelines Card */}
                <div
                  className="
                    w-full
                    rounded-xl
                    border border-emerald-500/20
                    bg-gradient-to-br from-emerald-500/5 to-transparent
                    p-4 md:p-5
                    mb-4
                    hidden
                    lg:block
                  "
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    {/* <span className="text-emerald-400 text-lg">📌</span> */}
                    <h2 className="text-sm md:text-base font-semibold  tracking-wide">
                      Playlist Guidelines
                    </h2>
                  </div>

                  {/* Content */}
                  <ul className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        Organize your <span className="">published posts</span>{" "}
                        into domain-specific playlists.
                      </p>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        A playlist must contain at least{" "}
                        <span className="">two posts</span> for meaningful
                        grouping.
                      </p>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        Add <span className="">collaborators</span> who
                        contributed to the content, resources, or development.
                      </p>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className=" mt-[2px]">•</span>
                      <p>
                        <span className="text-gray-400">(Optional)</span> Upload
                        a thumbnail
                        <span className=""> (1280 × 720 px)</span> for better
                        visibility.
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Bottom Helper Text */}
                <p className="text-xs md:text-sm text-gray-400 text-center">
                  Select a domain to view posts for playlist creation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        {posts?.length > 0 && (
          <div className="lg:col-span-3 md:hidden mt-7 flex justify-start ">
            <button
              type="submit"
              disabled={loader}
              className="md:px-5 px-5 py-2 md:py-2 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm   text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {loader ? "Creating Playlist..." : "Create Playlist"}
            </button>
          </div>
        )}
      </form>

      <Footer/>
    </div>
  );
}

export default TutorPlaylist;
