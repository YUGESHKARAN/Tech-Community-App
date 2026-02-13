import React, { useState, useEffect, useRef } from "react";
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
function Authors() {
  const [authors, setAuthors] = useState([]);
  const email = localStorage.getItem("email");
  const [roleFilter, setRoleFilter] = useState("");
  const [follow, setFollow] = useState(false);
  const [recommendation, setRecommendation] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const isFetching = useRef(false);

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
      `/blog/author/profiles?page=${page}&limit=${limit}`
    );

    const newAuthors = response.data.data.filter(
      (author) => author.email !== email
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
  useEffect(() => {
    filterAndSearch();
  }, [searchQuery, roleFilter, authors]);

  const filterAndSearch = () => {
    let filtered = authors;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (author) =>
          author.authorName?.toLowerCase().includes(query) ||
          "" ||
          author.email?.toLowerCase().includes(query) ||
          "",
      );
    }

    if (roleFilter !== "") {
      filtered = filtered.filter((author) => author.role === roleFilter);
    }

    setFilteredAuthors(filtered);
  };

  const recommendationURL = import.meta.env.VITE_RECOMMENDATION_URL;

  const recommendtion_system = async () => {
    try {
      const response = await axios.post(`${recommendationURL}`, { email });

      // console.log("recommedation data",response.data)
      setRecommendation(response.data.remonneded_people);
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    recommendtion_system();
  }, [recommendation]);

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
    const response = await axiosInstance.put(
      `/blog/author/follow/${userEmail}`,
      { emailAuthor: email }
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
        })
      );
    }
  } catch (err) {
    console.log("error", err);
  }
};


  const recommendaedAutors = authors
    .filter((author) => recommendation.includes(author.email))
    .filter((author) => author.role === "coordinator");

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 ">
      <NavBar />

      {/* <h1 className=" text-3xl py-4  w-11/12 flex items-center gap-2 mx-auto md:text-3xl font-bold text-white tracking-wide">
        <IoIosGitNetwork />
        <span className="group text-white">My Network </span>{" "}
      </h1> */}

      <div className="w-11/12 mx-auto flex items-center gap-3 py-6">
        <IoIosGitNetwork className="text-green-400 text-3xl" />
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          My Network
        </h1>
      </div>

      {/* {recommendaedAutors.length > 0 && (
        <div className="w-11/12  h-auto mx-auto flex-col  items-center justify-center mt-5">
          <h2 className="w-full  text-left text-xl text-green-400 md:text-3xl font-bold">
            Recommended
          </h2>
          <div
            className={`flex justify-start w-full items-center gap-6 overflow-x-auto scrollbar-hide mt-4`}
          >
            {recommendaedAutors.map((author, index) => (
              <div
                key={index}
                className="md:h-24 h-24 p-4 w-fit px-4 gap-1 md:w-fit items-start   flex justify-start items-center rounded-lg shadow-lg bg-[#fff]/20"
              >
                <div className="w-fit  flex-col items-start justify-start md:w-1/3  ">
                  {author.profile ? (
                    <Link to={`/viewProfile/${author.email}`}>
                      {" "}
                      <img
                        src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                        className="rounded-full border-2 border-green-500 w-10 h-10 mx-auto object-cover"
                        alt=""
                      />
                    </Link>
                  ) : (
                    <Link to={`/viewProfile/${author.email}`}>
                      <img
                        src={user}
                        className="rounded-full w-10 h-10 bg-white border-2 border-black mx-auto object-cover"
                      />
                    </Link>
                  )}

                  <div className="flex items-center justify-center mt-2">
                    {author.followers.includes(email) ? (
                      <button
                        onClick={() => {
                          addFollower(author.email);
                        }}
                        className="w-fit mx-auto px-4 py-0.5 cursor-pointer  rounded-lg shadow-lg bg-gray-200 text-[#000]"
                      >
                        Following...
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          addFollower(author.email);
                        }}
                        className="w-fit mx-auto cursor-pointer px-4 py-0.5 rounded-lg text-xs text-nowrap bg-gray-800 text-white"
                      >
                        Follow +
                      </button>
                    )}
                  </div>
                </div>
                <div className=" md:w-2/3 w-3/5   flex-col items-start justify-start">
                  <h1 className="text-center font-semibold text-white text-wrap w-full scrollbar-hide overflow-x-auto md:text-base">
                \
                    {author.authorName}
                  </h1>
                  <h1 className="text-center  mt-0.5 text-[9px] truncate text-white md:text-xs">
                \
                    {author.email}
                  </h1>
                  <div className="flex mx-auto items-center justify-between mt-0.5 gap-5 px-5">
                    <span className="text-center text-green-400 text-[10px] mt-0.5 font-semibold">
                      Followers{" "}
                      <p className="text-white">{author.followers.length}</p>
                    </span>
             
                    <span className="text-center text-green-400  text-[10px] mt-0.5 font-semibold">
                      Posts <p className="text-white">{author.postCount}</p>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div
        className={`${recommendaedAutors?.length > 0 ? "flex w-11/12 mx-auto gap-5 overflow-x-auto scrollbar-hide mt-5 pb-2" : "hidden"}`}
      >
        {recommendaedAutors.map((author, index) => (
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
                  className="w-12 h-12 bg-white rounded-full object-cover border border-gray-600"
                />
              </Link>

              <div className="flex-1 ">
                <h3 className="text-sm font-semibold text-white truncate">
                  {author.authorName}
                </h3>
                <p className="text-xs text-gray-400 text-[9px] w-9/12 md:w-full truncate">
                  {author.email}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-4 text-xs text-gray-300">
              <span>
                <b className="text-white">{author.followers.length}</b>{" "}
                Followers
              </span>
              <span>
                <b className="text-white">{author.postCount}</b> Posts
              </span>
            </div>

            <div className="mt-4">
              {author.followers.includes(email) ? (
                <button
                  onClick={() => addFollower(author.email)}
                  className="w-full py-1.5 rounded-lg bg-gray-700 text-gray-300 trim text-sm cursor-default"
                >
                  Following
                </button>
              ) : (
                <button
                  onClick={() => addFollower(author.email)}
                  className="w-full py-1.5 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition"
                >
                  Follow
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="w-11/12 mx-auto flex mt-7   md:flex-row justify-between items-center gap-4 md:mt-10 mb-6">
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
            hover:bg-gray-700
          "
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="coordinator">Coordinator</option>
        </select>
      </div>

      <div className="w-11/12 mx-auto min-h-screen flex flex-col items-center text-white">
        {/* Coordinators Section */}
        {filteredAuthors.filter((author) => author.role === "coordinator")
          .length > 0 && (
          // <h2 className="text-center text-2xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
          <h2 className="md:text-left text-center w-full text-2xl md:text-4xl font-bold my-6 text-white">
            Student Coordinators
          </h2>
        )}

        {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
          {filteredAuthors
            .filter((author) => author.role === "coordinator")
            .map((author, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-5 flex flex-col items-center"
              >
                <Link to={`/viewProfile/${author.email}`}>
                  <img
                    src={
                      author.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                        : user
                    }
                    alt={author.authorName}
                    className="rounded-full bg-white w-24 h-24 object-cover border-2 border-white shadow-md hover:shadow-lg transition-all"
                  />
                </Link>

                <h1 className="text-center font-semibold mt-3 text-lg truncate w-full">
                  {author.authorName}
                </h1>
                <p className="text-center text-sm text-gray-300 truncate w-full">
                  {author.email}
                </p>

                {author.community?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {author.community.map((com, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs font-medium backdrop-blur-md bg-white/10 text-white rounded-full shadow-sm border border-gray-400"
                      >
                        {com}
                      </span>
                    ))}
                  </div>
                )}

                {author.profileLinks?.length > 0 && (
                  <div className="flex justify-center gap-3 mt-4">
                    {author.profileLinks.map((link, i) => (
                      <Link
                        key={i}
                        to={link.url}
                        title={link.title}
                        target="_blank"
                      >
                        {link.title === "LinkedIn" ? (
                          <FaLinkedin className="text-white text-lg hover:text-green-400 transition" />
                        ) : link.title === "GitHub" ? (
                          <FaSquareGithub className="text-white text-lg hover:text-green-400 transition" />
                        ) : link.title === "Portfolio" ? (
                          <BsPersonSquare className="text-white text-lg hover:text-green-400 transition" />
                        ) : (
                          <PiLinkSimpleFill className="text-white text-lg hover:text-green-400 transition" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  {author.followers.includes(email) ? (
                    <button
                      onClick={() => addFollower(author.email)}
                      className="px-4 py-1.5 rounded-lg cursor-pointer bg-gradient-to-r from-emerald-200 to-emerald-300 text-gray-800 font-medium text-sm cursor-default shadow-sm border border-white/20"
                    >
                      Following...
                    </button>
                  ) : (
                    <button
                      onClick={() => addFollower(author.email)}
                      className="px-4 py-1.5 rounded-lg cursor-pointer bg-gradient-to-r from-emerald-300 to-green-400 text-gray-900 font-medium text-sm hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-sm border border-white/20"
                    >
                      Follow +
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div> */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
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
                    className="w-24 h-24 mx-auto bg-white rounded-full object-cover border border-gray-600"
                  />
                </Link>

                <h3 className="mt-3 font-semibold text-white truncate">
                  {author.authorName}
                </h3>
                <p className="text-xs text-gray-400 truncate">{author.email}</p>

                <div className="flex justify-center gap-6 mt-4 text-xs text-gray-300">
                  <span>
                    <b className="text-white">{author.followers.length}</b>{" "}
                    Followers
                  </span>
                  <span>
                    <b className="text-white">{author.postCount}</b> Posts
                  </span>
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
                      className="w-full py-2 cursor-pointer rounded-lg bg-gray-700 text-gray-300 text-sm cursor-default"
                    >
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={() => addFollower(author.email)}
                      className="w-full py-2 rounded-lg bg-green-500 text-gray-900 text-sm font-medium hover:bg-green-400 transition"
                    >
                      Follow
                    </button>
                  )}
                </div>
              </div>
            ))}

          {filteredAuthors.filter((author) => author.role === "coordinator")
            .length > 0 &&
            loading && <p className="text-center col-span-2 sm:col-span-3 lg:col-span-5 py-4">Loading...</p>}

          {filteredAuthors.filter((author) => author.role === "coordinator")
            .length > 0 &&
            !hasMore && (
              <p className="text-center md:col-span-4 col-span-2 lg:col-span-5 py-4 text-gray-500">
                No more coordinators
              </p>
            )}
        </div>

        {/* Students Section */}
        {filteredAuthors.filter((author) => author.role === "student").length >
          0 && (
          <h2 className="md:text-left text-center w-full mt-16 text-2xl md:text-4xl font-bold text-white">
            Students
          </h2>
        )}

        {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8 mt-6">
          {filteredAuthors
            .filter((author) => author.role === "student")
            .map((author, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-5 flex flex-col items-center"
              >
                <Link to={`/viewProfile/${author.email}`}>
                  <img
                    src={
                      author.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
                        : user
                    }
                    alt={author.authorName}
                    className="rounded-full w-20 bg-white h-20 object-cover border-2 border-white shadow-md hover:shadow-lg transition-all"
                  />
                </Link>

                <h1 className="text-center font-semibold mt-3 text-sm md:text-base truncate w-full">
                  {author.authorName}
                </h1>
                <p className="text-center text-xs text-gray-300 truncate w-full">
                  {author.email}
                </p>

                {author.profileLinks?.length > 0 && (
                  <div className="flex justify-center gap-3 mt-3">
                    {author.profileLinks.map((link, i) => (
                      <Link
                        key={i}
                        to={link.url}
                        title={link.title}
                        target="_blank"
                      >
                        {link.title === "LinkedIn" ? (
                          <FaLinkedin className="text-white text-base hover:text-green-400 transition" />
                        ) : link.title === "GitHub" ? (
                          <FaSquareGithub className="text-white text-base hover:text-green-400 transition" />
                        ) : link.title === "Portfolio" ? (
                          <BsPersonSquare className="text-white text-base hover:text-green-400 transition" />
                        ) : (
                          <PiLinkSimpleFill className="text-white text-base hover:text-green-400 transition" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div> */}

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 md:gap-8 mt-8">
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
                        border border-gray-600
                        shadow-sm
                        hover:shadow-md
                        transition
                        bg-white
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
            .length > 0 &&
            loading && <p className="text-center w-full col-span-2  sm:col-span-3 lg:col-span-5 py-4">Loading...</p>}

          {filteredAuthors.filter((author) => author.role === "student")
            .length > 0 &&
            !hasMore && (
              <p className="text-center md:col-span-4 col-span-2 sm-col-span-3 lg:col-span-6 w-full py-4 text-gray-500">
                No more students
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
    //   {recommendaedAutors.length > 0 && (
    //     <div className="w-11/12 mx-auto">
    //       <h2 className="text-lg md:text-xl font-semibold text-green-400 mb-4">
    //         People you may know
    //       </h2>

    //       <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
    //         {recommendaedAutors.map((author, index) => (
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
    //       Student Coordinators
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
