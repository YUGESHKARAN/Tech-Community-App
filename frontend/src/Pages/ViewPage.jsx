// import React, { useState, useEffect, useContext, useRef } from "react";
// // import user from "../images/blog48.jpg";
// import NavBar from "../ui/NavBar";
// import getTimeAgo from "../components/DateCovertion.jsx";
// import "react-toastify/dist/ReactToastify.css";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import blog1 from "../images/img_not_found2.png";
// import Footer from "../ui/Footer";
// import empty_state_post from "../assets/empty_state_post.png";
// import {
//   MdOutlineAttachFile,
//   MdOutlineDescription,
//   MdOutlineInsertComment,
//   MdOutlineLibraryBooks,
//   MdOutlineLink,
//   MdPlayCircleOutline,
//   MdVideoLibrary,
// } from "react-icons/md";
// import { io } from "socket.io-client";
// import { ReactTyped } from "react-typed";
// import { IoClose, IoShareSocial } from "react-icons/io5";
// import { GlobalStateContext } from "../GlobalStateContext";
// import axiosInstance from "../instances/Axiosinstances";
// import CommentsBox from "../components/CommentsBox ";
// import { FaSquareGithub } from "react-icons/fa6";
// import { FaGithub } from "react-icons/fa";
// import userImg from "../images/user.png";
// import { SiGoogleassistant, SiGooglegemini } from "react-icons/si";
// import AITechAssistant from "../components/AITechAssistant.jsx";
// import PostDetailSkeleton from "../components/loaders/PostDetailSkeleton.jsx";
// import { VscSend } from "react-icons/vsc";
// import { BiLike, BiSolidLike } from "react-icons/bi";
// import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
// // import useDragSheet from "../hooks/useDragHeader.js";
// import { FaYoutube } from "react-icons/fa6";
// import { getItem } from "../utils/encode.js";
// import RenderTextWithHashtags from "../components/RenderTextWithHashtags.jsx";
// import RenderTextNoMarkdown from "../components/RenderTextNoMarkdown.jsx";
// import logoicon from "../assets/assistant_1.png";
// import { motion, AnimatePresence } from "framer-motion";
// import BadgeIcons from "../components/achievements/BadgeIcons.jsx";
// import formatCount from "../utils/NumberConversion.jsx";
// import toast from "../components/toaster/Toast.jsx";

// function ViewPage() {
//   const user = getItem("username");
//   // const userEmail = localStorage.getItem("email");
//   const userEmail = getItem("email");
//   const [newMessage, setNewMessage] = useState("");
//   const [socket, setSocket] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [singlePostData, setSinglePostData] = useState([]);
//   const [authorName, setAuthorName] = useState(null);
//   const [timeStamp, setTimeStamp] = useState("");
//   const [postId, setPostId] = useState("");
//   const { email, id } = useParams();
//   const [viewComments, setViewComments] = useState(false);
//   const [showContent, setShowContent] = useState(false);
//   const navigate = useNavigate();
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [profile, setProfile] = useState("");
//   const { notification, setNotification } = useContext(GlobalStateContext);
//   const [showAssistant, setShowAssistant] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const commentsRef = useRef(null);
//   const [bookMarkId, setBookMarkId] = useState([]);
//   const myProfile = sessionStorage.getItem("profile");
//   // const { sheetRef, handleDragStart } = useDragSheet(setViewComments);
//   const sheetRef = useRef(null);
//   const [isInputFocused, setIsInputFocused] = useState(false);
//   const [msgLoading, setMsgLoading] = useState(false);
//   const [liveParticipants, setLiveParticipants] = useState(0);
//   // useParams at component top level — not inside useEffect or async function
//   useEffect(() => {
//     const myEmail = getItem("email");

//     // guard: don't count self-views
//     if (!myEmail || !email || !id) return;
//     if (myEmail === email) return;

//     const postViews = async () => {
//       try {
//         await axiosInstance.put(`/blog/posts/views/${email}/${id}`, {
//           emailAuthor: myEmail,
//         });
//       } catch (err) {
//         console.error("Error updating views:", err);
//       }
//     };

//     postViews();
//   }, [email, id]); // fix: add email and id as deps — re-runs if post changes

//   // Fetch post data
//   const getSinglePost = async () => {
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
//       const postData = response.data.data;
//       setSinglePostData(postData);
//       setAuthorName(postData.authorname);
//       setTimeStamp(postData.timestamp);
//       setPostId(postData._id);
//       setProfile(postData.profile);
//     } catch (err) {
//       console.error("Error fetching post data", err);
//       toast.error("Post not found", "unable to fetch the post data");
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     setSinglePostData([]);
//     getSinglePost();
//   }, [email, id]);

//   useEffect(() => {
//     const getComments = async () => {
//       try {
//         setMsgLoading(true);
//         const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
//         setMessages(response.data.data.messages);
//       } catch (err) {
//         console.error("Error fetching comments", err);
//       } finally {
//         setMsgLoading(false);
//       }
//     };

//     getComments();
//   }, [id, email]);

//   useEffect(() => {
//     const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;

//     // const newSocket = io(socketUrl, {
//     //   transports: ["polling"],
//     // });
//     const newSocket = io(socketUrl);

//     setSocket(newSocket);

//     newSocket.emit("registerUser", userEmail);
//     newSocket.emit("joinPostRoom", postId);

//     const handleEditMessage = ({ messageId, message }) => {
//       setMessages((prev) =>
//         prev.map((msg) => (msg._id === messageId ? { ...msg, message } : msg)),
//       );
//     };

//     const handleDeleteMessage = ({ messageId }) => {
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//     };

//     newSocket.on("editMessage", handleEditMessage);
//     newSocket.on("deleteMessage", handleDeleteMessage);

//     // FIXED LIVE COMMENT UPDATE

//     const handleNewMessage = (comment) => {
//       setMessages((prev) => {
//         const cleaned = prev.filter((msg) => {
//           if (msg._id?.startsWith("temp")) {
//             return !(
//               msg.message === comment.message && msg.email === comment.email
//             );
//           }
//           return true;
//         });

//         const exists = cleaned.some((msg) => msg._id === comment._id);
//         if (exists) return cleaned;

//         return [...cleaned, comment];
//       });
//     };

//     newSocket.on("newMessage", handleNewMessage);

//     // Notifications
//     const handleNotification = (notification) => {
//       setNotification((prev) => [notification, ...prev]);
//     };

//     newSocket.on("notification", handleNotification);

//     return () => {
//       newSocket.off("newMessage", handleNewMessage);
//       newSocket.off("editMessage", handleEditMessage);
//       newSocket.off("deleteMessage", handleDeleteMessage);
//       newSocket.off("notification", handleNotification);
//       newSocket.disconnect();
//     };
//   }, [postId, userEmail]);
//   const postComment = () => {
//     if (newMessage.trim() === "") return;
//     setIsInputFocused(false);
//     setViewComments(true);

//     const messageData = {
//       postId,
//       user,
//       email: userEmail,
//       message: newMessage,
//       url: `${window.location.origin}/viewpage/${singlePostData.authoremail}/${postId}`,
//       profile,
//       createdAt: new Date(), // optional but useful
//     };

//     const optimisticMessage = {
//       ...messageData,
//       _id: `temp-${Date.now()}`,
//       profile: myProfile || "",
//     };

//     // ✅ OPTIMISTIC UPDATE (instant UI)
//     setMessages((prev) => [...prev, optimisticMessage]);

//     // Emit to backend (others will receive via socket)
//     socket.emit("newMessage", messageData);

//     setNewMessage("");
//   };

//   useEffect(() => {
//     // Add a guard check
//     if (!socket) {
//       console.warn("Socket not connected yet");
//       return;
//     }

//     socket.on("liveParticipants", (data) => {
//       console.log("Live participants:", data.emails);
//       console.log("Count:", data.count);
//       setLiveParticipants(data.count);
//       // Update your UI
//     });

//     // Cleanup
//     return () => {
//       socket.off("liveParticipants");
//     };
//   }, [socket]);

//   const handleImageClick = (image) => {
//     setSelectedImage(image);
//   };

//   const handleCloseModal = () => {
//     setSelectedImage(null);
//   };

//   const renderTextWithHashtags = (text) => {
//     if (!text) return null;

//     const cleanedText = text
//       .replace(/\\r\\n/g, "\n")
//       .replace(/\\n/g, "\n")
//       .replace(/\\r/g, "\n");

//     return cleanedText.split("\n").map((line, lineIndex) => {
//       const parts = line.split(/(\*\*.*?\*\*|#{1,6}[^\n]+|\s?#\w+)/gm);

//       return (
//         <React.Fragment key={lineIndex}>
//           {parts.map((part, index) => {
//             if (!part) return null;

//             const trimmed = part.trim();

//             // ---------- Markdown Headings ----------
//             // Supports:
//             // ###Heading
//             // ### Heading
//             if (/^#{1,6}/.test(trimmed)) {
//               return (
//                 <span
//                   key={index}
//                   className="font-semibold md:text-xl text-sm text-white"
//                 >
//                   {trimmed.replace(/^#{1,6}\s*/, "")}
//                 </span>
//               );
//             }

//             // ---------- Bold ----------
//             if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
//               return (
//                 <span key={index} className="font-semibold text-white">
//                   {trimmed.replace(/\*\*/g, "")}
//                 </span>
//               );
//             }

//             // ---------- Hashtags ----------
//             if (/^(\s)?#\w+/.test(part)) {
//               return (
//                 <span key={index} className="text-emerald-400 font-medium">
//                   {part}
//                 </span>
//               );
//             }

