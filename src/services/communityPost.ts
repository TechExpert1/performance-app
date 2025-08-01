import Community_Post from "../models/Community_Post.js";
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

export const getAllCommunityPosts = async (req: Request) => {
  const {
    page = "1",
    limit = "20",
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};

  // Apply filters from query params
  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const posts = await Community_Post.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "community_post_comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
      },
    },
    {
      $addFields: {
        totalComments: { $size: "$comments" },
      },
    },
    {
      $project: {
        comments: 0, // exclude full comments array
      },
    },
    { $sort: { [sortBy]: sortDirection } },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const total = await Community_Post.countDocuments(query);

  return {
    data: posts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      totalResults: total,
    },
  };
};
