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
  const [count, setCount] = useState(1);
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
        setCount(response.data.count);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  useEffect(() => {
    getBookMarkPlaylist();
  }, []);

  // console.log("bookmarked playlist", bookMarPlaylist);
  // console.log("bookmarked count", count);

  return (
    <>
    <section className={`${tutorPlayList?.filter((playlist) => bookmakIds.includes(playlist._id))?.length> 0 ? "space-y-4 mt-7" : "hidden"}`}>
          <h2 className="md:pl-4 pl-2 text-2xl md:text-4xl font-bold tracking-wide text-gray-200">
            Playlists
          </h2>


   
  {  
  count>0 &&
    <div
  //     className="
  //   flex gap-6 overflow-x-auto pb-4
  //   sm:grid sm:grid-cols-2
  //   lg:grid-cols-3
  //   xl:grid-cols-5
  //   sm:overflow-visible
  // "
    className="
    gap-6 pb-4 gap-3
    grid grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-5
    overflow-visible
  "
    >
       
     
      {tutorPlayList
        ?.filter((playlist) => bookmakIds.includes(playlist._id))
        .map((playlist) => (
          <div key={playlist._id}
          //  className="min-w-[200px] sm:min-w-0"
           className="min-w-[150px] sm:min-w-0"
          >
            <BookmarkPlaylistCard
              playlist={playlist}
              onRemove={() => {
                getBookMarkPlaylist();
              }}
            />
          </div>
        ))}
    </div>
    
  }
   
       </section>
        { count==0 && <p className="text-gray-400 flex justify-center items-center h-56 text-center py-4">No playlists bookmarked!</p>}
       </>
  );
};

export default TutorBookMarkPlaylist;
