import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Athlete_User from "../models/Athlete_User.js";
import Gym from "../models/Gym.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { Request } from "express";
// Get Profile
export const getProfile = async (req: Request) => {
  const user = await User.findById(req.params.id).populate("gym friends");
  if (!user) throw new Error("User not found");

  // Initialize linked data
  let linkedProfile = null;
  let linkedProfileName = "";

  // Check if user is an athlete
  if (user.role === "athlete") {
    linkedProfile = await Athlete_User.findOne({ userId: req.params.id })
      .populate("skillLevel sports")
      .lean();
    linkedProfileName = "profile";
  }
  if (user.role === "gymOwner") {
    linkedProfile = await Gym.findOne({ owner: req.params.id })
      .populate("sport")
      .lean();
    linkedProfileName = "gymDetails";
  }

  const response = {
    user,
    [linkedProfileName]: linkedProfile,
  };

  return response;
};

export const updateProfile = async (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("User not authenticated");

  const userId = req.params.id;

  // Destructure the user and athlete_details from the request body
  const { user: userData = {}, athlete_details = {} } = req.body;

  // Handle password hashing if included
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  // Update the main User model
  const updatedUser = await User.findByIdAndUpdate(userId, userData, {
    new: true,
  });

  if (!updatedUser) {
    throw new Error("Failed to update user profile");
  }

  let updatedAthlete = null;

  // If the user is an athlete and athlete_details are provided
  if (
    updatedUser.role === "athlete" &&
    Object.keys(athlete_details).length > 0
  ) {
    updatedAthlete = await Athlete_User.findOneAndUpdate(
      { userId }, // assuming athlete profile links via `userId`
      athlete_details,
      { new: true }
    );

    if (!updatedAthlete) {
      throw new Error("Failed to update athlete profile");
    }
  }

  return {
    message: "Profile updated successfully",
    user: updatedUser,
    athlete: updatedAthlete,
  };
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
