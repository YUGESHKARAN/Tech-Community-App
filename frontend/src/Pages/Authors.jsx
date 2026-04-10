import React, { useState, useEffect, useRef, useMemo } from "react";
import NavBar from "../ui/NavBar";
import blog1 from "../images/blog1.jpg";
import { AiOutlineMail } from "react-icons/ai";
import { GrLinkedin } from "react-icons/gr";
import Footer from "../ui/Footer";
import user from "../images/user.png";
import axiosInstance from "../instances/Axiosinstances";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { PiLinkSimpleFill } from "react-icons/pi";
import { BsPersonSquare } from "react-icons/bs";
import { IoSearch } from "react-icons/io5";
import { IoIosGitNetwork } from "react-icons/io";
import RecommendedAuthorsSkeleton from "../components/loaders/RecommendedAuthorsSkeleton ";
import CoordinatorGridSkeleton from "../components/loaders/CoordinatorGridSkeleton ";
import StudentGridSkeleton from "../components/loaders/StudentGridSkeleton ";
import Cookies from "js-cookie";
import Fuse from "fuse.js";
import { getItem } from "../utils/encode";
function Authors() {
  const [authors, setAuthors] = useState([]);
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const [roleFilter, setRoleFilter] = useState("");
  const [follow, setFollow] = useState(false);
  const [recommendation, setRecommendation] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  // const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const isFetching = useRef(false);
  const [followAuthorLoaderId, setFollowAuthorLoaderId] = useState(null);

  // const authorsDetails = async () => {
  //   try {
  //     const response = await axiosInstance.get("/blog/author/profiles/");
  //     // const response = await axiosInstance.get('http://127.0.0.1:3000/blog/author/profiles/');
  //     setAuthors(response.data.filter((author) => author.email !== email));
  //     // setAuthors(response.data);
  //   } catch (err) {
  //     console.error("error", err);
  //   }
  // };
  const authorsDetails = async () => {
    if (!hasMore || isFetching.current) return; // IMPORTANT

    isFetching.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/author/profiles?page=${page}&limit=${limit}`,
      );

      const newAuthors = response.data.data.filter(
        (author) => author.email !== email,
      );

      if (newAuthors.length === 0) {
        setHasMore(false);
      } else {
        setAuthors((prev) => [...prev, ...newAuthors]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("error", err);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    authorsDetails();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.scrollHeight
      ) {
        authorsDetails();
      }
    
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore]);

  // Search quary
  // useEffect(() => {
  //   filterAndSearch();
  // }, [searchQuery, roleFilter, authors]);

  // const filterAndSearch = () => {
  //   let filtered = authors;

  //   if (searchQuery.trim() !== "") {
  //     const query = searchQuery.toLowerCase();
  //     filtered = filtered.filter(
  //       (author) =>
  //         author.authorName?.toLowerCase().includes(query) ||
  //         "" ||
  //         author.email?.toLowerCase().includes(query) ||
  //         "",
  //     );
  //   }

  //   if (roleFilter !== "") {
  //     filtered = filtered.filter((author) => author.role === roleFilter);
  //   }

  //   setFilteredAuthors(filtered);
  // };

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fuse = useMemo(() => {
    return new Fuse(authors, {
      keys: ["authorName", "email"],
      threshold: 0.3, // lower = stricter search
    });
  }, [authors]);

  const filteredAuthors = useMemo(()=>
  {
    let filtered = [...authors];

     if (debouncedSearch.trim() !== "") {
      filtered = fuse.search(debouncedSearch).map((r) => r.item);
    }
     if (roleFilter !== "") {
      filtered = filtered.filter((author) => author.role === roleFilter);
    }

    return filtered
  }, [searchQuery, roleFilter, authors, debouncedSearch])

  const recommendationURL = import.meta.env.VITE_RECOMMENDATION_URL;

  const recommendtion_system = async () => {
    try {
      const response = await axios.post(
        `${recommendationURL}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // console.log("recommedation data",response.data)
      setRecommendation(response.data.recommended_people);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    recommendtion_system();
  }, []);

  // const addFollower = async (userEmail) => {
  //   console.log("useremail", userEmail);
  //   try {
  //     const response = await axiosInstance.put(
  //       `/blog/author/follow/${userEmail}`,
  //       { emailAuthor: email },
  //     );
  //     if (response.status === 200) {
  //       console.log(response.data);
  //       authorsDetails();
  //     }
  //   } catch (err) {
  //     console.log("error", err);
  //   }
  // };

  const addFollower = async (userEmail) => {
    try {
      setFollowAuthorLoaderId(userEmail)
      const response = await axiosInstance.put(
        `/blog/author/follow/${userEmail}`,
        { emailAuthor: email },
      );

      if (response.status === 200) {
        setAuthors((prev) =>
          prev.map((author) => {
            if (author.email === userEmail) {
              const isFollowing = author.followers?.includes(email);

              return {
                ...author,
                followers: isFollowing
                  ? author.followers.filter((f) => f !== email)
                  : [...(author.followers || []), email],
              };
            }
            return author;
          }),
        );
      }
    } catch (err) {
      console.log("error", err);
    }
    finally{
      setFollowAuthorLoaderId(null)
    }
  };

  // const recommendedAuthors = authors
  //   .filter((author) => recommendation.includes(author.email))
  //   .filter((author) => author.role === "coordinator");

  const recommendationSet = useMemo(
  () => new Set(recommendation),
  [recommendation]
);