//             // ---------- Normal ----------
//             return (
//               <React.Fragment key={index}>
//                 {part.replace(/\\\*/g, "*").replace(/\\\\/g, "\\")}
//               </React.Fragment>
//             );
//           })}

//           <br />
//         </React.Fragment>
//       );
//     });
//   };

//   const getYouTubeId = (url) => {
//     const match = url.match(
//       /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
//     );
//     return match ? match[1] : null;
//   };
//   const youtubeVideo = singlePostData.links?.filter(
//     (link) => (link.title || "").toLowerCase() === "youtube",
//   );

//   const commentWrapperRef = useRef(null);

//   useEffect(() => {
//     if (viewComments && commentWrapperRef.current) {
//       commentWrapperRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "start", // 👈 aligns to top of viewport
//       });
//     }
//   }, [viewComments]);

//   // share post with social media
//   const sharePost = async (title, email, id) => {
//     try {
//       const data = {
//         title: title,
//         text: title,
//         url: `${window.location.origin}/viewpage/${email}/${id}`,
//       };
//       const response = await navigator.share(data);
//       // console.log("post shared successfully", response);
//     } catch (err) {
//       console.log("error sharing post", err);
//     }
//   };

//   const postLikes = async (postId) => {
//     // e.preventDefault();
//     try {
//       const response = await axiosInstance.put(
//         `/blog/posts/likes/${email}/${postId}`,
//         {
//           emailAuthor: userEmail,
//         },
//       );

//       if (response.status === 200) {
//         setSinglePostData((prev) => {
//           if (!prev) return prev;

//           const alreadyLiked = (prev.likes || []).includes(userEmail);

//           return {
//             ...prev,
//             likes: alreadyLiked
//               ? prev.likes.filter((like) => like !== userEmail) // unlike
//               : [...(prev.likes || []), userEmail], // like
//           };
//         });
//       }
//     } catch (err) {
//       console.error("Error updating views:", err);
//     }
//   };

//   const fetchBookmarkIds = async () => {
//     try {
//       const res = await axiosInstance.get(
//         `/blog/posts/bookmarkIds/${userEmail}`,
//       );
//       // console.log("all bookmark ids", res.data.postIds?.length);
//       setBookMarkId(res.data.postIds || []);
//     } catch (err) {
//       console.log("failed to load bookmark ids");
//     }
//   };

//   useEffect(() => {
//     fetchBookmarkIds();
//   }, []);

//   const addBookMarkPostId = async (postId) => {
//     try {
//       const response = await axiosInstance.post(
//         `/blog/posts/bookmarkPosts/${userEmail}`,
//         { postId },
//       );

//       if (response.status === 200) {
//         setBookMarkId((prev) => {
//           if (prev.includes(postId)) {
//             // toast.success("bookmark removed successfully");
//             return prev.filter((id) => id !== postId);
//           } else {
//             // toast.success("post bookmarked successfully");
//             return [...prev, postId];
//           }
//         });
//       }
//     } catch (err) {
//       console.log("error", err.message);
//       // toast.error("unable to bookmark");
//     }
//   };

//   const textareaRef = useRef(null);

//   useEffect(() => {
//     const el = textareaRef.current;

//     if (!el) return;

//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 200) + "px";
//   }, [newMessage]);

//   const textareaRef2 = useRef(null);

//   useEffect(() => {
//     const el = textareaRef2.current;

//     if (!el) return;

//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 200) + "px";
//   }, [newMessage]);

//   const textareaRef3 = useRef(null);

//   useEffect(() => {
//     const el = textareaRef3.current;

//     if (!el) return;

//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 200) + "px";
//   }, [newMessage]);

//   // console.log("email", email);
//   // console.log("userEmail", userEmail);

//   // console.log("post id", postId);
//   // console.log("singlepost data", singlePostData);

//   const avatarColor = (name) => {
//     const colors = [
//       "#10b981",
//       "#3b82f6",
//       "#f59e0b",
//       "#ec4899",
//       "#8b5cf6",
//       "#06b6d4",
//       "#f97316",
//     ];
//     return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
//   };

//   const initials = (name) => name?.slice(0, 2).toUpperCase() ?? "??";

//   const [participants, setParticipants] = useState([]);
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [totalParticipants, setTotalParticipants] = useState(0);

//   const getParticipants = async () => {
//     try {
//       const res = await axiosInstance.get(`/blog/posts/participants/${postId}`);

//       if (res.status === 200) {
//         // console.log("participants", res.data);
//         setParticipants(res.data.participants);
//         setTotalParticipants(res.data.count);
//       }
//     } catch (err) {
//       console.log("error", err.message);
//     }
//   };

//   useEffect(() => {
//     getParticipants();
//   }, [postId, messages]);

//   const RoleBadge = ({ role }) => {
//     const styles = {
//       admin: { bg: "#ec489918", color: "#ec4899", label: "Admin" },
//       coordinator: { bg: "#f59e0b18", color: "#f59e0b", label: "Coordinator" },
//       student: { bg: "#3b82f618", color: "#3b82f6", label: "Student" },
//     };
//     const s = styles[role] ?? styles.student;
//     return (
//       <span
//         className="text-[10px] px-2 py-0  border border-amber-400/20 rounded-lg"
//         style={{ backgroundColor: s.bg, color: s.color }}
//       >
//         {s.label}
//       </span>
//     );
//   };

//   const recentlyVisited = async () => {
//     try {
//       const response = await axiosInstance.put("/blog/recentHistory/track", {
//         email: userEmail,
//         itemType: "post",
//         itemId: postId,
//         authorEmail: email,
//         authorName,
//       });

//       if (response.status === 200) {
//         console.log("post trackied", response.data.message);
//       }
//     } catch (err) {
//       console.log("error", err.message);
//     }
//   };

//   useEffect(() => {
//     recentlyVisited();
//   }, [email, userEmail, postId]);

//   // console.log("total participants", totalParticipants)
//   // console.log("participants", participants)

//   return (
//     <div className="w-full min-h-screen flex flex-col justify-between theme relative">
//       <NavBar />

//       {/* Main Container */}
//       {!loading && Object.keys(singlePostData).length > 0 && (
//         <div className="w-full xl:w-11/12 max-w-[1800px] mx-auto md:transition-all md:duration-900  mx-auto px-3  md:px-8 pt-3 pb-20 pt-4 md:pb-10">
//           {/* Header */}
//           <div className="flex items-center justify-between md:mb-0">
//             <div className="flex items-center gap-3">
//               <Link to={`/viewProfile/${email}`}>
//                 <img
//                   src={
//                     profile
//                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`
//                       : userImg
//                   }
//                   className="md:w-10 md:h-10 w-7 h-7 rounded-full object-cover bg-gray-700 border border-neutral-700/40"
//                   alt="Author"
//                 />
//               </Link>
//               <div>
//                 <p className="text-white font-semibold text-[11px] md:text-sm md:text-base">
//                   {singlePostData.authorname}
//                 </p>
//                 <p className="md:text-xs text-[8px] text-gray-400">
//                   {singlePostData.timestamp
//                     ? getTimeAgo(singlePostData.timestamp)
//                     : "null"}
//                 </p>
//               </div>
//             </div>

//             <button
//               onClick={() => navigate(-1)}
//              className="text-emerald-500 px-2 md:px-3  text-xs md:text-sm"
           
//             >
//               ← Back
             
//             </button>
//           </div>

//           {/* Title */}
//           <h1 className="text-lg  pl-1 md:pl-0 md:text-3xl max-w-[370px] md:max-w-4xl  font-semibold text-gray-200 mt-2 mb-1  md:mb-4">
//             {singlePostData.title}
//           </h1>

//           {/* Two Column Layout */}
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
//             {/* LEFT COLUMN */}
//             <div className="lg:col-span-8">
//               <div
//                 className="
//               relative
//               overflow-hidden
//               rounded-xl
              
//               border border-emerald-900
//               bg-[#0d1117]
//               shadow-lg

//               mt-1.5
//               md:mt-0
//               md:mb-6
//             "
//               >
//                 <img
//                   src={
//                     singlePostData.image
//                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
//                       : blog1
//                   }
//                   alt="Post"
//                   onClick={() =>
//                     handleImageClick(
//                       singlePostData.image
//                         ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
//                         : blog1,
//                     )
//                   }
//                   className="
//                     w-full
//                     h-[190px]
//                     sm:h-[220px]
//                     md:h-[400px]
//                     object-cover
//                     cursor-pointer
//                     transition-transform duration-500
                   
//                   "
//                 />

//                 {/* Gradient Overlay */}
//                 <div
//                   onClick={() =>
//                     handleImageClick(
//                       singlePostData.image
//                         ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
//                         : blog1,
//                     )
//                   }
//                   className="
//                       absolute inset-0 bg-gradient-to-t cursor-pointer from-black/70 via-black/10 to-transparent
//                     "
//                 />

//                 {/* Bottom Content */}
//                 <div
//                   className="
//                     absolute bottom-0
//                     w-full
//                     p-4 md:p-6
//                     flex
//                     justify-between
//                     items-end
//                   "
//                 >
//                   <div className="space-y-1 flex items-center justify-between w-full">
//                              <p className="block text-xs font-semibold md:text-lg text-gray-300">
//                       {singlePostData.category}
//                     </p>
//                     <p className=" text-[10px] md:text-xs text-gray-400">
//                       {singlePostData.views?.length > 0 &&
//                         `Views ${formatCount(singlePostData.views.length)}`}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* -----------------AI assistant, likes, share and bookmark block --starts here------------- */}
//               <div
//                 className="w-full mx-auto mt-3 mb-1 md:mb-5"
//               >
//                 {/* Actions */}
//                 <div className="flex items-center md:justify-end justify-between   md:gap-3">
//                   <div className="text-3xl block  md:hidden md:text-4xl text-white">
//                     <AITechAssistant
//                       currentPostId={singlePostData._id}
//                       category={singlePostData.category}
//                       viewComments={viewComments}
//                       setViewComments={setViewComments}
//                     />
//                   </div>

