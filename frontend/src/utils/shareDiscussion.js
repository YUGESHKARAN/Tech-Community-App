export const discussionPath = (communityId, discussionId) =>
  `/discussion/${encodeURIComponent(communityId)}/${encodeURIComponent(discussionId)}`;

export function discussionShareData(communityId, discussionId, title, body) {
  if (!communityId || !discussionId || !title) {
    throw new Error("Discussion details are unavailable.");
  }

  const excerpt = (body || "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/(^|\s)#{1,6}\s+/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title,
    text: excerpt.length > 200 ? `${excerpt.slice(0, 199).trimEnd()}…` : excerpt,
    url: new URL(discussionPath(communityId, discussionId), window.location.origin).href,
  };
}

export async function shareDiscussion(communityId, discussionId, title, body) {
  const data = discussionShareData(communityId, discussionId, title, body);

  if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
    await navigator.share(data);
    return "shared";
  }

  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard is unavailable.");
  }
  await navigator.clipboard.writeText(data.url);
  return "copied";
}
