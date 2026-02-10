import React from "react";
import { Link } from "react-router-dom";
import {
  FiPlusCircle,
  FiEdit,
  FiFolder,
  FiLayers,
  FiFileText,
  FiClock,
} from "react-icons/fi";
import NavBar from "../ui/NavBar";
import { BsPersonWorkspace } from "react-icons/bs";
import Footer from "../ui/Footer";

function Workspace() {
  return (
    <div className="w-full relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 h-screen md:px-8 pt-4 text-white">
        {/* Header */}
        <div className="md:mb-10 mb-7">
          <h1 className="text-2xl flex items-center gap-4 md:text-4xl font-bold tracking-wide">
            <BsPersonWorkspace /> Workspace
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Manage your posts and playlists content efficiently
          </p>
        </div>

        {/* Stats Section */}
       
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          <StatCard
            icon={<FiFileText />}
            title="Total Posts"
            value="12"
          />
          <StatCard
            icon={<FiLayers />}
            title="Playlists"
            value="4"
          />
          <StatCard
            icon={<FiFolder />}
            title="Drafts"
            value="3"
          />
          <StatCard
            icon={<FiClock />}
            title="Recent Activity"
            value="5"
          />
          
        </div> */}

        {/* Quick Actions */}
        <section className="md:mb-12 mb-7">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              to="/addPost"
              icon={<FiPlusCircle />}
              title="Add New Post"
              description="Create and publish a new post"
            />

            <ActionCard
              to="/addTutorPlaylist"
              icon={<FiLayers />}
              title="Create Playlist"
              description="Group posts into a playlist"
            />
          </div>
        </section>

        {/* Management Section */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Manage Content
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              to="/yourposts"
              icon={<FiEdit />}
              title="Manage Posts"
              description="Edit, update or delete your posts"
            />

            <ActionCard
              to="/yourTutorPlaylists"
              icon={<FiFolder />}
              title="Manage Playlists"
              description="Edit or organize your playlists"
            />
          </div>
        </section>
        
      </div>

      <Footer/>
     
     
    </div>
  );
}

export default Workspace;

/* ---------- Reusable Components ---------- */

const StatCard = ({ icon, title, value }) => (
  <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-all">
    <div className="p-3 rounded-xl bg-white/10 text-xl text-teal-400">
      {icon}
      
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ActionCard = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 flex items-center gap-4 hover:border-teal-500/40 hover:shadow-xl transition-all"
  >
    <div className="p-4 rounded-xl bg-teal-500/10 text-teal-400 text-2xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold group-hover:text-teal-400 transition">
        {title}
      </h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  </Link>
);