//                   <button
//                     onClick={() => setShowAssistant(!showAssistant)}
//                     className=" md:flex hidden  items-center gap-2  bg-gray-800/50 transition-all duration-300 active:scale-95 md:border  border-neutral-800 md:border-neutral-700 text-gray-300 text-xs px-5 py-[6px] rounded-full shadow-xl"
//                   >
//                     Ask AI
//                     <img
//                       src={logoicon}
//                       className="w-4 h-4  object-contain rounded-full "
//                       alt=""
//                     />
//                   </button>

//                   <button
//                     onClick={() => setViewComments(!viewComments)}
//                     className={`
//                       flex items-center justify-center gap-2
//                       px-3 py-1 md:px-4 md:py-2
//                       rounded-3xl md:rounded-full
//                       bg-gray-800/50  md:border md:border-neutral-700 border-neutral-800
//                       md:hidden
//                       active:scale-95
//                       transition

//                       ${showAssistant ? "pointer-events-none" : ""}`}
//                   >
//                     <MdOutlineInsertComment className="text-xs text-emerald-400" />
//                     <span className=" flex items-center justify-cennter text-[10px] text-gray-300">
//                       Discussions
//                       {messages.length > 0 && (
//                         <span className="text-[10px] ml-2 font-medium bg-[#21262d] text-gray-400 border border-[#30363d] px-2 py-0.5 rounded-full">
//                           {formatCount(messages.length)}
//                         </span>
//                       )}
//                     </span>
//                   </button>

//                   {/* Like */}
//                   <button
//                     onClick={() => postLikes(singlePostData._id)}
//                     className="
//                       flex items-center gap-2
//                       px-3 py-1.5 md:px-4 md:py-2
//                       rounded-3xl md:rounded-full
//                       bg-gray-800/50  md:border md:border-neutral-700 border-neutral-800
                      
//                       active:scale-95
//                       transition
//                     "
//                   >
//                     {(singlePostData.likes || []).includes(userEmail) ? (
//                       <BiSolidLike className="text-sm text-emerald-400" />
//                     ) : (
//                       <BiLike className="text-sm text-emerald-400" />
//                     )}
//                     <span className="text-[10px] md:text-xs text-gray-300 font-medium">
//                       {formatCount(singlePostData.likes?.length) || " "}
//                     </span>
//                   </button>

//                   {/* Share */}
//                   <button
//                     onClick={() =>
//                       sharePost(
//                         singlePostData.title,
//                         singlePostData.authoremail,
//                         singlePostData._id,
//                       )
//                     }
//                     className="
//                   flex items-center gap-2
//                   px-3 py-1.5 md:px-4 md:py-2
//                   rounded-3xl md:rounded-full
//                   bg-gray-800/50  md:border md:border-neutral-700 border-neutral-800
                  
//                   active:scale-95
//                   transition
//                 "
//                   >
//                     <IoShareSocial className="text-sm text-emerald-400" />
//                     <span className="hidden md:inline text-xs text-gray-300">
//                       Share
//                     </span>
//                   </button>

//                   {/* Bookmark */}
//                   <button
//                     onClick={() => addBookMarkPostId(singlePostData._id)}
//                     className="
//                       flex items-center gap-2
//                       px-3 py-1.5 md:px-4 md:py-2
//                       rounded-3xl md:rounded-full
//                       bg-gray-800/50  md:border md:border-neutral-700 border-neutral-800
//                       active:scale-95
//                       transition
//                     "
//                   >
//                     {Array.isArray(bookMarkId) &&
//                     bookMarkId.includes(singlePostData._id) ? (
//                       <PiBookmarksSimpleFill className="text-sm  text-emerald-400" />
//                     ) : (
//                       <PiBookmarksSimpleLight className="text-sm  text-emerald-400" />
//                     )}
//                     <span className="hidden md:inline text-xs text-gray-300">
//                       Save
//                     </span>
//                   </button>
//                 </div>
//               </div>
//               {/* -------------------------------------------------------ends here-------------------- */}

//               {/* Description */}
//               {/* <div className=" md:border border-neutral-700/40 md:rounded-xl rounded-lg p-1 pt-4 md:p-5"> */}
//                <div
//                 className="
//                   md:mt-4
//                   md:rounded-2xl
//                   md:border border-neutral-800
//                   md:bg-neutral-900/40
//                   md:p-5
//                   hidden lg:block 
//                   p-1 
//                 "
//               >
//                 {singlePostData.description &&  (
//                   <>
//                     <p
//                       className="
//                         prose
//                         md:prose-invert
//                         md:max-w-none
                   
//                         md:prose-p:text-gray-300
//                          break-words
//                         md:prose-p:md:leading-6
//                         md:prose-p:text-sm
//                         prose-headings:text-white
//                       "
//                     >
//                       <RenderTextWithHashtags
//                         text={singlePostData.description}
//                       />
//                     </p>
                    
//                   </>
//                 ) }
//               </div>

//               <div
//                 className="
//                   md:mt-4
//                   md:rounded-2xl
//                   md:border border-neutral-800
//                   md:bg-neutral-900/40
//                   md:p-5
//                   lg:hidden
//                   p-1 
//                 "
//               >
//                 {singlePostData.description && showContent ? (
//                   <>
//                     <p
//                       className="
//                         prose
//                         md:prose-invert
//                         md:max-w-none
                   
//                         md:prose-p:text-gray-300
//                          break-words
//                         md:prose-p:md:leading-6
//                         md:prose-p:text-sm
//                         prose-headings:text-white
//                       "
//                     >
//                       <RenderTextWithHashtags
//                         text={singlePostData.description}
//                       />
//                     </p>
//                     <span
//                       onClick={() => setShowContent(false)}
//                       className="text-xs text-yellow-400 cursor-pointer mt-2 inline-block"
//                     >
//                       Show Less
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-sm text-gray-300 line-clamp-5 leading-relaxed break-words">
//                       <RenderTextNoMarkdown
//                         text={singlePostData.description}
//                         className="
//                           text-gray-300
//                           text-[12px]
//                           md:text-[14px]
//                           md:leading-6
//                           tracking-[0.01em]
//                           break-words
//                           md:line-clamp-3
//                           line-clamp-4
//                           md:mt-0
//                           mt-4
//                         "
//                       />
//                     </p>
//                     <span
//                       onClick={() => setShowContent(true)}
//                       className="text-xs text-yellow-400 cursor-pointer mt-2 inline-block"
//                     >
//                       Show More
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* RIGHT COLUMN */}
//             <div
//               className="
//                 lg:col-span-4
//                 lg:sticky
//                 lg:top-4
//                 h-fit
//                 space-y-5
//               "
//             >
   
//               <AnimatePresence mode="wait">
//                 {showAssistant && (
//                   <motion.div
//                     initial={{
//                       opacity: 0,
//                       height: 0,
//                       y: -10,
//                     }}
//                     animate={{
//                       opacity: 1,
//                       height: "auto",
//                       y: 0,
//                     }}
//                     exit={{
//                       opacity: 0,
//                       height: 0,
//                       y: -10,
//                     }}
//                     transition={{
//                       duration: 0.45,
//                       ease: [0.22, 1, 0.36, 1],
//                     }}
//                     className="overflow-hidden h-auto"
//                   >
//                     <div className="hidden md:block">
//                       <AITechAssistant
//                         currentPostId={singlePostData._id}
//                         category={singlePostData.category}
//                       />
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Documents */}
//               {(singlePostData.documents?.length > 0 ||
//                 singlePostData.links?.filter(
//                   (link) => (link.title || "").toLowerCase() !== "youtube",
//                 ).length > 0) && (
//                 <div className="md:rounded-xl rounded-lg  border border-neutral-700/50 p-6">
//                   {/* Header */}
//                   <div className="flex items-center gap-2 mb-2 md:mb-5">
//                     <MdOutlineLibraryBooks className="text-white/90 text-lg md:text-xl" />
//                     <h3 className="md:text-base text-sm font-semibold tracking-wide text-slate-300">
//                       Resources
//                     </h3>
//                   </div>

//                   {/* Documents */}
//                   {singlePostData.documents?.length > 0 && (
//                     <div className="mb-4">
//                       <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
//                         Documents
//                       </p>

//                       <div className="flex flex-wrap gap-3">
//                         {singlePostData.documents.map((doc, index) => (
//                           <a
//                             key={index}
//                             href={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${doc}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="group flex items-center gap-3 px-3 py-1.5 
//                             rounded-xl border border-slate-600/40
//                             bg-slate-800/60 hover:bg-slate-800
//                             transition-all duration-300"
//                           >
//                             <div className="md:w-6 md:h-6 h-5 w-5 flex items-center justify-center rounded-lg bg-slate-700/70">
//                               <MdOutlineDescription className="text-slate-200 text-sm " />
//                             </div>

//                             <span className="text-xs text-slate-200 max-w-[180px] truncate">
//                               {doc.split("-").slice(5).join("-")}
//                             </span>
//                           </a>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* External Links */}
//                   {singlePostData.links?.length > 0 && (
//                     <div>
//                       <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
//                         Resource Links
//                       </p>

