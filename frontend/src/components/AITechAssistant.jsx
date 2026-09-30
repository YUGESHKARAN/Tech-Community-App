// import { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";
// import { Link } from "react-router-dom";
// import remarkGfm from "remark-gfm";
// import remarkBreaks from "remark-breaks";
// import { SiGoogleassistant, SiGooglegemini } from "react-icons/si";
// import user from "../images/user.png";
// import blog1 from "../images/img_not_found.png";
// import { VscSend } from "react-icons/vsc";
// import { IoSendSharp } from "react-icons/io5";
// import { GoArrowUpRight } from "react-icons/go";
// import logoicon from "../assets/assistant_1.png"
// import { getItem } from "../utils/encode";
// import { getSessionItem } from "../utils/sessionEncode";

// export default function AITechAssistant({
//   currentPostId,
//   category,
//   viewComments=null,
//   setViewComments=null,
// }) {
//   // const username = localStorage.tItem("username");
//   const username = getItem("username");
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const token = getSessionItem("token");
//   const assistantURL = import.meta.env.VITE_TECH_ASSISTANT_URL;
//   const [isInputFocused, setIsInputFocused] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: `Hello ${username}! Cusrious to learn more about this post?\n\n Not sure what to ask? Choose something:`,
//       videos: [],
//       posts: [],
//       suggestedQueries: [
//         "summarise the post",
//         "recommend related content",
//         "suggest videos",
//       ],
//     },
//   ]);

//   const askAI = async (customQuery) => {
//     const finalQuery = customQuery || query;
//     setIsInputFocused(false);
//     if (!finalQuery.trim()) return;

//     // console.log("finalQuery", finalQuery)

//     const userMessage = {
//       role: "user",
//       content: finalQuery,
//     };
//     // console.log("current post id in assistant:", currentPostId);
//     setMessages((prev) => [...prev, userMessage]);
//     setQuery(""); // clear input immediately

//     setLoading(true);

//     try {
//       const res = await axios.post(
//         `${assistantURL}/ask`,
//         {
//           query: finalQuery,
//           current_post_id: currentPostId,
//           category,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       let aiMessage = {
//         role: "assistant",
//         content: res.data.content,
//         videos: res.data.videos,
//         posts: res.data.posts,
//         suggestedQueries: res.data.suggestions || [],
//       };

//       // console.log("AI response", aiMessage);

//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (err) {
//       console.log("Full error:", err);

//       let content = "Something went wrong. Please try again.";

//       if (err.response) {
//         console.log("Status:", err.response.status);
//         console.log("Response data:", err.response.data);

//         if (err.response.status === 429) {
//           content = "Too many requests. Please slow down.";
//         } else if (err.response.status === 400) {
//           content = err.response.data?.content || "Invalid request.";
//         }
//       }

//       const aiMessage = {
//         role: "assistant",
//         content,
//         videos: null,
//         posts: null,
//         suggestedQueries: [],
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getYouTubeId = (url) => {
//     const match = url.match(
//       /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
//     );
//     return match ? match[1] : null;
//   };
//   const lastUserRef = useRef(null);

//   const containerRef = useRef(null);

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el || messages.length === 0) return;

//     const lastMessage = messages[messages.length - 1];

//     // Scroll only when user sends message
//     if (lastMessage.role === "user") {
//       const start = el.scrollTop;
//       const end = el.scrollHeight - el.clientHeight;

//       let duration = 250;
//       let startTime = null;

//       function animate(time) {
//         if (!startTime) startTime = time;
//         const progress = Math.min((time - startTime) / duration, 1);

//         el.scrollTop = start + (end - start) * progress;

//         if (progress < 1) requestAnimationFrame(animate);
//       }

//       requestAnimationFrame(animate);
//     }
//   }, [messages]);
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   // const handleQueryClick = async (e) => {
//   //   e.preventDefault();

//   //   setTimeout(() => askAI(), 1);
//   // };

//   const handleQueryClick = async (suggestion) => {
//     setQuery(suggestion);
//     askAI(suggestion);
//   };

//   const lastUserIndex = [...messages]
//     .map((m, i) => (m.role === "user" ? i : -1))
//     .filter((i) => i !== -1)
//     .pop();

//   useEffect(() => {
//     const container = containerRef.current;
//     const userMessage = lastUserRef.current;

//     if (!container || !userMessage) return;

