import { Request } from "express";
import Challenge, { ChallengeDocument } from "../models/Challenge.js";
import User_Challenge from "../models/User_Challenge.js";
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
    if (duration.toLowerCase() === "week") {
      endDate = dayjs().add(7, "day").toDate();
    } else if (duration.toLowerCase() === "month") {
      endDate = dayjs().add(30, "day").toDate();
    } else {
      throw new Error("Invalid duration value. Allowed: 'week', 'month'");
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
      .populate("format")
      .populate("type");

    if (!found) {
      throw new Error("Challenge not found.");
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