//                       <div className="flex flex-wrap gap-3">
//                         {singlePostData.links
//                           ?.filter(
//                             (link) =>
//                               (link.title || "").toLowerCase() !== "youtube",
//                           )
//                           .map((link, index) => (
//                             <a
//                               key={index}
//                               href={link.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="group flex items-center gap-3 px-3 py-1.5
//                             rounded-xl border border-blue-500/20
//                             bg-gradient-to-r from-blue-600/10 to-blue-400/5
//                             hover:from-blue-600/20 hover:to-blue-400/10
//                             transition-all duration-300"
//                             >
//                               <div className="md:w-6 md:h-6 h-5 w-5 flex items-center justify-center rounded-lg bg-blue-600/20">
//                                 {link.title === "GitHub" ? (
//                                   <FaGithub className="text-blue-300 text-sm " />
//                                 ) : link.title === "Demo" ? (
//                                   <MdPlayCircleOutline className="text-blue-300 text-sm " />
//                                 ) : (
//                                   <MdOutlineLink className="text-blue-300 text-sm " />
//                                 )}
//                               </div>

//                               <span className="text-xs font-medium text-blue-200">
//                                 {link.title}
//                               </span>
//                             </a>
//                           ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Videos */}
//               {youtubeVideo?.length > 0 && (
//                 <div className=" md:border border-neutral-700/50 rounded-lg md:rounded-xl pl-2 pt-3  md:p-5">
//                   <h3 className="text-base flex items-center gap-2 md:gap-3  text-slate-300 font-semibold  mb-3">
//                     {/* 🎥 */}
//                     <FaYoutube className="text-slate-300 text-xl" />
//                     Video Source
//                   </h3>

//                   <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
//                     {singlePostData.links
//                       ?.filter(
//                         (link) =>
//                           (link.title || "").toLowerCase() === "youtube",
//                       )
//                       .map((link, index) => {
//                         const videoId = getYouTubeId(link.url);
//                         if (!videoId) return null;

//                         return (
//                           <div
//                             key={index}
//                             className="min-w-[260px] rounded-xl overflow-hidden bg-black border border-gray-700"
//                           >
//                             <div className="aspect-video">
//                               <iframe
//                                 src={`https://www.youtube.com/embed/${videoId}`}
//                                 allowFullScreen
//                                 className="w-full h-full"
//                                 title="YouTube Video"
//                               />
//                             </div>
//                             <div className="flex items-center gap-2 px-3 py-2">
//                               <FaYoutube className="text-red-500" />
//                               <span className="text-xs text-gray-300 truncate">
//                                 YouTube Video
//                               </span>
//                               <a
//                                 href={link.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="ml-auto text-xs text-blue-400"
//                               >
//                                 Open ↗
//                               </a>
//                             </div>
//                           </div>
//                         );
//                       })}
//                   </div>
//                 </div>
//               )}

//               {/* Comments */}
//               <div
//                 className={`
//                    theme-fields-dark
//                   border border-[#30363d]
//                   md:rounded-xl rounded-lg
//                   text-white
//                   md:flex md:flex-col
//                   max-h-[75vh]
//                   overflow-hidden
                  
//                   ${viewComments ? "hidden " : "flex-col"}
//                  md:flex-col
//                   `}
//                 ref={commentWrapperRef}
//               >
//                 {/* Header */}
//                 <div className="flex justify-between items-center px-4 py-3 border-b border-[#21262d] shrink-0">
//                   <div className="flex items-center gap-2">
//                     <h3 className="text-sm font-semibold text-gray-200">
//                       Discussions
//                     </h3>
//                     {messages.length > 0 && (
//                       <span className="text-[10px] font-medium bg-[#21262d] text-gray-400 border border-[#30363d] px-2 py-0.5 rounded-full">
//                         {formatCount(messages.length)}
//                       </span>
//                     )}
//                   </div>

//                   <button
//                     onClick={() => setViewComments(!viewComments)}
//                     className={`p-1.5 rounded-md transition-colors ${
//                       viewComments
//                         ? "bg-emerald-500/20 text-emerald-400"
//                         : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
//                     }`}
//                   >
//                     <MdOutlineInsertComment className="text-base" />
//                   </button>
//                 </div>

//                 {/* Scrollable comments list */}
//                 <div
//                   ref={commentsRef}
//                   className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide"
//                 >
//                   <CommentsBox
//                     messages={messages}
//                     setMessages={setMessages}
//                     msgLoading={msgLoading}
//                     viewComments={viewComments}
//                     userEmail={userEmail}
//                     email={email}
//                     postId={postId}
//                     socket={socket}
//                   />
//                 </div>

//                 {/* Desktop input */}
//                 <div className="hidden md:block px-4 pb-4 pt-2 border-t border-[#21262d] shrink-0">
//                   <div className="flex items-center gap-2 theme border border-[#30363d] rounded-lg px-3 py-2 focus-within:border-emerald-500/50 transition-colors">
//                     <textarea
//                       value={newMessage}
//                       ref={textareaRef}
//                       onChange={(e) => setNewMessage(e.target.value)}
//                       onKeyDown={(e) =>
//                         e.key === "Enter" && !e.shiftKey && postComment()
//                       }
//                       placeholder="Leave a comment..."
//                       className="flex-1 scrollbar-hide bg-transparent max-h-[150px] outline-none text-xs text-gray-300 placeholder-neutral-500 outline-none"
//                       rows={1}
//                     />

//                     <motion.button
//                       onClick={postComment}
//                       whileHover={{
//                         scale: 1.03,
//                         y: -1,
//                       }}
//                       whileTap={{
//                         scale: 0.96,
//                       }}
//                       transition={{
//                         type: "spring",
//                         stiffness: 500,
//                         damping: 30,
//                       }}
//                       className="
//                         shrink-0
//                         px-3 py-1
//                         rounded-md
//                         text-xs
                        
//                         text-emerald-400
//                         bg-emerald-500/20
//                         border border-emerald-500/10
                      
//                         transition-colors
//                         duration-300
//                       "
//                     >
//                       <motion.span
//                         className="block"
//                         whileHover={{ scale: 1.02 }}
//                         transition={{ duration: 0.2 }}
//                       >
//                         Comment
//                       </motion.span>
//                     </motion.button>
//                   </div>
//                 </div>
//               </div>

//               {/* participants profiles */}
//               {participants.length > 0 && (
//                 <div className="flex flex-col p-2 py-2.5 border-t border-neutral-800">
//                   <p className="text-gray-400 text-xs font-semibold">
//                     Participants
//                   </p>
//                   <div className="mt-4 gap-1 flex flex-wrap   items-center ">
//                     {participants?.slice(0, 3).map((p) => (
//                       <Link 
//                       key={p.email}
//                       to={`/viewProfile/${p?.email}`} className="">
//                         {!p.profile ? (
//                           <div
//                             className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-200 shrink-0"
//                             style={{ backgroundColor: avatarColor(p?.name) }}
//                           >
//                             {initials(p?.name)}
//                           </div>
//                         ) : (
//                           <img
//                             src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p?.profile}`}
//                             alt=""
//                             className="w-6 h-6  rounded-full object-cover"
//                           />
//                         )}
//                       </Link>
//                     ))}

//                     {participants.length > 3 && (
//                       <motion.button
//                         whileHover={{ scale: 1.08 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => setShowParticipants(true)}
//                         className="
//                       ml-2
//                       h-7
//                       px-2.5
//                       rounded-full
//                       border border-white/10
//                       bg-white/[0.03]
//                       text-[11px]
//                       font-semibold
//                       text-gray-400
//                       hover:text-white
//                       hover:border-emerald-500/30
//                       transition-all
//                     "
//                       >
//                         +{formatCount(totalParticipants - 3)}
//                       </motion.button>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Mobile: YouTube-style bottom sheet */}
//               <div
//                 className={`
//                   md:hidden fixed inset-0 z-40 transition-all duration-300
//                   ${showAssistant ? "pointer-events-none" : ""}
//                   ${viewComments ? "visible" : "invisible"}
//                 `}
//               >
//                 {/* Backdrop */}
//                 <div
//                   onClick={() => setViewComments(false)}
//                   className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300`}
//                 />

//                 {/* Sheet */}
//                 <div
//                   ref={sheetRef}
//                   className={`
//                     fixed bottom-0 left-0 right-0
//                     theme border-t border-[#30363d]
//                     rounded-t-2xl
//                     flex flex-col
                    
//                     transition-transform duration-300 ease-out
//                     ${viewComments ? "translate-y-0" : "translate-y-full"}
//                   `}
//                   style={{ height: isInputFocused ? "50vh" : "75vh" }}
//                 >
//                   {/* Drag handle */}
//                   <div
//                     className="flex justify-center pt-3 pb-1 shrink-0 cursor-row-resize touch-none"
//                     onClick={() => {
//                       setViewComments(false);
//                     }}
//                   >
//                     <div className="w-9 h-1 rounded-full bg-gray-600" />
//                   </div>

//                   {/* Sheet header */}
//                   <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] shrink-0">
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm font-semibold text-gray-200">
//                         Discussions
//                       </span>
//                       {messages.length > 0 && (
//                         <span className="text-[10px] font-medium bg-[#21262d] text-gray-400 border border-[#30363d] px-2 py-0.5 rounded-full">
//                           {messages.length}
//                         </span>
//                       )}
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         setViewComments(false);
//                       }}
//                       className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
//                     >
//                       <IoClose className="text-base" />
//                     </button>
//                   </div>

//                   {/* Scrollable comments */}
//                   <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
//                     <CommentsBox
//                       messages={messages}
//                       setMessages={setMessages}
//                       msgLoading={msgLoading}
//                       viewComments={viewComments}
//                       userEmail={userEmail}
//                       email={email}
//                       postId={postId}
//                       socket={socket}
//                     />
//                   </div>