//     const start = container.scrollTop;
//     const end = userMessage.offsetTop - 30; // slight padding
//     const duration = 350;

//     let startTime = null;

//     function animateScroll(time) {
//       if (!startTime) startTime = time;

//       const progress = Math.min((time - startTime) / duration, 1);

//       container.scrollTop = start + (end - start) * progress;

//       if (progress < 1) {
//         requestAnimationFrame(animateScroll);
//       }
//     }

//     requestAnimationFrame(animateScroll);
//   }, [messages]);

//   useEffect(() => {
//     if (viewComments) {
//       setOpen(false);
//     }
//   }, [viewComments]);

//    const textareaRef = useRef(null);
  
//     useEffect(()=>{
//       const el = textareaRef.current;
  
//       if(!el) return;
  
//       el.style.height = "auto";
//       el.style.height = Math.min(el.scrollHeight, 200) + "px";
//     },[query]);

//      const textareaRef2 = useRef(null);
  
//     useEffect(()=>{
//       const el = textareaRef2.current;
  
//       if(!el) return;
  
//       el.style.height = "auto";
//       el.style.height = Math.min(el.scrollHeight, 200) + "px";
//     },[query]);

//     const [placeholderIndex, setPlaceholderIndex] = useState(0);
//       const [isFocused, setIsFocused] = useState(false);
    
//       const PLACEHOLDERS = [
//        "summarise the post...",
//         "recommend related content...",
//         "suggest videos...",
//       ];
    
//       useEffect(() => {
//         if (isFocused || query) return;
    
//         const t = setInterval(() => {
//           setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
//         }, 4000);
//         return ()=> clearInterval(t);
//       }, [isFocused, query]);
    

//   //  console.log("token", token)
//   // console.log("messages", messages )
//   return (
//     <>
//       {/* Floating Ask Button (Mobile) */}
//       {/* {!open && (
//         <button
//           onClick={() => setOpen(true)}
//           className=" bottom-4 flex items-center gap-2 right-4 bg-white text-black text-xs md:text-sm md:px-5 px-3 py-2 rounded-full md:hidden z-50 shadow-xl"
//         >
//          Ask AI <SiGooglegemini />
//         </button>
//       )} */}

//       {open && (
//         <div
//           onClick={() => setOpen(false)}
//           className={`absolute inset-0 duration-300 ${
//             open
//               ? "bg-black/60 backdrop-blur-sm transition-opacity"
//               : "opacity-0"
//           }`}
//         />
//       )}

//       {/* {!open && (
//         <button
//           onClick={() => setOpen(true)}
//           className=" bottom-4 flex items-center gap-2 right-4 bg-gray-900 hover:theme-fields-lite border border-neutral-700 text-emerald-400 text-sm md:px-5 px-3 py-1 rounded-full md:hidden z-50 shadow-xl"
//         >
//          AI <SiGooglegemini />
//         </button>
//       )} */}

//       <button
//         onClick={() => setOpen(!open)}
//         className=" bottom-4 flex md:hidden items-center gap-2 right-4 bg-gray-800/50 transition-all duration-300 active:scale-95 md:border border-neutral-800 md:border-neutral-700 text-gray-300 text-xs md:px-5 px-3 py-[6px] rounded-full md:hidden z-50 shadow-xl"
//       >
//         Ask AI
//         <img src={logoicon} className="w-3 h-3 object-contain rounded-full " alt="" />
//         {/* <SiGoogleassistant /> */}
//          {/* <SiGooglegemini /> */}
//       </button>

//       {/* Assistant Panel */}
//       {/* [#0f0f0f] */}
//       {/* [#0a0f1d]  */}
//       <div
//         className={`
//       fixed md:static bottom-0 right-0

