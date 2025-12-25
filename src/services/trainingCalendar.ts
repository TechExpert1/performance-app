import { Request } from "express";
import TrainingCalendar from "../models/Training_Calendar.js";
import Training_Member from "../models/Training_Member.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { SortOrder } from "mongoose";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import GymMember from "../models/Gym_Member.js";
import User from "../models/User.js";
import Gym from "../models/Gym.js";
import { monthMap } from "../utils/commonConst.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";
import Notification from "../models/Notification.js";
// import { sendPushNotification } from "../config/firebase.js";
dayjs.extend(isoWeek);

/**
 * Helper function to generate virtual recurring instances for a training
 * @param training The training document to generate instances for
 * @param startDate Start of the date range to generate instances for
 * @param endDate End of the date range to generate instances for
 * @returns Array of virtual training instances
 */
const generateRecurringInstances = (
  training: any,
  startDate: Date,
  endDate: Date
): any[] => {
  const instances: any[] = [];

  if (!training.recurrence || training.recurrenceStatus !== "active") {
    return instances;
  }

  const trainingDate = dayjs(training.date);
  const rangeStart = dayjs(startDate);
  const rangeEnd = dayjs(endDate);

  // Calculate the interval based on recurrence type
  const intervalDays = training.recurrence === "weekly" ? 7 : 0;
  const intervalMonths = training.recurrence === "monthly" ? 1 : 0;

  // Start from the next occurrence after the original date
  let currentDate = trainingDate;
  if (intervalDays > 0) {
    currentDate = currentDate.add(intervalDays, "day");
  } else if (intervalMonths > 0) {
    currentDate = currentDate.add(intervalMonths, "month");
  }

  // Generate instances within the date range (max 52 to prevent infinite loops)
  let maxIterations = 52;
  while (currentDate.isBefore(rangeEnd) && maxIterations > 0) {
    maxIterations--;

    // Check if this date falls within our range
    if (currentDate.isAfter(rangeStart) || currentDate.isSame(rangeStart, "day")) {
      // Create a virtual instance
      const trainingObj = training.toObject ? training.toObject() : { ...training };
      const virtualInstance = {
        ...trainingObj,
        _id: `recur_${training._id}_${currentDate.format("YYYY-MM-DD")}`,
        parentTrainingId: training._id,
        isRecurringInstance: true,
        date: currentDate.toDate(),
        // Keep original times but with new date
        createdAt: training.createdAt,
        updatedAt: training.updatedAt,
      };

      instances.push(virtualInstance);
    }

    // Move to next occurrence
    if (intervalDays > 0) {
      currentDate = currentDate.add(intervalDays, "day");
    } else if (intervalMonths > 0) {
      currentDate = currentDate.add(intervalMonths, "month");
    }
  }

  return instances;
};

export const createTrainingCalendar = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { attendees, ...trainingData } = req.body;

  const data: any = {
    user: req.user.id,
    ...trainingData,
  };

  // Normalize recurrence field - convert empty string, "none", or undefined to null
  if (data.recurrence === "" || data.recurrence === "none" || data.recurrence === undefined) {
    data.recurrence = null;
  }

  // Normalize recurrenceStatus - convert "inactive" to "in-active"
  if (data.recurrenceStatus === "inactive") {
    data.recurrenceStatus = "in-active";
  }

  // Set recurrence end date and status if recurrence is specified
  if (data.recurrence && data.date) {
    const baseDate = dayjs(data.date);
    if (data.recurrence === "weekly") {
      data.recurrenceEndDate = baseDate.add(7, "day").toDate();
    } else if (data.recurrence === "monthly") {
      data.recurrenceEndDate = baseDate.add(1, "month").toDate();
    }
    // Set recurrence status to active when recurrence is specified
    if (!data.recurrenceStatus || data.recurrenceStatus === "in-active") {
      data.recurrenceStatus = "active";
    }
  }

  // Get gym from user's gym membership if not provided
  if (!data.gym && data.trainingScope === "gym") {
    const user = await User.findById(req.user.id).select("gym");
    if (user?.gym) {
      data.gym = user.gym;
    }
  }

  const created = (await TrainingCalendar.create(data)) as { _id: string };

  if (Array.isArray(attendees) && attendees.length > 0) {
    const memberDocs = attendees.map((userId: string) => ({
      user: userId,
      training: created._id,
      status: "approved",
      checkInStatus: "not-checked-in",
    }));

    await Training_Member.insertMany(memberDocs);
  }
  if (
    data.trainingScope === "gym" &&
    Array.isArray(attendees) &&
    attendees.length > 0
  ) {
    const message = `Your training has been scheduled by ${req?.user.name || "gym Owner"
      }.`;

    const notificationTasks = attendees.map(async (userId: string) => {
      const notification = {
        user: userId,
        message,
        entityType: "training_calendar",
        entityId: created._id,
        isRead: false,
      };

      const user = await User.findById(userId).select("deviceToken");

      // if (user?.deviceToken) {
      //   await sendPushNotification(
      //     user.deviceToken,
      //     "New Training Scheduled",
      //     message,
      //     created._id.toString(),
      //     "training_calendar"
      //   );
      // }

      return notification;
    });

    const notifications = await Promise.all(notificationTasks);
    await Notification.insertMany(notifications);
  }

  // Fetch the created training with populated fields and attendees
  const createdTraining = await TrainingCalendar.findById(created._id).populate([
    "user",
    "coach",
    "sport",
    "category",
    "categories",
    "skill",
    "skills",
    "gym",
  ]);

  const trainingAttendees = await Training_Member.find({
    training: created._id,
  }).populate("user");

  // Filter out attendees with null user (deleted user accounts)
  const validAttendees = trainingAttendees.filter(a => a.user !== null);

  return {
    message: "Training calendar created",
    data: {
      ...createdTraining?.toObject(),
      attendees: validAttendees,
    },
  };
};

