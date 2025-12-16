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
    // Get challenge with format to validate submission
    let challenge = await Challenge.findById(userChallenge.challenge).populate("format");
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    // Get the format name to determine which field to use
    const formatName = ((challenge.format as any)?.name || "").toLowerCase();

    let parsedSubmission: {
      date?: string;
      note?: string;
      value?: string;
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

    // Validate that value is provided
    if (!parsedSubmission.value) {
      throw new Error("Value is required for submission");
    }

    // Map value to the correct field based on format
    const submissionData: any = {
      date: parsedSubmission.date ? new Date(parsedSubmission.date) : new Date(),
      mediaUrl: req.fileUrls?.media?.[0] || "",
      note: parsedSubmission.note || "",
      ownerApprovalStatus: "pending",
    };

    // Determine which field to populate based on format
    if (formatName.includes("fastest time") || formatName.includes("time for")) {
      submissionData.time = parsedSubmission.value;
    } else if (formatName.includes("max weight") || formatName.includes("1 rep max")) {
      submissionData.weight = parsedSubmission.value;
    } else if (formatName.includes("max reps") || formatName.includes("reps")) {
      submissionData.reps = parsedSubmission.value;
    } else if (formatName.includes("max distance") || formatName.includes("distance")) {
      submissionData.distance = parsedSubmission.value;
    } else if (formatName.includes("calories")) {
      submissionData.calories = parsedSubmission.value;
    } else {
      // Default to time if format is not recognized
      submissionData.time = parsedSubmission.value;
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

    userChallenge.dailySubmissions.push(submissionData);

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

      // Note: Status is now determined by owner approval of submissions, not submission count
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
  const approvalStatus = req.body.status;

  // Update the submission approval status
  const updated = await UserChallenge.findOneAndUpdate(
    {
      _id: id,
      "dailySubmissions._id": submissionId,
    },
    {
      $set: { "dailySubmissions.$.ownerApprovalStatus": approvalStatus },
    },
    { new: true }
  );

  if (!updated) {
    throw new Error("User Challenge or Submission not found");
  }

  // Determine overall challenge status based on submission approvals
  const allSubmissions = updated.dailySubmissions;
  const totalSubmissions = allSubmissions.length;
  const acceptedSubmissions = allSubmissions.filter(sub => sub.ownerApprovalStatus === "accepted").length;
  const rejectedSubmissions = allSubmissions.filter(sub => sub.ownerApprovalStatus === "rejected").length;

  let newStatus = updated.status; // Keep current status by default

  if (rejectedSubmissions > 0) {
    // If any submission is rejected, mark as cancelled
    newStatus = "cancelled";
  } else if (acceptedSubmissions === totalSubmissions && totalSubmissions > 0) {
    // If all submissions are accepted, mark as completed
    newStatus = "completed";
  } else if (updated.challenge && typeof updated.challenge === 'object' && 'endDate' in updated.challenge) {
    // Check if challenge has ended
    const challenge = await Challenge.findById(updated.challenge);
    if (challenge && challenge.endDate && new Date() > challenge.endDate) {
      // Challenge has ended but not all submissions approved
      newStatus = "incomplete";
    }
  }

  // Update the challenge status if it changed
  if (newStatus !== updated.status) {
    updated.status = newStatus;
    await updated.save();
  }

  return { message: "Status updated successfully", data: updated };
};

export const removeUserChallenge = async (req: Request) => {
  const removed = await UserChallenge.findByIdAndDelete(req.params.id);
  if (!removed) {
    throw new Error("User challenge not found");
  }

  // Remove user from challenge participants array
  await Challenge.findByIdAndUpdate(removed.challenge, {
    $pull: { participants: removed.user },
  });

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

import Athlete_User from "../models/Athlete_User.js"; // adjust path

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
    if (value !== undefined) query[key] = value;
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
    .sort(sort)
    .lean();

  // ✅ Collect all unique userIds
  const userIds = challenges.map((ch) => ch.user?._id).filter(Boolean);

  // ✅ Fetch all athlete profiles in one go
  const athleteProfiles = await Athlete_User.find({ userId: { $in: userIds } })
    .populate("sportsAndSkillLevels.sport")
    .populate("sportsAndSkillLevels.skillSetLevel")
    .lean();

  // ✅ Map profiles by userId
  const athleteMap = new Map(
    athleteProfiles.map((ap) => [ap.userId.toString(), ap])
  );

  // ✅ Attach athlete separately in each challenge
  challenges.forEach((ch) => {
    if (ch.user?._id) {
      (ch as any).athlete = athleteMap.get(ch.user._id.toString()) || null;
    }
  });

  // ✅ Group challenges by status
  const grouped = {
    active: [] as any[],
    completed: [] as any[],
    cancelled: [] as any[],
    incomplete: [] as any[],
  };

  // Check for challenges that may need status updates
  for (const ch of challenges) {
    let currentStatus = ch.status;

    // If challenge is still active but may have ended, check status
    if (currentStatus === "active" && ch.challenge && typeof ch.challenge === 'object' && 'endDate' in ch.challenge) {
      const challenge = await Challenge.findById(ch.challenge).lean();
      if (challenge && challenge.endDate && new Date() > challenge.endDate) {
        // Challenge has ended
        const userChallenge = await UserChallenge.findById(ch._id);
        if (userChallenge) {
          const allSubmissions = userChallenge.dailySubmissions;
          const acceptedCount = allSubmissions.filter(sub => sub.ownerApprovalStatus === "accepted").length;
          const rejectedCount = allSubmissions.filter(sub => sub.ownerApprovalStatus === "rejected").length;

          if (rejectedCount > 0) {
            currentStatus = "cancelled";
            userChallenge.status = "cancelled";
          } else if (acceptedCount === allSubmissions.length && allSubmissions.length > 0) {
            currentStatus = "completed";
            userChallenge.status = "completed";
          } else {
            currentStatus = "incomplete";
            userChallenge.status = "incomplete";
          }
          await userChallenge.save();
          ch.status = currentStatus; // Update the lean object for grouping
        }
      }
    }

    // Group by status
    if (currentStatus === "active") grouped.active.push(ch);
    else if (currentStatus === "completed") grouped.completed.push(ch);
    else if (currentStatus === "cancelled") grouped.cancelled.push(ch);
    else grouped.incomplete.push(ch);
  }

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