//       w-full md:w-full
//       md:relative
//       text-white
//       theme
//       md:border 
//       border-t border-[#30363d] 
//       rounded-t-2xl 
//       transform transition-transform duration-300
//       ${open ? "translate-y-0" : "translate-y-full md:translate-y-0"}
//       z-40 flex flex-col  md:rounded-xl
//       md:py-4
//           md:h-[470px]  
//           ${isInputFocused ? "h-[50vh] " : "h-[75vh]"}
//     `}
//         //  style={{ height: isInputFocused ? "50vh " : "75vh" }}
//       >
//         <div
//           onClick={() => {
//             setOpen(false);
//           }}
//           className="flex md:hidden justify-center pt-3 pb-1 shrink-0"
//         >
//           <div className="w-9 h-1 rounded-full bg-gray-600" />
//         </div>
//         {/* Header */}
//         <div className="relative p-4 border-b text-xl border-neutral-800 flex justify-between items-center">
//           <h2 className="md:font-bold font-semibold flex md:text-base items-center gap-3 ">
//             <a  href="/tech_community_assistant_user_guide.pdf"
//               target="_blank"
//               rel="noopener noreferrer">
//            <img src={logoicon} className="w-6 h-6 md:w-6 md:h-6 transition-all duration-500 cursor-pointer hover:scale-110 object-contain rounded-md " alt="" />
//            </a>
//            {/* <SiGoogleassistant />  */}
//            Ask about this post  
            
//           </h2>
//           <button
//             onClick={() => setOpen(false)}
//             className="absolute top-4 right-4 md:hidden text-xs md:text-sm text-neutral-400"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Timeline */}
//         <div
//           ref={containerRef}
//           className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 md:pt-0 space-y-8"
//         >
//           {/* Messages */}
//           {messages.map((msg, idx) => (
//             <div
//               // ref={bottomRef}
//               key={idx}
//               className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
//             >
//               {/* User bubble */}
//               {msg.role === "user" && (
//                 <div
//                   ref={idx === lastUserIndex ? lastUserRef : null}
//                   className="text-right"
//                 >
//                   <div className="inline-block text-left bg-white text-black px-4 py-2 rounded-2xl text-sm max-w-[85%]">
//                     {msg.content}
//                   </div>
//                 </div>
//               )}

//               {/* Assistant bubble */}
//               {msg.role === "assistant" && (
//                 <div className="space-y-6 transition-all ">
//                   {/* Content */}
//                   {msg.content && (
//                     // <div className="md:bg-[#1a1a1a] md:border border-neutral-800 md:p-4 rounded-2xl">
//                     <div className="md:p-2">
//                       <div className="prose prose-invert max-w-none overflow-x-auto scrollbar-hide [&_code]:break-all  max-w-none text-sm leading-loose space-y-2">
//                         <ReactMarkdown
//                           remarkPlugins={[remarkGfm, remarkBreaks]}
                        
//                           components={{
//                             p: ({ children }) => (
//                               <p className="mb-3 text-white text-sm leading-relaxed font-normal text-neutral-300">
//                                 {children}
//                               </p>
//                             ),
//                             h1: ({ children }) => (
//                               <h1 className="text-2xl font-bold mb-2 text-white">
//                                 {children}
//                               </h1>
//                             ),
//                             h2: ({ children }) => (
//                               <h2 className="text-xl font-semibold mb-2 text-white">
//                                 {children}
//                               </h2>
//                             ),
//                             strong: ({ children }) => (
//                               <strong className="text-white font-normal text-sm">
//                                 {children}
//                               </strong>
//                             ),
//                             code:({children})=>(
//                               <code className="scrollbar-hide">
//                                 {children}
//                               </code>
//                             )
//                           }}
//                         >
//                           {msg.content}
//                         </ReactMarkdown>
//                       </div>
//                     </div>
//                   )}

//                   {/* Videos */}
//                   {msg.videos?.length > 0 && (
//                     <div className="space-y-3">
//                       <h3 className="text-sm font-semibold text-neutral-300">
//                         Recommended videos
//                       </h3>

//                       <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
//                         {msg.videos.map((v, i) => {
//                           const id = getYouTubeId(v.url);
//                           if (!id) return null;

//                           return (
//                             <a
//                               key={i}
//                               href={v.url}
//                               target="_blank"
//                               className="min-w-[240px] max-w-[240px] bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-hidden hover:bg-neutral-800 transition"
//                             >
//                               {/* Thumbnail */}
//                               <div className="relative">
//                                 <img
//                                   src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
//                                   className="w-full h-36 object-cover"
//                                 />
//                                 <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1.5 py-0.5 rounded">
//                                   ▶
//                                 </div>
//                               </div>

//                               {/* Title */}
//                               <div className="p-2">
//                                 <p className="text-xs md:text-sm md:font-medium line-clamp-2 text-neutral-200">
//                                   Video Source {i + 1}
//                                 </p>
//                               </div>
//                             </a>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}

