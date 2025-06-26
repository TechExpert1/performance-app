import { Request } from "express";
import UserChallenge, {
  UserChallengeDocument,
} from "../models/User_Challenge.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

export const createUserChallenge = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User is not authenticated.");
  }

  const data = {
    user: req.user.id,
    ...req.body,
  };
  const existing = await UserChallenge.findOne({
    user: data.user,
    challenge: data.challenge,
  });

  if (existing) {
    return {
      message: "User has already joined this challenge.",
    };
  }
  const userChallenge = await UserChallenge.create(data);

  return {
    message: "User challenge created successfully",
    userChallenge,
  };
};

export const updateUserChallenge = async (req: AuthenticatedRequest) => {
  const { submission, status } = req.body;
  const userChallenge = await UserChallenge.findById(req.params.id);
  if (!userChallenge) {
    throw new Error("User challenge not found");
  }

  if (userChallenge.user.toString() !== req.user?.id) {
    throw new Error("Unauthorized: You cannot update this challenge");
  }

  if (status) {
    userChallenge.status = status;
  }

  if (submission || req.body["media.type"] || req.fileUrl) {
    let parsedSubmission: {
      date?: string;
      note?: string;
    } = {};

    try {
      parsedSubmission =
        typeof submission === "string"
          ? JSON.parse(submission)
          : submission || {};
    } catch {
      throw new Error("Invalid submission JSON format");
    }

    if (!req.fileUrl) {
      throw new Error("Image URL is required for submission");
    }

    userChallenge.dailySubmissions.push({
      date: parsedSubmission.date
        ? new Date(parsedSubmission.date)
        : new Date(),
      mediaType: req.body["media.type"],
      mediaUrl: req.fileUrl,
      note: parsedSubmission.note || "",
      ownerApprovalStatus: "pending",
    });
  }

  await userChallenge.save();

  return {
    message: "User challenge updated successfully",
    userChallenge,
  };
};

export const removeUserChallenge = async (req: Request) => {
  const removed = await UserChallenge.findByIdAndDelete(req.params.id);
  if (!removed) {
    throw new Error("User challenge not found");
  }

  return {
    message: "User challenge removed successfully",
  };
};

export const getUserChallengeById = async (req: Request) => {
  const found = await UserChallenge.findById(req.params.id)
    .populate("user")
    .populate("challenge");

  if (!found) {
    throw new Error("User challenge not found");
  }

  return found;
};

export const getAllUserChallenges = async (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Extract and remove pagination and sorting params
  const {
    page: _page,
    limit: _limit,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query;

  // Build dynamic MongoDB filter
  const query: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      query[key] = value;
    }
  });

  // Build sorting object
  const sort: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === "asc" ? 1 : -1,
  };

  const total = await UserChallenge.countDocuments(query);
  const data = await UserChallenge.find(query)
    .populate("user")
    .populate("challenge")
    .skip(skip)
    .limit(limit)
    .sort(sort);

  return {
    message: "User challenges fetched successfully",
    data,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    },
  };
};
