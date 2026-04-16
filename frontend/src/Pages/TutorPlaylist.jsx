import React, { useState, useEffect, useRef, useMemo } from "react";
import user from "../images/user.png";
import NavBar from "../ui/NavBar";
import axiosInstance from "../instances/Axiosinstances";
import Footer from "../ui/Footer";
import getTimeAgo from "../components/DateCovertion";
import blog1 from "../images/img_not_found.png";
import { useNavigate } from "react-router-dom";
import useGetPostsByCategory from "../hooks/useGetPostsByCategory";
import useGetAuthorsPostsCategories from "../hooks/useGetAuthorsPostsCategories";
import BlogMiniSkeleton from "../components/loaders/BlogMiniSkeleton";
import Fuse from "fuse.js";
import useGetAllAuthorsByDomain from "../hooks/useGetAllAuthorsByDomain";
import { getItem } from "../utils/encode";
function TutorPlaylist() {
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  // const role = localStorage.getItem("role");
  const role = getItem("role");
  const [domain, setDomain] = useState("");
  const { posts, loading, hasMore, postCount } = useGetPostsByCategory(
    email,
    domain,
  );

  // const { coordinators, fetchCoordinators } = useFetchCoordinators(role);

  const { coordinators } = useGetAllAuthorsByDomain(domain);
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

    return coordinators.filter((coord) => coord.email !== email);
    // const finalCoordinators = coordinators.filter((coord) => coord.email !== email);

    // return [...finalCoordinators]
  }, [coordinators, domain]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchCollaborator);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchCollaborator);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchCollaborator]);

  const fuse = useMemo(() => {
    return new Fuse(filteredCoordinators, {
      keys: ["authorname", "email"],
      threshold: 0.2, // lower = stricter search
    });
  }, [filteredCoordinators]);

  const searchedCoordinators = useMemo(() => {
    let filtered = [...filteredCoordinators].filter(
      (author) => author.email !== email,
    );

    // if (!searchCollaborator) return filteredCoordinators;
    // const query = searchCollaborator.toLowerCase();
    // return filteredCoordinators.filter((coord) => {
    //   const authorMatch = coord.authorname?.toLowerCase().includes(query);
    //   const emailMatch = coord.email?.toLowerCase().includes(query);
    //   const alreadySelected = collaboratorsData.some(
    //     (col) => col.email?.toLowerCase() === coord.email?.toLowerCase(),
    //   );
    //   return (authorMatch || emailMatch) && !alreadySelected;
    // });

    if (debouncedSearch.trim() !== "") {
      filtered = fuse.search(debouncedSearch).map((r) => r.item);
    }

    return filtered.filter((coord) => {
      const alreadySelected = collaboratorsData.some(
        (col) => col.email?.toLowerCase() === coord.email?.toLowerCase(),
      );
      return coord && !alreadySelected;
    });
  }, [
    filteredCoordinators,
    searchCollaborator,
    debouncedSearch,
    collaboratorsData,
  ]);

  const handleCollaborators = (email, name, profile) => {
    setCollaboratorsData((prev) => {
      const exists = prev.some((col) => col.email === email);

      if (exists) {
        return prev.filter((col) => col.email !== email);
      } else {
        return [...prev, { email, name, profile }];
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

  // console.log('filteredCoordinators', filteredCoordinators)
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
    // bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800

    <div className="w-full min-h-screen bg-gray-900 relative">
      <NavBar />
      <div className="mb-8 mt-4 px-4 flex items-center justify-between">
        <div>
          <h1 className="md:text-3xl text-2xl font-semibold  text-white tracking-tight">
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
                Organize your <span className="">published posts</span> into
                domain-specific playlists.
              </p>
            </li>

            <li className="flex items-start gap-2">
              <span className=" mt-[2px]">•</span>
              <p>
                A playlist must contain at least{" "}
                <span className="">two posts</span> for meaningful grouping.
              </p>
            </li>

            <li className="flex items-start gap-2">
              <span className=" mt-[2px]">•</span>
              <p>
                Add <span className="">collaborators</span> who contributed to
                the content, resources, or development.
              </p>
            </li>

            <li className="flex items-start gap-2">
              <span className=" mt-[2px]">•</span>
              <p>
                <span className="text-gray-400">(Optional)</span> Upload a
                thumbnail
                <span className=""> (1280 × 720 px)</span> for better
                visibility.
              </p>
            </li>
          </ul>
        </div>
      </div>

      <form
        onSubmit={hanldeSubmit}
        // className="w-full mx-auto px-3 md:px-4 pb-10 md:grid gap-10 lg:gap-0 lg:grid-cols-3"
        className="w-full mx-auto px-4 pb-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6"
      >
        {/* LEFT — PLAYLIST DETAILS */}
        <div className="lg:col-span-1 md:bg-gray-900/70 md:border border-gray-800 rounded-lg space-y-8">
          <div className=" md:p-6 p-2 space-y-7 shadow-lg">
            <h2 className="text-lg hidden  tracking-wide lg:block font-semibold text-emerald-400">
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
                      {/* <img
                        src={
                          data.img
                            ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.img}`
                            : user
                        }
                        className="w-6 h-6 rounded-full object-cover border border-emerald-400 bg-gray-400"
                        alt=""
                      /> */}
                      {data.profile?
                              <img
                        src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`}
                        className="w-6 h-6 rounded-full object-cover border border-emerald-400 bg-gray-400"
                        alt=""
                      />:
                       <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ backgroundColor: avatarColor(data.name) }}
                          >
                            {initials(data.name)}
                          </div>
                      }
                      <span className="text-xs text-gray-200">{data.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {searchCollaborator && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 emerald-scrollbar overflow-y-auto max-h-48 ">
                  {searchedCoordinators.length > 0 ? (
                    searchedCoordinators.map((collaborator, index) => (
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
                        {/* <img
                          src={
                            collaborator.profile
                              ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collaborator.profile}`
                              : user
                          }
                          className="w-6 h-6 rounded-full bg-gray-400 object-cover border border-emerald-400"
                          alt=""
                        /> */}

                       { collaborator.profile? <img
                          src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collaborator.profile}`}
                          className="w-6 h-6 rounded-full bg-gray-400 object-cover border border-emerald-400"
                          alt=""
                        />:
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ backgroundColor: avatarColor(collaborator.authorname) }}
                          >
                            {initials(collaborator.authorname)}
                          </div>
                        }
                        <span className="text-sm text-gray-200">
                          {collaborator.authorname}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 ">
                      <span className="text-sm text-gray-200 ">
                        {domain.length > 0
                          ? " No authors found!"
                          : "Select domain to hook collaborators"}
                      </span>
                    </div>
                  )}
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
                <div className="md:max-w-80 w-full h-40 mt-3 rounded-xl flex items-center justify-center bg-gray-700">
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
                    className="md:max-w-80 w-full h-40   object-cover rounded-xl border border-gray-700"
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

        <div 
        // className="lg:col-span-2 mt-7 md:mt-0 space-y-6 h-fit"
        className=" mt-7 md:mt-0  space-y-0 h-fit"
        >
        

          {posts?.length > 0 && (
            <div className="flex flex-col p-2 md:px-4 gap-3">
              <div className="flex items-center justify-between gap-3">
                {/* Left — icon + title */}
                <div className="flex items-center gap-2.5">
          
                  <div>
                    <p className="text-[15px] font-medium text-white leading-tight">
                      Select posts to create playlist
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Tap a post to add it to your playlist
                    </p>
                  </div>
                </div>

                {/* Right — count pill */}
                <div className="flex  items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-2.5 py-1 text-gray-300 text-xs flex-shrink-0">
                  <div className="w-5 h-5 rounded-full text-emerald-400 bg-emerald-600/20 flex items-center justify-center text-[11px] font-semibold ">
                    {postIds?.length ?? 0}
                  </div>
                  <span className="text-xs text-gray-300">of {postCount}</span>
                  Selected
                </div>
              </div>

              {/* Progress bar */}
              {/* <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
        style={{ width: `${((postIds?.length ?? 0) / postCount) * 100}%` }}
      />
    </div> */}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 md:max-h-[780px] emerald-scrollbar md:overflow-y-auto gap-3 px-2 py-4 md:p-4 gap-3 md:gap-5">
            {posts?.map((data) => {
              const selIndex = postIds.indexOf(data._id);
              const isSelected = selIndex !== -1;
              return (
                <div
                  key={data._id}
                  onClick={() => handlePostIds(data._id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all relative duration-300
                ${
                  postIds.includes(data._id)
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-700 bg-gray-900 "
                }`}
                >
                  {/* Selection order badge */}
                  {isSelected && (
                    <div
                      className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-emerald-500
                       flex items-center justify-center
                      text-white text-[11px] font-semibold z-10
                      animate-[popIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
                    >
                      {selIndex + 1}
                    </div>
                  )}

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
              );
            })}

            {!posts.length > 0 && loading && <BlogMiniSkeleton />}
            {posts.length > 0 && loading && (
              <p className="col-span-full py-4 text-gray-500 text-center">
                loading...
              </p>
            )}

            {!hasMore && posts?.length > 0 && (
              <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                No more posts
              </p>
            )}
            {posts?.length == 0 && !loading && (
              <div className="flex flex-col col-span-full md:h-[400px] items-center md:mt-0 my-16 lg:w-11/12 mx-auto justify-center md:w-full text-white">
                {/* Guidelines Card */}
                <div
                  className="
                    w-fit
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

                  <p className="text-xs md:text-sm mt-5 text-gray-400 ">
                  Select a domain to view posts to create playlist.
                </p>
                </div>

                {/* Bottom Helper Text */}
                <p className="text-xs md:hidden md:text-sm text-gray-400 text-center">
                  Select a domain to view posts to create playlist.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        {posts?.length > 0 && (
          <div className="lg:col-span-3 p-4 md:hidden md:mt-7 flex justify-start ">
            <button
              type="submit"
              disabled={loader}
              className="md:px-5 p-5 py-2 md:py-2 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm   text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {loader ? "Creating Playlist..." : "Create Playlist"}
            </button>
          </div>
        )}
      </form>

      <Footer />
    </div>


//     <div className="w-full min-h-screen bg-gray-900 text-white">
//   <NavBar />

//   {/* ── HEADER ───────────────────────────── */}
//   <div className="w-full">
//     <div className="w-full mx-auto px-4 py-4 flex items-center justify-between">
//       <div>
//         <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
//           Create Playlist
//         </h1>
//         <p className="text-xs text-gray-500 mt-1">
//           Organize and publish domain-specific content
//         </p>
//       </div>
//     </div>
//   </div>

//   {/* ── MAIN LAYOUT ─────────────────────── */}
//   <form
//     onSubmit={hanldeSubmit}
//     className="w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-6"
//   >

//     {/* ═════════ LEFT SIDEBAR ═════════ */}
//     {/* ═════════ LEFT SIDEBAR ═════════ */}
// <div className="lg:sticky top-6 h-fit">

//   <div className="bg-gray-900 border border-white/[0.05] rounded-2xl p-5 space-y-6">

//     {/* Header */}
//     <div className="pb-3 border-b border-white/[0.05]">
//       <h2 className="text-sm font-semibold">Playlist Setup</h2>
//       <p className="text-[11px] text-gray-500 mt-1">
//         Basic configuration
//       </p>
//     </div>

//     {/* ── GUIDELINES (NEW) ── */}
//     <div className="
//       rounded-xl
//       border border-emerald-500/20
//       bg-gradient-to-br from-emerald-500/5 to-transparent
//       p-4 space-y-3
//     ">
//       <p className="text-[12px] font-semibold text-white">
//         Playlist Guidelines
//       </p>

//       <ul className="space-y-2 text-[11px] text-gray-300 leading-relaxed">
//         <li className="flex gap-2">
//           <span>•</span>
//           <p>
//             Organize your <span className="text-white">published posts</span> into playlists.
//           </p>
//         </li>

//         <li className="flex gap-2">
//           <span>•</span>
//           <p>
//             Minimum <span className="text-white">2 posts</span> required.
//           </p>
//         </li>

//         <li className="flex gap-2">
//           <span>•</span>
//           <p>
//             Add <span className="text-white">collaborators</span> if needed.
//           </p>
//         </li>

//         <li className="flex gap-2">
//           <span>•</span>
//           <p>
//             Optional thumbnail <span className="text-gray-400">(1280×720)</span>.
//           </p>
//         </li>
//       </ul>
//     </div>

//     {/* Domain */}
//     <div className="space-y-2">
//       <p className="text-[11px] uppercase text-gray-500">Domain</p>
//       <select
//         value={domain}
//         onChange={(e) => {
//           setPostIds([]);
//           setCollaboratorsData([]);
//           setDomain(e.target.value);
//         }}
//         className="w-full bg-gray-950 border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:border-emerald-500/40 outline-none"
//       >
//         <option value="">Choose Domain</option>
//         {categories.map((c, i) => (
//           <option key={i} value={c}>{c}</option>
//         ))}
//       </select>
//     </div>

//     {/* Title */}
//     <div className="space-y-2">
//       <p className="text-[11px] uppercase text-gray-500">Title</p>
//       <input
//         type="text"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         placeholder="Enter playlist title"
//         className="w-full bg-gray-950 border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:border-emerald-500/40 outline-none"
//       />
//     </div>

//     {/* Collaborators */}
//     <div className="space-y-3 relative">
//       <p className="text-[11px] uppercase text-gray-500">Collaborators</p>

//       <input
//         type="text"
//         placeholder="Search collaborators"
//         value={searchCollaborator}
//         onChange={(e) => setSearchCollaborator(e.target.value)}
//         className="w-full bg-gray-950 border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:border-emerald-500/40 outline-none"
//       />

//       {collaboratorsData.length > 0 && (
//         <div className="flex flex-wrap gap-2">
//           {collaboratorsData.map((data, i) => (
//             <div
//               key={i}
//               onClick={() =>
//                 handleCollaborators(
//                   data.email,
//                   data.authorname,
//                   data.profile
//                 )
//               }
//               className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] cursor-pointer"
//             >
//               <img
//                 src={
//                   data.img
//                     ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.img}`
//                     : user
//                 }
//                 className="w-5 h-5 rounded-full border border-emerald-400"
//               />
//               <span className="text-[11px]">{data.name}</span>
//             </div>
//           ))}
//         </div>
//       )}

//       {searchCollaborator && (
//         <div className="absolute w-full mt-1 bg-gray-900 border border-white/[0.08] rounded-lg max-h-48 overflow-y-auto z-20">
//           {searchedCoordinators.length > 0 ? (
//             searchedCoordinators.map((c, i) => (
//               <div
//                 key={i}
//                 onClick={() =>
//                   handleCollaborators(
//                     c.email,
//                     c.authorname,
//                     c.profile
//                   )
//                 }
//                 className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.05] cursor-pointer"
//               >
//                 <img
//                   src={
//                     c.profile
//                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${c.profile}`
//                       : user
//                   }
//                   className="w-5 h-5 rounded-full border border-emerald-400"
//                 />
//                 <span className="text-xs">{c.authorname}</span>
//               </div>
//             ))
//           ) : (
//             <p className="text-xs text-gray-500 px-3 py-2">
//               {domain ? "No authors found" : "Select domain first"}
//             </p>
//           )}
//         </div>
//       )}
//     </div>

//     {/* Thumbnail */}
//     <div className="space-y-2">
//       <p className="text-[11px] uppercase text-gray-500">Thumbnail</p>

//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleChnageThumbnail}
//         ref={thumbnailInputRef}
//         className="text-xs text-gray-400 file:bg-emerald-500/20 file:text-emerald-400 file:px-2 file:py-1 file:rounded-md file:border-0"
//       />

//       {!previewThumbnail ? (
//         <div className="h-32 bg-white/[0.03] border border-dashed border-white/[0.08] rounded-lg flex items-center justify-center text-xs text-gray-500">
//           No preview
//         </div>
//       ) : (
//         <div>
//           <img
//             src={previewThumbnail}
//             className="w-full h-32 object-cover rounded-lg border border-white/[0.08]"
//           />
//           <p
//             onClick={() => {
//               setPreviewThumbnail(null);
//               setThumbnail(null);
//             }}
//             className="text-xs text-red-400 mt-1 cursor-pointer"
//           >
//             Remove
//           </p>
//         </div>
//       )}
//     </div>

//     {/* Submit */}
//     <button
//       type="submit"
//       disabled={loader}
//       className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm hover:bg-emerald-500/20 disabled:opacity-50"
//     >
//       {loader ? "Creating..." : "Create Playlist"}
//     </button>

//   </div>
// </div>

//     {/* ═════════ RIGHT CONTENT ═════════ */}
//     <div className="space-y-4">

//       {/* Top bar */}
//       {posts?.length > 0 && (
//         <div className="flex items-center justify-between bg-gray-900 border border-white/[0.05] rounded-xl px-4 py-3">
//           <div>
//             <p className="text-sm font-medium">
//               Select posts
//             </p>
//             <p className="text-xs text-gray-500">
//               Choose posts for playlist
//             </p>
//           </div>

//           <div className="text-xs bg-gray-800 px-3 py-1 rounded-full">
//             {postIds?.length ?? 0} / {postCount}
//           </div>
//         </div>
//       )}

//       {/* Posts Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

//         {posts?.map((data) => {
//           const selIndex = postIds.indexOf(data._id);
//           const isSelected = selIndex !== -1;

//           return (
//             <div
//               key={data._id}
//               onClick={() => handlePostIds(data._id)}
//               className={`rounded-xl border p-3 cursor-pointer transition
//               ${isSelected
//                   ? "border-emerald-500 bg-emerald-500/10"
//                   : "border-white/[0.05] bg-gray-900"
//               }`}
//             >
//               {isSelected && (
//                 <div className="absolute text-xs bg-emerald-500 text-black px-2 py-0.5 rounded-full">
//                   {selIndex + 1}
//                 </div>
//               )}

//               <p className="text-sm font-medium line-clamp-1">
//                 {data.title}
//               </p>

//               <img
//                 src={
//                   data.image
//                     ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
//                     : blog1
//                 }
//                 className="w-full h-36 object-cover rounded-lg my-2"
//               />

//               <div className="flex justify-between text-xs text-gray-400">
//                 <span>{data.views.length} views</span>
//                 <span className="text-emerald-400">
//                   {data.category}
//                 </span>
//               </div>
//             </div>
//           );
//         })}

//         {loading && <BlogMiniSkeleton />}

//         {!posts?.length && !loading && (
//           <div className="col-span-full text-center py-20 text-gray-500 text-sm">
//             Select a domain to view posts
//           </div>
//         )}
        
//       </div>
//     </div>

//   </form>

//   <Footer />
// </div>
  );
}

export default TutorPlaylist;
