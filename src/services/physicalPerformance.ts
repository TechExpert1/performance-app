import { Request } from "express";
import mongoose from "mongoose";
import PhysicalPerformance from "../models/Physical_Performance.js";
import PerformanceSet from "../models/Physical_Performance_Set.js";
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
    .populate("type")
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
        .populate("type")
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
