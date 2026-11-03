import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

/* eslint-disable react/prop-types */
function ProfilePicturePreview({ src, alt, className }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`View ${alt.toLowerCase()} larger`}
        className="block cursor-zoom-in rounded-full"
      >
        <img src={src} alt={alt} className={className} />
      </button>
      {isOpen && (
        <div
          role="presentation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close image preview"
              className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-gray-900 text-white shadow-lg transition-colors hover:bg-gray-800"
            >
              <IoClose size={20} />
            </button>
            <img
              src={src}
              alt={alt}
              className="h-56 w-56 max-h-[70vw] max-w-[70vw] rounded-full border-2 border-emerald-500/60 object-cover shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePicturePreview;
