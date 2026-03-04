import React, { useEffect, useRef, useState } from "react";
// import { formatDistanceToNow } from "date-fns";
import getTimeAgo from "../components/DateCovertion.jsx";
import userProfile from "../images/user.png";
const CommentsBox = ({ messages, viewComments }) => {
  const commentBoxRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Detect if user is manually scrolling up
  const handleScroll = () => {
    if (!commentBoxRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = commentBoxRef.current;

    // If user is not near the bottom, mark as manual scrolling
    if (scrollHeight - scrollTop - clientHeight > 50) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  // Attach scroll listener
  useEffect(() => {
    const div = commentBoxRef.current;
    if (div) div.addEventListener("scroll", handleScroll);
    return () => div && div.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll only if user is NOT scrolling manually
  useEffect(() => {
    if (viewComments && !isUserScrolling && commentBoxRef.current) {
      commentBoxRef.current.scrollTo({
        top: commentBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, viewComments, isUserScrolling]);

  

// console.log("CommentsBox rendered with messages:", messages);
  return (
    <div
  ref={commentBoxRef}
  className={`${
    viewComments
      ? "max-h-96 overflow-y-auto"
      : "overflow-y-hidden"
  } flex flex-col scrollbar-hide transition-all duration-300`}
>
  {messages.length > 0 ? (
    (viewComments ? messages : messages.slice(0, 1)).map((msg, index) => (
      <div
        key={msg._id}
        
        className="flex items-start gap-4 py-4 last:border-none hover:bg-slate-800/40 transition"
      >
        {/* Avatar */}
        <img
          src={
            msg.profile && msg.profile !== ""
              ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${msg.profile}`
              : userProfile
          }
          className="w-7 h-7 rounded-full bg-white object-cover flex-shrink-0"
          alt="User Avatar"
        />

        {/* Comment Content */}
        <div className="flex flex-col w-full">

          {/* Username + Time */}
          <div className="flex items-center gap-1 ">
            <span className=" text-[10px] text-slate-400 font-medium">
              @{msg.user}
            </span>
            <span className="text-[10px]  text-slate-400">
             • {getTimeAgo(msg.timestamp)}
            </span>
          </div>

          {/* Message */}
          <p className="text-xs text-white leading-relaxed break-words">
            {msg.message}
          </p>

        </div>
      </div>
    ))
  ) : (
    <div className="py-6 text-center text-sm text-slate-500">
      💬 No comments yet. Be the first to comment.
    </div>
  )}
</div>

//  <div
//       ref={commentBoxRef}
//       className={`${
//         viewComments
//           ? "flex-col max-h-96 overflow-y-auto"
//           : "flex-col overflow-y-hidden"
//       } scrollbar-hide mb-3 items-start justify-start gap-2 transition-all duration-300`}
//     >
//       {messages.length > 0 ? (
//         (viewComments ? messages : messages.slice(0, 1)).map((msg, index) => (
//           <div
//             key={index}
//             className="flex items-start gap-2 mb-2 md:mb-4 rounded-lg p-3 transition-all duration-200"
//           >
//             <img
//               src={
//                 msg.profile && msg.profile !== ""
//                   ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${msg.profile}`
//                   : userProfile
//               }
//               className="w-7 h-7 border rounded-full bg-white border border-gray-200 object-cover"
//               alt="User Avatar"
//             />
//             <div className="flex flex-col w-full">
//               <div className="flex justify-between items-center">
//                 <p className="text-[10px]  text-slate-300">@{msg.user}</p>
//                 <p className="text-[10px] text-gray-400">
//                   {/* {msg.timestamp.slice(0, 10)} */}
//                   {getTimeAgo(msg.timestamp)}
//                    {/* {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })} */}
//                 </p>
//               </div>
//               <p className="text-sm mt-1 text-gray-200">{msg.message}</p>
//             </div>
//           </div>
//         ))
//       ) : (
//         <p className="md:text-sm text-xs text-gray-400 italic">
//           💭 Be the first to comment...
//         </p>
//       )}
//     </div>
  );
};

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