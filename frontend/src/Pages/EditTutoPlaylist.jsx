import React, { useState, useEffect, useRef, useMemo } from "react";
import user from "../images/user.png";
import NavBar from "../ui/NavBar";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../instances/Axiosinstances";
import Footer from "../ui/Footer";
import useGetAuthorPosts from "../hooks/useGetAuthorPost";
import useFetchCoordinators from "../hooks/useFetchCoordinators";
import getTimeAgo from "../components/DateCovertion";
import { IoEye, IoShareSocial } from "react-icons/io5";
import blog1 from "../images/img_not_found.png";
function EditTutorPlaylist() {
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const navigator = useNavigate();
  const [domain, setDomain] = useState("");
  const { posts, getAuthorPosts } = useGetAuthorPosts(email);
  const { coordinators, fetchCoordinators } = useFetchCoordinators(role);
  const [title, setTitle] = useState("");
  const [postIds, setPostIds] = useState([]);
  // const [filteredCoordinators, setFilteredCoordinators] = useState([])
  const [searchCollaborator, setSearchCollaborator] = useState("");
  const [collaboratorsData, setCollaboratorsData] = useState([]);
  // const [collaboratorsEmail, setCollaboratorsEmail] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const thumbnailInputRef = useRef(null);
  const [loader,setLoader]= useState(false);
  // const [playlistData, setPlaylistData] = useState({});
 const { id } = useParams();

  
  const getTutorPlaylist = async () => {
    try {
      const response = await axiosInstance.get(`/blog/playlist/${id}`);
      if (response.status === 200) {
        // setPlaylistData(response.data.data);
        setPostIds(response.data.data.post_ids);
        setDomain(response.data.data.domain);
        setTitle(response.data.data.title);
        setThumbnail(response.data.data.thumbnail);
        setCollaboratorsData(response.data.data.collaborators);
        if (response.data.data.thumbnail) {
          setPreviewThumbnail(
            `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${response.data.data.thumbnail}`
          );
        }
        // setPlaylistPosts(response.data.posts);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getTutorPlaylist();
  }, [id]);




  const hanldeSubmit = async (e) => {
    e.preventDefault();
    if (postIds.length <= 1) {
      alert("Please select at least two posts to create the playlist.");
      return;
    }
    setLoader(true);
    const collaboratorsEmail = collaboratorsData.map((data) => {
      return data.email;
    });
    // console.log("emails", collaboratorsEmail)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("domain", domain);
    postIds.forEach((id) => formData.append("postIds", id));
    formData.append("thumbnail", thumbnail);
    formData.append("email",email)
    collaboratorsEmail.forEach((email) =>
      formData.append("collaboratorsEmail", email)
    );

    try {
      const response = await axiosInstance.put(`/blog/playlist/update/${id}`, formData);

      if (response.status === 200) {
        setTitle("");
        setDomain("");
        setCollaboratorsData([]);
        setPostIds([]);
        setThumbnail(null);
        setPreviewThumbnail(null);
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = null;
        }
        navigator(-1)
      }
    } catch (err) {
      console.log("error", err.message);
    }
    finally{
      setLoader(false);
    }
  };

  const handleChnageThumbnail = (e) => {
    if (e.target.files && e.target.files[0]) {
      // console.log("thumbnail", e.target.files[0]);
      setThumbnail(e.target.files[0]);
      const file = e.target.files[0];
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    // optional manual refresh:
    // getAuthorPosts();
  }, [getAuthorPosts]);

  useEffect(() => {
    // optional manual refresh:
    // getAuthorPosts();
  }, [fetchCoordinators]);

  // Get unique categories
  const getUniqueCategories = (posts) => {
    return [...new Set(posts.map((post) => post.category))];
  };

  const categories = getUniqueCategories(posts);

  const getPostByCategory = (posts, categoryName) => {
    return posts.filter((post) => post.category === categoryName);
  };

  const filteredPosts = getPostByCategory(posts, domain);
  // const filteredCoordinators =coordinators.filter((coord) => coord?.community && domain in coord.community)

  const filteredCoordinators = useMemo(() => {
    if (!domain) return [];

    return coordinators.filter(
      (coord) =>
        Array.isArray(coord?.community) && coord.community.includes(domain) && coord.email !== email
    );
  }, [coordinators, domain]);

  useEffect(() => {
    if (!domain) return;

    getPostByCategory(posts, domain);
  }, [domain, posts]);

  const searchedCoordinators = useMemo(() => {
    if (!searchCollaborator) return filteredCoordinators;

    const query = searchCollaborator.toLowerCase();
    return filteredCoordinators.filter((coord) => {
      const authorMatch = coord.authorname?.toLowerCase().includes(query);

      const emailMatch = coord.email?.toLowerCase().includes(query);

      const alreadySelected = collaboratorsData.some(
        (col) => col.email?.toLowerCase() === coord.email?.toLowerCase()
      );

      return (authorMatch || emailMatch) && !alreadySelected;
    });
  }, [filteredCoordinators, searchCollaborator]);

 

  const handleCollaborators = (email, name, img) => {
    setCollaboratorsData((prev) => {
      const exists = prev.some((col) => col.email === email);

      if (exists) {
        return prev.filter((col) => col.email !== email);
      } else {
        return [...prev, { email, name, img }];
      }
    });

    setSearchCollaborator("");
  };

  const handlePostIds = (postId) => {
    setPostIds((prev) => {
      const exists = prev.some((pid) => pid === postId);
      if (exists) {
        return prev.filter((pid) => pid !== postId);
      } else {
        return [...prev, postId];
      }
    });
  };

  console.log("filteredPosts",filteredPosts)


  return (

//    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 relative">
//   <NavBar />

//   <form
//     onSubmit={hanldeSubmit}
//     className="max-w-7xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-2"
//   >
//     {/* LEFT COLUMN */}
//     <div className="space-y-6">

//       {/* Playlist Title */}
//       <div className="flex flex-col gap-2">
//         <label className="text-sm font-medium text-gray-300">
//           Playlist Title
//         </label>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Enter playlist title"
//           className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
//         />
//       </div>

//       {/* Domain */}
//       <div className="flex flex-col gap-2">
//         <label className="text-sm font-medium text-gray-300">
//           Select Domain
//         </label>
//         <select
//           value={domain}
//           onChange={(e) => {
//             setPostIds([]);
//             setDomain(e.target.value);
//             setCollaboratorsData([]); 
//           }}
//           className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
//         >
//           <option value="" className="text-gray-200">
//             Choose Domain
//           </option>
//           {categories.map((category, index) => (
//             <option key={index} value={category} className="text-gray-200">
//               {category}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Thumbnail Upload */}
//       <div className="flex flex-col gap-2">
//         <label className="text-sm font-medium text-gray-300">
//           Playlist Thumbnail
//         </label>

//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleChnageThumbnail}
//           ref={thumbnailInputRef}
//           className="block w-fit text-sm text-gray-300
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-lg file:border-0
//             file:text-sm file:font-semibold
//             file:bg-emerald-600 file:text-white
//             hover:file:bg-emerald-500"
//         />

//         {previewThumbnail && (
//           <div className="mt-4 space-y-2">
//             <p
//               onClick={() => {
//                 setPreviewThumbnail(null);
//                 setThumbnail(null);
//                 if (thumbnailInputRef.current) {
//                   thumbnailInputRef.current.value = null;
//                 }
//               }}
//               className="text-sm text-red-400 cursor-pointer hover:underline"
//             >
//               Clear thumbnail
//             </p>
//             <img
//               src={previewThumbnail}
//               alt="Preview"
//               className="w-60 rounded-xl object-cover border border-gray-700"
//             />
//           </div>
//         )}
//       </div>

//       {/* Collaborators */}
//       <div className="relative flex flex-col gap-2">
//         <label className="text-sm font-medium text-gray-300">
//           Hook Collaborators
//         </label>

//         <input
//           type="text"
//           placeholder="Search collaborators"
//           value={searchCollaborator}
//           onChange={(e) => setSearchCollaborator(e.target.value)}
//           className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
//         />

//         {/* Selected Collaborators */}
//         {collaboratorsData.length > 0 && (
//           <div className="flex flex-wrap gap-2 mt-2">
//             {collaboratorsData.map((data, index) => (
//               <div
//                 key={index}
//                 onClick={() =>
//                   handleCollaborators(
//                     data.email,
//                     data.authorname,
//                     data.profile
//                   )
//                 }
//                 className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-700 transition"
//               >
//                 <img
//                   src={
//                     data.img
//                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.img}`
//                       : user
//                   }
//                   className="w-6 h-6 bg-white rounded-full object-cover border border-emerald-400"
//                   alt=""
//                 />
//                 <span className="text-xs text-gray-200">
//                   {data.name}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Search Results */}
//         {searchCollaborator && searchedCoordinators.length > 0 && (
//           <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20">
//             {searchedCoordinators.map((collaborator, index) => (
//               <div
//                 key={index}
//                 onClick={() =>
//                   handleCollaborators(
//                     collaborator.email,
//                     collaborator.authorname,
//                     collaborator.profile
//                   )
//                 }
//                 className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 cursor-pointer"
//               >
//                 <img
//                   src={
//                     collaborator.profile
//                       ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collaborator.profile}`
//                       : user
//                   }
//                   className="w-6 h-6 rounded-full bg-white object-cover border border-emerald-400"
//                   alt=""
//                 />
//                 <span className="text-sm text-gray-200">
//                   {collaborator.authorname}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>

//     {/* RIGHT COLUMN — POSTS */}
//    { filteredPosts.length>0 &&
//     <div className="flex flex-col gap-4">
//       <h2 className="text-lg font-semibold text-white">
//         Select Posts for Playlist
//       </h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {filteredPosts.map((data, index) => (
//           <div
//             key={index}
//             onClick={() => handlePostIds(data._id)}
//             className={`rounded-xl border cursor-pointer transition-all duration-300 p-4
//               ${
//                 postIds.includes(data._id)
//                   ? "border-emerald-500 bg-emerald-500/10"
//                   : "border-gray-700 bg-gray-900 hover:bg-gray-800"
//               }`}
//           >
//             {/* Author */}
//             <div className="flex items-center gap-2 mb-3">
          
//               <div>
//                 <p className="text-sm font-medium text-white">
//                   {data.title}
//                 </p>
//                 <p className="text-xs text-gray-400">
//                   {getTimeAgo(data.timestamp)}
//                 </p>
//               </div>
//             </div>

//             {/* Post Image */}
//             <img
//               src={
//                 data.image
//                   ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
//                   : blog1
//               }
//               className="w-full h-36 rounded-lg object-cover mb-3"
//               alt=""
//             />

//             {/* Footer */}
//             <div className="flex justify-between items-center">
              
//               <div className="text-xs flex items-center gap-2 text-gray-400">
//                    <img
//                 src={
//                   data.profile
//                     ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
//                     : user
//                 }
//                 className="w-8 h-8 rounded-full object-cover border border-gray-600"
//                 alt=""
//               />
//                 {data.views.length} views
//               </div>
//               <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
//                 {data.category}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//     }

//     {/* SUBMIT */}
//     <div className="md:col-span-4 flex justify-end mt-4">
//       <button
//         type="submit"
//         disabled={loader}
//         className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 transition"
//       >
//         {loader ? "Updating Playlist..." : "Update Playlist"}
//       </button>
//     </div>
//   </form>
// </div>

<div className="w-full min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative">
  <NavBar />

  <form
    onSubmit={hanldeSubmit}
    className="md:w-11/12 w-full mx-auto px-4 py-10 md:grid gap-10 lg:grid-cols-3"
  >
    {/* LEFT — PLAYLIST DETAILS */}
    <div className="lg:col-span-1 bg-gray-900/70  backdrop-blur-xl border border-gray-800 rounded-2xl space-y-8">
      <div className="p-4 md:p-6 space-y-8 shadow-lg">

        <h2 className="text-xl font-semibold text-white">
          Playlist Details
        </h2>

        {/* Playlist Title */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-medium">
            Playlist Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter playlist title"
            className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {/* Domain */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-medium">
            Select Domain <span className="text-red-500">*</span>
          </label>
          <select
            value={domain}
            onChange={(e) => {
              setPostIds([]);
              setCollaboratorsData([]);
              setDomain(e.target.value);
            }}
            className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="">Choose Domain</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Thumbnail */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-medium">
            Playlist Thumbnail <span className="text-red-500">*</span>
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleChnageThumbnail}
            ref={thumbnailInputRef}
            className="block w-fit text-sm text-gray-300
              file:mr-4 file:px-4 file:py-2
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-emerald-600 file:text-white
              hover:file:bg-emerald-500"
          />

          {previewThumbnail && (
            <div className="pt-3 space-y-2">
              <p
                onClick={() => {
                  setPreviewThumbnail(null);
                  setThumbnail(null);
                  if (thumbnailInputRef.current) {
                    thumbnailInputRef.current.value = null;
                  }
                }}
                className="text-xs text-red-400 cursor-pointer hover:underline"
              >
                Remove thumbnail
              </p>
              <img
                src={previewThumbnail}
                alt="Preview"
                className="w-40 max-w-xs object-contain rounded-xl border border-gray-700"
              />
            </div>
          )}
        </div>

        {/* Collaborators */}
        <div className="relative flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-medium">
            Hook Collaborators
          </label>

          <input
            type="text"
            placeholder="Search collaborators"
            value={searchCollaborator}
            onChange={(e) => setSearchCollaborator(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />

          {/* Selected */}
          {collaboratorsData.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {collaboratorsData.map((data, index) => (
                <div
                  key={index}
                  onClick={() =>
                    handleCollaborators(
                      data.email,
                      data.authorname,
                      data.profile
                    )
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 cursor-pointer hover:bg-gray-700 transition"
                >
                  <img
                    src={
                      data.img
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.img}`
                        : user
                    }
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400 bg-white"
                    alt=""
                  />
                  <span className="text-xs text-gray-200">
                    {data.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchCollaborator && searchedCoordinators.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
              {searchedCoordinators.map((collaborator, index) => (
                <div
                  key={index}
                  onClick={() =>
                    handleCollaborators(
                      collaborator.email,
                      collaborator.authorname,
                      collaborator.profile
                    )
                  }
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 cursor-pointer"
                >
                  <img
                    src={
                      collaborator.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${collaborator.profile}`
                        : user
                    }
                    className="w-6 h-6 rounded-full bg-white object-cover border border-emerald-400"
                    alt=""
                  />
                  <span className="text-sm text-gray-200">
                    {collaborator.authorname}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

         <div className="lg:col-span-3 hidden md:block flex justify-start pt-6">
      <button
        type="submit"
        disabled={loader}
        className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 transition shadow-lg"
      >
        {loader ? "Updating Playlist..." : "Update Playlist"}
      </button>
    </div>
      </div>
    </div>

    {/* RIGHT — POSTS */}
    {filteredPosts.length > 0 ? (
      <div className="lg:col-span-2 space-y-6 h-fit">
        <h2 className="text-xl text-center mt-7 md:mt-0 md:text-left font-semibold text-white">
          Select Posts for Playlist
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 h-fit md:overflow-y-auto gap-3 md:gap-5">
          {filteredPosts.map((data, index) => (
            <div
              key={index}
              onClick={() => handlePostIds(data._id)}
              className={`rounded-2xl border p-4 cursor-pointer transition-all duration-300
                ${
                  postIds.includes(data._id)
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                }`}
            >
           <div className="flex items-center gap-2 mb-3">
            
              <div>
                <p className="md:text-sm text-xs font-medium text-white">
                  {data.title}
                </p>
                <p className="text-xs text-gray-400">
                  {getTimeAgo(data.timestamp)}
                </p>
              </div>
            </div>

              {/* Image */}
              <img
                src={
                  data.image
                    ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                    : blog1
                }
                className="w-full h-20 md:h-36 rounded-xl object-cover mb-3"
                alt=""
              />

              {/* Meta */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  {data.views.length} views
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                  {data.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  :
   <div className="flex items-center md:mt-20 w-11/12 mx-auto text-center  justify-center md:w-full col-span-2 text-white  ">
    Selecet domain to see posts available for playlist creation.
    </div>}

    {/* SUBMIT */}
   { 
   filteredPosts.length > 0 &&
    <div className="lg:col-span-3 mt-7 md:hidden flex justify-start ">
      <button
        type="submit"
        disabled={loader}
        className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 transition shadow-lg"
      >
        {loader ? "Updating Playlist..." : "Update Playlist"}
      </button>
    </div>}
   
  </form>
</div>

  );
}

export default EditTutorPlaylist;
