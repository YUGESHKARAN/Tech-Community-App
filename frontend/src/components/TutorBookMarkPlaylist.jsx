import React, { useState, useEffect } from "react";
import TutorPlaylistCard from "./TutorPlaylistCard";
import useTutorPlaylist from "../hooks/useTutorPlaylist";
import { Link } from "react-router-dom";
import BookmarkPlaylistCard from "./BookmarkPlaylistCard";
import axiosInstance from "../instances/Axiosinstances";

const TutorBookMarkPlaylist = () => {
  const { tutorPlayList } = useTutorPlaylist();
  const [bookMarPlaylist, setBookMarPlaylist] = useState([]);
  const [bookmakIds, setBookMarkIds] = useState([]);
  const email = localStorage.getItem("email");
  // console.log("playlist", tutorPlayList);

  const getBookMarkPlaylist = async () => {
    try {
      const response = await axiosInstance.get(
        `/blog/playlist/bookmark/${email}`
      );
      if (response.status == 200) {
        setBookMarPlaylist(response.data.playlists);
        setBookMarkIds(response.data.playlistIds);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getBookMarkPlaylist();
  }, []);

  // console.log("bookmarked playlist", bookMarPlaylist);

  return (
    <section className={`${tutorPlayList?.filter((playlist) => bookmakIds.includes(playlist._id))?.length> 0 ? "space-y-4 mt-7" : "hidden"}`}>
          <h2 className="md:pl-4 pl-2 text-2xl md:text-4xl font-bold tracking-wide text-gray-200">
            Playlists
          </h2>

   
    <div
      className="
    flex gap-6 overflow-x-auto pb-4
    sm:grid sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-5
    sm:overflow-visible
  "
    >
       
     
      {tutorPlayList
        ?.filter((playlist) => bookmakIds.includes(playlist._id))
        .map((playlist) => (
          <div key={playlist._id} className="min-w-[200px] sm:min-w-0">
            <BookmarkPlaylistCard
              playlist={playlist}
              onRemove={() => {
                getBookMarkPlaylist();
              }}
            />
          </div>
        ))}
    </div>
       </section>
  );
};

export default TutorBookMarkPlaylist;
