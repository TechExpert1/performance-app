import { AuthenticatedRequest } from "../middlewares/user.js";
import { Request } from "express";
import { SortOrder } from "mongoose";
import dayjs from "dayjs";
import Attendance_Goal from "../models/Attendance_Goal.js";
import mongoose from "mongoose";
export const createAttendanceGoal = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const payload = {
      user: req.user.id,
      ...req.body,
    };

    const created = await Attendance_Goal.create(payload);

    return {
      message: "Attendance goal created successfully",
      data: created,
    };
  } catch (error) {
    throw new Error("Failed to create attendance goal");
  }
};

export const updateAttendanceGoal = async (req: AuthenticatedRequest) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Attendance_Goal.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return { message: "Attendance goal not found" };
    }

    return {
      message: "Attendance goal updated successfully",
      data: updated,
    };
  } catch (error) {
    throw new Error("Failed to update attendance goal");
  }
};

export const getAttendanceGoalById = async (req: Request) => {
  try {
    const { id } = req.params;

    const entry = await Attendance_Goal.findById(id).populate("user");

    if (!entry) {
      return { message: "Attendance goal not found" };
    }

    return entry;
  } catch (error) {
    throw new Error("Failed to fetch attendance goal by ID");
  }
};

export const removeAttendanceGoal = async (req: Request) => {
  try {
    const { id } = req.params;
    const entry = await Attendance_Goal.findByIdAndDelete(id);

    if (!entry) {
      return { message: "Attendance goal not found" };
    }

    return {
      message: "Attendance goal deleted successfully",
    };
  } catch (error) {
    throw new Error("Failed to delete attendance goal");
  }
};

export const getAllAttendanceGoals = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return { message: "User not authenticated" };
    }

    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filters
    } = req.query as Record<string, string>;

    const query: Record<string, any> = {
      user: req.user.id,
    };

    const sortOption: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const dataQuery = Attendance_Goal.find(query)
      .populate("user")
      .sort(sortOption);

    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      const paginatedData = await dataQuery.skip(skip).limit(Number(limit));
      const total = await Attendance_Goal.countDocuments(query);

      return {
        message: "Paginated attendance goals fetched",
        data: paginatedData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
          totalResults: total,
        },
      };
    }

    const allGoals = await dataQuery;
    return {
      message: "Attendance goals fetched successfully",
      data: allGoals,
    };
  } catch (error) {
    throw new Error("Failed to fetch attendance goals");
  }
};

export const getHomeStats = async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return { message: "User not authenticated" };
    }

    const userId = req.user.id;
    const year = req.query.year;

    if (!year) {
      return { message: "Year is required in query params" };
    }

    const allTrainingGoals = await Attendance_Goal.find({
      user: userId,
      type: "Training Goal",
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });

    const trainingGoalSummary: Record<string, number> = {};

    for (const goal of allTrainingGoals) {
      if (!goal.month || !goal.noOfSessions) continue;
      const month =
        goal.month.charAt(0).toUpperCase() + goal.month.slice(1).toLowerCase();

      trainingGoalSummary[month] =
        (trainingGoalSummary[month] || 0) + Number(goal.noOfSessions);
    }

    const allEventGoals = await Attendance_Goal.find({
      user: userId,
      type: "Event",
      endDate: { $exists: true },
    }).lean();

    const now = dayjs();

    const eventGoalsWithExtras = allEventGoals.map((event) => {
      const createdAt = event.createdAt
        ? dayjs(event.createdAt)
        : dayjs((event._id as mongoose.Types.ObjectId).getTimestamp());
      const endDate = dayjs(event.endDate);

      const totalDuration = endDate.diff(createdAt, "day");
      const daysPassed = now.diff(createdAt, "day");
      const daysLeft = endDate.diff(now, "day");

      const percentage =
        totalDuration > 0
          ? Math.min(Math.round((daysPassed / totalDuration) * 100), 100)
          : 0;

      return {
        ...event,
        daysLeft,
        percentage,
      };
    });

    return {
      "Training Goal": trainingGoalSummary,
      Event: eventGoalsWithExtras,
    };
  } catch (error) {
    console.error("Failed to fetch attendance goals summary", error);
    throw new Error("Failed to fetch attendance goals summary");
  }
};
