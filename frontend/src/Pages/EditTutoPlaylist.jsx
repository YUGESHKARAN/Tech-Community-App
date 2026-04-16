import React, { useState, useEffect, useRef, useMemo } from "react";
import user from "../images/user.png";
import NavBar from "../ui/NavBar";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../instances/Axiosinstances";
import Footer from "../ui/Footer";
import useGetAuthorPosts from "../hooks/useGetAuthorPost";
import useFetchCoordinators from "../hooks/useFetchCoordinators";
import getTimeAgo from "../components/DateCovertion";
import { IoEye, IoShareSocial } from "react-icons/io5";
import blog1 from "../images/img_not_found.png";
import useGetAuthorsPostsCategories from "../hooks/useGetAuthorsPostsCategories";
import useGetPostsByCategory from "../hooks/useGetPostsByCategory";
import BlogMiniSkeleton from "../components/loaders/BlogMiniSkeleton";
import Fuse from "fuse.js";
import useGetAllAuthorsByDomain from "../hooks/useGetAllAuthorsByDomain";
import { getItem } from "../utils/encode";
function EditTutorPlaylist() {
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const role = getItem("role");
  const navigator = useNavigate();
  const [domain, setDomain] = useState("");
  // const { posts, getAuthorPosts } = useGetAuthorPosts(email);

  const { coordinators } = useGetAllAuthorsByDomain(domain);
  const [title, setTitle] = useState("");
  const [postIds, setPostIds] = useState([]);
  // const [filteredCoordinators, setFilteredCoordinators] = useState([])
  const [searchCollaborator, setSearchCollaborator] = useState("");
  const [collaboratorsData, setCollaboratorsData] = useState([]);
  // const [collaboratorsEmail, setCollaboratorsEmail] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const thumbnailInputRef = useRef(null);
  const [loader, setLoader] = useState(false);
  const { categories, setCategories } = useGetAuthorsPostsCategories(email);
  // const [playlistData, setPlaylistData] = useState({});
  const { id } = useParams();

  const getTutorPlaylist = async () => {
    try {
      const response = await axiosInstance.get(`/blog/playlist/${id}`);
      console.log("data", response.data);
      if (response.status === 200) {
        // setPlaylistData(response.data.data);
        setPostIds(response.data.data.post_ids);
        setDomain(response.data.data.domain);
        setTitle(response.data.data.title);
        setThumbnail(response.data.data.thumbnail);
        setCollaboratorsData(response.data.data.collaborators);
        if (response.data.data.thumbnail) {
          setPreviewThumbnail(
            `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${response.data.data.thumbnail}`,
          );
        }
        // setPlaylistPosts(response.data.posts);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getTutorPlaylist();
  }, [id]);

  const { posts, loading, hasMore, postCount } = useGetPostsByCategory(
    email,
    domain,
  );

  const hanldeSubmit = async (e) => {
    e.preventDefault();
    if (postIds.length <= 1) {
      alert("Please select at least two posts to create the playlist.");
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

    try {
      const response = await axiosInstance.put(
        `/blog/playlist/update/${id}`,
        formData,
      );

      if (response.status === 200) {
        setTitle("");
        setDomain("");
        setCollaboratorsData([]);
        setPostIds([]);
        setThumbnail(null);
        setPreviewThumbnail(null);
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = null;
        }
        navigator(-1);
      }
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
  }, [coordinators, domain]);

  // const searchedCoordinators = useMemo(() => {
  //   if (!searchCollaborator) return filteredCoordinators;

  //   const query = searchCollaborator.toLowerCase();
  //   return filteredCoordinators.filter((coord) => {
  //     const authorMatch = coord.authorname?.toLowerCase().includes(query);

  //     const emailMatch = coord.email?.toLowerCase().includes(query);

  //     const alreadySelected = collaboratorsData.some(
  //       (col) => col.email?.toLowerCase() === coord.email?.toLowerCase()
  //     );

  //     return (authorMatch || emailMatch) && !alreadySelected;
  //   });
  // }, [filteredCoordinators, searchCollaborator]);

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
    let filtered = [...filteredCoordinators];

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

  // console.log("filteredPosts",filteredPosts)
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
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative">
      <NavBar />
      <div className="md:mb-8 mt-4 px-4 flex items-center justify-between">
        <div>
          <h1 className="md:text-3xl text-2xl font-semibold   text-white tracking-tight">
            Update Playlist
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            You have complete control over your content, can update your
            playlist here.
          </p>
        </div>
      </div>

      <form
        onSubmit={hanldeSubmit}
        // className="w-full mx-auto px-3 md:px-4 pb-10 md:grid gap-10 lg:gap-4 lg:grid-cols-3"
        className="w-full mx-auto px-4 pb-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6"
      >
        {/* LEFT — PLAYLIST DETAILS */}
        <div className="lg:col-span-1 md:bg-gray-900/70   md:border border-gray-800 rounded-lg space-y-8">
          <div className="p-2 md:p-6 space-y-7 shadow-lg">
            <h2 className="text-lg hidden  tracking-wide lg:block font-semibold text-emerald-400">
              Playlist Details
            </h2>

            {/* Domain */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300 font-medium">
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
                <option value="">Choose Domain</option>
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
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
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
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 cursor-pointer"
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
                Playlist Thumbnail <span className="text-red-500">*</span>
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
                    className="md:max-w-80 w-full h-40 max-w-xs  object-cover rounded-xl border border-gray-700"
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-3 hidden md:block flex justify-start pt-0">
              <button
                type="submit"
                disabled={loader}
                className="md:px-5 px-3 py-2 md:py-2.5 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {loader ? "Updating Playlist..." : "Update Playlist"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — POSTS */}

        <div 
        // className="lg:col-span-2 mt-7 md:mt-0 lg:w-11/12 space-y-6 h-fit"
        className="mt-7 md:mt-0  space-y-0 h-fit"

        >
          {/* {posts?.length > 0 && (
            <h2 className="text-xl text-center md:text-left font-semibold text-white">
              Select Posts for Playlist
            </h2>
          )} */}

           {posts?.length > 0 && (
            <div className="flex  flex-col p-2 md:p-4 gap-3">
              <div className="flex items-center justify-between gap-3">
                {/* Left — icon + title */}
                <div className="flex items-center gap-2.5">
                  {/* <div className="w-[34px] h-[34px] rounded-[10px] bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="10" height="2" rx="1" fill="#10b981"/>
            <rect x="1" y="7" width="8"  height="2" rx="1" fill="#10b981"/>
            <rect x="1" y="11" width="6" height="2" rx="1" fill="#10b981"/>
            <circle cx="13" cy="10" r="2.5" stroke="#10b981" strokeWidth="1.5"/>
            <line x1="13" y1="7" x2="13" y2="5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div> */}
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
                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-2.5 py-1 text-gray-300 text-xs flex-shrink-0">
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


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5  md:max-h-[800px] emerald-scrollbar md:overflow-y-auto px-2 py-4 md:p-4 gap-3 md:gap-5">
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
                      <p className="md:text-sm line-clamp-1 text-xs font-medium text-white">
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
              <div className="flex col-span-full md:h-[400px] items-center md:mt-0  my-16 text-center lg:w-11/12 mx-auto  justify-center md:w-full text-gray-400 md:text-sm text-xs  ">
                <p className="">
                  {" "}
                  Select a domain to view posts to create playlist.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        {posts?.length > 0 && (
          <div className="lg:col-span-3 p-4 md:mt-7 md:hidden flex justify-start ">
            <button
              type="submit"
              disabled={loader}
              className="md:px-5 px-3 py-2 md:py-2.5 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {loader ? "Updating Playlist..." : "Update Playlist"}
            </button>
          </div>
        )}
      </form>

      <Footer />
    </div>
  );
}

export default EditTutorPlaylist;
