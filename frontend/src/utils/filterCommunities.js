const weeklyContentCount = (community) =>
  (community.weeklyPostCount || 0) + (community.weeklyDiscussionCount || 0);

const latestCreation = (community) =>
  Math.max(
    Date.parse(community.createdAt) || 0,
    Date.parse(community.latestDiscussionAt) || 0,
  );

export function filterCommunities(communities, filter) {
  const list = [...communities];
  switch (filter) {
    case "trending":
      return list
        .filter((community) => weeklyContentCount(community) > 0)
        .sort((a, b) => weeklyContentCount(b) - weeklyContentCount(a));
    case "active":
      return list.sort(
        (a, b) =>
          weeklyContentCount(b) + (b.weeklyReplyCount || 0) -
          weeklyContentCount(a) - (a.weeklyReplyCount || 0),
      );
    case "newest":
      return list.sort((a, b) => latestCreation(b) - latestCreation(a));
    default:
      return list;
  }
}
