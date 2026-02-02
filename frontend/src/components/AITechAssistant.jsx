import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { SiGooglegemini } from "react-icons/si";
import user from "../images/user.png";
import blog1 from "../images/img_not_found.png";
export default function AITechAssistant({ currentPostId }) {
  const username = localStorage.getItem("username");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const assistantURL = import.meta.env.VITE_TECH_ASSISTANT_URL;
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${username}! Cusrious to learn more about this post?\n\n Not sure what to ask? Choose something:`,
      videos: [],
      posts: [],
      suggestedQueries: [
        "summarise the post",
        "recommend related content",
        "suggest videos",
      ],
    },
  ]);

  const askAI = async () => {
    if (!query.trim()) return;

    const userMessage = {
      role: "user",
      content: query,
    };
    // console.log("current post id in assistant:", currentPostId);
    setMessages((prev) => [...prev, userMessage]);
    setQuery(""); // clear input immediately

    setLoading(true);

    try {
      const res = await axios.post(`${assistantURL}/ask`, {
        query,
        current_post_id: currentPostId,
      });
      const aiMessage = {
        role: "assistant",
        content: res.data.content,
        videos: res.data.videos,
        posts: res.data.posts,
        suggestedQueries: res.data.suggestions || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  //     if (!query.trim()) return;

  //     setLoading(true);
  //     const res = await axios.post("http://localhost:5000/ask", {
  //       query,
  //       current_post_id: "6753cc365b6890898f64cc5e",
  //     });
  //     const aiMessage = {
  //       role: "assistant",
  //       content: res.data.content,
  //       videos: res.data.videos,
  //       posts: res.data.posts
  //     };

  //     setMessages(prev => [...prev, aiMessage]);

  //     setData(res.data);
  //     setLoading(false);
  //   };
  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
    );
    return match ? match[1] : null;
  };

  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let start = el.scrollTop;
    let end = el.scrollHeight - el.clientHeight;
    let duration = 300;
    let startTime = null;

    function animate(time) {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);

      el.scrollTop = start + (end - start) * progress;

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [messages, loading]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleQueryClick = async (e) => {
    e.preventDefault();
   
     setTimeout(() =>askAI(), 1);
  };

  return (
    <>
      {/* Floating Ask Button (Mobile) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className=" bottom-4 flex items-center gap-2 right-4 bg-white text-black text-sm px-5 py-2 rounded-full md:hidden z-50 shadow-xl"
        >
          Ask AI  <SiGooglegemini />
        </button>
      )}

      {/* Assistant Panel */}
      <div
        className={`
      fixed md:static bottom-0 right-0
      w-full md:w-full
      h-[75vh] md:h-[520px]
       text-white
       bg-[#0f0f0f]
      border-l border-neutral-800
      transform transition-transform duration-300
      ${open ? "translate-y-0" : "translate-y-full md:translate-y-0"}
      z-40 flex flex-col  md:rounded-xl
    `}
      >
        {/* Header */}
        <div className="relative p-4 border-b text-xl border-neutral-800 flex justify-between items-center">
          <h2 className="font-bold ">
            Ask about this post <SiGooglegemini />
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 md:hidden text-base md:text-base text-neutral-400"
          >
            ✕
          </button>
        </div>

        {/* Timeline */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-8"
        >
          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              ref={bottomRef}
              key={idx}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
            >
              {/* User bubble */}
              {msg.role === "user" && (
                <div className="text-right">
                  <div className="inline-block bg-white text-black px-4 py-2 rounded-2xl text-sm max-w-[85%]">
                    {msg.content}
                  </div>
                </div>
              )}

              {/* Assistant bubble */}
              {msg.role === "assistant" && (
                <div className="space-y-6 transition-all ">
                  {/* Content */}
                  {msg.content && (
                    // <div className="md:bg-[#1a1a1a] md:border border-neutral-800 md:p-4 rounded-2xl">
                    <div className="md:p-2">
                      <div className="prose prose-invert  max-w-none text-sm leading-loose space-y-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-3 text-white text-sm leading-relaxed font-normal text-neutral-300">
                                {children}
                              </p>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold mb-2 text-white">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-semibold mb-2 text-white">
                                {children}
                              </h2>
                            ),
                            strong: ({ children }) => (
                              <strong className="text-white font-normal text-sm">
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {msg.videos?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-neutral-300">
                        Recommended videos
                      </h3>

                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {msg.videos.map((v, i) => {
                          const id = getYouTubeId(v.url);
                          if (!id) return null;

                          return (
                            <a
                              key={i}
                              href={v.url}
                              target="_blank"
                              className="min-w-[240px] max-w-[240px] bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-hidden hover:bg-neutral-800 transition"
                            >
                              {/* Thumbnail */}
                              <div className="relative">
                                <img
                                  src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                  className="w-full h-36 object-cover"
                                />
                                <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1.5 py-0.5 rounded">
                                  ▶
                                </div>
                              </div>

                              {/* Title */}
                              <div className="p-2">
                                <p className="text-sm font-medium line-clamp-2 text-neutral-200">
                                  {v.title || "YouTube video"}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  {msg.posts?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-neutral-300">
                        Related posts
                      </h3>

                      <div className="overflow-x-auto  pb-2 scrollbar-hide flex gap-2">
                        {msg.posts.map((p, i) => (
                          <Link
                            key={i}
                            to={`/viewpage/${p.authorEmail}/${p.postId}`}
                            onClick={() => setOpen(false)}
                            // bg-[#121212]
                            // border border-neutral-800
                            //   hover:border-neutral-700
                            className="
                              group min-w-40 max-w-40
                              rounded-2xl
                              overflow-hidden
                              transition-all duration-300
                              h-fit
                              hover:shadow-xl hover:shadow-black/40
                            "
                          >
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                // src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.image}`}
                                src={
                                  p.image
                                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.image}`
                                    : blog1
                                }
                                // className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                className="w-full h-full object-cover"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                              {/* <div className="absolute top-2 left-3 bg-black/80 text-[11px] px-2 py-0.5 rounded-full border border-neutral-700">
                                {p.category}
                              </div> */}
                            </div>

                            <div className="pl-2 mt-2 space-y-1">
                              <p className="text-sm font-semibold leading-snug line-clamp-2 text-neutral-100">
                                {p.title}
                              </p>

                              <div className="flex gap-1 items-center">
                                <img
                                  // src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`}

                                  src={
                                    p.profile
                                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`
                                      : user
                                  }
                                  className="w-7 h-7 rounded-full object-cover bg-white border border-neutral-700"
                                />

                                <div className="min-w-0 flex-col">
                                  <p className="text-xs text-neutral-300 truncate">
                                    {p.authorName}
                                  </p>
                                  {/* <p className="text-[11px] text-neutral-500 truncate">
                                      {p.authorEmail}
                                    </p> */}
                                </div>
                              </div>

                              {/* <div className="flex justify-between text-[11px] text-neutral-500">
                                  <span>{p.links?.length >0 ? p.links?.length : ''} resources</span>
                                  <span>Community</span>
                                </div> */}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Queries */}
                  {msg.suggestedQueries?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {msg.suggestedQueries.map((s, i) => (
                        <button
                          key={i}
                          onClick={async(e) => {
                            setQuery(s);
                            await handleQueryClick(e);
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-full text-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="space-y-6 animate-pulse">
              {/* Typing bubble */}

              {/* Skeleton text */}
              <div className="bg-[#1a1a1a] border border-neutral-800 p-4 rounded-2xl space-y-4">
                {/* Title shimmer */}
                <div className="h-4 w-2/3 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-shimmer" />

                {/* Line 1 */}
                <div className="h-3 w-full rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-shimmer" />

                {/* Line 2 */}
                <div className="h-3 w-[95%] rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-shimmer" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-neutral-800 rounded-b-xl flex gap-2 bg-[#0f0f0f]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askAI()}
            placeholder="Ask something..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none"
          />

          <button
            onClick={askAI}
            className="bg-white text-black px-4 rounded-xl text-sm text-base block"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
