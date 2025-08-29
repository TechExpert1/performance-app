import { userChallengeController } from "../controllers/userChallenge.js";
import { userAuth } from "./../middlewares/user.js";
import { gymOwnerAuth } from "./../middlewares/gymOwner.js";
import express from "express";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
const router = express.Router();

router.post("/", userAuth, userChallengeController.create);
router.patch(
  "/:id",
  userAuth,
  newMulterUpload,
  uploadMultipleToS3,
  userChallengeController.update
);
router.patch(
  "/:id/update-submission/:submissionId",
  gymOwnerAuth,
  userChallengeController.updateSubmission
);
router.delete("/:id", userAuth, userChallengeController.remove);
router.get("/:id", userChallengeController.getById);
router.get("/", userChallengeController.getAll);

export default router;
