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
      type = "categories", 
      categoryId, 
      packId, 
      challengeId, 
      timeFilter = "30D",
      category 
    } = req.query;

    switch (type) {
      // ========================================
      // GET CATEGORIES
      // ========================================
      case "categories": {
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
                ...cat,
                color: CATEGORY_COLORS[name] || "#000000",
                direction: CATEGORY_DIRECTIONS[name] || "up",
              };
            }
            return null;
          })
          .filter(Boolean);

        return {
          message: "Performance categories fetched successfully",
          type: "categories",
          data: sortedCategories,
        };
      }

      // ========================================
      // GET PACKS FOR A CATEGORY
      // ========================================
      case "packs": {
        if (!categoryId) {
          throw new Error("categoryId is required when type=packs");
        }

        if (!mongoose.Types.ObjectId.isValid(categoryId as string)) {
          throw new Error("Invalid category ID");
        }

        const packs = await SystemChallengeType.find({
          category: categoryId,
        })
          .select("_id name image category")
          .populate("category", "name")
          .lean();

        return {
          message: "Challenge packs fetched successfully",
          type: "packs",
          categoryId,
          data: packs,
        };
      }

      // ========================================
      // GET CHALLENGES IN A PACK
      // ========================================
      case "challenges": {
        if (!packId) {
          throw new Error("packId is required when type=challenges");
        }

        if (!mongoose.Types.ObjectId.isValid(packId as string)) {
          throw new Error("Invalid pack ID");
        }

        const challenges = await SystemChallenge.find({
          categoryType: packId,
        })
          .select("_id title description levels category format categoryType")
          .populate("category", "name")
          .populate("format", "name")
          .populate("categoryType", "name")
          .lean();

        return {
          message: "Challenges fetched successfully",
          type: "challenges",
          packId,
          data: challenges,
        };
      }

      // ========================================
      // GET GRAPH DATA FOR A CHALLENGE
      // ========================================
      case "data": {
        if (!challengeId) {
          throw new Error("challengeId is required when type=data");
        }

        if (!mongoose.Types.ObjectId.isValid(challengeId as string)) {
          throw new Error("Invalid challenge ID");
        }

        const challenge = await SystemChallenge.findById(challengeId)
          .populate("category", "name")
          .populate("format", "name")
          .populate("categoryType", "name")
          .lean();

        if (!challenge) {
          throw new Error("Challenge not found");
        }

        const categoryName = (challenge.category as any)?.name || "";
        const formatName = (challenge.format as any)?.name || "";

        const isLowerBetter =
          categoryName === "Speed" ||
          formatName.toLowerCase().includes("time") ||
          formatName.toLowerCase().includes("fastest");

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

        const query: any = {
          user: req.user.id,
          challenge: challengeId,
          status: "completed",
        };

        if (startDate) {
          query.updatedAt = { $gte: startDate };
        }

        const userChallenges = await SystemUserChallenge.find(query)
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
          tooltip: {
            challengeName: string;
            result: string;
            level: string;
            date: string;
          };
        }> = [];

        let personalBestValue: number | null = null;
        let personalBestIndex: number = -1;

        userChallenges.forEach((uc, index) => {
          const submissions = uc.submissions as Record<string, any>;
          const completedDate = new Date(uc.updatedAt || uc.createdAt!);

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
            challenge.levels,
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
            challengeName: challenge.title,
            tooltip: {
              challengeName: challenge.title,
              result: displayValue,
              level: badge || "None",
              date: dateFormatted,
            },
          });
        });

        if (personalBestIndex >= 0 && dataPoints[personalBestIndex]) {
          dataPoints[personalBestIndex].isPB = true;
        }

        const values = dataPoints.map((dp) => dp.value);
        const summary = {
          totalAttempts: dataPoints.length,
          personalBest: personalBestValue,
          personalBestDisplay:
            personalBestIndex >= 0 ? dataPoints[personalBestIndex]?.displayValue : null,
          personalBestDate:
            personalBestIndex >= 0 ? dataPoints[personalBestIndex]?.dateFormatted : null,
          personalBestLevel:
            personalBestIndex >= 0 ? dataPoints[personalBestIndex]?.level : null,
          average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
          latestAttempt: dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : null,
        };

        return {
          message: "Challenge graph data fetched successfully",
          type: "data",
          data: {
            challenge: {
              _id: challenge._id,
              title: challenge.title,
              description: challenge.description,
              category: challenge.category,
              format: challenge.format,
              categoryType: challenge.categoryType,
              levels: challenge.levels,
            },
            graphConfig: {
              categoryName,
              categoryColor: CATEGORY_COLORS[categoryName] || "#000000",
              direction: isLowerBetter ? "down" : "up",
              xAxisLabel: "Date",
              yAxisLabel: formatName || "Performance",
              unit: dataPoints.length > 0 ? dataPoints[0].unit : "",
            },
            timeFilter,
            dataPoints,
            summary,
          },
        };
      }

      // ========================================
      // GET USER'S ATTEMPTED CHALLENGES
      // ========================================
      case "my-challenges": {
        const userChallenges = await SystemUserChallenge.find({
          user: req.user.id,
          status: "completed",
        })
          .populate({
            path: "challenge",
            populate: [
              { path: "category", select: "name" },
              { path: "format", select: "name" },
              { path: "categoryType", select: "name" },
            ],
          })
          .lean();

        const challengeMap = new Map<
          string,
          {
            challenge: any;
            attemptCount: number;
            lastAttempt: Date;
          }
        >();

        userChallenges.forEach((uc) => {
          const chId = (uc.challenge as any)?._id?.toString();
          if (!chId) return;

          const existingEntry = challengeMap.get(chId);
          const attemptDate = new Date(uc.updatedAt || uc.createdAt!);

          if (existingEntry) {
            existingEntry.attemptCount++;
            if (attemptDate > existingEntry.lastAttempt) {
              existingEntry.lastAttempt = attemptDate;
            }
          } else {
            challengeMap.set(chId, {
              challenge: uc.challenge,
              attemptCount: 1,
              lastAttempt: attemptDate,
            });
          }
        });

        let results = Array.from(challengeMap.values());

        if (category) {
          results = results.filter((r) => {
            const catName = (r.challenge?.category as any)?.name;
            return catName?.toLowerCase() === (category as string).toLowerCase();
          });
        }

        results.sort((a, b) => b.lastAttempt.getTime() - a.lastAttempt.getTime());

        const formattedResults = results.map((r) => ({
          challenge: {
            _id: r.challenge._id,
            title: r.challenge.title,
            description: r.challenge.description,
            category: r.challenge.category,
            format: r.challenge.format,
            categoryType: r.challenge.categoryType,
          },
          attemptCount: r.attemptCount,
          lastAttempt: r.lastAttempt.toISOString(),
          lastAttemptFormatted: r.lastAttempt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }));

        return {
          message: "User attempted challenges fetched successfully",
          type: "my-challenges",
          category: category || null,
          data: formattedResults,
        };
      }

      // ========================================
      // GET COMPLETE OVERVIEW
      // ========================================
      case "overview": {
        const categories = await ChallengeCategory.find({
          name: { $in: ["Strength", "Power", "Speed", "Endurance"] },
        })
          .select("_id name image")
          .lean();

        const packs = await SystemChallengeType.find({
          category: { $in: categories.map((c) => c._id) },
        })
          .select("_id name image category")
          .lean();

        const challenges = await SystemChallenge.find({
          categoryType: { $in: packs.map((p) => p._id) },
        })
          .select("_id title description levels category format categoryType")
          .populate("format", "name")
          .lean();

        const userChallenges = await SystemUserChallenge.find({
          user: req.user.id,
          status: "completed",
        })
          .select("challenge")
          .lean();

        const attemptCounts = new Map<string, number>();
        userChallenges.forEach((uc) => {
          const chId = uc.challenge?.toString();
          if (chId) {
            attemptCounts.set(chId, (attemptCounts.get(chId) || 0) + 1);
          }
        });

        const orderedCategories = ["Strength", "Power", "Speed", "Endurance"];
        const overview = orderedCategories
          .map((categoryName) => {
            const cat = categories.find((c) => c.name === categoryName);
            if (!cat) return null;

            const categoryPacks = packs
              .filter((p) => p.category?.toString() === cat._id.toString())
              .map((pack) => {
                const packChallenges = challenges
                  .filter((c) => c.categoryType?.toString() === pack._id.toString())
                  .map((challenge) => ({
                    _id: challenge._id,
                    title: challenge.title,
                    description: challenge.description,
                    format: challenge.format,
                    levels: challenge.levels,
                    attemptCount: attemptCounts.get(challenge._id.toString()) || 0,
                    hasAttempts: attemptCounts.has(challenge._id.toString()),
                  }));

                return {
                  _id: pack._id,
                  name: pack.name,
                  image: pack.image,
                  challenges: packChallenges,
                  totalChallenges: packChallenges.length,
                  attemptedChallenges: packChallenges.filter((c) => c.hasAttempts).length,
                };
              });

            return {
              _id: cat._id,
              name: cat.name,
              image: cat.image,
              color: CATEGORY_COLORS[categoryName] || "#000000",
              direction: CATEGORY_DIRECTIONS[categoryName] || "up",
              packs: categoryPacks,
              totalPacks: categoryPacks.length,
              totalChallenges: categoryPacks.reduce((sum, p) => sum + p.totalChallenges, 0),
              attemptedChallenges: categoryPacks.reduce(
                (sum, p) => sum + p.attemptedChallenges,
                0
              ),
            };
          })
          .filter(Boolean);

        return {
          message: "Graph overview fetched successfully",
          type: "overview",
          data: overview,
        };
      }

      default:
        throw new Error(
          "Invalid type. Must be one of: categories, packs, challenges, data, my-challenges, overview"
        );
    }
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
      type: { $in: packs.map((p) => p._id) },
    })
      .select("_id name type unit targetUnit direction targetValue")
      .populate({
        path: "type",
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
              (c) => c.type && (c.type as any)._id.toString() === pack._id.toString()
            )
            .map((challenge) => ({
              _id: challenge._id,
              name: challenge.name,
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
