import { Request } from "express";
import mongoose from "mongoose";
import PhysicalPerformance from "../models/Physical_Performance.js";
import PerformanceSet from "../models/Physical_Performance_Set.js";
import ChallengeCategory from "../models/Challenge_Category.js";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";
import { IPerformanceSet } from "../interfaces/physicalPerformanceSets.interface";
import { AuthenticatedRequest } from "../middlewares/user.js";

export const createPerformance = async (req: AuthenticatedRequest) => {
  const { sets, ...performanceData } = req.body;
  const user = req.user?.id;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const performance = await PhysicalPerformance.create(
      [{ ...performanceData, user }],
      { session }
    );

    const performanceDoc = performance[0];

    const setsWithMeta = (sets as IPerformanceSet[]).map((set) => ({
      ...set,
      performance: performanceDoc._id,
      date: performanceDoc.date,
    }));

    const createdSets = await PerformanceSet.insertMany(setsWithMeta, {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return {
      message: "Physical performance and sets created successfully",
      performance: performanceDoc,
      sets: createdSets,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const updatePerformance = async (req: AuthenticatedRequest) => {
  const { id } = req.params;
  const { sets, ...performanceData } = req.body;
  const user = req.user?.id;

  if (!user) throw new Error("User not authenticated");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedPerformance = await PhysicalPerformance.findByIdAndUpdate(
      id,
      { ...performanceData },
      { new: true, session }
    );

    if (!updatedPerformance) return { message: "Performance not found" };

    const performanceId = updatedPerformance._id;
    const performanceDate = updatedPerformance.date;

    await PerformanceSet.deleteMany(
      { performance: performanceId },
      { session }
    );

    const setsToInsert = (sets as IPerformanceSet[]).map((set) => ({
      ...set,
      user,
      performance: performanceId,
      date: performanceDate,
    }));

    const insertedSets = await PerformanceSet.insertMany(setsToInsert, {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return {
      message: "Performance and sets updated successfully",
      performance: updatedPerformance,
      sets: insertedSets,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const removePerformance = async (req: Request) => {
  const { id } = req.params;

  const performance = await PhysicalPerformance.findByIdAndDelete(id);
  if (!performance) return { message: "Performance not found" };

  await PerformanceSet.deleteMany({ performance: id });

  return { message: "Performance and associated sets deleted" };
};

export const getPerformanceById = async (req: Request) => {
  const { id } = req.params;

  const performance = await PhysicalPerformance.findById(id)
    .populate("user")
    .lean();

  if (!performance) return { message: "Performance not found" };

  const sets = await PerformanceSet.find({ performance: id })
    .populate("category")
    .populate("subCategory")
    .populate("exercise")
    .lean();

  return {
    ...performance,
    sets,
  };
};

export const getAllPerformances = async (req: Request) => {
  const { page = "1", limit = "10", date, ...filters } = req.query;

  const query: any = {};

  for (const key in filters) {
    query[key] = filters[key];
  }

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

  const [performances, total] = await Promise.all([
    PhysicalPerformance.find(query)
      .populate("user")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    PhysicalPerformance.countDocuments(query),
  ]);

  const resultsWithSets = await Promise.all(
    performances.map(async (perf) => {
      const sets = await PerformanceSet.find({ performance: perf._id })
        .populate("category")
        .populate("subCategory")
        .populate("exercise")
        .lean();
      return {
        ...perf,
        sets,
      };
    })
  );

  return {
    data: resultsWithSets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// ========================================
// PERFORMANCE GRAPH API
// ========================================

// Category colors for frontend reference
const PERF_CATEGORY_COLORS: Record<string, string> = {
  Strength: "#FF0000", // Red
  Power: "#FFA500", // Orange
  Speed: "#0000FF", // Blue
  Endurance: "#00FF00", // Green
};

/**
 * Generate mock performance data for testing
 */
function getMockPerformanceData(categoryId: string, exerciseId?: string, timeFilter?: string) {
  const mockCategories: Record<string, any> = {
    strength: {
      name: "Strength",
      exercise: "Back Squat",
      unit: "kg",
      dataPoints: [
        { date: "2026-01-02T08:30:00.000Z", dateFormatted: "02 Jan", value: 110, displayValue: "110 kg", unit: "kg", isPB: false },
        { date: "2026-01-03T09:15:00.000Z", dateFormatted: "03 Jan", value: 115, displayValue: "115 kg", unit: "kg", isPB: false },
        { date: "2026-01-04T10:00:00.000Z", dateFormatted: "04 Jan", value: 120, displayValue: "120 kg", unit: "kg", isPB: false },
        { date: "2026-01-05T08:45:00.000Z", dateFormatted: "05 Jan", value: 118, displayValue: "118 kg", unit: "kg", isPB: false },
        { date: "2026-01-06T07:30:00.000Z", dateFormatted: "06 Jan", value: 125, displayValue: "125 kg", unit: "kg", isPB: true }
      ],
      personalBest: { value: 125, displayValue: "125 kg", date: "06 Jan 2026" },
      totals: {
        totalSets: { value: 24, label: "Total Sets" },
        totalReps: { value: 168, label: "Total Reps" },
        totalWeight: { value: 18900, label: "Total Weight", unit: "kg" }
      }
    },
    power: {
      name: "Power",
      exercise: "Snatch",
      unit: "kg",
      dataPoints: [
        { date: "2026-01-02T09:00:00.000Z", dateFormatted: "02 Jan", value: 85, displayValue: "85 kg", unit: "kg", isPB: false },
        { date: "2026-01-03T10:00:00.000Z", dateFormatted: "03 Jan", value: 88, displayValue: "88 kg", unit: "kg", isPB: false },
        { date: "2026-01-04T09:30:00.000Z", dateFormatted: "04 Jan", value: 90, displayValue: "90 kg", unit: "kg", isPB: false },
        { date: "2026-01-05T10:15:00.000Z", dateFormatted: "05 Jan", value: 92, displayValue: "92 kg", unit: "kg", isPB: false },
        { date: "2026-01-06T09:00:00.000Z", dateFormatted: "06 Jan", value: 95, displayValue: "95 kg", unit: "kg", isPB: true }
      ],
      personalBest: { value: 95, displayValue: "95 kg", date: "06 Jan 2026" },
      totals: {
        totalSets: { value: 20, label: "Total Sets" },
        totalReps: { value: 120, label: "Total Reps" },
        totalWeight: { value: 10800, label: "Total Weight", unit: "kg" }
      }
    },
    speed: {
      name: "Speed",
      exercise: "Sprint 20m",
      unit: "s",
      dataPoints: [
        { date: "2026-01-02T16:30:00.000Z", dateFormatted: "02 Jan", value: 3.5, displayValue: "3.50 s", unit: "s", isPB: false },
        { date: "2026-01-03T17:00:00.000Z", dateFormatted: "03 Jan", value: 3.4, displayValue: "3.40 s", unit: "s", isPB: false },
        { date: "2026-01-04T16:45:00.000Z", dateFormatted: "04 Jan", value: 3.3, displayValue: "3.30 s", unit: "s", isPB: false },
        { date: "2026-01-05T17:15:00.000Z", dateFormatted: "05 Jan", value: 3.2, displayValue: "3.20 s", unit: "s", isPB: false },
        { date: "2026-01-06T16:30:00.000Z", dateFormatted: "06 Jan", value: 3.1, displayValue: "3.10 s", unit: "s", isPB: true }
      ],
      personalBest: { value: 3.1, displayValue: "3.10 s", date: "06 Jan 2026" },
      totals: {
        totalSets: { value: 15, label: "Total Sets" },
        totalDistance: { value: "0.30", label: "Total Distance", unit: "km" },
        totalTime: { value: "3:25", label: "Total Time" }
      }
    },
    endurance: {
      name: "Endurance",
      exercise: "1km Run",
      unit: "time",
      dataPoints: [
        { date: "2026-01-02T06:30:00.000Z", dateFormatted: "02 Jan", value: 300, displayValue: "5:00", unit: "time", isPB: false },
        { date: "2026-01-03T06:45:00.000Z", dateFormatted: "03 Jan", value: 290, displayValue: "4:50", unit: "time", isPB: false },
        { date: "2026-01-04T07:00:00.000Z", dateFormatted: "04 Jan", value: 285, displayValue: "4:45", unit: "time", isPB: false },
        { date: "2026-01-05T06:30:00.000Z", dateFormatted: "05 Jan", value: 280, displayValue: "4:40", unit: "time", isPB: false },
        { date: "2026-01-06T06:45:00.000Z", dateFormatted: "06 Jan", value: 275, displayValue: "4:35", unit: "time", isPB: true }
      ],
      personalBest: { value: 275, displayValue: "4:35", date: "06 Jan 2026" },
      totals: {
        totalSets: { value: 5, label: "Total Sets" },
        totalDistance: { value: "5.00", label: "Total Distance", unit: "km" },
        totalTime: { value: "23:50", label: "Total Time" },
        totalCalories: { value: 450, label: "Total Calories", unit: "cal" }
      }
    }
  };

  // Default to strength if no match
  const mockData = mockCategories.strength;

  return {
    message: "Performance graph data fetched successfully (MOCK DATA)",
    data: {
      category: {
        _id: categoryId || "689c5a83bafbbca89c86b91b",
        name: mockData.name
      },
      exercise: exerciseId ? {
        _id: exerciseId,
        name: mockData.exercise
      } : null,
      timeFilter: timeFilter || "7D",
      personalBest: mockData.personalBest,
      totals: mockData.totals,
      dataPoints: mockData.dataPoints
    }
  };
}

// Category graph directions
const PERF_CATEGORY_DIRECTIONS: Record<string, string> = {
  Strength: "up", // Higher weight is better
  Power: "up", // Higher weight is better
  Speed: "down", // Lower time is better
  Endurance: "down", // Lower time is better (for fixed distance)
};

/**
 * Helper function to format time in seconds to readable format
 */
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(2)} s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  } else {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
};

/**
 * Helper function to calculate pace (min/km)
 */
const calculatePace = (timeSeconds: number, distanceKm: number): string => {
  if (distanceKm === 0) return "N/A";
  const paceSeconds = timeSeconds / distanceKm;
  const mins = Math.floor(paceSeconds / 60);
  const secs = Math.floor(paceSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}/km`;
};

/**
 * Unified Performance Graph API
 * 
 * Single endpoint: GET /physical-performances/graph
 * 
 * Query Parameters:
 * - type: "categories" | "exercises" | "data"
 * - categoryId: Required when type="exercises"
 * - exerciseId: Required when type="data"
 * - timeFilter: "7D" | "30D" | "90D" | "all" (optional, default: "30D")
 */
export const getPerformanceGraph = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User is not authenticated.");
    }

    const { ChallengeSubCategory } = await import("../models/Challenge_Sub_Category.js");

    const {
      type, // kept for backwards compatibility, has no effect
      categoryId,
      exerciseId,
      timeFilter = "30D",
      mock,
    } = req.query;

    // Return mock data if requested
    if (mock === "true") {
      return getMockPerformanceData(categoryId as string, exerciseId as string, timeFilter as string);
    }

    if (!categoryId) {
      throw new Error("categoryId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId as string)) {
      throw new Error("Invalid category ID");
    }

    // Get sub-category details (categoryId field accepts sub-category ID)
    const subCategory = await ChallengeSubCategory.findById(categoryId)
      .select("_id name challengeCategory")
      .populate("challengeCategory", "name")
      .lean();

    if (!subCategory) {
      throw new Error("Category not found");
    }

    const parentCategory = subCategory.challengeCategory as any;
    const categoryName = parentCategory?.name || "";

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

    // Get all performance sets for this user and sub-category
    const performanceQuery: any = { user: req.user.id };
    if (startDate) {
      performanceQuery.date = { $gte: startDate };
    }

    const performances = await PhysicalPerformance.find(performanceQuery)
      .select("_id date")
      .sort({ date: 1 })
      .lean();

    const performanceIds = performances.map((p) => p._id);

    // Build query for performance sets using subCategory field
    const setsQuery: any = {
      performance: { $in: performanceIds },
      subCategory: categoryId,
    };

    // If exerciseId provided, filter by specific exercise
    if (exerciseId && mongoose.Types.ObjectId.isValid(exerciseId as string)) {
      setsQuery.exercise = exerciseId;
    }

    const performanceSets = await PerformanceSet.find(setsQuery)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("exercise", "name entityType")
      .lean();

    // Get exercise details if exerciseId provided
    let exercise = null;
    if (exerciseId && mongoose.Types.ObjectId.isValid(exerciseId as string)) {
      exercise = await ChallengeCategoryExercise.findById(exerciseId)
        .select("_id name")
        .lean();
    }

    // Build graph data based on parent category name
    const { dataPoints, totals, personalBest } = buildGraphData(
      performances,
      performanceSets,
      categoryName,
      exercise
    );

    return {
      message: "Performance graph data fetched successfully",
      data: {
        category: {
          _id: subCategory._id,
          name: subCategory.name,
          parentCategory: parentCategory ? {
            _id: parentCategory._id,
            name: parentCategory.name,
          } : null,
        },
        exercise: exercise ? {
          _id: exercise._id,
          name: exercise.name,
        } : null,
        timeFilter,
        personalBest,
        totals,
        dataPoints,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Build graph data from performance sets
 */
function buildGraphData(
  performances: any[],
  performanceSets: any[],
  categoryName: string,
  exercise: any
) {
  // Create a map of performance ID to date
  const performanceDateMap = new Map<string, Date>();
  performances.forEach((p) => {
    performanceDateMap.set(p._id.toString(), new Date(p.date));
  });

  // Group sets by performance (session)
  const sessionMap = new Map<string, any[]>();
  performanceSets.forEach((set) => {
    const perfId = set.performance?.toString();
    if (perfId) {
      if (!sessionMap.has(perfId)) {
        sessionMap.set(perfId, []);
      }
      sessionMap.get(perfId)!.push(set);
    }
  });

  const dataPoints: any[] = [];
  let totalSets = 0;
  let totalReps = 0;
  let totalWeight = 0;
  let totalDistance = 0;
  let totalTime = 0;
  let totalCalories = 0;

  let personalBestValue: number | null = null;
  let personalBestIndex = -1;

  const isStrengthOrPower = categoryName === "Strength" || categoryName === "Power";
  const isSpeed = categoryName === "Speed";
  const isEndurance = categoryName === "Endurance";
  const exerciseName = exercise?.name?.toLowerCase() || "";
  const isFixedTimeDistance =
    exerciseName.includes("assault") || exerciseName.includes("bike");

  // For each session, calculate the primary metric
  sessionMap.forEach((sets, perfId) => {
    const sessionDate = performanceDateMap.get(perfId);
    if (!sessionDate) return;

    let sessionTopSetLoad = 0;
    let sessionFastestTime = Infinity;
    let sessionMaxDistance = 0;
    let sessionSets = 0;
    let sessionReps = 0;
    let sessionWeight = 0;
    let sessionDistance = 0;
    let sessionTime = 0;
    let sessionCalories = 0;
    let sessionRpeSum = 0;
    let sessionRpeCount = 0;

    sets.forEach((set) => {
      if (set.variation && Array.isArray(set.variation)) {
        set.variation.forEach((v: any) => {
          const setCount = v.sets || 1;
          const weight = v.weight || 0;
          const reps = v.reps || 0;
          const distance = v.distance || 0;
          const time = v.time || v.duration || 0;
          const rpe = v.rpe;

          sessionSets += setCount;
          sessionReps += reps * setCount;
          sessionWeight += weight * reps * setCount;
          sessionDistance += distance * setCount;
          sessionTime += time * setCount;

          // Calculate calories if available (estimate for assault bike)
          if (isFixedTimeDistance && distance > 0) {
            sessionCalories += Math.round(distance * 35); // Rough estimate
          }

          if (rpe) {
            sessionRpeSum += rpe * setCount;
            sessionRpeCount += setCount;
          }

          // Track top set for strength/power
          if (isStrengthOrPower && weight > sessionTopSetLoad) {
            sessionTopSetLoad = weight;
          }

          // Track fastest time for speed
          if (isSpeed && time > 0 && time < sessionFastestTime) {
            sessionFastestTime = time;
          }

          // Track max distance for endurance (fixed time)
          if (isEndurance && isFixedTimeDistance && distance > sessionMaxDistance) {
            sessionMaxDistance = distance;
          }

          // Track fastest time for endurance (fixed distance)
          if (isEndurance && !isFixedTimeDistance && time > 0 && time < sessionFastestTime) {
            sessionFastestTime = time;
          }
        });
      }
    });

    // Update totals
    totalSets += sessionSets;
    totalReps += sessionReps;
    totalWeight += sessionWeight;
    totalDistance += sessionDistance;
    totalTime += sessionTime;
    totalCalories += sessionCalories;

    // Determine primary value for graph
    let value = 0;
    let displayValue = "";
    let unit = "";

    if (isStrengthOrPower) {
      value = sessionTopSetLoad;
      displayValue = `${value} kg`;
      unit = "kg";
    } else if (isSpeed) {
      value = sessionFastestTime === Infinity ? 0 : sessionFastestTime;
      displayValue = formatTime(value);
      unit = "s";
    } else if (isEndurance) {
      if (isFixedTimeDistance) {
        value = sessionMaxDistance;
        displayValue = `${(value / 1000).toFixed(2)} km`;
        unit = "km";
      } else {
        value = sessionFastestTime === Infinity ? 0 : sessionFastestTime;
        displayValue = formatTime(value);
        unit = "time";
      }
    }

    // Skip if no valid value
    if (value === 0 && !isSpeed) return;

    // Check for PB
    const isLowerBetter = isSpeed || (isEndurance && !isFixedTimeDistance);
    if (personalBestValue === null) {
      personalBestValue = value;
      personalBestIndex = dataPoints.length;
    } else {
      const isBetter = isLowerBetter
        ? value < personalBestValue && value > 0
        : value > personalBestValue;
      if (isBetter) {
        personalBestValue = value;
        personalBestIndex = dataPoints.length;
      }
    }

    const avgRpe = sessionRpeCount > 0 ? (sessionRpeSum / sessionRpeCount).toFixed(1) : null;

    const dateFormatted = sessionDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Build tooltip based on category
    let tooltip: any = {
      exerciseName: exercise.name,
      date: dateFormatted,
    };

    if (isStrengthOrPower) {
      const topSetReps = sets[0]?.variation?.find((v: any) => v.weight === sessionTopSetLoad)?.reps || 0;
      tooltip = {
        ...tooltip,
        primaryLine: `Top Set ${sessionTopSetLoad} kg × ${topSetReps}`,
        secondaryLine: `${sessionSets} Sets • ${sessionWeight.toLocaleString()} kg Volume${avgRpe ? ` • Avg RPE ${avgRpe}` : ""}`,
      };
    } else if (isSpeed) {
      tooltip = {
        ...tooltip,
        primaryLine: `Fastest ${displayValue} (${exercise.name})`,
        secondaryLine: `${sessionSets} Sets • ${(sessionDistance / 1000).toFixed(2)} km Total Distance${avgRpe ? ` • Avg RPE ${avgRpe}` : ""}`,
      };
    } else if (isEndurance) {
      if (isFixedTimeDistance) {
        tooltip = {
          ...tooltip,
          primaryLine: `Distance ${(sessionMaxDistance / 1000).toFixed(2)} km`,
          secondaryLine: `${sessionCalories} Calories • Avg Speed ${sessionTime > 0 ? ((sessionMaxDistance / 1000) / (sessionTime / 3600)).toFixed(1) : 0} km/h${avgRpe ? ` • Avg RPE ${avgRpe}` : ""}`,
        };
      } else {
        const pace = calculatePace(value, sessionDistance / 1000);
        tooltip = {
          ...tooltip,
          primaryLine: `Time ${displayValue} (${exercise.name})`,
          secondaryLine: `${sessionSets} Set • Avg Pace ${pace}${avgRpe ? ` • Avg RPE ${avgRpe}` : ""}`,
        };
      }
    }

    dataPoints.push({
      date: sessionDate.toISOString(),
      dateFormatted,
      value,
      displayValue,
      unit,
      isPB: false,
      performanceId: perfId,
      sessionSummary: {
        sets: sessionSets,
        reps: sessionReps,
        weight: sessionWeight,
        distance: sessionDistance,
        time: sessionTime,
        calories: sessionCalories,
        avgRpe,
      },
      tooltip,
    });
  });

  // Mark PB
  if (personalBestIndex >= 0 && dataPoints[personalBestIndex]) {
    dataPoints[personalBestIndex].isPB = true;
  }

  // Sort by date
  dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Build totals object based on category
  let totals: any = {};
  if (isStrengthOrPower) {
    totals = {
      totalSets: { value: totalSets, label: "Total Sets" },
      totalReps: { value: totalReps, label: "Total Reps" },
      totalWeight: { value: totalWeight, label: "Total Weight", unit: "kg" },
    };
  } else if (isSpeed) {
    totals = {
      totalSets: { value: totalSets, label: "Total Sets" },
      totalDistance: { value: (totalDistance / 1000).toFixed(2), label: "Total Distance", unit: "km" },
      totalTime: { value: formatTime(totalTime), label: "Total Time" },
    };
  } else if (isEndurance) {
    totals = {
      totalSets: { value: totalSets, label: "Total Sets" },
      totalDistance: { value: (totalDistance / 1000).toFixed(2), label: "Total Distance", unit: "km" },
      totalTime: { value: formatTime(totalTime), label: "Total Time" },
    };
    if (isFixedTimeDistance) {
      totals.totalCalories = { value: totalCalories, label: "Total Calories", unit: "cal" };
    }
  }

  // Build personal best object
  const personalBest =
    personalBestIndex >= 0 && dataPoints[personalBestIndex]
      ? {
          value: dataPoints[personalBestIndex].value,
          displayValue: dataPoints[personalBestIndex].displayValue,
          date: dataPoints[personalBestIndex].dateFormatted,
          performanceId: dataPoints[personalBestIndex].performanceId,
        }
      : null;

  return { dataPoints, totals, personalBest };
}

// ========================================
// EXERCISE COMPLETED GRAPH API
// ========================================

/**
 * Exercise Completed Graph API
 * 
 * Single endpoint: GET /physical-performances/exercise-completed
 * 
 * Query Parameters:
 * - view: "weekly" | "monthly" (default: "weekly")
 * - date: ISO date string - for weekly view, any date within the target week
 * - year: number - for monthly view, the target year (default: current year)
 * - userId: optional - for coaches/gym owners to view athlete's data
 */
export const getExerciseCompletedGraph = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User is not authenticated.");
    }

    const {
      view = "weekly",
      date,
      year,
      userId,
    } = req.query;

    // Allow viewing another user's data (for coaches/gym owners)
    const targetUserId = userId || req.user.id;

    // Get all category IDs for the 4 performance categories
    const categories = await ChallengeCategory.find({
      name: { $in: ["Strength", "Power", "Speed", "Endurance"] },
    })
      .select("_id name")
      .lean();

    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), cat.name);
    });

    const categoryIds = categories.map((c) => c._id);

    if (view === "weekly") {
      return await getWeeklyData(targetUserId as string, date as string, categoryMap, categoryIds);
    } else if (view === "monthly") {
      return await getMonthlyData(targetUserId as string, year as string, categoryMap, categoryIds);
    } else {
      throw new Error("Invalid view. Must be 'weekly' or 'monthly'");
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get weekly data (Mon-Sun)
 */
async function getWeeklyData(
  userId: string,
  dateStr: string | undefined,
  categoryMap: Map<string, string>,
  categoryIds: any[]
) {
  // Determine the week based on the provided date or current date
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  
  // Get Monday of the week (start of week)
  const dayOfWeek = targetDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday is 0
  const monday = new Date(targetDate);
  monday.setDate(targetDate.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // Get Sunday of the week (end of week)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Get all performances for this user in the date range
  const performances = await PhysicalPerformance.find({
    user: userId,
    date: { $gte: monday, $lte: sunday },
  })
    .select("_id date")
    .lean();

  const performanceIds = performances.map((p) => p._id);

  // Get all performance sets for these performances
  const performanceSets = await PerformanceSet.find({
    performance: { $in: performanceIds },
    category: { $in: categoryIds },
  })
    .select("performance category variation")
    .lean();

  // Create a map of performance ID to date
  const performanceDateMap = new Map<string, Date>();
  performances.forEach((p) => {
    performanceDateMap.set(p._id.toString(), new Date(p.date));
  });

  // Initialize data for each day of the week
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekData: Array<{
    day: string;
    date: string;
    dateFormatted: string;
    totalSets: number;
    breakdown: {
      Strength: number;
      Power: number;
      Speed: number;
      Endurance: number;
    };
  }> = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);

    weekData.push({
      day: dayNames[i],
      date: currentDay.toISOString().split("T")[0],
      dateFormatted: currentDay.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }),
      totalSets: 0,
      breakdown: {
        Strength: 0,
        Power: 0,
        Speed: 0,
        Endurance: 0,
      },
    });
  }

  // Aggregate sets by day and category
  performanceSets.forEach((set) => {
    const perfDate = performanceDateMap.get(set.performance?.toString() || "");
    if (!perfDate) return;

    const dayIndex = Math.floor(
      (perfDate.getTime() - monday.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (dayIndex >= 0 && dayIndex < 7) {
      const categoryName = categoryMap.get(set.category?.toString() || "") as
        | "Strength"
        | "Power"
        | "Speed"
        | "Endurance"
        | undefined;

      // Count sets from variations
      let setCount = 0;
      if (set.variation && Array.isArray(set.variation)) {
        set.variation.forEach((v: any) => {
          setCount += v.sets || 1;
        });
      }

      weekData[dayIndex].totalSets += setCount;
      if (categoryName && weekData[dayIndex].breakdown[categoryName] !== undefined) {
        weekData[dayIndex].breakdown[categoryName] += setCount;
      }
    }
  });

  // Calculate week totals
  const weekTotals = {
    totalSets: weekData.reduce((sum, d) => sum + d.totalSets, 0),
    breakdown: {
      Strength: weekData.reduce((sum, d) => sum + d.breakdown.Strength, 0),
      Power: weekData.reduce((sum, d) => sum + d.breakdown.Power, 0),
      Speed: weekData.reduce((sum, d) => sum + d.breakdown.Speed, 0),
      Endurance: weekData.reduce((sum, d) => sum + d.breakdown.Endurance, 0),
    },
  };

  return {
    message: "Weekly exercise completed data fetched successfully",
    view: "weekly",
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
    weekLabel: `${monday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
    data: weekData,
    totals: weekTotals,
  };
}

/**
 * Get monthly data (Jan-Dec)
 */
async function getMonthlyData(
  userId: string,
  yearStr: string | undefined,
  categoryMap: Map<string, string>,
  categoryIds: any[]
) {
  const targetYear = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

  // Get start and end of year
  const yearStart = new Date(targetYear, 0, 1, 0, 0, 0, 0);
  const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  // Get all performances for this user in the year
  const performances = await PhysicalPerformance.find({
    user: userId,
    date: { $gte: yearStart, $lte: yearEnd },
  })
    .select("_id date")
    .lean();

  const performanceIds = performances.map((p) => p._id);

  // Get all performance sets for these performances
  const performanceSets = await PerformanceSet.find({
    performance: { $in: performanceIds },
    category: { $in: categoryIds },
  })
    .select("performance category variation")
    .lean();

  // Create a map of performance ID to date
  const performanceDateMap = new Map<string, Date>();
  performances.forEach((p) => {
    performanceDateMap.set(p._id.toString(), new Date(p.date));
  });

  // Initialize data for each month
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthData: Array<{
    month: string;
    monthIndex: number;
    year: number;
    totalSets: number;
    breakdown: {
      Strength: number;
      Power: number;
      Speed: number;
      Endurance: number;
    };
  }> = [];

  for (let i = 0; i < 12; i++) {
    monthData.push({
      month: monthNames[i],
      monthIndex: i,
      year: targetYear,
      totalSets: 0,
      breakdown: {
        Strength: 0,
        Power: 0,
        Speed: 0,
        Endurance: 0,
      },
    });
  }

  // Aggregate sets by month and category
  performanceSets.forEach((set) => {
    const perfDate = performanceDateMap.get(set.performance?.toString() || "");
    if (!perfDate) return;

    const monthIndex = perfDate.getMonth();

    const categoryName = categoryMap.get(set.category?.toString() || "") as
      | "Strength"
      | "Power"
      | "Speed"
      | "Endurance"
      | undefined;

    // Count sets from variations
    let setCount = 0;
    if (set.variation && Array.isArray(set.variation)) {
      set.variation.forEach((v: any) => {
        setCount += v.sets || 1;
      });
    }

    monthData[monthIndex].totalSets += setCount;
    if (categoryName && monthData[monthIndex].breakdown[categoryName] !== undefined) {
      monthData[monthIndex].breakdown[categoryName] += setCount;
    }
  });

  // Calculate year totals
  const yearTotals = {
    totalSets: monthData.reduce((sum, d) => sum + d.totalSets, 0),
    breakdown: {
      Strength: monthData.reduce((sum, d) => sum + d.breakdown.Strength, 0),
      Power: monthData.reduce((sum, d) => sum + d.breakdown.Power, 0),
      Speed: monthData.reduce((sum, d) => sum + d.breakdown.Speed, 0),
      Endurance: monthData.reduce((sum, d) => sum + d.breakdown.Endurance, 0),
    },
  };

  return {
    message: "Monthly exercise completed data fetched successfully",
    view: "monthly",
    year: targetYear,
    data: monthData,
    totals: yearTotals,
  };
}

/**
 * Get all IDs needed for Performance Graph
 * Returns hierarchy: Types (Strength, Power, Speed, Endurance) → Categories → Exercises
 */
export const getPerformanceGraphIds = async () => {
  try {
    const typeColors: { [key: string]: string } = {
      Strength: "#FF0000",
      Power: "#FFA500",
      Speed: "#0000FF",
      Endurance: "#00FF00",
    };

    // Get all 4 types (previously called categories)
    const types = await ChallengeCategory.find({
      name: { $in: ["Strength", "Power", "Speed", "Endurance"] },
    })
      .select("_id name image")
      .lean();

    const orderedTypes = ["Strength", "Power", "Speed", "Endurance"];
    const sortedTypes = orderedTypes
      .map((name) => {
        const type = types.find((t) => t.name === name);
        if (type) {
          return {
            _id: type._id,
            name: type.name,
            image: type.image,
            color: typeColors[type.name] || "#808080",
          };
        }
        return null;
      })
      .filter(Boolean);

    // Get all sub-categories (these are the categories under each type)
    const { ChallengeSubCategory } = await import("../models/Challenge_Sub_Category.js");
    const subCategories = await ChallengeSubCategory.find({
      challengeCategory: { $in: sortedTypes.map((t) => t!._id) },
    })
      .select("_id name challengeCategory")
      .lean();

    // Get all exercises
    const exercises = await ChallengeCategoryExercise.find({
      challengeCategory: { $in: sortedTypes.map((t) => t!._id) },
    })
      .select("_id name challengeCategory subCategory")
      .lean();

    // Structure the response: Types → Categories → Exercises
    let totalCategories = 0;
    let totalExercises = 0;

    const typesWithCategoriesAndExercises = sortedTypes.map((type) => {
      // Get categories (sub-categories) for this type
      const typeCategories = subCategories
        .filter(
          (sc: any) =>
            sc.challengeCategory &&
            sc.challengeCategory.toString() === type!._id.toString()
        )
        .map((category: any) => {
          // Get exercises for this category
          const categoryExercises = exercises
            .filter(
              (e: any) =>
                e.subCategory &&
                e.subCategory.toString() === category._id.toString()
            )
            .map((exercise: any) => ({
              _id: exercise._id,
              name: exercise.name,
            }));

          totalExercises += categoryExercises.length;

          return {
            _id: category._id,
            name: category.name,
            exercises: categoryExercises,
          };
        });

      // Get exercises that belong directly to the type (no sub-category)
      const uncategorizedExercises = exercises
        .filter(
          (e: any) =>
            e.challengeCategory &&
            e.challengeCategory.toString() === type!._id.toString() &&
            !e.subCategory
        )
        .map((exercise: any) => ({
          _id: exercise._id,
          name: exercise.name,
        }));

      // If there are uncategorized exercises, add them under an "Other" category
      if (uncategorizedExercises.length > 0) {
        typeCategories.push({
          _id: null,
          name: "Other",
          exercises: uncategorizedExercises,
        });
        totalExercises += uncategorizedExercises.length;
      }

      totalCategories += typeCategories.length;

      return {
        ...type,
        categories: typeCategories,
      };
    });

    return {
      message: "All Performance Graph IDs fetched successfully",
      data: {
        types: typesWithCategoriesAndExercises,
        summary: {
          totalTypes: sortedTypes.length,
          totalCategories: totalCategories,
          totalExercises: totalExercises,
        },
      },
    };
  } catch (error) {
    throw error;
  }
}