const recommendedAuthors = useMemo(() => {
  return authors.filter(
    (author) =>
      recommendationSet.has(author.email) &&
      author.role === "coordinator"
  );
}, [authors, recommendationSet]);


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 ">
      <NavBar />

      {/* <h1 className=" text-3xl py-4  w-11/12 flex items-center gap-2 mx-auto md:text-3xl font-bold text-white tracking-wide">
        <IoIosGitNetwork />
        <span className="group text-white">My Network </span>{" "}
      </h1> */}

      <div className="w-full px-4 mx-auto flex items-center gap-3 py-6">
        <IoIosGitNetwork className="text-green-400 text-3xl" />
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          My Network
        </h1>
      </div>

  
      {/* Recommended authors */}
      {recommendedAuthors?.length > 0 && (
        <h2 className="w-full px-4 mx-auto tracking-widest  text-left text-lg text-green-400 md:text-2xl font-semibold">
          Recommended
        </h2>
      )}

      <div
        className={`${recommendedAuthors?.length > 0 ? "flex w-full px-4 mx-auto gap-2 overflow-x-auto scrollbar-hide mt-4 pb-2" : "hidden"}`}
      >
        {recommendedAuthors.map((author, index) => (
          <div
            key={index}
            className="min-w-[260px] bg-gray-900/70 border border-gray-700 rounded-xl p-4 shadow hover:shadow-xl transition"
          >
            <div className="flex items-center gap-3">
              <Link
                to={`/viewProfile/${author.email}`}
                className="flex-shrink-0"
              >
                <img
                  src={
                    author.profile
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                      : user
                  }
                  className="w-12 h-12 bg-gray-700 rounded-full object-cover border border-gray-900"
                />
              </Link>

              <div className="flex-1 ">
                <h3 className="text-sm font-semibold text-white truncate">
                  {author.authorName}
                </h3>
                <p className="text-xs text-gray-400 text-[9px] w-9/12 md:w-9/12 truncate">
                  {author.email}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-4 text-xs text-gray-300">
              <span>
                <b className="text-white">{author.followers.length}</b>{" "}
                Followers
              </span>
             {author?.postCount>0 && <span>
                <b className="text-white">{author?.postCount}</b> Posts
              </span>}
            </div>

            <div className="mt-4">
              {author.followers.includes(email) ? (
                <button
                  onClick={() => addFollower(author.email)}
                  className="w-full py-1.5 rounded-lg bg-gray-700 text-gray-300 trim text-sm cursor-default transition-all duration-400 disabled:bg-transparent"
                  disabled={followAuthorLoaderId === author.email}
                >
                    {followAuthorLoaderId === author.email ? (
                              <div className="flex items-center py-1.5 justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                              </div>
                            ) : (
                              "Following"
                            )}
                </button>
              ) : (
                <button
                  onClick={() => addFollower(author.email)}
                  className="w-full py-1.5 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition-all duration-400 disabled:bg-transparent"
                  disabled={followAuthorLoaderId === author.email}
                >
                    {followAuthorLoaderId === author.email ? (
                              <div className="flex items-center py-1.5 justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                              </div>
                            ) : (
                              "Follow"
                            )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {loading &&
        recommendedAuthors?.length == 0 &&
        filteredAuthors?.length == 0 && (
          <>
            <h2 className="w-full px-4 mx-auto  tracking-widest text-left text-lg text-green-400 md:text-2xl font-semibold">
              Recommended
            </h2>
            <RecommendedAuthorsSkeleton />
          </>
        )}

      {/* Search and Filter */}
      <div className="w-full px-4 mx-auto flex mt-7   md:flex-row justify-between items-center gap-4 md:mt-10 mb-6">
        <div
          // className="md:w-1/3 w-3/5 px-4 py-2 flex items-center gap-2 justify-center rounded-md bg-gray-600 border border-white text-xs md:text-base text-white placeholder-gray-400"
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
          className="
            w-32 md:w-64
            px-3 py-2
            rounded-full
            bg-gray-800 backdrop-blur-md
            border border-gray-600
            text-xs 
            text-white
            shadow-md
            cursor-pointer
            transition-all duration-200
            focus:outline-none
            focus:ring-1 focus:ring-teal-500/50
            hover:bg-gray-900
          "
        >
          <option value="">All Roles</option>
          <option value="coordinator">Contributors</option>
          <option value="student">Users</option>
        </select>
      </div>

      <div className="w-full px-4 mx-auto min-h-screen flex flex-col items-center text-white">
        {/* Coordinators Section */}
        {filteredAuthors.filter((author) => author.role === "coordinator")
          .length > 0 && (
          // <h2 className="text-center text-2xl md:text-4xl font-semibold mb-6 bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
          <h2 className="w-full   text-center text-sm md:text-gray-400 tracking-widest uppercase text-gray-500  font-semibold my-6">
            Contributors
          </h2>
        )}

   
        <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {filteredAuthors
            .filter((author) => author.role === "coordinator")
            .map((author, index) => (
              <div
                key={index}
                className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 text-center hover:shadow-xl transition"
              >
                <Link to={`/viewProfile/${author.email}`}>
                  <img
                    src={
                      author.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                        : user
                    }
                    className="w-24 h-24 mx-auto bg-gray-700 rounded-full object-cover border border-gray-900"
                  />
                </Link>

                <h3 className="mt-3 font-semibold text-white truncate">
                  {author.authorName}
                </h3>
                <p className="text-xs text-gray-400 mx-auto truncate">{author.email}</p>

                <div className="flex justify-center gap-6 mt-4 text-xs text-gray-300">
                  <span>
                    <b className="text-white">{author.followers.length}</b>{" "}
                    Followers
                  </span>
                  {author?.postCount>0 && <span>
                    <b className="text-white">{author.postCount}</b> Posts
                  </span>}
                </div>

                {/* Social media components */}

                {/* {author.profileLinks?.length > 0 && (
                  <div className="flex justify-center gap-3 mt-4">
                    {author.profileLinks.map((link, i) => (
                      <Link key={i} to={link.url} target="_blank">
                        {link.title === "LinkedIn" ? (
                          <FaLinkedin className="text-gray-300 hover:text-green-400 transition" />
                        ) : link.title === "GitHub" ? (
                          <FaSquareGithub className="text-gray-300 hover:text-green-400 transition" />
                        ) : (
                          <PiLinkSimpleFill className="text-gray-300 hover:text-green-400 transition" />
                        )}
                      </Link>
                    ))}
                  </div>
                )} */}

                <div className="mt-5">
                  {author.followers.includes(email) ? (
                    <button
                      onClick={() => addFollower(author.email)}
                      className="w-full py-2 cursor-pointer rounded-lg bg-gray-700 text-gray-300 text-sm cursor-default transition-all duration-400 disabled:bg-transparent"
                      disabled={followAuthorLoaderId === author.email}
                    >
                       {followAuthorLoaderId === author.email ? (
                              <div className="flex items-center py-1.5 justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                              </div>
                            ) : (
                              "Following"
                            )}
                    </button>
                  ) : (
                    <button
                      onClick={() => addFollower(author.email)}
                      className="w-full py-2 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition-all duration-400 disabled:bg-transparent"
                      disabled={followAuthorLoaderId === author.email}
                    >
                      {followAuthorLoaderId === author.email ? (
                              <div className="flex items-center py-1.5 justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                              </div>
                            ) : (
                              "Follow"
                            )}
                    </button>
                  )}
                </div>
              </div>
            ))}

          {filteredAuthors.filter((author) => author.role === "coordinator")
            .length > 0 &&
            loading && (
             <div className="col-span-full flex justify-center py-4">
                      <div className="relative flex items-center justify-center">
                        {/* Outer Oval Ring */}
                        <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                        {/* Inner Glow Pulse */}
                        {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                      </div>
                    </div>
            )}

          {filteredAuthors.filter((author) => author.role === "coordinator")
            .length == 0 && roleFilter !== "student" &&
            loading && (
              <div className="col-span-full">
                <h2 className="w-full   text-center text-sm md:text-gray-400 tracking-widest uppercase text-gray-500  font-semibold my-6">
                  Contributors
                </h2>
                <CoordinatorGridSkeleton />
              </div>
            )}

          {filteredAuthors.filter((author) => author.role === "coordinator")
            .length > 0 &&
            !hasMore && (
              <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                No more coordinators
              </p>
            )}
        </div>

        {/* Students Section */}
        {filteredAuthors.filter((author) => author.role === "student").length >
          0 && (
          <h2 className={`w-full   text-center text-sm md:text-gray-400 tracking-widest uppercase text-gray-500  font-semibold  ${roleFilter=='student'?'mt-6':' mt-16'}`}>
            Users
          </h2>
        )}

       
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2 md:gap-4 mt-6">
          {filteredAuthors
            .filter((author) => author.role === "student")
            .map((author, index) => (
              <div
                key={index}
                className="
                  bg-gray-900/70
                  border border-gray-700
                  rounded-xl
                  p-5
                  flex flex-col items-center
                  text-center
                  shadow
                  hover:shadow-xl
                  hover:-translate-y-1
                  transition-all duration-300
                "
              >
                {/* Avatar */}
                <Link to={`/viewProfile/${author.email}`}>
                  <img
                    src={
                      author.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                        : user
                    }
                    alt={author.authorName}
                    className="
                        w-20 h-20
                        rounded-full
                        object-cover
                        border border-gray-900
                        shadow-sm
                        hover:shadow-md
                        transition
                        bg-gray-700
                    "
                  />
                </Link>

                {/* Name */}
                <h3 className="mt-4 font-semibold text-sm md:text-base text-white truncate w-full">
                  {author.authorName}
                </h3>

                {/* Email */}
                <p className="text-xs text-gray-400 truncate w-full">
                  {author.email}
                </p> 

                {/* Social Links */}

                {/* {author.profileLinks?.length > 0 && (
                  <div className="flex justify-center gap-4 mt-4">
                    {author.profileLinks.map((link, i) => (
                      <Link
                        key={i}
                        to={link.url}
                        title={link.title}
                        target="_blank"
                        className="text-gray-400 hover:text-green-400 transition"
                      >
                        {link.title === "LinkedIn" ? (
                          <FaLinkedin className="text-lg" />
                        ) : link.title === "GitHub" ? (
                          <FaSquareGithub className="text-lg" />
                        ) : link.title === "Portfolio" ? (
                          <BsPersonSquare className="text-lg" />
                        ) : (
                          <PiLinkSimpleFill className="text-lg" />
                        )}
                      </Link>
                    ))}
                  </div>
                )} */}
              </div>
            ))}

          {filteredAuthors.filter((author) => author.role === "student")
            .length > 0  &&
            loading && (
              <div className="col-span-full flex justify-center py-4">
                      <div className="relative flex items-center justify-center">
                        {/* Outer Oval Ring */}
                        <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                        {/* Inner Glow Pulse */}
                        {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                      </div>
                    </div>
            )}

          {filteredAuthors.filter((author) => author.role === "student")
            .length == 0 &&
             roleFilter !== "coordinator" && 
            loading && (
              <div className="col-span-full">
                <h2 className="w-full   text-center text-sm md:text-gray-400 tracking-widest uppercase text-gray-500  font-semibold my-6">
                  Users
                </h2>
                <StudentGridSkeleton />
              </div>
            )}

          {filteredAuthors.filter((author) => author.role === "student")
            .length > 0 &&
            !hasMore && (
              <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
                No more users
              </p>
            )}
        </div>
      </div>

      <Footer />
    </div>

    //     <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    //   <NavBar />

    //   {/* Header */}
    //   <div className="w-11/12 mx-auto flex items-center gap-3 py-6">
    //     <IoIosGitNetwork className="text-green-400 text-3xl" />
    //     <h1 className="text-2xl md:text-3xl font-semibold text-white">
    //       My Network
    //     </h1>
    //   </div>

    //   {/* Recommended */}
    //   {recommendedAuthors.length > 0 && (
    //     <div className="w-11/12 mx-auto">
    //       <hName="text-lg text-sm md:text-gray-400d text-green-400 mb-4">
    //         People you may know
    //       </h2>

    //       <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
    //         {recommendedAuthors.map((author, index) => (
    //           <div
    //             key={index}
    //             className="min-w-[260px] bg-gray-900/70 border border-gray-700 rounded-xl p-4 shadow hover:shadow-xl transition"
    //           >
    //             <div className="flex items-center gap-3">
    //               <Link to={`/viewProfile/${author.email}`}>
    //                 <img
    //                   src={
    //                     author.profile
    //                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
    //                       : user
    //                   }
    //                   className="w-12 h-12 rounded-full object-cover border border-gray-600"
    //                 />
    //               </Link>

    //               <div className="flex-1">
    //                 <h3 className="text-sm font-semibold text-white truncate">
    //                   {author.authorName}
    //                 </h3>
    //                 <p className="text-xs text-gray-400 truncate">
    //                   {author.email}
    //                 </p>
    //               </div>
    //             </div>

    //             <div className="flex justify-between mt-4 text-xs text-gray-300">
    //               <span>
    //                 <b className="text-white">{author.followers.length}</b> Followers
    //               </span>
    //               <span>
    //                 <b className="text-white">{author.postCount}</b> Posts
    //               </span>
    //             </div>

    //             <div className="mt-4">
    //               {author.followers.includes(email) ? (
    //                 <button
    //                   onClick={() => addFollower(author.email)}
    //                   className="w-full py-1.5 cursor-pointer rounded-lg bg-gray-700 text-gray-300 text-sm cursor-default"
    //                 >
    //                   Following
    //                 </button>
    //               ) : (
    //                 <button
    //                   onClick={() => addFollower(author.email)}
    //                   className="w-full py-1.5 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition"
    //                 >
    //                   Follow
    //                 </button>
    //               )}
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}

    //   {/* Search & Filter */}
    //   <div className="w-11/12 mx-auto flex flex-col md:flex-row gap-4 items-center mt-10 mb-8">
    //     <div className="w-full max-w-md flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-full px-5 py-3">
    //       <IoSearch className="text-gray-400" />
    //       <input
    //         type="text"
    //         placeholder="Search people"
    //         value={searchQuery}
    //         onChange={(e) => setSearchQuery(e.target.value)}
    //         className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-gray-400"
    //       />
    //     </div>

    //     <select
    //       value={roleFilter}
    //       onChange={(e) => setRoleFilter(e.target.value)}
    //       className="px-5 py-3 rounded-full bg-gray-900 border border-gray-700 text-sm text-white cursor-pointer"
    //     >
    //       <option value="">All Roles</option>
    //       <option value="student">Student</option>
    //       <option value="coordinator">Coordinator</option>
    //     </select>
    //   </div>

    //   {/* Coordinators */}
    //   {filteredAuthors.filter((a) => a.role === "coordinator").length > 0 && (
    //     <h2 className="text-center text-xl md:text-2xl font-semibold text-white mb-6">
    //       Contributors
    //     </h2>
    //   )}

    //   <div className="w-11/12 mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
    //     {filteredAuthors
    //       .filter((author) => author.role === "coordinator")
    //       .map((author, index) => (
    //         <div
    //           key={index}
    //           className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 text-center hover:shadow-xl transition"
    //         >
    //           <Link to={`/viewProfile/${author.email}`}>
    //             <img
    //               src={
    //                 author.profile
    //                   ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
    //                   : user
    //               }
    //               className="w-24 h-24 mx-auto rounded-full object-cover border border-gray-600"
    //             />
    //           </Link>

    //           <h3 className="mt-3 font-semibold text-white truncate">
    //             {author.authorName}
    //           </h3>
    //           <p className="text-xs text-gray-400 truncate">{author.email}</p>

    //           <div className="flex justify-center gap-6 mt-4 text-xs text-gray-300">
    //             <span>
    //               <b className="text-white">{author.followers.length}</b> Followers
    //             </span>
    //             <span>
    //               <b className="text-white">{author.postCount}</b> Posts
    //             </span>
    //           </div>

    //           {author.profileLinks?.length > 0 && (
    //             <div className="flex justify-center gap-3 mt-4">
    //               {author.profileLinks.map((link, i) => (
    //                 <Link key={i} to={link.url} target="_blank">
    //                   {link.title === "LinkedIn" ? (
    //                     <FaLinkedin className="text-gray-300 hover:text-green-400 transition" />
    //                   ) : link.title === "GitHub" ? (
    //                     <FaSquareGithub className="text-gray-300 hover:text-green-400 transition" />
    //                   ) : (
    //                     <PiLinkSimpleFill className="text-gray-300 hover:text-green-400 transition" />
    //                   )}
    //                 </Link>
    //               ))}
    //             </div>
    //           )}

    //           <div className="mt-5">
    //             {author.followers.includes(email) ? (
    //               <button
    //               onClick={() => addFollower(author.email)}
    //               className="w-full py-2 rounded-lg bg-gray-700 text-gray-300 text-sm cursor-default">
    //                 Following
    //               </button>
    //             ) : (
    //               <button
    //                 onClick={() => addFollower(author.email)}
    //                 className="w-full py-2 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition"
    //               >
    //                 Follow
    //               </button>
    //             )}
    //           </div>
    //         </div>
    //       ))}
    //   </div>

    //   <Footer />
    // </div>
  );
}

export default Authors;
