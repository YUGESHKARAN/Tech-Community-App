import React, { useMemo, useState, useEffect } from "react";
import useGetPostsByCommunity from "../hooks/useGetPostsByCommunity";
import Footer from "../ui/Footer";
import BlogSkeleton from "./loaders/BlogSkeleton";
import { IoSearchOutline, IoShareSocial } from "react-icons/io5";
import { BiLike, BiSolidLike } from "react-icons/bi";
import Fuse from "fuse.js";
import { getItem } from "../utils/encode";
import PillLoader from "./loaders/PillSkeleton";
import getTimeAgo from "./DateCovertion";
import blog1 from "../images/img_not_found2.png";
import highlightText from "../hooks/highlightText";
import { useParams } from "react-router-dom";
import NavBar from "../ui/NavBar";
import { Link } from "react-router-dom";
import user from "../images/user.png";
import axiosInstance from "../instances/Axiosinstances";
import { MdGroups } from "react-icons/md";
import PostsComponent from "./PostsComponent";
import { use } from "react";

function SingleDomainPosts({category}) {
//   const { category } = useParams();

  const { posts, loading, hasMore, postCount, setPosts } = useGetPostsByCommunity(category);
  const [searchTerm, setSearchTerm] = useState("");
  const email = getItem("email")
  const [postCategory, setPostCategory] = useState("")

   const postViews = async (authorEmail, postId) => {
    try {
      await axiosInstance.put(`/blog/posts/views/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

    // share post with social media
  const sharePost = async (title, email, postId) => {
    try {
      const postData = {
        title: title,
        text: title,
        url: `${window.location.origin}/viewpage/${email}/${postId}`,
      };

      const response = await navigator.share(postData);
      console.log("response", response);
    } catch (err) {
      console.log("error sharing post", err);
    }
  };



  const postLikes = async (authorEmail, postId) => {
    // if (e) {
    //   e.preventDefault();
    //   e.stopPropagation();
    // }
    try {
      const response =  await axiosInstance.put(`/blog/posts/likes/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });

      if (response.status === 200){
         setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(email)
                  ? post.likes.filter((like) => like !== email) // Unlike the post
                  : [...post.likes, email], // Like the post
              }
            : post,
        ),
      );
      }
     
    } catch (err) {
      console.log("Error updating views:", err);
    }
  };
  
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300); // 300ms delay

  return () => clearTimeout(timer);
}, [searchTerm]);

  const fuse = useMemo(() => {
  return new Fuse(posts, {
    keys: [
      "title",
      "description",
      "category",
      "community"
    ],
    threshold: 0.3, // lower = stricter search
  });
}, [posts]);

