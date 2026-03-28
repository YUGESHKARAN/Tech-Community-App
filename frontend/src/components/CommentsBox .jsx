import React, { useEffect, useRef, useState } from "react";
// import { formatDistanceToNow } from "date-fns";
import getTimeAgo from "../components/DateCovertion.jsx";
import userProfile from "../images/user.png";

import { BsThreeDots } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import toast from "./toaster/Toast.jsx";
import axiosInstance from "../instances/Axiosinstances.jsx";

// const CommentsBox = ({ messages, viewComments }) => {
//   const commentBoxRef = useRef(null);
//   const [isUserScrolling, setIsUserScrolling] = useState(false);

//   // Detect if user is manually scrolling up
//   const handleScroll = () => {
//     if (!commentBoxRef.current) return;
//     const { scrollTop, scrollHeight, clientHeight } = commentBoxRef.current;

//     // If user is not near the bottom, mark as manual scrolling
//     if (scrollHeight - scrollTop - clientHeight > 50) {
//       setIsUserScrolling(true);
//     } else {
//       setIsUserScrolling(false);
//     }
//   };

//   // Attach scroll listener
//   useEffect(() => {
//     const div = commentBoxRef.current;
//     if (div) div.addEventListener("scroll", handleScroll);
//     return () => div && div.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Auto-scroll only if user is NOT scrolling manually
//   useEffect(() => {
//     if (viewComments && !isUserScrolling && commentBoxRef.current) {
//       commentBoxRef.current.scrollTo({
//         top: commentBoxRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [messages, viewComments, isUserScrolling]);

  

// // console.log("CommentsBox rendered with messages:", messages);
//   return (
//     <div
//   ref={commentBoxRef}
//   className={`${
//     viewComments
//       ? "max-h-96 overflow-y-auto"
//       : "overflow-y-hidden"
//   } flex flex-col scrollbar-hide transition-all duration-300`}
// >
//   {messages.length > 0 ? (
//     (viewComments ? messages : messages.slice(0, 1)).map((msg, index) => (
//       <div
//         // key={msg._id}
//         key={(msg._id || `temp-${index}`)}
        
//         className="flex items-start gap-4 py-4 last:border-none  transition"
//       >
//         {/* Avatar */}
//         <img
//           src={
//             msg.profile
//               ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${msg.profile}`
//               : userProfile
//           }
//           className="w-7 h-7 rounded-full bg-white object-cover flex-shrink-0"
//           alt="User Avatar"
//         />

//         {/* Comment Content */}
//         <div className="flex flex-col w-full">

//           {/* Username + Time */}
//           <div className="flex items-center gap-1 ">
//             <span className=" text-[10px] text-slate-400 font-medium">
//               @{msg.user}
//             </span>
//             <span className="text-[10px]  text-slate-400">
//              • {getTimeAgo(msg.timestamp)}
//             </span>
//           </div>

//           {/* Message */}
//           <p className={`text-xs text-white leading-relaxed break-words ${!viewComments && 'line-clamp-2' }`}>
//             {msg.message}
//           </p>

//         </div>
//       </div>
//     ))
//   ) : (
//     <div className="py-6 text-center text-sm text-slate-500">
//       💬 No comments yet. Be the first to comment.
//     </div>
//   )}
// </div>

// //  <div
// //       ref={commentBoxRef}
// //       className={`${
// //         viewComments
// //           ? "flex-col max-h-96 overflow-y-auto"
// //           : "flex-col overflow-y-hidden"
// //       } scrollbar-hide mb-3 items-start justify-start gap-2 transition-all duration-300`}
// //     >
// //       {messages.length > 0 ? (
// //         (viewComments ? messages : messages.slice(0, 1)).map((msg, index) => (
// //           <div
// //             key={index}
// //             className="flex items-start gap-2 mb-2 md:mb-4 rounded-lg p-3 transition-all duration-200"
// //           >
// //             <img
// //               src={
// //                 msg.profile && msg.profile !== ""
// //                   ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${msg.profile}`
// //                   : userProfile
// //               }
// //               className="w-7 h-7 border rounded-full bg-white border border-gray-200 object-cover"
// //               alt="User Avatar"
// //             />
// //             <div className="flex flex-col w-full">
// //               <div className="flex justify-between items-center">
// //                 <p className="text-[10px]  text-slate-300">@{msg.user}</p>
// //                 <p className="text-[10px] text-gray-400">
// //                   {/* {msg.timestamp.slice(0, 10)} */}
// //                   {getTimeAgo(msg.timestamp)}
// //                    {/* {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })} */}
// //                 </p>
// //               </div>
// //               <p className="text-sm mt-1 text-gray-200">{msg.message}</p>
// //             </div>
// //           </div>
// //         ))
// //       ) : (
// //         <p className="md:text-sm text-xs text-gray-400 italic">
// //           💭 Be the first to comment...
// //         </p>
// //       )}
// //     </div>
//   );
// };
// ─── CommentsBox Component ───────────────────────────────────────────────────

