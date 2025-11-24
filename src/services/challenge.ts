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

  // Handle submissions to challenge
  if (
    req.body.submission ||
    (req.fileUrls?.media && req.fileUrls.media.length > 0)
  ) {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    let parsedSubmission: {
      date?: string;
      note?: string;
      time?: string;
      reps?: string;
      distance?: string;
    } = {};

    try {
      if (typeof req.body.submission === "string") {
        parsedSubmission = JSON.parse(req.body.submission);
      } else if (
        typeof req.body.submission === "object" &&
        req.body.submission !== null
      ) {
        parsedSubmission = req.body.submission;
      }

      // Remove ownerApprovalStatus if sent by client - users cannot set their own approval status
      if (parsedSubmission && typeof parsedSubmission === 'object') {
        delete (parsedSubmission as any).ownerApprovalStatus;
      }
    } catch {
      throw new Error("Invalid submission JSON format");
    }

    // Validate submission date
    if (parsedSubmission.date) {
      if (!challenge?.createdAt || !challenge.endDate) {
        throw new Error("Challenge start date or end date is missing");
      }

      const normalizeDate = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const submissionDate = normalizeDate(new Date(parsedSubmission.date));
      const startDate = normalizeDate(new Date(challenge.createdAt));
      const endDate = normalizeDate(new Date(challenge.endDate));

      if (isNaN(submissionDate.getTime())) {
        throw new Error("Invalid submission date format");
      }

      if (submissionDate < startDate || submissionDate > endDate) {
        throw new Error(
          "Submission date must be between the challenge start date and end date"
        );
      }
    }

    // Add submission to challenge
    challenge.dailySubmissions.push({
      user: new mongoose.Types.ObjectId(req.user!.id),
      date: parsedSubmission.date
        ? new Date(parsedSubmission.date)
        : new Date(),
      mediaUrl: req.fileUrls?.media?.[0] || "",
      note: parsedSubmission.note || "",
      time: parsedSubmission.time || "",
      reps: parsedSubmission.reps || "",
      distance: parsedSubmission.distance || "",
      ownerApprovalStatus: "pending",
    } as any);

    await challenge.save();

    return {
      message: "Submission added to challenge successfully",
      challenge,
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
      .populate("type")
      .populate({
        path: "dailySubmissions.user",
        select: "name email profileImage",
      });

    if (!found) {
      throw new Error("Challenge not found.");
    }

    // If a user query parameter is present, try to locate the corresponding User_Challenge
    const userId = (req.query.user as string) || (req.query.userId as string);
    if (userId) {
      const userChallenge = await UserChallenge.findOne({
        user: userId,
        challenge: found._id,
      }).lean();

      if (userChallenge) {
        // Return challenge data but with root _id replaced by the User_Challenge id
        const obj = found.toObject();
        return {
          ...obj,
          challengeId: obj._id, // keep original challenge id
          _id: userChallenge._id,
          status: userChallenge.status,
          dailySubmissions: userChallenge.dailySubmissions || [],
          userChallenge: userChallenge,
        } as any;
      }
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
    .populate({
      path: "dailySubmissions.user",
      select: "name email profileImage",
    })
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

  // If a user query param is provided, replace challenge root _id with the corresponding User_Challenge _id
  const userId = (req.query.user as string) || (req.query.userId as string);
  let finalData = dataWithDaysLeft;
  if (userId) {
    const enhanced: any[] = [];
    for (const ch of dataWithDaysLeft) {
      const uc = await UserChallenge.findOne({ user: userId, challenge: ch._id }).lean();
      if (uc) {
        enhanced.push({
          ...ch,
          challengeId: ch._id,
          _id: uc._id,
          status: uc.status,
          dailySubmissions: uc.dailySubmissions || [],
          userChallenge: uc,
        });
      } else {
        enhanced.push(ch);
      }
    }
    finalData = enhanced;
  }

  return {
    message: "Challenges fetched successfully",
    data: finalData,
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

export const updateChallengeSubmission = async (
  req: AuthenticatedRequest
) => {
  const { id, submissionId } = req.params;
  const status = req.body.status;
  
  const updated = await Challenge.findOneAndUpdate(
    {
      _id: id,
      "dailySubmissions._id": submissionId,
    },
    {
      $set: { "dailySubmissions.$.ownerApprovalStatus": status },
    },
    { new: true }
  );

  if (!updated) {
    throw new Error("Challenge or Submission not found");
  }

  return { message: "Status updated successfully", data: updated };
};
