import Community_Member from "../models/Community_Member.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

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

  const updatedMember = await Community_Member.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!updatedMember) {
    throw new Error("Community member not found.");
  }

  return {
    message: "Member status updated successfully.",
    member: updatedMember,
  };
};
