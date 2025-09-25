import { Request } from "express";
import mongoose from "mongoose";
import SystemUserChallenge from "../models/System_User_Challenge.js";
import ChallengeCategory from "../models/Challenge_Category.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

export const createSystemUserChallenge = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User is not authenticated.");
    }

    const data = {
      user: req.user.id,
      ...req.body,
    };

    const existing = await SystemUserChallenge.findOne({
      user: req.user.id,
      challenge: req.body.challenge,
    });

    if (existing) {
      throw new Error("User already participating in this challenge");
    }

    const entry = await SystemUserChallenge.create(data);

    return {
      message: "System challenge participation started",
      data: entry,
    };
  } catch (error) {
    throw error;
  }
};

export const updateSystemUserChallenge = async (req: Request) => {
  try {
    const { id } = req.params;

    const doc = await SystemUserChallenge.findById(id);
    if (!doc) {
      throw new Error("System user challenge not found");
    }

    const submission: Record<string, any> = {};
    for (const key in req.body) {
      submission[key] = req.body[key];
    }

    submission.mediaUrl = req.fileUrls?.file;

    doc.submissions = submission;
    doc.status = "completed";

    await doc.save();

    return {
      message: "System user challenge updated successfully",
      data: doc,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllSystemUserChallenges = async (req: AuthenticatedRequest) => {
  try {
    const { page = "1", limit = "10", date, user, ...filters } = req.query;
    const query: any = { ...filters };

    if (date) {
      const selectedDate = new Date(date as string);
      const startOfDay = new Date(selectedDate);
      const endOfDay = new Date(selectedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (user) {
      query.user = user;

      const allUserDocs = await SystemUserChallenge.find(query)
        .populate("user")
        .populate({
          path: "challenge",
          populate: [
            { path: "category" },
            { path: "format" },
            { path: "categoryType" },
          ],
        })
        .sort({ createdAt: -1 })
        .lean();

      const active = allUserDocs.filter((doc) => doc.status === "active");
      const completed = allUserDocs.filter((doc) => doc.status === "completed");

      return {
        all: allUserDocs,
        active,
        completed,
      };
    }
    if (!req.user) {
      throw new Error("User is not authenticated.");
    }
    if (req.user.id) {
      query.user = req.user.id;
    }
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [results, total] = await Promise.all([
      SystemUserChallenge.find(query)
        .populate("user")
        .populate({
          path: "challenge",
          populate: [
            { path: "category" },
            { path: "format" },
            { path: "categoryType" },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SystemUserChallenge.countDocuments(query),
    ]);
    return {
      data: results,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getAllStats = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User is not authenticated.");
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ✅ Step 1: get all category names (excluding "Attendance Based")
    const categories = await ChallengeCategory.find(
      { name: { $ne: "Attendance Based" } },
      "name"
    ).lean();
    const categoryNames = categories.map((c) => c.name);

    // ✅ Step 2: aggregate completed challenges by category
    const result = await SystemUserChallenge.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "system_challenges",
          localField: "challenge",
          foreignField: "_id",
          as: "challengeDetails",
        },
      },
      { $unwind: "$challengeDetails" },
      {
        $lookup: {
          from: "challenge_categories",
          localField: "challengeDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          count: { $sum: 1 },
        },
      },
    ]);

    // ✅ Step 3: merge results
    const counts: Record<string, number> = {};
    categoryNames.forEach((name) => {
      const found = result.find((r) => r._id === name);
      counts[name] = found ? found.count : 0;
    });

    // ✅ Step 4: enforce order (Strength → Power → Speed → Endurance)
    const orderedCategories = ["Strength", "Power", "Speed", "Endurance"];
    const orderedCounts: Record<string, number> = {};
    orderedCategories.forEach((cat) => {
      if (counts[cat] !== undefined) {
        orderedCounts[cat] = counts[cat];
      }
    });

    return orderedCounts;
  } catch (error) {
    throw error;
  }
};