const CommentsBox = ({ messages, setMessages, viewComments, userEmail, email, postId, socket }) => {
  const commentBoxRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleScroll = () => {
    if (!commentBoxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = commentBoxRef.current;
    if (scrollHeight - scrollTop - clientHeight > 50) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  useEffect(() => {
    const div = commentBoxRef.current;
    if (div) div.addEventListener("scroll", handleScroll);
    return () => div && div.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (viewComments && !isUserScrolling && commentBoxRef.current) {
      commentBoxRef.current.scrollTo({
        top: commentBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, viewComments, isUserScrolling]);

 
  //  const handleDelete = async (id) => {
  //   // Optimistic update
  //   setMessages((prev) => prev.filter((m) => m._id !== id));
  //   try {
  //     const response = await axiosInstance.delete(`/blog/posts/comment/${email}/${postId}/${id}`);
  //     // console.log("response", response.data)
      
  //     if (response.status===200){
  //       toast.success("Removed", "Message removed successfully");
  //     }

  //   } catch (error) {
  //     console.error("Delete failed:", error);
  //     // You can rollback here if needed
  //   }
  // };
  
  // const handleEdit = async (id) => {
  //   if (!editValue.trim()) return;
  //   const updated = editValue.trim();
   
  //   // Optimistic update
  //   setMessages((prev) =>
  //     prev.map((m) => (m._id === id ? { ...m, message: updated } : m))
  //   );
  //   setEditingId(null);
  //   setEditValue("");
  //   try {
  //     const response =  await axiosInstance.put(`/blog/posts/comment/${email}/${postId}/${id}`, {
  //       message: updated,
  //     });
  //     if (response.status===200){
  //       toast.success("Updated", "Message updated successfully");
  //     }
  //     // console.log("response", response.data)
  //   } catch (error) {
  //     console.error("Edit failed:", error);
  //   }
  // };

const handleDelete = (msgId) => {
  // Optimistic update
  setMessages((prev) => prev.filter((m) => m._id !== msgId));
  socket.emit("deleteMessage", { postId, messageId: msgId });
  setTimeout(()=>{
    toast.success("Deleted", "Message removed successfully")
  },1000)
};

const handleEdit = (msgId) => {
  if (!editValue.trim()) return;
  const updated = editValue.trim();
  // Optimistic update
  setMessages((prev) =>
    prev.map((m) => (m._id === msgId ? { ...m, message: updated } : m))
  );
  setEditingId(null);
  setEditValue("");
  socket.emit("editMessage", { postId, messageId: msgId, message: updated });
  setTimeout(()=>{
    toast.success("Edited", "Message edited successfully")
  },1000)
};

const menuRef = useRef(null);

useEffect(() => {
  const handler = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpenId(null);
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);


const editTextareaRef = useRef(null);

useEffect(() => {
  if (editTextareaRef.current) {
    const len = editTextareaRef.current.value.length;
    editTextareaRef.current.setSelectionRange(len, len);
    editTextareaRef.current.focus();
  }
}, [editingId]);

  // console.log("messages", messages)
  return (
    // <div
    //   ref={commentBoxRef}
    //   className={`${
    //     viewComments ? "h-full md:max-h-96 overflow-y-auto" : "overflow-y-hidden"
    //   } flex flex-col scrollbar-hide transition-all duration-300`}
    // >
    //   {messages.length > 0 ? (
    //     (viewComments ? messages : messages.slice(0, 1)).map((msg, index) => (
    //       <div
    //         key={msg._id || `temp-${index}`}
    //         className="group flex items-start gap-1.5 md:gap-3 py-3  last:border-none"
    //       >
    //         {/* Avatar */}
    //         <img
    //           src={
    //             msg.profile
    //               ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${msg.profile}`
    //               : userProfile
    //           }
    //           className="w-7 h-7 bg-white rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
    //           alt="User Avatar"
    //         />

    //         {/* Bubble */}
    //         <div className="flex-1 min-w-0">
    //           <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg rounded-tl-none px-3 py-2.5">
    //             {/* Meta row */}
    //             <div className="flex items-center gap-1.5 mb-1">
    //               <span className="text-[11px] font-semibold text-gray-200">
    //                 @{msg.user}
    //               </span>
    //               <span className="text-[10px] text-gray-500">·</span>
    //               <span className="text-[10px] text-gray-500">
    //                 {getTimeAgo(msg.timestamp)}
    //               </span>
    //             </div>

    //             {/* Message */}
    //             <p
    //               className={`text-xs text-gray-300 leading-relaxed break-words ${
    //                 !viewComments ? "line-clamp-2" : ""
    //               }`}
    //             >
    //               {msg.message}
    //             </p>
    //           </div>
    //         </div>
    //       </div>
    //     ))
    //   ) : (
    //     <div className="py-10 flex flex-col items-center gap-2 text-center">
    //       <span className="text-2xl">💬</span>
    //       <p className="text-xs text-gray-500">
    //         No comments yet. Be the first!
    //       </p>
    //     </div>
    //   )}
    // </div>
    <div
      ref={commentBoxRef}
      className={`${
        viewComments ? "h-full  md:h-96 overflow-y-auto" : " overflow-y-hidden"
      } flex flex-col scrollbar-hide transition-all duration-300`}
    >
      {messages.length > 0 ? (
        (viewComments ? messages : messages.slice(0, 1)).map((msg, index) => (
          <div
            key={msg._id || `temp-${index}`}
            className="group flex items-start gap-1.5 md:gap-3 py-3 last:border-none"
          >
            {/* Avatar */}
            <img
              src={
                msg.profile
                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${msg.profile}`
                  : userProfile
              }
              className="w-7 h-7 bg-white rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
              alt="User Avatar"
            />

            {/* Bubble */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg rounded-tl-none px-3 py-2.5">

                {/* Meta row */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-200">
                    @{msg.user}
                  </span>
                  <span className="text-[10px] text-gray-500">·</span>
                  <span className="text-[10px] text-gray-500">
                    {getTimeAgo(msg.timestamp)}
                  </span>

                  {/* Three dots — only for current user's messages */}
                  {msg.email === userEmail && viewComments && (
                    <div  className="relative ml-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === msg._id ? null : msg._id);
                        }}
                        className="p-0.5 rounded text-gray-400 hover:text-gray-400 transition-colors opacity-100 group-hover:opacity-100"
                      >
                        <BsThreeDots className="text-xs md:text-sm" />
                      </button>

                      {/* Dropdown */}
                      {menuOpenId === msg._id && (
                        <div
                        ref={menuRef}
                          
                          className="absolute right-0 top-5 z-50 w-24 bg-gray-900 border border-[#30363d] rounded-lg shadow-xl overflow-hidden"
                        >
                          <button
                          onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => {
                              setEditingId(msg._id);
                              setEditValue(msg.message);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-gray-300 hover:bg-white/5 transition-colors"
                          >
                            <MdEdit className="text-emerald-400 text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(msg._id);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-400 hover:bg-white/5 transition-colors"
                          >
                            <IoIosRemoveCircleOutline className="text-xs" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message or Edit input */}
                {editingId === msg._id ? (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <textarea
                      ref={editTextareaRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0d1117] border border-emerald-500/30 rounded-md  px-2.5 py-1.5 text-xs text-gray-200 outline-none resize-none scrollbar-hide focus:border-emerald-500/60 transition-colors"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditValue("");
                        }}
                        className="px-2.5 py-1 text-[10px] rounded-md text-gray-400 hover:text-gray-200 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleEdit(msg._id)}
                        className="px-2.5 py-1 text-[10px] rounded-md text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
                      >
                        Commit
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`mt-1 text-xs text-gray-300 leading-relaxed break-words ${
                      !viewComments ? "line-clamp-2" : ""
                    }`}
                  >
                    {msg.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-10 flex flex-col items-center gap-2 text-center">
          <span className="text-2xl">💬</span>
          <p className="text-xs text-gray-500">No comments yet. Be the first!</p>
        </div>
      )}
    </div>
  );
};


// ─── Comments Section (parent) ────────────────────────────────────────────────



export default CommentsBox;
   
    // <div
    //   ref={commentBoxRef}
    //   className={`${
    //     viewComments
    //       ? "flex-col max-h-96 overflow-y-auto"
    //       : "flex-col overflow-y-hidden"
    //   } scrollbar-hide mb-3 items-start justify-start gap-2 transition-all duration-300`}
    // >
    //   {messages.length > 0 ? (
    //     (viewComments ? messages : messages.slice(0, 1)).map((msg, index) => (
    //       <div
    //         key={index}
    //         className="flex items-start gap-2 mb-2 md:mb-4 rounded-lg p-3 transition-all duration-200"
    //       >
    //         <img
    //           src={
    //             msg.profile && msg.profile !== ""
    //               ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${msg.profile}`
    //               : userProfile
    //           }
    //           className="w-7 h-7 border rounded-full bg-white border border-gray-200 object-cover"
    //           alt="User Avatar"
    //         />
    //         <div className="flex flex-col w-full">
    //           <div className="flex justify-between items-center">
    //             <p className="text-[10px]  text-slate-300">@{msg.user}</p>
    //             <p className="text-[10px] text-gray-400">
    //               {/* {msg.timestamp.slice(0, 10)} */}
    //               {getTimeAgo(msg.timestamp)}
    //                {/* {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })} */}
    //             </p>
    //           </div>
    //           <p className="text-sm mt-1 text-gray-200">{msg.message}</p>
    //         </div>
    //       </div>
    //     ))
    //   ) : (
    //     <p className="md:text-sm text-xs text-gray-400 italic">
    //       💭 Be the first to comment...
    //     </p>
    //   )}
    // </div>