//                   {/* Input flush to bottom, no gap */}
//                   <div className="shrink-0 px-3 py-3 md:border-t border-[#21262d] bg-[#0a0f1d]">
//                     <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2.5 focus-within:border-emerald-500/50 transition-colors">
//                       <textarea
//                         value={newMessage}
//                         ref={textareaRef2}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                         onKeyDown={(e) =>
//                           e.key === "Enter" && !e.shiftKey && postComment()
//                         }
//                         placeholder="Leave a comment..."
//                         onFocus={() => setIsInputFocused(true)}
//                         onBlur={() => setIsInputFocused(false)}
//                         onMouseOut={() => setIsInputFocused(false)}
//                         className="flex-1 scrollbar-hide bg-transparent max-h-[150px]  outline-none text-xs text-gray-300 placeholder-neutral-500 outline-none"
//                         rows={1}
//                       />
//                       <button
//                         onClick={postComment}
//                         className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
//                       >
//                         <VscSend className="text-base" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Fixed Mobile Comment Input Bar */}
//               <div
//                 className={`${
//                   showAssistant || viewComments
//                     ? "hidden"
//                     : "fixed md:hidden bottom-0 left-0 right-0 z-30"
//                 } theme `}
//               >
//                 <div className="max-w-7xl mx-auto px-3 py-2.5 flex items-center gap-2.5">
//                   <div className="flex-1 flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 focus-within:border-emerald-500/50 transition-colors">
//                     <textarea
//                       value={newMessage}
//                       ref={textareaRef3}
//                       onChange={(e) => setNewMessage(e.target.value)}
//                       onKeyDown={(e) =>
//                         e.key === "Enter" && !e.shiftKey && postComment()
//                       }
//                       placeholder="Leave a comment..."
//                       className="flex-1 scrollbar-hide bg-transparent min-h-[20px] max-h-[150px] outline-none text-xs text-gray-300 placeholder-neutral-500 outline-none"
//                       rows={1}
//                     />
//                   </div>
//                   <button
//                     onClick={postComment}
//                     className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
//                   >
//                     <VscSend className="text-base" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {loading && <PostDetailSkeleton />}

//       <AnimatePresence>
//         {selectedImage && (
//           <motion.div
//             initial={{
//               opacity: 0,
//               backdropFilter: "blur(0px)",
//             }}
//             animate={{
//               opacity: 1,
//               backdropFilter: "blur(12px)",
//             }}
//             exit={{
//               opacity: 0,
//               backdropFilter: "blur(0px)",
//             }}
//             transition={{
//               duration: 0.25,
//             }}
//             onClick={handleCloseModal}
//             className="
//               fixed inset-0 z-50
//               flex items-center justify-center
//               bg-black/70
//               p-4
//             "
//           >
//             {/* Modal Container */}
//             <motion.div
//               layout
//               onClick={(e) => e.stopPropagation()}
//               initial={{
//                 opacity: 0,
//                 scale: 0.92,
//                 y: 20,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.96,
//                 y: 10,
//               }}
//               transition={{
//                 duration: 0.35,
//                 ease: [0.22, 1, 0.36, 1],
//               }}
//               className="
//                 relative
//                 max-w-6xl
//                 w-full
//                 flex
//                 items-center
//                 justify-center
//               "
//             >
//               {/* Image */}
//               <motion.img
//                 src={selectedImage}
//                 alt="Preview"
//                 initial={{
//                   scale: 0.95,
//                   opacity: 0,
//                 }}
//                 animate={{
//                   scale: 1,
//                   opacity: 1,
//                 }}
//                 exit={{
//                   scale: 0.95,
//                   opacity: 0,
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   ease: [0.22, 1, 0.36, 1],
//                 }}
//                 className="
//                   max-h-[50vh]
//                   w-auto
//                   rounded-2xl
//                   shadow-2xl
//                   border border-gray-700
//                   object-contain
//                 "
//               />

//               {/* Close Button */}
//               <motion.button
//                 onClick={handleCloseModal}
//                 initial={{
//                   opacity: 0,
//                   scale: 0.8,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   scale: 1,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   scale: 0.8,
//                 }}
//                 transition={{
//                   delay: 0.15,
//                   duration: 0.2,
//                 }}
//                 whileHover={{
//                   scale: 1.08,
//                   rotate: 90,
//                 }}
//                 whileTap={{
//                   scale: 0.92,
//                 }}
//                 className="
//                   absolute
//                   md:-top-4
//                   md:-right-4
//                   -top-3
//                   -right-3
//                   md:w-10
//                   md:h-10
//                   h-8
//                   w-8
//                   flex
//                   items-center
//                   justify-center
//                   rounded-full
//                   bg-gray-900
//                   border border-gray-700
//                   text-white
//                   shadow-lg
//                   md:hover:bg-red-500
//                   transition-colors
//                 "
//               >
//                 <IoClose className="text-sm" />
//               </motion.button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {showParticipants && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setShowParticipants(false)}
//               className="
//                 fixed inset-0 z-50
//                 flex items-center justify-center
//                 bg-black/70       
//               "
//             />

//             {/* Panel */}
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.96,
//                 y: 20,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.96,
//                 y: 10,
//               }}
//               transition={{
//                 duration: 0.3,
//                 ease: [0.22, 1, 0.36, 1],
//               }}
//               onClick={() => {
//                 setShowParticipants(false);
//               }}
//               className="
//                 fixed
//                 inset-0
//                 z-[1000]
//                 flex
//                 items-center
//                 justify-center
//                 p-4
//                   "
//             >
//               <motion.div
//                 className="
//                   md:w-[500px]
//                   w-[370px]
//                   max-h-[500px]
//                   rounded-xl
//                   pb-4
//                   bg-[#050b16]
//                   border border-white/10
//                   overflow-hidden
//                 "
//               >
//                 <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
//                   <div>
//                     <h3 className="text-sm font-semibold text-white">
//                       Participants
//                     </h3>

//                     <p className="text-[10px] font-semibold text-gray-500 mt-1">
//                       {formatCount(participants.length)} involved in discussion
//                     </p>
//                   </div>

//                   <button
//                     onClick={() => setShowParticipants(false)}
//                     className="
//                       w-6 h-6 rounded-lg
//                       hover:bg-white/5
//                       text-gray-400
//                       flex items-center justify-center
//                       transition-all
//                     "
//                   >
//                     <IoClose size={18} />
//                   </button>
//                 </div>

//                 <div className="overflow-y-auto max-h-[400px] px-4 p-2 md:p-4">
//                   {participants.map((p, index) => (
//                     <motion.div
//                       key={p.email}
//                     >
//                       <Link
//                         to={`/viewProfile/${p.email}`}
//                         onClick={() => setShowParticipants(false)}
//                         className="
//                           flex items-center gap-2
//                           md:px-3 px-1 py-1.5
//                           rounded-2xl
//                           hover:bg-white/[0.03]
//                           transition-all
//                           group
//                         "
//                       >
//                         {!p.profile ? (
//                           <div
//                             className="
//                               w-6 h-6
//                               rounded-full
//                               flex items-center justify-center
//                              text-[10px] font-semibold 
//                               text-white
//                               shrink-0
//                             "
//                             style={{
//                               backgroundColor: avatarColor(p.name),
//                             }}
//                           >
//                             {initials(p.name)}
//                           </div>
//                         ) : (
//                           <img
//                             src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`}
//                             className="
//                               w-6 h-6
//                               rounded-full
//                               object-cover
//                               shrink-0
//                             "
//                           />
//                         )}

//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-1.5">
//                             <p className="font-semibold text-xs text-wrap line-clamp-1 max-w-[150px] md:max-w-[200px] text-white truncate">
//                               {p.name}
//                             </p>

//                             {/* <RoleBadge role={p.role} /> */}
//                             <p className="text-[10px] font-semibold text-gray-500">
//                               {p.role}
//                             </p>
//                           </div>

//                           {/* <p className="text-xs text-gray-500 truncate mt-0.5">
//                               {p.email}
//                             </p> */}
//                         </div>
//                         <div
//                           className="
//                             text-gray-500
//                             group-hover:text-emerald-400
//                             transition-all
//                           "
//                         >
//                           <BadgeIcons
//                             badges={p?.badges}
//                             parentClass="static -space-x-1.5"
//                             shieldClassName="w-4 h-4"
//                           />
//                         </div>
//                       </Link>
//                     </motion.div>
//                   ))}
//                 </div>
//               </motion.div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {!loading &&
//         (!singlePostData || Object.keys(singlePostData).length === 0) && (
//           <div className="w-full h-[70vh] md:h-[55vh] flex flex-col items-center justify-center">
//             {/* <p className="text-gray-500">Post not found.</p> */}
//             <img className="w-48 md:w-60 " src={empty_state_post} alt="" />
//             <p className="text-gray-400 max-w-xs md:max-w-md text-sm md:text-base flex justify-center items-center text-center">
//               Post not found !
//             </p>
//           </div>
//         )}
//       <Footer />
//     </div>
//   );
// }

// export default ViewPage;

