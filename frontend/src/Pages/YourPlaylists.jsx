import React, { useEffect } from "react";
import useTutorPlaylist from "../hooks/useTutorPlaylist";
import NavBar from "../ui/NavBar";
import { BsPersonWorkspace } from "react-icons/bs";
import YourPlaylistCard from "../components/YourPlaylistCard";
import useTutoPlaylistByEmail from "../hooks/useTutorPlaylistByEmail";
import TutorPlaylistGridSkeleton from "../components/loaders/TutorPlaylistGridSkeleton";
import { Link } from "react-router-dom";
import Footer from "../ui/Footer";

const YourPlaylist = () => {
  const {
    tutorPlayListByEmail,
    setTutorPlayListByEmail,
    getTutorPlayListByEmail,
    loading,
    hasMore,
  } = useTutoPlaylistByEmail();

  //   console.log("tutorPlayListByEmail", tutorPlayListByEmail);
  return (
    <div className="w-full min-h-screen bg-gray-900 h-auto reltive  ">
      <NavBar />

      <h1 className=" text-2xl w-full px-4 flex items-center gap-2 mt-4 mx-auto md:text-3xl font-semibold text-white tracking-wide">
        <BsPersonWorkspace />
        <span className="group text-white"> My Tutor Playlist</span>{" "}
      </h1>
      <div className="min-h-screen w-full px-4 mt-4 mx-auto bg-gray-900 pb-8">
        {tutorPlayListByEmail.length > 0 && (
          <div
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
            {tutorPlayListByEmail?.map((playlist) => (
              <div key={playlist._id} className="md:min-w-[200px] min-w-0">
                <YourPlaylistCard
                  playlist={playlist}
                  onRemove={() => {
                    getTutorPlayListByEmail();
                  }}
                  onDelete={(_id) => {
                    setTutorPlayListByEmail((prev) =>
                      prev.filter((p) => p._id !== _id),
                    );
                  }}
                />
              </div>
            ))}
            {loading && (
              <p className="text-center py-4 col-span-full text-gray-500">
                loading...
              </p>
            )}
            {!hasMore && (
              <p className="text-center col-span-full py-4 text-gray-500">
                No more playlists
              </p>
            )}
          </div>
        )}

        {!tutorPlayListByEmail?.length > 0 && loading && (
          <TutorPlaylistGridSkeleton />
        )}
        {tutorPlayListByEmail?.length == 0 && !loading && (
          <div className="flex h-[70vh] flex-col justify-center items-center gap-5 ">
            <p className="text-gray-400 flex justify-center items-center text-center ">
              No playlists available!
            </p>
            <Link
              to="/addTutorPlaylist"
              className="text-sm  cursor-pointer hover:bg-green-700 bg-green-600 transition-all duration-400 text-white font-medium rounded-md px-4 p-2"
            >
              + Create New Playlist
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default YourPlaylist;
