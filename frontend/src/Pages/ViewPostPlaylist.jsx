import React, { useState, useEffect, useContext } from "react";
import blog1 from "../images/loading3.gif";
// import user from "../images/blog48.jpg";
import NavBar from "../ui/NavBar";
import getTimeAgo from "../components/DateCovertion.jsx";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../ui/Footer";
import { MdOutlineInsertComment, MdVideoLibrary } from "react-icons/md";
import { io } from "socket.io-client";
import { ReactTyped } from "react-typed";
import { IoClose } from "react-icons/io5";
import { GlobalStateContext } from "../GlobalStateContext";
import axiosInstance from "../instances/Axiosinstances";
import CommentsBox from "../components/CommentsBox ";
import { FaSquareGithub } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import userImg from "../images/user.png";
function ViewPostPlaylist() {
  const user = localStorage.getItem("username");
  const userEmail = localStorage.getItem("email");
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [singlePostData, setSinglePostData] = useState([]);
  const [timeStamp, setTimeStamp] = useState("");
  const [postId, setPostId] = useState("");
  const { email, id } = useParams();
  const [viewComments, setViewComments] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [profile, setProfile] = useState("");
  const { notification, setNotification } = useContext(GlobalStateContext);

  // Fetch post data
  useEffect(() => {
    const getSinglePost = async () => {
      try {
        const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
        const postData = response.data.data;
        setSinglePostData(postData);
        setTimeStamp(postData.timestamp);
        setPostId(postData._id);
        setProfile(postData.profile);
      } catch (err) {
        console.error("Error fetching post data", err);
      }
    };
    getSinglePost();
  }, [email, id]);

  useEffect(() => {
    const getComments = async () => {
      try {
        const response = await axiosInstance.get(`/blog/posts/${email}/${id}`);
        const comments = response.data.data;
        setMessages(comments.messages);
      } catch (err) {
        console.error("Error fetching comments", err);
      }
    };
    getComments();
  }, [messages]);

  useEffect(() => {
 
    const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;
    const newSocket = io(`${socketUrl}`, {
      transports: ["polling"],
    });
    setSocket(newSocket);

    // Register the user with their email
    newSocket.emit("registerUser", userEmail);
    newSocket.emit("joinPostRoom", postId);

    // Listen for incoming notifications
    newSocket.on("notification", (notification) => {
      console.log("Received notification:", notification);
      setNotification((prevNotifications) => [
        notification,
        ...prevNotifications,
      ]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [postId, userEmail]);

  // console.log("postId", postId);

  // Post comment function
  const postComment = () => {
    setViewComments(true);
    if (newMessage.trim() === "") return;

    const messageData = {
      postId,
      user,
      email: userEmail,
      message: newMessage,
      url: `${window.location.origin}/viewpage/playlist/${singlePostData.authoremail}/${postId}`,
      profile: profile,
    };

    socket.emit("newMessage", messageData);
    setNewMessage("");
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const renderTextWithHashtags = (text) => {
    if (!text) return null;

    // Convert visible "\r\n" or "\\n" into real line breaks
    const cleanedText = text.replace(/\\r\\n|\\n|\\r\n/g, "\n");

    return cleanedText.split("\n").map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.split(/(\s+#\w+)/g).map((word, index) =>
          word.startsWith(" #") ? (
            <span
              key={index}
              className="text-md text-white font-italy font-bold"
            >
              {word}
            </span>
          ) : (
            <React.Fragment key={index}>{word}</React.Fragment>
          )
        )}
        <br />
      </React.Fragment>
    ));
  };

  // console.log("profile",profile)

  return (
    <div className="w-full min-h-screen h-auto relative bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />

      <div className="md:min-h-screen  h-auto md:pb-40 md:w-3/6 w-full pb-20 p-1 md:p-10 flex flex-col justify-center items-center m-auto md:mt-10">
        <div className="w-full flex bg-gray-800 flex-col p-3 h-auto items-center">
      
          <div className="flex  justify-between w-full items-center">
            <div className="flex  justify-between gap-2 items-center">
              <Link></Link>
              <Link to={`/viewProfile/${email}`}>
                <img
                  src={profile?`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${profile}`:userImg}
                  className="w-8 max-h-10 bg-white object-cover rounded-full border border-white/50"
                  alt="Author Profile"
                />
              </Link>
              <h3 className="flex flex-col items-center justify-center">
                <p className="md:text-md text-white text-sm w-full font-bold">
                  {singlePostData.authorname}
                </p>
                <p className="md:text-sm w-full text-xs font-semibold text-gray-400">
                  {singlePostData.timestamp
                    ? 
                    // singlePostData.timestamp.slice(0, 10)
                    getTimeAgo(singlePostData.timestamp)
                    : "null"}
                </p>
              </h3>
            </div>
            <div className="flex items-center gap-5 justify-start">
              <button
                className="bg-[#F8EFBA] rounded-md px-2 md:px-3 py-0.5 md:py-1 text-sm md:text-base text-[#182C61]"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </div>

          <h3 className="w-full text-white mb-2 mt-2 text-left text-lg md:text-3xl font-bold">
            {singlePostData.title}
          </h3>

          <img
            src={
              singlePostData.image
                ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                : blog1
            }
            className="w-full cursor-pointer h-fit bg-black"
            alt="Post"
            onClick={() =>
              handleImageClick(
                singlePostData.image
                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                  : blog1
              )
            }
          />

          <div className="w-full  mt-2  text-xs  text-gray-300 text-md">
            {singlePostData.description && showContent ? (
              <>
                <span className="md:text-base leading-relaxed text-wrap  break-words whitespace-normal  text-sm ">
                  {renderTextWithHashtags(singlePostData.description)}
                </span>
                <span
                  className="text-xs text-yellow-500 cursor-pointer"
                  onClick={() => setShowContent(false)}
                >
                  show Less
                </span>{" "}
              </>
            ) : (
              <>
                {" "}
                {singlePostData.description && (
                  <span className="md:text-base leading-relaxed break-words whitespace-normal truncate text-wrap text-sm">
                    {renderTextWithHashtags(
                      singlePostData.description.slice(0, 80)
                    )}
                  </span>
                )}
                ... <br />{" "}
                <span
                  className="text-xs text-yellow-500 mt-4 cursor-pointer "
                  onClick={() => setShowContent(true)}
                >
                  Show More
                </span>
              </>
            )}

            <h1
              className={`${
                singlePostData.documents?.length == 0 &&
                singlePostData.links?.length == 0
                  ? "hidden"
                  : "block mt-6 md:text-lg text-base font-semibold text-white/90 border-b border-white/20 pb-3 tracking-wide"
              }`}
            >
              📎 Source Documents & Links
            </h1>

            <div className="flex flex-row flex-wrap mb-4 mt-4 gap-3 w-full">
              {singlePostData.documents?.length > 0 &&
                singlePostData.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${doc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 text-sm font-medium text-gray-100 hover:scale-[1.02]"
                  >
                    📄{" "}
                    <span className="truncate max-w-xs text-white/90 group-hover:text-white">
                      {doc.split("-").slice(5).join("-")}
                    </span>
                  </a>
                ))}

                </div>
                <div className="flex flex-row flex-wrap mb-4 mt-4 gap-3 w-full">
                

              {singlePostData.links?.length > 0 &&
                singlePostData.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/30 to-blue-400/20 border border-blue-500/20 rounded-xl shadow-sm hover:from-blue-500/40 hover:to-blue-400/40 hover:border-blue-400/40 transition-all duration-300 text-sm font-medium text-blue-200 hover:text-white hover:scale-[1.02]"
                  >
                    {/* 🔗 <span className="truncate max-w-xs">{link.title}</span> */}
                    {link.title==='YouTube'?<FaYoutube  className="text-xl" />:link.title==='GitHub'?<FaSquareGithub  className="text-xl"/>:link.title==='Demo'?<MdVideoLibrary className="text-xl"/>:'🔗'} <span className="truncate max-w-xs">{link.title}</span>
                  </a>
                ))}
            </div>
          </div>

          {/* Comment Section */}
          {/* Modern Comments Section */}
          <div className="w-full mt-8 p-5 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg border border-gray-700 text-white transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                💬 Comments
                <span className="text-sm text-gray-400 font-normal">
                  {messages.length>0 && (`(${messages.length})`)}
                </span>
              </h3>
              <MdOutlineInsertComment
                onClick={() => setViewComments(!viewComments)}
                className="text-2xl cursor-pointer hover:text-orange-400 transition-colors duration-200"
              />
            </div>

            {/* Comments List */}
            <CommentsBox
              messages={messages}
              viewComments={viewComments}
              // timeStamp={timeStamp}
            />

            {/* Comment Input */}
            <div className="mt-4 flex flex-col w-full">
              <input
                type="text"
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                placeholder="Write a comment..."
                className="w-full text-sm border border-gray-600 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all duration-200 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400"
              />
              <button
                onClick={postComment}
                className="self-end mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-sm font-medium text-gray-900 hover:from-orange-600 hover:to-yellow-600 shadow-md transition-all duration-300"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full">
        <Footer />
      </div>
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="">
            <img
              src={selectedImage}
              alt="Selected"
              className="max-w-full w-11/12 mx-auto max-h-full"
            />
            <button
              onClick={handleCloseModal}
              className="absolute top-10 right-10"
            >
              <IoClose className="text-2xl text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPostPlaylist;
