import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NavBar from "../ui/NavBar";

import { Link, useNavigate } from "react-router-dom";
import Footer from "../ui/Footer";
import Chatbot from "../images/chatbt.gif";
import { ReactTyped } from "react-typed";
import axiosInstance from "../instances/Axiosinstances";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import glow from "../assets/glow.png";
import { VscGitStashApply, VscGitStashPop, VscSend } from "react-icons/vsc";
import Cookies from "js-cookie";
import { getItem } from "../utils/encode";
import RenderTextWithHashtags from "../components/RenderTextWithHashtags";
import { TbAlertTriangleFilled } from "react-icons/tb";
import toast from "../components/toaster/Toast";
import { motion, AnimatePresence } from "framer-motion";

function AddPost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [prompt, setPrompt] = useState("");
  // const email = localStorage.getItem("email"); // Get email from local storage
  const email = getItem("email"); // Get email from local storage
  const user = localStorage.getItem("username");
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const token = Cookies.get("token");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
  });

  const [messages, setMessages] = useState([
    {
      message: `Hi ${user}! I'm DraftMate AI, your assistant for refining post description. Share your draft and I’ll help transform it into clear, engaging, publish-ready content.`,
      sender: "bot",
      direction: "incoming",
    },
    {
      message:
        "Your enhanced content will automatically appear in the Description tab, where you can preview and edit it",
      sender: "bot",
      direction: "incoming",
    },
  ]);

  const [documents, setDocuments] = useState([]);
  // const fileInputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatbot, setChatbot] = useState(false);
  const [draftMateLoading, setDraftMateLoading] = useState(false);

  const backendEndpoint = import.meta.env.VITE_CHATBOT_URL;

  // const backendEndpoint = "http://127.0.0.1:5000/generate-content";

  const handleSend = async (message) => {
    if (message.trim() == "") {
      return;
    }
    const newMessage = {
      message,
      sender: "user",
      direction: "outgoing",
    };
    setMessages((prev) => [...prev, newMessage]);

    setIsTyping(true);
    setDraftMateLoading(true);

    try {
      const response = await axios.post(
        `${backendEndpoint}`,
        {
          description: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const botResponse =
        response.data.content || "Something went wrong, try agein later.";
      // console.log("botResponse", botResponse);
      typewriterEffect(botResponse, "bot");
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = {
        message: "An error occurred. Please try again later.",
        sender: "bot",
        direction: "incoming",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setDraftMateLoading(false);
    }
  };

  const typewriterEffect = (text, sender) => {
    const words = text.split(" ");
    let currentMessage = "";
    let wordIndex = 0;

    const addWord = () => {
      if (wordIndex < words.length) {
        currentMessage += (wordIndex > 0 ? " " : "") + words[wordIndex];
        const newMessage = {
          message: currentMessage,
          sender,
          direction: "incoming",
        };
        setMessages((prev) => {
          const updatedMessages = [...prev];
          if (
            updatedMessages.length > 0 &&
            updatedMessages[updatedMessages.length - 1].sender === sender
          ) {
            updatedMessages[updatedMessages.length - 1] = newMessage;
          } else {
            updatedMessages.push(newMessage);
          }
          return updatedMessages;
        });
        wordIndex++;
        setTimeout(addWord, 200); // Adjust delay for smoother/faster typing
      } else {
        // ✅ typing finished → enable button
        setIsTyping(false);
      }
    };

    addWord();
  };

  useEffect(() => {
    const incommingMessage = messages.filter(
      (msg) => msg.direction === "incoming",
    );

    if (incommingMessage.length > 2) {
      const lastMessage = incommingMessage[incommingMessage.length - 1].message;

      // Combine message with hashtags
      setDescription(lastMessage);
    }
  }, [messages]);

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);

      const file = e.target.files[0];
      // setImages(files);

      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);
    }
  };

  const sanitizeUrl = (rawUrl) => {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
      return null;
    } catch {
      return null;
    }
  };

  const [currentLink, setCurrentLink] = useState("");
  const [links, setLinks] = useState([]);
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [preview, setPreview] = useState(false);
  const imageInputRef = useRef(null); // Add this at the top of your component
  // const [showLinkBox, setShowLinkBox] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    // Trimmed validation
    if (!title.trim()) {
      errors.title = "Post title is required.";
    }

    if (!category.trim()) {
      errors.category = "Post domain is required.";
    }

    // if (!price || Number(price) <= 0) {
    //   errors.price = "Enter a valid price.";
    // }

    if (!description.trim()) {
      errors.description = "Post description is required.";
    }
    const finalCategory = category === "Others" ? customCategory : category;
    if (category === "Others" && !customCategory.trim()) {
      errors.finalCategory = "Domain name is required.";
    }

    const hasNoImage = image.length === 0 && (!image || image.length === 0);

    if (hasNoImage) {
      errors.image = "Post thumbnail is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // prevent submit
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", finalCategory);
      formData.append("image", image);

      // Correctly append documents
      documents.forEach((doc) => formData.append("document", doc));

      // Correctly append links using JSON stringification
      formData.append("links", JSON.stringify(links));

      const response = await axiosInstance.post(
        `/blog/posts/${email}`,
        // `/blog/posts/${email}`,
        formData,
      );

      // console.log("adding post response", response.data);

      if (imageInputRef.current) {
        imageInputRef.current.value = null;
      }
      setPreviewImage("");
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setImage(null);
      setLinks([]);

      // navigate("/home");
      navigate("/yourposts");
    } catch (error) {
      console.error("Error adding post:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentsChange = (e) => {
    setDocuments([]);
    const files = Array.from(e.target.files); // Convert FileList to Array
    setDocuments(files);
  };

  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    if (isNearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const postViews = async (authorEmail) => {
    try {
      await axiosInstance.put(
        `/blog/posts/views/yugeshkaran01@gmail.com/69fc146c5ea31bc1ac08c77d`,
        {
          emailAuthor: authorEmail,
        },
      );
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [prompt]);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const PLACEHOLDERS = [
    "Ask DraftMate to transform your content...",
    "Lets DraftMate refine your post content...",
    "Transform raw content to publish ready content... ",
  ];

  useEffect(() => {
    if (isFocused || prompt) return;

    const t = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(t);
  }, [isFocused, prompt]);

  // console.log("documents",documents)

  return (
    <div className="min-h-screen relative bg-gray-900 text-white">
      <NavBar />

      <div className="min-h-screen  max-w-[1800px] mx-auto  w-full pt-4 pb-8">
        <div className="w-full  mx-auto  md:px-12">
          <div className="md:mb-8 mb-6 flex px-4 items-center justify-between">
            <div>
              <h1 className="md:text-3xl text-xl  font-semibold text-white tracking-tight">
                Create New Post
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Share knowledge, projects and resources with the community.
              </p>
            </div>

            {/* Mobile AI toggle */}
            {/* <div className="lg:hidden">
              {!chatbot ? (
                <button
                  onClick={() => setChatbot(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-500"
                >
                  <img src={glow} className="w-4 h-4" alt="" />
                  AI
                </button>
              ) : (
                <button
                  onClick={() => setChatbot(false)}
                  className="
                    flex items-center gap-1.5
                    px-2.5 py-2

                    rounded-lg
                    bg-[#111827]
                    border border-white/[0.06]
                    ring-0
                    text-emerald-400
                    text-[11px]
                    font-medium
                    outline-none
                    
                    
                  "
                >
                  <span className="text-xs">←</span>
                  <span>Back</span>
                </button>
              )}
            </div> */}
            <div className="lg:hidden">
              <AnimatePresence mode="wait">
                {!chatbot ? (
                  <motion.button
                    key="open-ai"
                    onClick={() => setChatbot(true)}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="
          flex items-center gap-2
          px-3 py-1.5
          rounded-lg
          bg-gradient-to-r
          from-purple-600
          to-blue-500
          text-white
          text-sm
          shadow-lg
          shadow-purple-500/20
        "
                  >
                    <motion.img
                      src={glow}
                      alt=""
                      className="w-4 h-4"
                      animate={{
                        rotate: [0, 8, -8, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <span>AI</span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="close-ai"
                    onClick={() => setChatbot(false)}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      x: 20,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      x: -20,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="
          flex items-center gap-1.5
          px-2.5 py-2
          rounded-lg
          bg-[#111827]
          border border-white/[0.06]
          text-emerald-400
          text-[11px]
          font-medium
        "
                  >
                    <motion.span
                      animate={{
                        x: [0, -2, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      className="text-xs"
                    >
                      ←
                    </motion.span>

                    <span>Back</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 px-2 md:px-0  lg:grid-cols-[400px_1fr] gap-4 lg:gap-0">
            {/* LEFT COLUMN */}
            <div className="md:space-y-4 md:sticky top-7  self-start md:col-span-1">
              {/* Description / Tips */}
              <div
                className={`bg-[#0f172a]/80 lg:w-11/12 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg md:rounded-xl px-4 py-6 md:p-6 text-gray-300 ${chatbot ? "hidden lg:block" : "block"}`}
              >
                <h2 className="md:text-lg text-sm font-semibold text-white mb-3">
                  Post Guidelines
                </h2>

                <ul className="space-y-2 text-sm list-disc pl-5">
                  <li>Use a clear and descriptive title</li>
                  <li>Provide a contextual description</li>
                  <li>Add useful resources such as links and documents</li>
                  <li>Include a suitable thumbnail poster (1280 × 720 px)</li>
                  <li>
                    Post description support Markdown features. Use the preview
                    option to verify the content format.
                  </li>
                  <li>YouTube links support video embedding </li>
                </ul>
              </div>

              {/* AI Assistant (Always visible on desktop) */}

              {/* backdrop-blur-xl */}

              <AnimatePresence mode="popLayout">
                {chatbot && (
                  <motion.div
                    key="draftmate-mobile"
                    layout
                    initial={{
                      opacity: 0,
                      x: 60,
                      scale: 0.96,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      x: 60,
                      scale: 0.96,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
        lg:hidden
        relative overflow-hidden
        bg-[#0f172a]/80
        border border-emerald-500/20
        shadow-[0_0_40px_rgba(16,185,129,0.06)]
        rounded-2xl
        h-[600px]
        pb-2
        flex flex-col
      "
                  >
                    {/* DraftMate Content */}
                    {/* Header */}
                    <div className="relative z-10 px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <img src={glow} className="w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold tracking-wide text-white">
                            DraftMate AI
                          </h2>

                          <p className="text-[11px] text-gray-400 md:text-gray-400 mt-0.5">
                            Content Refinement Assistant
                          </p>
                        </div>
                      </div>

                      {/* <div className="hidden md:flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </div> */}
                    </div>

                    <div
                      ref={containerRef}
                      className="flex-1 overflow-y-auto px-4 pt-6 pb-3 md:p-6 md:pb-4 emerald-scrollbar space-y-4 h-[600px] pr-2"
                    >
                      {messages.map((msg, idx) => (
                        <div
                          key={msg._id || `msg-${idx}`}
                          className={`flex  ${
                            msg.direction === "outgoing"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`
                          w-full
                          px-4
                          py-2.5
                          rounded-2xl
                          text-xs
                          leading-relaxed
                          break-words

                          
                          whitespace-pre-wrap
                          ${
                            msg.direction === "outgoing"
                              ? "bg-gray-800 md:ml-5  text-white rounded-br-md"
                              : "bg-emerald-700/20 text-gray-200 md:mr-5 rounded-bl-md"
                          }
                        `}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}

                      {draftMateLoading && (
                        <div className="flex items-center gap-3 px-1">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                          </div>

                          <span className="text-xs text-gray-400">
                            DraftMate is refining your content...
                          </span>
                        </div>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        // const input = e.target.message;
                        // handleSend(input.value);
                        //  input.value = "";
                        handleSend(prompt);
                        setPrompt("");
                      }}
                      // className="flex pb-1 h-20  pt-4 px-4 relative  gap-3  min-h-[80px]  outline-none "
                      className="flex items-end pb-1 pt-4 px-4 relative gap-3 outline-none"
                    >
                      {/* <input
                    name="message"
                    placeholder="Ask DraftMate to transform your content..."
                    onKeyDown={()=>{ e.key === "Enter" && !e.shiftKey}}
                    className="flex-1 px-4  rounded-xl border border-gray-700 py-2 bg-gray-900 text-xs outline-none text-white"
                  /> */}

                      <textarea
                        name="message"
                        ref={textareaRef}
                        value={prompt}
                        onFocus={() => {
                          setIsFocused(true);
                        }}
                        onBlur={() => {
                          setIsFocused(false);
                        }}
                        placeholder={PLACEHOLDERS[placeholderIndex]}
                        className="flex-1  min-h-[40px] max-h-[200px] shrink-0 px-4 flex scrollbar-hide  rounded-xl border border-gray-700 py-2 transition-all duration-200 bg-gray-900 text-xs outline-none text-white"
                        id=""
                        onChange={(e) => {
                          setPrompt(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(prompt);
                            setPrompt("");
                          }
                        }}
                        rows={1}
                      />

                      <button
                        disabled={isTyping}
                        className="text-2xl  md:text-2xl transition-all duration-300 hover:text-gray-400 text-gray-500 block transition-all duration-300  disabled:text-gray-700 disabled:cursor-not-allowed"
                      >
                        <VscSend />
                      </button>
                    </form>
                    <div className="flex items-center justify-center  gap-1 pt-1 pb-3 px-6">
                      <p className="text-[9px] md:text-[10px] text-gray-400 tracking-wide">
                        Verify generated content before publishing.
                      </p>

                      <Link
                        to={`${window.location.origin}/viewpage/yugeshkaran01@gmail.com/69fc146c5ea31bc1ac08c77d`}
                        onClick={() => postViews(email)}
                        className="
                      text-[9px]
                      md:text-[10px]
                      text-emerald-400
                      hover:text-emerald-300
                      transition-all duration-300
                      whitespace-nowrap
                    "
                      >
                        DraftMate Docs ↗
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className={`relative overflow-hidden
                    bg-[#0f172a]/80
                    border border-emerald-500/20
                    shadow-[0_0_40px_rgba(16,185,129,0.06)]
                    rounded-2xl
                    lg:w-11/12
                    md:h-[450px]
                    h-[600px]
                    pb-2
                    flex flex-col
                    hidden lg:flex
                   
                `}
              >
                {/* Header */}
                <div className="relative z-10 px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <img src={glow} className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold tracking-wide text-white">
                        DraftMate AI
                      </h2>

                      <p className="text-[11px] text-gray-400 md:text-gray-400 mt-0.5">
                        Content Refinement Assistant
                      </p>
                    </div>
                  </div>

                  {/* <div className="hidden md:flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </div> */}
                </div>

                <div
                  ref={containerRef}
                  className="flex-1 overflow-y-auto px-4 pt-6 pb-3 md:p-6 md:pb-4 emerald-scrollbar space-y-4 h-[600px] pr-2"
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={msg._id || `msg-${idx}`}
                      className={`flex  ${
                        msg.direction === "outgoing"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`
                          w-full
                          px-4
                          py-2.5
                          rounded-2xl
                          text-xs
                          leading-relaxed
                          break-words

                          
                          whitespace-pre-wrap
                          ${
                            msg.direction === "outgoing"
                              ? "bg-gray-800 md:ml-5  text-white rounded-br-md"
                              : "bg-emerald-700/20 text-gray-200 md:mr-5 rounded-bl-md"
                          }
                        `}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}

                  {draftMateLoading && (
                    <div className="flex items-center gap-3 px-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                      </div>

                      <span className="text-xs text-gray-400">
                        DraftMate is refining your content...
                      </span>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // const input = e.target.message;
                    // handleSend(input.value);
                    //  input.value = "";
                    handleSend(prompt);
                    setPrompt("");
                  }}
                  // className="flex pb-1 h-20  pt-4 px-4 relative  gap-3  min-h-[80px]  outline-none "
                  className="flex items-end pb-1 pt-4 px-4 relative gap-3 outline-none"
                >
                  {/* <input
                    name="message"
                    placeholder="Ask DraftMate to transform your content..."
                    onKeyDown={()=>{ e.key === "Enter" && !e.shiftKey}}
                    className="flex-1 px-4  rounded-xl border border-gray-700 py-2 bg-gray-900 text-xs outline-none text-white"
                  /> */}

                  <textarea
                    name="message"
                    ref={textareaRef}
                    value={prompt}
                    onFocus={() => {
                      setIsFocused(true);
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                    }}
                    placeholder={PLACEHOLDERS[placeholderIndex]}
                    className="flex-1  min-h-[40px]
    max-h-[200px] shrink-0 px-4 flex scrollbar-hide  rounded-xl border border-gray-700 py-2 transition-all duration-200 bg-gray-900 text-xs outline-none text-white"
                    id=""
                    onChange={(e) => {
                      setPrompt(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(prompt);
                        setPrompt("");
                      }
                    }}
                    rows={1}
                  />

                  <button
                    disabled={isTyping}
                    className="text-2xl  md:text-2xl transition-all duration-300 hover:text-gray-400 text-gray-500 block transition-all duration-300  disabled:text-gray-700 disabled:cursor-not-allowed"
                  >
                    <VscSend />
                  </button>
                </form>
                <div className="flex items-center justify-center  gap-1 pt-1 pb-3 px-6">
                  <p className="text-[9px] md:text-[10px] text-gray-400 tracking-wide">
                    Verify generated content before publishing.
                  </p>

                  <Link
                    to={`${window.location.origin}/viewpage/yugeshkaran01@gmail.com/69fc146c5ea31bc1ac08c77d`}
                    onClick={() => postViews(email)}
                    className="
                      text-[9px]
                      md:text-[10px]
                      text-emerald-400
                      hover:text-emerald-300
                      transition-all duration-300
                      whitespace-nowrap
                    "
                  >
                    DraftMate Docs ↗
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN FORM */}
            <div
              className={`bg-[#0f172a]/80   border border-emerald-500/20 rounded-lg px-4 py-6  md:p-8 shadow-xl
               ${chatbot ? "hidden lg:block" : "block"}`}
            >
              <form onSubmit={handleSubmit} className="space-y-9  md:space-y-7">
                {/* TITLE */}
                <div>
                  <label className="text-sm text-gray-400 md:text-gray-300 font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title"
                    className="w-full mt-2  px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border focus:border-emerald-500/40 outline-none text-white text-xs md:text-sm"
                  />

                  {fieldErrors.title && (
                    <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-1">
                      <TbAlertTriangleFilled /> {fieldErrors.title}
                    </p>
                  )}
                </div>

                {/* DESCRIPTION */}
                {/* <div>
                  <label className="text-sm text-gray-400 md:text-gray-300 font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <div>
                      <span onClick={()=>{setPreview(false)}}>Editor</span>
                      <span onClick={()=>{setPreview(true)}}>Preview</span>
                    </div>

                  

                    {
                      preview?
                    <div className="w-full min-h-40 h-auto mt-2  focus:border focus:border-emerald-500/40 emerald-scrollbar px-4 py-3 rounded-md bg-gray-900 border border-gray-700 outline-none  text-white text-xs leading-relaxed">
                      {renderTextWithHashtags(description)}
                    </div>
                    :
                    <textarea
                      rows="6"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write your post description..."
                      className="w-full mt-2  focus:border focus:border-emerald-500/40 emerald-scrollbar px-4 py-3 rounded-md bg-gray-900 border border-gray-700 outline-none  text-white text-xs leading-relaxed"
                    />}
                  </div>
                  {fieldErrors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.description}
                    </p>
                  )}
                </div> */}

                <div>
                  {/* Label */}
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-300 font-medium tracking-wide">
                      Description <span className="text-red-500">*</span>
                    </label>

                    {/* Tabs */}
                    <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setPreview(false)}
                        className={`px-3 py-1 text-[11px] outline-none   rounded-md transition-all duration-200 ${
                          !preview
                            ? "bg-emerald-500/20 text-emerald-400 "
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Editor
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreview(true)}
                        className={`px-3 py-1 text-[11px] outline-none  rounded-md transition-all duration-200 ${
                          preview
                            ? "bg-emerald-500/20 text-emerald-400 "
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Editor / Preview Wrapper */}
                  <div className="relative">
                    {/* Top subtle glow */}
                    <div className="absolute inset-0 rounded-xl bg-emerald-500/[0.02] pointer-events-none" />

                    {preview ? (
                      <div
                        className="
                          w-full min-h-40 h-[300px]
                          overflow-y-auto
                          px-4 py-3
                          rounded-md
                          bg-gray-900
                          border border-gray-700
                          text-white text-xs md:text-sm
                          leading-relaxed
                          emerald-scrollbar
                          break-words
                        "
                      >
                        {description?.trim()?.length > 0 ? (
                          // renderTextWithHashtags(description)
                          <RenderTextWithHashtags text={description} />
                        ) : (
                          <span className="text-gray-500">
                            Preview content will appear here...
                          </span>
                        )}
                      </div>
                    ) : (
                      <textarea
                        rows="11"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write your post description..."
                        className="w-full mt-2  focus:border focus:border-emerald-500/40 emerald-scrollbar px-4 py-3 rounded-md bg-gray-900 border border-gray-700 outline-none  text-white text-xs leading-relaxed"
                      />
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="md:text-[11px] text-[9px] text-gray-500">
                      {description?.length} characters
                    </span>
                  </div>

                  {/* Error */}
                  {fieldErrors.description && (
                    <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-2">
                      <TbAlertTriangleFilled /> {fieldErrors.description}
                    </p>
                  )}
                </div>
                {/* CATEGORY */}
                <div>
                  <label className="text-sm text-gray-400 md:text-gray-300 font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-2 px-4 py-2 cursor-pointer focus:border focus:border-emerald-500/40 rounded-md bg-gray-900 border border-gray-700 outline-none text-xs md:text-sm text-white  "
                  >
                    <option value="">Select Domain</option>
                    <option value="GenAI">GenAI</option>
                    <option value="Design Thinking">Design Thinking</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="IoT">IoT</option>
                    <option value="Embedded System">Embedded System</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Satellite Space Technology">
                      Satellite Space Technology
                    </option>
                    <option value="Others">Others</option>
                  </select>

                  {fieldErrors.category && (
                    <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-1">
                      <TbAlertTriangleFilled /> {fieldErrors.category}
                    </p>
                  )}
                  {category === "Others" && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter domain name"
                      className="w-full mt-2 px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  outline-none text-white text-xs md:text-sm"
                    />
                  )}
                  {fieldErrors.finalCategory && (
                    <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-1">
                      <TbAlertTriangleFilled /> {fieldErrors.finalCategory}
                    </p>
                  )}
                </div>

                {/* THUMBNAIL */}
                <div>
                  <label className="text-sm text-gray-400 md:text-gray-300 font-medium">
                    Thumbnail <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    ref={imageInputRef}
                    className="w-full mt-2 text-xs  text-gray-300 
                      file:mr-4 file:px-2 file:py-1 file:rounded-md 
                      file:border-0 file:bg-emerald-500/20 file:hover:bg-emerald-600/20 file:text-emerald-400 
                      file:cursor-pointer"
                  />

                  {/* REMOVE IMAGE BUTTON */}
                  {image && (
                    <button
                      type="button"
                      onClick={() => {
                        setImage("");
                        setPreviewImage("");

                        if (imageInputRef.current) {
                          imageInputRef.current.value = null;
                        }
                      }}
                      className="text-xs text-yellow-400 mt-2 hover:underline"
                    >
                      Remove Selected Image
                    </button>
                  )}

                  {!previewImage && (
                    <div className="md:max-w-80 w-full h-40 mt-3 rounded-xl flex items-center justify-center bg-gray-700">
                      <p className="text-gray-400 md:text-gray-300 text-xs">
                        No Thumbnail
                      </p>
                    </div>
                  )}

                  {/* PREVIEW */}
                  {previewImage && (
                    <div className="mt-3">
                      <img
                        src={previewImage}
                        className="md:max-w-80 w-full h-40   object-cover rounded-xl border border-gray-700"
                      />
                    </div>
                  )}

                  {fieldErrors.image && (
                    <p className="text-xs md:text-sm flex items-center gap-1 text-red-500 mt-1">
                      <TbAlertTriangleFilled /> {fieldErrors.image}
                    </p>
                  )}
                </div>

                {/* LINKS */}
                <div className="space-y-3 w-full ">
                  <div className="flex w-full items-center justify-between">
                    <label className="text-sm text-gray-400 md:text-gray-300 font-medium">
                      Project Links (Max-10)
                    </label>

                    {currentLinkTitle.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentLinkTitle("");
                          setCurrentLinkUrl("");
                          setCustomTitle("");
                        }}
                        className="text-xs bg-red-600 px-2 py-1 rounded-md hover:bg-red-700 transition-all duration-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex w-full flex-col md:flex-row  gap-2">
                    {/* TITLE SELECT */}
                    {currentLinkTitle !== "Others" && (
                      <select
                        value={currentLinkTitle}
                        onChange={(e) => setCurrentLinkTitle(e.target.value)}
                        // w-full
                        className="md:w-1/3 w-full focus:border focus:border-emerald-500/40  px-4 py-2 cursor-pointer rounded-xl bg-gray-900 border border-gray-700 outline-none text-xs md:text-sm text-white"
                      >
                        <option value="" disabled>
                          Select Link
                        </option>
                        <option value="GitHub">GitHub</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Demo">Demo</option>
                        <option value="Others">Others</option>
                      </select>
                    )}

                    {/* CUSTOM TITLE */}
                    {currentLinkTitle === "Others" && (
                      <input
                        type="text"
                        placeholder="Enter platform name"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="md:w-1/3 w-full focus:border focus:border-emerald-500/40 px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  outline-none text-white text-xs md:text-sm"
                      />
                    )}

                    {/* URL */}
                    <input
                      type="url"
                      value={currentLinkUrl}
                      onChange={(e) => setCurrentLinkUrl(e.target.value)}
                      placeholder="Paste URL"
                      className="md:w-2/3 focus:border focus:border-emerald-500/40 w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  outline-none text-white text-xs md:text-sm"
                    />

                    {/* ADD BUTTON */}
                    <button
                      type="button"
                      // onClick={() => {
                      //   const titleToUse =
                      //     currentLinkTitle === "Others"
                      //       ? customTitle?.trim()
                      //       : currentLinkTitle.trim();

                      //   if (titleToUse && currentLinkUrl.trim()) {
                      //     const newLink = {
                      //       title: titleToUse,
                      //       url: currentLinkUrl.trim(),
                      //     };

                      //     setLinks([...links, newLink]);

                      //     setCurrentLinkTitle("");
                      //     setCurrentLinkUrl("");
                      //     setCustomTitle("");
                      //   }
                      // }}

                      onClick={() => {
                        const titleToUse =
                          currentLinkTitle === "Others"
                            ? customTitle?.trim()
                            : currentLinkTitle.trim();
                        const sanitizedUrl = sanitizeUrl(currentLinkUrl.trim());
                        if (titleToUse && sanitizedUrl) {
                          const newLink = {
                            title: titleToUse,
                            url: sanitizedUrl,
                          };
                          setLinks([...links, newLink]);
                          setCurrentLinkTitle("");
                          setCurrentLinkUrl("");
                          setCustomTitle("");
                        } else if (titleToUse) {
                          toast.error(
                            "Invalid URL",
                            "Please enter a valid http(s) URL.",
                          );
                        }
                      }}
                      className="px-4 bg-emerald-500/20 w-fit py-1 md:py-2   text-black text-emerald-400  text-xs rounded-md hover:bg-emerald-600/20 transition-all duration-300"
                    >
                      Add
                    </button>
                  </div>

                  {/* LINKS LIST */}
                  {links.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {links.map((link, index) => (
                        <div
                          // key={index}
                          key={`${link.title}-${link.url}`}
                          className="flex justify-between bg-neutral-800 px-3 py-2 rounded-lg text-xs"
                        >
                          <span className="break-all">
                            {link.title}: {link.url}
                          </span>
                          <button
                            onClick={() =>
                              setLinks((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className="text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DOCUMENTS */}
                <div>
                  <label className="text-sm text-gray-400 font-medium">
                    Source Documents
                  </label>

                  {/* <input
                    type="file"
                    // ref={fileInputRef}
                    multiple
                    accept=".pdf,.doc,.docx"
                
                  onChange={(e) => {
                  const files = Array.from(e.target.files);

                  // existing uploaded docs + new selected docs
                  const totalFiles = documents.length + files.length;

                  // max 5 files total
                  if (totalFiles > 5) {
                    alert(`Maximum 5 documents allowed. You already have ${documents.length} document(s).`);
                    e.target.value = "";
                    return;
                  }

                  onDocumentsChange(e);
                }}
                    className="w-full mt-2 text-xs  text-gray-300 
                      file:mr-4 file:px-2 file:py-1 file:rounded-md 
                      file:border-0 file:bg-emerald-500/20 file:hover:bg-emerald-600/20 file:text-emerald-400 
                      file:cursor-pointer"
                  /> */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);

                      const totalFiles = documents.length + files.length;

                      if (totalFiles > 5) {
                        alert(
                          `Maximum 5 documents allowed. You already have ${documents.length} document(s).`,
                        );

                        e.target.value = "";
                        return;
                      }

                      onDocumentsChange(e);

                      // reset native input
                      e.target.value = "";
                    }}
                    className="w-full mt-2 text-xs text-gray-300 
                      file:mr-4 file:px-2 file:py-1 file:rounded-md 
                      file:border-0 file:bg-emerald-500/20 
                      file:hover:bg-emerald-600/20 
                      file:text-emerald-400 
                      file:cursor-pointer"
                  />
                  {/* {documents.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {documents.map((doc, idx) => (
                        <div
                          // key={idx}
                          key={doc.name + doc.size}
                          className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-emerald-500/20 text-xs text-gray-300"
                        >
                          <span className="text-emerald-400 font-semibold shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="truncate">{doc.name}</span>
                          <span className="ml-auto text-gray-500 shrink-0">
                            {(doc.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )} */}
                  {documents.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {documents.map((doc, idx) => (
                        <div
                          key={doc.name + doc.size}
                          className="flex items-center justify-between gap-3 bg-gray-900 px-3 py-2 rounded-lg border border-emerald-500/20 text-xs text-gray-300"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-emerald-400 font-semibold shrink-0">
                              {idx + 1}.
                            </span>

                            <span className="truncate">{doc.name}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-gray-500">
                              {(doc.size / 1024).toFixed(1)} KB
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setDocuments((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                );
                              }}
                              className="text-red-400 hover:text-red-300 transition border border-red-500/20 hover:border-red-500/40 px-2 py-1 rounded-md"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="md:px-5 px-3 py-2 md:py-2.5 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm flex items-center justify-center gap-2 text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <VscGitStashApply className="md:text-base text-sm" />{" "}
                    {loading ? "Publishing..." : "Publish Post"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AddPost;
