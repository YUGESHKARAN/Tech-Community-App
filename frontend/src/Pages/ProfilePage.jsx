import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiOutlineUserCircle } from "react-icons/hi";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";
import { ImProfile } from "react-icons/im";

import { PiLinkSimpleFill } from "react-icons/pi";
import { MdEdit } from "react-icons/md";
function ProfilePage() {
  const { logout } = useAuth();
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const [author, setAuthor] = useState({});
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [image, setImage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [links, setLinks] = useState([]);
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [linkId, setLinkId] = useState(null); // New state for link ID
  const [profileLinks, setProfileLinks] = useState([]); // New state for profile links
  const [showLinkBox, setShowLinkBox] = useState(false); // State to toggle link input box
  const [customTitle, setCustomTitle] = useState("");
  const [updateButton, setUpdateButton] = useState(false);
  const [posts, setPosts] = useState([]);
  const [password, setPassword] = useState("");

  const deleteAuthor = async () => {
    setShowConfirm(true);
    setLoading(true);

    try {
      const response = await axiosInstance.delete(`/blog/author/${email}`, {
        data: { password },
      });
      toast.success("Account deleted successfully");
      response.status === 200 && logout();
    } catch (err) {
      console.log(err);
      toast.error("unable to delete your account");
    } finally {
      setLoading(false);
      setPassword("");
      setShowConfirm(false);
    }
  };

  const fetchAuthor = async () => {
    try {
      const response = await axiosInstance.get(`/blog/author/${email}`);
      const authorData = response.data;
      setAuthorName(authorData.authorname);
      setAuthorEmail(authorData.email);
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
  }, []);

  const onImageChange = (e) => {
    setImage(e.target.files[0]);
    setUpdateButton(true);

    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      // You can also send this file to backend here if needed
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setLoading(true);
    const formData = new FormData();
    formData.append("authorname", authorName);
    localStorage.setItem("username", authorName);
    formData.append("email", authorEmail);
    formData.append("links", JSON.stringify(links));

    if (image !== "") {
      formData.append("profile", image);
    }

    try {
      const response = await axiosInstance.put(
        `/blog/author/${email}`,
        // `/blog/author/${email}`,
        formData
      );
      // toast.success("Profile updated successfully");
      if (response.status === 201) {
        // navigate("/home"); // Redirect to the homepage
        toast.success("Author data updated successfully");
        setLinks([]);
        fetchAuthor();
        setLinkId(null); // Reset link ID after submission
        setShowLinkBox(false);
      }

      // console.log("links", links);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
      setUpdateButton(false);
    }
  };

  const removeLinks = async (authorEmail, linkId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this link?"
      );
      if (!confirm) {
        setLoading(false);
        return; // If user cancels, exit the function
      }
      const response = await axiosInstance.delete(
        `/blog/author/personalLinks/${authorEmail}/links/${linkId}`
      );
      if (response.status === 200) {
        toast.success("Link removed successfully");
        fetchAuthor();
        setShowLinkBox(false);
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
        <div className="flex items-center justify-between mb-10 border-b border-gray-700 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            My Bio
          </h1>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-500 transition-all duration-200 px-3 py-2 rounded-md shadow-sm"
            title="Delete Account"
          >
            <RiDeleteBin6Line size={20} />
            <span className="hidden md:inline font-medium">Delete Account</span>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-[350px_1fr] gap-12">
          {/* LEFT COLUMN — Profile Overview */}
          <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/60 border border-gray-700 rounded-2xl p-6 text-center shadow-lg sticky top-20 self-start">
            {/* Profile Picture */}
            <div className="relative w-fit mx-auto mb-6">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="rounded-full object-cover border-8 border-orange-500 w-40 h-40"
                />
              ) : author.profile ? (
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

              {/* Edit Overlay */}
              <label
                htmlFor="image"
                className="absolute bottom-3 right-3 bg-white hover:bg-white text-black p-1 px-2 rounded-full shadow-md cursor-pointer"
                title="Change Profile Picture"
              >
                {/* ✎ */}
                <MdEdit />
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-10 md:gap-7 mb-6">
              {author.role === "coordinator" && (
                <div>
                  <p className="text-green-400 text-sm">Followers</p>
                  <p className="text-xl font-semibold">
                    {followers?.length ?? 0}
                  </p>
                </div>
              )}
              {/* {author.role === "coordinator" && (
                <div>
                  <p className="text-green-400 text-sm">Content Published</p>
                  <p className="text-xl font-semibold">
                    {posts.length> 0 ? posts.length: 'Yet to...'}
                  </p>

                </div>
              )} */}
              {author.role === "coordinator" && posts.length > 0 ? (
                <Link to={`/yourposts`}>
                  <p className="text-green-400 mb-1 text-sm">
                    Content Published
                  </p>
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
                    <p className="text-green-400  mb-1 text-sm">
                      Content Published
                    </p>
                    <p className="text-xl font-medium">Yet to...</p>
                  </div>
                )
              )}
              {author.role !== "admin" && (
                <div>
                  <p className="text-green-400 text-sm">Following</p>
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
                  Tech Communities
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
          </div>

          {/* RIGHT COLUMN — Profile Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-gray-900/60 border border-gray-700 rounded-2xl shadow-md p-4 md:p-6 backdrop-blur-md"
          >
            {/* Author Name */}
            <div>
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
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  setUpdateButton(true);
                }}
                className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter author name"
                required
              />
            </div>

            {/* Author Email */}
            <div>
              <label
                htmlFor="authorEmail"
                className="block text-gray-300 font-medium mb-1"
              >
                Author Email
              </label>
              <input
                type="email"
                id="authorEmail"
                value={authorEmail}
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
                value={role}
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

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-1 md:mt-0">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentLinkTitle(link.title);
                              setCurrentLinkUrl(link.url);
                              setLinkId(link._id);
                              setLinks((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                              setShowLinkBox(true);
                              setUpdateButton(true);
                            }}
                            className="p-2  rounded-full text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200"
                            title="Edit link"
                          >
                            <MdEdit className="text-sm md:text-lg" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeLinks(authorEmail, link._id)}
                            className="p-2  rounded-full bg-red-600 hover:bg-red-500 text-white transition-all duration-200"
                            title="Remove link"
                          >
                            <IoIosRemoveCircleOutline className="text-sm md:text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center text-sm mt-4">
                  You can add your LinkedIn, GitHub, portfolio, or other
                  professional profile links here. This helps people connect
                  with you.
                </p>
              )}
            </div>

            {/* Add New Links Section */}
            <div
              className={`${
                profileLinks.length >= 5 && !showLinkBox ? "hidden" : "w-full "
              }`}
            >
              <div className="flex items-center mb-2 justify-between px-1">
                <label className="block font-medium text-sm md:text-base text-gray-300 ">
                  {showLinkBox
                    ? "Edit Link"
                    : ` You can add ${5 - profileLinks.length} ${
                        profileLinks.length >= 1 ? "more" : ""
                      } profile link(s)`}
                </label>

                {currentLinkTitle.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentLinkTitle("");
                      setCurrentLinkUrl("");
                      setShowLinkBox(false);
                    }}
                    className="bg-red-500 md:px-3 px-2 md:text-sm text-xs py-0.5 rounded-md"
                  >
                    Clear
                  </button>
                )}
              </div>
              {/* <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <input
                    type="text"
                    value={currentLinkTitle}
                    onChange={(e) => setCurrentLinkTitle(e.target.value)}
                    placeholder="e.g. GitHub, LinkedIn, Portfolio"
                    className="w-full md:w-1/2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm md:text-base focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="url"
                    value={currentLinkUrl}
                    onChange={(e) => setCurrentLinkUrl(e.target.value)}
                    placeholder="Link URL"
                    className="w-full md:w-1/2 px-3 py-2 bg-gray-800 text-sm md:text-base border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentLinkTitle.trim() && currentLinkUrl.trim()) {
                        const newLink = {
                          title: currentLinkTitle.trim(),
                          url: currentLinkUrl.trim(),
                          id: linkId,
                        };
                        setLinks([...links, newLink]);
                        setCurrentLinkTitle("");
                        setCurrentLinkUrl("");
                      }
                    }}
                    className="md:py-2 md:px-4 px-3 py-1 bg-white text-gray-800 font-bold rounded-md hover:bg-gray-200 transition duration-200"
                  >
                    Add
                  </button>
                </div> */}
              <div className="flex  flex-col w-full  md:justify-between md:flex-row md:items-center gap-3">
                <div className="w-full md:w-1/3">
                  {currentLinkTitle !== "Others" && (
                    <select
                      value={currentLinkTitle}
                      onChange={(e) => {
                        setCurrentLinkTitle(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm md:text-base focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                    >
                      <option value="" disabled>
                        Select Link Title
                      </option>
                      {!profileLinks.some(
                        (l) =>
                          l.title === "GitHub" && currentLinkTitle !== "GitHub"
                      ) && <option value="GitHub">GitHub</option>}
                      {!profileLinks.some(
                        (l) =>
                          l.title === "LinkedIn" &&
                          currentLinkTitle !== "LinkedIn"
                      ) && <option value="LinkedIn">LinkedIn</option>}
                      {!profileLinks.some(
                        (l) =>
                          l.title === "Portfolio" &&
                          currentLinkTitle !== "Portfolio"
                      ) && <option value="Portfolio">Portfolio</option>}
                      {showLinkBox &&
                        profileLinks.map((row) => (
                          <option value={row.title}>{row.title}</option>
                        ))}

                      <option value="Others">Others</option>
                    </select>
                  )}

                  {currentLinkTitle === "Others" && (
                    <input
                      type="text"
                      placeholder="Enter platform name"
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm md:text-base focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                    />
                  )}
                </div>
                <input
                  type="url"
                  value={currentLinkUrl}
                  onChange={(e) => setCurrentLinkUrl(e.target.value)}
                  placeholder="Link URL"
                  className="w-full md:w-1/2 px-3 py-2 bg-gray-800 text-sm md:text-base border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    const titleToUse =
                      currentLinkTitle === "Others"
                        ? customTitle?.trim()
                        : currentLinkTitle.trim();

                    if (titleToUse && currentLinkUrl.trim()) {
                      const newLink = {
                        title: titleToUse,
                        url: currentLinkUrl.trim(),
                        id: linkId,
                      };
                      setLinks([...links, newLink]);
                      setUpdateButton(true);
                      setCurrentLinkTitle("");
                      setCurrentLinkUrl("");
                      setCustomTitle("");
                      setLinkId(null);
                    }
                  }}
                  className="md:py-2 md:px-4 px-3 py-1 bg-white text-gray-800 font-bold rounded-md hover:bg-gray-200 transition duration-200"
                >
                  Add
                </button>
              </div>

              {links.length > 0 && (
                <div className="mt-3 space-y-2">
                  {links.map((link, index) => (
                    <div
                      key={`${link.title}-${index}`}
                      className="flex justify-between items-center bg-gray-700/80 p-3 rounded-md"
                    >
                      <div className="text-sm md:flex md:items-center w-full break-all">
                        <span className="font-bold text-green-400">
                          {link.title}
                        </span>
                        <br />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 md:ml-4 hover:underline break-all"
                        >
                          {link.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setLinks((prevLinks) =>
                            prevLinks.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-500 text-xs ml-2 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading || !updateButton}
                className="py-2 px-6 bg-orange-600 hover:bg-orange-700 text-sm md:text-base text-white md:font-semibold rounded-md transition duration-200"
              >
                {loading ? "Updating..." : "Update My Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 max-w-sm animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
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
                Confirm Deletion
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete your account? <br /> <br />
              All of your data will be permanently deleted and cannot be
              recovered.
            </p>

            <form className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Enter Your Password
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
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={deleteAuthor}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
      <div className="absolute bottom-0 w-full">
        {" "}
        <Footer />
      </div>
    </div>
  );
}

export default ProfilePage;
