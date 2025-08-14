import Community_Member from "../models/Community_Member.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { Types } from "mongoose";

export const joinCommunityRequest = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    return { message: "User information is missing from request." };
  }

  const filter = {
    community: req.params.communityId,
    user: req.user.id,
  };

  const update = {
    $setOnInsert: {
      community: req.params.communityId,
      user: req.user.id,
    },
  };

  const options = {
    upsert: true,
    new: true,
  };

  const community = await Community_Member.findOneAndUpdate(
    filter,
    update,
    options
  );

  return {
    message: "Request sent successfully to community admin",
    community,
  };
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
