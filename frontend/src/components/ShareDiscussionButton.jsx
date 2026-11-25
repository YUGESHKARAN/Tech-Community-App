/* eslint-disable react/prop-types */
import { TbShare } from "react-icons/tb";
import toast from "./toaster/Toast";
import { shareDiscussion } from "../utils/shareDiscussion";

export default function ShareDiscussionButton({
  communityId,
  discussionId,
  title,
  body,
  childClass = "",
  className = "",
}) {
  const handleShare = async () => {
    try {
      const result = await shareDiscussion(communityId, discussionId, title, body);
      if (result === "copied") toast.success("Discussion link copied");
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Unable to share discussion:", error);
      toast.error("Unable to share discussion", "Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={!communityId || !discussionId || !title}
      aria-label="Share discussion"
      title="Share discussion"
      className={`inline-flex shrink-0 items-center justify-center text-white/75 gap-1 rounded-xl  text-[10px] font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <TbShare className="ms:text-xs text-[10px] " aria-hidden="true" />
      <span className={`${childClass}`}>Share</span>
    </button>
  );
}