export const updateTrainingCalendar = async (req: AuthenticatedRequest) => {
  const { id } = req.params;
  const { attendees, ...updateData } = req.body;

  // Normalize recurrence field - convert empty string, "none", or undefined to null
  if (updateData.recurrence === "" || updateData.recurrence === "none" || updateData.recurrence === undefined) {
    updateData.recurrence = null;
  }

  // Normalize recurrenceStatus - convert "inactive" to "in-active"
  if (updateData.recurrenceStatus === "inactive") {
    updateData.recurrenceStatus = "in-active";
  }

  // Fetch current training to get the date if not provided in update
  const existingTraining = await TrainingCalendar.findById(id);
  if (!existingTraining) return { message: "Training calendar not found" };

  // Handle recurrence changes - calculate recurrenceEndDate if recurrence is being set/changed
  if (updateData.recurrence) {
    const dateToUse = updateData.date || existingTraining.date;
    if (dateToUse) {
      const baseDate = dayjs(dateToUse);
      if (updateData.recurrence === "weekly") {
        updateData.recurrenceEndDate = baseDate.add(7, "day").toDate();
      } else if (updateData.recurrence === "monthly") {
        updateData.recurrenceEndDate = baseDate.add(1, "month").toDate();
      }
      // Set recurrence status to active when recurrence is specified
      if (!updateData.recurrenceStatus || updateData.recurrenceStatus === "in-active") {
        updateData.recurrenceStatus = "active";
      }
    }
  }

  // Update the training calendar
  const updated = await TrainingCalendar.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updated) return { message: "Training calendar not found" };

  // Handle attendees update if provided
  if (attendees !== undefined) {
    // Remove all existing attendees for this training
    await Training_Member.deleteMany({ training: id });

    // Add new attendees if provided
    if (Array.isArray(attendees) && attendees.length > 0) {
      const memberDocs = attendees.map((userId: string) => ({
        user: userId,
        training: id,
        status: "approved",
        checkInStatus: "not-checked-in",
      }));

      await Training_Member.insertMany(memberDocs);

      // Send notifications if it's a gym training
      if (
        updateData.trainingScope === "gym" ||
        updated.trainingScope === "gym"
      ) {
        const user = await User.findById(req.user?.id);
        const message = `Your training has been updated by ${user?.name || "gym Owner"
          }.`;

        const notificationTasks = attendees.map(async (userId: string) => {
          const notification = {
            user: userId,
            message,
            entityType: "training_calendar",
            entityId: id,
            isRead: false,
          };

          return notification;
        });

        const notifications = await Promise.all(notificationTasks);
        await Notification.insertMany(notifications);
      }
    }
  }

  // Fetch updated training with populated fields and attendees
  const updatedTraining = await TrainingCalendar.findById(id).populate([
    "user",
    "coach",
    "sport",
    "category",
    "categories",
    "skill",
    "skills",
    "gym",
  ]);

  const trainingAttendees = await Training_Member.find({
    training: id,
  }).populate("user");

  // Filter out attendees with null user (deleted user accounts)
  const validAttendees = trainingAttendees.filter(a => a.user !== null);

  return {
    message: "Training calendar updated",
    data: {
      ...updatedTraining?.toObject(),
      attendees: validAttendees,
    },
  };
};

