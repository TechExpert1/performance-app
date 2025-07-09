import { Request } from "express";
import Community from "../models/Community.js";
import Community_Member from "../models/Community_Member.js";
import Community_Post from "../models/Community_Post.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { SortOrder } from "mongoose";
export const createCommunity = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    return { message: "Community owner information is missing from request." };
  }
  const payload = {
    ...req.body,
    createdBy: req.user.id,
    image: req.fileUrl,
  };

  const community = await Community.create(payload);
  return {
    message: "Community created successfully",
    community,
  };
};

export const updateCommunity = async (req: AuthenticatedRequest) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw new Error("Community not found");

  if (community.createdBy.toString() !== req.user?.id) {
    throw new Error("Unauthorized to update this community");
  }
  const payload = {
    ...req.body,
    image: req.fileUrl,
  };

  const updated = await Community.findByIdAndUpdate(req.params.id, payload, {
    new: true,
  });

  return {
    message: "Community updated successfully",
    community: updated,
  };
};

export const removeCommunity = async (req: AuthenticatedRequest) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw new Error("Community not found");

  if (community.createdBy.toString() !== req.user?.id) {
    throw new Error("Unauthorized to delete this community");
  }

  const removed = await Community.findByIdAndDelete(req.params.id);
  return {
    message: "Community removed successfully",
  };
};

export const getCommunityById = async (req: AuthenticatedRequest) => {
  const communityId = req.params.id;

  const found = await Community.findById(communityId).populate("createdBy");
  if (!found) throw new Error("Community not found");

  const [totalMembers, totalPosts] = await Promise.all([
    Community_Member.countDocuments({
      community: communityId,
      status: "active",
    }),
    Community_Post.countDocuments({ community: communityId }),
  ]);

  return {
    ...found.toObject(),
    totalMembers,
    totalPosts,
  };
};

export const getActiveMembersOfCommunity = async (req: Request) => {
  const communityId = req.params.id;

  const {
    page = "1",
    limit = "20",
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {
    community: communityId,
    status: "active",
  };

  // Apply additional filters from req.query
  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
    }
  }

  const sortOptions: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [members, total] = await Promise.all([
    Community_Member.find(query)
      .populate("user")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Community_Member.countDocuments(query),
  ]);

  return {
    data: members,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      totalResults: total,
    },
  };
};
export const getAllCommunities = async (req: Request) => {
  try {
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filters
    } = req.query as Record<string, string>;

    const query: Record<string, any> = {};

    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const sortOption: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const dataQuery = Community.find(query)
      .populate("createdBy")
      .sort(sortOption);

    const skip = (Number(page) - 1) * Number(limit);
    const paginatedData = await dataQuery.skip(skip).limit(Number(limit));
    const total = await Community.countDocuments(query);

    return {
      data: paginatedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        totalResults: total,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch communities");
  }
};
