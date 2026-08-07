
const mongoose = require('mongoose');
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



const getCommunityById = async (req, res) => {
  const { tenantId, authorId } = req.user;
  const { communityId } = req.params;

  if (!communityId) {
    return res.status(400).json({ message: 'communityId required' });
  }

  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    return res.status(400).json({ message: 'Invalid communityId' });
  }

  try {
    const community = await Community.findOne({ _id: communityId, tenantId }).lean();

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const membership = await CommunityMembership.findOne(
      { tenantId, communityId, authorId },
      'role'
    ).lean();

    community.userRole = membership?.role || null;

    const coordinatorsCount = await CommunityMembership.countDocuments({
      tenantId,
      communityId,
      role: 'coordinator',
    });

    community.coordinatorsCount = coordinatorsCount || 0;

    return res.status(200).json({ community });
  } catch (err) {
    console.error('getCommunityById error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getCommunityMembersById = async (req, res) => {
  const { tenantId } = req.user;
  const { communityId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;
 
  if (!communityId) {
    return res.status(400).json({ message: 'communityId required' });
  }

  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    return res.status(400).json({ message: 'Invalid communityId' });
  }

  try {
    const community = await Community.findOne({ _id: communityId, tenantId }).lean();

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const matchFilter = { tenantId, communityId: new mongoose.Types.ObjectId(communityId) };
    const totalCount = await CommunityMembership.countDocuments(matchFilter);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const memberships = await CommunityMembership.aggregate([
      { $match: matchFilter },
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
          authorId: '$author._id',
          authorName: '$author.authorname',
          email: '$author.email',
          profile: '$author.profile',
          role: '$role',
          joinedAt: '$joinedAt',
          postsCount: { $size: { $ifNull: ['$author.posts', []] } },
          followersCount: { $size: { $ifNull: ['$author.followers', []] } },
          followingCount: { $size: { $ifNull: ['$author.following', []] } },
          badges: '$author.badges',
        },
      },
      { $sort: { role: -1, name: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const coordinators = [];
    const members = [];

    memberships.forEach((m) => {
      if (m.role === 'coordinator') {
        coordinators.push(m);
      } else {
        members.push(m);
      }
    });

    return res.status(200).json({
      community: {
        _id: community._id,
        name: community.name,
        slug: community.slug,
      },
      coordinators,
      members,
      coordinatorsCount: coordinators.length,
      membersCount: members.length,
      page,
      limit,
      totalPages,
      totalCount,
    });
  } catch (err) {
    console.log("community members error",err.message )
    console.error('getCommunityMembersById error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getCommunityPostsByCommunityId = async (req, res) => {
  const { tenantId, authorId, role: userRole } = req.user;
  const { communityId } = req.params;
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 20;
  limit = Math.min(Math.max(limit, 1), 100);
  const skip = (page - 1) * limit;

  if (!communityId) {
    return res.status(400).json({ message: 'communityId required' });
  }

  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    return res.status(400).json({ message: 'Invalid communityId' });
  }

  try {
    const community = await Community.findOne({ _id: communityId, tenantId }).lean();

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const membership = await CommunityMembership.findOne({ tenantId, communityId, authorId }).lean();
    const isAdmin = ['admin', 'director'].includes(userRole);

    if (!membership && !isAdmin) {
      return res.status(403).json({ message: 'Access denied to community posts' });
    }

    const communityMatchValues = [community.name, community.slug].filter(Boolean);

    const postFilter = {
      tenantId,
      category: { $in: communityMatchValues },
    };

    const [totalCount, posts] = await Promise.all([
      Post.countDocuments(postFilter),
      Post.aggregate([
        { $match: postFilter },
        { $sort: { timestamp: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: Author.collection.name,
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
          },
        },
        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            authorId: 1,
            title: 1,
            image: 1,
            description: 1,
            category: 1,
            links: 1,
            documents: 1,
            views: 1,
            likes: 1,
            messages: 1,
            timestamp: 1,
            authorName: '$author.authorname',
            authorEmail: '$author.email',
            profile: '$author.profile',
            role: '$author.role',
            community: '$author.community',
          },
        },
      ]),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return res.status(200).json({
      community: { _id: community._id, name: community.name, slug: community.slug },
      page,
      limit,
      totalCount,
      totalPages,
      hasMore: skip + posts.length < totalCount,
      posts,
    });
  } catch (err) {
    console.error('getCommunityPostsByCommunityId error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const editTechCommunity = async (req, res) => {

  const { tenantId, authorId, role: userRole } = req.user;
  const { communityId } = req.params;
  const updatePayload = req.body || {};

  console.log("editTechCommunity called")

  if (!communityId) {
    return res.status(400).json({ message: 'communityId required' });
  }

  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    return res.status(400).json({ message: 'Invalid communityId' });
  }

  const allowedFields = ['name', 'tagline', 'description', 'icon', 'banner', 'colorTheme', 'slug'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updatePayload, field)) {
      updates[field] = updatePayload[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update' });
  }

  try {
    const community = await Community.findOne({ _id: communityId, tenantId }).lean();

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const membership = await CommunityMembership.findOne(
      { tenantId, communityId, authorId },
      'role'
    ).lean();

    const isCoordinator = membership?.role === 'coordinator';
    const isAdmin = userRole === 'admin';

    if (!isCoordinator && !isAdmin) {
      return res.status(403).json({ message: 'Only community coordinators or admins can edit this community' });
    }

    if (updates.slug) {
      const existingCommunity = await Community.findOne({
        tenantId,
        slug: updates.slug,
        _id: { $ne: communityId },
      }).lean();

      if (existingCommunity) {
        return res.status(409).json({ message: 'A community with this slug already exists' });
      }
    }

    const updatedCommunity = await Community.findOneAndUpdate(
      { _id: communityId, tenantId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Community updated successfully',
      community: updatedCommunity,
    });
  } catch (err) {
    console.error('editTechCommunity error:', err.message);
    console.log('editTechCommunity error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCommunityLandingPage, getCommunityById, getCommunityMembersById, getCommunityPostsByCommunityId, editTechCommunity }