//                   {/* Posts */}
//                   {msg.posts?.length > 0 && (
//                     <div className="space-y-3">
//                       <h3 className="text-sm font-semibold text-neutral-300">
//                         Related posts
//                       </h3>

//                       <div className="overflow-x-auto  pb-2 scrollbar-hide flex gap-4">
//                         {msg.posts.map((p, i) => (
//                           <Link
//                             key={i}
//                             to={`/viewpage/${p.authorEmail}/${p.postId}`}
//                             onClick={() => setOpen(false)}
//                             // bg-[#121212]
//                             // border border-neutral-800
//                             //   hover:border-neutral-700
//                             className="
//                               group min-w-48 max-w-48
//                               rounded-lg
//                               overflow-hidden
//                               transition-all duration-300
                              
                              
//                             "
//                           >
//                             <div className="relative aspect-video overflow-hidden">
//                               <img
//                                 // src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.image}`}
//                                 src={
//                                   p.image
//                                     ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.image}`
//                                     : blog1
//                                 }
//                                 // className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                                 className="w-full h-full rounded-lg object-cover"
//                               />

//                               <div className="absolute inset-0 " />

//                               <div className="absolute top-2 left-3 bg-black/70 text-[11px] px-2 py-0.5 text-xs rounded-full border border-neutral-700">
//                                 {p.category}
//                               </div>
//                             </div>

//                             <div className="pl-2 mt-2 space-y-1">
//                               <p className="text-xs font-semibold leading-snug line-clamp-1 text-neutral-100">
//                                 {p.title}
//                               </p>

//                               <div className="flex gap-1 items-center">
//                                 <img
//                                   // src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`}

//                                   src={
//                                     p.profile
//                                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`
//                                       : user
//                                   }
//                                   className="w-5 h-5 rounded-full object-cover bg-gray-700 border border-gray-900"
//                                 />

//                                 <div className="min-w-0 flex-col">
//                                   <p className="text-xs text-neutral-300 truncate">
//                                     {p.authorName}
//                                   </p>
//                                   {/* <p className="text-[11px] text-neutral-500 truncate">
//                                       {p.authorEmail}
//                                     </p> */}
//                                 </div>
//                               </div>

//                               {/* <div className="flex justify-between text-[11px] text-neutral-500">
//                                   <span>{p.links?.length >0 ? p.links?.length : ''} resources</span>
//                                   <span>Community</span>
//                                 </div> */}
//                             </div>
//                           </Link>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Suggested Queries */}
//                   {msg.suggestedQueries?.length > 0 && (
//                     <div className="flex flex-col gap-2 pt-2">
//                       {msg.suggestedQueries.map((s, i) => (
//                         <button
//                           key={i}
//                           disabled={loading}
//                           onClick={async () => {
//                             // setQuery(s);
//                             // await handleQueryClick(e);
//                             handleQueryClick(s);
//                           }}
//                           // className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-full text-sm"
//                           className="border border-neutral-600 w-fit text-left hover:theme-fields-lite/70 px-3 md:py-1.5 transition-all duration-300 py-2 rounded-3xl text-sm disabled:opacity-50
//                               disabled:cursor-not-allowed
//                               disabled:hover:bg-transparent "
//                         >
//                           {s}
//                         </button>
//                       ))}

//                       {/* {idx > 0 && msg.suggestedQueries?.length > 0 && (
//                         <div className="flex flex-nowarp scrollbar-hide overflow-x-auto gap-2 pt-2">
//                           {msg.suggestedQueries.map((s, i) => (
//                             <button
//                               key={i}
//                               disabled = {loading}
//                              onClick={async () => {
//                               // setQuery(s);
//                               // await handleQueryClick(e);
//                                handleQueryClick(s);
//                             }}
//                               // className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-full text-sm"
//                               className="border text-nowrap w-11/12 text-left  inline-block border-neutral-600 hover:bg-neutral-800 px-5  py-2 rounded-3xl text-sm disabled:opacity-50 disabled:cursor-not-allowed
//                               disabled:hover:bg-transparent "
//                             >
//                               <p className=" text-wrap   w-64">{s}</p>
                              
//                             </button>
//                           ))}
//                         </div>
//                       )} */}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}

//           {loading && (
//             <div className="space-y-6 overflow-x-hidden relative animate-pulse">
//               {/* Typing bubble */}

