export default function getTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${minutes > 1 ? "" : ""} `;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${hours > 1 ? "" : ""} `;
  const days = Math.floor(hours / 24);
  if (days < 31) return `${days}d${days > 1 ? "" : ""} `;
  // const weeks = Math.floor(days / 7);
  // if (weeks < 4) return `${weeks} week${weeks > 1 ? "" : ""} `;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo${months > 1 ? "" : ""} `;
  const years = Math.floor(days / 365);
  return `${years}y${years > 1 ? "" : ""} `;
}
