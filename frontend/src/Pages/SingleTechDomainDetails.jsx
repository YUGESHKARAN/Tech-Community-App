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
function SingleTechDomainDetails() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);
  const [authors, setAuthors] = useState([]);
  const email = localStorage.getItem("email");
  const { authorCommunity, getAuthorCommunity } = useAuthorCommunity(email);
  const role = localStorage.getItem("role");

  // --------------------------------------------------------------------------------------

  // const authorsDetails = async () => {
  //   try {

  //     const response = await axiosInstance.get(`/blog/author/getAuthorsByDomain/${decodedCategory}`);

  //     setAuthors(response.data.filteredAuthors);
  //   } catch (err) {
  //     console.log("error", err);
  //   }

  // };

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
    console.log("useremail", userEmail);
    try {
      const response = await axiosInstance.put(
        `/blog/author/follow/${userEmail}`,
        { emailAuthor: email },
      );
      if (response.status === 200) {
        console.log(response.data);
        authorsDetails();
      }
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
      if (response.status === 201) {
        await authorsDetails();
        await getAuthorCommunity();
        // window.location.reload();
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  // console.log("authors", authors)

  return (
    // <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 h-auto reltive  ">
    //   <NavBar />

    //    <h1 className="md:text-left text-center w-11/12 mx-auto text-3xl md:text-5xl font-extrabold mt-12 mb-8 bg-gradient-to-r from-blue-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg tracking-wide">
    //       {decodedCategory} - Community
    //     </h1>

    //      <div className="flex justify-center md:justify-start w-11/12 mx-auto mb-8">
    //             {role === "coordinator" || role === "admin" ? (
    //               <button
    //                 type="button"
    //                 className={`${
    //                   authorCommunity.includes(decodedCategory)
    //                     ? "bg-gradient-to-r md:text-xl from-orange-500 to-yellow-400 text-black font-semibold px-5 py-2 rounded-lg shadow-lg hover:opacity-90 transition-all duration-300"
    //                     : "hidden"
    //                 }`}
    //               >
    //                 {authorCommunity.includes(decodedCategory) &&
    //                   "Coordinator"}
    //               </button>
    //             ) : (
    //               <button
    //                 onClick={() => updateCommunity(email, decodedCategory)}
    //                 type="button"
    //                 className={`font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-300
    //             ${
    //               authorCommunity.includes(decodedCategory)
    //                 ? "bg-gradient-to-r from-green-500 to-emerald-400 text-black hover:opacity-90"
    //                 : "bg-gradient-to-r from-gray-200 to-white text-gray-800 hover:from-gray-300 hover:to-white"
    //             } md:text-xl`}
    //               >
    //                 {authorCommunity.includes(decodedCategory)
    //                   ? "Joined"
    //                   : "Join"}
    //               </button>
    //             )}
    //           </div>

    //   <div className="w-11/12 mx-auto min-h-screen flex flex-col items-center mt-12 text-white">
    //     {/* Coordinators Section */}
    //     {authors.filter((author) => author.role === "coordinator").length >
    //       0 && (
    //       // <h2 className="text-center text-2xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
    //       <h2 className="text-center text-2xl md:text-4xl font-bold mb-6 text-white/90">
    //         Coordinators {`(${authors.filter((author) => author.role === "coordinator").length })`}
    //       </h2>
    //     )}

    //     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
    //       {authors
    //         .filter((author) => author.role === "coordinator")
    //         .map((author, index) => (
    //           <div
    //             key={index}
    //             className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-5 flex flex-col items-center"
    //           >
    //             <Link to={`/viewProfile/${author.email}`}>
    //               <img
    //                 src={
    //                   author.profile
    //                     ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
    //                     : user
    //                 }
    //                 alt={author.authorname}
    //                 className="rounded-full bg-white w-24 h-24 object-cover border-2 border-white shadow-md hover:shadow-lg transition-all"
    //               />
    //             </Link>

    //             <h1 className="text-center font-semibold mt-3 text-lg truncate w-full">
    //               {author.authorname}
    //             </h1>
    //             <p className="text-center text-sm text-gray-300 truncate w-full">
    //               {author.email}
    //             </p>

    //             {/* Communities */}
    //             {/* {author.community?.length > 0 && (
    //               <div className="flex flex-wrap justify-center gap-2 mt-3">
    //                 {author.community.map((com, i) => (
    //                   <span
    //                     key={i}
    //                     className="px-3 py-1 text-xs font-medium backdrop-blur-md bg-white/10 text-white rounded-full shadow-sm border border-gray-400"
    //                   >
    //                     {com}
    //                   </span>
    //                 ))}
    //               </div>
    //             )} */}

    //             {/* Social Links */}
    //             {author.profileLinks?.length > 0 && (
    //               <div className="flex justify-center gap-3 mt-4">
    //                 {author.profileLinks.map((link, i) => (
    //                   <Link
    //                     key={i}
    //                     to={link.url}
    //                     title={link.title}
    //                     target="_blank"
    //                   >
    //                     {link.title === "LinkedIn" ? (
    //                       <FaLinkedin className="text-white text-lg hover:text-green-400 transition" />
    //                     ) : link.title === "GitHub" ? (
    //                       <FaSquareGithub className="text-white text-lg hover:text-green-400 transition" />
    //                     ) : link.title === "Portfolio" ? (
    //                       <BsPersonSquare className="text-white text-lg hover:text-green-400 transition" />
    //                     ) : (
    //                       <PiLinkSimpleFill className="text-white text-lg hover:text-green-400 transition" />
    //                     )}
    //                   </Link>
    //                 ))}
    //               </div>
    //             )}

    //             {/* Follow Button */}
    //             {author.email !== email ?
    //             <div className="mt-4">
    //               {author.followers.includes(email) ? (
    //                 <button
    //                   onClick={() => addFollower(author.email)}
    //                   className="px-4 py-1.5 rounded-lg cursor-pointer bg-gradient-to-r from-emerald-200 to-emerald-300 text-gray-800 font-medium text-sm cursor-default shadow-sm border border-white/20"
    //                 >
    //                   Following...
    //                 </button>
    //               ) : (
    //                 <button
    //                   onClick={() => addFollower(author.email)}
    //                   className="px-4 py-1.5 rounded-lg cursor-pointer bg-gradient-to-r from-emerald-300 to-green-400 text-gray-900 font-medium text-sm hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-sm border border-white/20"
    //                 >
    //                   Follow +
    //                 </button>
    //               )}
    //             </div>:
    //                 <div

    //                   className="px-4 mt-4 py-1.5 font-medium rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500"
    //                 >
    //                   Coordinating
    //                 </div>
    //             }
    //           </div>
    //         ))}
    //     </div>

    //     {/* Students Section */}
    //     {authors.filter((author) => author.role === "student").length > 0 && (
    //       <h2 className="text-center mt-16 text-2xl md:text-4xl font-bold text-white/90">
    //         Students  {`(${authors.filter((author) => author.role === "student").length })`}
    //       </h2>
    //     )}

    //     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8 mt-6">
    //       {authors
    //         .filter((author) => author.role === "student")
    //         .map((author, index) => (
    //           <div
    //             key={index}
    //             className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-5 flex flex-col items-center"
    //           >
    //             <Link to={`/viewProfile/${author.email}`}>
    //               <img
    //                 src={
    //                   author.profile
    //                     ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`
    //                     : user
    //                 }
    //                 alt={author.authorname}
    //                 className="rounded-full w-20 bg-white h-20 object-cover border-2 border-white shadow-md hover:shadow-lg transition-all"
    //               />
    //             </Link>

    //             <h1 className="text-center font-semibold mt-3 text-sm md:text-base truncate w-full">
    //               {author.authorname}
    //             </h1>
    //             <p className="text-center text-xs text-gray-300 truncate w-full">
    //               {author.email}
    //             </p>

    //             {/* Social Links */}
    //             {author.profileLinks?.length > 0 && (
    //               <div className="flex justify-center gap-3 mt-3">
    //                 {author.profileLinks.map((link, i) => (
    //                   <Link
    //                     key={i}
    //                     to={link.url}
    //                     title={link.title}
    //                     target="_blank"
    //                   >
    //                     {link.title === "LinkedIn" ? (
    //                       <FaLinkedin className="text-white text-base hover:text-green-400 transition" />
    //                     ) : link.title === "GitHub" ? (
    //                       <FaSquareGithub className="text-white text-base hover:text-green-400 transition" />
    //                     ) : link.title === "Portfolio" ? (
    //                       <BsPersonSquare className="text-white text-base hover:text-green-400 transition" />
    //                     ) : (
    //                       <PiLinkSimpleFill className="text-white text-base hover:text-green-400 transition" />
    //                     )}
    //                   </Link>
    //                 ))}
    //               </div>
    //             )}
    //           </div>
    //         ))}
    //     </div>
    //   </div>

    //   <Footer />
    // </div>

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
                <span className="px-6 py-2 text-lg font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 text-black shadow-lg">
                  Coordinator
                </span>
              )
            ) : (
              <button
                onClick={() => updateCommunity(email, decodedCategory)}
                className={`px-6 py-2 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300
            ${
              authorCommunity.includes(decodedCategory)
                ? "bg-gradient-to-r from-emerald-400 to-green-500 text-black"
                : "bg-gradient-to-r from-gray-200 to-white text-gray-900 hover:opacity-90"
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
                     {author?.posts.length>0 &&   <span>
                          <b className="text-white">{author?.posts.length}</b> Posts
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
