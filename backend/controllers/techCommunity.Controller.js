
const { Author, Post } = require("../models/blogAuthorSchema");
const Community = require('../models/communitySchema');
const CommunityMembership = require('../models/communityMembershipSchema');


// const getCommunityLandingPage = async (req, res) => {
//   const { tenantId } = req.user;
//   const authorId = req.user.authorId;

// //   console.log("authorID from getCommunityLandingPage", authorId)

//   const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

//   const [communities, memberships] = await Promise.all([
//     Community.find({ tenantId }),
//     CommunityMembership.find({ tenantId, authorId }, 'communityId role'),
//   ]);

//   const membershipMap = Object.fromEntries(
//     memberships.map((m) => [m.communityId.toString(), m.role])
//   );

//   // weekly post counts — one aggregation across all communities at once,
//   // not one query per community
//   const weeklyStats = await Post.aggregate([
//     {
//       $match: {
//         tenantId,
//         timestamp: { $gte: oneWeekAgo },
//       },
//     },
//     {
//       $group: {
//         _id: '$category',
//         weeklyPostCount: { $sum: 1 },
//       },
//     },
//   ]);

//   const statsMap = Object.fromEntries(
//     weeklyStats.map((s) => [s._id, { weeklyPostCount: s.weeklyPostCount }])
//   );

//   const result = communities.map((c) => ({
//     ...c.toObject(),
//     userRole: membershipMap[c._id.toString()] || null,
//     weeklyPostCount: statsMap[c.name]?.weeklyPostCount || 0,
//   }));

//   res.status(200).json({ communities: result });
// };

const getCommunityLandingPage = async (req, res) => {
  const { tenantId } = req.user;
  const authorId = req.user.authorId;

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [communities, memberships] = await Promise.all([
      Community.find({ tenantId }),
      CommunityMembership.find({ tenantId, authorId }, 'communityId role'),
    ]);

    const communityIds = communities.map((c) => c._id);

    const membershipMap = Object.fromEntries(
      memberships.map((m) => [m.communityId.toString(), m.role])
    );

    // weekly post counts — one aggregation across all communities at once
    const weeklyStatsPromise = Post.aggregate([
      { $match: { tenantId, timestamp: { $gte: oneWeekAgo } } },
      { $group: { _id: '$category', weeklyPostCount: { $sum: 1 } } },
    ]);

    // coordinator counts — one aggregation across all communities at once
    const coordinatorCountsPromise = CommunityMembership.aggregate([
      { $match: { tenantId, communityId: { $in: communityIds }, role: 'coordinator' } },
      { $group: { _id: '$communityId', count: { $sum: 1 } } },
    ]);

    // 10 random profiles (member + coordinator mixed) per community —
    // one $sample aggregation per community, fine at this community count
    const profilesPromise = Promise.all(
      communityIds.map(async (communityId) => {
        const sampled = await CommunityMembership.aggregate([
          { $match: { tenantId, communityId } },
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: Author.collection.name,
              localField: 'authorId',
              foreignField: '_id',
              as: 'author',
            },
          },
          { $unwind: '$author' },
          {
            $project: {
              _id: 0,
              profile: '$author.profile',
              name: '$author.authorname',
              email: '$author.email',
            },
          },
        ]);
        return [communityId.toString(), sampled];
      })
    );

    const [weeklyStats, coordinatorCounts, profilesEntries] = await Promise.all([
      weeklyStatsPromise,
      coordinatorCountsPromise,
      profilesPromise,
    ]);

    const statsMap = Object.fromEntries(
      weeklyStats.map((s) => [s._id, s.weeklyPostCount])
    );
    const coordinatorCountMap = Object.fromEntries(
      coordinatorCounts.map((c) => [c._id.toString(), c.count])
    );
    const profilesMap = Object.fromEntries(profilesEntries);

    const result = communities.map((c) => ({
      ...c.toObject(),
      userRole: membershipMap[c._id.toString()] || null,
      weeklyPostCount: statsMap[c.name] || 0,
      coordinatorsCount: coordinatorCountMap[c._id.toString()] || 0,
      profiles: profilesMap[c._id.toString()] || [],
    }));

    res.status(200).json({ communities: result });
  } catch (err) {
    console.error('getCommunityLandingPage error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};






module.exports = {getCommunityLandingPage}