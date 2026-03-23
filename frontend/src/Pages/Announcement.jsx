import React, { useState, useEffect, useRef } from "react";
// import axiosInstance from 'axiosInstance';
import NavBar from "../ui/NavBar";
import { RiChatDeleteFill, RiDeleteBack2Fill } from "react-icons/ri";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
// import { format } from 'date-fns';
import { Link } from "react-router-dom";
import { HiOutlineUserCircle } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { MdAnnouncement } from "react-icons/md";
import getTimeAgo from "../components/DateCovertion";
import toast from "../components/toaster/toast";

function Announcement() {
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const profile = localStorage.getItem("profile");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState("");
  // const [image, setImage] = useState(null);
  const [deliveredTo, setDeliveredTo] = useState("");
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const [communityOptions, setCommunityOptions] = useState([]);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const imageInputRef = useRef(null);
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    message: "",
    deliveredTo: "",
  });

  // const announcementUrl =
  //   role === "admin"
  //     ? `/blog/author/getAllAnnouncemnet/${email}`
  //     : `/blog/author/${email}`;

  const fetchAllAnnouncement = async () => {
    try {
      const response = await axiosInstance.get(`/blog/author/${email}`);
      // console.log("announcement", response.data.announcement);
      setAnnouncement(response.data.announcement);
    } catch (err) {
      console.log("error", err);
    }
  };

  // fetch authors to derive community options
  const fetchAuthorsForCommunities = async () => {
    try {
      const response = await axiosInstance.get(`/blog/author/${email}`); // adjust endpoint if different
      setCommunityOptions(response.data.community || []);
    } catch (err) {
      console.error("Error fetching authors for communities", err);
      setCommunityOptions([]);
    }
  };

  useEffect(() => {
    fetchAllAnnouncement();
    fetchAuthorsForCommunities();
  }, []);

  // toggle community selection
  const toggleCommunity = (community) => {
    setSelectedCommunities((prev) =>
      prev.includes(community)
        ? prev.filter((c) => c !== community)
        : [...prev, community],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!title.trim()) {
      errors.title = "Announcement title is required.";
    }

    if (!message.trim()) {
      errors.message = "Announcement message is required.";
    }

    if (!deliveredTo.trim()) {
      errors.deliveredTo = "Select recipient group";
    }

    // additional validation for community selection
    if (deliveredTo === "community" && selectedCommunities.length === 0) {
      errors.deliveredTo = "Select at least one community";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // prevent submit
    }

    const email = localStorage.getItem("email");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user", username);
      formData.append("title", title);
      formData.append("message", message);
      formData.append("links", JSON.stringify(links));
      formData.append("deliveredTo", deliveredTo);
      formData.append("email", email);
      formData.append("profile", profile);
      formData.append("techCommName", JSON.stringify(selectedCommunities));
      formData.append("poster", image);
      const response = await axiosInstance.post(
        `/blog/author/announcement/add`,
        // const response = await axiosInstance.post(`/blog/author/announcement/add`,
        formData,
      );

      if (response.status == 201) {
        toast.success('Delivered ', 'New announcement delivered ')
        setTitle("");
        setMessage("");
        setLinks("");
        // setImage(null);
        setDeliveredTo("all");
        setShowAnnouncement(false);
        fetchAllAnnouncement();
        setSelectedCommunities([]);
        setImage("");
        setPreviewImage("");
        if (imageInputRef.current) {
          imageInputRef.current.value = null;
        }
      } else {
        alert("Failed to add announcement: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    const verify = window.confirm("Are you sure you want to delete this announcement?");
    if (!verify) return;
    try {
      const response = await axiosInstance.delete(
        `/blog/author/announcements/${id}`,
      );
      console.log("response", response);
      fetchAllAnnouncement();
    } catch (err) {
      console.log("error", err);
    }
  };

  const onChangeImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);
    }
  };
  const reversedAnnouncements = Array.isArray(announcement)
    ? [...announcement].reverse()
    : [];

  const deleteAllAnouncement = async () => {
    try {
      const response = await axiosInstance.delete(
        `/blog/author/announcementsByAdmin/${email}`,
        { data: { password } },
      );
      if (response.status == 200) {
       
        fetchAllAnnouncement();
        setPassword("");
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setPassword("");
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };
  // console.log("communityOptions", communityOptions);
  // console.log("selectedCommunities", selectedCommunities);
  // console.log("announcements", reversedAnnouncements);
  return (

    <div className="min-h-screen  bg-[#0f172a] text-slate-200">
      <NavBar />
      <div className="min-h-screen">
        {/* ================= HEADER ================= */}
        <div className="w-full">
          <div className="w-full mx-auto px-4 md:px-6 py-8 flex justify-between items-center">
            <div>
              <h1 className="md:text-3xl text-2xl font-bold  flex items-center gap-1 justify-center"><MdAnnouncement className="text-3xl "/> Announcements</h1>
            </div>

            {role !== "student" && (
              <button
                onClick={() => setShowAnnouncement(!showAnnouncement)}
                className="md:px-5 px-3 py-2 md:py-2.5 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm   text-emerald-400 transition"
              >
                {showAnnouncement ? "Close Panel" : "New Broadcast"}
              </button>
            )}
          </div>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="w-full mx-auto px-3 py-2 md:px-6 md:pb-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* ================= LEFT RAIL ================= */}

          <aside className={`${!showAnnouncement?'space-y-8 md:sticky top-7 self-start':'space-y-8 '}`}>
            {/* OVERVIEW */}
            <div className="bg-[#111827] border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-4">
                Overview
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Role</span>
                  <span className="capitalize font-medium">{role}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Total Announcements</span>
                  <span className="font-medium">
                    {announcement?.length > 0 ? announcement.length : "No"}{" "}
                    
                  </span>
                </div>
              </div>
            </div>
            {role !== "student" && (
              <>
                {/* CREATE PANEL */}
                {showAnnouncement && (
                  <div className="bg-[#111827] border border-slate-800  rounded-lg p-6 space-y-6">
                    <h3 className="text-xs uppercase tracking-wide text-slate-400">
                      Create Broadcast
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* TITLE */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300">
                         Subject  Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-[#0f172a] border border-slate-700
                     rounded-md focus:outline-none focus:border-emerald-500/20 text-sm"
                        />
                        {fieldErrors.title && (
                          <p className="text-sm text-red-500 mt-1">
                            {fieldErrors.title}
                          </p>
                        )}
                      </div>

                      {/* MESSAGE */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-[#0f172a] border border-slate-700
                     rounded-md focus:outline-none emerald-scrollbar focus:border-emerald-500/20 text-slate-300 leading-relaxed text-xs md:text-sm"
                        />
                        {fieldErrors.message && (
                          <p className="text-sm text-red-500 mt-1">
                            {fieldErrors.message}
                          </p>
                        )}
                      </div>

                      {/* LINKS */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300">
                          Links
                        </label>

                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={currentLinkTitle}
                            onChange={(e) =>
                              setCurrentLinkTitle(e.target.value)
                            }
                            placeholder="Link Title"
                            className="w-1/2 px-3 py-2 bg-[#0f172a] border border-slate-700
                     rounded-md focus:outline-none focus:border-emerald-500/20 text-xs"
                          />
                          <input
                            type="url"
                            value={currentLinkUrl}
                            onChange={(e) => setCurrentLinkUrl(e.target.value)}
                            placeholder="Link URL"
                            className="w-1/2 px-3 py-2 bg-[#0f172a] border border-slate-700
                     rounded-md focus:outline-none focus:border-emerald-500/20 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                currentLinkTitle.trim() &&
                                currentLinkUrl.trim()
                              ) {
                                const newLink = {
                                  title: currentLinkTitle.trim(),
                                  url: currentLinkUrl.trim(),
                                };
                                setLinks([
                                  ...(Array.isArray(links) ? links : []),
                                  newLink,
                                ]);
                                setCurrentLinkTitle("");
                                setCurrentLinkUrl("");
                              }
                            }}
                            className="px-4 bg-emerald-500/20 w-fit py-1 md:py-2   text-black text-emerald-400  text-xs rounded-md hover:bg-emerald-600/20"
                          >
                            Add
                          </button>
                        </div>

                        {Array.isArray(links) && links.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {links.map((link, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded-md"
                              >
                                <span className="text-xs text-slate-300 truncate">
                                  {link.title}: {link.url}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLinks(
                                      links.filter((_, i) => i !== index),
                                    )
                                  }
                                  className="text-red-400 text-xs ml-2"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* POSTER */}
                      <div className="transition-all duration-300">
                        <label className="block text-sm font-medium text-slate-300">
                          Choose Poster
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          id="image"
                          onChange={onChangeImage}
                          ref={imageInputRef}
                          className="w-full mt-2 text-xs  text-gray-300 
                          file:mr-4 file:px-2 file:py-1 file:rounded-md 
                          file:border-0 file:bg-emerald-500/20 file:hover:bg-emerald-600/20 file:text-emerald-400 
                          file:cursor-pointer"
                        />

                         {!image && (
                <div className="w-full h-32  mt-3 rounded-xl flex items-center justify-center bg-gray-700">
                  <p className="text-gray-400 text-xs">No Poster</p>
                </div>
              )}

                        {image && (
                          <button
                            type="button"
                            onClick={() => {
                              setImage("");
                              setPreviewImage("");
                              if (imageInputRef.current) {
                                imageInputRef.current.value = null;
                              }
                            }}
                            className="text-xs text-yellow-400 underline mt-2"
                          >
                            Remove Selected Image
                          </button>
                        )}

                        {previewImage?.length > 0 && (
                          <div className="mt-3">
                            <img
                              src={previewImage}
                              className="w-full h-32 object-cover rounded-md border border-slate-700"
                            />
                          </div>
                        )}
                      </div>

                      {/* DELIVERED TO */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300">
                          Delivered To <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={deliveredTo}
                          onChange={(e) => setDeliveredTo(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-[#0f172a]
                    border border-slate-700 cursor-pointer rounded-md focus:outline-none focus:border-emerald-500/20 text-sm"
                        >
                          <option value="">Choose recipients</option>
                          <option value="community">Community</option>
                          <option value="coordinators">Coordinators</option>
                          <option value="all">All</option>
                        </select>

                        {fieldErrors.deliveredTo && (
                          <p className="text-sm text-red-500 mt-1">
                            {fieldErrors.deliveredTo}
                          </p>
                        )}
                      </div>

                      {/* COMMUNITY MULTI SELECT */}
                      {deliveredTo === "community" && (
                        <div className="bg-slate-800 border border-gray-700 rounded-md p-4">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-xs text-slate-200 font-medium">
                              Select communities
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedCommunities(
                                    communityOptions.slice(),
                                  )
                                }
                                className="text-xs px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 transition-all duration-300
                           rounded text-emerald-400"
                              >
                                Select all
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedCommunities([])}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-slate-600
                           rounded text-white transition-all duration-300"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {communityOptions.map((comm, idx) => (
                              <label
                                key={idx}
                                className="flex items-center gap-2 text-xs"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCommunities.includes(comm)}
                                  onChange={() => toggleCommunity(comm)}
                                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                />
                                <span className="text-slate-200">{comm}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-500/20
                   text-emerald-400 text-sm  rounded-md transition"
                      >
                        {loading ? "Submitting..." : "Submit Announcement"}
                      </button>
                    </form>
                  </div>
                )}

                {/* DANGER ZONE */}
                {/* {role === "admin" && (
              <div className="bg-[#111827] border border-red-900 rounded-lg p-5">
                <h3 className="text-xs uppercase tracking-wide text-red-400 mb-4">
                  Danger Zone
                </h3>

                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-2 rounded-md
                             bg-red-600 hover:bg-red-500
                             text-white text-sm transition"
                >
                  Delete All Announcements
                </button>
              </div>
            )} */}
              </>
            )}
          </aside>

          {/* ================= MAIN FEED ================= */}
          <main className="space-y-8">
            {announcement.length === 0 && (
              <div className="bg-[#111827] border border-slate-800 rounded-lg p-12 text-center text-slate-500 text-sm">
                No announcements available.
              </div>
            )}

            {reversedAnnouncements.map((item) => (
              <div
                key={item._id}
                className="bg-[#111827] border border-slate-800 rounded-lg p-4 md:p-7 space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2
                    
                     className="text-xl font-semibold text-white">
                      {item.title}
                    </h2>
                    <div className="text-xs text-slate-400 mt-1">
                      {/* {item.timestamp?.slice(0, 10)} */}
                      {getTimeAgo(item.timestamp)}
                    </div>
                  </div>

                <button
                      onClick={() => deleteAnnouncement(item._id)}
                      className="text-slate-500 text-xs md:text-sm hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                </div>

                <div className="md:text-sm text-xs text-slate-300 leading-relaxed">
                  {item.message}
                </div>

                {item.poster && item.poster !== "undefined" && (
                  <div className="rounded-md overflow-hidden border cursor-pointer border-slate-700">
                    <img
                      src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.poster}`}
                      alt=""
                      className="w-full h-48 md:h-[400px] object-contain bg-black"
                      onClick={() =>
                        handleImageClick(
                          `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.poster}`,
                        )
                      }
                    />
                  </div>
                )}

                {/* LINKS */}
                {item.links?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 md:px-3 md:py-1 py-1 rounded-2xl
                                 border border-slate-700
                                 text-xs text-emerald-400
                                 hover:bg-emerald-600/10 transition"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                )}

                {/* VIEW POST SECTION RESTORED */}
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 md:pt-2 md:border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <Link to={`/viewProfile/${item.authorEmail}`}>
                      {item?.profile &&
                      item.profile !== "undefined" ? (
                        <img
                          src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${item.profile}`}
                          alt="Author"
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full object-cover border border-gray-300">
                          <HiOutlineUserCircle className="text-[#786fa6] bg-white rounded-full w-full h-full " />
                        </div>
                      )}
                    </Link>
                    <span>Posted by {item.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
        {/* {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="">
              <img
                src={selectedImage}
                alt="Selected"
                className="max-w-full w-11/12 mx-auto max-h-full"
              />
              <button
                onClick={handleCloseModal}
                className="absolute top-10 right-7"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>
          </div>
        )} */}
         {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                  {/* Modal Container */}
                  <div className="relative max-w-6xl w-full flex items-center justify-center">
                    {/* Image */}
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="
                        max-h-[80vh]
                        w-auto
                        rounded-2xl
                        shadow-2xl
                        border border-gray-700
                        object-contain
                        transition-transform duration-300
                   
                      "
                    />
        
                    {/* Close Button */}
                    <button
                      onClick={handleCloseModal}
                      className="
                        absolute
                        md:-top-4
                        md:-right-4
                        -top-3
                        -right-3
                        md:w-10
                        md:h-10
                        h-8
                        w-8
                        flex
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-900
                        border border-gray-700
                        text-white
                        shadow-lg
                        md:hover:bg-red-500
                        transition-all
                      "
                    >
                      <IoClose className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
      </div>
      <Footer />
    </div>
  );
}

export default Announcement;
