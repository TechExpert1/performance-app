import { Request } from "express";
import Challenge, { ChallengeDocument } from "../models/Challenge.js";
import User_Challenge from "../models/User_Challenge.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
interface ServiceResponse<T> {
  message: string;
  challenge?: T;
  data?: T[];
}

export const createChallenge = async (
  req: AuthenticatedRequest
): Promise<ServiceResponse<ChallengeDocument>> => {
  if (!req.user) {
    return { message: "User information is missing from request." };
  }
  const data = {
    createdBy: req.user.id,
    mediaUrl: req.fileUrls?.mediaUrl[0],
    ...req.body,
  };
  const challenge = await Challenge.create(data);
  return {
    message: "Challenge created successfully",
    challenge,
  };
};

export const updateChallenge = async (
  req: AuthenticatedRequest
): Promise<ServiceResponse<ChallengeDocument>> => {
  let data = req.body;

  if (req.fileUrls?.mediaUrl?.[0]) {
    data = {
      ...data,
      mediaUrl: req.fileUrls.mediaUrl[0],
    };
  }

  const updated = await Challenge.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  if (!updated) return { message: "Challenge not found" };

  return {
    message: "Challenge updated successfully",
    challenge: updated,
  };
};

export const removeChallenge = async (
  req: Request
): Promise<ServiceResponse<null>> => {
  const removed = await Challenge.findByIdAndDelete(req.params.id);
  if (!removed) return { message: "Challenge not found" };

  return { message: "Challenge removed successfully" };
};

export const getChallengeById = async (req: Request) => {
  try {
    const found = await Challenge.findById(req.params.id)
      .populate("createdBy")
      .populate("exercise")
      .populate("format")
      .populate("type");

    if (!found) {
      return { message: "Challenge not found" };
    }

    const attendees = await User_Challenge.find({
      challenge: found._id,
    })
      .populate("user")
      .limit(20);

    const challengeWithAttendees = {
      ...found.toObject(),
      attendees,
    };

    return challengeWithAttendees;
  } catch (error) {
    console.error("Error in getChallengeById:", error);
    return { message: "An error occurred while fetching the challenge" };
  }
};

export const getAllChallenges = async (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;

  const total = await Challenge.countDocuments();

  const challenges = await Challenge.find()
    .populate("createdBy")
    .populate("exercise")
    .populate("format")
    .populate("type")
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder });

  const today = new Date();

  const dataWithDaysLeft = challenges.map((challenge) => {
    const endDate = new Date(challenge.endDate);
    const timeDiff = endDate.getTime() - today.getTime();
    const daysLeft = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)), 0);

    return {
      ...challenge.toObject(),
      daysLeft,
    };
  });

  return {
    message: "Challenges fetched successfully",
    data: dataWithDaysLeft,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    },
  };
};
