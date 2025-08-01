import { Request } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { SortOrder } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
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
