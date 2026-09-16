// import React from 'react'
// // import { TbBell, TbBellFilled } from 'react-icons/tb';
// import { Link } from 'react-router-dom';
// import getTimeAgo from '../components/DateCovertion';
// import { IoIosClose } from 'react-icons/io';
//   import {
//   TbMessages, TbSpeakerphone, TbTrophy, TbTrendingUp, TbBellFilled, TbBell 
// } from "react-icons/tb";
// import { getItem } from '../utils/encode';

// function Notification({notificationRef,showNotification,showAddContent, deleteAllNotification, note,setShowNotification, deleteSigleNotification, loading }) {
//      const userEmail = getItem("email");
//   return (
//          <div ref={notificationRef} className={`${
//       showNotification && !showAddContent
//         ? "fixed top-16 right-2 z-50 md:w-[320px] w-72 theme border border-gray-700/50 shadow-2xl rounded-2xl transition-all duration-300 overflow-hidden"
//         : "hidden"
//     }`}>
    
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-700/50 sticky top-0 theme z-40">
//         <div className="flex items-center gap-2">
//           <TbBellFilled className="text-[15px] text-emerald-400" />
//           <h2 className="text-[13px] font-medium text-white tracking-tight">
//             Notifications
//           </h2>
//         </div>
//         <button
//           onClick={() => deleteAllNotification(userEmail)}
//           className="text-[11px] font-medium text-gray-400 hover:text-white transition-colors tracking-wide"
//         >
//           Clear all
//         </button>
//       </div>
    
//       {/* Notification List */}
//       <div className="flex flex-col divide-y divide-gray-800/60 max-h-[440px] overflow-y-auto emerald-scrollbar">
    
    
//         {[...note].reverse().map((data) => {
    
//           // pick icon + color by notification type
//           const typeIcon = data.type === "reply"
//             ? { Icon: TbMessages,     bg: "bg-blue-500/10",   color: "text-blue-400"   }
//             : data.type === "announcement"
//             ? { Icon: TbSpeakerphone, bg: "bg-amber-500/10",  color: "text-amber-400"  }
//             : data.type === "achievement"
//             ? { Icon: TbTrophy,       bg: "bg-amber-500/10",  color: "text-amber-400"  }
//             : { Icon: TbTrendingUp,   bg: "bg-emerald-500/10",color: "text-emerald-400"};
    
//           const { Icon, bg, color } = typeIcon;
    
//           return (
//             <div
//               key={data._id}
//               className="group relative px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150"
//             >
//               <div
//                 onClick={() => setShowNotification(false)}
//                 className="flex gap-3 items-start"
//               >
//                 {/* type icon */}
//                 <div className={`w-8 h-8 rounded-[10px] ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
//                   <Icon className={`text-[14px] ${color}`} />
//                 </div>
    
//                 {/* content */}
//                 <div className="flex flex-col flex-1 min-w-0">
//                   <div className="flex items-baseline justify-between gap-2 mb-0.5">
//                     <Link
//                       to={data.url}
//                       className="text-[12px] font-medium text-gray-100 truncate max-w-[160px] tracking-tight"
//                     >
//                       {data.user}
//                     </Link>
//                     <span className="text-[10px] text-gray-600 flex-shrink-0">
//                       {getTimeAgo(data?.timestamp)}
//                     </span>
//                   </div>
//                   <Link
//                     to={data.url}
//                     className="text-[11px] text-gray-400 leading-[1.5] line-clamp-2"
//                   >
//                     {data.message || "You got a notification"}
//                   </Link>
//                 </div>
//               </div>
    
//               {/* delete */}
//               <button
//                 onClick={() => deleteSigleNotification(userEmail, data._id)}
//                 className="absolute top-3 right-3 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-gray-400 hover:text-red-400"
//               >
//                 <IoIosClose size={16} />
//               </button>
//             </div>
//           );
//         })}
//       </div>
    
//       {loading && (
//         <div className="flex items-center justify-center py-8 text-[12px] text-gray-500">
//           Loading...
//         </div>
//       )}
    
//       {note.length === 0 && !loading && (
//         <div className="flex flex-col items-center justify-center py-10 gap-2">
//           <TbBell className="text-xl text-gray-700" />
//           <p className="text-[12px] text-gray-600">No notifications yet</p>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Notification


