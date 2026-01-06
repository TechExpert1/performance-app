import { Request } from "express";
import mongoose from "mongoose";
import SystemUserChallenge from "../models/System_User_Challenge.js";
import ChallengeCategory from "../models/Challenge_Category.js";
import SystemChallenge from "../models/System_Challenge.js";
import SystemChallengeType from "../models/System_Challenge_Type.js";
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

    // Check if user has an ACTIVE participation in this challenge
    // Users can rejoin after completing a challenge, but not while one is still active
    const existingActive = await SystemUserChallenge.findOne({
      user: req.user.id,
      challenge: req.body.challenge,
      status: "active",
    });

    if (existingActive) {
      // User already has an active participation, return the existing one
      return {
        message: "User already has an active participation in this challenge",
        data: existingActive,
      };
    }

    // Create new participation (allowed even if user completed this challenge before)
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

/**
 * Get Total Challenge Attempts by Category
 * Returns the count of all challenge attempts (active + completed) per category
 * Categories: Strength, Power, Speed, Endurance
 */
export const getTotalChallengeAttempts = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User is not authenticated.");
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get all category names (excluding "Attendance Based")
    const categories = await ChallengeCategory.find(
      { name: { $ne: "Attendance Based" } },
      "name"
    ).lean();
    const categoryNames = categories.map((c) => c.name);

    // Aggregate ALL challenge attempts by category (both active and completed)
    const result = await SystemUserChallenge.aggregate([
      {
        $match: {
          user: userId,
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

    // Merge results with all categories
    const counts: Record<string, number> = {};
    categoryNames.forEach((name) => {
      const found = result.find((r) => r._id === name);
      counts[name] = found ? found.count : 0;
    });

    // Enforce order (Strength → Power → Speed → Endurance)
    const orderedCategories = ["Strength", "Power", "Speed", "Endurance"];
    const orderedData = orderedCategories.map((cat) => ({
      category: cat,
      attempts: counts[cat] || 0,
    }));

    return {
      message: "Total challenge attempts fetched successfully",
      data: orderedData,
      total: orderedData.reduce((sum, item) => sum + item.attempts, 0),
    };
  } catch (error) {
    throw error;
  }
};

// ========================================
// PERFORMANCE CHALLENGE GRAPH API
// ========================================

// Category colors for frontend reference
const CATEGORY_COLORS: Record<string, string> = {
  Strength: "#FF0000", // Red
  Power: "#FFA500", // Orange
  Speed: "#0000FF", // Blue
  Endurance: "#00FF00", // Green
};

// Category graph directions (whether higher is better or lower is better)
const CATEGORY_DIRECTIONS: Record<string, string> = {
  Strength: "up", // Higher is better
  Power: "up", // Higher is better
  Speed: "down", // Lower (faster) is better
  Endurance: "up", // Generally higher is better (though time-based may be down)
};

/**
 * Helper function to determine the level achieved based on the result
 */
const determineLevelAchieved = (
  result: number,
  levels: Array<{ badge: string; value: string }>,
  isLowerBetter: boolean = false
): { level: string; badge: string } => {
  if (!levels || levels.length === 0) {
    return { level: "None", badge: "" };
  }

  // Sort levels by value - for "lower is better" scenarios, reverse the comparison
  const sortedLevels = [...levels].sort((a, b) => {
    const aVal = parseFloat(a.value);
    const bVal = parseFloat(b.value);
    return isLowerBetter ? aVal - bVal : bVal - aVal;
  });

  for (const level of sortedLevels) {
    const targetValue = parseFloat(level.value);
    const meetsThreshold = isLowerBetter
      ? result <= targetValue
      : result >= targetValue;

    if (meetsThreshold) {
      return { level: level.badge, badge: level.badge };
    }
  }

  return { level: "None", badge: "" };
};

/**
 * Helper function to convert time string to seconds for comparison
 */
const timeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;

  const parts = timeStr.split(":").map(Number);

  if (parts.length === 1) {
    return parts[0];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
};

/**
 * Unified Performance Challenge Graph API
 * 
 * Single endpoint: GET /system-user-challenges/graph
 * 
 * Query Parameters:
 * - type: "categories" | "packs" | "challenges" | "data" | "my-challenges" | "overview"
 * - categoryId: Required when type="packs"
 * - packId: Required when type="challenges"
 * - challengeId: Required when type="data"
 * - timeFilter: "7D" | "30D" | "90D" | "all" (optional, for type="data", default: "30D")
 * - category: Optional filter for type="my-challenges" (e.g., "Strength", "Power")
 */
export const getPerformanceChallengeGraph = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User is not authenticated.");
    }

    const { 
      type = "categories", // kept for backwards compatibility, has no effect
      categoryId, 
      packId, 
      challengeId, 
      timeFilter = "30D",
    } = req.query;

    if (!categoryId) {
      throw new Error("categoryId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId as string)) {
      throw new Error("Invalid category ID");
    }

    // Get category details
    const category = await ChallengeCategory.findById(categoryId)
      .select("_id name")
      .lean();

    if (!category) {
      throw new Error("Category not found");
    }

    const categoryName = category.name;
    const isLowerBetter = categoryName === "Speed" || categoryName === "Endurance";

    // Calculate date range based on time filter
    const now = new Date();
    let startDate: Date | null = null;

    switch (timeFilter) {
      case "7D":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30D":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90D":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        startDate = null;
        break;
    }

    // Build query to get user's completed challenges for this category
    const challengeQuery: any = { category: categoryId };
    
    // If packId provided, filter by pack
    if (packId && mongoose.Types.ObjectId.isValid(packId as string)) {
      challengeQuery.categoryType = packId;
    }

    // If challengeId provided, filter by specific challenge
    if (challengeId && mongoose.Types.ObjectId.isValid(challengeId as string)) {
      challengeQuery._id = challengeId;
    }

    const challenges = await SystemChallenge.find(challengeQuery)
      .select("_id title levels")
      .lean();

    const challengeIds = challenges.map((c) => c._id);

    const userChallengesQuery: any = {
      user: req.user.id,
      challenge: { $in: challengeIds },
      status: "completed",
    };

    if (startDate) {
      userChallengesQuery.updatedAt = { $gte: startDate };
    }

    const userChallenges = await SystemUserChallenge.find(userChallengesQuery)
      .populate("challenge", "title levels")
      .sort({ updatedAt: 1 })
      .lean();

    const dataPoints: Array<{
      date: string;
      dateFormatted: string;
      value: number;
      displayValue: string;
      unit: string;
      level: string;
      badge: string;
      isPB: boolean;
      challengeName: string;
    }> = [];

    let personalBestValue: number | null = null;
    let personalBestIndex: number = -1;

    userChallenges.forEach((uc, index) => {
      const submissions = uc.submissions as Record<string, any>;
      const completedDate = new Date(uc.updatedAt || uc.createdAt!);
      const challenge = uc.challenge as any;

      let value: number = 0;
      let displayValue: string = "";
      let unit: string = "";

      if (submissions.weight) {
        value = parseFloat(submissions.weight);
        displayValue = `${value} kg`;
        unit = "kg";
      } else if (submissions.reps) {
        value = parseFloat(submissions.reps);
        displayValue = `${value} Reps`;
        unit = "reps";
      } else if (submissions.time) {
        value = timeToSeconds(submissions.time);
        displayValue = submissions.time;
        unit = "time";
      } else if (submissions.distance) {
        value = parseFloat(submissions.distance);
        displayValue = `${value} km`;
        unit = "km";
      } else if (submissions.calories) {
        value = parseFloat(submissions.calories);
        displayValue = `${value} Cal`;
        unit = "calories";
      }

      const { level, badge } = determineLevelAchieved(
        value,
        challenge?.levels,
        isLowerBetter
      );

      if (personalBestValue === null) {
        personalBestValue = value;
        personalBestIndex = index;
      } else {
        const isBetter = isLowerBetter
          ? value < personalBestValue
          : value > personalBestValue;
        if (isBetter) {
          personalBestValue = value;
          personalBestIndex = index;
        }
      }

      const dateFormatted = completedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      dataPoints.push({
        date: completedDate.toISOString(),
        dateFormatted,
        value,
        displayValue,
        unit,
        level,
        badge,
        isPB: false,
        challengeName: challenge?.title || "",
      });
    });

    if (personalBestIndex >= 0 && dataPoints[personalBestIndex]) {
      dataPoints[personalBestIndex].isPB = true;
    }

    const personalBest = personalBestIndex >= 0 ? {
      value: personalBestValue,
      displayValue: dataPoints[personalBestIndex]?.displayValue,
      date: dataPoints[personalBestIndex]?.dateFormatted,
      level: dataPoints[personalBestIndex]?.level,
    } : null;

    // Get pack and challenge details if provided
    let pack = null;
    let specificChallenge = null;

    if (packId && mongoose.Types.ObjectId.isValid(packId as string)) {
      pack = await SystemChallengeType.findById(packId).select("_id name").lean();
    }

    if (challengeId && mongoose.Types.ObjectId.isValid(challengeId as string)) {
      specificChallenge = await SystemChallenge.findById(challengeId).select("_id title").lean();
    }

    return {
      message: "Challenge graph data fetched successfully",
      data: {
        category: {
          _id: category._id,
          name: category.name,
        },
        pack: pack ? {
          _id: pack._id,
          name: pack.name,
        } : null,
        challenge: specificChallenge ? {
          _id: specificChallenge._id,
          title: specificChallenge.title,
        } : null,
        timeFilter,
        personalBest,
        totalAttempts: dataPoints.length,
        dataPoints,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all IDs needed for Performance Challenge Graph
 * Returns all categories, packs, and challenges with their IDs
 */
export const getPerformanceChallengeGraphIds = async () => {
  try {
    const categoryColors: { [key: string]: string } = {
      Strength: "#FF0000",
      Power: "#FFA500",
      Speed: "#0000FF",
      Endurance: "#00FF00",
    };

    // Get all 4 categories
    const categories = await ChallengeCategory.find({
      name: { $in: ["Strength", "Power", "Speed", "Endurance"] },
    })
      .select("_id name image")
      .lean();

    const orderedCategories = ["Strength", "Power", "Speed", "Endurance"];
    const sortedCategories = orderedCategories
      .map((name) => {
        const cat = categories.find((c) => c.name === name);
        if (cat) {
          return {
            _id: cat._id,
            name: cat.name,
            image: cat.image,
            color: categoryColors[cat.name] || "#808080",
          };
        }
        return null;
      })
      .filter(Boolean);

    // Get all packs (SystemChallengeTypes) for each category
    const packs = await SystemChallengeType.find({
      category: { $in: sortedCategories.map((c) => c!._id) },
    })
      .select("_id name category image")
      .populate("category", "name")
      .lean();

    // Get all challenges for each pack
    const challenges = await SystemChallenge.find({
      categoryType: { $in: packs.map((p) => p._id) },
    })
      .select("_id title categoryType unit targetUnit direction targetValue")
      .populate({
        path: "categoryType",
        select: "name category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .lean();

    // Structure the response
    const categoriesWithPacks = sortedCategories.map((category) => {
      const categoryPacks = packs
        .filter(
          (p) =>
            p.category &&
            (p.category as any)._id.toString() === category!._id.toString()
        )
        .map((pack) => {
          const packChallenges = challenges
            .filter(
              (c: any) => c.categoryType && c.categoryType._id.toString() === pack._id.toString()
            )
            .map((challenge: any) => ({
              _id: challenge._id,
              name: challenge.title,
              unit: challenge.unit,
              targetUnit: challenge.targetUnit,
              direction: challenge.direction,
              targetValue: challenge.targetValue,
            }));

          return {
            _id: pack._id,
            name: pack.name,
            image: pack.image,
            challenges: packChallenges,
          };
        });

      return {
        ...category,
        packs: categoryPacks,
      };
    });

    return {
      message: "All Performance Challenge Graph IDs fetched successfully",
      data: {
        categories: categoriesWithPacks,
        summary: {
          totalCategories: sortedCategories.length,
          totalPacks: packs.length,
          totalChallenges: challenges.length,
        },
      },
    };
  } catch (error) {
    throw error;
  }
};
