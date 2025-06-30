import { Request } from "express";
import SystemChallenge from "../models/System_Challenge.js";

export const getAllSystemChallenges = async (req: Request) => {
  const { page = "1", limit = "10", date, ...filters } = req.query;
  const { challengeType } = req.params;

  const query: any = {
    categoryType: challengeType, // from route param
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

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [challenges, total] = await Promise.all([
    SystemChallenge.find(query)
      .populate("categoryType")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    SystemChallenge.countDocuments(query),
  ]);

  return {
    data: challenges,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};
