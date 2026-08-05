// src/api/discussionApi.js

import axiosInstance from '../instances/Axiosinstances';

const BASE = (communityId) => `/bytes/discuss/${communityId}`;

// ── Settings ──
export const getSettings = (communityId) =>
  axiosInstance.get(`${BASE(communityId)}/settings`);

export const updateWhoCanPost = (communityId, whoCanPost) =>
  axiosInstance.patch(`${BASE(communityId)}/settings/whoCanPost`, { whoCanPost });

// ── Tags ──
export const getTags = (communityId) =>
  axiosInstance.get(`${BASE(communityId)}/tags`);

export const createTag = (communityId, data) =>
  axiosInstance.post(`${BASE(communityId)}/tags`, data);

export const updateTag = (communityId, tagId, data) =>
  axiosInstance.patch(`${BASE(communityId)}/tags/${tagId}`, data);

export const deleteTag = (communityId, tagId) =>
  axiosInstance.delete(`${BASE(communityId)}/tags/${tagId}`);

// ── Discussions ──
export const getDiscussions = (communityId, params = {}) =>
  axiosInstance.get(`${BASE(communityId)}/discussions`, { params });

export const getDiscussionById = (communityId, discussionId, params = {}) =>
  axiosInstance.get(`${BASE(communityId)}/discussions/${discussionId}`, { params });

export const createDiscussion = (communityId, data) =>
  axiosInstance.post(`${BASE(communityId)}/discussions`, data);

export const updateDiscussion = (communityId, discussionId, data) =>
  axiosInstance.patch(`${BASE(communityId)}/discussions/${discussionId}`, data);

export const deleteDiscussion = (communityId, discussionId) =>
  axiosInstance.delete(`${BASE(communityId)}/discussions/${discussionId}`);

// ── Discussion actions ──
export const pinDiscussion = (communityId, discussionId) =>
  axiosInstance.patch(`${BASE(communityId)}/discussions/${discussionId}/pin`);

export const markSolved = (communityId, discussionId, solvedReplyId) =>
  axiosInstance.patch(`${BASE(communityId)}/discussions/${discussionId}/solve`, { solvedReplyId });

export const upvoteDiscussion = (communityId, discussionId) =>
  axiosInstance.post(`${BASE(communityId)}/discussions/${discussionId}/upvote`);

export const removeUpvoteDiscussion = (communityId, discussionId) =>
  axiosInstance.delete(`${BASE(communityId)}/discussions/${discussionId}/upvote`);

// ── Replies ──
export const getReplies = (communityId, discussionId, params = {}) =>
  axiosInstance.get(`${BASE(communityId)}/discussions/${discussionId}/replies`, { params });

export const createReply = (communityId, discussionId, data) =>
  axiosInstance.post(`${BASE(communityId)}/discussions/${discussionId}/replies`, data);

export const updateReply = (communityId, discussionId, replyId, data) =>
  axiosInstance.patch(`${BASE(communityId)}/discussions/${discussionId}/replies/${replyId}`, data);

export const deleteReply = (communityId, discussionId, replyId) =>
  axiosInstance.delete(`${BASE(communityId)}/discussions/${discussionId}/replies/${replyId}`);

export const upvoteReply = (communityId, discussionId, replyId) =>
  axiosInstance.post(`${BASE(communityId)}/discussions/${discussionId}/replies/${replyId}/upvote`);

export const removeUpvoteReply = (communityId, discussionId, replyId) =>
  axiosInstance.delete(`${BASE(communityId)}/discussions/${discussionId}/replies/${replyId}/upvote`);

export const markAnswer = (communityId, discussionId, replyId) =>
  axiosInstance.patch(`${BASE(communityId)}/discussions/${discussionId}/replies/${replyId}/answer`);

// ── Sidebar ──
export const getTrendingTags = (communityId) =>
  axiosInstance.get(`${BASE(communityId)}/trending-tags`);

export const getCommunityLeaderboard = (communityId, period = 'weekly') =>
  axiosInstance.get(`${BASE(communityId)}/leaderboard`, { params: { period } });