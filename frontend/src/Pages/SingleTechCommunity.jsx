import React, { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";

import userPlaceholder from "../images/user.png";
import empty_state_post from "../assets/empty_state_post.png";
import {
  TbBrain,
  TbShieldLock,
  TbChartDots,
  TbSparkles,
  TbWorldWww,
  TbBulb,
  TbUsers,
  TbFileText,
  TbMessageCircle,
  TbUserCheck,
  TbChevronUp,
  TbPin,
  TbCircleCheck,
  TbTrophy,
  TbHash,
  TbPlus,
  TbEye,
  TbHeart,
  TbShare,
  TbBookmark,
  TbClock,
  TbHeartFilled,
} from "react-icons/tb";
import * as TbIcons from "react-icons/tb";
import { getItem } from "../utils/encode";
import formatCount from "../utils/NumberConversion";
import BadgeIcons from "../components/achievements/BadgeIcons";
import {
  discussionsSample,
  leaderboardSample,
  trendingTagsSample,
} from "../utils/communitySample";
import useGetSingleTechCommunity from "../hooks/SingleTechDomain/useGetSingleTechCommunity";
import useGetPostsByCommunity from "../hooks/useGetPostsByCommunity";
import useGetDiscussions from "../hooks/useGetDiscussions";
import axiosInstance from "../instances/Axiosinstances";
import { IoShareSocial } from "react-icons/io5";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
import getTimeAgo from "../components/DateCovertion";
import useGetAllMembersByDomain from "../hooks/SingleTechDomain/useGetAllMembersByDomain";
// import coordinatorsCard from "../components/authors/CoordinatorsCard";
import CoordinatorsCard from "../components/authors/CoordinatorsCard";
import { deriveGradient } from "../utils/bannerTheme";
import CommunityHeaderSkeleton from "../components/loaders/community/CommunityHeaderSkeleton";
import toast from "../components/toaster/Toast";
import DiscussionCardSkeleton from "../components/loaders/community/DiscussionCardSkeleton";

// ── S3 image base ─────────────────────────────────────────────────────────────
const S3 = "https://open-access-blog-image.s3.us-east-1.amazonaws.com/";
const avatar = (profile) => (profile ? `${S3}${profile}` : userPlaceholder);

// ── Per-domain visual identity ────────────────────────────────────────────────
const domainStyle = {
  "AI/ML": { icon: TbBrain, from: "#0d9488", to: "#0f766e" },
  "Cyber Security": { icon: TbShieldLock, from: "#7c3aed", to: "#6d28d9" },
  "Data Science": { icon: TbChartDots, from: "#059669", to: "#047857" },
  GenAI: { icon: TbSparkles, from: "#ea580c", to: "#c2410c" },
  "Web Development": { icon: TbWorldWww, from: "#2563eb", to: "#1d4ed8" },
};
const getDomainStyle = (name) =>
  domainStyle[name] || { icon: TbBulb, from: "#0d9488", to: "#0f766e" };

// ── Discussion category config ────────────────────────────────────────────────
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

const LEADERBOARD_PERIODS = [
  { value: "weekly", label: "Week" },
  { value: "monthly", label: "Month" },
  { value: "allTime", label: "All time" },
];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Community banner ──────────────────────────────────────────────────────────
const CommunityBanner = ({
  community,
  style,
  loader,
  communityId,
  canEdit,
}) => {
  const gradient = useMemo(() => {
    const theme = community?.colorTheme;
    return deriveGradient(theme);
  }, [community?.colorTheme]);

  const Icon = community.icon ? TbIcons[community.icon] : style.icon;
  if (!loader && community?.colorTheme) {
    return (
      <div
        className="relative rounded-xl md:rounded-2xl md:px-2 overflow-hidden mb-0"
        style={{
          // background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
          background: `${community?.colorTheme ? `linear-gradient(135deg, ${gradient?.from}, ${gradient?.to})` : `linear-gradient(135deg, ${style?.from}, ${style?.to})`}`,
        }}
      >
        {/* subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,.4) 0%, transparent 60%)",
          }}
        />

        <div className="relative px-5 p-3.5 md:pt-4 md:pb-5">
          {canEdit && communityId && (
            <Link
              to={`/techCommunityDetails/${communityId}/edit`}
              className="absolute top-2.5 md:top-4 right-20 md:right-24 text-[10px] md:font-semibold px-3 py-1 rounded-full  text-white hover:bg-white/30 transition-colors"
            >
              Edit
            </Link>
          )}
          {community.userRole ? (
            <span className="absolute top-2.5 md:top-4 right-2 text-[10px] md:font-semibold px-2.5 py-0.5 md:py-1 rounded-full bg-white/20 text-white capitalize">
              {community?.userRole}
            </span>
          ) : (
            <span className="absolute top-2.5 md:top-4 right-2 text-[10px] md:font-semibold px-2.5 py-0.5 md:py-1 rounded-full bg-white/20 text-white capitalize">
              Member
            </span>
          )}

          <div className="flex items-start justify-start gap-3 mb-0.5 mt-0.5 md:mb-1">
            <div className="md:w-10 w-9 h-9 md:h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon className="text-white text-lg md:text-xl" />
            </div>
            <div>
              {/* <p className="text-[10px] font-medium tracking-widest uppercase text-white/60 mb-0.5">
              Tech Domain · BytesBase
            </p> */}
              <h1 className="text-lg md:text-2xl font-semibold text-white leading-tight">
                {community?.name}
              </h1>
              {community.tagline ? (
                <p className="md:text-xs text-[10px] text-white/70 max-w-2xl leading-relaxed md:mb-2 mb-1">
                  {community?.tagline}
                </p>
              ) : (
                <p className="md:text-xs text-[10px] text-white/70 max-w-2xl leading-relaxed md:mb-2 mb-1">
                  No tag line set
                </p>
              )}
            </div>
          </div>

          {community.description ? (
            <p className="md:text-xs text-[10px] text-white font-semibold max-w-2xl leading-relaxed mb-2 mt-1 md:mb-2.5">
              {community?.description}
            </p>
          ) : (
            <p className="text-xs text-white/70 max-w-md leading-relaxed mb-2 md:mb-2.5">
              description not set
            </p>
          )}

          <div className="flex flex-wrap gap-2 md:gap-4">
            {[
              { icon: TbUsers, val: community.memberCount, label: "members" },
              { icon: TbFileText, val: community.postCount, label: "posts" },
              {
                icon: TbMessageCircle,
                val: community.discussionCount || 0,
                label: "discussions",
              },
              {
                icon: TbUserCheck,
                val: community.coordinatorsCount,
                label: "coordinators",
              },
            ].map(({ icon: StatIcon, val, label }) => (
              <span
                key={label}
                className="flex items-center md:text-xs text-[10px]  gap-1 md:gap-1.5 text-white/80"
              >
                <StatIcon className="text-sm text-white/60" />
                <b className="text-white font-semibold">{formatCount(val)}</b>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <CommunityHeaderSkeleton />;
};

// ── Tab bar ───────────────────────────────────────────────────────────────────
const TabBar = ({ active, theme, onChange }) => {
  // const gradient = deriveGradient(theme);
  // console.log('gradient', gradient.from)
  // let themeColor = theme
  const TABS = ["Discussions", "Feed", "Members"];
  return (
    <div className="flex border-b border-white/5 mb-3 md:mb-5">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab.toLowerCase())}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
            active === tab.toLowerCase()
              ? "text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
          style={
            active === tab.toLowerCase() && theme
              ? { borderBottomColor: theme } // Applies your custom hex string directly
              : active === tab.toLowerCase()
                ? { borderBottomColor: "#34d399" } // Hardcoded hex for 'emerald-400'
                : {} // Empty object when tab is inactive (falls back to border-transparent)
          }
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

// ── Discussion card ───────────────────────────────────────────────────────────
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
      className={`block theme border rounded-xl px-4 py-3 hover:border-white/10 transition-all duration-200 ${
        discussion.isPinned ? "border-l-2" : "border-[#1e293b]"
      }`}
      style={discussion.isPinned ? { borderLeftColor: accentColor } : {}}
    >
      <div className="flex gap-3">
        {/* upvote column */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateUpvoteDiscussion(communityId, discussion._id);
          }}
          className="flex flex-col cursor-pointer items-center gap-0.5 pt-0.5 min-w-[28px]"
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
          to={`/discussion/${discussion._id}/${communityId}`}
          className="flex-1 min-w-0"
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

          {discussion?.linkedPostId &&
          <Link 
          to={`/viewpage/${discussion?.linkedPostId?.author?.email}/${discussion?.linkedPostId?._id}`}
          className="bg:red-100">

            <img 
            className="w-12 h-9 rounded-lg border border-emerald-700"
            src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${discussion?.linkedPostId?.thumbnail}`} alt="" />
            
          </Link>
          }
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

// ── Discussions tab ───────────────────────────────────────────────────────────
const DiscussionsTab = ({
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
          <Link
            to={`/techCommunityDetails/${community._id}/discussions/new`}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ background: community?.colorTheme || accentColor }}
          >
            <TbPlus className="text-sm" />
            New discussion
          </Link>
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
          {
           [...Array(3)].map((_,index)=>
          <DiscussionCardSkeleton/>)
          }
        </div>
      )}
    </div>
  );
};

// ── Feed post card ────────────────────────────────────────────────────────────
const FeedCard = ({ post, email, setPosts }) => {
  const postLikes = async (authorEmail, postId) => {
    // e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/blog/posts/likes/${authorEmail}/${postId}`,
        {
          emailAuthor: email,
        },
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(email)
                  ? post.likes.filter((like) => like !== email) // Unlike the post
                  : [...post.likes, email], // Like the post
              }
            : post,
        ),
      );
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };
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

  const addBookMarkPostId = async (postId) => {
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
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

  return (
    <div>
      <Link to={`/viewpage/${post.authorEmail}/${post._id}`}>
        {post.image ? (
          <img
            src={`${S3}${post.image}`}
            alt={post.title}
            className="w-full h-36 object-cover"
          />
        ) : (
          <div className="w-full h-36 bg-white/[0.02] flex items-center justify-center">
            <TbBrain className="text-3xl text-gray-700" />
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
          <img
            // src={avatar(post.authorId?.profile)}
            src={
              post.profile
                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${post.profile}`
                : avatar(post.authorId?.profile)
            }
            className="w-5 h-5 rounded-full object-cover bg-gray-700"
            alt={post.authorId?.authorName}
          />
          <span className="text-[10px] text-gray-400 truncate flex-1">
            {post.authorId?.authorName}
          </span>
          <span className="text-[10px] text-gray-600">
            {getTimeAgo(post.timestamp)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span
            onClick={() => postLikes(post.authorEmail, post._id)}
            className="flex items-center cursor-pointer gap-1"
          >
            {(post.likes || []).includes(email) ? (
              <TbHeartFilled className="text-xs text-gray-500" />
            ) : (
              <TbHeart className="text-xs" />
            )}

            {formatCount(post.likes?.length || 0)}
          </span>

          <span
            onClick={() => sharePost(post.title, post.authorEmail, post._id)}
            className="flex items-center cursor-pointer gap-1"
          >
            <IoShareSocial className="text-xs" />
          </span>

          <span className="flex cursor-pointer items-center gap-1">
            <TbMessageCircle className="text-xs" />{" "}
            {formatCount(post.messages?.length || 0)}
          </span>
          <span className="flex items-center cursor-pointer gap-1">
            <TbEye className="text-xs" /> {formatCount(post.views?.length || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Feed tab ──────────────────────────────────────────────────────────────────
const FeedTab = ({ posts, setPosts, feedLoad, feedHashMore }) => {
  const email = getItem("email");

  // share post with social media
  const sharePost = async (title, email, postId) => {
    try {
      const postData = {
        title: title,
        text: title,
        url: `${window.location.origin}/viewpage/${email}/${postId}`,
      };

      const response = await navigator.share(postData);
      console.log("response", response);
    } catch (err) {
      console.log("error sharing post", err);
    }
  };
  if (posts.length === 0 && !feedLoad) {
    return (
      <div className="flex h-[70vh] col-span-full md:h-[55vh] flex-col justify-center items-center ">
        <img className="w-48 md:w-60 " src={empty_state_post} alt="" />
        <p className="text-center text-gray-500 text-sm">
          No posts available !
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {posts.map((post) => {
        return (
          <FeedCard
            key={post._id}
            post={post}
            setPosts={setPosts}
            email={email}
          />
        );
      })}
      {posts?.length > 0 && feedLoad && (
        <div className="col-span-full flex justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer Oval Ring */}
            <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

            {/* Inner Glow Pulse */}
            {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
          </div>
        </div>
      )}

      {!feedHashMore && posts?.length > 0 && (
        <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
          No more posts
        </p>
      )}
    </div>
  );
};

// ── Member card ───────────────────────────────────────────────────────────────
const MemberCard = ({ author }) => {
  // const {  author, joinedAt } = membership;
  return (
    <Link
      to={`/viewProfile/${author?.email}`}
      className="theme border relative border-[#1e293b] rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative">
        <img
          src={avatar(author?.profile)}
          className="w-14 h-14 rounded-full object-cover border border-gray-700 bg-gray-700"
          alt={author?.name}
        />
        {author?.badges?.length > 0 && (
          <BadgeIcons
            badges={author?.badges}
            parentClass="absolute -top-1 -right-1 -space-x-1"
            shieldClassName="w-3.5 h-3.5"
          />
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-100 truncate w-full">
          {author?.authorName}
        </h3>
        <p className="text-[10px] text-gray-500 truncate w-full">
          {author?.email}
        </p>
      </div>
      <div className="flex gap-3 text-[10px] text-gray-500">
        {author?.postCount > 0 && (
          <span>
            <b className="text-gray-300">{formatCount(author?.postCount)}</b>{" "}
            posts
          </span>
        )}
        <span>
          <b className="text-gray-300">
            {formatCount(author?.followingCount || 0)}
          </b>{" "}
          following
        </span>
      </div>
      <span className="text-[9px] text-gray-600 flex items-center gap-1">
        <TbClock className="text-[10px]" /> Joined{" "}
        {new Date(author?.joinedAt).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })}
      </span>
    </Link>
  );
};

// ── Members tab ───────────────────────────────────────────────────────────────
const MembersTab = ({ members, coordinators }) => (
  <div>
    {coordinators?.length > 0 && (
      <>
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-500 mb-3">
          Coordinators
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
          {coordinators?.map((m) => (
            // <MemberCard key={m.authorId} author={m} />
            <CoordinatorsCard key={m.authorId} author={m} />
          ))}
        </div>
      </>
    )}
    {members?.length > 0 && (
      <>
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-500 mb-3">
          Members
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {members?.map((m) => (
            <MemberCard key={m.authorId} author={m} />
          ))}
        </div>
      </>
    )}
    {coordinators?.length === 0 && members?.length === 0 && (
      <div className="text-center py-16 text-gray-500 text-sm">
        No members yet.
      </div>
    )}
  </div>
);

// ── Leaderboard sidebar card ──────────────────────────────────────────────────
const LeaderboardCard = ({ data }) => {
  const [period, setPeriod] = useState("weekly");
  const medalColors = ["#f2994a", "#8f9296", "#cd7f32"];

  return (
    <div className="theme border border-[#1e293b] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
          <TbTrophy className="text-amber-400 text-sm" /> Top contributors
        </span>
        <div className="flex gap-1">
          {LEADERBOARD_PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${
                period === p.value
                  ? "bg-white/5 text-gray-200 border-white/20"
                  : "bg-transparent text-gray-500 border-white/5 hover:text-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {data.leaderboard.map((entry, i) => (
          <div key={entry.email} className="flex items-center gap-2">
            {i < 3 ? (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${medalColors[i]}22` }}
              >
                <TbTrophy
                  className="text-[10px]"
                  style={{ color: medalColors[i] }}
                />
              </div>
            ) : (
              <span className="w-5 text-center text-[10px] text-gray-500 flex-shrink-0">
                {entry.rank}
              </span>
            )}
            <img
              src={avatar(entry.profile)}
              className="w-6 h-6 rounded-full object-cover bg-gray-700 flex-shrink-0"
              alt={entry.authorName}
            />
            <span className="text-[11px] text-gray-200 flex-1 truncate">
              {entry.authorName}
            </span>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">
              {entry.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Trending tags sidebar card ────────────────────────────────────────────────
const TrendingTagsCard = ({ data }) => {
  const max = Math.max(...data.tags.map((t) => t.count), 1);
  return (
    <div className="theme border border-[#1e293b] rounded-xl p-4">
      <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5 mb-3">
        <TbHash className="text-emerald-400 text-sm" /> Trending tags
      </span>
      <div className="flex flex-col gap-2.5">
        {data.tags.map((tag) => (
          <div key={tag._id} className="flex items-center gap-2">
            <span
              className="text-[10px] font-medium w-24 truncate"
              style={{ color: tag.color }}
            >
              {tag.name}
            </span>
            <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(tag.count / max) * 100}%`,
                  background: tag.color,
                }}
              />
            </div>
            <span className="text-[10px] text-gray-500 w-4 text-right">
              {tag.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
function SingleTechCommunity() {
  const { communityId } = useParams();
  const {
    communityDetails: community,
    commLoading,
    getCommunitDetails,
  } = useGetSingleTechCommunity(communityId);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "discussions";

  const currentUserEmail = getItem("email");
  const currentUserRole = getItem("role");

  const {
    posts,
    loading: feedLoad,
    hasMore: feedHashMore,
    postCount,
    setPosts,
  } = useGetPostsByCommunity(community?.name);

  const {
    members,
    coordinators,
    page,
    setPage,
    hasMore,
    loading,
    fetchAuthors,
  } = useGetAllMembersByDomain(communityId);
  // const discussions =discussionsSample

  const { discussions, loading: discussionLoading } = useGetDiscussions(
    communityId,
    { category: "", limit: 20 },
  );

  // console.log("posts", posts);
  // console.log("members", members);
  // console.log("coordinators", coordinators);
  // console.log("communityId", communityId)
  // console.log("discussions", discussions)
  useEffect(() => {
    fetchAuthors();
  }, [communityId]);

  const canEditCommunity =
    currentUserRole === "admin" ||
    currentUserRole === "director" ||
    community?.userRole === "coordinator" ||
    coordinators.some((coord) => coord.authorId?.email === currentUserEmail);

  const leaderboard = leaderboardSample;
  const trendingTags = trendingTagsSample;

  const style = getDomainStyle(community?.name);
  const gradient = deriveGradient(community?.colorTheme);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const accentColor = community?.colorTheme ?? style.from;

  // console.log("community", community);
  console.log("discussions", discussions);

  return (
    <div className="min-h-screen theme text-white flex flex-col">
      <NavBar />
      <span className="text-[9px] md:pt-2 py-2 md:pb-0  px-4 md:px-20 max-w-[1800px] mx-auto w-full animate-pulse font-semibold ">
        This site is under construction, still some of the features are under
        development, feel free to explore the platform 😊.{" "}
      </span>

      <div className="flex-grow px-4 md:px-20 max-w-[1800px] mx-auto w-full pb-20 md:pt-4">
        <CommunityBanner
          community={community}
          style={style}
          loader={commLoading}
          communityId={communityId}
          canEdit={canEditCommunity}
        />

        {/* ── Tab bar ── */}
        <div className="sticky top-0 z-20 mt-1 md:mt-4 bg-[#020617]/90 backdrop-blur-sm">
          <TabBar
            active={activeTab}
            theme={gradient?.from}
            onChange={handleTabChange}
          />
        </div>

        {/* ── Two-column layout: main + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          {/* ── Main column ── */}
          <div>
            {activeTab === "feed" && (
              <FeedTab
                posts={posts}
                setPosts={setPosts}
                feedLoad={feedLoad}
                feedHashMore={feedHashMore}
              />
            )}
            {activeTab === "discussions" && (
              <DiscussionsTab
                discussions={discussions}
                discussionLoading={discussionLoading}
                community={community}
                accentColor={accentColor}
                currentUserEmail={currentUserEmail}
                userRole={community.userRole}
              />
            )}
            {activeTab === "members" && (
              <MembersTab members={members} coordinators={coordinators} />
            )}
          </div>

          {/* ── Sidebar — sticky, always visible regardless of tab ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-4">
            <LeaderboardCard data={leaderboard} />
            <TrendingTagsCard data={trendingTags} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SingleTechCommunity;
