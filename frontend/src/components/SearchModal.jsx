
// import React, { useContext, useEffect, useRef, useState } from "react";
// import { IoIosSearch } from "react-icons/io";
// import { IoClose } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import { GlobalStateContext } from "../GlobalStateContext";

// function SearchModal({ open, setOpen }) {
//   // const [search, setSearch] = useState("");
//   const inputRef = useRef(null);
//    const { searchTerm, setSearchTerm } = useContext(GlobalStateContext );

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (open) {
//       setTimeout(() => {
//         inputRef.current?.focus();
//       }, 100);
//     }
//   }, [open]);

//   const handleSearch = () => {
//     if (!searchTerm.trim()) return;

//     navigate(`/home`);

//     setOpen(false);
//   };

//   if (!open) return null;

//   return (
//     <div
//     //   className="
//     //     fixed inset-0 z-[999]
//     //     bg-black/60 backdrop-blur-sm
//     //     flex items-start justify-center
//     //     pt-20 px-4
//     //   "
//      className="
//         fixed z-[999] inset-0
//         flex items-start justify-center
//         pt-20 px-4
//       "
//     >
//       {/* Modal */}
//       <div
//         className="
//           w-full max-w-2xl
//           rounded-2xl
//           border border-[#30363d]
//           bg-[#0d1117]
//           shadow-2xl
//           overflow-hidden
//           animate-in fade-in zoom-in-95 duration-200
//         "
//       >
//         {/* Search Header */}
//         <div
//           className="
//             flex items-center gap-3
//             px-4 py-3
//             border-b border-[#21262d]
//           "
//         >
//           <IoIosSearch className="text-xl text-gray-500" />

//           <input
//             ref={inputRef}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//             placeholder="Search posts, playlists, communities..."
//             className="
//               flex-1 bg-transparent
//               outline-none border-0
//               text-sm text-white
//               placeholder:text-gray-500
//             "
//           />

//           <button
//             onClick={() => setOpen(false)}
//             className="
//               p-1 rounded-md
//               hover:bg-white/5
//               text-gray-400
//             "
//           >
//             <IoClose className="text-lg" />
//           </button>
//         </div>

//         {/* Footer */}
//         <div className="px-4 py-3 text-xs text-gray-500">
//           Press Enter to search
//         </div>
//       </div>
//     </div>
//   );
// }


// export default SearchModal;

import React, { useContext, useEffect, useRef, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { GlobalStateContext } from "../GlobalStateContext";
import { useLocation, useNavigate } from "react-router-dom";

function SearchModal({ open, setOpen, inputValue, setInputValue }) {
  const inputRef = useRef(null);
  

  const { searchTerm, setSearchTerm } =
    useContext(GlobalStateContext);

    

  useEffect(() => {
  const timer = setTimeout(() => {
    setSearchTerm(inputValue);
  }, 400);

  return () => clearTimeout(timer);
}, [inputValue]);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Auto focus
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // ✅ ESC Close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [setOpen]);

  // // ✅ Search Navigation
  // const handleSearch = () => {
  //   if (!searchTerm.trim()) return;

  //   // Navigate only if not already in home
  //   if (location.pathname !== "/home") {
  //     navigate("/home");
      
  //   }
  // };

   const handleSearch = () => {
    if (!searchTerm.trim()) return;

    navigate(`/home`);

    setOpen(false);
  };

  // ✅ Clear Search
  const clearSearch = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[999]
        flex items-start justify-center
        pt-16 px-4
      "
    >
      {/* Backdrop */}
     <div
  onClick={() => setOpen(false)}
  className={`absolute inset-0 ${
    location.pathname !== "/home"
      ? "bg-black/50 backdrop-blur-sm"
      : ""
  }`}
/>

      {/* Modal */}
      <div
        className="
          relative
          w-full max-w-2xl
          rounded-2xl
          border border-[#30363d]
          bg-gray-950
          shadow-2xl
          overflow-hidden
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Search Header */}
        <div
    
            className="
              flex items-center gap-3
              px-4 py-3
              w-full
              min-w-0
              border-b border-[#21262d]
            "
        >
          <IoIosSearch className="text-xl text-gray-500 shrink-0" />

          {/* <input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search posts, playlists, communities..."

            className="
                flex-1
              
                min-w-0
                w-0
                bg-transparent
                outline-none
                border-0
                text-sm
                text-white
                placeholder:text-gray-500
                truncate
              "
          /> */}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search posts, playlists, communities..."
            className="
              flex-1
              min-w-0
              w-0
              bg-transparent
              outline-none
              border-0
              text-sm
              text-white
              placeholder:text-gray-500
              md:placeholder:text-gray-400
              truncate
            "
          />

          {/* ✅ Clear Search */}
          {searchTerm && (
            <button
              onClick={()=>{setSearchTerm(""); setInputValue("")}}
              className="
                rounded-full
                text-gray-500 hover:text-gray-400
                transition-all duration-300
                border border-neutral-500

              "
            >
              <IoClose className="md:text-sm text-xs" />
            </button>
          )}

          {/* Close Modal */}
          {/* <button
            // onClick={() => setOpen(false)}
            onClick={clearSearch}
            className="
              p-1
              absolute right-2 top-1
              rounded-md
              hover:bg-white/5
              text-gray-400
              transition-all duration-200
            "
          >
            <IoClose className="text-lg" />
          </button> */}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 text-xs text-gray-500 md:text-gray-400 flex items-center justify-between">
          <span>You are searching for :</span>

          {searchTerm && (
        <div className="max-w-[180px] overflow-hidden">
          <span className="text-emerald-400 block truncate whitespace-nowrap">
            "{searchTerm}"
          </span>
        </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;