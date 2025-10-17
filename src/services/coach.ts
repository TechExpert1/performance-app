import { Request } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { SortOrder } from "mongoose";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";
import Gym from "../models/Gym.js";
export const createCoach = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return { message: "Gym owner information is missing from request." };
    }
    const data = {
      ...req.body,
      profileImage: (req as any).fileUrls?.profile?.[0] || "",
      createdBy: req.user.id, // Set the creator
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

    // Find the coach first to verify ownership
    const coach = await User.findById(id);
    
    if (!coach) {
      throw new Error("Coach not found");
    }

    if (coach.role !== 'coach') {
      throw new Error("This user is not a coach");
    }

    // SuperAdmin can delete any coach
    if (req.user.role === 'superAdmin') {
      await User.findByIdAndDelete(id);
      return { message: "Coach removed successfully" };
    }

    // For gym owners and other roles, check if they created this coach or own the gym
    const ownedGyms = await Gym.find({ owner: req.user.id }).select('_id').lean();
    const gymIds = ownedGyms.map((gym: any) => gym._id.toString());
    
    const isOwner = coach.createdBy?.toString() === req.user.id || 
                    (coach.gym && gymIds.includes(coach.gym.toString()));

    if (!isOwner) {
      throw new Error("You're not authorized to delete this coach");
    }

    await User.findByIdAndDelete(id);

    return { message: "Coach removed successfully" };
  } catch (error) {
    console.error("Error in removeCoach:", error);
    throw error;
  }
};

// Get Coach by ID
export const getCoachById = async (req: Request) => {
  try {
    const coach = await User.findById(req.params.id).populate("createdBy");
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
        .select('name email profileImage phoneNumber role gym coach createdAt updatedAt')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ coach: coachId }),
    ]);

    // Convert to plain objects and ensure profileImage is always present
    const membersData = members.map(member => {
      const obj = member.toObject();
      return {
        ...obj,
        profileImage: obj.profileImage || null
      };
    });

    return {
      members: membersData,
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

export const getGymMembersWithCoachAssignment = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Authentication required");
    }

    const { coachId } = req.query;
    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    if (!coachId || typeof coachId !== 'string') {
      throw new Error("coachId query parameter is required");
    }

    // Find all gyms owned by or associated with the authenticated user
    let gymIds: string[] = [];
    
    if (req.user.role === 'gymOwner') {
      const ownedGyms = await Gym.find({ owner: req.user.id }).select('_id').lean();
      gymIds = ownedGyms.map((gym: any) => gym._id.toString());
    } else if (req.user.role === 'coach') {
      // If the user is a coach, get their associated gym
      const coach = await User.findById(req.user.id).select('gym');
      if (coach?.gym) {
        gymIds = [coach.gym.toString()];
      }
    } else if (req.user.role === 'superAdmin' || req.user.role === 'salesRep') {
      // Admin can see all gyms
      const allGyms = await Gym.find().select('_id').lean();
      gymIds = allGyms.map((gym: any) => gym._id.toString());
    }

    if (gymIds.length === 0) {
      return {
        data: [],
        pagination: null,
      };
    }

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Get all gym members (athletes) from the gyms
    const gymMemberRecords = await mongoose.model('Gym_Member').find({
      gym: { $in: gymIds },
      role: 'athlete',
      status: 'active'
    }).select('user gym').lean();

    const userIds = gymMemberRecords.map((record: any) => record.user);

    let members, total;

    // If pagination is requested
    if (page || limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      [members, total] = await Promise.all([
        User.find({ _id: { $in: userIds } })
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .select('name email profileImage phoneNumber role gym coach')
          .lean(),
        User.countDocuments({ _id: { $in: userIds } }),
      ]);
    } else {
      members = await User.find({ _id: { $in: userIds } })
        .sort(sortOptions)
        .select('name email profileImage phoneNumber role gym coach')
        .lean();
      total = members.length;
    }

    // Add assignedTo flag based on whether the member has any coach assigned
    const membersWithAssignment = members.map((member: any) => ({
      ...member,
      assignedTo: !!member.coach // true if member has any coach assigned
    }));

    if (page || limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;

      return {
        data: membersWithAssignment,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          totalResults: total,
        },
      };
    } else {
      return {
        data: membersWithAssignment,
        pagination: null,
      };
    }
  } catch (error) {
    console.error("Error in getGymMembersWithCoachAssignment:", error);
    throw error;
  }
};

export const getMyCoaches = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("Gym owner authentication required");
    }

    // Find all gyms owned by this gym owner
    const ownedGyms = await Gym.find({ owner: req.user.id }).select('_id');
    const gymIds = ownedGyms.map(gym => gym._id);

    if (gymIds.length === 0) {
      return {
        data: [],
        pagination: null,
      };
    }

    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Find coaches that are associated with the gym owner's gyms
    // Coaches can be linked via User.gym field or Gym_Member records
    const query = {
      role: "coach",
      $or: [
        { gym: { $in: gymIds } }, // Direct gym reference on User
        { _id: { $in: await mongoose.model('Gym_Member').find({ 
          gym: { $in: gymIds }, 
          role: "coach",
          status: "active" 
        }).distinct('user') } } // Via Gym_Member
      ]
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
        pagination: null,
      };
    }
  } catch (error) {
    console.error("Error in getMyCoaches:", error);
    throw error;
  }
};
