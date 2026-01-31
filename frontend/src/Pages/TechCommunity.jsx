import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import axios from "axios";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import { Link } from "react-router-dom";
import useAuthorCommunity from "../hooks/useAuthorCommunity";
function TechCommunity() {
  const [posts, setPosts] = useState([]);

  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  // const [authorCommunity, setAuthorCommunity] = useState([]);
  const [authors, setAuthors] = useState([]);
   const { authorCommunity, getAuthorCommunity } = useAuthorCommunity(email);
  //  const [communities, setCommunities] = useState([]);

  // const getAuthorCommunity = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/blog/author/${email}`);
  //     setAuthorCommunity(response.data.community);
  //   } catch (err) {
  //     console.log("error", err);
  //   }
  // };

  
  // Fetch posts from API
  const getPosts = async () => {
    try {
      const response = await axiosInstance.get("/blog/posts");
      setPosts(response.data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const getAuthors = async () => {
    try {
      const response = await axiosInstance.get("/blog/author");
      setAuthors(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };
  useEffect(() => {
    getPosts();
    getAuthorCommunity();
    getAuthors();
  }, []);

  // Get unique categories
  const getUniqueCategories = (posts) => {
    return [...new Set(posts.map((post) => post.category))];
  };
  const categories = getUniqueCategories(posts);

  //  get Tech community array
  function getCategoryStats(authors, categoryname) {
    let followerscount = 0;
    let authorcount = 0;
    let postscount = 0;

    authors.forEach((author) => {
      if (author.community.includes(categoryname)) {
        if (author.role === "student") {
          followerscount++;
        } else if (author.role === "coordinator") {
          authorcount++;
        }
      }
      const matchingPosts =
        author.posts?.filter((post) => post.category === categoryname) || [];

      postscount += matchingPosts.length;
    });

    return {
      categoryname,
      followerscount,
      authorcount,
      postscount,
    };
  }

  // const communities = getCategoryStats(authors, categories);
  const communities = categories.map((category) =>
    getCategoryStats(authors, category)
  );

  const updateCommunity = async (email, techCommunity) => {
    try {
      const response = await axiosInstance.put(
        "/blog/author/control/updateCommunity",
        {
          email: email,
          techcommunity: techCommunity,
        }
      );
      if (response.status === 201) {
        await getPosts();
        await getAuthorCommunity();
        // window.location.reload();
      }
    } catch (err) {
      console.log("error", err);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800  text-white flex flex-col">
      <NavBar />

      <div className="flex-grow">
        <h1 className="text-center text-3xl md:text-5xl font-extrabold mt-12 mb-8 bg-gradient-to-r from-pink-500 via-blue-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg tracking-wide">
          Tech. Communities
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-16">
          {communities.map((item, index) => (
            <div
              key={index}
              className="relative group backdrop-blur-xl  border border-white/40 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
            >
              {/* Glow hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition duration-700"></div>

              <Link to={`/techDomainDetails/${encodeURIComponent(item.categoryname)}`}>
              <div className="relative z-10 p-5 bg-white/10 backdrop-blur-md rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg  tracking-tight">
                  {item.categoryname}
                </h2>

                <ul className="text-gray-200 space-y-2 text-sm md:text-base">
                  <li className="flex justify-between">
                    <span className="font-semibold text-white">Authors:</span>
                    <span>{item.authorcount}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold text-white">Posts:</span>
                    <span>{item.postscount}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold text-white">Followers:</span>
                    <span>{item.followerscount}</span>
                  </li>
                </ul>
              </div>
              </Link>

              {/* Buttons */}
              <div className="relative z-10 mt-5 flex justify-end">
                {role === "coordinator" || role === "admin" ? (
                  <button
                    type="button"
                    className={`${
                      authorCommunity.includes(item.categoryname)
                        ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold px-5 py-2 rounded-lg shadow-lg hover:opacity-90 transition-all duration-300"
                        : "hidden"
                    }`}
                  >
                    {authorCommunity.includes(item.categoryname) &&
                      "Coordinator"}
                  </button>
                ) : (
                  <button
                    onClick={() => updateCommunity(email, item.categoryname)}
                    type="button"
                    className={`font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-300
                ${
                  authorCommunity.includes(item.categoryname)
                    ? "bg-gradient-to-r from-green-500 to-emerald-400 text-black hover:opacity-90"
                    : "bg-gradient-to-r from-gray-200 to-white text-gray-800 hover:from-gray-300 hover:to-white"
                }`}
                  >
                    {authorCommunity.includes(item.categoryname)
                      ? "Joined"
                      : "Join"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TechCommunity;
