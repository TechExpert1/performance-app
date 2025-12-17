import { Request } from "express";
import Community from "../models/Community.js";
import User from "../models/User.js";
import Community_Member from "../models/Community_Member.js";
import Community_Post from "../models/Community_Post.js";
import FriendRequest from "../models/Friend_Request.js";
import Athlete_User from "../models/Athlete_User.js";
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
  };
  if (
    req.fileUrls &&
    Array.isArray(req.fileUrls.image) &&
    req.fileUrls.image.length > 0
  ) {
    payload.image = req.fileUrls.image[0];
  }
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
  
  // Determine request status: accepted, pending, or notSent
  let requestStatus = "notSent";
  if (req.user?.id) {
    const memberRecord = await Community_Member.findOne({
      community: communityId,
      user: req.user.id,
    });
    if (memberRecord) {
      if (memberRecord.status === "approved") {
        requestStatus = "accepted";
      } else if (memberRecord.status === "pending") {
        requestStatus = "pending";
      }
      // For "rejected" or any other status, keep as "notSent"
    }
  }
  return {
    ...found.toObject(),
    totalMembers,
    totalPosts,
    members: memberUsers,
    requestStatus,
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

  const loginUser = await User.findById(userId).select("friends");
  const friendIds = loginUser?.friends?.map((f) => f.toString()) || [];

  const [members, total] = await Promise.all([
    Community_Member.find(query)
      .populate("user")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Community_Member.countDocuments(query),
  ]);

  const userIds = members.map((m) => m.user?._id).filter(Boolean);
  const athleteProfiles = await Athlete_User.find({ userId: { $in: userIds } })
    .populate("sportsAndSkillLevels.sport")
    .populate("sportsAndSkillLevels.skillSetLevel");

  // Get pending friend requests between current user and member users
  const pendingRequests = await FriendRequest.find({
    $or: [
      { sender: userId, receiver: { $in: userIds }, status: "pending" },
      { receiver: userId, sender: { $in: userIds }, status: "pending" }
    ]
  }).lean();

  // Create sets for quick lookup
  const requestedUserIds = new Set(
    pendingRequests.map(req => 
      req.sender.toString() === userId 
        ? req.receiver.toString() 
        : req.sender.toString()
    )
  );

  const profileMap = new Map(
    athleteProfiles.map((p) => [p.userId.toString(), p.toObject()])
  );

  const membersWithFriendAndProfile = members.map((member) => {
    const memberObj = member.toObject();
    const memberUserId = member.user?._id?.toString();

    return {
      ...memberObj,
      isFriend: memberUserId ? friendIds.includes(memberUserId) : false,
      inRequested: memberUserId ? requestedUserIds.has(memberUserId) : false,
      user: {
        ...memberObj.user,
        athleteProfile: memberUserId
          ? profileMap.get(memberUserId) || null
          : null,
      },
    };
  });

  return {
    data: membersWithFriendAndProfile,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      totalResults: total,
    },
  };
};

export const getAllCommunities = async (req: AuthenticatedRequest) => {
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

    // Get authenticated user ID
    const userId = req.user?.id;

    // Add members, totalMembers, and requestStatus for each community
    const enrichedCommunities = await Promise.all(
      communities.map(async (community) => {
        const [totalMembers, members, memberRecord] = await Promise.all([
          Community_Member.countDocuments({
            community: community._id,
            status: "approved",
          }),
          Community_Member.find({
            community: community._id,
            status: "approved",
          }).populate("user"),
          // Check current user's membership status for this community
          userId
            ? Community_Member.findOne({
                community: community._id,
                user: userId,
              })
            : null,
        ]);

        const memberUsers = members.map((m) => m.user);

        // Determine request status: accepted, pending, or notSent
        let requestStatus = "notSent";
        if (memberRecord) {
          if (memberRecord.status === "approved") {
            requestStatus = "accepted";
          } else if (memberRecord.status === "pending") {
            requestStatus = "pending";
          }
          // For "rejected" or any other status, keep as "notSent"
        }

        return {
          ...community.toObject(),
          totalMembers,
          members: memberUsers,
          requestStatus,
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
