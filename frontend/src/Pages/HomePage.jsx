import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../ui/NavBar";
import BlogContainer from "./BlogContainer";
import Footer from "../ui/Footer";
import { Link } from "react-router-dom";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { GoCopilot } from "react-icons/go";
import { MdAnnouncement, MdAppSettingsAlt } from "react-icons/md";
import axiosInstance from "../instances/Axiosinstances";
import { RiBookMarkedFill, RiUser3Line } from "react-icons/ri";
import { IoIosGitNetwork } from "react-icons/io";
import { BsPersonWorkspace } from "react-icons/bs";
function HomePage() {
  const username = localStorage.getItem("username");

  const [categoryCount, setCategoryCount] = useState(0);
  const [announcement, setAnnouncement] = useState([]);
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");



  const getData = async () => {
    try {
      // const response = await axios.get(`https://node-blog-app-seven.vercel.app/blog/posts/`);
      const response = await axiosInstance.get(`/blog/posts/`);
      // console.log("data", response.data);
      setCategoryCount(response.data.count);
      // setPosts(response.data.posts);
    } catch (err) {
      console.log("Error", err);
    }
  };

  const getAuthorData = async () => {
    try {
      // const response = await axios.get(`https://node-blog-app-seven.vercel.app/blog/posts/`);
      const response = await axiosInstance.get(`/blog/author/${email}`);
      // console.log("data", response.data);
      setAnnouncement(response.data.announcement);
  
    } catch (err) {
      console.log("Error", err);
    }
  };

  useEffect(() => {
    getData();
    getAuthorData();
  }, []);

  // Chatbot
  const [messages, setMessages] = useState([
    {
      message: "Hi Chief, Blog Copilot is here. How can I help?",
      sender: "bot",
      direction: "incoming",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatbot, setChatbot] = useState(false);

  const backendEndpoint = "https://mongodb-rag.onrender.com/query-rag";
  // const backendEndpoint = "http://127.0.0.1:3000/query-rag";

  // const handleSend = async (message) => {
  //   const newMessage = {
  //     message,
  //     sender: "user",
  //     direction: "outgoing",
  //   };
  //   setMessages((prev) => [...prev, newMessage]);

  //   setIsTyping(true);

  //   console.log("my query mesg",message)

  //   try {
  //     const response = await axios.post(backendEndpoint, {
  //       query: message,
  //     });

  //     const botResponse = response.data.response || "No response received.";
  //     console.log("bot response",response)
  //     typewriterEffect(botResponse, "bot");
  //   } catch (error) {
  //     console.log("Error fetching response:", error);
  //     const errorMessage = {
  //       message: "An error occurred. Please try again later.",
  //       sender: "bot",
  //       direction: "incoming",
  //     };
  //     setMessages((prev) => [...prev, errorMessage]);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // };
  const handleSend = async (message) => {
    // Sanitize input message to remove HTML tags
    const sanitizedMessage = message.replace(/<[^>]*>/g, ""); // Removes HTML tags
    console.log("san mesg", sanitizedMessage);
    const newMessage = {
      message: sanitizedMessage,
      sender: "user",
      direction: "outgoing",
    };

    // Add user message to the messages array
    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    // console.log("User's query message:", sanitizedMessage);

    try {
      // Send POST request to the backend
      const response = await axios.post(backendEndpoint, {
        query: sanitizedMessage,
      });

      // Extract bot response or use a fallback
      const botResponse =
        response.data?.response || "No response received from the bot.";
      // console.log("Bot response:", response);

      // Show the bot's response with a typewriter effect
      typewriterEffect(botResponse, "bot");
    } catch (error) {
      console.log("Error fetching response:", error);

      // Log error details for debugging
      if (error.response) {
        console.log("Server Response Data:", error.response.data);
        console.log("Server Response Status:", error.response.status);
      }

      // Add error message to the messages array
      const errorMessage = {
        message: "An error occurred. Please try again later.",
        sender: "bot",
        direction: "incoming",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // Ensure typing status is cleared
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

  // console.log('your posts', yourPost);
  // console.log('email', email);
  // console.log("role localstorage", role);
  // console.log("authors", authors);

  return (
   
    <div className="min-h-screen h-auto  relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      <NavBar />

      {/* Page Title */}
      <h1 className="text-center text-3xl md:text-4xl font-extrabold mt-8 mb-10 tracking-wide bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
      {/* <h1 className="text-center text-3xl md:text-4xl font-extrabold mt-8 mb-10 tracking-wide text-white/90"> */}
        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
      </h1>

      {/* Stats / Quick Actions Grid */}
      <div className="grid grid-cols-2  md:grid-cols-4 gap-6 w-11/12 md:w-9/12 mx-auto mb-10">
        {/* Control / My Posts / Announcement */}
        <div className="bg-white/10  border border-white/40  backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          {role === "admin" ? (
            <Link to="/control" className="flex flex-col items-center">
              <MdAppSettingsAlt className="text-4xl text-green-400 mb-2" />
              <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
                Controls
              </h3>
            </Link>
          ) : role === "coordinator" ? (
            <Link to="/workspace" className="flex flex-col items-center">
              <span className="text-4xl font-bold mb-2 text-white">
                {/* {yourPost && yourPost.length} */}
                <BsPersonWorkspace className="text-4xl text-white mb-2" />
              </span>
              <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
                Workspace
              </h3>
            </Link>
          ) : (
            <Link to="/announcement" className="flex flex-col items-center">
              <div className="relative flex justify-center items-center mb-2">
                <MdAnnouncement className="text-4xl text-green-400" />
                {announcement.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {announcement.length}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
                Announcement
              </h3>
            </Link>
          )}
        </div>

        {/* Bookmarks */}
        <div className="bg-white/10 backdrop-blur-md border border-white/40 rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link
            to={`/bookMarkPage/${email}`}
            className="flex flex-col items-center"
          >
            <RiBookMarkedFill className="text-4xl mb-2 text-white" />
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">Bookmarks</h3>
          </Link>
        </div>

        {/* Authors */}
        <div className="bg-white/10  border border-white/40  backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link to="/authors" className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-2 text-white">
              {/* {authors.length} */}
               <IoIosGitNetwork  />
            </span>
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">My Network</h3>
          </Link>
        </div>

        {/* Tech Domains */}
        <div className="bg-white/10  border border-white/40  backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-white/10">
          <Link to="/community" className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-2 text-white">
              {categoryCount}
            </span>
            <h3 className="text-lg font-bold  bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
              Domains
            </h3>
          </Link>
        </div>
      </div>

      {/* Blog Container */}
      <div className="flex-grow ">
        <BlogContainer/>
      </div>

      {/* Chatbot Overlay */}
      {/* <div
        className={`${
          chatbot
            ? "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            : "hidden"
        }`}
      >
        <div className="w-full flex flex-col items-center">
          <MainContainer className="rounded-xl h-96 md:w-1/2 w-10/12 mx-auto bg-gray-900/90 shadow-2xl border border-gray-700">
            <ChatContainer>
              <MessageList
                typingIndicator={
                  isTyping && (
                    <TypingIndicator
                      className="bg-gray-900 w-full text-gray-400"
                      content="Copilot is typing..."
                    />
                  )
                }
                className="bg-gray-900 text-gray-200 p-4 overflow-y-auto"
              >
                {messages.map((msg, idx) => (
                  <Message
                    key={idx}
                    className="mb-3"
                    model={{
                      message: msg.message,
                      sentTime: "just now",
                      sender: msg.sender,
                      direction: msg.direction,
                    }}
                  />
                ))}
              </MessageList>

              <MessageInput
                placeholder="Type a message..."
                onSend={handleSend}
                className="bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
              />
            </ChatContainer>
          </MainContainer>

          <button
            onClick={() => setChatbot(!chatbot)}
            className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 px-5 py-2 rounded-md text-sm font-semibold transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div> */}

      <Footer />
    </div>
  );
}

export default HomePage;
