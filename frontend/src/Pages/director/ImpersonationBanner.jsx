import React, { useState } from "react";
import useImpersonation from "../../hooks/director/Useimpersonation";
import {
  TbUserShield, TbLogout, TbClock, TbAlertTriangle, TbLoader2,
} from "react-icons/tb";

/**
 * ImpersonationBanner
 *
 * Mount this ONCE at the top of your app layout — above NavBar, below nothing.
 * It renders nothing when not impersonating, so there is zero UI cost on
 * normal user sessions.
 *
 * Usage in App.jsx / Layout.jsx:
 *   import ImpersonationBanner from "./components/ImpersonationBanner";
 *
 *   function Layout({ children }) {
 *     return (
 *       <>
 *         <ImpersonationBanner />
 *         <NavBar />
 *         {children}
 *       </>
 *     );
 *   }
 *
 * The banner pushes NavBar down — add `pt-10` to your NavBar's sticky top
 * offset when the banner is active, or set `top-10` on the NavBar sticky class.
 * The banner itself is `position: fixed; top: 0; z-index: 9999` so it always
 * sits above everything including modals.
 */

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function ImpersonationBanner() {
  const { isActive, meta, timeLeft, exit } = useImpersonation();
  const [exiting, setExiting] = useState(false);

  if (!isActive) return null;

  const isExpiringSoon = timeLeft <= 120; // last 2 minutes → warning color

  const handleExit = async () => {
    setExiting(true);
    await exit(); // triggers full page reload — setExiting never resets
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between
                  px-4 py-2 text-xs font-medium transition-colors ${
        isExpiringSoon
          ? "bg-red-900/95 border-b border-red-500/30 text-red-100"
          : "bg-violet-900/95 border-b border-violet-500/30 text-violet-100"
      }`}
      style={{ backdropFilter: "blur(12px)" }}
    >
      {/* left — context info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isExpiringSoon ? "bg-red-500/20" : "bg-violet-500/20"
        }`}>
          <TbUserShield className={`text-sm ${isExpiringSoon ? "text-red-300" : "text-violet-300"}`} />
        </div>
        <span className="font-semibold tracking-tight">Impersonation active</span>
        <span className={isExpiringSoon ? "text-red-300/70" : "text-violet-300/70"}>·</span>
        <span className="truncate">
          Viewing as <b className="text-white">{meta?.tenantName}</b>
          <code className={`ml-1.5 text-[10px] px-1 py-0.5 rounded ${
            isExpiringSoon ? "bg-red-500/20 text-red-200" : "bg-violet-500/20 text-violet-200"
          }`}>
            {meta?.tenantId}
          </code>
        </span>
        {isExpiringSoon && (
          <span className="hidden md:flex items-center gap-1 text-red-300 flex-shrink-0">
            <TbAlertTriangle className="text-xs" /> Expiring soon
          </span>
        )}
      </div>

      {/* center — countdown */}
      <div className={`hidden md:flex items-center gap-1.5 flex-shrink-0 font-mono font-bold text-sm ${
        isExpiringSoon ? "text-red-300" : "text-violet-300"
      }`}>
        <TbClock className={`text-sm ${isExpiringSoon ? "animate-pulse" : ""}`} />
        {formatTime(timeLeft)}
      </div>

      {/* right — exit */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* mobile countdown */}
        <span className={`md:hidden font-mono text-xs font-bold ${
          isExpiringSoon ? "text-red-300" : "text-violet-300"
        }`}>
          {formatTime(timeLeft)}
        </span>

        <button
          onClick={handleExit}
          disabled={exiting}
          className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg
                      transition-colors disabled:opacity-50 ${
            isExpiringSoon
              ? "bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30"
              : "bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/30"
          }`}
        >
          {exiting ? (
            <><TbLoader2 className="animate-spin text-xs" /> Exiting...</>
          ) : (
            <><TbLogout className="text-xs" /> Exit impersonation</>
          )}
        </button>
      </div>
    </div>
  );
}

export default ImpersonationBanner;