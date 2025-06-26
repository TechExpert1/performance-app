import { userChallengeController } from "../controllers/userChallenge.js";
import { userAuth } from "./../middlewares/user.js";
import express from "express";
import { multerUpload, uploadSingleToS3 } from "../helpers/s3Utils.js";
const router = express.Router();

router.post("/", userAuth, userChallengeController.create);
router.patch(
  "/:id",
  userAuth,
  multerUpload.single("file"),
  uploadSingleToS3,
  userChallengeController.update
);
router.delete("/:id", userAuth, userChallengeController.remove);
router.get("/:id", userChallengeController.getById);
router.get("/", userChallengeController.getAll);

export default router;
