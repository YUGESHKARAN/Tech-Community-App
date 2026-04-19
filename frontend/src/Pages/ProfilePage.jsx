import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";

import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiOutlineUserCircle } from "react-icons/hi";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { FaLinkedin, FaUserAlt } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";
import { ImProfile } from "react-icons/im";

import { PiLinkSimpleFill } from "react-icons/pi";
import { MdEdit } from "react-icons/md";
import toast from "../components/toaster/Toast"
import { getItem, removeItem } from "../utils/encode";
import ProfilePageSkeleton from "../components/loaders/ProfilePageSkeleton";
function ProfilePage() {
  const { logout } = useAuth();
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  // const role = localStorage.getItem("role");
  const role    = getItem("role");
  const [author, setAuthor] = useState({});
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [image, setImage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [links, setLinks] = useState([]);
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [linkId, setLinkId] = useState(null); // New state for link ID
  const [profileLinks, setProfileLinks] = useState([]); // New state for profile links
  const [showLinkBox, setShowLinkBox] = useState(false); // State to toggle link input box
  const [customTitle, setCustomTitle] = useState("");
  const [updateButton, setUpdateButton] = useState(false);
  const [posts, setPosts] = useState([]);
  const [password, setPassword] = useState("");
  const userName = localStorage.getItem('username');
  const [loader, setLoader] = useState(false)

  const deleteAuthor = async () => {
    setShowConfirm(true);
    
    if (!password){
      toast.warning("Required", "Your password is required to delete the account");
      setShowConfirm(false)
      return ""
    }
    setLoading(true);

    try {
      const response = await axiosInstance.delete(`/blog/author/${email}`, {
        data: { password },
      });
      
      response.status === 200 && logout();
    } catch (err) {
      console.log(err);
      toast.error('Unauthorized', 'Unable to delete the account')
    } finally {
      setLoading(false);
      setPassword("");
      setShowConfirm(false);
    }
  };

  const fetchAuthor = async () => {
    try {
      setLoader(true)
      const response = await axiosInstance.get(`/blog/author/${email}`);
      const authorData = response.data;
      setAuthorName(authorData.authorname);
      setAuthorEmail(authorData.email);
      setAuthor(response.data);
      setImage(response.data.profile);
      setFollowers(authorData.followers);
      setFollowing(authorData.following);
      setProfileLinks(authorData.personalLinks);
      setPosts(authorData.posts);
    } catch (err) {
      console.log(err);
    }
    finally{
      setLoader(false)
    }
  };
  useEffect(() => {
    fetchAuthor();
  }, []);

  const onImageChange = (e) => {
    setImage(e.target.files[0]);
    setUpdateButton(true);

    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      // You can also send this file to backend here if needed
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setLoading(true);
    const formData = new FormData();
    formData.append("authorname", authorName);
    localStorage.setItem("username", authorName);
    formData.append("email", authorEmail);
    formData.append("links", JSON.stringify(links));

    if (image !== "") {
      formData.append("profile", image);
    }

    try {
      const response = await axiosInstance.put(
        `/blog/author/${email}`,
        // `/blog/author/${email}`,
        formData
      );
     
      if (response.status === 201) {
        // navigate("/home"); // Redirect to the homepage
        toast.success('Updated', 'Account details updated successfully')
        setLinks([]);
        fetchAuthor();
        setLinkId(null); // Reset link ID after submission
        setShowLinkBox(false);
      }

      // console.log("links", links);
    } catch (error) {
      console.log("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
      setUpdateButton(false);
    }
  };

  const removeLinks = async (authorEmail, linkId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this link?"
      );
      if (!confirm) {
        setLoading(false);
        return; // If user cancels, exit the function
      }
      const response = await axiosInstance.delete(
        `/blog/author/personalLinks/${authorEmail}/links/${linkId}`
      );
      if (response.status === 200) {
        setProfileLinks((prev)=>
          prev.filter((link)=> link._id!==linkId)
        )
        toast.success('Deleted', 'Bio link removed successfully')
        // fetchAuthor();
        setShowLinkBox(false);
      }
    } catch (err) {
      toast.error('Error', 'Error removing bio link')
      console.log("error", err);
    }
  };
console.log("author", author)
  // console.log("profile links", profileLinks)
  return (
//     <div className="min-h-screen relative bg-gray-900 text-white">
//       <NavBar />

//       <div className=" mx-auto md:px-4 py-6 pb-12 w-full">
//         {/* Header */}
//         <div className="flex w-full items-center px-3 md:p-0 justify-between mb-7">
//           <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
//             My Bio
//           </h1>
//           <button
//             onClick={() => setShowConfirm(true)}
//             className="flex items-center gap-2 text-gray-200 bg-red-600/80 hover:bg-red-600/60 transition-all duration-200 px-3 py-2 rounded-md shadow-sm"
//             title="Delete Account"
//           >
//             <RiDeleteBin6Line size={20} />
//             <span className="hidden md:inline font-medium">Delete Account</span>
//           </button>
//         </div>

//         {/* Two Column Layout */}
//         <div className="grid md:grid-cols-[350px_1fr] md:gap-4">
//           {/* LEFT COLUMN — Profile Overview */}
//           <div className="bg-gray-900 backdrop-blur-xl mx-3 md:mx-0 rounded-2xl p-6 text-center md:shadow-[0_10px_40px_rgba(0,0,0,0.6)] md:border border-neutral-800 md:sticky top-7 self-start">

//   {/* Profile Picture */}
//   <div className="relative w-fit mx-auto mb-6">
//     {previewImage ? (
//       <img
//         src={previewImage}
//         alt="Preview"
//         className="rounded-full object-cover border-2 border-emerald-500 w-36 h-36 md:w-40 md:h-40 shadow-md"
//       />
//     ) : author.profile ? (
//       <img
//         src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
//         alt="Profile"
//         className="rounded-full object-cover border-2 border-emerald-500 w-36 h-36 md:w-40 md:h-40 shadow-md"
//       />
//     ) : (
//       <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center rounded-full bg-neutral-800 border-2 border-emerald-500 shadow-md">
//         <HiOutlineUserCircle className="text-neutral-500 text-8xl md:text-9xl" />
//       </div>
//     )}

//     {/* Edit Overlay */}
//     <label
//       htmlFor="image"
//       className="absolute bottom-2 right-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 p-2 rounded-full shadow-md cursor-pointer transition"
//       title="Change Profile Picture"
//     >
//       <MdEdit />
//     </label>
//     <input
//       type="file"
//       id="image"
//       accept="image/*"
//       onChange={onImageChange}
//       className="hidden"
//     />
//   </div>

//   {/* Stats */}
//   <div className="flex justify-center gap-8 md:gap-6 mb-6">

//     {author.role !== "student" && followers?.length>0 && (
//       <div>
//         <p className="text-xs text-gray-400">Followers</p>
//         <p className="text-lg md:text-xl font-semibold text-white">
//           {followers?.length ?? 0}
//         </p>
//       </div>
//     )}

//     {author.role !== "student" && posts.length > 0 ? (
//       <Link to={`/yourposts`}>
//         <p className="text-xs text-gray-400 mb-1">Content</p>
//         <button
//           className="
//             text-sm font-semibold px-4 py-1.5 rounded-lg
//             bg-emerald-500/10 text-emerald-400
//             border border-emerald-500/20
//             hover:bg-emerald-500/20
//             transition-all duration-300
//           "
//         >
//           {posts.length}
//         </button>
//       </Link>
//     ) : (
//       author.role !== "student" && (
//         <div>
//           <p className="text-xs text-gray-400 mb-1">Content</p>
//           <p className="text-sm text-gray-500">Yet to...</p>
//         </div>
//       )
//     )}

//       {following?.length>0 && <div>
//         <p className="text-xs text-gray-400">Following</p>
//         <p className="text-lg md:text-xl font-semibold text-white">
//           {following?.length ?? 0}
//         </p>
//       </div>}
//   </div>

//   {/* Tech Communities */}
//   {author.community?.length > 0 && (
//     <div className="mt-6">
//       <p className="text-emerald-400 font-medium mb-3 text-xs uppercase tracking-wider">
//         Tech Communities
//       </p>

//       <div className="flex flex-wrap justify-center gap-2">
//         {author.community.map((com, i) => (
//           <span
//             key={i}
//             className="
//               px-3 py-1 text-xs
//               bg-emerald-500/10
//               text-emerald-300
//               border border-emerald-500/20
//               rounded-full
//             "
//           >
//             {com}
//           </span>
//         ))}
//       </div>
//     </div>
//   )}

// </div>

//           {/* RIGHT COLUMN — Profile Form */}
//           <form
//             onSubmit={handleSubmit}
//             className="space-y-4  bg-gray-900 rounded-2xl gap-3 grid xl:grid-cols-2  px-5 pb-6 md:py-6 md:p-10 md:px-16 md:shadow-[0_10px_40px_rgba(0,0,0,0.6)] md:border border-neutral-800"
//           >
//             {/* Author Name */}
//             <div className="space-y-8">
//             <div>
//               <label
//                 htmlFor="authorName"
//                 className="block text-sm  text-gray-300 font-medium mb-2"
//               >
//                 Author Name
//               </label>
//               <input
//                 type="text"
//                 id="authorName"
//                 value={authorName}
//                 onChange={(e) => {
//                   setAuthorName(e.target.value);
//                   setUpdateButton(true);
//                 }}
//                 className="mt-1 block text-sm w-full px-4 py-2 outline-none bg-gray-900 border border-gray-600 rounded-md focus:border-emerald-500"
//                 placeholder="Enter author name"
//                 required
//               />
//             </div>

//             {/* Author Email */}
//             <div>
//               <label
//                 htmlFor="authorEmail"
//                 className="block text-sm text-gray-300 font-medium mb-2"
//               >
//                 Author Email
//               </label>
//               <input
//                 type="email"
//                 id="authorEmail"
//                 value={authorEmail}
//                 readOnly
//                 className="mt-1 text-sm outline-none block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
//               />
//             </div>

//             {/* Role */}
//             <div>
//               <label
//                 htmlFor="role"
//                 className="block text-sm text-gray-300 font-medium mb-2"
//               >
//                 Author Role
//               </label>
//               <input
//                 type="text"
//                 id="role"
//                 value={role}
//                 readOnly
//                 className="mt-1 block text-sm outline-none w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
//               />
//             </div>
//             {/* Add New Links Section */}
//             <div
//               className={`${
//                 profileLinks.length >= 5 && !showLinkBox ? "hidden" : "w-full "
//               }hidden md:block`}
//             >
//               <div className="flex items-center mb-2 justify-between px-1">
//                 <label className="block  text-xs md:text-sm text-gray-300 ">
//                   {showLinkBox 
//                     ? "Edit Link"
//                     :`  ${5 - profileLinks.length >0? `You can add ${5 - profileLinks.length}`: "" } `}
//                 </label>

//                 {currentLinkTitle.length > 0 && (
//                   <button
//                     onClick={(e) => {
//                       e.preventDefault();
//                       setCurrentLinkTitle("");
//                       setCurrentLinkUrl("");
//                       setShowLinkBox(false);
//                     }}
//                     className="bg-red-600/80 hover:bg-red-600/60 transition-all duration-300  px-2 md:px-3  text-xs md:py-1 py-0.5 rounded-md"
//                   >
//                     Clear
//                   </button>
//                 )}
//               </div>
              
//              {(profileLinks?.length + links?.length <5 || showLinkBox) &&
//               <div className="flex  flex-col w-full  md:justify-between md:flex-row md:items-center gap-3">
//                 <div className="w-full md:w-full">
//                   {currentLinkTitle !== "Others" && (
//                     <select
//                       value={currentLinkTitle}
//                       onChange={(e) => {
//                         setCurrentLinkTitle(e.target.value);
//                       }}
//                       className="w-full px-3 py-1 md:py-2 bg-gray-900 cursor-pointer border md:text-sm border-gray-600 focus:border-emerald-500 outline-none rounded-md text-xs   text-gray-200"
//                     >
//                       <option value="" disabled>
//                         Select Link Title
//                       </option>
//                       {!profileLinks.some(
//                         (l) =>
//                           l.title === "GitHub" && currentLinkTitle !== "GitHub"
//                       ) && <option value="GitHub">GitHub</option>}
//                       {!profileLinks.some(
//                         (l) =>
//                           l.title === "LinkedIn" &&
//                           currentLinkTitle !== "LinkedIn"
//                       ) && <option value="LinkedIn">LinkedIn</option>}
//                       {!profileLinks.some(
//                         (l) =>
//                           l.title === "Portfolio" &&
//                           currentLinkTitle !== "Portfolio"
//                       ) && <option value="Portfolio">Portfolio</option>}
//                       {showLinkBox &&
//                         profileLinks.map((row) => (
//                           <option value={row.title}>{row.title}</option>
//                         ))}

//                       <option value="Others">Others</option>
//                     </select>
//                   )}

//                   {currentLinkTitle === "Others" && (
//                     <input
//                       type="text"
//                       placeholder="Enter platform name"
//                       onChange={(e) => setCustomTitle(e.target.value)}
//                       className="w-full  px-3 py-1 md:py-2 bg-gray-900 text-xs md:text-sm outline-none border border-gray-600 rounded-md focus:border-emerald-500"
//                     />
//                   )}
//                 </div>
//                 <input
//                   type="url"
//                   value={currentLinkUrl}
//                   onChange={(e) => setCurrentLinkUrl(e.target.value)}
//                   placeholder="Link URL"
//                   className="w-full  px-3 py-1 md:py-2 bg-gray-900 text-xs md:text-sm outline-none border border-gray-600 rounded-md focus:border-emerald-500"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     const titleToUse =
//                       currentLinkTitle === "Others"
//                         ? customTitle?.trim()
//                         : currentLinkTitle.trim();

//                     if (titleToUse && currentLinkUrl.trim()) {
//                       const newLink = {
//                         title: titleToUse,
//                         url: currentLinkUrl.trim(),
//                         id: linkId,
//                       };
//                       setLinks([...links, newLink]);
//                       setUpdateButton(true);
//                       setCurrentLinkTitle("");
//                       setCurrentLinkUrl("");
//                       setCustomTitle("");
//                       setLinkId(null);
//                     }
//                   }}
//                   className="px-4 bg-emerald-500/20 w-fit py-1 md:py-2   text-black text-emerald-400  text-xs rounded-md hover:bg-emerald-600/20"
//                 >
//                   Add
//                 </button>
//               </div>}

//               {links.length > 0 && (
//                 <div className="mt-3 space-y-2">
//                   {links.map((link, index) => (
//                     <div
//                       key={`${link.title}-${index}`}
//                       className="flex justify-between items-center bg-gray-900/90 shadow-xl p-3 rounded-md"
//                     >
//                       <div className="text-sm md:flex md:items-center w-full break-all">
//                         <span className=" text-white">
//                           {link.title}
//                         </span>
//                         <br />
//                         <a
//                           href={link.url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-400 md:ml-2 hover:underline break-all"
//                         >
//                           {link.url}
//                         </a>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setLinks((prevLinks) =>
//                             prevLinks.filter((_, i) => i !== index)
//                           )
//                         }
//                         className="text-red-500 text-xs ml-2 hover:text-red-700"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             </div>

//             {/* Contact Links Section */}
//             <div className="space-y-8">
//             <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/70 rounded-xl shadow-md p-2 md:p-6 backdrop-blur-md  border-gray-700">
//               <h3 className="text-xl font-semibold text-center text-white mb-4">
//                 Bio Links
//               </h3>

//               {profileLinks?.length > 0 ? (
//                 <div className="space-y-3">
//                   {profileLinks.map((link, index) => (
//                     <div
//                       key={index}
//                       className="relative bg-gray-800/30 hover:bg-gray-800/90  border-neutral-700 rounded-lg p-3 transition-all duration-300 group"
//                     >
//                       <div className="flex flex-row md:flex-row md:items-center md:justify-between gap-2">
//                         <div className="w-full flex flex-col">
//                           <div className="flex gap-2 items-center">
//                             {link.title === "LinkedIn" ? (
//                               <FaLinkedin className="text-3xl" />
//                             ) : link.title === "GitHub" ? (
//                               <FaSquareGithub className="text-3xl" />
//                             ) : link.title === "Portfolio" ? (
//                               <BsPersonSquare className="text-3xl" />
//                             ) : (
//                               <PiLinkSimpleFill className="text-3xl" />
//                             )}
//                             <div className="flex flex-col">
//                               <p className="text-gray-300 text-sm font-medium ">
//                               {link.title}
//                             </p>
//                              <a
//                             href={link.url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-400 text-[10px] font-normal hover:underline break-all"
//                           >
//                             {userName}/{link.title}
//                           </a>
//                             </div>
//                           </div>
                         
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex items-center gap-2 mt-1 md:mt-0">
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setCurrentLinkTitle(link.title);
//                               setCurrentLinkUrl(link.url);
//                               setLinkId(link._id);
//                               setLinks((prev) =>
//                                 prev.filter((_, i) => i !== index)
//                               );
//                               setShowLinkBox(true);
//                               setUpdateButton(true);
//                             }}
//                             className="p-1 md:p-1.5  rounded-full text-sm bg-blue-600/20 hover:bg-blue-600/30 text-white transition-all duration-200"
//                             title="Edit link"
//                           >
//                             <MdEdit className="text-xs md:text-sm" />
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => removeLinks(authorEmail, link._id)}
//                             className="p-1 md:p-1.5  rounded-full bg-red-600 hover:bg-red-500 text-white transition-all duration-200"
//                             title="Remove link"
//                           >
//                             <IoIosRemoveCircleOutline className="text-xs md:text-sm" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-gray-400 text-center text-sm mt-4">
//                   You can add your LinkedIn, GitHub, portfolio, or other
//                   professional profile links here. This helps people connect
//                   with you.
//                 </p>
//               )}
//             </div>

//               <div
//               className={`${
//                 profileLinks.length >= 5 && !showLinkBox ? "hidden" : "w-full "
//               } md:hidden block`}
//             >
//               <div className="flex items-center mb-2 justify-between px-1">
//                 <label className="block  text-xs md:text-sm text-gray-300 ">
//                   {showLinkBox 
//                     ? "Edit Link"
//                     :`  ${5 - profileLinks.length >0? `You can add ${5 - profileLinks.length}`: "" } `}
//                 </label>

//                 {currentLinkTitle.length > 0 && (
//                   <button
//                     onClick={(e) => {
//                       e.preventDefault();
//                       setCurrentLinkTitle("");
//                       setCurrentLinkUrl("");
//                       setShowLinkBox(false);
//                     }}
//                     className="bg-red-600/80 hover:bg-red-600/60 transition-all duration-300  px-3 md:px-3  text-xs md:py-1 py-1 rounded-md"
//                   >
//                     Clear
//                   </button>
//                 )}
//               </div>
              
//              {(profileLinks?.length + links?.length <5 || showLinkBox) &&
//               <div className="flex  flex-col w-full  md:justify-between md:flex-row md:items-center gap-3">
//                 <div className="w-full md:w-full">
//                   {currentLinkTitle !== "Others" && (
//                     <select
//                       value={currentLinkTitle}
//                       onChange={(e) => {
//                         setCurrentLinkTitle(e.target.value);
//                       }}
//                       className="w-full px-3 py-2 bg-gray-900 border md:text-sm border-gray-600 focus:border-emerald-500 cursor-pointer outline-none rounded-md text-xs   text-gray-200"
//                     >
//                       <option value="" disabled>
//                         Select Link Title
//                       </option>
//                       {!profileLinks.some(
//                         (l) =>
//                           l.title === "GitHub" && currentLinkTitle !== "GitHub"
//                       ) && <option value="GitHub">GitHub</option>}
//                       {!profileLinks.some(
//                         (l) =>
//                           l.title === "LinkedIn" &&
//                           currentLinkTitle !== "LinkedIn"
//                       ) && <option value="LinkedIn">LinkedIn</option>}
//                       {!profileLinks.some(
//                         (l) =>
//                           l.title === "Portfolio" &&
//                           currentLinkTitle !== "Portfolio"
//                       ) && <option value="Portfolio">Portfolio</option>}
//                       {showLinkBox &&
//                         profileLinks.map((row) => (
//                           <option value={row.title}>{row.title}</option>
//                         ))}

//                       <option value="Others">Others</option>
//                     </select>
//                   )}

//                   {currentLinkTitle === "Others" && (
//                     <input
//                       type="text"
//                       placeholder="Enter platform name"
//                       onChange={(e) => setCustomTitle(e.target.value)}
//                       className="w-full  px-3 py-2 bg-gray-900 text-xs md:text-sm outline-none border border-gray-600 rounded-md focus:border-emerald-500"
//                     />
//                   )}
//                 </div>
//                 <input
//                   type="url"
//                   value={currentLinkUrl}
//                   onChange={(e) => setCurrentLinkUrl(e.target.value)}
//                   placeholder="Link URL"
//                   className="w-full  px-3 py-2 bg-gray-900 text-xs md:text-sm outline-none border border-gray-600 rounded-md focus:border-emerald-500"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     const titleToUse =
//                       currentLinkTitle === "Others"
//                         ? customTitle?.trim()
//                         : currentLinkTitle.trim();

//                     if (titleToUse && currentLinkUrl.trim()) {
//                       const newLink = {
//                         title: titleToUse,
//                         url: currentLinkUrl.trim(),
//                         id: linkId,
//                       };
//                       setLinks([...links, newLink]);
//                       setUpdateButton(true);
//                       setCurrentLinkTitle("");
//                       setCurrentLinkUrl("");
//                       setCustomTitle("");
//                       setLinkId(null);
//                     }
//                   }}
//                   className="px-4 bg-emerald-500/20 w-fit py-2   text-black text-emerald-400  text-xs rounded-md hover:bg-emerald-600/20"
//                 >
//                   Add
//                 </button>
//               </div>}

//               {links.length > 0 && (
//                 <div className="mt-3 space-y-2">
//                   {links.map((link, index) => (
//                     <div
//                       key={`${link.title}-${index}`}
//                       className="flex justify-between items-center bg-gray-900/90 shadow-xl p-3 rounded-md"
//                     >
//                       <div className="text-sm md:flex md:items-center w-full break-all">
//                         <span className=" text-white">
//                           {link.title}
//                         </span>
//                         <br />
//                         <a
//                           href={link.url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-400 md:ml-2 hover:underline break-all"
//                         >
//                           {link.url}
//                         </a>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setLinks((prevLinks) =>
//                             prevLinks.filter((_, i) => i !== index)
//                           )
//                         }
//                         className="text-red-500 text-xs ml-2 hover:text-red-700"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             </div>

            

//             {/* Submit */}
//             <div>
//               <button
//                 type="submit"
//                 disabled={loading || !updateButton}
//                 className="md:px-5 px-3 py-2 md:py-2 bg-emerald-600/20 hover:bg-emerald-500/20
//                          rounded-md text-xs md:text-sm   text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
//               >
//                 {loading ? "Updating..." : "Update My Profile"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Confirm Delete Modal */}
//       {showConfirm && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
//           <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 max-w-sm animate-fadeIn">
//             <div className="flex items-center mb-4">
//               <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
//                 <svg
//                   className="w-5 h-5 text-red-600"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
//                   />
//                 </svg>
//               </div>
//               <h2 className="ml-3 text-lg font-semibold text-gray-800">
//                 Confirm Deletion
//               </h2>
//             </div>
//             <p className="text-sm text-gray-600 mb-2">
//               Are you sure you want to delete your account? <br /> <br />
//               All of your data will be permanently deleted and cannot be
//               recovered.
//             </p>

//             <form className="mb-6">
//               <label className="block text-gray-700 font-semibold mb-2 text-sm">
//                 Enter Your Password
//               </label>

//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none 
//                focus:ring-0 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 
//                placeholder-gray-400 text-gray-900"
//               />
//             </form>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowConfirm(false)}
//                 className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={deleteAuthor}
//                 disabled={loading}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
//               >
//                 {loading ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}


//       <div className="absolute bottom-0 w-full">
//         {" "}
//         <Footer />
//       </div>
//     </div>
<>


<div className=" bg-gray-900 text-white">
      <NavBar />

      {!loader?<div className="w-full min-h-screen mx-auto px-4 md:px-6 py-8 pb-24">

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500 mb-1">
              Account
            </p>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-white">
              My Profile
            </h1>
            
          
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors"
            title="Delete Account"
          >
            <RiDeleteBin6Line size={14} />
            <span className="hidden md:inline">Delete Account</span>
          </button>
        </div>

        {/* ── Two-column layout ─────────────────────────────────── */}
        <div className="grid md:grid-cols-[300px_1fr] gap-4 items-start">

          {/* ══ LEFT — Profile card ══════════════════════════════ */}
          <div className="md:sticky top-6 self-start bg-gray-800/40 border border-white/[0.06] rounded-2xl p-6 text-center">

            {/* Avatar */}
            <div className="relative w-fit mx-auto mb-5">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-emerald-500/60"
                />
              ) : author.profile ? (
                <img
                  src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${author.profile}`}
                  alt="Profile"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-emerald-500/60"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-gray-800 border-2 border-white/10">
                  <HiOutlineUserCircle className="text-gray-600 text-7xl md:text-8xl" />
                </div>
              )}
              <label
                htmlFor="image"
                className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 border border-white/10 text-emerald-400 rounded-full cursor-pointer transition-colors"
                title="Change photo"
              >
                <MdEdit className="text-sm" />
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <h2 className="text-base font-medium text-white mb-1">
              {userName || "—"}
            </h2>

            {/* Role pill */}
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5">
              {role}
            </span>

            {/* Stats row */}
            {author.role !== "student" &&
              (followers?.length > 0 || following?.length > 0 || posts.length > 0) && (
                <div className="flex justify-center gap-px mb-6 rounded-xl overflow-hidden border border-white/[0.06]">
                  {author.role !== "student" && followers?.length > 0 && (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-white">{followers?.length ?? 0}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Followers</p>
                    </div>
                  )}

                  {author.role !== "student" && posts.length > 0 ? (
                    <Link to="/yourposts" className="flex-1">
                      <div className="py-3 bg-white/[0.02] hover:bg-emerald-500/5 transition-colors h-full">
                        <p className="text-base font-medium text-emerald-400">{posts.length}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Posts</p>
                      </div>
                    </Link>
                  ) : author.role !== "student" ? (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-gray-600">0</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Posts</p>
                    </div>
                  ) : null}

                  {following?.length > 0 && (
                    <div className="flex-1 py-3 bg-white/[0.02]">
                      <p className="text-base font-medium text-white">{following?.length ?? 0}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Following</p>
                    </div>
                  )}
                </div>
              )}

            {/* Communities */}
            {author.community?.length > 0 && (
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500 mb-3">
                  Communities
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {author.community.map((com, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-[10px] font-medium bg-white/[0.03] text-gray-400 border border-white/[0.06] rounded-full"
                    >
                      {com}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT — Form ═════════════════════════════════════ */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800/40 border border-white/[0.06] rounded-2xl  p-6 md:p-8 md:pb-6 "
          >
            <div className="grid md:grid-cols-2 gap-6">

              {/* ── Left form column ────────────────────────────── */}
              <div className="space-y-5">

                {/* Display Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="authorName"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      setUpdateButton(true);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
                    placeholder="Your name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="authorEmail"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="authorEmail"
                    value={authorEmail}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                {/* <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="role"
                    className="text-[11px] font-medium tracking-widest uppercase text-gray-500"
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={role}
                    readOnly
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/30 border border-white/[0.04] rounded-lg text-gray-500 outline-none cursor-not-allowed"
                  />
                </div> */}

                {/* Add Link form — desktop only */}
                <div
                  className={`${
                    profileLinks.length >= 5 && !showLinkBox ? "hidden" : ""
                  } hidden md:block`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500">
                      {showLinkBox
                        ? "Edit Link"
                        : 5 - profileLinks.length > 0
                        ? `${5 - profileLinks.length} slot${
                            5 - profileLinks.length > 1 ? "s" : ""
                          } remaining`
                        : "Add Link"}
                    </p>
                    {currentLinkTitle.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentLinkTitle("");
                          setCurrentLinkUrl("");
                          setShowLinkBox(false);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {(profileLinks?.length + links?.length < 5 || showLinkBox) && (
                    <div className="flex flex-col gap-2.5">
                      {currentLinkTitle !== "Others" ? (
                        <select
                          value={currentLinkTitle}
                          onChange={(e) => setCurrentLinkTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 cursor-pointer"
                        >
                          <option value="" disabled>Select platform</option>
                          {!profileLinks.some(
                            (l) => l.title === "GitHub" && currentLinkTitle !== "GitHub"
                          ) && <option value="GitHub">GitHub</option>}
                          {!profileLinks.some(
                            (l) => l.title === "LinkedIn" && currentLinkTitle !== "LinkedIn"
                          ) && <option value="LinkedIn">LinkedIn</option>}
                          {!profileLinks.some(
                            (l) => l.title === "Portfolio" && currentLinkTitle !== "Portfolio"
                          ) && <option value="Portfolio">Portfolio</option>}
                          {showLinkBox &&
                            profileLinks.map((row) => (
                              <option key={row.title} value={row.title}>{row.title}</option>
                            ))}
                          <option value="Others">Others</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Platform name"
                          onChange={(e) => setCustomTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
                        />
                      )}

                      <input
                        type="url"
                        value={currentLinkUrl}
                        onChange={(e) => setCurrentLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
                      />

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
                              id: linkId,
                            };
                            setLinks([...links, newLink]);
                            setUpdateButton(true);
                            setCurrentLinkTitle("");
                            setCurrentLinkUrl("");
                            setCustomTitle("");
                            setLinkId(null);
                          }
                        }}
                        className="self-start px-4 py-2 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      >
                        {showLinkBox ? "Update Link" : "Add Link"}
                      </button>
                    </div>
                  )}

                  {/* Pending (unsaved) links */}
                  {links.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {links.map((link, index) => (
                        <div
                          key={`${link.title}-${index}`}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {link.title === "LinkedIn" ? (
                              <FaLinkedin className="text-base  flex-shrink-0" />
                            ) : link.title === "GitHub" ? (
                              <FaSquareGithub className="text-base  flex-shrink-0" />
                            ) : link.title === "Portfolio" ? (
                              <BsPersonSquare className="text-base  flex-shrink-0" />
                            ) : (
                              <PiLinkSimpleFill className="text-base  flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-300">{link.title}</p>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 hover:underline truncate block max-w-[180px]"
                              >
                                {link.url}
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setLinks((prevLinks) =>
                                prevLinks.filter((_, i) => i !== index)
                              )
                            }
                            className="text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <IoIosRemoveCircleOutline className="text-base" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right form column ─────────────────────────────── */}
              <div className="space-y-5">

                {/* Bio Links */}
                <div>
                  <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500 mb-3">
                    Bio Links
                  </p>

                  {profileLinks?.length > 0 ? (
                    <div className="space-y-2">
                      {profileLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 px-3.5 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                              {link.title === "LinkedIn" ? (
                                <FaLinkedin className="text-base " />
                              ) : link.title === "GitHub" ? (
                                <FaSquareGithub className="text-base " />
                              ) : link.title === "Portfolio" ? (
                                <BsPersonSquare className="text-base " />
                              ) : (
                                <PiLinkSimpleFill className="text-base " />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-200">{link.title}</p>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors truncate block max-w-[180px]"
                              >
                                {userName}/{link.title}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentLinkTitle(link.title);
                                setCurrentLinkUrl(link.url);
                                setLinkId(link._id);
                                setLinks((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                                setShowLinkBox(true);
                                setUpdateButton(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                              title="Edit"
                            >
                              <MdEdit className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeLinks(authorEmail, link._id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                              title="Remove"
                            >
                              <IoIosRemoveCircleOutline className="text-xs" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 bg-white/[0.015] border border-dashed border-white/[0.08] rounded-xl text-center">
                      <PiLinkSimpleFill className="text-2xl text-gray-700 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Add your LinkedIn, GitHub, portfolio or other profile links.
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Link form — mobile only */}
                <div
                  className={`${
                    profileLinks.length >= 5 && !showLinkBox ? "hidden" : ""
                  } md:hidden block`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-medium tracking-widest uppercase text-gray-500">
                      {showLinkBox
                        ? "Edit Link"
                        : 5 - profileLinks.length > 0
                        ? `${5 - profileLinks.length} slot${
                            5 - profileLinks.length > 1 ? "s" : ""
                          } remaining`
                        : "Add Link"}
                    </p>
                    {currentLinkTitle.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentLinkTitle("");
                          setCurrentLinkUrl("");
                          setShowLinkBox(false);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {(profileLinks?.length + links?.length < 5 || showLinkBox) && (
                    <div className="flex flex-col gap-2.5">
                      {currentLinkTitle !== "Others" ? (
                        <select
                          value={currentLinkTitle}
                          onChange={(e) => setCurrentLinkTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 cursor-pointer"
                        >
                          <option value="" disabled>Select platform</option>
                          {!profileLinks.some(
                            (l) => l.title === "GitHub" && currentLinkTitle !== "GitHub"
                          ) && <option value="GitHub">GitHub</option>}
                          {!profileLinks.some(
                            (l) => l.title === "LinkedIn" && currentLinkTitle !== "LinkedIn"
                          ) && <option value="LinkedIn">LinkedIn</option>}
                          {!profileLinks.some(
                            (l) => l.title === "Portfolio" && currentLinkTitle !== "Portfolio"
                          ) && <option value="Portfolio">Portfolio</option>}
                          {showLinkBox &&
                            profileLinks.map((row) => (
                              <option key={row.title} value={row.title}>{row.title}</option>
                            ))}
                          <option value="Others">Others</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Platform name"
                          onChange={(e) => setCustomTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
                        />
                      )}

                      <input
                        type="url"
                        value={currentLinkUrl}
                        onChange={(e) => setCurrentLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
                      />

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
                              id: linkId,
                            };
                            setLinks([...links, newLink]);
                            setUpdateButton(true);
                            setCurrentLinkTitle("");
                            setCurrentLinkUrl("");
                            setCustomTitle("");
                            setLinkId(null);
                          }
                        }}
                        className="self-start px-4 py-2 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      >
                        {showLinkBox ? "Update Link" : "Add Link"}
                      </button>
                    </div>
                  )}

                  {/* Pending (unsaved) links — mobile */}
                  {links.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {links.map((link, index) => (
                        <div
                          key={`${link.title}-${index}`}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {link.title === "LinkedIn" ? (
                              <FaLinkedin className="text-base  flex-shrink-0" />
                            ) : link.title === "GitHub" ? (
                              <FaSquareGithub className="text-base  flex-shrink-0" />
                            ) : link.title === "Portfolio" ? (
                              <BsPersonSquare className="text-base  flex-shrink-0" />
                            ) : (
                              <PiLinkSimpleFill className="text-base  flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-300">{link.title}</p>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 hover:underline truncate block max-w-[180px]"
                              >
                                {link.url}
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setLinks((prevLinks) =>
                                prevLinks.filter((_, i) => i !== index)
                              )
                            }
                            className="text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <IoIosRemoveCircleOutline className="text-base" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* ── Submit row ──────────────────────────────────────── */}
            <div className="mt-7 md:mt-4 ">
              <button 
                type="submit"
                disabled={loading || !updateButton}
                className="px-5 py-2.5 text-xs md:text-sm rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:bg-gray-700/50 disabled:border-none disabled:text-gray-400 disabled:cursor-not-allowed"
                // className="md:px-5 px-3 py-2 md:py-2 bg-emerald-600/20 hover:bg-emerald-500/20
                //      rounded-md text-xs md:text-sm   text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Updating…" : "Update My Profile"}
              </button>
            </div>
          </form>

        </div>
      </div>:
       <ProfilePageSkeleton/>}

      {/* ── Delete confirm modal ──────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-gray-900 border border-white/[0.08] rounded-2xl shadow-2xl p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <RiDeleteBin6Line className="text-red-400 text-base" />
              </div>
              <h2 className="text-base font-medium text-white">Delete Account</h2>
            </div>

            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              This action is permanent. All your data and profile
              information will be erased and cannot be recovered.
            </p>

            <div className="mb-5">
              <label className="block text-[11px] font-medium tracking-widest uppercase text-gray-500 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-800/60 border border-white/[0.07] rounded-lg text-gray-200 outline-none focus:border-emerald-500/50 focus:bg-gray-800 transition-colors duration-200 placeholder:text-gray-600"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/[0.04] text-gray-300 border border-white/[0.07] hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAuthor}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <Footer />
      </div>
    </div>
     
   

    </>
  );
}

export default ProfilePage;
