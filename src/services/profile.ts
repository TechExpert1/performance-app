import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Member_Awaiting from "../models/Member_Awaiting.js";
import Athlete_User from "../models/Athlete_User.js";
import Gym from "../models/Gym.js";
import Friend_Request from "../models/Friend_Request.js";
import Notification from "../models/Notification.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { Request } from "express";
import Gym_Member from "../models/Gym_Member.js";
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
      .populate({
        path: "sportsAndSkillLevels.sport",
        model: "Sport",
      })
      .populate({
        path: "sportsAndSkillLevels.skillSetLevel",
        model: "Skill_Set_Level",
      })
      .lean();
    linkedProfileName = "athleteProfile";
  }
  if (user.role === "gymOwner") {
    linkedProfile = await Gym.findOne({ owner: req.params.id })
      .populate({
        path: "sport",
        populate: {
          path: "skillSet",
        },
      })
      .lean();
    linkedProfileName = "gymDetails";
  }
  const requests = await Friend_Request.find({
    receiver: req.params.id,
    status: "pending",
  }).populate("sender", "name email profileImage");
  const response = {
    user,
    requests,
    [linkedProfileName]: linkedProfile,
  };

  return response;
};

export const handleGetProfile = async (req: Request) => {
  try {
    const notifications =
      (await Notification.find({ user: req.params.id }).populate("entityId")) ||
      [];
    return notifications;
  } catch (error) {
    console.error("Error fetching profile notifications:", error);
    throw error;
  }
};

export const updateProfile = async (req: AuthenticatedRequest) => {
  if (!req.user || !req.user.id || !req.user.role) {
    throw new Error("User not authenticated");
  }

  const userId: string = req.params.id;
  const { user: userData = {}, athlete_details = {} } = req.body;

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new Error("User not found");
  }

  const requesterId: string = req.user.id;
  const requesterRole: string = req.user.role;

  const isSelf = requesterId === userId;
  const isSuperAdmin = requesterRole === "superAdmin";
  const isCreator = targetUser.createdBy?.toString() === requesterId;
  const isSalesRepAndCreator =
    requesterRole === "salesRep" &&
    targetUser.createdBy?.toString() === requesterId;

  const isAuthorized =
    isSuperAdmin || isSelf || isCreator || isSalesRepAndCreator;

  if (!isAuthorized) {
    throw new Error("Unauthorized to update this profile");
  }

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
      { userId },
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

export const deleteProfile = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user || !req.user.id || !req.user.role) {
      throw new Error("User not authenticated");
    }

    const userId: string = req.params.id;
    const requesterId: string = req.user.id;
    const requesterRole: string = req.user.role;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const isSelf = requesterId === userId;
    const isSuperAdmin = requesterRole === "superAdmin";
    const isCreator = targetUser.createdBy?.toString() === requesterId;
    const isSalesRepAndCreator =
      requesterRole === "salesRep" &&
      targetUser.createdBy?.toString() === requesterId;

    const isAuthorized =
      isSuperAdmin || isSelf || isCreator || isSalesRepAndCreator;

    if (!isAuthorized) {
      throw new Error("Unauthorized to delete this profile");
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error("Failed to delete profile");
    }

    return { message: "Profile deleted successfully" };
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw new Error(
      error instanceof Error ? error.message : "Internal Server Error"
    );
  }
};

// Update Profile Image
export const updateProfileImage = async (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("User not authenticated");

  if (!(req as any).fileUrls?.profile?.[0]) {
    throw new Error("Profile image not provided");
  }
  const profileImage = (req as any).fileUrls.profile[0];

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { profileImage },
    { new: true }
  );

  if (!updatedUser) throw new Error("Failed to update profile image");

  return updatedUser;
};
export const addGymMemberProfile = async (req: AuthenticatedRequest) => {
  if (!req.user) throw new Error("User not authenticated");

  const { email, name, address, contact } = req.body;

  if (!email) {
    throw new Error("Email is required");
  }

  const existingUser = await User.findOne({ email });
  const existingUserAwaiting = await Member_Awaiting.findOne({ email });
  if (existingUser || existingUserAwaiting) {
    throw new Error("User with this email aready exists");
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  const awaitingMember = await Member_Awaiting.create({
    email,
    name,
    address,
    contact,
    code,
  });

  return awaitingMember;
};
