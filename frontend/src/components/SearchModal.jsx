

import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { GlobalStateContext } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../instances/Axiosinstances";
import highlightText from "../hooks/highlightText";
import logoicon from "../assets/embed_logo_2.png"
function SearchModal({ open, setOpen, inputValue, setInputValue }) {
  const inputRef = useRef(null);
  const abortRef = useRef(null); // cancel in-flight requests on new keystroke

  const { searchTerm, setSearchTerm } = useContext(GlobalStateContext);

  const [suggestions, setSuggestions]   = useState({ posts: [], playlists: [] });
  const [sugLoading,  setSugLoading]    = useState(false);

  // sync inputValue → searchTerm with 200ms debounce (existing behaviour)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // fetch suggestions whenever searchTerm changes — 350ms debounce
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions({ posts: [], playlists: [] });
      return;
    }

    // cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setSugLoading(true);
    try {
      const res = await axiosInstance.get(
        `/blog/search/suggestions?query=${encodeURIComponent(query.trim())}`,
        { signal: abortRef.current.signal }
      );
      if (res.status === 200) {
        setSuggestions({
          posts:     res.data.posts     || [],
          playlists: res.data.playlists || [],
        });
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        console.error("Suggestion fetch error:", err.message);
      }
    } finally {
      setSugLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchSuggestions]);

  const navigate  = useNavigate();

  // auto focus (existing)
  // useEffect(() => {
  //   if (open) {
  //     setTimeout(() => inputRef.current?.focus(), 100);
  //   } else {
  //     // clear suggestions when modal closes
  //     setSuggestions({ posts: [], playlists: [] });
  //   }
  // }, [open]);
  useEffect(() => {
  const el = inputRef.current;

  if (!el) return;

  if (open) {
    setTimeout(() => {
      el.focus();
    }, 100);
  } else {
    setSuggestions({ posts: [], playlists: [] });
  }
}, [open]);

  // ESC close (existing)
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setOpen]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    navigate(`/home`);
    setOpen(false);
  };

  const handlePostClick = (post) => {
    setSearchTerm("");
    setInputValue("");
    navigate(`/viewpage/${post.authorEmail}/${post._id}`);
    setOpen(false);
  };

  const handlePlaylistClick = (playlist) => {
    setSearchTerm("");
    setInputValue("");

    navigate(`/viewplaylist/${playlist._id}`);
    setOpen(false);
  };

  const hasSuggestions =
    suggestions.posts.length > 0 || suggestions.playlists.length > 0;


  
   useEffect(() => {
  const el = inputRef.current;

  if (!el) return;

  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
}, [inputValue])

  if (!open) return null;

   

  return (
    <div
      className="
        fixed top-0 left-0 w-full h-dvh z-[999]
        flex items-start justify-center
        pt-16 px-4 overflow-hidden
        emerald-scrollbar
      "
    >
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div
        className="
          relative w-full max-w-2xl
          rounded-2xl border border-[#30363d]
          bg-gray-950 shadow-2xl
          
          animate-in fade-in zoom-in-95 duration-200
          max-h-[80dvh] flex flex-col overflow-hidden
          emerald-scrollbar
        "
      >
        {/* Search Header — unchanged */}
        <div className="flex items-center gap-3 px-4 py-3 w-full min-w-0 border-b border-[#21262d] shrink-0">
          <IoIosSearch className="text-xl text-gray-500 shrink-0" />

          {/* <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSearch(); }}
            placeholder="Search post and playlist contents..."
            className="
              flex-1 min-w-0 w-0 bg-transparent
              outline-none border-0 text-sm text-white
              placeholder:text-gray-500 md:placeholder:text-gray-400 truncate
            "
          /> */}

           <textarea   
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSearch(); }}
            // placeholder="Ask your queries..."
             placeholder="Search post and playlist contents..."
            // className="flex-1 md:hidden max-h-[150px] bg-gray-800 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none"
            className="flex-1 max-h-[150px] bg-transparent
              outline-none border-0 text-sm text-white text-wrap
              placeholder:text-gray-500 md:placeholder:text-gray-400 truncate
            "
            rows={1}
            />

          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(""); setInputValue(""); setSuggestions({ posts: [], playlists: [] }); }}
              className="rounded-full text-gray-500 hover:text-gray-400 transition-all duration-300 border border-neutral-500"
            >
              <IoClose className="md:text-sm text-xs" />
            </button>
          )}
        </div>

        {/* Suggestions — only shown when there are results */}
        {searchTerm.trim().length >= 2 && (
          <div className="overflow-y-auto scrollbar-hide flex-1">
            {sugLoading && (
              <div className="flex items-center justify-center gap-1 py-4">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              </div>
            )}

            {!sugLoading && hasSuggestions && (
              <>
                {/* Post suggestions */}
                {suggestions.posts.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                      Posts
                    </p>
                    {suggestions.posts.map(post => (
                      <button
                        key={post._id}
                        onClick={() => handlePostClick(post)}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5
                          hover:bg-white/5 transition-colors duration-150
                          text-left group
                        "
                      >
                        {/* thumbnail */}
                        <div className="w-9 h-9 rounded-md bg-gray-800 shrink-0 overflow-hidden">
                          {post.image ? (
                            <img
                              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${post.image}`}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoIosSearch className="text-gray-600 text-sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate  transition-colors">
                            {/* {post.title} */}
                             {highlightText(post.title, searchTerm)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {post.category} · {post.authorName}
                          </p>
                        </div>

                        <span className="text-[10px] text-emerald-400 shrink-0 bg-emerald-600/30 px-2 py-0.5 rounded-full">
                          post
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Playlist suggestions */}
                {suggestions.playlists.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                      Playlists
                    </p>
                    {suggestions.playlists.map(playlist => (
                      <button
                        key={playlist._id}
                        onClick={() => handlePlaylistClick(playlist)}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5
                          hover:bg-white/5 transition-colors duration-150
                          text-left group
                        "
                      >
                        {/* thumbnail */}
                        <div className="w-9 h-9 rounded-md bg-gray-800 shrink-0 overflow-hidden">
                          {playlist.thumbnail ? (
                            <img
                              src={`https://open-access-blog-image.s3.us-east-1.amazonaws.com/${playlist.thumbnail}`}
                              alt={playlist.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoIosSearch className="text-gray-600 text-sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate  transition-colors">
                            {playlist.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {playlist.domain} · {playlist.name}
                          </p>
                        </div>

                        <span className="text-[10px] text-emerald-400 shrink-0 bg-emerald-600/30 px-2 py-0.5 rounded-full">
                          playlist
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {!sugLoading && !hasSuggestions && searchTerm.trim().length >= 2 && (
              <p className="px-4 py-4 text-sm text-gray-500 text-center">
                No results for "{searchTerm}"
              </p>
            )}
          </div>
        )}

        {/* Footer — unchanged */}
        <div className="px-4 py-3 text-xs text-gray-500 md:text-gray-400 flex items-center justify-between border-t border-[#21262d] shrink-0">
          <span className="flex items-center gap-2.5"> <img src={logoicon} className="w-6 h-6 md:w-7 md:h-7 object-contain rounded-md md:rounded-lg " alt="" /> You are searching for :</span>
          {searchTerm && (
            <div className="max-w-[180px] overflow-hidden">
              <span className="text-emerald-400 block truncate whitespace-nowrap">
                "{searchTerm}"
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;