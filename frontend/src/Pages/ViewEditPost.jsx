import React, { useState, useEffect, useRef } from "react";
import blog1 from "../images/img_not_found.png";
import { useParams } from "react-router-dom";
import NavBar from "../ui/NavBar";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Footer from "../ui/Footer";
import { MdEdit } from "react-icons/md";
import axiosInstance from "../instances/Axiosinstances";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import user from "../images/user.png";
import toast from "../components/toaster/Toast"
import { getItem } from "../utils/encode";
import RenderTextWithHashtags from "../components/RenderTextWithHashtags";
import {motion} from "framer-motion"
import { VscGitStashApply } from "react-icons/vsc";
import EditPostSkeleton from "../components/loaders/EditPostSkeleton";
function ViewEditPost() {
  // const username = localStorage.getItem("username");
  // const email = localStorage.getItem("email");
  const email = getItem("email");
  const [singlePostData, setSinglePostData] = useState([]);
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [image, setImage] = useState(null);
  const [timeStamp, setTimeStamp] = useState("");
  const [links, setLinks] = useState([]);
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [linkId, setLinkId] = useState(null);
  const [customTitle, setCustomTitle] = useState("");
  // const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [oldCategory, setOldCategory] = useState("")
   const fileInputRef = useRef(null);
  const [postLinks, setPostLinks] = useState([]);
  const [preview, setPreview] = useState(false);
  const [postLoader, setPostLoader] = useState(false)

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

  const { PostId } = useParams(); //Accessing Post Id of selected post
  // console.log("PostId", PostId);

  const onImageChange = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Format Error","Please select a valid image file.");
      setPreviewImage(null);
      setImage(null);
      return;
    }

    setPreviewImage(URL.createObjectURL(file)); // Show preview
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", title);

    formData.append("description", description);
    const finalCategory = category === "Others" ? customCategory : category;

    formData.append("category", finalCategory);

    formData.append("links", JSON.stringify(links));

    if (image) {
      formData.append("image", image);
    }

    // Handle document uploads if needed
    if (documents && documents.length > 0) {
      documents.forEach((doc) => {
        formData.append("document", doc);
      });
    }

    setLoading(true);
    const postId = PostId;

    try {
      const response = await axiosInstance.put(
        `/blog/posts/${email}/${postId}`,
        // `http://localhost:3000/blog/posts/${email}/${PostId}`,
        formData,
      );

      if (response.status === 200) {
        // toast.success("Post edited successfully");
        // setTitle("");
        // setDescription("");
        // setCategory("");
        // setImage(null);
        // setDocuments([]);
        // setLinkId(null);
        // navigate("/yourposts");
        // console.log("updated!!")
      }
      setTitle("");
        setDescription("");
        setCategory("");
        setImage(null);
        setDocuments([]);
        setLinkId(null);
        navigate("/yourposts");
    } catch (error) {
       navigate("/yourposts");
      console.log("Error editing post:", error.message);
      setError({ apiError: error.ValidatorError || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  // Add a new file input for documents
  const onDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
    // const files = Array.from(e.target.files);
    setSelectedDocs(files.map((file) => file.name)); // store names
  };

  const getSinglrPost = async () => {
    setPostLoader(true)
    try {
      const response = await axiosInstance.get(
        `/blog/posts/${email}/${PostId}`,
      );
      const postData = response.data.data;
      setSinglePostData(postData);
      setTitle(postData.title);
      setCategory(postData.category);
      setOldCategory(postData.category);
      setPostLinks(postData.links || []);
      setDescription(postData.description || "");
      setImage(postData.image || "");
      setTimeStamp(postData.timestamp);
    } catch (err) {
      console.log(err);
    }
    finally{
      setPostLoader(false)
    }
  };
  useEffect(() => {
    getSinglrPost();
  }, []);


  const removeLinks = async (linkId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this link ?",
      );
      if (!confirm) {
        // setLoading(false);
        return; // If user cancels, exit the function
      }
      const response = await axiosInstance.delete(
        `/blog/posts/links/${email}/${PostId}`,
        { data: { linkId } },
      );
      if (response.status === 200) {
        toast.success('Deleted', 'Resource link removed successfully')
        setLinkId(null);
        // Refresh post data to reflect changes
        getSinglrPost();
      }
    } catch (err) {
      toast.error('Error', 'Error removing resource link')
      console.log("error", err);
    }
  };

  const removeDoc = async(documentKey) =>{
    console.log("postid", PostId);
    console.log("document", documentKey)
    try{
      const confirm = window.confirm(
        "Are you sure you want to delete this document ?");
      
        if(!confirm){
          return;
        }
      

        const response = await axiosInstance.delete(`/blog/posts/document/${email}/${PostId}`,
          {
            data:{documentKey}
          },
        );

        if (response.status===200){
          toast.success('Deleted', 'Document removed successfully')
          setSinglePostData(prev => ({
              ...prev,
              documents: response.data.documents,
            }));
          }
    }

    catch(err)
    {
      toast.error('Error', 'Error removing the document');
      console.log("error", err.message);
    }
  }


  // console.log("singlePostData", singlePostData)
  return (

    <div className="relative w-full theme min-h-screen">
      <NavBar />
      <div className="md:mb-8 mb-6 mt-4 px-4 md:px-12 flex items-center justify-between">
        <div>
          <h1 className="md:text-3xl text-xl font-semibold   text-white tracking-tight">
            Update Post
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            You have complete control over your content, can update your post
            here.
          </p>
        </div>
      </div>

      {!postLoader?<div className="w-full mx-auto px-3 md:px-12 ">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:gap-6 text-white"
        >
          {error.apiError && (
            <p className="text-red-500 text-sm">{error.apiError}</p>
          )}

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            {/* LEFT SIDEBAR */}
            {/* Thumbnail */}
            <div className="shadow-xl border hidden md:block border-gray-800 rounded-lg bg-theme/70 rounded-xl  p-4  lg:sticky top-7 self-start ">
              <label className="text-sm text-gray-300 font-medium">
                Thumbnail <span className="text-red-500">*</span>
              </label>

              <div className="relative mt-2 group rounded-lg overflow-hidden border border-neutral-700">
                <img
              
                  src={previewImage || (singlePostData.image ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}` : blog1)}
                  
                  className="w-full h-48 md:h-[30vh] object-cover"
                />

                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-500">
                  <MdEdit className="text-emerald-400 bg-emerald-600/30 rounded-full p-2 text-4xl" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* RIGHT MAIN */}
            <div className=" bg-theme/80 shadow-xl  border  border-emerald-500/20 rounded-lg px-4 py-6  md:p-8 space-y-9 md:space-y-7">
              {/* Title */}
              <div className="  rounded-xl">
                <label className="text-sm text-gray-300 font-medium">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={title}
                  className="w-full mt-2  px-4 py-2 rounded-md theme border border-gray-700 focus:border focus:border-emerald-500/40 outline-none text-white text-sm"
                />
              </div>

              {/* Description */}
            
              <div className="scrollbar-hide">
                  {/* Label */}
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-300 font-medium tracking-wide">
                      Description <span className="text-red-500">*</span>
                    </label>

                    {/* Tabs */}
                    <div className="flex items-center theme border border-gray-700 rounded-lg p-1">
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
                  <div className="relative ">
                    {/* Top subtle glow */}
                    <div className="absolute inset-0 rounded-xl bg-emerald-500/[0.02] pointer-events-none" />

                    {preview ? (
                      <div
                        className="
                          w-full min-h-40 h-[300px]
                          
                          overflow-y-auto
                          scrollbar-hide
                          px-4 py-3
                          rounded-md
                          theme
                          border border-gray-700
                          text-white text-xs md:text-sm
                          leading-relaxed
                          emerald-scrollbar
                          overflow-auto
                          scrollbar-hide
                          break-words
                          

                       
                        "
                      >
                        {description?.trim()?.length > 0 ? (
                          // renderTextWithHashtags(description)
                          <RenderTextWithHashtags text = {description} className={"overflow-x-auto scrollbar-hide"}/>
                        ) : (
                          <span className="text-gray-500">
                            Preview content will appear here...
                          </span>
                        )}
                      </div>
                    ) : (
                      <textarea
                        rows="10"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write your post description..."
                        className="w-full mt-2  focus:border focus:border-emerald-500/40 emerald-scrollbar px-4 py-3 rounded-md theme border border-gray-700 outline-none  text-white text-xs leading-relaxed"
                      />
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between mt-2">
                   

                    <span className="md:text-[11px] text-[9px] text-gray-500">
                      {description?.length} characters
                    </span>
                  </div>

                </div>

              {/* Thumbnail */}
              <div className="rounded-xl block md:hidden ">
                    <label className="text-sm text-gray-300 font-medium">
                Thumbnail <span className="text-red-500">*</span>
              </label>

              <div className="relative mt-2 group rounded-lg overflow-hidden border border-neutral-700">
                <img
                  src={
                    previewImage
                      ? previewImage
                      : singlePostData.image
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${singlePostData.image}`
                        : blog1
                  }
                  className="w-full h-44 md:h-[30vh] object-cover"
                />

                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-500">
                  <MdEdit className="text-emerald-400 bg-emerald-600/30 rounded-full p-2 text-4xl" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              </div>

              {singlePostData.links?.length > 0 && (
                <div className="  rounded-xl">
                  <h1 className="text-sm text-gray-300 mb-2 font-medium">
                    Current Links  <span className="text-red-500">*</span> 
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {singlePostData.links.map((link, index) => (
                      <div
                        key={index}
                        className="relative group theme  rounded-lg p-3 border border-gray-700 focus:border focus:border-emerald-500/40 transition"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <span className="inline-block text-[10px] px-2 py-1 mb-2 rounded-md bg-white text-black font-medium">
                            Open
                          </span>
                          <p className="text-sm font-medium text-gray-200 truncate">
                            {link.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {link.url}
                          </p>
                        </a>

                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex gap-2 md:opacity-0 group-hover:opacity-100 transition">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              const dropDown = ['GitHub', 'LinkedIn', 'Portfolio']

                              if(dropDown.includes(link.title)){
                                setCurrentLinkTitle(link.title);
                              }
                              else{
                                setCurrentLinkTitle("Others");
                                setCustomTitle(link.title);
                              }
                              
                              setCurrentLinkUrl(link.url);
                              setLinkId(link._id);
                              setLinks((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                            }}
                            className="p-1 md:p-1.5 rounded-full  bg-neutral-700"
                          >
                            <MdEdit className="text-white text-xs md:text-sm" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => removeLinks(link._id)}
                            className="p-1 md:p-1.5 rounded-full bg-red-600 hover:bg-red-500"
                          >
                            <IoIosRemoveCircleOutline className="text-white text-xs md:text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Section */}
              <div className="  rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-300 font-medium">
                    Links (Max-10) 
                  </label>
                  {currentLinkTitle.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentLinkTitle("");
                        setCurrentLinkUrl("");
                        setLinkId(null);
                      }}
                      className="text-xs bg-red-600 px-2 py-1 rounded-md hover:bg-red-700 transition-all duration-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full">

                  <div className="flex flex-col md:flex-row gap-2">

              
                  {currentLinkTitle !== "Others" && (
                    <select
                      value={currentLinkTitle}
                      onChange={(e) => setCurrentLinkTitle(e.target.value)}
                      className="flex-1 focus:border focus:border-emerald-500/40  px-4 py-2 cursor-pointer rounded-xl theme border border-gray-700 outline-none text-sm text-white"
                    >
                      <option value="" disabled>
                        Select Link
                      </option>
                      {!postLinks.some(
                        (l) =>
                          l.title === "GitHub" && currentLinkTitle !== "GitHub",
                      ) && <option value="GitHub">GitHub</option>}
                      {!postLinks.some(
                        (l) =>
                          l.title === "YouTube" &&
                          currentLinkTitle !== "YouTube",
                      ) && <option value="YouTube">YouTube</option>}
                      {!postLinks.some(
                        (l) =>
                          l.title === "Demo" && currentLinkTitle !== "Demo",
                      ) && <option value="Demo">Demo</option>}
                      <option value="Others">Others</option>
                    </select>
                  )}

                  {currentLinkTitle === "Others" && (
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Custom title"
                      className="flex-1 focus:border focus:border-emerald-500/40 w-full px-4 py-2 rounded-md theme border border-gray-700 outline-none  outline-none text-white text-sm"
                    />
                  )}

                  <input
                    type="url"
                    value={currentLinkUrl}
                    onChange={(e) => setCurrentLinkUrl(e.target.value)}
                    placeholder="Paste URL"
                    className="flex-1 focus:border focus:border-emerald-500/40 w-full px-4 py-2 rounded-md theme border border-gray-700 outline-none  outline-none text-white text-sm"
                  />

                  </div>

                  <button
                    type="button"
                    disabled={!currentLinkUrl}
                    onClick={() => {
                        const titleToUse =
                          currentLinkTitle === "Others"
                            ? customTitle?.trim()
                            : currentLinkTitle.trim();
                        const sanitizedUrl = sanitizeUrl(
                          currentLinkUrl.trim(),
                        );
                        if (titleToUse && sanitizedUrl) {
                          const newLink = {
                            title: titleToUse,
                            url: sanitizedUrl,
                            id: linkId,
                          };
                          setLinks([...links, newLink]);
                          setCurrentLinkTitle("");
                          setCurrentLinkUrl("");
                          setCustomTitle("");
                          setLinkId(null);
                        } else if (titleToUse) {
                          toast.error(
                            "Invalid URL",
                            "Please enter a valid http(s) URL.",
                          );
                        }
                       else if(!titleToUse){
                           toast.error(
                            "Invalid URL Title",
                            "Please enter a valid URL Title.",
                          );
                        }
                  }}
                    className={`px-4 bg-emerald-500/20 w-fit py-1 md:py-2   text-black text-emerald-400  text-xs rounded-md hover:bg-emerald-600/20 transition-all duration-300
                      ${currentLinkUrl
                            ? "scale-105 animate-pulse border border-emerald-500"
                            : ""
                        } disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  >
                    Add
                  </button>
                </div>

                {links.length > 0 && (
                  <div className="space-y-2">
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


                <div>
                  <label className="text-sm text-gray-400 font-medium">
                    Source Documents
                  </label>
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

              {documents.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <p className="text-xs text-gray-400">
                        Newly Selected Document(s):
                      </p>
                  {documents.map((doc, idx) => (
                    <div
                      key={doc.name + doc.size}
                      className="flex items-center justify-between gap-3 theme px-3 py-2 rounded-lg border border-emerald-500/20 text-xs text-gray-300"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-emerald-400 font-semibold shrink-0">
                          {idx + 1}.
                        </span>

                        <span className="truncate">
                          {doc.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-gray-500">
                          {(doc.size / 1024).toFixed(1)} KB
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setDocuments((prev) =>
                              prev.filter((_, i) => i !== idx)
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

              
              {/* Current Documents with Edit Option */}
              { singlePostData.documents?.length > 0 && (
                <div className="rounded-xl space-y-2">
                  {/* <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-300 font-medium">
                      Current Documents
                    </label>
                    <label className="cursor-pointer text-emerald-400 hover:text-emerald-300 transition">
                      <MdEdit className="text-lg" />
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={onDocumentsChange}
                        className="hidden"
                      />
                    </label>
                  </div> */}

                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-300 font-medium">
                      Current Documents
                    </label>

                    {/* <label className="cursor-pointer text-emerald-400 hover:text-emerald-300 transition">
                      <MdEdit className="text-lg" />

                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);

                          // max 5 files
                          if (files.length + singlePostData.documents.length > 5) {
                            alert("You can upload a maximum of 5 files.");
                            e.target.value = "";
                            return;
                          }

                          onDocumentsChange(e);
                        }}
                        className="hidden"
                      />
                    </label> */}
                  </div>
 
                  <div className="flex flex-col gap-2">
                    {singlePostData.documents.map((doc, index) => (
                      <div
                        // key={index}
                        key={doc.name + doc.size}
                        className="flex flex-col gap-1  items-start "
                      >
                        <div className="flex items-center gap-3">

                        
                        <a
                          href={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs theme px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-emerald-400 truncate transition"
                        >
                          {doc.split("-").slice(5).join("-")}
                        </a>
                        
                          <button
                            type="button"
                            onClick={() => removeDoc(doc)}
                            className="p-1 md:p-1.5 rounded-full bg-red-600 hover:bg-red-500"
                          >
                            <IoIosRemoveCircleOutline className="text-white text-xs md:text-sm" />
                          </button>
                          </div>
                      </div>
                    ))}
                  </div>
 
              
                  {/* {selectedDocs.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs text-gray-400">
                        Newly Selected Document(s):
                      </p>

                      <div className="flex flex-col gap-1">
                        {selectedDocs.map((doc, idx) => (
                          <div
                            key={doc.name + doc.size}
                            className="flex items-center justify-between gap-3 theme px-3 py-2 rounded-lg border border-emerald-500/20 text-xs text-gray-300"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-emerald-400 font-semibold">
                                {idx + 1}.
                              </span>

                              <p className="line-clamp-1 truncate">
                                {doc}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDocs((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                );
                                 setDocuments((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                );
                              }}
                              className="text-red-400 hover:text-red-300 transition border border-red-500/20 hover:border-red-500/40 px-2 py-1 rounded-md"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              )}

              {/* Selected Category */}
              <div className=" flex items-center gap-3 rounded-xl">
                  <label className="text-sm text-gray-300 font-medium">
                  Category 
                </label>

                <span className="text-sm text-emerald-400 ">  {oldCategory}</span>

              </div>

              

              {/* Category */}
              <div className=" flex flex-col rounded-xl">
                <label className="text-sm text-gray-300 font-medium">
                  Update Category <span className="text-red-500">*</span>
                </label>

                
              
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-2 theme border border-neutral-700 rounded-lg text-sm"
                >
                  <option value="">Update Domain</option>
                  <option value="GenAI">GenAI</option>
                  <option value="Design Thinking">Design Thinking</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="IoT ">IoT</option>
                  <option value="Embedded System">Embedded System</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Satellite Space Technology">
                    Satellite Space Technology
                  </option>
                  <option value="Others">Others</option>
                </select>

                

                {category === "Others" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Custom category"
                    className="mt-2 w-full px-3 py-2 theme border border-neutral-700 rounded-lg text-sm"
                  />
                )}
              </div>

              

              {/* Submit */}
              {/* <button
                type="submit"
                disabled={loading}
                className="md:px-5 px-3 py-2 md:py-2.5 bg-emerald-600/20 hover:bg-emerald-500/20
                         rounded-md text-xs md:text-sm  text-emerald-400 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Post"}
              </button> */}

               <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {}}
                type="submit"
                disabled={loading}
                                 className="md:px-5 px-3 py-2 md:py-2.5 bg-[#111827]
                                       rounded-lg text-xs  flex items-center justify-center gap-2 border
                                border-slate-700 text-slate-200 transition-all duration-300 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    <VscGitStashApply className="md:text-base text-emerald-400 text-sm" />{" "}
            <motion.span
                  key={loading ? "Updating..." : "Update Post"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                 {loading ? "Updating..." : "Update Post"}
                </motion.span>
              </motion.button>
            </div>
          </div>
        </form>
      </div>
      :
      <EditPostSkeleton/>
      }

      <Footer />
    </div>
  );
}

export default ViewEditPost;

