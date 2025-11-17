import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Member_Awaiting from "../models/Member_Awaiting.js";
import Athlete_User from "../models/Athlete_User.js";
import Gym from "../models/Gym.js";
import Friend_Request from "../models/Friend_Request.js";
import FriendRequest from "../models/Friend_Request.js";
import Notification from "../models/Notification.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { Request } from "express";
import Gym_Member from "../models/Gym_Member.js";
import { transporter } from "../utils/nodeMailer.js";
import { kgToLb, cmToInches } from "../utils/functions.js";

// Get Profile
export const getProfile = async (req: Request) => {
  const user = await User.findById(req.params.id)
    .populate("gym friends")
    .lean();
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

  // If gym owner is being approved, set firstTimeLogin to true
  if (
    targetUser.role === "gymOwner" &&
    userData.adminStatus === "approved" &&
    targetUser.adminStatus !== "approved"
  ) {
    userData.firstTimeLogin = true;
  }

  // Update the main User model
  const updatedUser = await User.findByIdAndUpdate(userId, userData, {
    new: true,
    runValidators: true,
  }).lean();

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
      { new: true, runValidators: true }
    ).lean();

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

  const { email, name, address, contact, gym } = req.body;

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
    createdBy: req.user.id,
    email,
    name,
    address,
    contact,
    code,
    gym,
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Gym verification code",
    text: `Use this verification code to join gym: ${code}`,
  };
  await transporter.sendMail(mailOptions);
  return awaitingMember;
};

// Update Athlete Profile - My Account Screen
export const updateAthleteProfile = async (req: AuthenticatedRequest) => {
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }

  const userId = req.user.id;
  const {
    // Personal Information
    name,
    email,
    phoneNumber,
    dob,
    gender,
    nationality,
    // Athlete Details
    height,
    weight,
    sportsAndSkillLevels,
  } = req.body;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if email is being updated and if it already exists
  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("Email already in use");
    }
  }

  // Prepare user update data
  const userUpdateData: any = {};
  if (name) userUpdateData.name = name;
  if (email) userUpdateData.email = email;
  if (phoneNumber) userUpdateData.phoneNumber = phoneNumber;
  if (dob) userUpdateData.dob = dob;
  if (gender) userUpdateData.gender = gender;
  if (nationality) userUpdateData.nationality = nationality;

  // Update User
  const updatedUser = await User.findByIdAndUpdate(userId, userUpdateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updatedUser) {
    throw new Error("Failed to update user information");
  }

  // Update Athlete Details
  let updatedAthlete = null;
  if (user.role === "athlete") {
    const athleteUpdateData: any = {};

    if (height || weight) {
      if (height) {
        athleteUpdateData["height.cm"] = height;
        athleteUpdateData["height.inches"] = cmToInches(height);
      }
      if (weight) {
        athleteUpdateData["weight.kg"] = weight;
        athleteUpdateData["weight.lbs"] = kgToLb(weight);
      }
    }

    if (sportsAndSkillLevels && Array.isArray(sportsAndSkillLevels)) {
      athleteUpdateData.sportsAndSkillLevels = sportsAndSkillLevels;
    }

    if (Object.keys(athleteUpdateData).length > 0) {
      // Use upsert to create document if it doesn't exist (e.g., for Google/Apple login users)
      updatedAthlete = await Athlete_User.findOneAndUpdate(
        { userId },
        athleteUpdateData,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      )
        .populate("sportsAndSkillLevels.sport", "name")
        .populate("sportsAndSkillLevels.skillSetLevel", "level")
        .lean();

      if (!updatedAthlete) {
        throw new Error("Failed to update athlete details");
      }
    }
  }

  return {
    message: "Athlete profile updated successfully",
    data: {
      user: updatedUser,
      athleteDetails: updatedAthlete,
    },
  };
};

