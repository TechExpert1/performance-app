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

    // Fetch all attendance goals for this user
    const allGoals = await Attendance_Goal.find({ user: userId });

    // 1. TRAINING GOALS – Monthly % of completed goals
    const trainingGoals = allGoals.filter(
      (goal) => goal.type === "Training Goal"
    );

    const trainingByMonth: Record<
      string,
      { total: number; completed: number }
    > = {};

    for (const goal of trainingGoals) {
      if (!goal.endDate) continue;

      const month = dayjs(goal.endDate).format("MMMM");

      if (!trainingByMonth[month]) {
        trainingByMonth[month] = { total: 0, completed: 0 };
      }

      trainingByMonth[month].total += 1;
      if (goal.status === "completed") {
        trainingByMonth[month].completed += 1;
      }
    }

    const trainingGoalSummary = Object.entries(trainingByMonth).map(
      ([month, stats]) => ({
        month,
        percentage: stats.total
          ? Math.round((stats.completed / stats.total) * 100)
          : 0,
      })
    );

    // 2. EVENT GOAL – Strictly get latest created Event goal by _id
    const latestEvent = await Attendance_Goal.findOne({
      user: userId,
      type: "Event",
      endDate: { $exists: true },
    })
      .sort({ _id: -1 }) // ObjectId has creation time to millisecond precision
      .lean();

    let eventGoalSummary = {};
    if (latestEvent) {
      const objectId = latestEvent._id as mongoose.Types.ObjectId;
      const createdAt = latestEvent.createdAt
        ? dayjs(latestEvent.createdAt)
        : dayjs(objectId.getTimestamp());

      const endDate = dayjs(latestEvent.endDate);
      const now = dayjs();

      const totalDuration = endDate.diff(createdAt, "day");
      const daysPassed = now.diff(createdAt, "day");
      const daysLeft = endDate.diff(now, "day");

      let percentage = 0;
      if (latestEvent.status === "completed") {
        percentage = 200;
      } else if (totalDuration > 0) {
        percentage = Math.min(
          Math.round((daysPassed / totalDuration) * 100),
          100
        );
      }

      eventGoalSummary = {
        title: latestEvent.name,
        startDate: createdAt.toDate(),
        endDate: endDate.toDate(),
        percentage,
        status: latestEvent.status,
        daysLeft,
      };
    }

    // 3. PERSONAL GOALS – Return raw list
    const personalGoals = allGoals.filter(
      (goal) => goal.type === "Personal Goal"
    );

    return {
      message: "Attendance goals summary fetched",
      data: {
        trainingGoals: trainingGoalSummary,
        eventGoal: eventGoalSummary,
        personalGoals,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch attendance goals summary");
  }
};

export const getAttendanceGoalsGroupedByType = async (
  req: AuthenticatedRequest
) => {
  try {
    const {
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filters
    } = req.query as Record<string, string>;

    const query: Record<string, any> = {};

    if (req.user && req.user.id) {
      query.user = req.user.id;
    }

    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const sortOption: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const goals = await Attendance_Goal.find(query)
      .populate("user")
      .sort(sortOption);
    const groupedGoals: Record<string, any[]> = {};
    for (const goal of goals) {
      const type = goal.type || "Unknown";
      if (!groupedGoals[type]) {
        groupedGoals[type] = [];
      }
      groupedGoals[type].push(goal);
    }

    return {
      message: "Grouped attendance goals fetched successfully",
      data: groupedGoals,
    };
  } catch (error) {
    throw new Error("Failed to fetch grouped attendance goals");
  }
};
