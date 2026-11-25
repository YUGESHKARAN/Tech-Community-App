import { shareData, shareExcerpt } from "./share.js";

export const communityPath = (communityId) =>
  `/techCommunityDetails/${encodeURIComponent(communityId)}`;

export function communityShareData(communityId, name, description, tagline) {
  if (!communityId || !name) {
    throw new Error("Community details are unavailable.");
  }

  return {
    title: name,
    text: shareExcerpt(description) || shareExcerpt(tagline),
    url: new URL(communityPath(communityId), window.location.origin).href,
  };
}

export async function shareCommunity(communityId, name, description, tagline) {
  return shareData(communityShareData(communityId, name, description, tagline));
}
