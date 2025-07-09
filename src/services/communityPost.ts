import Community_Post from "../models/Community_Post.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
export const createCommunityPost = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    return { message: "User information is missing from request." };
  }
  const payload = {
    ...req.body,
    createdBy: req.user.id,
    community: req.params.communityId,
    images: req.fileUrls || [],
  };

  const community = await Community_Post.create(payload);
  return {
    message: "Community created successfully",
    community,
  };
};
