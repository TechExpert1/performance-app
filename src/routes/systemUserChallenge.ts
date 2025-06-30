import { SystemUserChallengeController } from "../controllers/systemUserChallenge.js";
import { userAuth } from "./../middlewares/user.js";
import express from "express";
import { multerUpload, uploadSingleToS3 } from "../helpers/s3Utils.js";
const router = express.Router();

router.post("/", userAuth, SystemUserChallengeController.create);
router.patch(
  "/:id",
  userAuth,
  multerUpload.single("file"),
  uploadSingleToS3,
  SystemUserChallengeController.update
);
// router.delete("/:id", userAuth, userChallengeController.remove);
// router.get("/:id", userChallengeController.getById);
router.get("/", userAuth, SystemUserChallengeController.getAll);
router.get("/stats", userAuth, SystemUserChallengeController.stats);

export default router;
