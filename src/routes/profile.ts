import express from "express";
import { ProfileController } from "../controllers/profile.js";
import { userAuth } from "../middlewares/user.js";
import { gymOwnerAuth } from "../middlewares/gymOwner.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";

const router = express.Router();

// Get authenticated user's own profile
router.get(
  "/me/profile",
  userAuth,
  ProfileController.getAuthenticatedProfile
);

// Update Preferences - Change Units Screen (for both athletes and gym owners)
router.put(
  "/update-preferences",
  userAuth,
  ProfileController.updatePreferences
);

// Athlete Profile Update - My Account Screen
router.put(
  "/athlete/update-profile",
  userAuth,
  ProfileController.updateAthleteProfile
);

// Gym Owner Profile Update - Personal Information + Gym Information + Identity Verification
router.put(
  "/gym-owner/update-profile",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  ProfileController.updateGymOwnerProfile
);

// Add gym member
router.post(
  "/add-gym-awaiting-member",
  gymOwnerAuth,
  ProfileController.addGymAwaitingMember
);

// Profile Routes with :id parameter (must come after specific routes)
router.get("/:id", ProfileController.get);
router.get(
  "/:receiverId/friend-request",
  userAuth,
  ProfileController.sendFriendRequest
);
router.get(
  "/:id/update-friend-request",
  userAuth,
  ProfileController.updateFriendRequestStatus
);
router.get("/:id/notifications", ProfileController.getNotifications);
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
