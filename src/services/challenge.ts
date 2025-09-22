import { Request } from "express";

import mongoose from "mongoose";
import Challenge, { ChallengeDocument } from "../models/Challenge.js";
import UserChallenge from "../models/User_Challenge.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import dayjs from "dayjs";
interface ServiceResponse<T> {
  message: string;
  challenge?: T;
  data?: T[];
}

export const createChallenge = async (
  req: AuthenticatedRequest
): Promise<ServiceResponse<ChallengeDocument>> => {
  if (!req.user) {
    throw new Error("User information is missing from request.");
  }
  const { duration } = req.body;
  let endDate: Date | null = null;

  if (duration) {
    const lowerDuration = duration.toLowerCase();

    if (lowerDuration === "week") {
      endDate = dayjs().add(7, "day").toDate();
    } else if (lowerDuration === "month") {
      endDate = dayjs().add(30, "day").toDate();
    } else if (!isNaN(parseInt(duration, 10))) {
      // Handle numeric string input as days
      const days = parseInt(duration, 10);
      endDate = dayjs().add(days, "day").toDate();
    } else {
      throw new Error(
        "Invalid duration value. Allowed: 'week', 'month', or a number of days"
      );
    }
  }
  const data = {
    createdBy: req.user.id,
    mediaUrl: req.fileUrls?.mediaUrl?.[0] || "",
    endDate,
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

  if (!updated) throw new Error("Challenge not found.");

  return {
    message: "Challenge updated successfully",
    challenge: updated,
  };
};

export const removeChallenge = async (
  req: Request
): Promise<ServiceResponse<null>> => {
  const removed = await Challenge.findByIdAndDelete(req.params.id);
  if (!removed) throw new Error("Challenge not found.");

  return { message: "Challenge removed successfully" };
};

export const getChallengeById = async (req: Request) => {
  try {
    const found = await Challenge.findById(req.params.id)
      .populate("createdBy")
      .populate("exercise")
      .populate("participants")
      .populate("format")
      .populate("type");

    if (!found) {
      throw new Error("Challenge not found.");
    }

    return found;
  } catch (error: any) {
    console.error("Error in getChallengeById:", error);
    throw new Error("Error fetching leaderboard: " + error.message);
  }
};

export const getAllChallenges = async (req: Request) => {
  const {
    page = "1",
    limit = "20",
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query as Record<string, string>;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, any> = {};

  for (const key in filters) {
    if (
      filters[key] !== undefined &&
      filters[key] !== null &&
      filters[key] !== ""
    ) {
      query[key] = filters[key];
    }
  }

  const total = await Challenge.countDocuments(query);

  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const challenges = await Challenge.find(query)
    .populate("createdBy")
    .populate("exercise")
    .populate("format")
    .populate("type")
    .populate("participants")
    .skip(skip)
    .limit(limitNum)
    .sort({ [sortBy]: sortDirection });

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
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total,
    },
  };
};

export const handleGetLeaderBoard = async (req: Request) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate({
        path: "community",
        populate: {
          path: "gym",
          select: "name",
        },
      })
      .lean();

    const populatedChallenge = challenge as unknown as {
      community?: {
        gym?: { name?: string };
      };
    };

    const leaderboard = await UserChallenge.aggregate([
      {
        $match: { challenge: new mongoose.Types.ObjectId(req.params.id) },
      },
      {
        $unwind: "$dailySubmissions",
      },
      {
        $match: { "dailySubmissions.ownerApprovalStatus": "accepted" },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $project: {
          _id: 0,
          name: "$userData.name",
          country: "$userData.country",
          submission: "$dailySubmissions",
        },
      },
      {
        $sort: { "submission.createdAt": 1 },
      },
    ]);

    return {
      gym: populatedChallenge.community?.gym?.name,
      leaderboard,
    };
  } catch (error: any) {
    throw new Error("Error fetching leaderboard: " + error.message);
  }
};
