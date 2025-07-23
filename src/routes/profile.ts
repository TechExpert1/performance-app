import express from "express";
import { ProfileController } from "../controllers/profile.js";
import { userAuth } from "../middlewares/user.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";

const router = express.Router();

// Profile Routes
router.get("/:id", ProfileController.get);
router.patch("/:id", userAuth, ProfileController.update);
router.delete("/:id", userAuth, ProfileController.delete);
router.patch(
  "/:id/profile-image-update",
  userAuth,
  newMulterUpload,
  uploadMultipleToS3,
  ProfileController.updateImage
);

export default router;
