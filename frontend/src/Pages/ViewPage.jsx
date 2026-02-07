import React, { useState, useEffect, useContext, useRef } from "react";
import blog1 from "../images/loading3.gif";
// import user from "../images/blog48.jpg";
import NavBar from "../ui/NavBar";
import getTimeAgo from "../components/DateCovertion.jsx";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../ui/Footer";
import {
  MdOutlineAttachFile,
  MdOutlineDescription,
  MdOutlineInsertComment,
  MdOutlineLibraryBooks,
  MdOutlineLink,
  MdPlayCircleOutline,
  MdVideoLibrary,
} from "react-icons/md";
import { io } from "socket.io-client";
import { ReactTyped } from "react-typed";
import { IoClose } from "react-icons/io5";
import { GlobalStateContext } from "../GlobalStateContext";
import axiosInstance from "../instances/Axiosinstances";
import CommentsBox from "../components/CommentsBox ";
import { FaSquareGithub } from "react-icons/fa6";
import { FaGithub, FaYoutube } from "react-icons/fa";
import userImg from "../images/user.png";
import { SiGooglegemini } from "react-icons/si";
import AITechAssistant from "../components/AITechAssistant.jsx";
function ViewPage() {
  const user = localStorage.getItem("username");
  const userEmail = localStorage.getItem("email");
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [singlePostData, setSinglePostData] = useState([]);
  const [timeStamp, setTimeStamp] = useState("");
  const [postId, setPostId] = useState("");
  const { email, id } = useParams();
  const [viewComments, setViewComments] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [profile, setProfile] = useState("");
  const { notification, setNotification } = useContext(GlobalStateContext);
  const [showAssistant, setShowAssistant] = useState(false);
  const commentsRef = useRef(null);

  // Fetch post data
  useEffect(() => {
    const getSinglePost = async () => {
      try {
        const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
        const postData = response.data.data;
        setSinglePostData(postData);
        setTimeStamp(postData.timestamp);
        setPostId(postData._id);
        setProfile(postData.profile);
      } catch (err) {
        console.error("Error fetching post data", err);
      }
    };
    getSinglePost();
  }, [email, id]);

  // useEffect(() => {
  //   const getComments = async () => {
  //     try {
  //       const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
  //       const comments = response.data.data;
  //       setMessages(comments.messages);
  //     } catch (err) {
  //       console.error("Error fetching comments", err);
  //     }
  //   };
  //   getComments();
  // }, [messages]);

  // useEffect(() => {
  //   const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;
  //   const newSocket = io(`${socketUrl}`, {
  //     transports: ["polling"],
  //   });
  //   setSocket(newSocket);

  //   // Register the user with their email
  //   newSocket.emit("registerUser", userEmail);
  //   newSocket.emit("joinPostRoom", postId);

  //   // Listen for incoming notifications
  //   newSocket.on("notification", (notification) => {
  //     console.log("Received notification:", notification);
  //     setNotification((prevNotifications) => [
  //       notification,
  //       ...prevNotifications,
  //     ]);
  //   });

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, [postId, userEmail]);

  // const postComment = () => {
  //   setViewComments(true);
  //   if (newMessage.trim() === "") return;

  //   const messageData = {
  //     postId,
  //     user,
  //     email: userEmail,
  //     message: newMessage,
  //     url: `${window.location.origin}/viewpage/${singlePostData.authoremail}/${postId}`,
  //     profile: profile,
  //   };

  //   socket.emit("newMessage", messageData);
  //   setNewMessage("");
  // };

  useEffect(() => {
    const getComments = async () => {
      try {
        const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
        setMessages(response.data.data.messages);
      } catch (err) {
        console.error("Error fetching comments", err);
      }
    };

    getComments();
  }, [id, email]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;

    const newSocket = io(socketUrl, {
      transports: ["polling"],
    });

    setSocket(newSocket);

    newSocket.emit("registerUser", userEmail);
    newSocket.emit("joinPostRoom", postId);

    // 🔥 LIVE COMMENT UPDATE
    newSocket.on("newMessage", (comment) => {
      setMessages((prev) => [...prev, comment]);
    });

    // Optional: notifications
    newSocket.on("notification", (notification) => {
      setNotification((prev) => [notification, ...prev]);
    });

    return () => {
      newSocket.off("newMessage");
      newSocket.off("notification");
      newSocket.disconnect();
    };
  }, [postId, userEmail]);

  const postComment = () => {
    if (newMessage.trim() === "") return;

    setViewComments(true);

    const messageData = {
      postId,
      user,
      email: userEmail,
      message: newMessage,
      url: `${window.location.origin}/viewpage/${singlePostData.authoremail}/${postId}`,
      profile,
      createdAt: new Date(), // optional but useful
    };

    // ✅ OPTIMISTIC UPDATE (instant UI)
    setMessages((prev) => [...prev, messageData]);

    // Emit to backend (others will receive via socket)
    socket.emit("newMessage", messageData);

    setNewMessage("");
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const renderTextWithHashtags = (text) => {
    if (!text) return null;

    // Convert visible "\r\n" or "\\n" into real line breaks
    const cleanedText = text.replace(/\\r\\n|\\n|\\r\n/g, "\n");

    return cleanedText.split("\n").map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(/(\s+#\w+)/g).map((word, index) =>
          word.startsWith(" #") ? (
            <span
              key={index}
              className="text-md text-white font-italy font-bold"
            >
              {word}
            </span>
          ) : (
            <React.Fragment key={index}>{word}</React.Fragment>
          ),
        )}
        <br />
      </React.Fragment>
    ));
  };

  // console.log("profile",profile)
  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
    );
    return match ? match[1] : null;
  };
  const youtubeVideo = singlePostData.links?.filter(
    (link) => (link.title || "").toLowerCase() === "youtube",
  );

  const commentWrapperRef = useRef(null);

  useEffect(() => {
    if (viewComments && commentWrapperRef.current) {
      commentWrapperRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start", // 👈 aligns to top of viewport
      });
    }
  }, [viewComments]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative">
      <NavBar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-6 pb-20  md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={`/viewProfile/${email}`}>
              <img
                src={
                  profile
                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`
                    : userImg
                }
                className="w-10 h-10 rounded-full object-cover bg-white border border-white/30"
                alt="Author"
              />
            </Link>
            <div>
              <p className="text-white font-semibold text-sm md:text-base">
                {singlePostData.authorname}
              </p>
              <p className="text-xs text-gray-400">
                {singlePostData.timestamp
                  ? getTimeAgo(singlePostData.timestamp)
                  : "null"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-md bg-[#F8EFBA] text-[#182C61] text-sm font-medium"
          >
            Back
          </button>
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-3xl font-bold text-white mb-6">
          {singlePostData.title}
        </h1>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT COLUMN */}
          <div className="md:col-span-3 space-y-6">
            {/* Banner */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
              <img
                src={
                  singlePostData.image
                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                    : blog1
                }
                alt="Post"
                className="w-full object-cover cursor-pointer"
                onClick={() =>
                  handleImageClick(
                    singlePostData.image
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                      : blog1,
                  )
                }
              />
            </div>

            {/* Description */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
              {singlePostData.description && showContent ? (
                <>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed break-words">
                    {renderTextWithHashtags(singlePostData.description)}
                  </p>
                  <span
                    onClick={() => setShowContent(false)}
                    className="text-xs text-yellow-400 cursor-pointer mt-2 inline-block"
                  >
                    Show Less
                  </span>
                </>
              ) : (
                <>
                  <p className="text-sm md:text-base text-gray-300 line-clamp-5 leading-relaxed break-words">
                    {renderTextWithHashtags(singlePostData.description)}
                  </p>
                  <span
                    onClick={() => setShowContent(true)}
                    className="text-xs text-yellow-400 cursor-pointer mt-2 inline-block"
                  >
                    Show More
                  </span>
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="text-4xl text-white md:hidden">
            <AITechAssistant currentPostId={singlePostData._id} />
          </div>

          <div className="md:col-span-2 space-y-6 md:sticky md:top-24 h-fit">
            {/* Personal Assistant */}
            <div className="text-4xl text-white hidden md:block ">
              <AITechAssistant currentPostId={singlePostData._id} />
            </div>
            {/* Documents */}
            {(singlePostData.documents?.length > 0 ||
              singlePostData.links?.length > 0) && (
              <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/80 to-slate-800/80 p-6 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                  {/* <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600/15 border border-blue-500/20">
                    
                  </div> */}
                  <MdOutlineLibraryBooks className="text-white/90 text-xl" />
                  <h3 className="text-xl font-semibold tracking-wide text-slate-100">
                    Resources
                  </h3>
                </div>

                {/* Documents */}
                {singlePostData.documents?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                      Documents
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {singlePostData.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 px-4 py-2.5
              rounded-xl border border-slate-600/40
              bg-slate-800/60 hover:bg-slate-700/70
              transition"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/70">
                            <MdOutlineDescription className="text-slate-200 text-lg" />
                          </div>

                          <span className="text-xs text-slate-200 max-w-[180px] truncate">
                            {doc.split("-").slice(5).join("-")}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                {singlePostData.links?.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                      External Links
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {singlePostData.links
                        ?.filter(
                          (link) =>
                            (link.title || "").toLowerCase() !== "youtube",
                        )
                        .map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 px-4 py-2.5
                rounded-xl border border-blue-500/20
                bg-gradient-to-r from-blue-600/10 to-blue-400/5
                hover:from-blue-600/20 hover:to-blue-400/10
                transition"
                          >
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/20">
                              {link.title === "GitHub" ? (
                                <FaGithub className="text-blue-300 text-lg" />
                              ) : link.title === "Demo" ? (
                                <MdPlayCircleOutline className="text-blue-300 text-lg" />
                              ) : (
                                <MdOutlineLink className="text-blue-300 text-lg" />
                              )}
                            </div>

                            <span className="text-xs font-medium text-blue-200">
                              {link.title}
                            </span>
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {youtubeVideo?.length > 0 && (
              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
                <h3 className="text-base font-semibold text-white mb-3">
                  🎥 Video Sources
                </h3>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {singlePostData.links
                    ?.filter(
                      (link) => (link.title || "").toLowerCase() === "youtube",
                    )
                    .map((link, index) => {
                      const videoId = getYouTubeId(link.url);
                      if (!videoId) return null;

                      return (
                        <div
                          key={index}
                          className="min-w-[260px] rounded-xl overflow-hidden bg-black border border-gray-700"
                        >
                          <div className="aspect-video">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              allowFullScreen
                              className="w-full h-full"
                              title="YouTube Video"
                            />
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2">
                            <FaYoutube className="text-red-500" />
                            <span className="text-xs text-gray-300 truncate">
                              YouTube Video
                            </span>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-xs text-blue-400"
                            >
                              Open ↗
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* <div
           className='text-4xl text-white cursor-pointer md:hidden'
           >
            <AITechAssistant currentPostId={singlePostData._id}/>
           </div> */}
            {/* Comments */}
            <div
              className="
                bg-gradient-to-br from-gray-800 to-gray-900
                border border-gray-700
                rounded-2xl
                p-5
                text-white
                flex flex-col
                max-h-[65vh]
              "
              ref={commentWrapperRef}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3 shrink-0">
                <h3 className="font-semibold">
                  💬 Comments{" "}
                  {messages.length > 0 && (
                    <span className="text-xs text-gray-400">
                      ({messages.length})
                    </span>
                  )}
                </h3>
                <MdOutlineInsertComment
                  onClick={() => setViewComments(!viewComments)}
                  className="cursor-pointer hover:text-orange-400"
                />
              </div>

              {/* Scrollable comments list */}
              {/* <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                <CommentsBox messages={messages} viewComments={viewComments} />
              </div> */}
              {/* Scrollable comments list */}
              <div
                ref={commentsRef}
                className="flex-1 overflow-y-auto pr-1 scrollbar-hide"
              >
                <CommentsBox messages={messages} viewComments={viewComments} />
              </div>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postComment()}
                placeholder="Write a comment..."
                className="w-full hidden md:block mt-3 p-2 rounded-lg bg-gray-800 border border-gray-600 text-sm"
              />

              <button
                onClick={postComment}
                className=" hidden md:block mt-3 md:w-fit px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-sm font-medium text-gray-900"
              >
                Post Comment
              </button>
            </div>

            {/* Fixed Comment Input Bar */}
            <div
              className={`${showAssistant ? "hidden" : "fixed md:hidden bottom-0 left-0 right-0 z-30 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700 backdrop-blur-md"}`}
            >
              <div className="max-w-7xl mx-auto px-3 md:px-8 py-3 flex items-center gap-3">
                {/* Input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                  placeholder="Write a comment..."
                  className="
                    flex-1
                    px-4 py-2.5
                    rounded-xl
                    bg-gray-800
                    border border-gray-600
                    focus:border-orange-400
                    focus:ring-1 focus:ring-orange-400
                    text-sm text-white
                    placeholder-gray-400
                    transition-all
                  "
                />

                {/* Button */}
                <button
                  onClick={postComment}
                  className="
                      px-5 py-2.5
                      rounded-xl
                      bg-gradient-to-r from-orange-500 to-yellow-500
                      text-sm font-semibold text-gray-900
                      hover:from-orange-600 hover:to-yellow-600
                      shadow-md
                      transition-all
                      whitespace-nowrap
                    "
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer /> */}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <img
            src={selectedImage}
            className="max-w-5xl w-11/12"
            alt="Preview"
          />
          <IoClose
            onClick={handleCloseModal}
            className="absolute top-6 right-6 text-white text-2xl cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}

export default ViewPage;
