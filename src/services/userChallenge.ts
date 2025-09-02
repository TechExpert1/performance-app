import { Request } from "express";
import UserChallenge, {
  UserChallengeDocument,
} from "../models/User_Challenge.js";
import Challenge from "../models/Challenge.js";
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
    throw new Error("User has already joined this challenge.");
  }
  const userChallenge = await UserChallenge.create(data);
  await Challenge.findByIdAndUpdate(
    data.challenge,
    { $addToSet: { participants: req.user.id } },
    { new: true }
  );
  return {
    message: "User challenge created successfully",
    userChallenge,
  };
};

export const updateUserChallenge = async (req: AuthenticatedRequest) => {
  const { status } = req.body;

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
  if (status && status === "cancelled") {
    userChallenge.status = "cancelled";

    await Challenge.findByIdAndUpdate(userChallenge.challenge, {
      $pull: { participants: userChallenge.user },
    });
  }
  if (
    req.body.submission ||
    (req.fileUrls?.media && req.fileUrls.media.length > 0)
  ) {
    let parsedSubmission: {
      date?: string;
      note?: string;
      time?: string;
      reps?: string;
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
    } catch {
      throw new Error("Invalid submission JSON format");
    }

    let challenge: any;
    if (parsedSubmission.date) {
      challenge = await Challenge.findById(userChallenge.challenge);
      if (!challenge) {
        throw new Error("Challenge not found");
      }
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

    userChallenge.dailySubmissions.push({
      date: parsedSubmission.date
        ? new Date(parsedSubmission.date)
        : new Date(),
      mediaUrl: req.fileUrls?.media?.[0] || " ",
      note: parsedSubmission.note || "",
      time: parsedSubmission.time || "",
      reps: parsedSubmission.reps || "",
      ownerApprovalStatus: "pending",
    });

    if (!challenge) {
      challenge = await Challenge.findById(userChallenge.challenge);
    }

    if (challenge) {
      let requiredDays: number | null = null;
      const duration = challenge.duration?.toString().toLowerCase();

      if (duration === "week") {
        requiredDays = 7;
      } else if (duration === "month") {
        requiredDays = 30;
      } else if (!isNaN(Number(duration))) {
        requiredDays = Number(duration);
      }

      if (requiredDays) {
        const totalSubmissions = userChallenge.dailySubmissions.length;

        if (totalSubmissions >= requiredDays) {
          userChallenge.status = "completed";
        }
      }
    }
  }

  await userChallenge.save();

  return {
    message: "User challenge updated successfully",
    userChallenge,
  };
};

export const updateUserChallengeSubmission = async (
  req: AuthenticatedRequest
) => {
  const { id, submissionId } = req.params;
  const status = req.body.status;
  const updated = await UserChallenge.findOneAndUpdate(
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
    throw new Error("User Challenge or Submission not found");
  }

  return { message: "Status updated succesfullt", data: updated };
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
    .populate("user", "profileImage")
    .populate("challenge")
    .lean();

  if (!found) {
    throw new Error("User challenge not found");
  }

  // Find last 3 participants in the same challenge (excluding this one)
  const otherParticipants = await UserChallenge.find({
    challenge: found.challenge._id,
    _id: { $ne: found._id },
  })
    .populate("user", "profileImage")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // Return a new object with last3ProfileImages
  return {
    ...found,
    last3ProfileImages: otherParticipants
      .map((p) =>
        typeof p.user === "object" && "profileImage" in p.user
          ? p.user.profileImage
          : null
      )
      .filter(Boolean),
  };
};

export const getAllUserChallenges = async (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const {
    page: _page,
    limit: _limit,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query;

  const query: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      query[key] = value;
    }
  });

  const sort: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === "asc" ? 1 : -1,
  };

  const total = await UserChallenge.countDocuments(query);

  const challenges = await UserChallenge.find(query)
    .populate("user")
    .populate({
      path: "challenge",
      populate: {
        path: "participants",
        select: "profileImage",
      },
    })
    .skip(skip)
    .limit(limit)
    .sort(sort);

  // Grouping challenges by status
  const grouped = {
    active: [] as any[],
    completed: [] as any[],
    cancelled: [] as any[],
    incomplete: [] as any[],
  };

  challenges.forEach((ch) => {
    if (ch.status === "active") {
      grouped.active.push(ch);
    } else if (ch.status === "completed") {
      grouped.completed.push(ch);
    } else if (ch.status === "cancelled") {
      grouped.cancelled.push(ch);
    } else {
      grouped.incomplete.push(ch);
    }
  });

  return {
    message: "User challenges fetched successfully",
    data: grouped,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    },
  };
};
