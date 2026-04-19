import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NavBar from "../ui/NavBar";

import { useNavigate } from "react-router-dom";
import Footer from "../ui/Footer";
import Chatbot from "../images/chatbt.gif";
import { ReactTyped } from "react-typed";
import axiosInstance from "../instances/Axiosinstances";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import glow from "../assets/glow.png";
import { VscSend } from "react-icons/vsc";
import Cookies from "js-cookie";
import { getItem } from "../utils/encode";

function AddPost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  // const email = localStorage.getItem("email"); // Get email from local storage
  const email = getItem("email"); // Get email from local storage
  const user = localStorage.getItem("username");
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
  });

  const [messages, setMessages] = useState([
    {
      message: `Hi ${user}! I'm DraftMate AI, your assistant for refining post descriptions. Share your draft and I’ll help transform it into clear, engaging, publish-ready content.`,
      sender: "bot",
      direction: "incoming",
    },
    {
      message:
        "Your enhanced content will automatically appear in the Description tab, where you can review or edit it",
      sender: "bot",
      direction: "incoming",
    },
  ]);

  const [documents, setDocuments] = useState([]);
  // const fileInputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatbot, setChatbot] = useState(false);
  const [draftMateLoading, setDraftMateLoading] = useState(false)

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
    setDraftMateLoading(true)

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
    } 
    finally{
      setDraftMateLoading(false)
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
      }
       else {
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

  const [currentLink, setCurrentLink] = useState("");
  const [links, setLinks] = useState([]);
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [customCategory, setCustomCategory] = useState("");
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
    setDocuments([])
    const files = Array.from(e.target.files); // Convert FileList to Array
    setDocuments(files);
  };

  const containerRef = useRef(null);
  useEffect(() => {
  const el = containerRef.current;
  if (!el) return;

  const isNearBottom =
    el.scrollHeight - el.scrollTop - el.clientHeight < 100;

  if (isNearBottom) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }
}, [messages, isTyping]);

  // console.log("links",links)
  // console.log("documents",documents)

  return (
    <div className="min-h-screen relative bg-gray-900 text-white">
      <NavBar />

      <div className="min-h-screen   w-full pt-4 pb-8">
        <div className="w-full  mx-auto  md:px-4">
          <div className="mb-8 flex px-4 items-center justify-between">
            <div>
              <h1 className="md:text-3xl text-2xl  font-semibold text-white tracking-tight">
                Create New Post
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Share knowledge, projects and resources with the community.
              </p>
            </div>

            {/* Mobile AI toggle */}
            <div className="lg:hidden">
              {!chatbot ? (
                <button
                  onClick={() => setChatbot(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-500"
                >
                  <img src={glow} className="w-4 h-4" alt="" />
                  AI
                </button>
              ) : (
                <button
                  onClick={() => setChatbot(false)}
                  className="text-emerald-500 text-sm"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 px-2 md:px-0  lg:grid-cols-[400px_1fr] gap-4 lg:gap-0">
            {/* LEFT COLUMN */}
            <div className="space-y-4 md:sticky top-7  self-start md:col-span-1">
              {/* Description / Tips */}
              <div
                className="bg-[#0f172a]/80 lg:w-11/12 border border-emerald-500/20
      bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg md:rounded-xl px-4 py-6 md:p-6 text-gray-300"
              >
                <h2 className="text-lg font-semibold text-white mb-3">
                  Post Guidelines
                </h2>

                <ul className="space-y-2 text-sm">
                  <li>• Use a clear descriptive title</li>
                  <li>• Use a contextual description</li>
                  <li>• Add useful resources like links and documents...</li>
                  <li>• Include suitable thumbnail poster (1280×720 px)</li>
                  <li>Note: Youtube links supports video frame</li>
                </ul>
              </div>

              {/* AI Assistant (Always visible on desktop) */}
              <div
                className={`bg-[#0f172a]/80  lg:w-11/12 h-[450px] border border-emerald-500/20
      bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg md:rounded-xl px-4 py-6 md:p-6 flex flex-col
          ${!chatbot ? "hidden lg:flex" : "flex"}`}
              >
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <img src={glow} className="w-5 h-5" />
                  DraftMate AI
                </h2>

                <div
                ref={containerRef}
                className="flex-1 overflow-y-auto emerald-scrollbar space-y-4 h-[600px] pr-2">
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
                    <div className="text-xs animate-pulse text-gray-400 italic">
                      DraftMate refining your content...
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.message;
                    handleSend(input.value);
                    input.value = "";
                  }}
                  className="flex mt-4  gap-3 outline-none overflow-hidden"
                >
                  <input
                    name="message"
                    placeholder="Ask DraftMate to transform your content..."
                    className="flex-1 px-4  rounded-xl border border-gray-700 py-2 bg-gray-900 text-sm outline-none text-white"
                  />

                  <button 
                  disabled={isTyping}
                  className="text-2xl md:text-2xl transition-all duration-300 hover:text-gray-400 text-gray-500 block transition-all duration-300  disabled:text-gray-700 disabled:cursor-not-allowed">
                    {/* Send */}
                    <VscSend />
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN FORM */}
            <div
              className={`bg-[#0f172a]/80   border  border-gray-800 rounded-lg px-4 py-6  md:p-8 shadow-xl
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
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.title}
                    </p>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-sm text-gray-400 md:text-gray-300 font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    rows="6"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write your post description..."
                    className="w-full mt-2  focus:border focus:border-emerald-500/40 emerald-scrollbar px-4 py-3 rounded-md bg-gray-900 border border-gray-700 outline-none  text-white text-xs leading-relaxed"
                  />

                  {fieldErrors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.description}
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
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.category}
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
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.finalCategory}
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
                  <p className="text-gray-400 md:text-gray-300 text-xs">No Thumbnail</p>
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
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.image}
                    </p>
                  )}
                </div>

                {/* LINKS */}
                <div className="space-y-3 w-full ">
                  <div className="flex w-full items-center justify-between">
                    <label className="text-sm text-gray-400 md:text-gray-300 font-medium">
                      Project Links
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
                      onClick={() => {
                        const titleToUse =
                          currentLinkTitle === "Others"
                            ? customTitle?.trim()
                            : currentLinkTitle.trim();

                        if (titleToUse && currentLinkUrl.trim()) {
                          const newLink = {
                            title: titleToUse,
                            url: currentLinkUrl.trim(),
                          };

                          setLinks([...links, newLink]);

                          setCurrentLinkTitle("");
                          setCurrentLinkUrl("");
                          setCustomTitle("");
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

                  <input
                    type="file"
                    // ref={fileInputRef}
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={onDocumentsChange}
                    className="w-full mt-2 text-xs  text-gray-300 
                      file:mr-4 file:px-2 file:py-1 file:rounded-md 
                      file:border-0 file:bg-emerald-500/20 file:hover:bg-emerald-600/20 file:text-emerald-400 
                      file:cursor-pointer"
                  />
                  {documents.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {documents.map((doc, idx) => (
                        <div
                          // key={idx}
                           key={doc.name + doc.size}
                         

                          className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-emerald-500/20 text-xs text-gray-300"
                        >
                          <span className="text-emerald-400 font-semibold shrink-0">{idx + 1}.</span>
                          <span className="truncate">{doc.name}</span>
                          <span className="ml-auto text-gray-500 shrink-0">
                            {(doc.size / 1024).toFixed(1)} KB
                          </span>
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
                         rounded-md text-xs md:text-sm  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Publish Post"}
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