import React from "react";
import { Link } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import {
  TbFileText,       // post-created
  TbTrendingUp,     // post-engaged
  TbMessages,       // discussion-created
  TbMessageShare,   // discussion-engaged
  TbMessageReply,   // discussion-reply
  TbCircleCheck,    // discussion-answer
  TbSpeakerphone,   // announcement
  TbTrophy,         // achievement
  TbUsersGroup,     // collab
  TbShieldCheck,    // system
  TbBellFilled,
  TbBell,
} from "react-icons/tb";
import getTimeAgo from "../components/DateCovertion";
import { getItem } from "../utils/encode";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPE → ICON / COLOR MAP
//  Covers all 10 notification types.
//  bg uses Tailwind opacity variants so it works on any dark surface.
// ─────────────────────────────────────────────────────────────────────────────
export const NOTIFICATION_TYPE_MAP = {
  // ── new content created ───────────────────────────────────────────────────
  "post-created": {
    Icon:  TbFileText,
    bg:    "bg-emerald-500/10",
    color: "text-emerald-400",
    label: "New post",
  },
  "discussion-created": {
    Icon:  TbMessages,
    bg:    "bg-blue-500/10",
    color: "text-blue-400",
    label: "New discussion",
  },

  // ── engagement ────────────────────────────────────────────────────────────
  "post-engaged": {
    Icon:  TbTrendingUp,
    bg:    "bg-emerald-500/10",
    color: "text-emerald-400",
    label: "Post engagement",
  },
  "discussion-engaged": {
    Icon:  TbMessageShare,
    bg:    "bg-blue-500/10",
    color: "text-blue-400",
    label: "Discussion engagement",
  },

  // ── replies & answers ─────────────────────────────────────────────────────
  "discussion-reply": {
    Icon:  TbMessageReply,
    bg:    "bg-violet-500/10",
    color: "text-violet-400",
    label: "New reply",
  },
  "discussion-answer": {
    Icon:  TbCircleCheck,
    bg:    "bg-teal-500/10",
    color: "text-teal-400",
    label: "Answer accepted",
  },

  // ── platform ──────────────────────────────────────────────────────────────
  "announcement": {
    Icon:  TbSpeakerphone,
    bg:    "bg-amber-500/10",
    color: "text-amber-400",
    label: "Announcement",
  },
  "achievement": {
    Icon:  TbTrophy,
    bg:    "bg-amber-500/10",
    color: "text-amber-400",
    label: "Achievement",
  },

  // ── collaboration ─────────────────────────────────────────────────────────
  "collab": {
    Icon:  TbUsersGroup,
    bg:    "bg-pink-500/10",
    color: "text-pink-400",
    label: "Collaboration invite",
  },

  // ── system ────────────────────────────────────────────────────────────────
  "system": {
    Icon:  TbShieldCheck,
    bg:    "bg-slate-500/10",
    color: "text-slate-400",
    label: "System",
  },
};

// fallback for legacy notifications with no type
const DEFAULT_TYPE = NOTIFICATION_TYPE_MAP["system"];

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION PANEL
// ─────────────────────────────────────────────────────────────────────────────
const Notificationpanel = ({
  notificationRef,
  showNotification,
  showAddContent,
  note,
  loading,
  deleteAllNotification,
  deleteSigleNotification,
  setShowNotification,
}) => {
   const userEmail = getItem("email");
  return (
    <div
      ref={notificationRef}
      className={`${
        showNotification && !showAddContent
          ? "fixed top-16 right-2 z-50 md:w-[320px] w-72 theme border border-gray-700/50 shadow-2xl rounded-2xl transition-all duration-300 overflow-hidden"
          : "hidden"
      }`}
    >
      {/* ── header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-700/50 sticky top-0 theme z-40">
        <div className="flex items-center gap-2">
          <TbBellFilled className="text-[15px] text-emerald-400" />
          <h2 className="text-[13px] font-medium text-white tracking-tight">
            Notifications
          </h2>
        </div>
        <button
          onClick={() => deleteAllNotification(userEmail)}
          className="text-[11px] font-medium text-gray-400 hover:text-white transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* ── list ── */}
      <div className="flex flex-col divide-y divide-gray-800/60 max-h-[440px] overflow-y-auto emerald-scrollbar">
        {[...note].reverse().map((data) => {
          const meta  = NOTIFICATION_TYPE_MAP[data.type] || DEFAULT_TYPE;
          const Icon  = meta.Icon;

          return (
            <div
              key={data._id}
              className="group relative px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150"
            >
              <div
                onClick={() => setShowNotification(false)}
                className="flex gap-3 items-start"
              >
                {/* type icon chip */}
                <div
                  className={`w-8 h-8 rounded-[10px] ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Icon className={`text-[15px] ${meta.color}`} />
                </div>

                {/* content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <Link
                      to={data.url}
                      className="text-[12px] text-wrap font-medium text-gray-100 truncate max-w-[160px] tracking-tight"
                    >
                      {data.user}
                    </Link>
                    <span className="text-[10px] text-gray-600 flex-shrink-0">
                      {getTimeAgo(data?.timestamp)}
                    </span>
                  </div>

                  <Link
                    to={data.url}
                    className="text-[11px] text-gray-400 leading-[1.5] line-clamp-3"
                  >
                    {data.message || "You got a notification"}
                  </Link>
                </div>
              </div>

              {/* delete */}
              <button
                onClick={() => deleteSigleNotification(userEmail, data._id)}
                className="absolute top-1 right-1 md:opacity-0 md:group-hover:opacity-70
                           md:hover:!opacity-100 md:transition-opacity
                           text-gray-500 md:text-gray-400 md:group-hover:text-red-400 transition-all duration-300"
              >
                <IoIosClose size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-[12px] text-gray-500">
          Loading...
        </div>
      )}

      {/* empty */}
      {note.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <TbBell className="text-xl text-gray-700" />
          <p className="text-[12px] text-gray-600">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default Notificationpanel;