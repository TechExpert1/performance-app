import { Request } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { SortOrder } from "mongoose";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";
export const createCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return { message: "Gym owner information is missing from request." };
    }
    const data = {
      ...req.body,
      profileImage: (req as any).fileUrls?.profile?.[0] || "",
    };
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return { message: "User with this email already exists" };
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    data.password = hashedPassword;
    const coach = await User.create(data);
    return coach;
  } catch (error) {
    console.error("Error in createCoach:", error);
    throw error;
  }
};

// Update a Coach
export const updateCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Gym owner information is missing from request.");
    }

    const { id } = req.params; // Coach ID to update
    const updateData: any = {
      ...req.body,
    };

    // If profile image was uploaded
    if ((req as any).fileUrls?.profile) {
      updateData.profileImage = (req as any).fileUrls.profile[0];
    }

    // If password is being updated, hash it
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedCoach = await User.findOneAndUpdate(
      { _id: id }, // ensure gym owner can only update their own coach
      updateData,
      { new: true }
    );

    if (!updatedCoach) {
      throw new Error("Coach not found or you're not authorized to update.");
    }

    return updatedCoach;
  } catch (error) {
    console.error("Error in updateCoach:", error);
    throw error;
  }
};
// Delete a Coach
export const removeCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Gym owner authentication missing");
    }

    const { id } = req.params;

    const removed = await User.findOneAndDelete({
      _id: id,
      gymOwner: req.user.id,
    });

    if (!removed) {
      throw new Error(
        "Coach not found or you're not authorized to delete this coach"
      );
    }

    return { message: "Coach removed successfully" };
  } catch (error) {
    console.error("Error in removeCoach:", error);
    throw error;
  }
};

// Get Coach by ID
export const getCoachById = async (req: Request) => {
  try {
    const coach = await User.findById(req.params.id).populate("gymOwner");
    if (!coach) throw new Error("Coach not found");

    return coach;
  } catch (error) {
    console.error("Error in getCoachById:", error);
    throw error;
  }
};

export const getAllMembers = async (req: Request) => {
  try {
    const coachId = req.params.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      User.find({ coach: coachId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ coach: coachId }),
    ]);

    return {
      members,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error in getAllMembers:", error);
    throw error;
  }
};
export const handleAssignMember = async (req: Request) => {
  try {
    if (req.user?.role === "coach")
      throw new Error(
        "Not authorized, only gym owner can perform this operation"
      );
    const coach = await User.findById(req.params.id);
    if (!coach) throw new Error("Coach not found");
    const user = await User.findById(req.body.userId);
    if (!user) throw new Error("User not found");
    if (user?.coach) {
      throw new Error("User has already assigined with a coach");
    } else {
      user.coach = new mongoose.Types.ObjectId(req.params.id);
      await user.save();
    }
    await Notification.create({
      user: coach._id,
      message: `${user.name} has been assigned to you for coaching.`,
      entityType: "assing_member_to_coach",
      entityId: user._id,
      isRead: false,
    });

    // Push notification
    // if (coach.deviceToken) {
    //   await sendPushNotification(
    //     coach.deviceToken,
    //     "New member assigned",
    //     `${user.name} has been assigned to you for coaching.`,
    //     String(user._id),
    //     "assing_member_to_coach"
    //   );
    // }
    return user;
  } catch (error) {
    console.error("Error in getCoachById:", error);
    throw error;
  }
};

export const getAllCoachs = async (req: Request) => {
  try {
    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filters
    } = req.query as Record<string, string>;

    const query: Record<string, any> = {
      role: "coach",
    };

    // Apply dynamic filters if any
    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    let coaches, total;

    // If pagination is requested
    if (page || limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      [coaches, total] = await Promise.all([
        User.find(query).sort(sortOptions).skip(skip).limit(limitNum),
        User.countDocuments(query),
      ]);

      return {
        data: coaches,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          totalResults: total,
        },
      };
    } else {
      // Return all coaches without pagination
      coaches = await User.find(query).sort(sortOptions);

      return {
        data: coaches,
        pagination: null, // optional
      };
    }
  } catch (error) {
    console.error("Error in getAllCoachs:", error);
    throw error;
  }
};
