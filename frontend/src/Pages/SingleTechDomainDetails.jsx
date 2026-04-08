import React, { useState, useEffect, useRef } from "react";
import NavBar from "../ui/NavBar";
import blog1 from "../images/blog1.jpg";
import { AiOutlineMail } from "react-icons/ai";
import { GrLinkedin } from "react-icons/gr";
import Footer from "../ui/Footer";
import user from "../images/user.png";
import axiosInstance from "../instances/Axiosinstances";
import { Link } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { PiLinkSimpleFill } from "react-icons/pi";
import { BsPersonSquare } from "react-icons/bs";
import { useParams } from "react-router-dom";
import useAuthorCommunity from "../hooks/useAuthorCommunity";
import CoordinatorGridSkeleton from "../components/loaders/CoordinatorGridSkeleton ";
import StudentGridSkeleton from "../components/loaders/StudentGridSkeleton ";
import toast from "../components/toaster/Toast"
import { getItem } from "../utils/encode";
function SingleTechDomainDetails() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);
  const [authors, setAuthors] = useState([]);
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const { authorCommunity, setAuthorCommunity } = useAuthorCommunity(email);
  // const role = localStorage.getItem("role");
  const role = getItem("role");

  // --------------------------------------------------------------------------------------



  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const authorsDetails = async () => {
    if (fetchingRef.current || loading || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/blog/author/getAuthorsByDomain/${decodedCategory}?page=${page}&limit=20`,
      );

      const newAuthors = response.data.filteredAuthors;

      if (!newAuthors || newAuthors.length === 0) {
        setHasMore(false);
        return;
      }

      setAuthors((prev) => [...prev, ...newAuthors]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    authorsDetails();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    setAuthors([]);
    setPage(1);
    setHasMore(true);
  }, [decodedCategory]);

  // --------------------------------------------------------------------------------------

  const addFollower = async (userEmail) => {
    // console.log("useremail", userEmail);
    try {
      const response = await axiosInstance.put(
        `/blog/author/follow/${userEmail}`,
        { emailAuthor: email },
      );
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
      // if (response.status === 200) {
     
      // }
    } catch (err) {
      console.log("error", err);
    }
  };

  const updateCommunity = async (email, techCommunity) => {
    try {
      const response = await axiosInstance.put(
        "/blog/author/control/updateCommunity",
        {
          email: email,
          techcommunity: techCommunity,
        },
      );
      if (authorCommunity?.includes(techCommunity)) {
        setAuthorCommunity((prev)=>prev.filter((comm)=> comm!== techCommunity))
        // toast.info('Left', 'You have left the community!');
      }
      else{
        setAuthorCommunity((prev) => [...new Set([...prev, techCommunity])]);
        // toast.success('Joined', 'You have joined the community!');
      }
      if (response.status === 201) {
         if (authorCommunity?.includes(techCommunity)) {
        // setAuthorCommunity((prev)=>prev.filter((comm)=> comm!== techCommunity))
        toast.info('Left', 'You have left the community!');
      }
      else{
        // setAuthorCommunity((prev) => [...new Set([...prev, techCommunity])]);
        toast.success('Joined', 'You have joined the community!');
      }
  
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  console.log("authors", authors)

  return (


    <div className="w-full h-auto bg-gray-900  relative text-white">
      <NavBar />

      <div className="min-h-screen">
        {/* Page Header */}
        <section className="w-full px-4 mx-auto mt-7  md:mt-14">
          <h1 className="text-center md:text-left text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            {decodedCategory} Tech Community
          </h1>

          {/* Join / Role Badge */}
          <div className="flex justify-center md:justify-start mt-6">
            {role === "coordinator" || role === "admin" ? (
              authorCommunity.includes(decodedCategory) && (
                <span className="md:px-5 md:py-2 text-xs md:text-base px-3 py-1.5 font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 text-black shadow-lg">
                  Coordinator
                </span>
              )
            ) : (
              <button
                onClick={() => updateCommunity(email, decodedCategory)}
                className={`md:px-5 md:py-2 text-xs md:text-base px-3 py-1.5 font-semibold rounded-xl shadow-lg transition-all duration-300
            ${
              authorCommunity.includes(decodedCategory)
                ? "bg-emerald-600/20 text-emerald-400 "
                    : "bg-white/80 text-gray-800 hover:from-gray-300 "
            }`}
              >
                {authorCommunity.includes(decodedCategory)
                  ? "Joined"
                  : "Join Community"}
              </button>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="w-full px-4 mx-auto mt-10 md:mt-16 space-y-10 md:space-y-20">
          {/* Coordinators */}
          {authors.filter((a) => a.role === "coordinator").length > 0 && (
            <div>
              <h2 className="md:text-left text-center text-2xl md:text-4xl font-bold text-white/90 mb-7 md:mb-10">
                Community Coordinators
                {/* ({authors.filter((a) => a.role === "coordinator").length}) */}
              </h2>

              <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                {authors
                  .filter((a) => a.role === "coordinator")
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
                      <p className="text-xs text-gray-400 truncate">
                        {author.email}
                      </p>

                      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-300">
                        <span>
                          <b className="text-white">
                            {author.followers.length}
                          </b>{" "}
                          Followers
                        </span>
                     {author?.postCount>0 &&   <span>
                          <b className="text-white">{author?.postCount}</b> Posts
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

                      {author.email != email ? (
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
                      ) : (
                        <div className="mt-5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-medium">
                          Coordinating
                        </div>
                      )}
                    </div>
                  ))} 

                {loading && (
                  <div className="col-span-full flex justify-center py-4">
                      <div className="relative flex items-center justify-center">
                        {/* Outer Oval Ring */}
                        <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                        {/* Inner Glow Pulse */}
                        {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                      </div>
                    </div>
                )}

                {!hasMore && (
                  <p className="text-center  col-span-full py-4 text-gray-500">
                    No more coordinators
                  </p>
                )}
              </div>
            </div>
          )}
          {loading &&
            authors.filter((a) => a.role === "coordinator").length == 0 && (
              <div className="col-span-full">
                <h2 className="md:text-left text-center w-full text-2xl md:text-4xl font-bold my-6 text-white">
                  Community Coordinators
                </h2>
                <CoordinatorGridSkeleton />
              </div>
            )}

          {/* Students */}
          {authors.filter((a) => a.role === "student").length > 0 && (
            <div>
              <h2 className="md:text-left text-center text-2xl md:text-4xl font-bold text-white/90 mb-7 md:mb-10">
                Community Members
                {/* ({authors.filter((a) => a.role === "student").length}) */}
              </h2>

              <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2 md:gap-4 mt-8">
                {authors
                  .filter((a) => a.role === "student")
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

                {loading && (
                  <div className="col-span-full flex justify-center py-4">
                      <div className="relative flex items-center justify-center">
                        {/* Outer Oval Ring */}
                        <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

                        {/* Inner Glow Pulse */}
                        {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
                      </div>
                    </div>
                )}

                {!hasMore && (
                  <p className="text-center  col-span-full py-4 text-gray-500">
                    No more members
                  </p>
                )}
              </div>
            </div>
          )}

          {loading &&
            authors.filter((a) => a.role === "student").length == 0 && (
              <div className="col-span-full">
                <h2 className="md:text-left text-center w-full text-2xl md:text-4xl font-bold my-6 text-white">
                  Community Members
                </h2>
                <StudentGridSkeleton />
              </div>
            )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default SingleTechDomainDetails;
