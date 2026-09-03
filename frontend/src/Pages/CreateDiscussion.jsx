import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as TbIcons from "react-icons/tb";
import NavBar from "../ui/NavBar";
import axiosInstance from "../instances/Axiosinstances";
import { getItem } from "../utils/encode";
import { renderMarkdown } from "../utils/markdownRenderer";
import {
  TbArrowLeft,
  TbBold,
  TbItalic,
  TbCode,
  TbList,
  TbListNumbers,
  TbBlockquote,
  TbH1,
  TbH2,
  TbLink,
  TbEye,
  TbPencil,
  TbX,
  TbPlus,
  TbSearch,
  TbTag,
  TbAlertCircle,
  TbSend,
  TbFileText,
  TbCheck,
  TbChevronDown,
  TbPhoto,
} from "react-icons/tb";
import userPlaceholder from "../images/user.png";
import toast from "../components/toaster/Toast";
import useCommunityPosts from "../hooks/SingleTechDomain/useCommunityPosts";
import getTimeAgo from "../components/DateCovertion";

// ── Constants ─────────────────────────────────────────────────────────────────
const S3 = "https://open-access-blog-image.s3.us-east-1.amazonaws.com/";
const av = (p) => (p ? `${S3}${p}` : userPlaceholder);

const CATEGORIES = [
  { value: "qa", label: "Q&A", desc: "Ask a question" },
  { value: "idea", label: "Idea", desc: "Suggest something" },
  { value: "showcase", label: "Show & tell", desc: "Share your work" },
  { value: "announcement", label: "Announcement", desc: "Coordinator only" },
];