//               {/* Skeleton text */}
//               <div className="bg-[#0a0f1d] md:bg-gray-900/50 border border-neutral-800 p-4 rounded-2xl space-y-4">
//                 {/* Title shimmer */}
//                 <div className="h-4 w-2/3 rounded-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 " />

//                 {/* Line 1 */}
//                 <div className="h-3 w-full rounded-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 " />

//                 {/* Line 2 */}
//                 {/* <div className="h-3 w-[95%] rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-shimmer" /> */}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Input */}
//         <div className="p-3 pb-0  rounded-b-xl flex gap-2 theme min-h-0">
//           {/* <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && askAI()}
//             placeholder="Ask your queries..."
//             className="flex-1 md:hidden theme-fields-lite border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none"
//             onFocus={() => setIsInputFocused(true)}
//             // onBlur={() => setIsInputFocused(false)}
//             onMouseOut={() => setIsInputFocused(false)}
//           /> */}

//            <textarea   
//             value={query}
//              ref={textareaRef}
//              disabled={loading}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askAI()}
//             // placeholder="Ask your queries..."
//             placeholder={PLACEHOLDERS[placeholderIndex]}
//             className="flex-1 md:hidden min-h-[40px] max-h-[150px] shrink-0 theme-fields-lite border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none"
//             onFocus={() => setIsInputFocused(true)}
//             onBlur={() => setIsInputFocused(false)}
//             onMouseOut={() => setIsInputFocused(false)}
//             rows={1}
//             />

//           {/* <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={(e) => {e.key === "Enter" && !e.shiftKey && askAI()}}
//             placeholder="Ask your queries..."
//             className="flex-1 theme-fields-lite hidden md:block border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none"
//           /> */}

//           <textarea   
//           value={query}
//           disabled={loading}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={(e) => {e.key === "Enter" && !e.shiftKey && askAI()}}
//             ref={textareaRef2}
//             // placeholder="Ask your queries..."
//             placeholder={PLACEHOLDERS[placeholderIndex]}
//             className="flex-1 theme-fields-lite  min-h-[40px] shrink-0  scrollbar-hide hidden max-h-[150px] md:block border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none"
//             rows={1}
//             />

//           <button
//             onClick={() => askAI(query)}
//             disabled={loading}
//             // className="bg-white text-black px-4 rounded-xl text-sm text-base block"
//             className="text-2xl md:text-2xl transition-all duration-300 hover:text-gray-400 text-gray-500 block transition-all duration-300  disabled:text-gray-700 disabled:cursor-not-allowed"
//           >
//             {/* Send */}
//             <VscSend />
//           </button>
//         </div>
//         <ul className="text-center text-gray-300 mt-0 md:mt-2 h-10 ">
//           <li className="text-[8px] md:text-[10px] md:h-4 h-3">
//             {" "}
//             It's specially made for this platform ❤️
//           </li>
//           <li className="text-[6px] text-gray-400  md:text-[9px] h-3">
//             Visit our documentation to know more details{" "}
//             <a
//               href="/tech_community_assistant_user_guide.pdf"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-emerald-400 underline hover:text-emerald-300 transition-all duration-300 text-[5px] inline-block text-wrap md:text-[8px]"
//             >
//               {" "}
//               User guide ↗
//             </a>{" "}
//           </li>
//         </ul>
//       </div>
//     </>
//   );
// }


import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { IoSendSharp, IoClose } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";
import user from "../images/user.png";
import blog1 from "../images/img_not_found.png";
import logoicon from "../assets/assistant_1.png";
import { getItem } from "../utils/encode";
import { getSessionItem } from "../utils/sessionEncode";

/* -------------------------------------------------------------------------- */
/*  AI-surface tokens                                                          */
/*  Same dark family as the rest of the app, with a violet accent so the       */
/*  assistant reads as its own distinct surface rather than a themed clone.    */
/* -------------------------------------------------------------------------- */
const panelSurface = "bg-[#0c0a17] text-slate-100 [color-scheme:dark]";
const cardSurface =
  "border border-white/10 bg-white/[0.03] transition-colors duration-200 hover:border-violet-400/30 hover:bg-white/[0.05]";
const chipCls =
  "inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/[0.08] px-3 py-1.5 text-left text-xs text-violet-100 transition-colors duration-200 hover:border-violet-400/50 hover:bg-violet-500/[0.14] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-500/[0.08]";

