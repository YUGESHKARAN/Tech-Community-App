import { useMemo, useState } from "react";
import DiscussionCardSkeleton from "../loaders/community/DiscussionCardSkeleton";
import { Link } from "react-router-dom";
import { TbChevronUp, TbCircleCheck, TbEye, TbMessageCircle, TbPin, TbPlus } from "react-icons/tb";
import getTimeAgo from "../DateCovertion";
import formatCount from "../../utils/NumberConversion";
import { toast } from "react-toastify";
import axiosInstance from "../../instances/Axiosinstances";

   const CATEGORIES = [
  { value: "", label: "All" },
  { value: "qa", label: "Q&A" },
  { value: "idea", label: "Ideas" },
  { value: "showcase", label: "Show & tell" },
  { value: "announcement", label: "Announcements" },
];

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


const DiscussionCard = ({
  discussion,
  currentUserEmail,
  communityId,
  accentColor,
}) => {
  const cat = CATEGORY_COLORS[discussion.category] || CATEGORY_COLORS.qa;
  //  let upvoteCount = discussion?.upvoteCount||0;
  const [upvoteCount, setUpvoteCount] = useState(discussion?.upvoteCount || 0);

  const [upvoteStatus, setUpvoteStatus] = useState(
    discussion?.hasVoted || false,
  );

  const updateUpvoteDiscussion = async (communityId, discussionId) => {
    try {
      const res = await axiosInstance.post(
        `/bytes/discuss/${communityId}/discussions/${discussionId}/upvote`,
      );

      if (res.status === 200) {
        const { action } = res.data;
        setUpvoteStatus((prev) => !prev);

        if (action === "upvoted") {
          setUpvoteCount((prev) => prev + 1);
          toast.success("Discussion hyped successfully!");
        } else if (action === "removed") {
          setUpvoteCount((prev) => Math.max(0, prev - 1));
          toast.info("Discussion upvote removed.");
        } else {
          toast.success("Discussion upvote updated.");
        }
      }
    } catch (err) {
      console.error(
        "updateUpvoteDiscussion error",
        err?.response?.data || err.message,
      );
      toast.error("Unable to update discussion upvote.");
    }
  };

  return (
    <div
      className={`block theme border rounded-xl px-4 py-3 transition-all duration-200 ${
        discussion.isPinned ? "border-l-2" : "border-[#1e293b]"
      }`}
      style={discussion.isPinned ? { borderLeftColor: accentColor } : {}}
    >
      <div className="flex gap-3">
        {/* upvote column */}
        <div
        //   onClick={(e) => {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     updateUpvoteDiscussion(communityId, discussion._id);
        //   }}
          className="flex  flex-col cursor-not-allowed items-center gap-0.5 pt-0.5 min-w-[28px] cursor-not-allowed"
        >
          <TbChevronUp
            className={`text-base ${upvoteStatus ? "text-emerald-400" : "text-gray-500"}`}
          />
          <span className="text-xs font-semibold text-gray-200">
            {/* {formatCount(discussion.upvoteCount)} */}
            {formatCount(upvoteCount)}
          </span>
        </div>

        {/* content */}
        <Link
        //   to={`/discussion/${discussion._id}/${communityId}`}
          className="flex-1 cursor-not-allowed min-w-0"
        >
          <div className="flex items-start gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-gray-100 leading-snug">
              {discussion.title}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {discussion.isPinned && (
                <span className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  <TbPin className="text-[10px]" /> Pinned
                </span>
              )}
              {discussion.isSolved && (
                <span className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-400">
                  <TbCircleCheck className="text-[10px]" /> Solved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${cat.bg} ${cat.text}`}
            >
              {cat.label}
            </span>
            <span className="text-[10px] text-gray-500">
              {discussion.authorId?.authorName}
            </span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="text-[10px] text-gray-500">
              {getTimeAgo(discussion.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {discussion.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                {discussion.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{ background: `${tag.color}18`, color: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {discussion?.linkedPostId && (
              <Link
                // to={`/viewpage/${discussion?.linkedPostId?.author?.email}/${discussion?.linkedPostId?._id}`}
                className="bg:red-100"
              >
                <img
                  className="w-12 h-9 rounded-lg border border-emerald-700"
                  src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${discussion?.linkedPostId?.thumbnail}`}
                  alt=""
                />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <TbMessageCircle className="text-xs" />
              {formatCount(discussion.replyCount)} replies
            </span>
            <span className="flex items-center gap-1">
              <TbEye className="text-xs" />
              {formatCount(discussion.views?.length || 0)} views
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};


export const DiscussionsTab = ({
  discussions,
  discussionLoading,
  community,
  accentColor,
  currentUserEmail,
  userRole,
}) => {

 
  const [activeCategory, setActiveCategory] = useState("");
  const canPost =
    userRole === "coordinator" || community?.settings?.whoCanPost === "member";

  const filtered = useMemo(() => {
    if (!activeCategory) return discussions;
    return discussions.filter((d) => d.category === activeCategory);
  }, [discussions, activeCategory]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat.value
                  ? "bg-white/5 text-white border-white/20"
                  : "bg-transparent text-gray-400 border-white/10 hover:text-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {canPost && (
          <button
            disabled={true}
            // to={`/techCommunityDetails/${community._id}/discussions/new`}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white disabled:opacity-80 disabled:cursor-not-allowed"
            style={{ background: accentColor || community?.colorTheme  }}
          >
            <TbPlus className="text-sm" />
            New discussion
          </button>
        )}
      </div>

      {filtered.length === 0 && !discussionLoading ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No discussions yet.{canPost && " Start the first one."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((disc) => (
            <DiscussionCard
              key={disc._id}
              discussion={disc}
              communityId={community._id}
              currentUserEmail={currentUserEmail}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
      {discussionLoading && filtered.length === 0 && (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, index) => (
            <DiscussionCardSkeleton key={index}/>
          ))}
        </div>
      )}
    </div>
  );
};