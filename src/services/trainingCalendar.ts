import { Request } from "express";
import TrainingCalendar from "../models/Training_Calendar.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { SortOrder } from "mongoose";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import { monthMap } from "../utils/commonConst.js";

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
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};
  const sortOption: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

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

  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
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

  const allTrainings = await dataQuery;

  const groupedByDate: Record<string, any[]> = {};
  if (startDate && endDate) {
    const daysInMonth = dayjs(endDate).date();
    for (let i = 1; i <= daysInMonth; i++) {
      groupedByDate[i.toString()] = [];
    }

    for (const training of allTrainings) {
      const day = dayjs(training.date).date();
      groupedByDate[day.toString()].push(training);
    }
  }

  const weekStart = dayjs().startOf("isoWeek").toDate();
  const weekEnd = dayjs().endOf("isoWeek").toDate();

  const currentWeekTrainings = allTrainings.filter(
    (item) => item.date >= weekStart && item.date <= weekEnd
  );

  const currentWeek: Record<string, any[]> = {};
  for (let i = 0; i < 7; i++) {
    const date = dayjs(weekStart).add(i, "day");
    currentWeek[date.date().toString()] = [];
  }

  for (const training of currentWeekTrainings) {
    const day = dayjs(training.date).date();
    const key = day.toString();
    if (!currentWeek[key]) {
      currentWeek[key] = [];
    }
    currentWeek[key].push(training);
  }

  return {
    message: "Monthly grouped training calendar fetched with current week",
    data: {
      groupedByDate,
      currentWeek,
    },
  };
};
