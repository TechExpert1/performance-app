import { Request } from "express";
import SystemChallenge from "../models/System_Challenge.js";
import SystemUserChallenge from "../models/System_User_Challenge.js";

export const getAllSystemChallenges = async (req: Request) => {
  const { date, user, ...filters } = req.query;
  const { challengeType } = req.params;

  const query: any = {
    categoryType: challengeType,
  };

  // Add query string filters
  for (const key in filters) {
    query[key] = filters[key];
  }

  // Optional date filter
  if (date) {
    const selectedDate = new Date(date as string);
    const startOfDay = new Date(selectedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    query.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  // Fetch all system challenges
  const challenges = await SystemChallenge.find(query)
    .populate("format categoryType category")
    .sort({ date: -1 })
    .lean();

  let userChallengesByStatus: any = {
    active: [],
    completed: [],
  };

  if (user) {
    const userChallenges = await SystemUserChallenge.find({
      user,
      challenge: { $in: challenges.map((c) => c._id) },
    })
      .populate("user")
      .populate({
        path: "challenge",
        populate: [
          { path: "category" },
          { path: "format" },
          { path: "categoryType" },
        ],
      })
      .lean();

    userChallengesByStatus = {
      active: userChallenges.filter((uc) => uc.status === "active"),
      completed: userChallenges.filter((uc) => uc.status === "completed"),
    };
  }

  return {
    allChallenges: challenges,
    userChallenges: userChallengesByStatus,
  };
};
