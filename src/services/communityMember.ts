import Community_Member from "../models/Community_Member.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { Types } from "mongoose";

export const joinCommunityRequest = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User information is missing from request.");
    }

    const { communityId } = req.params;
    const userId = req.user.id;

    // First check if a record already exists
    const existingMember = await Community_Member.findOne({
      community: communityId,
      user: userId,
    });

    if (existingMember) {
      if (existingMember.status === "pending") {
        throw new Error("Request already submitted and awaiting approval.");
      }
      if (existingMember.status === "approved") {
        throw new Error("You are already a member of this community.");
      }
    }

    // If no record found, create a new request with status pending
    const community = await Community_Member.create({
      community: communityId,
      user: userId,
      status: "pending",
    });

    return {
      message: "Request sent successfully to community admin",
      community,
    };
  } catch (error) {
    console.error("Error in joinCommunityRequest:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to join community."
    );
  }
};

export const handleAddMembers = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User information is missing from request.");
    }

    const { communityId } = req.params;
    const { members } = req.body; // expecting an array of userIds

    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("Members array is required and should not be empty.");
    }

    // Prepare bulk insert data
    const newMembers = members.map((memberId: string) => ({
      community: communityId,
      user: memberId,
      status: "approved",
    }));

    // Insert while avoiding duplicates
    const addedMembers = [];
    for (const member of newMembers) {
      const exists = await Community_Member.findOne({
        community: communityId,
        user: member.user,
      });

      if (!exists) {
        const created = await Community_Member.create(member);
        addedMembers.push(created);
      }
    }

    return {
      message: "Members added successfully.",
      members: addedMembers,
    };
  } catch (error) {
    console.error("Error in handleAddMembers:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add members."
    );
  }
};

export const updateCommunityMemberStatus = async (
  req: AuthenticatedRequest
) => {
  const id = req.params.requestId;
  const { status } = req.query;

  if (!status) {
    throw new Error("Status is required in query.");
  }

  if (!req.user) {
    throw new Error("Unauthorized: No user in request.");
  }

  const member = await Community_Member.findById(id).populate<{
    community: { createdBy: Types.ObjectId };
  }>("community", "createdBy");

  if (!member) {
    throw new Error("Community member not found.");
  }

  const userId = req.user.id.toString();
  const userRole = req.user.role;

  const isSalesRepOrSuperAdmin =
    userRole === "salesRep" || userRole === "superAdmin";

  const isCommunityCreator =
    member.community &&
    "createdBy" in member.community &&
    member.community.createdBy.toString() === userId;

  if (!isSalesRepOrSuperAdmin && !isCommunityCreator) {
    throw new Error(
      "Unauthorized: You do not have permission to update this member."
    );
  }

  member.status = status as string;
  await member.save();

  return {
    message: "Member status updated successfully.",
    member,
  };
};

export const leaveCommunity = async (req: AuthenticatedRequest) => {
  const community = req.params.communityId;

  if (!req.user) {
    throw new Error("Unauthorized: No user in request.");
  }

  const member = await Community_Member.findOne({
    community,
    user: req.user.id,
    status: "approved",
  }).populate<{
    community: { createdBy: Types.ObjectId };
  }>("community", "createdBy");

  if (!member) {
    throw new Error("You are not a member of this community.");
  }

  member.status = "left";
  await member.save();

  return {
    message: "Community left successfully.",
    member,
  };
};
