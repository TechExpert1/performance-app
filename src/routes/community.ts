import express from "express";
import { CommunityController } from "../controllers/community.js";
import { communityPostController } from "../controllers/communityPost.js";
import { communityMemberController } from "../controllers/communityMember.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { gymOwnerAuth } from "../middlewares/gymOwner.js";
import { userAuth } from "../middlewares/user.js";
const router = express.Router();

router.post(
  "/",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  CommunityController.create
);
router.patch(
  "/:id",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  CommunityController.update
);
router.delete("/:id", gymOwnerAuth, CommunityController.remove);
router.get("/:id", userAuth, CommunityController.getById);
router.get("/:id/requests", gymOwnerAuth, CommunityController.getRequests);
router.get("/:id/members", userAuth, CommunityController.getMembers);
router.get("/", CommunityController.getAll);

// posts
router.post(
  "/:communityId/posts",
  userAuth,
  newMulterUpload,
  uploadMultipleToS3,
  communityPostController.create
);
router.get("/:communityId/posts", communityPostController.getAll);

// reaction
router.post(
  "/:communityId/posts/:postId/reactions",
  userAuth,
  communityPostController.postReaction
);
router.post(
  "/:communityId/posts/:postId/comments",
  userAuth,
  communityPostController.postComment
);

// members
router.get(
  "/:communityId/member-request",
  userAuth,
  communityMemberController.join
);

router.get(
  "/:communityId/leave",
  userAuth,
  communityMemberController.leftCommunity
);

router.get(
  "/:communityId/status-update/:requestId",
  gymOwnerAuth,
  communityMemberController.updateMemberStatus
);
export default router;