// Update Preferences - Change Units Screen (for both athletes and gym owners)
export const updatePreferences = async (req: AuthenticatedRequest) => {
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }

  const userId = req.user.id;
  const { preference } = req.body;

  // Validate preference object exists
  if (!preference || typeof preference !== "object") {
    throw new Error("Preference object is required");
  }

  const { height, weight, distance } = preference;

  // Validate at least one preference is provided
  if (!height && !weight && !distance) {
    throw new Error("At least one preference must be provided");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prepare preference updates
  const userUpdateData: any = {};

  if (height) {
    if (!["cm", "inches"].includes(height)) {
      throw new Error("Invalid height preference. Must be 'cm' or 'inches'");
    }
    userUpdateData["preference.height"] = height;
  }

  if (weight) {
    if (!["kg", "lbs"].includes(weight)) {
      throw new Error("Invalid weight preference. Must be 'kg' or 'lbs'");
    }
    userUpdateData["preference.weight"] = weight;
  }

  if (distance) {
    if (!["km", "miles"].includes(distance)) {
      throw new Error("Invalid distance preference. Must be 'km' or 'miles'");
    }
    userUpdateData["preference.distance"] = distance;
  }

  // Update User preferences
  const updatedUser = await User.findByIdAndUpdate(userId, userUpdateData, {
    new: true,
    runValidators: true,
  })
    .select("name email role preference")
    .lean();

  if (!updatedUser) {
    throw new Error("Failed to update preferences");
  }

  return {
    message: "Preferences updated successfully",
    data: updatedUser,
  };
};

// Update Gym Owner Profile - Personal Information + Gym Information + Identity Verification
export const updateGymOwnerProfile = async (req: AuthenticatedRequest) => {
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }

  const userId = req.user.id;
  const {
    // Personal Information
    name,
    email,
    phoneNumber,
    dob,
    gender,
    nationality,
    // Gym Information
    gymName,
    address,
    registration,
    cnic,
    sport,
    // Delete file keys
    deletePersonalIdentification,
    deleteProofOfBusiness,
    deleteGymImages,
  } = req.body;

  // Check if user exists and is gym owner
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "gymOwner") {
    throw new Error("Only gym owners can update gym profile");
  }

  // Check if email is being updated and if it already exists
  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("Email already in use");
    }
  }

  // Prepare user update data
  const userUpdateData: any = {};
  if (name) userUpdateData.name = name;
  if (email) userUpdateData.email = email;
  if (phoneNumber) userUpdateData.phoneNumber = phoneNumber;
  if (dob) userUpdateData.dob = dob;
  if (gender) userUpdateData.gender = gender;
  if (nationality) userUpdateData.nationality = nationality;

  // Update User
  const updatedUser = await User.findByIdAndUpdate(userId, userUpdateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updatedUser) {
    throw new Error("Failed to update personal information");
  }

  // Fetch existing gym to handle file deletions and appends
  let existingGym = await Gym.findOne({ owner: userId });
  if (!existingGym) {
    throw new Error("Gym not found for this owner");
  }

  // Prepare update data
  const gymUpdateData: any = {};
  if (gymName) gymUpdateData.name = gymName;
  if (address) gymUpdateData.address = address;
  if (registration) gymUpdateData.registration = registration;
  if (cnic) gymUpdateData.cnic = cnic;
  if (sport && Array.isArray(sport)) gymUpdateData.sport = sport;

  // Handle file deletions (remove specific URLs from arrays)
  if (deletePersonalIdentification) {
    const urlsToDelete = Array.isArray(deletePersonalIdentification)
      ? deletePersonalIdentification
      : [deletePersonalIdentification];
    gymUpdateData.personalIdentification = (
      existingGym.personalIdentification || []
    ).filter((url: string) => !urlsToDelete.includes(url));
  }

  if (deleteProofOfBusiness) {
    const urlsToDelete = Array.isArray(deleteProofOfBusiness)
      ? deleteProofOfBusiness
      : [deleteProofOfBusiness];
    gymUpdateData.proofOfBusiness = (existingGym.proofOfBusiness || []).filter(
      (url: string) => !urlsToDelete.includes(url)
    );
  }

  if (deleteGymImages) {
    const urlsToDelete = Array.isArray(deleteGymImages)
      ? deleteGymImages
      : [deleteGymImages];
    gymUpdateData.gymImages = (existingGym.gymImages || []).filter(
      (url: string) => !urlsToDelete.includes(url)
    );
  }

  // Handle new file uploads (append to existing, not replace)
  if ((req as any).fileUrls) {
    if ((req as any).fileUrls.personalIdentification) {
      const existingIds = existingGym.personalIdentification || [];
      gymUpdateData.personalIdentification = [
        ...existingIds,
        ...(req as any).fileUrls.personalIdentification,
      ];
    }
    if ((req as any).fileUrls.proofOfBusiness) {
      const existingProof = existingGym.proofOfBusiness || [];
      gymUpdateData.proofOfBusiness = [
        ...existingProof,
        ...(req as any).fileUrls.proofOfBusiness,
      ];
    }
    if ((req as any).fileUrls.gymImages) {
      const existingImages = existingGym.gymImages || [];
      gymUpdateData.gymImages = [
        ...existingImages,
        ...(req as any).fileUrls.gymImages,
      ];
    }
  }

  let updatedGym = null;
  if (Object.keys(gymUpdateData).length > 0) {
    updatedGym = await Gym.findOneAndUpdate(
      { owner: userId },
      gymUpdateData,
      { new: true, runValidators: true }
    )
      .populate("sport", "name")
      .lean();

    if (!updatedGym) {
      throw new Error("Failed to update gym information");
    }
  } else {
    // Fetch existing gym if no updates
    updatedGym = await Gym.findOne({ owner: userId })
      .populate("sport", "name")
      .lean();
  }

  return {
    message: "Gym owner profile updated successfully",
    data: {
      user: updatedUser,
      gymDetails: updatedGym,
    },
  };
};