import React, { useState, useEffect, useContext, useRef } from "react";
import NavBar from "../ui/NavBar";
import getTimeAgo from "../components/DateCovertion.jsx";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import blog1 from "../images/img_not_found2.png";
import Footer from "../ui/Footer";
import empty_state_post from "../assets/empty_state_post.png";
import {
  MdOutlineDescription,
  MdOutlineInsertComment,
  MdOutlineLibraryBooks,
  MdOutlineLink,
  MdOutlineOpenInNew,
  MdPlayCircleOutline,
} from "react-icons/md";
import { io } from "socket.io-client";
import { IoClose, IoShareSocial, IoArrowBack } from "react-icons/io5";
import { GlobalStateContext } from "../GlobalStateContext";
import axiosInstance from "../instances/Axiosinstances";
import CommentsBox from "../components/CommentsBox ";
import { FaGithub, FaYoutube } from "react-icons/fa";
import userImg from "../images/user.png";
import AITechAssistant from "../components/AITechAssistant.jsx";
import PostDetailSkeleton from "../components/loaders/PostDetailSkeleton.jsx";
import { VscSend } from "react-icons/vsc";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import { getItem } from "../utils/encode.js";
import RenderTextWithHashtags from "../components/RenderTextWithHashtags.jsx";
import logoicon from "../assets/assistant_1.png";
import { motion, AnimatePresence } from "framer-motion";
import BadgeIcons from "../components/achievements/BadgeIcons.jsx";
import formatCount from "../utils/NumberConversion.jsx";
import toast from "../components/toaster/Toast.jsx";

const S3_BASE = "https://open-access-blog-image.s3.us-east-1.amazonaws.com";

// shared style for the action pills (like / comments / share / save)
const actionBtn = `
  flex items-center justify-center gap-1.5
  h-8 min-w-8 px-2.5 rounded-full
  bg-neutral-900/70 border border-neutral-800
  hover:border-emerald-500/40 hover:bg-neutral-800/70
  active:scale-95 transition-all duration-200
`;

