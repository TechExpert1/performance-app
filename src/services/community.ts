import { Request } from "express";
import Community from "../models/Community.js";
import User from "../models/User.js";
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
    gym: req.query.gym,
  };
  if (
    req.fileUrls &&
    Array.isArray(req.fileUrls.image) &&
    req.fileUrls.image.length > 0
  ) {
    payload.image = req.fileUrls.image[0];
  }
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

  const [totalMembers, totalPosts, members] = await Promise.all([
    Community_Member.countDocuments({
      community: communityId,
      status: "approved",
    }),
    Community_Post.countDocuments({ community: communityId }),

    Community_Member.find({
      community: communityId,
      status: "approved",
    }).populate("user"),
  ]);
  const memberUsers = members.map((m) => m.user);
  let isRequested = false;

  if (req.user?.id) {
    const pendingRequest = await Community_Member.findOne({
      community: communityId,
      user: req.user.id,
      status: "pending",
    });
    isRequested = !!pendingRequest;
  }
  return {
    ...found.toObject(),
    totalMembers,
    totalPosts,
    members: memberUsers,
    isRequested,
  };
};

export const handleGetRequests = async (req: AuthenticatedRequest) => {
  const communityId = req.params.id;

  const found = await Community.findById(communityId);
  if (!found) throw new Error("Community not found");
  if (found.createdBy.toString() !== req.user?.id) {
    throw new Error("Unauthorized to get requests for this community");
  }
  const requests = await Community_Member.find({
    community: communityId,
    status: "pending",
  }).populate("user");

  return { requests };
};

export const getActiveMembersOfCommunity = async (
  req: AuthenticatedRequest
) => {
  const communityId = req.params.id;
  const userId = req.user?.id;

  const {
    page = "1",
    limit = "20",
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {
    community: communityId,
    status: "approved",
  };

  // Apply extra filters
  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
    }
  }

  const sortOptions: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const skip = (Number(page) - 1) * Number(limit);

  // Get login user's friends once
  const loginUser = await User.findById(userId).select("friends");
  const friendIds = loginUser?.friends?.map((f) => f.toString()) || [];

  const [members, total] = await Promise.all([
    Community_Member.find(query)
      .populate("user") // so we have user info
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Community_Member.countDocuments(query),
  ]);

  // Add isFriend flag to each member
  const membersWithFriendFlag = members.map((member) => {
    const memberUserId = member.user?._id?.toString();
    return {
      ...member.toObject(),
      isFriend: memberUserId ? friendIds.includes(memberUserId) : false,
    };
  });

  return {
    data: membersWithFriendFlag,
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
      page,
      limit,
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

    // Fetch communities with/without pagination
    let communities: any[] = [];
    let total = 0;

    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      communities = await Community.find(query)
        .populate("createdBy")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

      total = await Community.countDocuments(query);
    } else {
      communities = await Community.find(query)
        .populate("createdBy")
        .sort(sortOption);
    }

    // Add members & totalMembers for each community
    const enrichedCommunities = await Promise.all(
      communities.map(async (community) => {
        const [totalMembers, members] = await Promise.all([
          Community_Member.countDocuments({
            community: community._id,
            status: "approved",
          }),
          Community_Member.find({
            community: community._id,
            status: "approved",
          }).populate("user"),
        ]);

        const memberUsers = members.map((m) => m.user);

        return {
          ...community.toObject(),
          totalMembers,
          members: memberUsers,
        };
      })
    );

    if (page && limit) {
      return {
        data: enrichedCommunities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          totalResults: total,
        },
      };
    } else {
      const grouped = {
        public: enrichedCommunities.filter((comm) => comm.scope === "public"),
        private: enrichedCommunities.filter((comm) => comm.scope === "private"),
      };
      return { data: grouped };
    }
  } catch (error) {
    throw new Error("Failed to fetch communities");
  }
};
