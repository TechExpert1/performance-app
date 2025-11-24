import Community_Post from "../models/Community_Post.js";
import Reaction from "../models/Reaction.js";
import { Request } from "express";
import mongoose from "mongoose";
import { SortOrder } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
import Community_Post_Comment from "../models/Community_Post_Comment.js";
export const createCommunityPost = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    return { message: "User information is missing from request." };
  }
  const payload = {
    ...req.body,
    createdBy: req.user.id,
    community: req.params.communityId,
    images: req.fileUrls?.images || [],
  };

  const community = await Community_Post.create(payload);
  return {
    message: "Post created successfully",
    community,
  };
};

export const toggleCommunityPostReaction = async (
  req: AuthenticatedRequest
) => {
  if (!req.user) {
    throw new Error("User information is missing from request.");
  }

  const { postId } = req.params;
  const { type } = req.body;

  if (!postId) {
    throw new Error("Post ID is missing from request.");
  }
  let post = await Community_Post.findById(postId);
  if (!post) {
    throw new Error("Post not found.");
  }
  const existingReaction = await Reaction.findOne({
    post: postId,
    user: req.user.id,
    type,
  });

  if (existingReaction) {
    await Reaction.findByIdAndDelete(existingReaction._id);

    if (type === "like" && Number(post.likes ?? 0) > 0) {
      post.likes = Number(post.likes ?? 0) - 1;
      await post.save();
    }
    return { message: "Reaction removed successfully" };
  }

  const newReaction = await Reaction.create({
    post: postId,
    user: req.user.id,
    type,
  });

  if (type === "like") {
    post.likes = Number(post.likes ?? 0) + 1;
    await post.save();
  }
  return {
    message: "Reaction added successfully",
    reaction: newReaction,
  };
};

export const createPostComment = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User information is missing from request.");
  }

  const { postId } = req.params;

  if (!postId) {
    throw new Error("Post ID is missing from request.");
  }
  const payload = {
    ...req.body,
    user: req.user.id,
    post: postId,
  };
  const comment = await Community_Post_Comment.create(payload);

  // Fetch all comments for this post with populated user data
  const allComments = await Community_Post_Comment.find({ post: postId })
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 }); // Sort comments by newest first

  return {
    message: "comment added successfully",
    comment,
    comments: allComments,
  };
};

export const getAllCommunityPosts = async (req: Request) => {
  const {
    page = "1",
    limit = "20",
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};

  // Apply filters safely
  for (const key in filters) {
    if (
      filters[key] !== undefined &&
      filters[key] !== null &&
      filters[key] !== ""
    ) {
      query[key] = filters[key];
    }
  }

  if (req.params.communityId) {
    query.community = req.params.communityId;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  // Get total count for pagination
  const total = await Community_Post.countDocuments(query);

  // Fetch posts with pagination and sorting
  const posts = await Community_Post.find(query)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(Number(limit))
    .populate("createdBy");

  // Fetch comments for all posts in this result set
  const postIds = posts.map(post => post._id);
  const allComments = await Community_Post_Comment.find({ post: { $in: postIds } })
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 }); // Sort comments by newest first

  // Group comments by post ID
  const commentsByPost = allComments.reduce((acc, comment) => {
    const postId = comment.post.toString();
    if (!acc[postId]) acc[postId] = [];
    acc[postId].push(comment);
    return acc;
  }, {} as Record<string, any[]>);

  // Attach comments to posts
  const postsWithComments = posts.map(post => ({
    ...post.toObject(),
    comments: commentsByPost[(post as any)._id.toString()] || []
  }));

  return {
    data: postsWithComments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      totalResults: total,
    },
  };
};