function ViewPage() {
  const user = getItem("username");
  const userEmail = getItem("email");
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [singlePostData, setSinglePostData] = useState([]);
  const [authorName, setAuthorName] = useState(null);
  const [postId, setPostId] = useState("");
  const { email, id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [profile, setProfile] = useState("");
  const { setNotification } = useContext(GlobalStateContext);
  const [loading, setLoading] = useState(false);
  const [bookMarkId, setBookMarkId] = useState([]);
  const myProfile = sessionStorage.getItem("profile");
  const [msgLoading, setMsgLoading] = useState(false);
  const [, setLiveParticipants] = useState(0);

  // ---- UI state ----
  const [showAssistant, setShowAssistant] = useState(false);
  const [viewComments, setViewComments] = useState(false); // mobile comment sheet
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // mobile: overview | resources

  const commentWrapperRef = useRef(null);
  const commentsRef = useRef(null);
  const sheetRef = useRef(null);
  const textareaRef = useRef(null); // desktop input
  const textareaRef2 = useRef(null); // mobile sheet input

  // ---------------------------------------------------------------- views
  useEffect(() => {
    const myEmail = getItem("email");
    if (!myEmail || !email || !id) return;
    if (myEmail === email) return;

    const postViews = async () => {
      try {
        await axiosInstance.put(`/blog/posts/views/${email}/${id}`, {
          emailAuthor: myEmail,
        });
      } catch (err) {
        console.error("Error updating views:", err);
      }
    };
    postViews();
  }, [email, id]);

  // ------------------------------------------------------------ post data
  const getSinglePost = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
      const postData = response.data.data;
      setSinglePostData(postData);
      setAuthorName(postData.authorname);
      setPostId(postData._id);
      setProfile(postData.profile);
    } catch (err) {
      console.error("Error fetching post data", err);
      toast.error("Post not found", "unable to fetch the post data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSinglePostData([]);
    setActiveTab("overview");
    getSinglePost();
  }, [email, id]);

  useEffect(() => {
    const getComments = async () => {
      try {
        setMsgLoading(true);
        const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
        setMessages(response.data.data.messages);
      } catch (err) {
        console.error("Error fetching comments", err);
      } finally {
        setMsgLoading(false);
      }
    };
    getComments();
  }, [id, email]);

  // --------------------------------------------------------------- socket
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.emit("registerUser", userEmail);
    newSocket.emit("joinPostRoom", postId);

    const handleEditMessage = ({ messageId, message }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, message } : msg)),
      );
    };

    const handleDeleteMessage = ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };

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

    const handleNotification = (notification) => {
      setNotification((prev) => [notification, ...prev]);
    };

    newSocket.on("editMessage", handleEditMessage);
    newSocket.on("deleteMessage", handleDeleteMessage);
    newSocket.on("newMessage", handleNewMessage);
    newSocket.on("notification", handleNotification);

    return () => {
      newSocket.off("newMessage", handleNewMessage);
      newSocket.off("editMessage", handleEditMessage);
      newSocket.off("deleteMessage", handleDeleteMessage);
      newSocket.off("notification", handleNotification);
      newSocket.disconnect();
    };
  }, [postId, userEmail]);

  useEffect(() => {
    if (!socket) return;
    socket.on("liveParticipants", (data) => {
      setLiveParticipants(data.count);
    });
    return () => {
      socket.off("liveParticipants");
    };
  }, [socket]);

  // ------------------------------------------------------------- comments
  const isMobileViewport = () =>
    typeof window !== "undefined" && window.innerWidth < 1024;

  const postComment = () => {
    if (newMessage.trim() === "") return;
    setIsInputFocused(false);

    const messageData = {
      postId,
      user,
      email: userEmail,
      message: newMessage,
      url: `${window.location.origin}/viewpage/${singlePostData.authoremail}/${postId}`,
      profile,
      createdAt: new Date(),
    };

    const optimisticMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
      profile: myProfile || "",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    socket.emit("newMessage", messageData);
    setNewMessage("");
  };

  // opens the sheet on mobile, scrolls to the comment box on desktop
  const openComments = () => {
    if (isMobileViewport()) {
      setViewComments(true);
    } else {
      commentWrapperRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // auto-grow both comment textareas
  useEffect(() => {
    [textareaRef.current, textareaRef2.current].forEach((el) => {
      if (!el) return;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    });
  }, [newMessage, viewComments]);

  // ----------------------------------------------------------- misc actions
  const handleImageClick = (image) => setSelectedImage(image);
  const handleCloseModal = () => setSelectedImage(null);

  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
    );
    return match ? match[1] : null;
  };

  const youtubeVideos =
    singlePostData.links?.filter(
      (link) => (link.title || "").toLowerCase() === "youtube",
    ) || [];
  const resourceLinks =
    singlePostData.links?.filter(
      (link) => (link.title || "").toLowerCase() !== "youtube",
    ) || [];
  const documents = singlePostData.documents || [];
  const hasResources =
    documents.length > 0 || resourceLinks.length > 0 || youtubeVideos.length > 0;

  const sharePost = async (title, email, id) => {
    try {
      await navigator.share({
        title,
        text: title,
        url: `${window.location.origin}/viewpage/${email}/${id}`,
      });
    } catch (err) {
      console.log("error sharing post", err);
    }
  };

  const postLikes = async (postId) => {
    try {
      const response = await axiosInstance.put(
        `/blog/posts/likes/${email}/${postId}`,
        { emailAuthor: userEmail },
      );
      if (response.status === 200) {
        setSinglePostData((prev) => {
          if (!prev) return prev;
          const alreadyLiked = (prev.likes || []).includes(userEmail);
          return {
            ...prev,
            likes: alreadyLiked
              ? prev.likes.filter((like) => like !== userEmail)
              : [...(prev.likes || []), userEmail],
          };
        });
      }
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  const fetchBookmarkIds = async () => {
    try {
      const res = await axiosInstance.get(
        `/blog/posts/bookmarkIds/${userEmail}`,
      );
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
        setBookMarkId((prev) =>
          prev.includes(postId)
            ? prev.filter((id) => id !== postId)
            : [...prev, postId],
        );
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  // ----------------------------------------------------------- participants
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

  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(0);

  const getParticipants = async () => {
    try {
      const res = await axiosInstance.get(`/blog/posts/participants/${postId}`);
      if (res.status === 200) {
        setParticipants(res.data.participants);
        setTotalParticipants(res.data.count);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getParticipants();
  }, [postId, messages]);

  // -------------------------------------------------------- recent history
  const recentlyVisited = async () => {
    try {
      await axiosInstance.put("/blog/recentHistory/track", {
        email: userEmail,
        itemType: "post",
        itemId: postId,
        authorEmail: email,
        authorName,
      });
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    recentlyVisited();
  }, [email, userEmail, postId]);

  // -------------------------------------------------------------- derived
  const imageUrl = singlePostData.image
    ? `${S3_BASE}/${singlePostData.image}`
    : blog1;
  const isLiked = (singlePostData.likes || []).includes(userEmail);
  const isBookmarked =
    Array.isArray(bookMarkId) && bookMarkId.includes(singlePostData._id);

  // TODO: show only when the resources contain an application link, and
  // point handleTryOut at that link. Placeholder for now.
  const [showTryOut, setTryOut] = useState(false);
  const handleTryOut = () => {
    // TODO: open the application / demo link
    navigate(appUrl)
  };

  // console.log("post data", singlePostData)

  // ============================================================ SECTIONS

  /* ---------- Overview (markdown description) ---------- */
  const overviewSection = (
    <div>
      {singlePostData.description ? (
        <div
          className="
            prose prose-invert max-w-none break-words
            prose-headings:text-white
            prose-p:text-gray-300 prose-p:text-[13px] md:prose-p:text-[15px] prose-p:leading-7
            prose-a:text-emerald-400
          "
        >
          <RenderTextWithHashtags text={singlePostData.description} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No description provided.</p>
      )}
    </div>
  );

  /* ---------- Resources (documents, links, videos) ---------- */
  const resourcesSection = (
    <div>
      {!hasResources && (
        <p className="text-xs text-gray-500">No resources attached.</p>
      )}

      {documents.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
            Documents
          </p>
          <div className="flex flex-col gap-2 lg:grid lg:grid-cols-3">
            {documents.map((doc, index) => (
              <a
                key={index}
                href={`${S3_BASE}/${doc}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-600/40 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500/60 transition-all duration-300"
              >
                <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-slate-700/70">
                  <MdOutlineDescription className="text-slate-200 text-sm" />
                </div>
                <span className="text-xs text-slate-200 truncate flex-1">
                  {doc.split("-").slice(5).join("-")}
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors">
                  Open ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {resourceLinks.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
            Links
          </p>
          <div className="flex flex-wrap gap-2 lg:grid lg:grid-cols-4">
            {resourceLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 px-3 py-2 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-blue-400/5 hover:from-blue-600/20 hover:to-blue-400/10 transition-all duration-300"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-600/20">
                  {link.title === "GitHub" ? (
                    <FaGithub className="text-blue-300 text-sm" />
                  ) : link.title === "Demo" ? (
                    <MdPlayCircleOutline className="text-blue-300 text-sm" />
                  ) : (
                    <MdOutlineLink className="text-blue-300 text-sm" />
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

      {youtubeVideos.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <FaYoutube className="text-red-500 text-sm" />
            Video Source
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:overflow-x-auto lg:snap-x lg:snap-mandatory lg:pb-2 scrollbar-hide">
            {youtubeVideos.map((link, index) => {
              const videoId = getYouTubeId(link.url);
              if (!videoId) return null;
              return (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden bg-black border border-neutral-800 lg:w-[360px] lg:shrink-0 lg:snap-start"
                >
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      allowFullScreen
                      className="w-full h-full"
                      title={`YouTube Video ${index + 1}`}
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
    </div>
  );

  /* ---------- Main card: tabs live inside the card (desktop + mobile) ---------- */
  const tabBtn = (key, label, Icon) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={`flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 -mb-px transition-colors ${
        activeTab === key
          ? "border-emerald-400 text-emerald-300"
          : "border-transparent text-gray-400 hover:text-gray-200"
      }`}
    >
      <Icon className="text-base" />
      {label}
    </button>
  );

  const mainCard = (
    <section className="rounded-lg md:border border-neutral-800 bg-neutral-900/40 overflow-hidden">
      <div className="flex items-center md:border-b border-neutral-800  md:px-3">
        {tabBtn("overview", "Overview", MdOutlineDescription)}
        {tabBtn("resources", "Resources", MdOutlineLibraryBooks)}

        {/* mobile only: opens the comment sheet */}
        <button
          onClick={() => setViewComments(true)}
          className="lg:hidden ml-auto flex items-center gap-1.5 px-3 py-3 text-xs font-medium text-gray-400"
        >
          <MdOutlineInsertComment className="text-base" />
          Comments
          {messages.length > 0 && (
            <span className="text-[10px] bg-[#21262d] text-gray-400 border border-[#30363d] px-1.5 rounded-full">
              {formatCount(messages.length)}
            </span>
          )}
        </button>
      </div>

      <div className="p-2 md:p-6 lg:p-7">
        {activeTab === "overview" ? overviewSection : resourcesSection}
      </div>
    </section>
  );

  /* ---------- Participants strip ---------- */
  const participantsSection =
    participants.length > 0 ? (
      <div 
      // className="rounded-2xl border border-neutral-800 bg-neutral-900/40 px-4 py-3"
      className="rounded-2xl px-4"
      >
        <p className="text-gray-400 text-xs font-semibold">Participants</p>
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {participants.slice(0, 3).map((p) => (
            <Link key={p.email} to={`/viewProfile/${p?.email}`}>
              {!p.profile ? (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-200 shrink-0"
                  style={{ backgroundColor: avatarColor(p?.name) }}
                >
                  {initials(p?.name)}
                </div>
              ) : (
                <img
                  src={`${S3_BASE}/${p?.profile}`}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
              )}
            </Link>
          ))}

          {participants.length > 3 && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowParticipants(true)}
              className="ml-2 h-7 px-2.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-semibold text-gray-400 hover:text-white hover:border-emerald-500/30 transition-all"
            >
              +{formatCount(totalParticipants - 3)}
            </motion.button>
          )}
        </div>
      </div>
    ) : null;

  /* ---------- Comment input (render fn, not a component → no remount) ---------- */
  const renderCommentInput = (ref, { mobile = false } = {}) => (
    <div
      className={`flex items-end gap-2 border border-[#30363d] focus-within:border-emerald-500/50 transition-colors ${
        mobile ? "bg-[#161b22] rounded-xl px-3 py-2.5" : "theme rounded-lg px-3 py-2"
      }`}
    >
      <textarea
        value={newMessage}
        ref={ref}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            postComment();
          }
        }}
        onFocus={mobile ? () => setIsInputFocused(true) : undefined}
        onBlur={mobile ? () => setIsInputFocused(false) : undefined}
        placeholder="Leave a comment..."
        rows={1}
        className="flex-1 scrollbar-hide bg-transparent max-h-[150px] outline-none text-xs text-gray-300 placeholder-neutral-500 resize-none"
      />
      {mobile ? (
        <button
          onClick={postComment}
          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
        >
          <VscSend className="text-base" />
        </button>
      ) : (
        <motion.button
          onClick={postComment}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="shrink-0 px-3 py-1 rounded-md text-xs text-emerald-400 bg-emerald-500/20 border border-emerald-500/10"
        >
          Comment
        </motion.button>
      )}
    </div>
  );

  /* ---------- Desktop comment card ---------- */
  const desktopComments = (
    <section
      ref={commentWrapperRef}
      className="hidden lg:flex flex-col theme-fields-dark border border-[#30363d] rounded-lg text-white max-h-[60vh] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262d] shrink-0">
        <MdOutlineInsertComment className="text-emerald-400 text-base" />
        <h3 className="text-sm font-semibold text-gray-200">Discussions</h3>
        {messages.length > 0 && (
          <span className="text-[10px] font-medium bg-[#21262d] text-gray-400 border border-[#30363d] px-2 py-0.5 rounded-full">
            {formatCount(messages.length)}
          </span>
        )}
      </div>

      <div
        ref={commentsRef}
        className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide"
      >
        {socket && (
          <CommentsBox
            messages={messages}
            setMessages={setMessages}
            msgLoading={msgLoading}
            viewComments={true}
            userEmail={userEmail}
            email={email}
            postId={postId}
            socket={socket}
          />
        )}
      </div>

      <div className="px-4 pb-4 pt-3 border-t border-[#21262d] shrink-0">
        {renderCommentInput(textareaRef)}
      </div>
    </section>
  );

  const [appUrl, setAppUrl] = useState("")

  const getUrl = (links=[]) => {
    const link = links.find(r=> r.title == "Try It");
    if(link){
      setTryOut(true)
      setAppUrl(link.url)
    }
  }

  useEffect(()=>{
    if(singlePostData?.links){
      getUrl(singlePostData.links)
    }
  },[singlePostData, email])

console.log(singlePostData)

  // ================================================================ RENDER
  return (
    <div className="w-full min-h-screen flex flex-col justify-between theme relative">
      <NavBar />

      {!loading && Object.keys(singlePostData).length > 0 && (
        <div className="w-full xl:w-11/12 max-w-[1800px] mx-auto px-3 md:px-8 pt-3 md:pt-4 pb-28 lg:pb-12">
          {/* ===================== HEADER ===================== */}
          <header className="shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="hidden lg:flex mb-2 items-center gap-1.5 text-emerald-500 hover:text-emerald-400 text-xs transition-colors"
            >
              <IoArrowBack /> Back
            </button>

            <div className="relative isolate overflow-hidden flex flex-col lg:flex-row gap-3 lg:gap-5 -mx-3 -mt-3 md:-mx-8 md:-mt-4 lg:mx-0 lg:mt-0 rounded-none lg:rounded-2xl border-0 border-b border-white/10 lg:border lg:border-neutral-800 bg-[#0d1117] lg:bg-gradient-to-br lg:from-neutral-900/60 lg:to-[#0d1117] p-3 md:p-4">
              {/* Mobile only: back button inside the header */}
              <button
                onClick={() => navigate(-1)}
                className="lg:hidden self-start flex items-center gap-1.5 text-emerald-400 text-xs"
              >
                <IoArrowBack /> Back
              </button>

              {/* Mobile only: thumbnail-tinted background (blurred image + dark fade) */}
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className="lg:hidden pointer-events-none absolute inset-0 -z-20 h-full w-full scale-150 object-cover blur-3xl saturate-150 opacity-70"
              />
              <div className="lg:hidden pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-[#0d1117]/60 to-[#0d1117]/95" />

              {/* Thumbnail */}
              <div className="group relative w-full lg:w-[220px] shrink-0 overflow-hidden rounded-xl border border-emerald-900/60 bg-[#0d1117]">
                <img
                  src={imageUrl}
                  alt="Post thumbnail"
                  onClick={() => handleImageClick(imageUrl)}
                  className="w-full aspect-video object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              {/* Details */}
              <div className="relative flex-1 min-w-0 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {singlePostData.category && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-300">
                        {singlePostData.category}
                      </span>
                    )}
                    {singlePostData.views?.length > 0 && (
                      <span className="text-[10px] text-gray-500">
                        {formatCount(singlePostData.views.length)} views
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-white break-words line-clamp-3 lg:line-clamp-2">
                    {singlePostData.title}
                  </h1>
                </div>

                {/* author + actions on one row */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <Link
                    to={`/viewProfile/${email}`}
                    className="flex items-center gap-2 group min-w-0"
                  >
                    <img
                      src={profile ? `${S3_BASE}/${profile}` : userImg}
                      className="w-7 h-7 shrink-0 rounded-full object-cover bg-gray-700 border border-neutral-700/60 group-hover:border-emerald-500/50 transition-colors"
                      alt="Author"
                    />
                    <span className="text-xs font-semibold text-white truncate">
                      {singlePostData.authorname}
                      
                    </span>
                   
                    <span className="text-[11px] text-gray-500 shrink-0">
                      · {singlePostData.timestamp ? getTimeAgo(singlePostData.timestamp) : ""}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => postLikes(singlePostData._id)}
                      className={actionBtn}
                      aria-label="Like"
                      title="Like"
                    >
                      {isLiked ? (
                        <BiSolidLike className="text-base text-emerald-400" />
                      ) : (
                        <BiLike className="text-base text-emerald-400" />
                      )}
                      {singlePostData.likes?.length > 0 && (
                        <span className="text-[11px] text-gray-300 font-medium">
                          {formatCount(singlePostData.likes.length)}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        sharePost(
                          singlePostData.title,
                          singlePostData.authoremail,
                          singlePostData._id,
                        )
                      }
                      className={actionBtn}
                      aria-label="Share"
                      title="Share"
                    >
                      <IoShareSocial className="text-base text-emerald-400" />
                    </button>

                    <button
                      onClick={() => addBookMarkPostId(singlePostData._id)}
                      className={actionBtn}
                      aria-label={isBookmarked ? "Saved" : "Save"}
                      title={isBookmarked ? "Saved" : "Save"}
                    >
                      {isBookmarked ? (
                        <PiBookmarksSimpleFill className="text-base text-emerald-400" />
                      ) : (
                        <PiBookmarksSimpleLight className="text-base text-emerald-400" />
                      )}
                    </button>

                    {showTryOut && (
                      <Link
                      to={appUrl}
                        // onClick={handleTryOut}
                        className="ml-1 h-8 px-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        Try it out
                        <MdOutlineOpenInNew className="text-sm" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ===================== MOBILE TABS (< lg) ===================== */}
          <div className="lg:hidden md:mt-4">
            {mainCard}

            {/* visible regardless of the active tab */}
            {participantsSection && <div className="mt-4">{participantsSection}</div>}
          </div>

          {/* ===================== DESKTOP TWO COLUMNS (lg+) ===================== */}
          <div className="hidden lg:grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] gap-4 mt-6 items-start">
            {/* main */}
            <main className="min-w-0">{mainCard}</main>

            {/* aside */}
            <aside className="min-w-0 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide space-y-5">
              {desktopComments}
              {participantsSection}
            </aside>
          </div>
        </div>
      )}

      {loading && <PostDetailSkeleton />}
     

      {/* ===================== FLOATING AI (bottom-right) ===================== */}
      {!loading && Object.keys(singlePostData).length > 0 && (
        <>
          {showAssistant && (
        <div
          onClick={() => setShowAssistant(false)}
          className={`absolute md:hidden inset-0 duration-300 ${
            showAssistant
              ? "bg-black/60 backdrop-blur-sm transition-opacity"
              : "opacity-0"
          }`}
        />
      )}
          <AnimatePresence>
            {showAssistant && (
              <motion.div
                key="ai-panel"
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.94 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "bottom right" }}
                className="
                  fixed z-[60]
                  bottom-20 right-3 md:bottom-24 md:right-6
                  w-[calc(100vw-1.5rem)] md:w-[420px]
                  max-h-[75vh] md:max-h-[640px]
                  flex flex-col overflow-hidden
                  rounded-2xl border border-neutral-700/70
                  bg-[#0a0f1d] shadow-2xl shadow-black/60
                "
              >
                {/* <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <img
                      src={logoicon}
                      className="w-5 h-5 object-contain rounded-full"
                      alt=""
                    />
                    <span className="text-sm font-semibold text-gray-200">
                      Tech Assistant
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAssistant(false)}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
                    aria-label="Close assistant"
                  >
                    <IoClose className="text-base" />
                  </button>
                </div> */}

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <AITechAssistant
                    currentPostId={singlePostData._id}
                    category={singlePostData.category}
                    showAssistant={showAssistant}
                    setShowAssistant = {setShowAssistant}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setShowAssistant((v) => !v)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label={showAssistant ? "Close AI assistant" : "Ask AI"}
            className="
              fixed z-[30] bottom-4 right-3 md:bottom-6 md:right-6
              flex items-center gap-2
              h-12 md:h-12 px-4 rounded-full
              bg-[#0d1117]/95 backdrop-blur-md
              border border-emerald-500/30
              shadow-xl shadow-emerald-900/20
              text-xs text-gray-200
            "
          >
            <img
              src={logoicon}
              className="w-5 h-5 object-contain rounded-full"
              alt=""
            />
            <span className="hidden md:inline">
              {showAssistant ? "Close" : "Ask AI"}
            </span>
          </motion.button>
        </>
      )}

      {/* ===================== MOBILE COMMENT SHEET ===================== */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          viewComments ? "visible" : "invisible"
        }`}
      >
        <div
          onClick={() => setViewComments(false)}
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            viewComments ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          ref={sheetRef}
          className={`
            fixed bottom-0 left-0 right-0
            theme border-t border-[#30363d] rounded-t-2xl
            flex flex-col
            transition-transform duration-300 ease-out
            ${viewComments ? "translate-y-0" : "translate-y-full"}
          `}
          style={{ height: isInputFocused ? "55vh" : "75vh" }}
        >
          <div
            className="flex justify-center pt-3 pb-1 shrink-0"
            onClick={() => setViewComments(false)}
          >
            <div className="w-9 h-1 rounded-full bg-gray-600" />
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-200">
                Discussions
              </span>
              {messages.length > 0 && (
                <span className="text-[10px] font-medium bg-[#21262d] text-gray-400 border border-[#30363d] px-2 py-0.5 rounded-full">
                  {formatCount(messages.length)}
                </span>
              )}
            </div>
            <button
              onClick={() => setViewComments(false)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
            >
              <IoClose className="text-base" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
            {socket && viewComments && (
              <CommentsBox
                messages={messages}
                setMessages={setMessages}
                msgLoading={msgLoading}
                viewComments={viewComments}
                userEmail={userEmail}
                email={email}
                postId={postId}
                socket={socket}
              />
            )}
          </div>

          <div className="shrink-0 px-3 py-3 border-t border-[#21262d] bg-[#0a0f1d]">
            {renderCommentInput(textareaRef2, { mobile: true })}
          </div>
        </div>
      </div>

      {/* ===================== IMAGE MODAL ===================== */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
            onClick={handleCloseModal}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              layout
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-6xl w-full flex items-center justify-center"
            >
              <motion.img
                src={selectedImage}
                alt="Preview"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-h-[70vh] w-auto rounded-2xl shadow-2xl border border-gray-700 object-contain"
              />
              <motion.button
                onClick={handleCloseModal}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                className="absolute md:-top-4 md:-right-4 -top-3 -right-3 md:w-10 md:h-10 h-8 w-8 flex items-center justify-center rounded-full bg-gray-900 border border-gray-700 text-white shadow-lg md:hover:bg-red-500 transition-colors"
              >
                <IoClose className="text-sm" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== PARTICIPANTS MODAL ===================== */}
      <AnimatePresence>
        {showParticipants && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowParticipants(false)}
              className="fixed inset-0 z-[80] bg-black/70"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setShowParticipants(false)}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="md:w-[500px] w-[370px] max-h-[500px] rounded-xl pb-4 bg-[#050b16] border border-white/10 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Participants
                    </h3>
                    <p className="text-[10px] font-semibold text-gray-500 mt-1">
                      {formatCount(participants.length)} involved in discussion
                    </p>
                  </div>
                  <button
                    onClick={() => setShowParticipants(false)}
                    className="w-6 h-6 rounded-lg hover:bg-white/5 text-gray-400 flex items-center justify-center transition-all"
                  >
                    <IoClose size={18} />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[400px] px-4 p-2 md:p-4">
                  {participants.map((p) => (
                    <motion.div key={p.email}>
                      <Link
                        to={`/viewProfile/${p.email}`}
                        onClick={() => setShowParticipants(false)}
                        className="flex items-center gap-2 md:px-3 px-1 py-1.5 rounded-2xl hover:bg-white/[0.03] transition-all group"
                      >
                        {!p.profile ? (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                            style={{ backgroundColor: avatarColor(p.name) }}
                          >
                            {initials(p.name)}
                          </div>
                        ) : (
                          <img
                            src={`${S3_BASE}/${p.profile}`}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-xs line-clamp-1 max-w-[150px] md:max-w-[200px] text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] font-semibold text-gray-500">
                              {p.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-500 group-hover:text-emerald-400 transition-all">
                          <BadgeIcons
                            badges={p?.badges}
                            parentClass="static -space-x-1.5"
                            shieldClassName="w-4 h-4"
                          />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===================== EMPTY STATE ===================== */}
      {!loading &&
        (!singlePostData || Object.keys(singlePostData).length === 0) && (
          <div className="w-full h-[70vh] md:h-[55vh] flex flex-col items-center justify-center">
            <img className="w-48 md:w-60" src={empty_state_post} alt="" />
            <p className="text-gray-400 max-w-xs md:max-w-md text-sm md:text-base text-center">
              Post not found !
            </p>
          </div>
        )}

      <Footer />
    </div>
  );
}

export default ViewPage;
