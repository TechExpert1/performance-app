import Community_Member from "../models/Community_Member.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
export const joinCommunityRequest = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    return { message: "User information is missing from request." };
  }
  const payload = {
    community: req.params.communityId,
    user: req.user.id,
  };

  const community = await Community_Member.create(payload);
  return {
    message: "Request sent successfully to community admin",
    community,
  };
};
