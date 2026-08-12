import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import userPlaceholder from "../images/user.png";
import axiosInstance from "../instances/Axiosinstances";
import { getItem } from "../utils/encode";
import formatCount from "../utils/NumberConversion";
import BadgeIcons from "../components/achievements/BadgeIcons";
import {
  TbChevronUp,
  TbChevronLeft,
  TbMessageCircle,
  TbEye,
  TbCircleCheck,
  TbPin,
  TbDots,
  TbPencil,
  TbTrash,
  TbArrowBack,
  TbCheck,
  TbX,
  TbSend,
  TbClock,
  TbBookmark,
  TbShare,
} from "react-icons/tb";
import toast from "../components/toaster/Toast";
import getTimeAgo from "../components/DateCovertion";

// ── Constants ─────────────────────────────────────────────────────────────────
const S3 = "https://open-access-blog-image.s3.us-east-1.amazonaws.com/";
const av = (p) => (p ? `${S3}${p}` : userPlaceholder);

const CATEGORY_COLORS = {
  qa: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Q&A" },
  idea: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Idea" },
  showcase: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Show & tell",
  },
  announcement: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    label: "Announcement",
  },
};

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Sample data (replace with useGetDiscussionById hook) ──────────────────────
const SAMPLE_DISCUSSION = {
  _id: "disc001",
  communityId: "66f1a2b3c4d5e6f7a8b9c0d1",
  category: "qa",
  title: "Why does my LoRA fine-tune overfit after 3 epochs?",
  body: `I've been fine-tuning a 7B model using LoRA with r=16, alpha=32. After epoch 3 the validation loss starts climbing but training loss keeps dropping.

My current setup:
- Dataset: ~4,000 instruction pairs
- Learning rate: 2e-4 with cosine schedule
- Batch size: 4 with gradient accumulation of 8

Has anyone dealt with this? Is it a data quality issue or is my r value too high?`,
  authorId: {
    _id: "auth002",
    authorName: "haricharan_1133",
    profile: "",
    email: "haricharanuggirala1133@gmail.com",
    badges: [{ badgeId: "b1" }],
  },
  tags: [
    { _id: "tag001", name: "fine-tuning", color: "#0d9488" },
    { _id: "tag002", name: "lora", color: "#7c3aed" },
  ],
  isPinned: true,
  isSolved: true,
  solvedReplyId: "reply003",
  upvoteCount: 24,
  replyCount: 3,
  views: Array(48).fill(""),
  hasVoted: false,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

const SAMPLE_REPLIES = [
  {
    _id: "reply001",
    discussionId: "disc001",
    authorId: {
      _id: "auth001",
      authorName: "Yugesh Karan",
      profile: "",
      email: "yugeshkaran01@gmail.com",
      badges: [{ badgeId: "b1" }, { badgeId: "b2" }],
    },
    body: `Classic overfitting signal. A few things to try:

1. **Lower your rank** — r=16 is on the higher side for 4k samples. Try r=4 or r=8.
2. **Add dropout** — set \`lora_dropout=0.05\` in your LoraConfig.
3. **Early stopping** — if you're not already using it, stop at validation loss minimum.

The data size is the main constraint here. 4k pairs is enough for task adaptation but leaves little room for high-rank LoRA without regularisation.`,
    parentReplyId: null,
    isAnswer: false,
    upvoteCount: 12,
    hasVoted: true,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    nestedReplies: [
      {
        _id: "nested001",
        authorId: {
          _id: "auth002",
          authorName: "haricharan_1133",
          profile: "",
          email: "haricharanuggirala1133@gmail.com",
          badges: [],
        },
        body: "Tried r=8 with dropout=0.05 — validation loss is stable now after 5 epochs. Thank you!",
        parentReplyId: "reply001",
        isAnswer: false,
        upvoteCount: 3,
        hasVoted: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    _id: "reply002",
    discussionId: "disc001",
    authorId: {
      _id: "auth003",
      authorName: "Kumaran",
      profile: "",
      email: "kumaranv.set2022@dsuniversity.ac.in",
      badges: [],
    },
    body: "Also worth checking your data quality — duplicate or near-duplicate instruction pairs will cause the model to memorise rather than generalise. Run a dedup pass with MinHash LSH before training.",
    parentReplyId: null,
    isAnswer: false,
    upvoteCount: 8,
    hasVoted: false,
    createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    nestedReplies: [],
  },
  {
    _id: "reply003",
    discussionId: "disc001",
    authorId: {
      _id: "auth004",
      authorName: "ajayvarsanr",
      profile: "",
      email: "ajayvarsan2020@gmail.com",
      badges: [],
    },
    body: `The combination of r=8 + dropout + data dedup sorted it for me on a similar setup. One more thing: make sure you're evaluating on a **held-out** set that wasn't seen during any preprocessing step, otherwise validation loss can look artificially good.`,
    parentReplyId: null,
    isAnswer: true,
    upvoteCount: 19,
    hasVoted: false,
    createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    nestedReplies: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Author row ────────────────────────────────────────────────────────────────
const AuthorRow = ({ author, timestamp, label }) => (
  <div className="flex items-center gap-2">
    <Link
      to={`/viewProfile/${author?.email}`}
      className="flex-shrink-0 relative"
    >
      <img
        src={av(author?.profile)}
        className="w-6 h-6 rounded-full object-cover bg-gray-700"
        alt={author?.authorname}
      />
      {/* {author?.badges?.length > 0 && (
        <BadgeIcons
          badges={author?.badges}
          parentClass="absolute -top-2 -right-2 -space-x-0.5"
          shieldClassName="w-3 h-3"
        />
      )} */}
    </Link>
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          to={`/viewProfile/${author?.email}`}
          className="text-xs font-semibold text-gray-200 hover:text-white transition-colors"
        >
          {author?.authorname}
        </Link>
        {label && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
            {label}
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-500">{getTimeAgo(timestamp)}</p>
    </div>
  </div>
);

// ── Upvote button ─────────────────────────────────────────────────────────────
// const UpvoteButton = ({
//   discussionId,
//   upvoteCount,
//   setUpvoteCount,
//   upvoteStatus,
//   setUpvoteStatus,
//   communityId,
// }) => {
//   // const [upvoteCount, setUpvoteCount] = useState(discussion?.upvoteCount || 0);
//   // const [upvoteStatus, setUpvoteStatus] = useState(
//   //      discussion?.hasVoted || false,
//   //    );

//   const updateUpvoteDiscussion = async (communityId, discussionId) => {
//     try {
//       const res = await axiosInstance.post(
//         `/bytes/discuss/${communityId}/discussions/${discussionId}/upvote`,
//       );

//       if (res.status === 200) {
//         const { action } = res.data;
//         setUpvoteStatus((prev) => !prev);

//         if (action === "upvoted") {
//           setUpvoteCount((prev) => prev + 1);
//           toast.success("Discussion hyped successfully!");
//         } else if (action === "removed") {
//           setUpvoteCount((prev) => Math.max(0, prev - 1));
//           toast.info("Discussion upvote removed.");
//         } else {
//           toast.success("Discussion upvote updated.");
//         }
//       }
//     } catch (err) {
//       console.error(
//         "updateUpvoteDiscussion error",
//         err?.response?.data || err.message,
//       );
//       toast.error("Unable to update discussion upvote.");
//     }
//   };

//   return (
//     <button
//       onClick={(e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         updateUpvoteDiscussion(communityId, discussionId);
//       }}
//       className="flex flex-col items-center gap-0.5 group"
//       title={upvoteStatus ? "Remove upvote" : "Upvote"}
//     >
//       <TbChevronUp
//         className={`text-base transition-colors ${
//           upvoteStatus
//             ? "text-emerald-400"
//             : "text-gray-500 group-hover:text-gray-300"
//         }`}
//       />
//       <span
//         className={`text-[11px] font-semibold ${
//           upvoteStatus ? "text-emerald-400" : "text-gray-400"
//         }`}
//       >
//         {formatCount(upvoteCount)}
//       </span>
//     </button>
//   );
// };

// ── Upvote button — unified for discussions AND replies ───────────────────────
const UpvoteButton = ({
  communityId,
  discussionId,
  replyId,        // pass this for reply upvotes, omit for discussion upvotes
  upvoteCount,
  setUpvoteCount,
  upvoteStatus,
  setUpvoteStatus,
}) => {
  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isReply = Boolean(replyId);

    // optimistic update
    if (upvoteStatus) {
      setUpvoteCount((prev) => Math.max(0, prev - 1));
      setUpvoteStatus(false);
    } else {
      setUpvoteCount((prev) => prev + 1);
      setUpvoteStatus(true);
    }

    try {
      const endpoint = isReply
        ? `/bytes/discuss/${communityId}/discussions/${discussionId}/replies/${replyId}/upvote`
        : `/bytes/discuss/${communityId}/discussions/${discussionId}/upvote`;

      if (upvoteStatus) {
        await axiosInstance.post(endpoint);
      } else {
        await axiosInstance.post(endpoint);
      }
    } catch (err) {
      // revert on error
      if (upvoteStatus) {
        setUpvoteCount((prev) => prev + 1);
        setUpvoteStatus(true);
      } else {
        setUpvoteCount((prev) => Math.max(0, prev - 1));
        setUpvoteStatus(false);
      }
      console.error("Upvote toggle error:", err?.response?.data || err.message);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex flex-col items-center gap-0.5 group"
      title={upvoteStatus ? "Remove upvote" : "Upvote"}
    >
      <TbChevronUp
        className={`text-base transition-colors ${
          upvoteStatus
            ? "text-emerald-400"
            : "text-gray-500 group-hover:text-gray-300"
        }`}
      />
      <span
        className={`text-[11px] font-semibold ${
          upvoteStatus ? "text-emerald-400" : "text-gray-400"
        }`}
      >
        {formatCount(upvoteCount)}
      </span>
    </button>
  );
};

// ── Overflow menu ─────────────────────────────────────────────────────────────
const OverflowMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
      >
        <TbDots className="text-base" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 theme border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden py-1">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-white/5 ${
                item.danger ? "text-red-400" : "text-gray-300"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Compose box ───────────────────────────────────────────────────────────────
const ComposeBox = ({
  placeholder,
  onSubmit,
  onCancel,
  autoFocus = false,
  initialValue = "",
}) => {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setSubmitting(true);
    await onSubmit(value.trim());
    setValue("");
    setSubmitting(false);
  };

  return (
    <div className="theme border border-[#1e293b] rounded-xl overflow-hidden focus-within:border-white/20 transition-colors">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none"
      />
      <div className="flex items-center justify-end gap-2 px-3 pb-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || submitting}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
        >
          <TbSend className="text-sm" />
          {submitting ? "Posting..." : "Reply"}
        </button>
      </div>
    </div>
  );
};

// ── Inline edit box ───────────────────────────────────────────────────────────
const InlineEdit = ({ initialValue, onSave, onCancel }) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!value.trim() || value.trim() === initialValue) {
      onCancel();
      return;
    }
    setSaving(true);
    await onSave(value.trim());
    setSaving(false);
  };

  return (
    <div className="theme border border-white/10 rounded-xl overflow-hidden mt-2">
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-gray-200 resize-none focus:outline-none"
      />
      <div className="flex items-center gap-2 px-3 pb-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-40"
        >
          <TbCheck className="text-sm" /> {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <TbX className="text-sm inline mr-1" />
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  NESTED REPLY CARD
// ─────────────────────────────────────────────────────────────────────────────
// const NestedReplyCard = ({
//   reply,
//   currentUserEmail,
//   isCoordinator,
//   isOP,
//   onUpvote,
//   onUnvote,
//   onEdit,
//   onDelete,
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [body, setBody] = useState(reply.body);

//   const isMine = reply.authorId.email === currentUserEmail;
//   const canModerate = isMine || isCoordinator;

//   const overflowItems = canModerate
//     ? [
//         ...(isMine
//           ? [
//               {
//                 label: "Edit",
//                 icon: <TbPencil className="text-sm" />,
//                 onClick: () => setEditing(true),
//               },
//             ]
//           : []),
//         {
//           label: "Delete",
//           icon: <TbTrash className="text-sm" />,
//           danger: true,
//           onClick: () => onDelete(reply._id),
//         },
//       ]
//     : [];

//   const handleSave = async (newBody) => {
//     await onEdit(reply._id, newBody);
//     setBody(newBody);
//     setEditing(false);
//   };

//   return (
//     <div className="flex gap-3 pl-4 border-l border-white/5 ml-4">
//       <UpvoteButton
//         count={reply.upvoteCount}
//         hasVoted={reply.hasVoted}
//         onVote={() => onUpvote(reply._id, "reply")}
//         // onUnvote={() => onUnvote(reply._id, "reply")}
//       />
//       <div className="flex-1 min-w-0">
//         <div className="flex items-start justify-between gap-2">
//           <AuthorRow author={reply.authorId} timestamp={reply.createdAt} />
//           {overflowItems.length > 0 && <OverflowMenu items={overflowItems} />}
//         </div>
//         {editing ? (
//           <InlineEdit
//             initialValue={body}
//             onSave={handleSave}
//             onCancel={() => setEditing(false)}
//           />
//         ) : (
//           <p className="text-sm text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">
//             {body}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };
const NestedReplyCard = ({
  reply,
  communityId,
  discussionId,
  currentUserEmail,
  isCoordinator,
  isOP,
  onEdit,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(reply.body);
  const [upvoteCount, setUpvoteCount] = useState(reply.upvoteCount || 0);
  const [upvoteStatus, setUpvoteStatus] = useState(reply.hasVoted || false);

  const isMine = reply.authorId.email === currentUserEmail;
  const canModerate = isMine || isCoordinator;

  const overflowItems = canModerate
    ? [
        ...(isMine
          ? [{
              label: "Edit",
              icon: <TbPencil className="text-sm" />,
              onClick: () => setEditing(true),
            }]
          : []),
        {
          label: "Delete",
          icon: <TbTrash className="text-sm" />,
          danger: true,
          onClick: () => onDelete(reply._id),
        },
      ]
    : [];

  const handleSave = async (newBody) => {
    await onEdit(reply._id, newBody);
    setBody(newBody);
    setEditing(false);
  };

  return (
    <div className="flex gap-3 pl-4 border-l border-white/5 ml-4">
      <UpvoteButton
        communityId={communityId}
        discussionId={discussionId}
        replyId={reply._id}
        upvoteCount={upvoteCount}
        setUpvoteCount={setUpvoteCount}
        upvoteStatus={upvoteStatus}
        setUpvoteStatus={setUpvoteStatus}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <AuthorRow author={reply.authorId} timestamp={reply.createdAt} />
          {overflowItems.length > 0 && <OverflowMenu items={overflowItems} />}
        </div>
        {editing ? (
          <InlineEdit
            initialValue={body}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <p className="text-sm text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">
            {body}
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TOP-LEVEL REPLY CARD
// ─────────────────────────────────────────────────────────────────────────────
// const ReplyCard = ({
//   reply,
//   currentUserEmail,
//   discussionId,
//   communityId,
//   isCoordinator,
//   isOP,
//   solvedReplyId,
//   onEdit,
//   onDelete,
//   onMarkAnswer,
//   onNestedReply,
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [body, setBody] = useState(reply.body);
//   const [showNestedCompose, setShowNestedCompose] = useState(false);

//   const isMine = reply.authorId.email === currentUserEmail;
//   const canModerate = isMine || isCoordinator;
//   const canMarkAnswer = isOP || isCoordinator;
//   const isAccepted = reply._id === solvedReplyId;

//   const overflowItems = [
//     ...(canMarkAnswer
//       ? [
//           {
//             label: isAccepted ? "Unmark answer" : "Mark as answer",
//             icon: <TbCircleCheck className="text-sm" />,
//             onClick: () => onMarkAnswer(reply._id, isAccepted),
//           },
//         ]
//       : []),
//     ...(canModerate
//       ? [
//           ...(isMine
//             ? [
//                 {
//                   label: "Edit",
//                   icon: <TbPencil className="text-sm" />,
//                   onClick: () => setEditing(true),
//                 },
//               ]
//             : []),
//           {
//             label: "Delete",
//             icon: <TbTrash className="text-sm" />,
//             danger: true,
//             onClick: () => onDelete(reply._id, false),
//           },
//         ]
//       : []),
//   ];

//   const handleSave = async (newBody) => {
//     await onEdit(reply._id, newBody);
//     setBody(newBody);
//     setEditing(false);
//   };

//   const handleNestedSubmit = async (text) => {
//     await onNestedReply(reply._id, text);
//     setShowNestedCompose(false);
//   };

//   return (
//     <div
//       className={`theme border rounded-xl p-4 transition-all ${
//         isAccepted
//           ? "border-emerald-500/30 bg-emerald-500/[0.03]"
//           : "border-[#1e293b]"
//       }`}
//     >
//       <div className="flex gap-3">
//         {/* Upvote column */}
//         <div className="flex-shrink-0 pt-1">
//           <UpvoteButton
//             upvoteCount={reply.upvoteCount}
//             hasVoted={reply.hasVoted}
//             discussionId = {discussionId}
//             upvoteStatus = {reply.hasVoted}
//             // onVote={() => onUpvote(reply._id, "reply")}
//             // onUnvote={() => onUnvote(reply._id, "reply")}

//           />
//         </div>

//         {/* Content */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2 mb-2">
//             <div className="flex items-center gap-2 flex-wrap">
//               <AuthorRow author={reply.authorId} timestamp={reply.createdAt} />
//               {isAccepted && (
//                 <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
//                   <TbCircleCheck className="text-[10px]" /> Answer
//                 </span>
//               )}
//             </div>
//             {overflowItems.length > 0 && <OverflowMenu items={overflowItems} />}
//           </div>

//           {editing ? (
//             <InlineEdit
//               initialValue={body}
//               onSave={handleSave}
//               onCancel={() => setEditing(false)}
//             />
//           ) : (
//             <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mt-1">
//               {body}
//             </div>
//           )}

//           {/* Reply action */}
//           {!editing && (
//             <button
//               onClick={() => setShowNestedCompose((v) => !v)}
//               className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 mt-3 transition-colors"
//             >
//               <TbArrowBack className="text-xs" />
//               Reply
//             </button>
//           )}

//           {/* Nested replies */}
//           {reply.nestedReplies?.length > 0 && (
//             <div className="flex flex-col gap-3 mt-4">
//               {reply.nestedReplies.map((nr) => (
//                 <NestedReplyCard
                
//                   key={nr._id}
//                   reply={nr}
//                   currentUserEmail={currentUserEmail}
//                   isCoordinator={isCoordinator}
//                   isOP={isOP}
//                   onUpvote={onUpvote}
//                   onUnvote={onUnvote}
//                   onEdit={onEdit}
//                   onDelete={onDelete}
//                 />
//               ))}
//             </div>
//           )}

//           {/* Nested compose box */}
//           {showNestedCompose && (
//             <div className="mt-3">
//               <ComposeBox
//                 placeholder={`Reply to ${reply.authorId.authorName}...`}
//                 onSubmit={handleNestedSubmit}
//                 onCancel={() => setShowNestedCompose(false)}
//                 autoFocus
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

const ReplyCard = ({
  reply,
  communityId,
  discussionId,
  currentUserEmail,
  isCoordinator,
  isOP,
  solvedReplyId,
  onEdit,
  onDelete,
  onMarkAnswer,
  onNestedReply,
}) => {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(reply.body);
  const [showNestedCompose, setShowNestedCompose] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(reply.upvoteCount || 0);
  const [upvoteStatus, setUpvoteStatus] = useState(reply.hasVoted || false);

  const isMine = reply.authorId.email === currentUserEmail;
  const canModerate = isMine || isCoordinator;
  const canMarkAnswer = isOP || isCoordinator;
  const isAccepted = reply._id === solvedReplyId;

  const overflowItems = [
    ...(canMarkAnswer
      ? [{
          label: isAccepted ? "Unmark answer" : "Mark as answer",
          icon: <TbCircleCheck className="text-sm" />,
          onClick: () => onMarkAnswer(reply._id, isAccepted),
        }]
      : []),
    ...(canModerate
      ? [
          ...(isMine
            ? [{
                label: "Edit",
                icon: <TbPencil className="text-sm" />,
                onClick: () => setEditing(true),
              }]
            : []),
          {
            label: "Delete",
            icon: <TbTrash className="text-sm" />,
            danger: true,
            onClick: () => onDelete(reply._id, false),
          },
        ]
      : []),
  ];

  const handleSave = async (newBody) => {
    await onEdit(reply._id, newBody);
    setBody(newBody);
    setEditing(false);
  };

  const handleNestedSubmit = async (text) => {
    await onNestedReply(reply._id, text);
    setShowNestedCompose(false);
  };

  return (
    <div
      className={`theme border rounded-xl p-4 transition-all ${
        isAccepted
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : "border-[#1e293b]"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 pt-1">
          <UpvoteButton
            communityId={communityId}
            discussionId={discussionId}
            replyId={reply._id}
            upvoteCount={upvoteCount}
            setUpvoteCount={setUpvoteCount}
            upvoteStatus={upvoteStatus}
            setUpvoteStatus={setUpvoteStatus}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <AuthorRow author={reply.authorId} timestamp={reply.createdAt} />
              {isAccepted && (
                <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  <TbCircleCheck className="text-[10px]" /> Answer
                </span>
              )}
            </div>
            {overflowItems.length > 0 && <OverflowMenu items={overflowItems} />}
          </div>

          {editing ? (
            <InlineEdit
              initialValue={body}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mt-1">
              {body}
            </div>
          )}

          {!editing && (
            <button
              onClick={() => setShowNestedCompose((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 mt-3 transition-colors"
            >
              <TbArrowBack className="text-xs" />
              Reply
            </button>
          )}

          {reply.nestedReplies?.length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              {reply.nestedReplies.map((nr) => (
                <NestedReplyCard
                  key={nr._id}
                  reply={nr}
                  communityId={communityId}
                  discussionId={discussionId}
                  currentUserEmail={currentUserEmail}
                  isCoordinator={isCoordinator}
                  isOP={isOP}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {showNestedCompose && (
            <div className="mt-3">
              <ComposeBox
                placeholder={`Reply to ${reply.authorId.authorName}...`}
                onSubmit={handleNestedSubmit}
                onCancel={() => setShowNestedCompose(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ViewDiscussion() {
  const { communityId, discussionId } = useParams();
  const navigate = useNavigate();
  const currentUserEmail = getItem("email");

  // ── State ─────────────────────────────────────────────────────────────────
  // Replace with useGetDiscussionById(communityId, discussionId)
  // const [discussion, setDiscussion] = useState({ ...SAMPLE_DISCUSSION });
  const [discussion, setDiscussion] = useState({});
  // const [replies, setReplies] = useState(SAMPLE_REPLIES.map((r) => ({ ...r })));
  const [replies, setReplies] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false); // set true when real API returns hasMore
  const [replyPage, setReplyPage] = useState(1);

  const [showReplyCompose, setShowReplyCompose] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState(false);
  const [discussionBody, setDiscussionBody] = useState("");

  const isOP = discussion?.authorId?.email === currentUserEmail;
  // Replace with membership check from community context
  const isCoordinator =
    getItem("role") === "coordinator" || getItem("role") === "admin";

  const cat = CATEGORY_COLORS[discussion?.category] || CATEGORY_COLORS.qa;
  const [upvoteCount, setUpvoteCount] = useState(0);

  const [upvoteStatus, setUpvoteStatus] = useState(false);

  const getDiscussionsById = async () => {
    try {
      const res = await axiosInstance.get(
        `/bytes/discuss/${communityId}/discussions/${discussionId}`,
      );
      if (res.status === 200) {
        setDiscussion(res?.data?.discussion);
        setUpvoteCount(res?.data?.discussion?.upvoteCount);
        setUpvoteStatus(res?.data?.discussion?.hasVoted);
        setDiscussionBody(res?.data?.discussion?.body);
      }
    } catch (err) {
      console.log("error getting discussion", err.message);
    }
  };

  useEffect(() => {
    getDiscussionsById();
  }, [communityId, discussionId]);

  const getReplies = async () => {
    try {
      const res = await axiosInstance.get(
        `/bytes/discuss/${communityId}/discussions/${discussionId}/replies`,
      );

      if (res.status === 200) {
        setReplies(res.data.replies);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getReplies();
  }, [communityId, discussionId]);

  // ── Discussion overflow menu ───────────────────────────────────────────────
  const discussionMenuItems = [
    ...(isCoordinator
      ? [
          {
            label: discussion?.isPinned ? "Unpin" : "Pin to top",
            icon: <TbPin className="text-sm" />,
            onClick: () => handlePin(),
          },
        ]
      : []),
    ...(isOP || isCoordinator
      ? [
          {
            label: "Edit",
            icon: <TbPencil className="text-sm" />,
            onClick: () => setEditingDiscussion(true),
          },
        ]
      : []),
    ...(isOP || isCoordinator
      ? [
          {
            label: "Delete discussion",
            icon: <TbTrash className="text-sm" />,
            danger: true,
            onClick: () => handleDeleteDiscussion(),
          },
        ]
      : []),
  ];

  // ── Upvote handlers ───────────────────────────────────────────────────────
  const handleUpvote = async (targetId, targetType) => {
    // optimistic update
    if (targetType === "discussion") {
      setDiscussion((prev) => ({
        ...prev,
        upvoteCount: prev.upvoteCount + 1,
        hasVoted: true,
      }));
    } else {
      setReplies((prev) => updateReplyVote(prev, targetId, 1, true));
    }
    try {
      if (targetType === "discussion") {
        await axiosInstance.post(
          `/bytes/discuss/${communityId}/discussions/${discussion?._id}/upvote`,
        );
      } else {
        await axiosInstance.post(
          `/bytes/discuss/${communityId}/discussions/${discussion?._id}/replies/${targetId}/upvote`,
        );
      }
    } catch (err) {
      // revert on error
      if (targetType === "discussion") {
        setDiscussion((prev) => ({
          ...prev,
          upvoteCount: prev.upvoteCount - 1,
          hasVoted: false,
        }));
      } else {
        setReplies((prev) => updateReplyVote(prev, targetId, -1, false));
      }
    }
  };

  const handleUnvote = async (targetId, targetType) => {
    if (targetType === "discussion") {
      setDiscussion((prev) => ({
        ...prev,
        upvoteCount: Math.max(0, prev.upvoteCount - 1),
        hasVoted: false,
      }));
    } else {
      setReplies((prev) => updateReplyVote(prev, targetId, -1, false));
    }
    try {
      if (targetType === "discussion") {
        await axiosInstance.delete(
          `/bytes/discuss/${communityId}/discussions/${discussion?._id}/upvote`,
        );
      } else {
        await axiosInstance.delete(
          `/bytes/discuss/${communityId}/discussions/${discussion?._id}/replies/${targetId}/upvote`,
        );
      }
    } catch (err) {
      if (targetType === "discussion") {
        setDiscussion((prev) => ({
          ...prev,
          upvoteCount: prev.upvoteCount + 1,
          hasVoted: true,
        }));
      } else {
        setReplies((prev) => updateReplyVote(prev, targetId, 1, true));
      }
    }
  };

  // Helper: walks top-level and nested replies to update vote state

  const updateReplyVote = (list, id, delta, voted) =>
    list.map((r) => {
      if (r._id === id)
        return {
          ...r,
          upvoteCount: Math.max(0, r.upvoteCount + delta),
          hasVoted: voted,
        };
      return {
        ...r,
        nestedReplies: r.nestedReplies?.map((nr) =>
          nr._id === id
            ? {
                ...nr,
                upvoteCount: Math.max(0, nr.upvoteCount + delta),
                hasVoted: voted,
              }
            : nr,
        ),
      };
    });

  // ── Reply submit ──────────────────────────────────────────────────────────
  const handleReplySubmit = async (body) => {
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      _id: tempId,
      discussionId: discussion?._id,
      authorId: {
        _id: "me",
        authorName: getItem("username") || "You",
        profile: "",
        email: currentUserEmail,
        badges: [],
      },
      body,
      parentReplyId: null,
      isAnswer: false,
      upvoteCount: 0,
      hasVoted: false,
      createdAt: new Date().toISOString(),
      nestedReplies: [],
    };
    setReplies((prev) => [...prev, optimistic]);
    setDiscussion((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }));
    setShowReplyCompose(false);

    try {
      const res = await axiosInstance.post(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}/replies`,
        { body },
      );
      const real = res.data.reply;
      setReplies((prev) =>
        prev.map((r) =>
          r._id === tempId ? { ...real, nestedReplies: [] } : r,
        ),
      );
    } catch {
      setReplies((prev) => prev.filter((r) => r._id !== tempId));
      setDiscussion((prev) => ({
        ...prev,
        replyCount: Math.max(0, prev.replyCount - 1),
      }));
    }
  };

  // ── Nested reply submit ───────────────────────────────────────────────────
  const handleNestedReply = async (parentReplyId, body) => {
    const tempId = `temp_nested_${Date.now()}`;
    const optimistic = {
      _id: tempId,
      authorId: {
        _id: "me",
        authorName: getItem("username") || "You",
        profile: "",
        email: currentUserEmail,
        badges: [],
      },
      body,
      parentReplyId,
      isAnswer: false,
      upvoteCount: 0,
      hasVoted: false,
      createdAt: new Date().toISOString(),
    };
    setReplies((prev) =>
      prev.map((r) =>
        r._id === parentReplyId
          ? { ...r, nestedReplies: [...(r.nestedReplies || []), optimistic] }
          : r,
      ),
    );
    try {
      const res = await axiosInstance.post(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}/replies`,
        { body, parentReplyId },
      );
      const real = res.data.reply;
      setReplies((prev) =>
        prev.map((r) =>
          r._id === parentReplyId
            ? {
                ...r,
                nestedReplies: r.nestedReplies.map((nr) =>
                  nr._id === tempId ? real : nr,
                ),
              }
            : r,
        ),
      );
    } catch {
      setReplies((prev) =>
        prev.map((r) =>
          r._id === parentReplyId
            ? {
                ...r,
                nestedReplies: r.nestedReplies.filter(
                  (nr) => nr._id !== tempId,
                ),
              }
            : r,
        ),
      );
    }
  };

  // ── Edit reply ────────────────────────────────────────────────────────────
  const handleEditReply = async (replyId, newBody) => {
    try {
      await axiosInstance.patch(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}/replies/${replyId}`,
        { body: newBody },
      );
    } catch (err) {
      console.error("Edit reply error:", err);
    }
  };

  // ── Delete reply ──────────────────────────────────────────────────────────
  const handleDeleteReply = async (replyId, isNested = false) => {
    setReplies((prev) => {
      if (isNested) {
        return prev.map((r) => ({
          ...r,
          nestedReplies: r.nestedReplies?.filter((nr) => nr._id !== replyId),
        }));
      }
      return prev.filter((r) => r._id !== replyId);
    });
    if (!isNested) {
      setDiscussion((prev) => ({
        ...prev,
        replyCount: Math.max(0, prev.replyCount - 1),
      }));
    }
    try {
      await axiosInstance.delete(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}/replies/${replyId}`,
      );
    } catch (err) {
      console.error("Delete reply error:", err);
    }
  };

  // ── Mark answer ───────────────────────────────────────────────────────────
  const handleMarkAnswer = async (replyId, isCurrentlyAccepted) => {
    const newSolvedId = isCurrentlyAccepted ? null : replyId;
    setDiscussion((prev) => ({
      ...prev,
      isSolved: !isCurrentlyAccepted,
      solvedReplyId: newSolvedId,
    }));
    setReplies((prev) =>
      prev.map((r) => ({
        ...r,
        isAnswer: r._id === replyId ? !isCurrentlyAccepted : false,
      })),
    );
    try {
      await axiosInstance.patch(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}/solve`,
        { solvedReplyId: newSolvedId },
      );
    } catch (err) {
      console.error("Mark answer error:", err);
    }
  };

  // ── Pin discussion ────────────────────────────────────────────────────────
  const handlePin = async () => {
    const next = !discussion?.isPinned;
    setDiscussion((prev) => ({ ...prev, isPinned: next }));
    try {
      await axiosInstance.patch(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}/pin`,
      );
    } catch {
      setDiscussion((prev) => ({ ...prev, isPinned: !next }));
    }
  };

  // ── Edit discussion body ──────────────────────────────────────────────────
  const handleEditDiscussion = async (newBody) => {
    setDiscussionBody(newBody);
    setEditingDiscussion(false);
    try {
      await axiosInstance.patch(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}`,
        { body: newBody },
      );
    } catch (err) {
      console.error("Edit discussion error:", err);
    }
  };

  // ── Delete discussion ─────────────────────────────────────────────────────
  const handleDeleteDiscussion = async () => {
    try {
      await axiosInstance.delete(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}`,
      );
      navigate(`/community/${communityId}?tab=discussions`);
    } catch (err) {
      console.error("Delete discussion error:", err);
    }
  };

  // ── Load more replies ─────────────────────────────────────────────────────
  const loadMoreReplies = async () => {
    setLoadingMore(true);
    try {
      const next = replyPage + 1;
      const res = await axiosInstance.get(
        `/bytes/discuss/${communityId}/discussions/${discussion?._id}/replies?page=${next}&limit=10`,
      );
      setReplies((prev) => [...prev, ...res.data.replies]);
      setReplyPage(next);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Load more replies error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  console.log("discussions", discussion);
  console.log("replies", replies);

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen theme text-white flex flex-col">
      <NavBar />

      <div className="flex-grow px-4 md:px-8 max-w-[900px] mx-auto w-full pb-20 pt-4">
        {/* ── Back navigation ── */}
        <button
          onClick={() =>
            navigate(`/techCommunityDetails/${communityId}?tab=discussions`)
          }
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 mb-5 transition-colors"
        >
          <TbChevronLeft className="text-sm" />
          Back to discussions
        </button>

        {/* ── Discussion thread ── */}
        <div className="theme border border-[#1e293b] rounded-2xl overflow-hidden mb-4">
          {/* pinned banner */}
          {discussion?.isPinned && (
            <div className="flex items-center gap-2 px-5 py-2 bg-emerald-500/5 border-b border-emerald-500/10">
              <TbPin className="text-emerald-400 text-xs" />
              <span className="text-[10px] font-semibold text-emerald-400">
                Pinned by coordinator
              </span>
            </div>
          )}

          <div className="p-5">
            {/* header row */}
            <div className="flex items-start gap-3">
              {/* upvote */}
              <div className="flex-shrink-0 pt-1">
                <UpvoteButton
                  discussion={discussion}
                  upvoteCount={upvoteCount}
                  setUpvoteCount={setUpvoteCount}
                  upvoteStatus={upvoteStatus}
                  setUpvoteStatus={setUpvoteStatus}
                  // count={discussion?.upvoteCount}
                  // hasVoted={discussion?.hasVoted}
                  communityId={communityId}
                  // onVote={() => handleUpvote(discussion?._id, "discussion")}
                  // onUnvote={() => handleUnvote(discussion?._id, "discussion")}
                />
              </div>

              {/* content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="text-base md:text-lg font-semibold text-gray-100 leading-snug">
                    {discussion?.title}
                  </h1>
                  {discussionMenuItems.length > 0 && (
                    <OverflowMenu items={discussionMenuItems} />
                  )}
                </div>

                {/* meta row */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}
                  >
                    {cat.label}
                  </span>
                  {discussion?.isSolved && (
                    <span className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                      <TbCircleCheck className="text-[10px]" /> Solved
                    </span>
                  )}
                  {discussion?.tags?.map((tag) => (
                    <span
                      key={tag._id}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: `${tag.color}18`, color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                {/* author */}
                <div className="mb-4">
                  <AuthorRow
                    author={discussion?.authorId}
                    timestamp={discussion?.createdAt}
                    label={isOP ? "OP" : null}
                  />
                </div>

                {/* body */}
                {editingDiscussion ? (
                  <InlineEdit
                    // initialValue={discussionBody}
                    initialValue={discussionBody}
                    onSave={handleEditDiscussion}
                    onCancel={() => setEditingDiscussion(false)}
                  />
                ) : (
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {discussionBody}
                  </div>
                )}

                {/* footer stats */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <TbMessageCircle className="text-xs" />
                    {formatCount(discussion?.replyCount)} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <TbEye className="text-xs" />
                    {formatCount(discussion?.views?.length || 0)} views
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reply compose toggle ── */}
        {!showReplyCompose ? (
          <button
            onClick={() => setShowReplyCompose(true)}
            className="flex items-center gap-2 w-full text-left px-4 py-3 theme border border-[#1e293b] rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:border-white/10 transition-all duration-200 mb-4"
          >
            <img
              src={av(null)}
              className="w-6 h-6 rounded-full object-cover bg-gray-700"
              alt=""
            />
            Write a reply...
          </button>
        ) : (
          <div className="mb-4">
            <ComposeBox
              placeholder="Write your reply..."
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyCompose(false)}
              autoFocus
            />
          </div>
        )}

        {/* ── Replies ── */}
        {replies.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-500">
              {discussion?.replyCount}{" "}
              {discussion?.replyCount === 1 ? "reply" : "replies"}
            </p>

            {replies.map((reply) => (
              <ReplyCard
                key={reply._id}
                reply={reply}
                currentUserEmail={currentUserEmail}
                isCoordinator={isCoordinator}
                isOP={isOP}
                discussionId={discussionId}
                communityId={communityId}
                solvedReplyId={discussion?.solvedReplyId}
                onUpvote={handleUpvote}
                onUnvote={handleUnvote}
                onEdit={handleEditReply}
                onDelete={handleDeleteReply}
                onMarkAnswer={handleMarkAnswer}
                onNestedReply={handleNestedReply}
              />
            ))}

            {hasMore && (
              <button
                onClick={loadMoreReplies}
                disabled={loadingMore}
                className="w-full py-2.5 text-xs font-medium text-gray-400 hover:text-gray-200 theme border border-[#1e293b] rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more replies"}
              </button>
            )}
          </div>
        )}

        {replies.length === 0 && (
          <div className="text-center py-10 text-gray-600 text-sm">
            No replies yet. Be the first to respond.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ViewDiscussion;
