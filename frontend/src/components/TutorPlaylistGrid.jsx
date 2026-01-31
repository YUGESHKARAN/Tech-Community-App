import React, { useEffect } from "react";
import TutorPlaylistCard from "./TutorPlaylistCard";
import useTutorPlaylist from "../hooks/useTutorPlaylist";

const TutorPlaylistGrid = () => {

    const {tutorPlayList} = useTutorPlaylist();
    // console.log("playlist", tutorPlayList)
  return (
    <div
  className="
    flex gap-6 overflow-x-auto pb-4
    sm:grid sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-5
    sm:overflow-visible
  "
>
  {tutorPlayList?.map((playlist) => (
    <div key={playlist._id} className="min-w-[200px] sm:min-w-0">
      <TutorPlaylistCard playlist={playlist} />
    </div>
  ))}
</div>
  );
};

export default TutorPlaylistGrid;
