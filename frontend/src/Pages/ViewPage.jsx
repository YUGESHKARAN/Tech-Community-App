import React, { useState, useEffect, useContext, useRef } from "react";
// import user from "../images/blog48.jpg";
import NavBar from "../ui/NavBar";
import getTimeAgo from "../components/DateCovertion.jsx";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import blog1 from "../images/img_not_found2.png";
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
import { IoClose, IoShareSocial } from "react-icons/io5";
import { GlobalStateContext } from "../GlobalStateContext";
import axiosInstance from "../instances/Axiosinstances";
import CommentsBox from "../components/CommentsBox ";
import { FaSquareGithub } from "react-icons/fa6";
import { FaGithub, FaYoutube } from "react-icons/fa";
import userImg from "../images/user.png";
import { SiGooglegemini } from "react-icons/si";
import AITechAssistant from "../components/AITechAssistant.jsx";
import PostDetailSkeleton from "../components/loaders/PostDetailSkeleton.jsx";
import { VscSend } from "react-icons/vsc";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
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
  const [loading, setLoading] = useState(false);
  const commentsRef = useRef(null);
  const [bookMarkId, setBookMarkId] = useState([]);
  const myProfile = localStorage.getItem('profile')

  // Fetch post data
  useEffect(() => {
    const getSinglePost = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
        const postData = response.data.data;
        setSinglePostData(postData);
        setTimeStamp(postData.timestamp);
        setPostId(postData._id);
        setProfile(postData.profile);
      } catch (err) {
        console.error("Error fetching post data", err);
      } finally {
        setLoading(false);
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

    // const newSocket = io(socketUrl, {
    //   transports: ["polling"],
    // });
    const newSocket = io(socketUrl);

    setSocket(newSocket);

    newSocket.emit("registerUser", userEmail);
    newSocket.emit("joinPostRoom", postId);

    // FIXED LIVE COMMENT UPDATE

    const handleNewMessage = (comment) => {
      setMessages((prev) => {
        const cleaned = prev.filter((msg) => {
          if (msg._id?.startsWith("temp")) {
            return !(
              msg.message === comment.message && msg.email === comment.email
            );
          }
          return true;
        });

        const exists = cleaned.some((msg) => msg._id === comment._id);
        if (exists) return cleaned;

        return [...cleaned, comment];
      });
    };

    newSocket.on("newMessage", handleNewMessage);

    // Notifications
    const handleNotification = (notification) => {
      setNotification((prev) => [notification, ...prev]);
    };

    newSocket.on("notification", handleNotification);

    return () => {
      newSocket.off("newMessage", handleNewMessage);
      newSocket.off("notification", handleNotification);
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

    const optimisticMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
      profile:myProfile || "",
    };

    // ✅ OPTIMISTIC UPDATE (instant UI)
    setMessages((prev) => [...prev, optimisticMessage]);

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
          word.startsWith("#") || word.startsWith(" #") ? (
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

  // share post with social media
  const sharePost = async (title, email, id) => {
    try {
      const data = {
        title: title,
        text: title,
        url: `${window.location.origin}/viewpage/${email}/${id}`,
      };
      const response = await navigator.share(data);
      // console.log("post shared successfully", response);
    } catch (err) {
      console.log("error sharing post", err);
    }
  };

  const postLikes = async (postId) => {
    // e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/blog/posts/likes/${email}/${postId}`,
        {
          emailAuthor: userEmail,
        },
      );

      if (response.status === 200) {
        setSinglePostData((prev) => {
          if (!prev) return prev;

          const alreadyLiked = (prev.likes || []).includes(userEmail);

          return {
            ...prev,
            likes: alreadyLiked
              ? prev.likes.filter((like) => like !== userEmail) // unlike
              : [...(prev.likes || []), userEmail], // like
          };
        });
      }
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  const fetchBookmarkIds = async () => {
    try {
      const res = await axiosInstance.get(
        `/blog/posts/bookmarkIds/${userEmail}`,
      );
      // console.log("all bookmark ids", res.data.postIds?.length);
      setBookMarkId(res.data.postIds || []);
    } catch (err) {
      console.log("failed to load bookmark ids");
    }
  };

  useEffect(() => {
    fetchBookmarkIds();
  }, []);

    const addBookMarkPostId = async (postId) => {
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${userEmail}`,
        { postId },
      );

      if (response.status === 200) {
        setBookMarkId((prev) => {
          if (prev.includes(postId)) {
            // toast.success("bookmark removed successfully");
            return prev.filter((id) => id !== postId);
          } else {
            // toast.success("post bookmarked successfully");
            return [...prev, postId];
          }
        });
      }
    } catch (err) {
      console.log("error", err.message);
      // toast.error("unable to bookmark");
    }
  };

  // console.log("email", email);
  // console.log("userEmail", userEmail);

  // console.log("post id", postId);
  // console.log("singlepost data", singlePostData);

  return (
    <div className="w-full min-h-screen bg-gray-900 relative">
      <NavBar />

      {/* Main Container */}
      {!loading && (
        <div className="w-full mx-auto px-3  md:px-8 py-6 pb-20  md:py-10">
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
                  className="w-10 h-10 rounded-full object-cover bg-white border border-neutral-700/40"
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
              className="px-3 py-1.5 rounded-md bg-[#F8EFBA] text-[#182C61] text-xs md:text-sm font-medium"
              // className="md:px-5 px-3 py-2 md:py-2.5 bg-emerald-500/20 hover:bg-emerald-600/20 hover:bg-emerald-500/20
              //              rounded-md text-xs md:text-sm   text-emerald-400 transition"
            >
              Back
            </button>
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-3xl  font-semibold text-white mb-4 md:mb-6">
            {singlePostData.title}
          </h1>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1  lg:grid-cols-6 md:gap-8 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4  ">
              {/* Banner */}
              <div className="md:rounded-xl mb-2 md:mb-6 block md:hidden rounded-md overflow-hidden border border-white/10 bg-black">
                <img
                  src={
                    singlePostData.image
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                      : blog1
                  }
                  alt="Post"
                  className="w-full  md:h-96 objct-cover md:object-contain cursor-pointer"
                  onClick={() =>
                    handleImageClick(
                      singlePostData.image
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                        : blog1,
                    )
                  }
                />
              </div>
              {/* Banner */}
              <div
                className="
                  relative
                  group
                  md:rounded-xl
                
                  rounded-lg
                  overflow-hidden
                  border border-neutral-700/50
                  bg-black
                  shadow-xl
                  hidden md:block
                  cursor-pointer
                  mb-2 md:mb-6
                "
              >
                {/* Image */}
                <img
                  src={
                    singlePostData.image
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                      : blog1
                  }
                  alt="Post"
                  onClick={() =>
                    handleImageClick(
                      singlePostData.image
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                        : blog1,
                    )
                  }
                  className="
                    w-full
                    md:h-[460px]
                    h-[440px]
                    object-cover
                    cursor-pointer
                    transition-transform duration-500
                   
                  "
                />

                {/* Gradient Overlay */}
                <div
                  onClick={() =>
                    handleImageClick(
                      singlePostData.image
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                        : blog1,
                    )
                  }
                  className="
                      absolute inset-0 bg-gradient-to-t cursor-pointer from-black/70 via-black/10 to-transparent
                    "
                />

                {/* Bottom Content */}
                <div
                  className="
                    absolute bottom-0
                    w-full
                    p-4 md:p-6
                    flex
                    justify-between
                    items-end
                  "
                >
                  <div className="space-y-1">
                    {/* <h2 className="text-sm md:text-lg font-semibold text-white line-clamp-2">
                      {singlePostData.title}
                    </h2> */}

                    <p className="text-xs text-gray-300">
                      {singlePostData.category}
                    </p>
                  </div>
                </div>
              </div>


              {/* -----------------AI assistant, likes, share and bookmark block --starts here------------- */}
            <div className="flex items-center  justify-between md:justify-end mt-3 mb-1 md:mb-5">
                {/* AI Assistant */}
                <div className="text-3xl block md:hidden md:text-4xl text-white">
                  <AITechAssistant
                    currentPostId={singlePostData._id}
                    category={singlePostData.category}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center md: gap-2 md:gap-3">
                  {/* Like */}
                  <button
                    onClick={() => postLikes(singlePostData._id)}
                    className="
                      flex items-center gap-2
                      px-3 py-1.5 md:px-4 md:py-2
                      rounded-full
                      bg-gray-900 hover:bg-gray-800 border md:border-neutral-700 border-neutral-700
                      
                      active:scale-95
                      transition
                    "
                  >
                    {(singlePostData.likes || []).includes(userEmail) ? (
                      <BiSolidLike className="text-sm text-emerald-400" />
                    ) : (
                      <BiLike className="text-sm text-emerald-400" />
                    )}
                    <span className="text-xs text-gray-300 font-medium">
                      {singlePostData.likes?.length || " "}
                    </span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={() =>
                      sharePost(
                        singlePostData.title,
                        singlePostData.authoremail,
                        singlePostData._id,
                      )
                    }
                    className="
                  flex items-center gap-2
                  px-3 py-1.5 md:px-4 md:py-2
                  rounded-full
                  bg-gray-900 hover:bg-gray-800 border md:border-neutral-700 border-neutral-700
                  
                  active:scale-95
                  transition
                "
                  >
                    <IoShareSocial className="text-sm text-emerald-400" />
                    <span className="hidden md:inline text-xs text-gray-300">
                      Share
                    </span>
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={() => addBookMarkPostId(singlePostData._id)}
                    className="
                      flex items-center gap-2
                      px-3 py-1.5 md:px-4 md:py-2
                      rounded-full
                      bg-gray-900 hover:bg-gray-800 border md:border-neutral-700 border-neutral-700
                      
                      active:scale-95
                      transition
                    "
                  >
                    {Array.isArray(bookMarkId) &&
                    bookMarkId.includes(singlePostData._id) ? (
                      <PiBookmarksSimpleFill className="text-sm  text-emerald-400" />
                    ) : (
                      <PiBookmarksSimpleLight  className="text-sm  text-emerald-400"/>
                    )}
                    <span className="hidden md:inline text-xs text-gray-300">
                      Save
                    </span>
                  </button>
                </div>
              </div>
              {/* -------------------------------------------------------ends here-------------------- */}
              {/* -------------------------------------------------------ends-------------------- */}

              {/* Description */}
              <div className=" md:border border-neutral-700/40 md:rounded-xl rounded-lg p-1 md:p-2 md:p-5">
                {singlePostData.description && showContent ? (
                  <>
                    <p className="text-sm md:text-sm text-gray-300 leading-relaxed break-words">
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
                    <p className="text-sm md:text-sm text-gray-300 line-clamp-5 leading-relaxed break-words">
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
            {/* <div className="text-4xl block text-white lg:hidden">
              <AITechAssistant
                currentPostId={singlePostData._id}
                category={singlePostData.category}
              />
            </div> */}

            <div className="lg:col-span-2 space-y-2  md:space-y-6  h-fit">
              {/* Personal Assistant */}
              <div className="text-4xl text-white hidden md:block ">
                <AITechAssistant
                  currentPostId={singlePostData._id}
                  category={singlePostData.category}
                />
              </div>

              {/* Documents */}
              {/* bg-gradient-to-b from-slate-900/80 to-slate-800/80 */}
              {(singlePostData.documents?.length > 0 ||
                singlePostData.links?.filter(
                  (link) => (link.title || "").toLowerCase() !== "youtube",
                ).length > 0) && (
                <div className="md:rounded-xl rounded-lg  border border-neutral-700/50  p-6">
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
                            bg-slate-800/60 hover:bg-slate-800
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
                        Resource Links
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
                <div className=" border border-neutral-700/50 rounded-lg md:rounded-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-3">
                    🎥 Video Sources
                  </h3>

                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {singlePostData.links
                      ?.filter(
                        (link) =>
                          (link.title || "").toLowerCase() === "youtube",
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

              {/* Comments */}
              {/* bg-gradient-to-br from-gray-800 to-gray-900 */}
              <div
                className="
                bg-gray-900
                border border-neutral-700/50
                md:rounded-xl
                rounded-lg
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
                  <CommentsBox
                    messages={messages}
                    viewComments={viewComments}
                  />
                </div>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                  placeholder="Write a comment..."
                  className="w-full hidden md:block mt-3 p-2 rounded-lg outline-none bg-gray-900/80 focus:border-neutral-600 border border-neutral-700/70 text-xs md:text-sm"
                />

                <button
                  onClick={postComment}
                  className=" md:px-5 hidden md:block px-3 py-2 md:py-2 bg-emerald-500/20 hover:bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm  text-emerald-400 transition-all duration-300 w-fit mt-3"
                >
                  Post It
                </button>
              </div>

              {/* Fixed Comment Input Bar */}
              <div
                className={`${showAssistant ? "hidden" : "fixed md:hidden bottom-0 left-0 right-0 z-30 bg-gray-900  backdrop-blur-md"}`}
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
                    outline-none bg-gray-900/80 text-white focus:border-white/50 border border-neutral-700/70 text-sm
                  "
                  />

                  {/* Button */}
                  {/* <button
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
                </button> */}

                  <button
                    onClick={postComment}
                    // className="bg-white text-black px-4 rounded-xl text-sm text-base block"
                    className="text-2xl md:text-2xl transition-all duration-300 hover:text-gray-400 text-gray-500 block"
                  >
                    {/* Send */}
                    <VscSend />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <PostDetailSkeleton />}

      {/* <Footer /> */}

      {/* Image Modal */}
      {/* {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <img
            src={selectedImage}
            className="max-w-5xl md:h-96 object-contain w-11/12"
            alt="Preview"
          />
          <IoClose
            onClick={handleCloseModal}
            className="absolute top-6 right-6 text-white text-2xl cursor-pointer"
          />
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
  );
}

export default ViewPage;
