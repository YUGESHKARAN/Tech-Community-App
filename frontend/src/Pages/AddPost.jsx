import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NavBar from "../ui/NavBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Footer from "../ui/Footer";
import Chatbot from "../images/chatbt.gif";
import { ReactTyped } from "react-typed";
import axiosInstance from "../instances/Axiosinstances";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import glow from "../assets/glow.png";
import { VscSend } from "react-icons/vsc";
import Cookies from "js-cookie"

function AddPost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const email = localStorage.getItem("email"); // Get email from local storage
  const user = localStorage.getItem("username");
  const [loading, setLoading] = useState(false);
  const [ customTitle ,setCustomTitle]  = useState("");
  const token = Cookies.get("token")
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

  const [isTyping, setIsTyping] = useState(false);
  const [chatbot, setChatbot] = useState(false);

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

    try {
      const response = await axios.post(`${backendEndpoint}`, {
        description: message,
      },
      {
        headers:{
          Authorization: `Bearer ${token}`
        }
      }      
    );

      const botResponse = response.data.content || "Something went wrong, try agein later.";
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
      setIsTyping(false);
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
    };

    addWord();
  };

  useEffect(() => {
    const incommingMessage = messages.filter(
      (msg) => msg.direction === "incoming"
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
      errors.category = "Post category is required.";
    }

    // if (!price || Number(price) <= 0) {
    //   errors.price = "Enter a valid price.";
    // }

    if (!description.trim()) {
      errors.description = "Post description is required.";
    }
    const finalCategory = category === "Others" ? customCategory : category;
    if (category === "Others" && !customCategory.trim()) {
      errors.finalCategory = "Please enter the category.";
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
        formData
      );

      console.log("adding post response", response.data);

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
      toast.success("Post added successfully");
      // navigate("/home");
       navigate("/yourposts");
    } catch (error) {
      console.error("Error adding post:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentsChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    setDocuments(files);
  };



  // console.log("links",links)
  // <div className="container min-h-screen mx-auto md:w-1/2 mx-auto w-11/12 py-8 px-2 md:px-4">
  //       <h1 className="md:text-3xl text-xl font-bold mb-6">Add New Post</h1>
  //       {!chatbot ? (
  //         <div className="md:w-96 w-full px-4 mx-auto flex items-center mb-4 justify-center overflow-x-hidden">
  //           <ReactTyped
  //             strings={["Generate post with AI"]}
  //             typeSpeed={70}
  //             backSpeed={30}
  //             className="text-base text-xs basis-4/5 flex items-center justify-center font-bold text-[#ffff]"
  //             loop
  //           />
  //           <div
  //             onClick={() => setChatbot(true)}
  //             className="bg-gradient-to-r bg-blur cursor-pointer  rounded-md font-semibold from-purple-600 to-blue-500 md:px-4 md:py-2 px-2 flex item-center py-1 text-xs md:text-base hover:bg-purple-700 transition"
  //           >
  //             <img src={glow} className="w-4 h-4 " alt="" />
  //             AI
  //           </div>
  //         </div>
  //       ) : (
  //         <div
  //           onClick={() => setChatbot(false)}
  //           className="bg-gradient-to-r bg-blur w-fit cursor-pointer rounded-md mb-2 from-purple-600 to-blue-500 md:px-4 md:py-2 px-3 py-1 text-xs md:text-base hover:bg-purple-700 transition"
  //         >
  //           ← Back to Post
  //         </div>
  //       )}
  //       {!chatbot ? (
  //         <form onSubmit={handleSubmit} className="space-y-10">
  //           <div>
  //             <label
  //               htmlFor="title"
  //               className="block text-sm font-medium text-gray-300"
  //             >
  //               Title <span className="text-red-500">*</span>
  //             </label>
  //             <input
  //               type="text"
  //               id="title"
  //               value={title}
  //               onChange={(e) => setTitle(e.target.value)}
  //               className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  //               placeholder="Enter post title"
  //             />
  //             {fieldErrors.title && (
  //               <p className="text-sm text-red-500">{fieldErrors.title}</p>
  //             )}
  //           </div>
  //           <div>
  //             <label
  //               htmlFor="description"
  //               className="block text-sm font-medium text-gray-300"
  //             >
  //               Description <span className="text-red-500">*</span>
  //             </label>
  //             <textarea
  //               id="description"
  //               value={description}
  //               onChange={(e) => setDescription(e.target.value)}
  //               className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  //               placeholder="Enter post description"
  //               rows="5"
  //             ></textarea>

  //             {fieldErrors.description && (
  //               <p className="text-sm text-red-500">
  //                 {fieldErrors.description}
  //               </p>
  //             )}
  //           </div>
            
  //           <div>
  //             <label
  //               htmlFor="category"
  //               className="block text-sm font-medium text-gray-300"
  //             >
  //               Category <span className="text-red-500">*</span>
  //             </label>
  //             <select
  //               id="category"
  //               value={category}
  //               onChange={(e) => setCategory(e.target.value)}
  //               className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  //             >
  //               <option value="">Select Domain</option>
  //               <option value="GenAI">GenAI</option>
  //               <option value="Design Thinking">Design Thinking</option>
  //               <option value="Data Science">Data Science</option>
  //               <option value="Blockchain">Blockchain</option>
  //               <option value="AI/ML">AI/ML</option>
  //               <option value="Cyber Security">Cyber Security</option>
  //               <option value="IoT ">IoT</option>
  //               <option value="Embedded System">Embedded System</option>
  //               <option value="Web Development">Web Development</option>
  //               <option value="Satellite Space Technology">
  //                 Satellite Space Technology
  //               </option>
  //               <option value="Others">Others</option>
  //             </select>

  //             {fieldErrors.category && (
  //               <p className="text-sm text-red-500">{fieldErrors.category}</p>
  //             )}
  //           </div>


  //          {
  //           category == 'Others' &&
  //            <div>
  //              <input
  //               type="text"
  //               id="title"
  //               value={customCategory}
  //               onChange={(e) => setCustomCategory(e.target.value)}
  //               className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  //               placeholder="Enter Category"
  //             />
  //              {fieldErrors.finalCategory && (
  //               <p className="text-sm text-red-500">{fieldErrors.finalCategory}</p>
  //             )}


  //           </div>
  //          }
  //           <div>
  //             <label
  //               htmlFor="image"
  //               className="block text-sm font-medium text-gray-300"
  //             >
  //               Thumbnail <span className="text-red-500">*</span>
  //             </label>
  //             <input
  //               type="file"
  //               accept="image/*"
  //               id="image"
  //               onChange={onImageChange}
  //               className="mt-1 block w-full text-sm text-gray-300 text-xs file:mr-4 file:cursor-pointer file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-gray-500 file:text-black file:bg-white "
  //               ref={imageInputRef}
  //             />
  //             {image && (
  //               <button
  //                 type="button"
  //                 onClick={() => {
  //                   setImage("");
  //                   setPreviewImage("");
  //                   if (imageInputRef.current) {
  //                     imageInputRef.current.value = null;
  //                   }
  //                 }}
  //                 className="text-sm text-yellow-500 underline mt-1"
  //               >
  //                 Remove Selected Image
  //               </button>
  //             )}
  //             {previewImage.length > 0 && (
  //               <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
  //                 <div className="p-1 rounded-lg">
  //                   <img
  //                     src={previewImage}
  //                     // alt={`Preview ${idx}`}
  //                     className="w-full md:w-32 md:h-24 h-16 object-cover rounded-lg"
  //                   />
  //                 </div>
  //               </div>
  //             )}
  //             {fieldErrors.image && (
  //               <p className="text-sm text-red-500">{fieldErrors.image}</p>
  //             )}
  //           </div>

  //           <div>

  //           <div className="flex items-center mb-2 justify-between px-1">
  //        <label className="block text-sm font-medium text-gray-300">
  //               Links
  //             </label>
  //              {currentLinkTitle.length>0 &&  <button
  //                onClick={(e)=>{
  //                 e.preventDefault();
  //                 setCurrentLinkTitle("");
  //                 setCurrentLinkUrl("");
  //                 // setShowLinkBox(false);
  //                }}
  //                 className="bg-red-500 md:px-3 px-2 md:text-sm text-xs py-0.5 rounded-md">Clear</button>}


  //           </div>
             
  //             <div className="flex space-x-2 mt-1">

  //               {currentLinkTitle !== "Others" && 
  //                 <select 
  //               value={currentLinkTitle}
  //                  onChange={(e)=>{setCurrentLinkTitle(e.target.value)}}
  //                  className="w-1/2 px-3 py-2 bg-gray-800 border text-sm md:text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-600 rounded-md"
  //               >
  //                <option value="" disabled>Select Link Title</option>
  //                 <option value="GitHub">GitHub</option>
  //                  <option value="YouTube">YouTube</option>
  //                 <option value="Demo">Demo</option>
  //                 <option value="Others">Others</option>
                 

  //               </select>}


  //              {currentLinkTitle === "Others" && (
  //                     <input
  //                       type="text"
  //                       placeholder="Enter platform name"
  //                       onChange={(e) => setCustomTitle(e.target.value)}
  //                       className="w-1/2 px-3 py-2 bg-gray-800 border focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-600 rounded-md"
  //                     />
  //                   )}

  //               <input
  //                 type="url"
  //                 value={currentLinkUrl}
  //                 onChange={(e) => setCurrentLinkUrl(e.target.value)}
  //                 placeholder="Link URL"
  //                 className="w-1/2 px-3 py-2 bg-gray-800 border focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-600 rounded-md"
  //               />
  //               <button
  //                 type="button"
  //                 // onClick={() => {
  //                 //   if (currentLinkTitle.trim() && currentLinkUrl.trim()) {
  //                 //     const newLink = {
  //                 //       title: currentLinkTitle.trim(),
  //                 //       url: currentLinkUrl.trim(),
  //                 //     };
  //                 //     setLinks([...links, newLink]);
  //                 //     setCurrentLinkTitle("");
  //                 //     setCurrentLinkUrl("");
  //                 //   }
  //                 // }}

  //                  onClick={() => {
  //                     const titleToUse = currentLinkTitle === "Others" ? customTitle?.trim() : currentLinkTitle.trim();

  //                     if (titleToUse && currentLinkUrl.trim()) {
  //                       const newLink = {
  //                         title: titleToUse,
  //                         url: currentLinkUrl.trim()
  //                       };
  //                       setLinks([...links, newLink]);
  //                       // setUpdateButton(true);
  //                       setCurrentLinkTitle("");
  //                       setCurrentLinkUrl("");
  //                       setCustomTitle("");
                       
  //                     }
  //                   }}
  //                 className="md:py-2 md:px-4 px-2 py-1 hover:bg-gray-500 bg-white text-gray-800 font-bold rounded-md transition duration-200"
  //               >
  //                 Add
  //               </button>
  //             </div>
  //             {links.length > 0 && (
  //               <div className="mt-2 space-y-1">
  //                 {links.map((link, index) => (
  //                   <div
  //                     key={`${link.title}-${index}`}
  //                     className="flex justify-between items-start bg-gray-700 p-3 md:p-4 rounded-md break-words"
  //                   >
  //                     <div className="text-sm break-all">
  //                       <span className="font-semibold mb-1">
  //                         {" "}
  //                         {link.title}:{" "}
  //                       </span>{" "}
  //                       <br />
  //                       {link.url}
  //                     </div>
  //                     <button
  //                       type="button"
  //                       onClick={() =>
  //                         setLinks((prevLinks) =>
  //                           prevLinks.filter((_, i) => i !== index)
  //                         )
  //                       }
  //                       className="text-red-500 text-xs ml-2 hover:text-red-700"
  //                     >
  //                       ✕
  //                     </button>
  //                   </div>
  //                 ))}
  //               </div>
  //             )}
  //           </div>

  //           <div>
  //             <label
  //               htmlFor="documents"
  //               className="block text-sm font-medium text-gray-300"
  //             >
  //               Source Documents (PDF/Word)
  //             </label>
  //             <input
  //               type="file"
  //               id="documents"
  //               multiple
  //               accept=".pdf,.doc,.docx"
  //               onChange={onDocumentsChange}
  //               className="mt-1 block w-full text-sm text-gray-300 text-xs file:mr-4 file:cursor-pointer file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-gray-500 file:text-black file:bg-white"
  //             />
  //           </div>
  //           <div>
  //             <button
  //               type="submit"
  //               className="w-full md:w-40 md:py-2 px-2 py-1 md:px-4 hover:bg-gray-500 bg-white text-gray-800 font-bold rounded-md transition duration-200"
  //               disabled={loading}
  //             >
  //               {loading ? "Submitting..." : "ADD POST"}
  //             </button>
  //           </div>
  //         </form>
  //       ) : (
  //         <div className="md:w-9/12 p-3 scrollbar-hide h-96 rounded-lg md:p-10 mx-auto border border-gray-700 outline-none rounded-md bg-gray-8000 text-white flex flex-col">
  //           {/* Chat Display Area */}
  //           <h1 className="text-xl flex mx-auto items-center text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
  //             <img src={glow} className="w-6 h-6 mr-1" alt="" /> AI Assistant
  //           </h1>
  //           <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 p-4 ">
  //             {messages.map((msg, idx) => (
  //               <div
  //                 key={idx}
  //                 className={`flex ${
  //                   msg.direction === "outgoing"
  //                     ? "justify-end"
  //                     : "justify-start"
  //                 }`}
  //               >
  //                 <div
  //                   className={`rounded-lg px-4 py-2 md:text-sm leading-relaxed max-w-xs md:max-w-md text-xs ${
  //                     msg.direction === "outgoing"
  //                       ? "bg-gray-700 text-white"
  //                       : // :"bg-gradient-to-r bg-blur from-purple-700 to-blue-500 text-white"
  //                         "bg-gray-800 text-white"
  //                   }`}
  //                 >
  //                   {msg.message}
  //                 </div>
  //               </div>
  //             ))}
  //             {isTyping && (
  //               <div className="text-sm text-gray-400 italic">
  //                 Assistant is typing...
  //               </div>
  //             )}
  //           </div>

  //           {/* Input Area */}
  //           <div className="mt-4">
  //             <form
  //               onSubmit={(e) => {
  //                 e.preventDefault();
  //                 const form = e.target;
  //                 const input = form.elements.message;
  //                 handleSend(input.value);
  //                 input.value = "";
  //               }}
  //               className="flex items-center bg-gray-800 border border-gray-700 outline-none rounded-md overflow-hidden"
  //             >
  //               <input
  //                 type="text"
  //                 name="message"
  //                 placeholder="Type a message..."
  //                 className="flex-1 md:px-4 md:py-2 px-3 py-1 md:text-sm text-xs bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
  //               />
  //               <button
  //                 type="submit"
  //                 className="bg-gradient-to-r bg-blur from-purple-600 to-blue-500 md:px-4 py-2 px-3  text-xs md:text-base hover:bg-purple-700 transition"
  //               >
  //                 Send
  //               </button>
  //             </form>
  //           </div>
  //         </div>
  //       )}
  //     </div>

  return (
    <div className="min-h-screen relative bg-gray-900 text-white">
      <NavBar />
      
       <div className="min-h-screen   w-full pt-4 pb-8">

  <div className="w-full  mx-auto  md:px-4">

    <div className="mb-8 flex px-4 items-center justify-between">
      <div>
        <h1 className="md:text-3xl text-2xl font-bold font-semibold text-white tracking-tight">
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

    <div className="grid grid-cols-1 px-2 md:px-0  lg:grid-cols-3 gap-4 lg:gap-0">

      {/* LEFT COLUMN */}
      <div className="space-y-4 md:sticky top-7  self-start md:col-span-1">

        {/* Description / Tips */}
        <div className="bg-[#0f172a]/80 lg:w-11/12 border border-gray-800 rounded-lg md:rounded-xl px-4 py-6 md:p-6 text-gray-300">
          <h2 className="text-lg font-semibold text-white mb-3">
            Writing Tips
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
          className={`bg-[#0f172a]/80 border lg:w-11/12 border-gray-800 rounded-lg md:rounded-xl px-4 py-6 md:p-6 flex flex-col
          ${!chatbot ? "hidden lg:flex" : "flex"}`}
        >

          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <img src={glow} className="w-5 h-5" />
            DraftMate AI
          </h2>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 max-h-[400px] pr-2">

            {messages.map((msg, idx) => (
              // <div
              //   key={idx}
              //   className={`flex ${
              //     msg.direction === "outgoing"
              //       ? "justify-end "
              //       : "justify-start"
              //   }`}
              // >
              //   <div
              //     className={`px-3 py-2 rounded-lg break-words whitespace-pre-wrap text-sm text-left leading-relaxed  ${
              //       msg.direction === "outgoing"
              //         ? "bg-gray-800  md:ml-5 text-white"
              //         : "bg-gray-900 break-all md:mr-5 text-white"
              //     }   `}
              //   >
              //    <p className=" inline-block"> {msg.message}</p>
              //   </div>
              // </div>
              <div
  className={`flex ${
    msg.direction === "outgoing" ? "justify-end" : "justify-start"
  }`}
>
  <div
    className={`
      max-w-md
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

            {isTyping && (
              <div className="text-xs animate-pulse text-gray-400 italic">
              DraftMate AI is improving your content...
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
              placeholder="Ask AI to generate your post..."
              className="flex-1 px-4 rounded-xl border border-gray-700 py-2 bg-gray-900 text-sm outline-none text-white"
            />

            <button
                      
                        className="text-2xl md:text-2xl transition-all duration-300 hover:text-gray-400 text-gray-500 block"
                      >
                        {/* Send */}
                        <VscSend />
                      </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN FORM */}
      <div
        className={`bg-[#0f172a]/80 md:col-span-2   border  border-gray-800 rounded-lg px-4 py-6  md:p-8 shadow-xl
        ${chatbot ? "hidden lg:block" : "block"}`}
      >

        <form onSubmit={handleSubmit} className="space-y-9 md:space-y-7">

          {/* TITLE */}
          <div>
            <label className="text-sm text-gray-400 font-medium">
              Title <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full mt-2  px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:border focus:border-emerald-500/40 outline-none text-white text-sm"
            />

            {fieldErrors.title && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-gray-400 font-medium">
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
            <label className="text-sm text-gray-400 font-medium">
              Category <span className="text-red-500">*</span>
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-2 px-4 py-2 cursor-pointer focus:border focus:border-emerald-500/40 rounded-md bg-gray-900 border border-gray-700 outline-none text-sm text-white  "
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
              <option value="Satellite Space Technology">Satellite Space Technology</option>
              <option value="Others">Others</option>
            </select>

            {fieldErrors.category && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.category}
              </p>
            )}
          </div>

          {category === "Others" && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category"
              className="w-full mt-2 px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  outline-none text-white text-sm"
            />
          )}

          {/* THUMBNAIL */}
<div>
  <label className="text-sm text-gray-400 font-medium">
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

  {/* PREVIEW */}
  {previewImage && (
    <div className="mt-3">
      <img
        src={previewImage}
        className="md:w-40 w-full  h-40 object-cover  md:object-contain rounded-lg md:border border-gray-700 outline-none"
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
    <label className="text-sm text-gray-400 font-medium">
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
        className="text-xs bg-red-500 px-2 py-1 rounded-md hover:bg-red-600"
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
        className="md:w-1/3 w-full focus:border focus:border-emerald-500/40  px-4 py-2 cursor-pointer rounded-xl bg-gray-900 border border-gray-700 outline-none text-sm text-white"
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
        className="md:w-1/3 w-full focus:border focus:border-emerald-500/40 px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  outline-none text-white text-sm"
      />
    )}

    {/* URL */}
    <input
      type="url"
      value={currentLinkUrl}
      onChange={(e) => setCurrentLinkUrl(e.target.value)}
      placeholder="Paste URL"
      className="md:w-2/3 focus:border focus:border-emerald-500/40 w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 outline-none  outline-none text-white text-sm"
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
      className="px-4 bg-emerald-500/20 w-fit py-1 md:py-2   text-black text-emerald-400  text-xs rounded-md hover:bg-emerald-600/20"
    >
      Add
    </button>
  </div>

  {/* LINKS LIST */}
  {links.length > 0 && (
    <div className="space-y-2 mt-3">

      {links.map((link, index) => (
        <div
          key={`${link.title}-${index}`}
          className="flex justify-between items-start bg-gray-800 border border-gray-700 outline-none rounded-md p-3"
        >

          <div className="text-sm break-all">
            <span className="font-semibold text-gray-300">
              {link.title}
            </span>
            <br />
            <span className="text-gray-400">
              {link.url}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setLinks((prevLinks) =>
                prevLinks.filter((_, i) => i !== index)
              )
            }
            className="text-red-400 hover:text-red-600 text-xs ml-2"
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
              multiple
              accept=".pdf,.doc,.docx"
              onChange={onDocumentsChange}
              className="w-full mt-2 text-xs  text-gray-300 
    file:mr-4 file:px-2 file:py-1 file:rounded-md 
    file:border-0 file:bg-emerald-500/20 file:hover:bg-emerald-600/20 file:text-emerald-400 
    file:cursor-pointer"
            />
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
      <ToastContainer />
    </div>
  );
}

export default AddPost;
