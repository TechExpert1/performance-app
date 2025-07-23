import { Request } from "express";
import TrainingCalendar from "../models/Training_Calendar.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { SortOrder } from "mongoose";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import { monthMap } from "../utils/commonConst.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";
dayjs.extend(isoWeek);

export const createTrainingCalendar = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { recurrence, date } = req.body;

  const data: any = {
    user: req.user.id,
    ...req.body,
  };

  if (recurrence && date) {
    const baseDate = dayjs(date);

    if (recurrence === "weekly") {
      data.recurrenceEndDate = baseDate.add(7, "day").toDate();
    } else if (recurrence === "monthly") {
      data.recurrenceEndDate = baseDate.add(1, "month").toDate();
    }
  }
  const created = await TrainingCalendar.create(data);
  return { message: "Training calendar created", data: created };
};
export const updateTrainingCalendar = async (req: AuthenticatedRequest) => {
  const { id } = req.params;
  const updateData = req.body;

  const updated = await TrainingCalendar.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updated) return { message: "Training calendar not found" };

  return { message: "Training calendar updated", data: updated };
};

export const getTrainingCalendarById = async (req: Request) => {
  const { id } = req.params;
  const entry = await TrainingCalendar.findById(id).populate([
    "user",
    "attendees",
    "coaches",
    "sport",
    "category",
    "skill",
  ]);

  if (!entry) return { message: "Training calendar not found" };

  return entry;
};

export const deleteTrainingCalendar = async (req: Request) => {
  const { id } = req.params;
  const entry = await TrainingCalendar.findByIdAndDelete(id);
  if (!entry) return { message: "Training calendar not found" };

  return { message: "Training calendar deleted successfully" };
};

export const getAllTrainingCalendars = async (req: Request) => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "desc",
    month,
    year,
    stats,
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};

  // Apply dynamic filters
  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
    }
  }

  const sortOption: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const isStats = stats === "true";

  if (isStats) {
    const now = dayjs();
    const startDate = now.startOf("month").toDate();
    const endDate = now.endOf("month").toDate();
    query.date = { $gte: startDate, $lte: endDate };

    const allTrainings = await TrainingCalendar.find(query)
      .populate(["user", "attendees", "sport", "category", "skill"])
      .sort(sortOption);

    // Group by current month
    const currentMonth: Record<string, any[]> = {};
    const daysInMonth = now.daysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonth[i.toString()] = [];
    }
    for (const training of allTrainings) {
      const day = dayjs(training.date).date().toString();
      currentMonth[day].push(training);
    }

    // Group by current ISO week
    const weekStart = now.startOf("isoWeek").startOf("day");
    const weekEnd = now.endOf("isoWeek").endOf("day");

    const currentWeekTrainings = allTrainings.filter(
      (t) =>
        dayjs(t.date).isAfter(weekStart.subtract(1, "ms")) &&
        dayjs(t.date).isBefore(weekEnd.add(1, "ms"))
    );

    const currentWeek: Record<string, any[]> = {};
    for (let i = 0; i < 7; i++) {
      const date = weekStart.add(i, "day");
      currentWeek[date.date().toString()] = [];
    }
    for (const training of currentWeekTrainings) {
      const day = dayjs(training.date).date().toString();
      currentWeek[day].push(training);
    }

    // === Skill percentage calculations ===
    const getSkillPercentages = (trainings: any[]) => {
      const total = trainings.length;
      const counts: Record<string, number> = {};

      for (const training of trainings) {
        const skillId = training.skill?._id?.toString() || "Unknown";
        counts[skillId] = (counts[skillId] || 0) + 1;
      }

      const percentages: Record<string, number> = {};
      for (const skillId in counts) {
        percentages[skillId] = parseFloat(
          ((counts[skillId] / total) * 100).toFixed(2)
        );
      }

      return percentages;
    };

    const monthlySkillPercentages = getSkillPercentages(allTrainings);
    const weeklySkillPercentages = getSkillPercentages(currentWeekTrainings);

    // 🆕 Fetch all skills for the given sport
    const allSkillsForSport = req.query.category
      ? await SportCategorySkill.find({ category: req.query.category }).lean()
      : [];

    const skillNameMap: Record<string, string> = {};
    for (const skill of allSkillsForSport) {
      skillNameMap[skill._id.toString()] = skill.name;
    }
    skillNameMap["Unknown"] = "Unknown";

    const formatPercentages = (data: Record<string, number>) => {
      const result: Record<string, number> = {};

      for (const skill of allSkillsForSport) {
        const id = skill._id.toString();
        result[skill.name] = data[id] ?? 0; // Default to 0%
      }

      if (data["Unknown"]) {
        result["Unknown"] = data["Unknown"];
      }

      return result;
    };

    return {
      message: "Grouped training calendar (month & week)",
      data: {
        currentMonth,
        currentWeek,
        skillPercentages: {
          monthly: formatPercentages(monthlySkillPercentages),
          weekly: formatPercentages(weeklySkillPercentages),
        },
      },
    };
  }

  // Regular flow with pagination and optional filters
  let startDate: Date | undefined, endDate: Date | undefined;
  if (month && year) {
    const monthIndex = monthMap[month.toLowerCase()];
    const numericYear = Number(year);
    if (monthIndex !== undefined && !isNaN(numericYear)) {
      startDate = dayjs()
        .year(numericYear)
        .month(monthIndex)
        .startOf("month")
        .toDate();
      endDate = dayjs()
        .year(numericYear)
        .month(monthIndex)
        .endOf("month")
        .toDate();
      query.date = { $gte: startDate, $lte: endDate };
    }
  }

  const dataQuery = TrainingCalendar.find(query)
    .populate(["user", "attendees", "sport", "category", "skill"])
    .sort(sortOption);

  if (page && limit) {
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedData = await dataQuery.skip(skip).limit(Number(limit));
    const total = await TrainingCalendar.countDocuments(query);

    return {
      message: "Paginated training calendar fetched",
      data: paginatedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        totalResults: total,
      },
    };
  }

  const allData = await dataQuery;
  return {
    message: "All training calendars fetched",
    data: allData,
  };
};
