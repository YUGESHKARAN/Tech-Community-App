import React, { useEffect } from "react";
import TutorPlaylistCard from "./TutorPlaylistCard";
import useTutorPlaylist from "../hooks/useTutorPlaylist";

const TutorPlaylistGrid = () => {
  const { tutorPlayList, playlistCount, loading, hasMore } = useTutorPlaylist();
  console.log("playlist", tutorPlayList)
  return ( 
    <>
    
{   tutorPlayList?.length>0 ?
 <div
      // className="
      //   flex gap-6 overflow-x-auto pb-4
      //   sm:grid sm:grid-cols-2
      //   lg:grid-cols-3
      //   xl:grid-cols-5
      //   sm:overflow-visible
      // "
      className="
     pb-4 gap-5 md:gap-6
    grid grid-cols-1
    md:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
    2xl:grid-cols-5
    overflow-visible
    space-y-5
    md:space-y-0
    mt-7
  "
    >
      {tutorPlayList?.map((playlist) => (
        <div
          key={playlist._id}
          // className="min-w-[200px]  sm:min-w-0 "
          className="min-w-[150px]  sm:min-w-0 "
        >
          <TutorPlaylistCard playlist={playlist} />
        </div>
      ))}
    
      

      {loading && tutorPlayList?.length>0 && (
        <p className="text-center py-4 col-span-full text-gray-500">
          loading...
        </p>
      )}
      {!hasMore && (
        <p className="text-center col-span-full py-4 text-gray-500">
          No more playlists
        </p>
      )}
    </div>:
    <p className="text-gray-400 flex justify-center items-center h-56 text-center py-4">
                  No playlists available!
                </p>
    }

    </>
  );
};

export default TutorPlaylistGrid;