const filteredPosts = useMemo(() => {
  let filtered =[...posts];

  // if (searchTerm.trim() !== "") {
  //   const query = searchTerm.toLowerCase();

  //   filtered = filtered.filter(
  //     (post) =>
  //       post.title?.toLowerCase().includes(query) ||
  //       post.description?.toLowerCase().includes(query) ||
  //       post.category?.toLowerCase().includes(query) ||
  //       post.authorname?.toLowerCase().includes(query)
  //   );
  // }

    if (debouncedSearch.trim() !== "") {
    filtered = fuse.search(debouncedSearch).map((r) => r.item);
  }

//   if (postCategory !== "") {
//     filtered = filtered.filter(
//       (post) => post.category === postCategory
//     );
//   }

  return filtered;
}, [posts, searchTerm, debouncedSearch]);

  
    const renderTextWithHashtags = (text) => {
      if (!text) return null;
  
      // Convert visible "\r\n" or "\\n" into real line breaks
      const cleanedText = text.replace(/\\r\\n|\\n|\\r\n/g, " ");
  
      return cleanedText.split("\n").map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {line.split(/(\s+#\w+)/g).map((word, index) =>
            word.startsWith(" # ") ? (
              <span key={index} className="text-md text-white font-italy">
                {word}
              </span>
            ) : (
              <React.Fragment key={index}>{word}</React.Fragment>
            ),
          )}
          <br />
        </React.Fragment>
      ));
    };
  // console.log("domain posts---", posts)
  // console.log("domain postCount---", postCount)
  return (
     <div className="relative min-h-screen">

    
      {/* Search */}
      <div className="w-11/12 mx-auto max-w-md  flex items-center gap-2 justify-center mb-4 md:mb-8">
        <div className="w-full flex items-center mt-7 md:mt-4  gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 shadow-md focus-within:ring-1 focus-within:ring-teal-500/40 transition">
          <IoSearchOutline className="text-2xl text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by title or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-full text-sm text-white placeholder-gray-400"
          />
        </div>
      </div>

      

      {/* Posts Grid */}
      <div className="flex relative w-full mx-auto md:px-10 pb-16  flex-wrap justify-center h-auto mx-auto">
        {/* <div className="md:w-full grid grid-cols-1 w-full mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-10 mt-2 h-auto">
          {filteredPosts?.map((data) => (
            <article
              key={data._id}
              className="bg-[#0f172a] overflow-hidden shadow-2xl transition-transform duration-500 md:mb-4"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <Link to={`/viewProfile/${data.authorEmail}`}>
                  <img
                    src={
                      data.profile
                        ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.profile}`
                        : user
                    }
                    className="w-9 h-9 rounded-full bg-gray-700 object-cover border border-gray-900"
                    alt={data.authorName}
                  />
                </Link>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">{data.authorName}</p>
                  <p className="text-xs text-gray-400">{getTimeAgo(data.timestamp)}</p>
                </div>
              </div>

              <Link
                to={`/viewpage/${data.authorEmail}/${data._id}`}
                onClick={() => postViews(data.authorEmail, data._id)}
                className="block"
              >
                <img
                  src={
                    data.image
                      ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                      : blog1
                  }
                  alt={data.title}
                  className="w-full h-60 transition-transform duration-500 md:hover:scale-[1.05] md:h-48 object-cover"
                />
              </Link>

              <div className="px-4 py-4 space-y-2">
                <h3 className="text-base font-semibold text-white line-clamp-1">
                  {highlightText(data.title, debouncedSearch)}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 md:line-clamp-1">
                  {renderTextWithHashtags(data.description)}
                </p>
              </div>

              <div className="flex items-center justify-between px-4 pb-7">
                <div className="flex items-center gap-3 text-gray-400">
                  <button
                    onClick={() => postLikes(data.authorEmail, data._id)}
                    className="flex items-center gap-1 text-teal-500"
                  >
                    {(data.likes || []).includes(email) ? (
                      <BiSolidLike className="text-xs text-teal-600" />
                    ) : (
                      <BiLike className="text-xs" />
                    )}
                    <span className="text-xs">{data.likes?.length || ""}</span>
                  </button>

                  <button
                    onClick={() => sharePost(data.title, data.authorEmail, data._id)}
                    className="text-teal-500"
                  >
                    <IoShareSocial className="text-xs" />
                  </button>

                  <Link
                    to={`/viewpage/${data.authorEmail}/${data._id}`}
                    onClick={() => postViews(data.authorEmail, data._id)}
                    className="flex items-center gap-1 text-xs text-gray-500"
                  >
                    <span className="text-xs">{data.views.length}</span> views
                  </Link>
                </div>

                <button className="text-xs px-2 py-1 rounded-full inline-block bg-emerald-600/20 text-emerald-400">
                  {data.category}
                </button>
              </div>
            </article>
          ))}

          {!posts.length > 0 && loading && <BlogSkeleton />}

          {posts.length > 0 && loading && (
            <div className="col-span-full flex justify-center">
              <div className="relative flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            </div>
          )}

          {!hasMore && (
            <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
              No more posts
            </p>
          )}
        </div> */}

        <PostsComponent filteredPosts={filteredPosts} posts={posts} loading={loading} hasMore={hasMore} setPosts={setPosts} debouncedSearch={debouncedSearch}  setPostCategory={setPostCategory}/>
      </div>
    </div>
  )
}

export default SingleDomainPosts;
