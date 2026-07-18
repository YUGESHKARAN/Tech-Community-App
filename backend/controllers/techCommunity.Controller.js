
const { Author, Post } = require("../models/blogAuthorSchema");
const Community = require('../models/communitySchema');
const CommunityMembership = require('../models/communityMembershipSchema');


const getCommunityLandingPage = async (req, res) => {
  const { tenantId } = req.user;
  const authorId = req.user.authorId;

//   console.log("authorID from getCommunityLandingPage", authorId)

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [communities, memberships] = await Promise.all([
    Community.find({ tenantId }),
    CommunityMembership.find({ tenantId, authorId }, 'communityId role'),
  ]);

  const membershipMap = Object.fromEntries(
    memberships.map((m) => [m.communityId.toString(), m.role])
  );

  // weekly post counts — one aggregation across all communities at once,
  // not one query per community
  const weeklyStats = await Post.aggregate([
    {
      $match: {
        tenantId,
        timestamp: { $gte: oneWeekAgo },
      },
    },
    {
      $group: {
        _id: '$category',
        weeklyPostCount: { $sum: 1 },
      },
    },
  ]);

  const statsMap = Object.fromEntries(
    weeklyStats.map((s) => [s._id, { weeklyPostCount: s.weeklyPostCount }])
  );

  const result = communities.map((c) => ({
    ...c.toObject(),
    userRole: membershipMap[c._id.toString()] || null,
    weeklyPostCount: statsMap[c.name]?.weeklyPostCount || 0,
  }));

  res.status(200).json({ communities: result });
};







module.exports = {getCommunityLandingPage}