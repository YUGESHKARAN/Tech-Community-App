import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import { Link, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiOutlineUserCircle } from "react-icons/hi";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";

import { PiLinkSimpleFill } from "react-icons/pi";

function ViewSingleAuthor() {
  const { email } = useParams();
  const role = localStorage.getItem("role");
  const [author, setAuthor] = useState({});
  const [authorName, setAuthorName] = useState("");
  // const [authorEmail, setAuthorEmail] = useState("");
  const [image, setImage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [ coordEamil, setCoordEmail ] = useState("");
  const [posts, setPosts] = useState([]);
  const authorEmail = localStorage.getItem("email");
  const [profileLinks, setProfileLinks] = useState([]); // New state for profile links

  const fetchAuthor = async () => {
    try {
      const response = await axiosInstance.get(`/blog/author/${email}`);
      const authorData = response.data;
      setAuthorName(authorData.authorname);
      setCoordEmail(authorData.email);
      setAuthor(response.data);
      setImage(response.data.profile);
      setFollowers(authorData.followers);
      setFollowing(authorData.following);
      setProfileLinks(authorData.personalLinks);
      setPosts(authorData.posts);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchAuthor();
  }, [email]);

  const addFollower = async (userEmail) => {
    console.log("useremail", userEmail);
    try {
      const response = await axiosInstance.put(
        `/blog/author/follow/${userEmail}`,
        { emailAuthor: authorEmail }
      );
      if (response.status == 200) {
        // console.log(response.data);
        fetchAuthor();
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br pb-10 md:pb-0 from-gray-900 to-gray-800 text-white">
      <NavBar />

      <div className="container mx-auto px-3 py-12 max-w-7xl">
        {/* Header */}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-[350px_1fr] gap-12">
          {/* LEFT COLUMN — Profile Overview */}
          <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/60 border border-gray-700 rounded-2xl p-6 text-center shadow-lg md:sticky top-20 self-start">
            {/* Profile Picture */}
            <div className="relative w-fit mx-auto mb-6">
              {author.profile ? (
                <img
                  src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                  alt="Profile"
                  className="rounded-full object-cover border-8 border-orange-500 w-40 h-40"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center rounded-full bg-white border-8 border-orange-500 shadow-xl">
                  <HiOutlineUserCircle className="text-[#786fa6] text-9xl" />
                </div>
              )}

              <h1 className="text-center text-xl font-bold mt-2">
                {authorName}
              </h1>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-10 md:gap-7 mb-6">
              {author.role === "coordinator" && (
                <div>
                  <p className="text-green-400  mb-1 text-sm">Followers</p>
                  <p className="text-xl font-semibold">
                    {followers?.length ?? 0}
                  </p>
                </div>
              )}
              {author.role === "coordinator" && posts.length > 0 ? (
                <Link to={`/singleAuthorPosts/${email}`}>
                  <p className="text-green-400 mb-1 text-sm">Content Published</p>
                  <button
                    className="text-sm font-semibold px-4 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 
               text-white shadow-md group-hover:shadow-lg group-hover:scale-105 
               transition-all duration-300"
                  >
                    {posts.length}
                  </button>
                </Link>
              ) : (
                author.role === "coordinator" && (
                  <div>
                    <p className="text-green-400  mb-1 text-sm">Content Published</p>
                    <p className="text-xl font-medium">Yet to...</p>
                  </div>
                )
              )}

              {author.role !== "admin" && (
                <div>
                  <p className="text-green-400  mb-1 text-sm">Following</p>
                  <p className="text-xl font-semibold">
                    {following?.length ?? 0}
                  </p>
                </div>
              )}
            </div>

            {/* Tech Communities */}
            {author.community?.length > 0 && (
              <div className="mt-6">
                <p className="text-orange-400 font-medium mb-3 text-sm uppercase tracking-wide">
                  Tech Communities{" "}
                  {author.role === "coordinator" ? "coordinating" : "joined"}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {author.community.map((com, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow text-white"
                    >
                      {com}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {author.role === "coordinator" && coordEamil !== authorEmail && (
              <div className="mt-4">
                {author.followers.includes(authorEmail) ? (
                  <button
                    onClick={() => addFollower(email)}
                    className="cursor-pointer px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-200 to-emerald-300 text-gray-800 font-medium text-sm cursor-default shadow-sm border border-white/20"
                  >
                    Following...
                  </button>
                ) : (
                  <button
                    onClick={() => addFollower(email)}
                    className="cursor-pointer px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-300 to-green-400 text-gray-900 font-medium text-sm hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-sm border border-white/20"
                  >
                    Follow +
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Profile Form */}
          <div className="space-y-8 bg-gray-900/60 border border-gray-700 rounded-2xl shadow-md p-4 md:p-6 backdrop-blur-md">
            {/* Author Name */}
            {/* <div>
              <label
                htmlFor="authorName"
                className="block text-gray-300 font-medium mb-1"
              >
                Author Name
              </label>
              <input
                type="text"
                id="authorName"
                value={authorName}
                onChange={(e) =>{ setAuthorName(e.target.value); setUpdateButton(true);}}
                className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter author name"
                required
              />
            </div> */}

            {/* Author Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-300 font-medium mb-1"
              >
                Author Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
              />
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-gray-300 font-medium mb-1"
              >
                Author Role
              </label>
              <input
                type="text"
                id="role"
                value={author.role}
                readOnly
                className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
              />
            </div>

            {/* Contact Links Section */}
            <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/70 rounded-xl shadow-md p-2 md:p-6 backdrop-blur-md border border-gray-700">
              <h3 className="text-xl font-semibold text-center text-white mb-4">
                Bio Links
              </h3>

              {profileLinks?.length > 0 ? (
                <div className="space-y-3">
                  {profileLinks.map((link, index) => (
                    <div
                      key={index}
                      className="relative bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 rounded-lg p-3 transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="w-full flex flex-col">
                          <div className="flex gap-2 items-center">
                            {link.title === "LinkedIn" ? (
                              <FaLinkedin className="text-xl" />
                            ) : link.title === "GitHub" ? (
                              <FaSquareGithub className="text-xl" />
                            ) : link.title === "Portfolio" ? (
                              <BsPersonSquare className="text-xl" />
                            ) : (
                              <PiLinkSimpleFill className="text-xl" />
                            )}
                            <p className="text-gray-300 text-sm font-medium mb-1">
                              {link.title}
                            </p>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm font-normal hover:underline break-all"
                          >
                            {authorName}/{link.title}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center text-sm mt-4">
                  No bio links available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
      <div className="absolute bottom-0 w-full">
        {" "}
        <Footer />
      </div>
    </div>
  );
}

export default ViewSingleAuthor;
