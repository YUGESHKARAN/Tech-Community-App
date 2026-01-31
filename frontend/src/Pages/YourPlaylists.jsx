import React, { useEffect } from "react";
import useTutorPlaylist from "../hooks/useTutorPlaylist";
import NavBar from "../ui/NavBar";
import { BsPersonWorkspace } from "react-icons/bs";
import YourPlaylistCard from "../components/YourPlaylistCard";
import useTutoPlaylistByEmail from "../hooks/useTutorPlaylistByEmail";

const YourPlaylist = () => {
  const { tutorPlayListByEmail,getTutorPlayListByEmail } = useTutoPlaylistByEmail();

//   console.log("tutorPlayListByEmail", tutorPlayListByEmail);
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 h-auto reltive  ">
      <NavBar />

      <h1 className=" text-2xl  w-11/12 flex items-center gap-2 mt-4 mx-auto md:text-3xl font-bold text-white tracking-wide">
        <BsPersonWorkspace />
        <span className="group text-white">
          {" "}
          My Tutor Playlist 
        </span>{" "}
      </h1>
      <div className="min-h-screen  w-11/12 mx-auto bg-gradient-to-br from-gray-900 to-gray-800 pt-4 pb-8">

    { tutorPlayListByEmail.length>0 ?
      <div
        className="
             md:gap-12 gap-6 mt-10  pb-4
            grid grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-5
            overflow-visible
        "
      >
        {tutorPlayListByEmail?.map((playlist) => (
          <div key={playlist._id} className="md:min-w-[200px] min-w-0">
            <YourPlaylistCard playlist={playlist}
             onRemove={() => {
                getTutorPlayListByEmail();
              }}
            
            />
          </div>
        ))}
      </div>
      :
    <div>
        <h2 className="text-white text-center mt-20 text-xl">No Playlists Found!</h2>
    </div>
      }
      </div>
    </div>
  );
};

export default YourPlaylist;
