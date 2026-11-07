import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close image preview"
                className="absolute -right-5 md:-right-7 -top-3 z-10 flex md:h-8 w-7 h-7 md:w-8 items-center justify-center rounded-full border border-white/15 bg-gray-900 text-white shadow-lg transition-colors hover:bg-gray-800"
              >
                <IoClose className="text-sm md:text-base" />
              </button>
              <img
                src={src}
                alt={alt}
                className="h-56 w-56 max-h-[70vw] max-w-[70vw] rounded-full border-2 border-emerald-500/60 object-cover shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProfilePicturePreview;
