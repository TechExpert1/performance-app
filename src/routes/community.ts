import express from "express";
import { communityController } from "../controllers/community.js";
import { communityPostController } from "../controllers/communityPost.js";
import { communityMemberController } from "../controllers/communityMember.js";
import {
  multerUpload,
  uploadSingleToS3,
  uploadMultipleToS3,
} from "../helpers/s3Utils.js";
import { gymOwnerAuth } from "../middlewares/gymOwner.js";
import { userAuth } from "../middlewares/user.js";
const router = express.Router();

router.post(
  "/",
  gymOwnerAuth,
  multerUpload.single("image"),
  uploadSingleToS3,
  communityController.create
);
router.patch(
  "/:id",
  gymOwnerAuth,
  multerUpload.single("image"),
  uploadSingleToS3,
  communityController.update
);
router.delete("/:id", gymOwnerAuth, communityController.remove);
router.get("/:id/requests", gymOwnerAuth, communityController.getRequests);
router.get("/:id/members", communityController.getMembers);
router.get("/", communityController.getAll);

// posts
router.post(
  "/:communityId/posts",
  userAuth,
  multerUpload.array("images"),
  uploadMultipleToS3,
  communityPostController.create
);

// members
router.get(
  "/:communityId/member-request",
  userAuth,
  communityMemberController.join
);

router.get(
  "/:communityId/status-update/:requestId",
  gymOwnerAuth,
  communityMemberController.updateMemberStatus
);
export default router;
