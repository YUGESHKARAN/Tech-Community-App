import React, {useState, useEffect} from "react";
import BlogSkeleton from "./loaders/BlogSkeleton";
import highlightText from "../hooks/highlightText";
import getTimeAgo from "./DateCovertion";
import axiosInstance from "../instances/Axiosinstances";
import { getItem } from "../utils/encode";
import user from "../images/user.png";
import { Link } from "react-router-dom";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { IoShareSocial } from "react-icons/io5";
import { PiBookmarksSimpleFill, PiBookmarksSimpleLight } from "react-icons/pi";
function PostsComponent({ posts, filteredPosts, loading, hasMore, debouncedSearch, setPostCategory, setPosts}) {
  const email = getItem("email");
  const [bookMarkId, setBookMarkId] = useState([]);
  const postViews = async (authorEmail, postId) => {
    try {
      await axiosInstance.put(`/blog/posts/views/${authorEmail}/${postId}`, {
        emailAuthor: email,
      });
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  const postLikes = async (authorEmail, postId) => {
    // e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/blog/posts/likes/${authorEmail}/${postId}`,
        {
          emailAuthor: email,
        },
      );

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
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

   const sharePost = async (title, email, id) => {
    try {
      const data = {
        title: title,
        text: title,
        url: `${window.location.origin}/viewpage/${email}/${id}`,
      };
      const response = await navigator.share(data);
      // console.log("post shared successfully", response);
    } catch (err) {
      console.log("error sharing post", err);
    }
  };

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

  const addBookMarkPostId = async (postId) => {
    try {
      const response = await axiosInstance.post(
        `/blog/posts/bookmarkPosts/${email}`,
        { postId },
      );

      if (response.status === 200) {
        setBookMarkId((prev) => {
          if (prev.includes(postId)) {
            // toast.success("bookmark removed successfully");
            return prev.filter((id) => id !== postId);
          } else {
            // toast.success("post bookmarked successfully");
            return [...prev, postId];
          }
        });
      }
    } catch (err) {
      console.log("error", err.message);
      // toast.error("unable to bookmark");
    }
  };

   const fetchBookmarkIds = async () => {
    try {
      const res = await axiosInstance.get(`/blog/posts/bookmarkIds/${email}`);
      // console.log("all bookmark ids", res.data.postIds?.length);
      setBookMarkId(res.data.postIds || []);
    } catch (err) {
      console.log("failed to load bookmark ids");
    }
  };

  useEffect(() => {
    fetchBookmarkIds();
  }, []);
  return (
    <div className="mx-auto grid grid-cols-1 md:px-2 w-full  mx-auto  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-10 h-auto">
      {filteredPosts?.map((data, index) => (
        <article
          key={data._id}
          className="
                          bg-[#0f172a]
                          overflow-hidden
                          shadow-2xl
                          transition-transform
                          duration-500
                          md:mb-4
                        "
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
              <p className="text-sm font-semibold text-white">
                {/* {data.authorName} */}
                {highlightText(data.authorName, debouncedSearch)}
              </p>
              <p className="text-xs text-gray-400">
                {getTimeAgo(data.timestamp)}
              </p>
            </div>
          </div>

          <Link
            to={`/viewpage/${data.authorEmail}/${data._id}`}
            onClick={() => postViews(data.authorEmail, data._id)}
            className="block "
          >
            <img
              src={
                data.image
                  ? `https://open-access-blog-image.s3.us-east-1.amazonaws.com/${data.image}`
                  : blog1
              }
              alt={data.title}
              className="w-full  h-60 transition-transform
                          duration-500  md:hover:scale-[1.05]  md:h-48  object-cover"
            />
          </Link>

          <div className="px-4 py-4 space-y-2">
            <h3 className="text-base font-semibold text-white line-clamp-1">
              {/* {data.title} */}
              {highlightText(data.title, debouncedSearch)}
            </h3>

            <p className="text-xs text-gray-400  line-clamp-2  md:line-clamp-1 ">
              {renderTextWithHashtags(data.description)}
            </p>
          </div>

          <div className="flex items-center justify-between px-4 pb-7 ">
            <div className="flex items-center gap-3 text-gray-400">
              {/* <Link
                                to={`/viewpage/${data.authorEmail}/${data._id}`}
                                onClick={() =>
                                  postViews(data.authorEmail, data._id)
                                }
                                className="flex items-center gap-1 text-xs text-gray-500"
                              >
                           
                                <span className="text-xs">{data.views.length}</span> views
                              </Link> */}

              <button
                onClick={() => postLikes(data.authorEmail, data._id)}
                className="flex items-center gap-1 text-teal-500"
              >
                {(data.likes || []).includes(email) ? (
                  <BiSolidLike className="text-xs text-teal-600" />
                ) : (
                  <BiLike className="text-xs" />
                )}
                <span className="text-xs">{data.likes?.length || " "}</span>
              </button>

              <button
                onClick={() =>
                  sharePost(data.title, data.authorEmail, data._id)
                }
                className="text-teal-500"
              >
                <IoShareSocial className="text-xs" />
              </button>

              <button
                onClick={() => addBookMarkPostId(data._id)}
                className="text-teal-500"
              >
                {Array.isArray(bookMarkId) && bookMarkId.includes(data._id) ? (
                  <PiBookmarksSimpleFill className="text-teal-600" />
                ) : (
                  <PiBookmarksSimpleLight />
                )}
              </button>

              <Link
                to={`/viewpage/${data.authorEmail}/${data._id}`}
                onClick={() => postViews(data.authorEmail, data._id)}
                className="flex items-center gap-1 text-xs text-gray-500"
              >
                <span className="text-xs">{data.views.length}</span> views
              </Link>
            </div>

            <button
              onClick={() => setPostCategory(data.category)}
              className="
                                text-xs
                                px-2 py-1
                                rounded-full
                               inline-block text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded
                              "
            >
              {data.category}
            </button>
          </div>
        </article>
      ))}

      {!posts.length > 0 && loading && <BlogSkeleton />}
      {posts.length > 0 && loading && (
        <div className="col-span-full flex justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer Oval Ring */}
            <div className="w-7 h-7  border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />

            {/* Inner Glow Pulse */}
            {/* <div className="absolute w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full blur-md animate-pulse" /> */}
          </div>
        </div>
      )}

      {!hasMore && (
        <p className="text-center text-[10px] md:text-xs col-span-full py-4 text-gray-500">
          No more posts
        </p>
      )}
    </div>
  );
}

export default PostsComponent;