const CATEGORY_COLORS = {
  qa: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  idea: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  showcase: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  announcement: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

const TAG_PRESET_COLORS = [
  "#0d9488",
  "#059669",
  "#2563eb",
  "#7c3aed",
  "#ea580c",
  "#e11d48",
  "#0284c7",
  "#d97706",
];

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Sample data — replace with real hooks ─────────────────────────────────────
// useGetCommunityTags(communityId)    → tags
// useGetCommunityFeed(communityId)    → posts
// useGetCommunityById(communityId)    → community

const SAMPLE_TAGS = [
  { _id: "tag001", name: "fine-tuning", color: "#0d9488" },
  { _id: "tag002", name: "lora", color: "#7c3aed" },
  { _id: "tag003", name: "prompting", color: "#ea580c" },
  { _id: "tag004", name: "rag", color: "#2563eb" },
  { _id: "tag005", name: "transformers", color: "#059669" },
];

// const SAMPLE_POSTS = [
//   {
//     _id: "post001",
//     title: "Evaluating LLMs using LangSmith",
//     image: "",
//     authorId: { authorName: "Yugesh Karan", profile: "" },
//     timestamp: new Date(Date.now() - 86400000).toISOString(),
//   },
//   {
//     _id: "post002",
//     title: "Multi-Agent System using LangGraph",
//     image: "",
//     authorId: { authorName: "Yugesh Karan", profile: "" },
//     timestamp: new Date(Date.now() - 172800000).toISOString(),
//   },
//   {
//     _id: "post003",
//     title: "Supervised Machine Learning",
//     image: "",
//     authorId: { authorName: "haricharan_1133", profile: "" },
//     timestamp: new Date(Date.now() - 259200000).toISOString(),
//   },
//   {
//     _id: "post004",
//     title: "Reinforcement Learning from scratch",
//     image: "",
//     authorId: { authorName: "Kumaran", profile: "" },
//     timestamp: new Date(Date.now() - 345600000).toISOString(),
//   },
//   {
//     _id: "post005",
//     title: "Computer Vision with PyTorch",
//     image: "",
//     authorId: { authorName: "haricharan_1133", profile: "" },
//     timestamp: new Date(Date.now() - 432000000).toISOString(),
//   },
// ];

// ─────────────────────────────────────────────────────────────────────────────
//  MARKDOWN EDITOR
// ─────────────────────────────────────────────────────────────────────────────

const MD_TOOLBAR = [
  {
    icon: TbBold,
    action: "bold",
    title: "Bold",
    wrap: ["**", "**"],
    placeholder: "bold text",
  },
  {
    icon: TbItalic,
    action: "italic",
    title: "Italic",
    wrap: ["*", "*"],
    placeholder: "italic text",
  },
  {
    icon: TbCode,
    action: "code",
    title: "Inline code",
    wrap: ["`", "`"],
    placeholder: "code",
  },
  { icon: null, action: "divider" },
  { icon: TbH1, action: "h1", title: "Heading 1", prefix: "# " },
  { icon: TbH2, action: "h2", title: "Heading 2", prefix: "## " },
  { icon: null, action: "divider" },
  { icon: TbList, action: "ul", title: "Bullet list", prefix: "- " },
  { icon: TbListNumbers, action: "ol", title: "Numbered list", prefix: "1. " },
  {
    icon: TbBlockquote,
    action: "blockquote",
    title: "Blockquote",
    prefix: "> ",
  },
  { icon: null, action: "divider" },
  { icon: TbCode, action: "codeblock", title: "Code block", block: true },
  { icon: TbLink, action: "link", title: "Link", link: true },
];

const MarkdownEditor = ({ value, onChange }) => {
  const [tab, setTab] = useState("write"); // 'write' | 'preview'
  const textareaRef = useRef();

  const applyAction = useCallback(
    (item) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = value.slice(start, end);
      let newVal = value;
      let newCursor = start;

      if (item.wrap) {
        const [open, close] = item.wrap;
        const text = selected || item.placeholder;
        newVal = value.slice(0, start) + open + text + close + value.slice(end);
        newCursor = start + open.length + text.length + close.length;
      } else if (item.prefix) {
        // apply prefix to each selected line
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineEnd = value.indexOf("\n", end);
        const segment = value.slice(
          lineStart,
          lineEnd === -1 ? undefined : lineEnd,
        );
        const prefixed = segment
          .split("\n")
          .map((l) => (l.startsWith(item.prefix) ? l : item.prefix + l))
          .join("\n");
        newVal =
          value.slice(0, lineStart) +
          prefixed +
          (lineEnd === -1 ? "" : value.slice(lineEnd));
        newCursor = lineStart + prefixed.length;
      } else if (item.block) {
        const fence = "```\n" + (selected || "your code here") + "\n```";
        newVal = value.slice(0, start) + fence + value.slice(end);
        newCursor = start + fence.length;
      } else if (item.link) {
        const text = selected || "link text";
        const link = `[${text}](url)`;
        newVal = value.slice(0, start) + link + value.slice(end);
        newCursor = start + link.length;
      }

      onChange(newVal);
      // restore cursor after React re-render
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(newCursor, newCursor);
      });
    },
    [value, onChange],
  );

  return (
    <div className="theme border border-[#1e293b] rounded-xl overflow-hidden focus-within:border-white/15 transition-colors">
      {/* toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[#1e293b] flex-wrap">
        {/* write / preview tabs */}
        <div className="flex gap-1 mr-3">
          {["write", "preview"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg capitalize transition-colors ${
                tab === t
                  ? "bg-white/8 text-gray-200"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t === "write" ? (
                <>
                  <TbPencil className="inline text-xs mr-1" />
                  Write
                </>
              ) : (
                <>
                  <TbEye className="inline text-xs mr-1" />
                  Preview
                </>
              )}
            </button>
          ))}
        </div>

        {tab === "write" && (
          <>
            <div className="w-px h-4 bg-white/10 mx-1" />
            {MD_TOOLBAR.map((item, i) => {
              if (item.action === "divider") {
                return <div key={i} className="w-px h-4 bg-white/10 mx-1" />;
              }
              const Icon = item.icon;
              return (
                <button
                  key={item.action}
                  type="button"
                  title={item.title}
                  onClick={() => applyAction(item)}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
                >
                  <Icon className="text-sm" />
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* write area */}
      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Write your discussion body here...\n\nSupports **bold**, *italic*, \`code\`, headings, lists, and code blocks.`}
          rows={14}
          className="w-full bg-transparent px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-y focus:outline-none font-mono leading-relaxed"
        />
      ) : (
        <div
          className="px-4 py-3 min-h-[200px] prose-discussion"
          dangerouslySetInnerHTML={{
            __html: value.trim()
              ? renderMarkdown(value)
              : '<p class="md-p text-gray-600">Nothing to preview yet.</p>',
          }}
        />
      )}

      <div className="flex items-center justify-between px-4 py-2 border-t border-[#1e293b]">
        <p className="text-[10px] text-gray-600">
          Markdown supported ·{" "}
          <a
            href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-400"
          >
            syntax guide
          </a>
        </p>
        <p className="text-[10px] text-gray-600">{value.length} chars</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  TAG SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
const TagSelector = ({
  communityId,
  existingTags,
  selectedIds,
  onToggle,
  onTagCreated,
  canCreate,
}) => {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_PRESET_COLORS[0]);
  const [savingTag, setSavingTag] = useState(false);
  const [tagError, setTagError] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return existingTags;
    return existingTags?.filter((t) => t.name.includes(q));
  }, [existingTags, query]);

  const showCreateOption =
    canCreate &&
    query.trim().length > 0 &&
    !existingTags?.some(
      (t) => t.name.toLowerCase() === query.toLowerCase().trim(),
    );

  const handleCreate = async () => {
    const name = (creating ? newTagName : query).trim();
    if (!name) return;
    setSavingTag(true);
    setTagError("");
    try {
      const res = await axiosInstance.post(
        `/bytes/discuss/${communityId}/tags`,
        { name, color: newTagColor },
      );
      onTagCreated(res.data.tag);
      onToggle(res.data.tag._id);
      setQuery("");
      setNewTagName("");
      setCreating(false);
    } catch (err) {
      setTagError(err?.response?.data?.message || "Failed to create tag");
    } finally {
      setSavingTag(false);
    }
  };

  return (
    <div className="theme border border-[#1e293b] rounded-xl overflow-hidden">
      {/* search */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e293b]">
        <TbSearch className="text-gray-500 text-xs flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCreating(false);
          }}
          placeholder="Search or create a tag..."
          className="bg-transparent text-xs text-gray-200 placeholder-gray-600 focus:outline-none flex-1"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-gray-500 hover:text-gray-300"
          >
            <TbX className="text-xs" />
          </button>
        )}
      </div>

      {/* tag list */}
      <div className="max-h-40 overflow-y-auto overflow-x-hidden emerald-scrollbar p-2">
        {filtered.length === 0 && !showCreateOption && (
          <p className="text-[10px] text-gray-600 text-center py-4">
            {canCreate
              ? "No tags found. Type a name to create one."
              : "No tags found."}
          </p>
        )}

        {filtered.map((tag) => {
          const selected = selectedIds.includes(tag._id);
          return (
            <button
              key={tag._id}
              type="button"
              onClick={() => onToggle(tag._id)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: tag.color }}
              />
              <span className="text-xs text-gray-300 flex-1">{tag.name}</span>
              {selected && <TbCheck className="text-xs text-emerald-400" />}
            </button>
          );
        })}

        {/* inline create option */}
        {showCreateOption && !creating && (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setNewTagName(query);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
          >
            <TbPlus className="text-xs text-emerald-400" />
            <span className="text-xs text-emerald-400">
              Create tag "<b>{query}</b>"
            </span>
          </button>
        )}
      </div>

      {/* color picker for new tag */}
      {creating && (
        <div className="border-t border-[#1e293b] p-3">
          <p className="text-[10px] text-gray-400 mb-2 font-medium">
            New tag: <b className="text-gray-200">{newTagName}</b>
          </p>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {TAG_PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewTagColor(c)}
                className="w-5 h-5 rounded-full hover:scale-110 transition-transform relative"
                style={{ background: c }}
              >
                {newTagColor === c && (
                  <TbCheck className="absolute inset-0 m-auto text-white text-[8px]" />
                )}
              </button>
            ))}
          </div>
          {tagError && (
            <p className="text-[10px] text-red-400 mb-2">{tagError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={savingTag}
              className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40"
            >
              {savingTag ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-[10px] text-gray-500 hover:text-gray-300 px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  LINKED POST PANEL
// ─────────────────────────────────────────────────────────────────────────────
const LinkedPostPanel = ({
  posts,
  selectedPost,
  onSelect,
  onClose,
  hasMore,
  isLoading,
  onLoadMore,
}) => {
  const [query, setQuery] = useState("");
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(q));
  }, [posts, query]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isLoading || !hasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="theme border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
        <span className="text-xs font-semibold text-gray-300">
          Link a post from this community
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <TbX className="text-sm" />
        </button>
      </div>

      <div className="p-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
          <TbSearch className="text-gray-500 text-xs flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title..."
            className="bg-transparent text-xs text-gray-200 placeholder-gray-600 focus:outline-none flex-1"
          />
        </div>
      </div>

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="max-h-64 emerald-scrollbar overflow-y-auto"
      >
        {/* clear selection */}
        {selectedPost && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-white/5 border-b border-[#1e293b] transition-colors"
          >
            <TbX className="text-xs text-gray-500" />
            <span className="text-xs text-gray-500">Remove link</span>
          </button>
        )}

        {filtered.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-8">
            No posts found.
          </p>
        ) : (
          filtered.map((post) => {
            const isSelected = selectedPost?._id === post._id;
            return (
              <button
                key={post._id}
                type="button"
                onClick={() => {
                  onSelect(post);
                  onClose();
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-white/5 transition-colors text-left ${
                  isSelected ? "bg-emerald-500/5" : ""
                }`}
              >
                {post.image ? (
                  <img
                    src={`${S3}${post.image}`}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-700 flex-shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <TbFileText className="text-gray-600 text-base" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">
                    {post.title}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {post.authorId?.authorName} · {getTimeAgo(post.timestamp)}
                  </p>
                </div>
                {isSelected && (
                  <TbCheck className="text-emerald-400 text-sm flex-shrink-0" />
                )}
              </button>
            );
          })
        )}

        {isLoading && (
          <div className="px-4 py-3 text-[10px] text-gray-400 text-center">
            Loading more posts...
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
function CreateDiscussion() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const currentUserRole = getItem("role");
  const isCoordinator =
    currentUserRole === "coordinator" ||
    currentUserRole === "admin" ||
    currentUserRole === "director";

  // ── Form state ────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("qa");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [linkedPost, setLinkedPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
    const [whoCanPost, setWhoCanPost] = useState("");

    const getCommunitySettings = async() => {
      try{

        const res = await axiosInstance.get(`/bytes/discuss/${communityId}/settings`);
        if (res.status===200)
        {
                  // console.log("res settings data", res.data)
          setWhoCanPost(res.data.settings?.whoCanPost)
        }

      }
      catch(err)
      {
        console.log("error fetching community settings", err.message)
      }
    }

    useEffect(()=> {
      getCommunitySettings()
    },[communityId])

  // ── Data state ────────────────────────────────────────────────────────────
  // Replace with real hooks:
  // const { tags, refetch: refetchTags } = useGetCommunityTags(communityId);
  // const { posts }                       = useGetCommunityFeed(communityId);
  // const { settings }                    = useGetCommunitySettings(communityId);
  const [tags, setTags] = useState([]);

  const getTags = async () => {
    try {
      const res = await axiosInstance.get(`/bytes/discuss/${communityId}/tags`);
      //  console.log("res data", res.data)
      if (res.status === 200) {

        setTags(res.data.tags);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getTags();
  }, [communityId]);
  // const posts = SAMPLE_POSTS;
 // swap for settings.whoCanPost

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showPostPanel, setShowPostPanel] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef();
  const {
    posts,
    totalCount,
    totalPages,
    hasMore,
    isLoading,
    error,
    fetchCommunityPosts,
    loadMorePosts,
  } = useCommunityPosts(communityId);


  // close category dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target))
        setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // redirect if no permission
  useEffect(() => {
    if (!isCoordinator && whoCanPost === "coordinator") {
      navigate(`/techCommunityDetails/${communityId}?tab=discussions`);
    }
  }, [isCoordinator, whoCanPost, communityId, navigate]);

  // console.log("whoCanPost", whoCanPost)

  // can user create tags?
  const canCreateTag = isCoordinator || whoCanPost === "member";

  const selectedCategory = CATEGORIES.find((c) => c.value === category);

  const toggleTag = useCallback((tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }, []);

  const handleTagCreated = useCallback((newTag) => {
    setTags((prev) => [...prev, newTag]);
  }, []);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (title.trim().length > 300)
      e.title = "Title must be under 300 characters.";
    if (!body.trim()) e.body = "Body is required.";
    if (!isCoordinator && category === "announcement")
      e.category = "Only coordinators can post announcements.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    setLoading(true);

    try {
      const res = await axiosInstance.post(
        `/bytes/discuss/${communityId}/discussions`,
        {
          category,
          title: title.trim(),
          body: body.trim(),
          tags: selectedTagIds,
          linkedPostId: linkedPost?._id || null,
        },
      );
      if (res.status === 201) {
        toast.success("Discussion created Successfully !");
        navigate(`/techCommunityDetails/${communityId}`);
      }
    } catch (err) {
      setErrors({
        submit: err?.response?.data?.message || "Failed to post. Try again.",
      });
      setSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Selected tags display ─────────────────────────────────────────────────
  const selectedTags = tags?.filter((t) => selectedTagIds.includes(t._id));

  // console.log("posts", posts)
  // console.log("tags", tags);

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen theme text-white flex flex-col">
      <NavBar />

      <div className="flex-grow px-4 md:px-8 max-w-[900px] mx-auto w-full pb-20 pt-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to={`/techCommunityDetails/${communityId}`}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <TbArrowLeft className="text-sm" /> Back to discussions
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ── Category picker ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Category
            </label>
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setCategoryOpen((v) => !v)}
                className={`flex items-center justify-between w-full md:w-64 px-4 py-2.5 rounded-xl border text-xs transition-colors ${
                  CATEGORY_COLORS[category]
                    ? `${CATEGORY_COLORS[category]}`
                    : "border-[#1e293b] text-gray-300"
                }`}
              >
                <span className="font-medium">{selectedCategory?.label}</span>
                <TbChevronDown
                  className={`text-sm transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {categoryOpen && (
                <div className="absolute top-12 left-0 z-50 w-64 theme border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl py-1">
                  {CATEGORIES.map((cat) => {
                    const isDisabled =
                      cat.value === "announcement" && !isCoordinator;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          setCategory(cat.value);
                          setCategoryOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                          category === cat.value
                            ? "bg-white/5"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div>
                          <p className="text-xs text-gray-200 font-medium">
                            {cat.label}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {cat.desc}
                          </p>
                        </div>
                        {category === cat.value && (
                          <TbCheck className="text-emerald-400 text-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.category && (
              <p className="text-[10px] text-red-400 mt-1">{errors.category}</p>
            )}
          </div>

          {/* ── Title ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write a clear, specific title..."
              maxLength={300}
              className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors ${
                errors.title ? "border-red-500/40" : "border-[#1e293b]"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.title ? (
                <p className="text-[10px] text-red-400 flex items-center gap-1">
                  <TbAlertCircle className="text-xs" /> {errors.title}
                </p>
              ) : (
                <span />
              )}
              <p className="text-[10px] text-gray-600">{title.length}/300</p>
            </div>
          </div>

          {/* ── Body — Markdown editor ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Body <span className="text-red-400">*</span>
            </label>
            <MarkdownEditor value={body} onChange={setBody} />
            {errors.body && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <TbAlertCircle className="text-xs" /> {errors.body}
              </p>
            )}
          </div>

          {/* ── Tags ── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-2">
              <TbTag className="text-sm" /> Tags
              <span className="text-gray-600 font-normal ml-1">— optional</span>
            </label>

            {/* selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag._id}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
                    style={{ background: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag._id)}
                      className="hover:opacity-70"
                    >
                      <TbX className="text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <TagSelector
              communityId={communityId}
              existingTags={tags}
              selectedIds={selectedTagIds}
              onToggle={toggleTag}
              onTagCreated={handleTagCreated}
              canCreate={canCreateTag}
            />
          </div>

          {/* ── Linked post ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                <TbFileText className="text-sm" /> Link a post
                <span className="text-gray-600 font-normal ml-1">
                  — optional
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowPostPanel((v) => !v)}
                className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPostPanel ? (
                  <>
                    <TbX className="text-xs" /> Close
                  </>
                ) : (
                  <>
                    <TbSearch className="text-xs" /> Browse posts
                  </>
                )}
              </button>
            </div>

            {/* linked post preview */}
            {linkedPost && !showPostPanel && (
              <div className="flex items-center gap-3 px-4 py-3 theme border border-[#1e293b] rounded-xl">
                {linkedPost.image ? (
                  <img
                    src={`${S3}${linkedPost.image}`}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-700 flex-shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <TbFileText className="text-gray-600 text-base" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">
                    {linkedPost.title}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {linkedPost.authorId?.authorName} ·{" "}
                    {getTimeAgo(linkedPost.timestamp)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkedPost(null)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <TbX className="text-sm" />
                </button>
              </div>
            )}

            {showPostPanel && (
              <LinkedPostPanel
                posts={posts}
                selectedPost={linkedPost}
                onSelect={setLinkedPost}
                onClose={() => setShowPostPanel(false)}
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={loadMorePosts}
              />
            )}
          </div>

          {/* ── Submit error ── */}
          {errors.submit && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              <TbAlertCircle className="text-sm flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <Link
              to={`/techCommunityDetails/${communityId}`}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !body.trim()}
              className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
            >
              <TbSend className="text-sm" />
              {submitting ? "Posting..." : "Post discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDiscussion;
