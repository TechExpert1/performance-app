import { Request } from "express";
import SystemChallengeType from "../models/System_Challenge_Type.js";

export const getAllSystemChallengeTypes = async (req: Request) => {
  const { page = "1", limit = "10", date, ...filters } = req.query;

  const query: any = {};

  // Apply additional query filters
  for (const key in filters) {
    query[key] = filters[key];
  }

  // Date filtering (if applicable)
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

  const [types, total] = await Promise.all([
    SystemChallengeType.find(query)
      .populate("category")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    SystemChallengeType.countDocuments(query),
  ]);

  return {
    data: types,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};
