
import clsx from 'clsx';
import React from 'react'
import { twMerge } from 'tailwind-merge';

 function AnnouncementGuidelines({
    showAnnouncement,
    showGuidelines,
    className = "",
    setShowAnnouncement
  }) {
    return (
      <div
        className={twMerge(
          clsx(
            `
              w-full
        rounded-lg
        border border-emerald-500/20
        bg-gradient-to-br from-emerald-500/5 to-transparent
        p-4 md:p-5
        space-y-5
        mb-6
       
        ${showGuidelines ? "block" : "hidden md:block"}

        ${showAnnouncement && "hidden md:hidden"}
       
                `,
            className,
          ),
        )}

      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <h2 className="text-sm md:text-base font-semibold text-white tracking-wide">
            Announcement Guidelines
          </h2>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">Purpose</p>
          <ul className="space-y-1.5 text-xs md:text-sm text-gray-300">
            <li className="flex gap-2">
              <span>•</span> Campaigns, events, hackathons
            </li>
            <li className="flex gap-2">
              <span>•</span> Community meetings & tech activities
            </li>
            <li className="flex gap-2">
              <span>•</span>
              Must follow{" "}
              <span className="text-gray-400">university code of conduct</span>
            </li>
          </ul>
        </div>

        {/* Access */}
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 font-medium">Who Can Create</p>
          <p className="text-xs md:text-sm text-gray-300">
            Only <span className="text-white font-medium">Admins</span> and{" "}
            <span className="text-white font-medium">Coordinators</span>
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">
            How to Create (very simple)
          </p>

          <div className="space-y-2 text-xs md:text-sm text-gray-300">
            <p>
              <span className="text-white">Title:</span> Clear subject
            </p>
            <p>
              <span className="text-white">Message:</span> What you communicate
            </p>
            <p>
              <span className="text-white">Links:</span> Event / meeting /
              survey
            </p>
            <p>
              <span className="text-white">Poster:</span> Suitable Thumbnail{" "}
              <span className="text-xs"> (1280 × 720 px)</span>
            </p>
            <p>
              <span className="text-white">Recipients:</span>{" "}
              <span className="text-gray-400">
                Community / Coordinators / All Users
              </span>
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <p className="text-xs text-emerald-400 font-medium">Best Practices</p>
          <ul className="space-y-1.5 text-xs md:text-sm text-gray-300">
            <li className="flex gap-2">
              <span>•</span> Keep it clear & short
            </li>
            <li className="flex gap-2">
              <span>•</span> Add valid links & poster
            </li>
            <li className="flex gap-2">
              <span>•</span> Target the right audience
            </li>
          </ul>
        </div>
        <button
          onClick={() => setShowAnnouncement(!showAnnouncement)}
          className="md:px-4 px-3 py-2 md:py-2 bg-emerald-600/20 hover:bg-emerald-500/20
                rounded-md text-xs font-semibold   text-emerald-400 transition "
        >
          Create Campaign
        </button>
      </div>
    );
  }

export default AnnouncementGuidelines