export const getTrainingCalendarById = async (req: Request) => {
  const { id } = req.params;

  const entry = await TrainingCalendar.findById(id).populate([
    "user",
    "coach",
    "sport",
    "category",
    "categories",
    "skill",
    "skills",
    "gym",
  ]);

  if (!entry) {
    return { message: "Training calendar not found" };
  }

  const attendees = await Training_Member.find({
    training: id,
  })
    .populate("user");

  // Filter out attendees with null user (user account was deleted)
  const validAttendees = attendees.filter(a => a.user !== null);

  return {
    ...entry.toObject(),
    attendees: validAttendees,
  };
};

export const deleteTrainingCalendar = async (req: Request) => {
  const { id } = req.params;
  const entry = await TrainingCalendar.findByIdAndDelete(id);
  if (!entry) return { message: "Training calendar not found" };

  return { message: "Training calendar deleted successfully" };
};

export const getAllTrainingCalendars = async (req: AuthenticatedRequest) => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "desc",
    month,
    year,
    stats,
    user,
    ...filters
  } = req.query as Record<string, string>;

  let query: Record<string, any> = {};

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
    const { user } = req.query;

    if (!user) {
      return {
        message: "Missing 'userId' in query",
        data: null,
      };
    }

    // Step 1: Get the gym of the user
    const gymMember = await GymMember.findOne({
      user,
      status: "active",
    });

    if (!gymMember) {
      return {
        message: "No active gym membership found for this user",
        data: null,
      };
    }

    const gymId = gymMember.gym;

    // Step 2: Filter by current month
    const now = dayjs();
    const startDate = now.startOf("month").toDate();
    const endDate = now.endOf("month").toDate();

    // Step 3: Find all trainings in this gym within the month
    const monthlyTrainings = await TrainingCalendar.find({
      gym: gymId,
      date: { $gte: startDate, $lte: endDate },
      ...filters,
    }).select("_id");

    const trainingIds = monthlyTrainings.map((t) => t._id);

    // Step 4: Find training IDs where this user attended
    const attendedTrainings = await Training_Member.find({
      user,
      training: { $in: trainingIds },
    }).select("training");

    const attendedTrainingIds = attendedTrainings.map((t) =>
      t.training.toString()
    );

    // Step 5: Fetch full training documents
    const allTrainings = await TrainingCalendar.find({
      _id: { $in: attendedTrainingIds },
    })
      .populate(["user", "coach", "sport", "category", "categories", "skill", "skills", "gym"])
      .sort(sortOption);    // Step 6: Group by current month
    const currentMonth: Record<string, any[]> = {};
    const daysInMonth = now.daysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonth[i.toString()] = [];
    }
    for (const training of allTrainings) {
      const day = dayjs(training.date).date().toString();
      currentMonth[day].push(training);
    }

    // Step 7: Group by current ISO week
    const weekStart = now.startOf("isoWeek").startOf("day");
    const weekEnd = now.endOf("isoWeek").endOf("day");
    const weekStartDate = weekStart.toDate();
    const weekEndDate = weekEnd.toDate();

    const currentWeekTrainings = allTrainings.filter((t) => {
      const trainingDate = new Date(t.date);
      return trainingDate >= weekStartDate && trainingDate <= weekEndDate;
    });

    const currentWeek: Record<string, any[]> = {};
    for (let i = 0; i < 7; i++) {
      const date = weekStart.add(i, "day");
      currentWeek[date.date().toString()] = [];
    }
    for (const training of currentWeekTrainings) {
      const day = dayjs(training.date).date().toString();
      currentWeek[day].push(training);
    }

    // === Skill percentage calculation ===
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
        result[skill.name] = data[id] ?? 0;
      }

      if (data["Unknown"]) {
        result["Unknown"] = data["Unknown"];
      }

      return result;
    };
    return {
      message: "User's grouped training calendar (month & week)",
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

  // Automatically use authenticated user's ID if not explicitly provided
  const userId = user || req.user?.id;

  // Role-based filtering
  if (userId) {
    const userDoc = await User.findById(userId).select("role");
    const userRole = userDoc?.role;

    console.log("User role:", userRole, "User ID:", userId);

    // For gym owner: Only show trainings they created
    if (userRole === "gymOwner") {
      query.user = userId;
      console.log("Gym owner query:", JSON.stringify(query, null, 2));
    } else {
      // For athlete, coach, etc: Show trainings they created + trainings where they're attendees
      const userTrainingMembers = await Training_Member.find({
        user: userId,
      }).select("training");

      const attendeeTrainingIds = userTrainingMembers.map((tm) => tm.training);

      console.log("Attendee training IDs count:", attendeeTrainingIds.length);

      // Build the $or condition separately
      const orConditions = [
        { user: userId }, // Trainings created by user
        { _id: { $in: attendeeTrainingIds } }, // Trainings where user is attendee
      ];

      // If there are other filters (like date), we need to combine them properly
      if (Object.keys(query).length > 0) {
        // Move existing query conditions into $and with $or
        const existingConditions = { ...query };
        query = {
          $and: [
            existingConditions,
            { $or: orConditions }
          ]
        };
      } else {
        // No other conditions, just use $or
        query.$or = orConditions;
      }

      console.log("Athlete/Coach query:", JSON.stringify(query, null, 2));
    }
  }

  const dataQuery = TrainingCalendar.find(query)
    .populate(["user", "coach", "sport", "category", "categories", "skill", "skills", "gym"])
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

  // Generate virtual recurring instances if we have a date range
  if (startDate && endDate) {
    // Find all active recurring trainings that could have instances in this date range
    // These trainings might have their original date before the startDate
    const recurringQuery: Record<string, any> = {
      recurrence: { $in: ["weekly", "monthly"] },
      recurrenceStatus: "active",
    };

    // Apply the same user-based filtering for recurring trainings
    if (userId) {
      const userDoc = await User.findById(userId).select("role");
      const userRole = userDoc?.role;

      if (userRole === "gymOwner") {
        recurringQuery.user = userId;
      } else {
        const userTrainingMembers = await Training_Member.find({
          user: userId,
        }).select("training");
        const attendeeTrainingIds = userTrainingMembers.map((tm) => tm.training);
        recurringQuery.$or = [
          { user: userId },
          { _id: { $in: attendeeTrainingIds } },
        ];
      }
    }

    const recurringTrainings = await TrainingCalendar.find(recurringQuery)
      .populate(["user", "coach", "sport", "category", "categories", "skill", "skills", "gym"]);

    const allRecurringInstances: any[] = [];

    for (const training of recurringTrainings) {
      const instances = generateRecurringInstances(training, startDate, endDate);
      allRecurringInstances.push(...instances);
    }

    // Merge original data with recurring instances and sort by date
    const mergedData = [...allData, ...allRecurringInstances].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return {
      message: "All training calendars fetched",
      data: mergedData,
    };
  }

  return {
    message: "All training calendars fetched",
    data: allData,
  };
};