export default function AITechAssistant({
  currentPostId,
  category,
  viewComments = null,
  setViewComments = null,
}) {
  const username = getItem("username");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = getSessionItem("token");
  const assistantURL = import.meta.env.VITE_TECH_ASSISTANT_URL;
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${username}! Curious to learn more about this post?\n\nNot sure what to ask? Choose something:`,
      videos: [],
      posts: [],
      suggestedQueries: [
        "summarise the post",
        "recommend related content",
        "suggest videos",
      ],
    },
  ]);

  const askAI = async (customQuery) => {
    const finalQuery = customQuery || query;
    setIsInputFocused(false);
    if (!finalQuery.trim()) return;

    const userMessage = {
      role: "user",
      content: finalQuery,
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuery(""); // clear input immediately

    setLoading(true);

    try {
      const res = await axios.post(
        `${assistantURL}/ask`,
        {
          query: finalQuery,
          current_post_id: currentPostId,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      let aiMessage = {
        role: "assistant",
        content: res.data.content,
        videos: res.data.videos,
        posts: res.data.posts,
        suggestedQueries: res.data.suggestions || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.log("Full error:", err);

      let content = "Something went wrong. Please try again.";

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response data:", err.response.data);

        if (err.response.status === 429) {
          content = "Too many requests. Please slow down.";
        } else if (err.response.status === 400) {
          content = err.response.data?.content || "Invalid request.";
        }
      }

      const aiMessage = {
        role: "assistant",
        content,
        videos: null,
        posts: null,
        suggestedQueries: [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
    );
    return match ? match[1] : null;
  };
  const lastUserRef = useRef(null);

  const containerRef = useRef(null);

  const handleQueryClick = async (suggestion) => {
    setQuery(suggestion);
    askAI(suggestion);
  };

  const lastUserIndex = [...messages]
    .map((m, i) => (m.role === "user" ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  // Single scroll source of truth: right after a query is sent, scroll the
  // panel's own container (never the window) so the new user message sits
  // near the top, leaving room below for the reply to stream in. This is
  // intentionally the ONLY scroll effect — running more than one on the
  // same container at once is what caused the page-jump / reverse-scroll.
  useEffect(() => {
    const container = containerRef.current;
    const userMessage = lastUserRef.current;
    if (!container || !userMessage) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "user") return;

    const start = container.scrollTop;
    const end = userMessage.offsetTop - 30; // slight padding
    const duration = 350;

    let startTime = null;

    function animateScroll(time) {
      if (!startTime) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);

      container.scrollTop = start + (end - start) * progress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  }, [messages]);

  useEffect(() => {
    if (viewComments) {
      setOpen(false);
    }
  }, [viewComments]);

  // Single responsive textarea (mobile + desktop) — auto-grows with content.
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [query]);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const PLACEHOLDERS = [
    "summarise the post...",
    "recommend related content...",
    "suggest videos...",
  ];

  useEffect(() => {
    if (isFocused || query) return;

    const t = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(t);
  }, [isFocused, query]);

  const handleInputFocus = () => {
    setIsFocused(true);
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    setIsInputFocused(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  // Markdown components shared by every assistant message.
  const markdownComponents = {
    p: ({ children }) => (
      <p className="mb-3 text-sm font-normal leading-relaxed text-slate-300 last:mb-0">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="mb-2 mt-1 text-xl font-bold text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2 mt-1 text-lg font-semibold text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-1.5 mt-1 text-sm font-semibold text-white">{children}</h3>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="text-slate-200">{children}</em>,
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-slate-300 last:mb-0">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-slate-300 last:mb-0">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mb-3 border-l-2 border-violet-400/40 pl-3 text-sm italic text-slate-400 last:mb-0">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-4 border-white/[0.08]" />,
    code: ({ inline, children }) =>
      inline ? (
        <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12px] text-violet-200">
          {children}
        </code>
      ) : (
        <pre className="mb-3 overflow-x-auto scrollbar-hide rounded-lg border border-white/[0.08] bg-black/40 p-3 font-mono text-[12px] text-slate-200 last:mb-0">
          <code>{children}</code>
        </pre>
      ),
  };

  return (
    <>
          {/* Scoped shimmer keyframe for the loading skeleton below — self-contained
          so this component doesn't depend on a tailwind.config.js edit. */}


      {open && (
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 duration-300 ${
            open
              ? "bg-black/60 backdrop-blur-sm transition-opacity"
              : "opacity-0"
          }`}
        />
      )}

      {/* Mobile launcher */}
      <button
        onClick={() => setOpen(!open)}
        className="bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-[6px] text-xs text-violet-100 shadow-xl backdrop-blur transition-all duration-300 active:scale-95 md:hidden"
      >
        Ask AI
        <img src={logoicon} className="h-3 w-3 rounded-full object-contain" alt="" />
      </button>

      {/* Assistant Panel */}
      <div
        className={`
      fixed md:static bottom-0 right-0
      w-full md:w-full
      md:relative
      ${panelSurface}
      md:border
      border-t border-white/[0.08]
      rounded-t-2xl
      transform transition-transform duration-300
      ${open ? "translate-y-0" : "translate-y-full md:translate-y-0"}
      z-40 flex flex-col overflow-hidden md:rounded-2xl
      md:pb-4
          md:h-[470px]
          ${isInputFocused ? "h-[50vh]" : "h-[75vh]"}
    `}
      >
        {/* Ambient violet glow — purely decorative, defines the "AI surface" */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-4rem] h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
        />

        <div
          onClick={() => {
            setOpen(false);
          }}
          className="flex shrink-0 justify-center pb-1 pt-3 md:hidden"
        >
          <div className="h-1 w-9 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="relative flex items-center gap-2.5 border-b border-white/[0.08] p-3.5 sm:gap-3 sm:p-4">
          <a
            href="/tech_community_assistant_user_guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-400/25 transition-transform duration-300 hover:scale-105 sm:h-9 sm:w-9">
              <img
                src={logoicon}
                className="h-5 w-5 rounded-sm object-contain sm:h-5 sm:w-5"
                alt=""
              />
            </span>
          </a>

          <div className="md:min-w-0  flex-1">
   
            <h2 className="truncate text-sm font-semibold text-white md:text-base">
              Ask about this post
              <br />
            <p className="flex min-w-0   items-center gap-1 text-[10px] uppercase  text-violet-300/80">
              <HiSparkles className="shrink-0 text-[11px]" />
              <span className="shrink-0">BytesBase AI</span>
             
            </p>
            </h2>

          </div>

           {category && (
                <span className="hidden text-[10px] shrink-0 truncate rounded-full border border-white/10 bg-white/[0.06] px-1.5 md:py-[3px] normal-case tracking-normal text-slate-400 sm:inline-flex">
                  {category}
                </span>
              )}

          <button
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
          >
            <IoClose className="text-lg" />
          </button>
        </div>

        {/* Timeline */}
        <div
          ref={containerRef}
          className="relative flex-1 space-y-8 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide md:pt-2"
        >
          {messages.map((msg, idx) => {
            const isOnboarding = idx === 0 && messages.length === 1;

            return (
              <div
                key={idx}
                className="animate-in fade-in slide-in-from-bottom-2 space-y-4"
              >
                {/* User bubble */}
                {msg.role === "user" && (
                  <div
                    ref={idx === lastUserIndex ? lastUserRef : null}
                    className="text-right"
                  >
                    <div className="inline-block max-w-[85%] rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-2 text-left text-sm text-white shadow-[0_8px_20px_-10px_rgba(139,92,246,0.7)]">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Assistant bubble */}
                {msg.role === "assistant" && (
                  <div className="space-y-5 transition-all">
                    {isOnboarding ? (
                      /* ---- Onboarding / empty-state card ---- */
                      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-2 text-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-400/25">
                          <img src={logoicon} className="h-6 w-6 rounded-md object-contain" alt="" />
                        </span>
                        <div className="max-w-xs ">
                          <div className="prose prose-invert prose-sm max-w-none  [&_p]:text-xs  md:[&_p]:leading-none [&_p]:text-slate-300">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              components={markdownComponents}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {msg.suggestedQueries?.length > 0 && (
                          <div className="grid w-full max-w-xs grid-cols-1 gap-2 pt-1">
                            {msg.suggestedQueries.map((s, i) => (
                              <button
                                key={i}
                                disabled={loading}
                                onClick={() => handleQueryClick(s)}
                                className={`${chipCls} justify-center rounded-xl py-2.5`}
                              >
                                <HiSparkles className="shrink-0 text-violet-300" />
                                <span className="truncate">{s}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Content */}
                        {msg.content && (
                          <div className="flex items-start gap-2.5">
                            <img
                              src={logoicon}
                              className="mt-0.5 h-5 w-5 shrink-0 rounded-md object-contain"
                              alt=""
                            />
                            <div className="prose prose-invert prose-sm min-w-0 max-w-none overflow-x-auto scrollbar-hide">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={markdownComponents}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* Videos */}
                        {msg.videos?.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Recommended videos
                            </h3>

                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                              {msg.videos.map((v, i) => {
                                const id = getYouTubeId(v.url);
                                if (!id) return null;

                                return (
                                  <a
                                    key={i}
                                    href={v.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`group min-w-[220px] max-w-[220px] overflow-hidden rounded-xl ${cardSurface}`}
                                  >
                                    <div className="relative aspect-video overflow-hidden">
                                      <img
                                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        alt=""
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/90 text-white shadow-lg">
                                          ▶
                                        </span>
                                      </div>
                                    </div>
                                    <div className="p-2.5">
                                      <p className="line-clamp-2 text-xs font-medium text-slate-200">
                                        Video Source {i + 1}
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
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Related posts
                            </h3>

                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                              {msg.posts.map((p, i) => (
                                <Link
                                  key={i}
                                  to={`/viewpage/${p.authorEmail}/${p.postId}`}
                                  onClick={() => setOpen(false)}
                                  className="group min-w-48 max-w-48 overflow-hidden rounded-lg transition-all duration-300"
                                >
                                  <div className="relative aspect-video overflow-hidden">
                                    <img
                                      src={
                                        p.image
                                          ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.image}`
                                          : blog1
                                      }
                                      className="h-full w-full rounded-lg object-cover"
                                      alt=""
                                    />
                                    <div className="absolute inset-0" />
                                    <div className="absolute left-3 top-2 rounded-full border border-neutral-700 bg-black/70 px-2 py-0.5 text-[11px] text-xs">
                                      {p.category}
                                    </div>
                                  </div>

                                  <div className="mt-2 space-y-1 pl-2">
                                    <p className="line-clamp-1 text-xs font-semibold leading-snug text-neutral-100">
                                      {p.title}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <img
                                        src={
                                          p.profile
                                            ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${p.profile}`
                                            : user
                                        }
                                        className="h-5 w-5 rounded-full border border-gray-900 bg-gray-700 object-cover"
                                        alt=""
                                      />
                                      <div className="min-w-0 flex-col">
                                        <p className="truncate text-xs text-neutral-300">
                                          {p.authorName}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested Queries */}
                        {msg.suggestedQueries?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.suggestedQueries.map((s, i) => (
                              <button
                                key={i}
                                disabled={loading}
                                onClick={() => handleQueryClick(s)}
                                className={chipCls}
                              >
                                <HiSparkles className="shrink-0 text-violet-300" />
                                <span>{s}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="relative space-y-3 overflow-x-hidden">
              <div className="flex items-center gap-2.5">
                <img src={logoicon} className="h-5 w-5 shrink-0 rounded-md object-contain opacity-60" alt="" />
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/70"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/[0.08]" />
                <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.08]" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/[0.08]" />
              </div>
         
            </div>
          )}
        </div>

        {/* Input */}
        <div className="relative flex shrink-0 items-end gap-1.5 md:gap-2 border-t border-white/[0.08] px-2 p-1">
          <textarea
            ref={textareaRef}
            value={query}
            disabled={loading}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={PLACEHOLDERS[placeholderIndex]}
            rows={1}
            className="max-h-[150px] h-[40px]  flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition [color-scheme:dark] scrollbar-hide focus:border-violet-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-400/10 disabled:opacity-60"
          />

          <button
            onClick={() => askAI(query)}
            disabled={loading || !query.trim()}
            aria-label="Send message"
            className="flex h-[40px] w-[38px] md:w-[42px] shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-violet-600 text-white shadow-[0_8px_20px_-10px_rgba(139,92,246,0.8)] transition-all duration-200 hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500 disabled:shadow-none"
          >
            <IoSendSharp className="text-base" />
          </button>
        </div>

        <p className="shrink-0 md:pb-1 pb-3 pt-1 text-center text-[10px] text-slate-500">
          Made for this platform ❤️ · Visit our{" "}
          <a
            href="/tech_community_assistant_user_guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
          >
            user guide ↗
          </a>{" "}
          to learn more
        </p>
      </div>
    </>
  );
}

