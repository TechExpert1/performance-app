import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Athlete_User from "../models/Athlete_User.js";
import Gym from "../models/Gym.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

// Get Profile
export const getProfile = async (req: AuthenticatedRequest) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new Error("User not found");

  // Initialize linked data
  let linkedProfile = null;
  let linkedProfileName = "";

  // Check if user is an athlete
  if (user.role === "athlete") {
    linkedProfile = await Athlete_User.findOne({ userId: user._id })
      .populate("skillLevel sports")
      .lean();
    linkedProfileName = "profile"; // Change key name to "profile" for athletes
  }
  // Check if user is a gym owner
  if (user.role === "gymOwner") {
    linkedProfile = await Gym.findOne({ owner: user._id })
      .populate("sport")
      .lean();
    linkedProfileName = "gymDetails"; // Change key name to "gymDetails" for gym owners
  }

  // Dynamically set the response
  const response = {
    user,
    [linkedProfileName]: linkedProfile, // Dynamically assign the correct field name
  };

  return response;
};

// Update Profile
export const updateProfile = async (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("User not authenticated");

  const updateData: any = { ...req.body };

  // If password is being updated
  if (req.body.password) {
    updateData.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!updatedUser) throw new Error("Failed to update profile");

  return updatedUser;
};

// Delete Profile
export const deleteProfile = async (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("User not authenticated");

  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser) throw new Error("Failed to delete profile");

  return { message: "Profile deleted successfully" };
};

// Update Profile Image
export const updateProfileImage = async (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("User not authenticated");

  if (!(req as any).fileUrls?.profile?.[0]) {
    throw new Error("Profile image not provided");
  }
  console.log(req?.fileUrls?.icons);
  const profileImage = (req as any).fileUrls.profile[0];

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { profileImage },
    { new: true }
  );

  if (!updatedUser) throw new Error("Failed to update profile image");

  return updatedUser;
};
