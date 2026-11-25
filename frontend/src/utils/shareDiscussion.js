import { shareData, shareExcerpt } from "./share.js";

export const discussionPath = (communityId, discussionId) =>
  `/discussion/${encodeURIComponent(communityId)}/${encodeURIComponent(discussionId)}`;

export function discussionShareData(communityId, discussionId, title, body) {
  if (!communityId || !discussionId || !title) {
    throw new Error("Discussion details are unavailable.");
  }

  return {
    title,
    text: shareExcerpt(body),
    url: new URL(discussionPath(communityId, discussionId), window.location.origin).href,
  };
}

export async function shareDiscussion(communityId, discussionId, title, body) {
  const data = discussionShareData(communityId, discussionId, title, body);
  return shareData(data);
}
