/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { TbDotsVertical, TbShare } from "react-icons/tb";
import toast from "./toaster/Toast";
import { shareCommunity } from "../utils/shareCommunity";

export default function CommunityShareMenu({ community, className = "" }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const shareRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    shareRef.current?.focus();
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (open && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      shareRef.current?.focus();
    } else if (!open && event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleShare = async () => {
    triggerRef.current?.focus();
    setOpen(false);
    try {
      const result = await shareCommunity(
        community._id,
        community.name,
        community.description,
        community.tagline,
      );
      if (result === "copied") toast.success("Community link copied");
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Unable to share community:", error);
      toast.error("Unable to share community", "Please try again.");
    }
  };

  return (
    <div
      ref={menuRef}
      className={`z-30 ${className}`}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Options for ${community?.name || "community"}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!community?._id || !community?.name}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-white/90 hover:text-white transition-colors  disabled:opacity-50"
      >
        <TbDotsVertical className="text-sm md:text-lg" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 bg-gray-900/90 rounded top-full mt-1">
          <button
            ref={shareRef}
            type="button"
            role="menuitem"
            onClick={handleShare}
            className="flex items-center gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs font-medium text-gray-300 hover:text-gray-200 transition-colors  focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <TbShare className="text-sm md:text-base" aria-hidden="true" />
            Share
          </button>
        </div>
      )}
    </div>
  );
}