export const getUserMonthlyTrainingCount = async (req: Request) => {
  const { userId, month, year } = req.query as Record<string, string>;

  if (!userId) {
    return {
      message: "Missing 'userId' in query",
      data: null,
    };
  }

  const monthIndex = monthMap[month?.toLowerCase() || ""]; // e.g., "july" => 6
  const numericYear = parseInt(year || "");

  if (monthIndex === undefined || isNaN(numericYear)) {
    return {
      message: "Invalid or missing 'month' or 'year' in query",
      data: null,
    };
  }

  const gymMember = await GymMember.findOne({
    user: userId,
    status: "active",
  });

  if (!gymMember) {
    return {
      message: "No active gym membership found for this user",
      data: null,
    };
  }

  const gymId = gymMember.gym;

  const startOfMonth = dayjs()
    .set("year", numericYear)
    .set("month", monthIndex)
    .startOf("month")
    .toDate();

  const endOfMonth = dayjs()
    .set("year", numericYear)
    .set("month", monthIndex)
    .endOf("month")
    .toDate();

  // Step 1: Get trainings for the gym in the given month
  const trainings = await TrainingCalendar.find({
    gym: gymId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).select("_id");

  const trainingIds = trainings.map((t) => t._id);

  // Step 2: Count how many trainings this user attended from training_members
  const trainingCount = await Training_Member.countDocuments({
    user: userId,
    training: { $in: trainingIds },
  });

  return {
    message: "Monthly training count fetched",
    data: {
      count: trainingCount,
      month,
      year: numericYear,
    },
  };
};