// Update Gym Owner Preferences - Change Units Screen
// Get Authenticated User Profile
export const getAuthenticatedUserProfile = async (
  req: AuthenticatedRequest
) => {
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }

  const userId = req.user.id;

  // Fetch user with all relations
  const user = await User.findById(userId)
    .populate("gym friends")
    .select(
      "name email phoneNumber gender dob nationality role profileImage preference createdAt updatedAt gym"
    )
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  let linkedProfile: any = null;
  let profileType = "";

  // If athlete - get athlete details
  if (user.role === "athlete") {
    linkedProfile = await Athlete_User.findOne({ userId })
      .populate({
        path: "sportsAndSkillLevels.sport",
        select: "name",
      })
      .populate({
        path: "sportsAndSkillLevels.skillSetLevel",
        select: "level",
      })
      .lean();
    profileType = "athleteDetails";
  }

  // If gym owner - get gym details
  if (user.role === "gymOwner") {
    linkedProfile = await Gym.findOne({ owner: userId })
      .populate("sport", "name")
      .lean();
    profileType = "gymDetails";
  }

  // If coach - get gym details (coaches belong to a gym)
  if (user.role === "coach") {
    if (user.gym) {
      linkedProfile = await Gym.findById(user.gym)
        .populate("sport", "name")
        .lean();
      profileType = "gymDetails";
    }
  }

  const response: any = {
    user,
  };

  if (linkedProfile) {
    response[profileType] = linkedProfile;
  }

  return {
    message: "User profile retrieved successfully",
    data: response,
  };
};

// Get Friends List and Friend Requests in one API
export const getFriendsAndRequests = async (req: AuthenticatedRequest) => {
  if (!req.user || !req.user.id) {
    throw new Error("User not authenticated");
  }

  const userId = req.user.id;

  // Get user with populated friends
  const user = await User.findById(userId)
    .populate({
      path: "friends",
      select: "name email profileImage role",
    })
    .select("friends")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  // Get received friend requests (pending only)
  const receivedRequests = await FriendRequest.find({
    receiver: userId,
    status: "pending",
  })
    .populate({
      path: "sender",
      select: "name email profileImage role",
    })
    .sort({ createdAt: -1 })
    .lean();

  return {
    message: "Friends and requests retrieved successfully",
    data: {
      friends: user.friends || [],
      requests: receivedRequests,
    },
  };
};

