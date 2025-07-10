import { Request } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
export const createCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return { message: "Gym owner information is missing from request." };
    }
    const data = {
      gymOwner: req.user.id,
      ...req.body,
      profileImage: (req as any).fileUrls.profile[0],
    };
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
      { _id: id, gymOwner: req.user.id }, // ensure gym owner can only update their own coach
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

// Get All Coaches with Pagination and Sorting
export const getAllCoachs = async (req: Request) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;

    const filter: any = { role: "coach" };

    const total = await User.countDocuments(filter);

    const coaches = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    return {
      data: coaches,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
    };
  } catch (error) {
    console.error("Error in getAllCoachs:", error);
    throw error;
  }
};
