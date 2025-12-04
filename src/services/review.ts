import { Request } from "express";
import Review from "../models/Review.js";
import User from "../models/User.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";
import FeedbackRequest from "../models/Feedback_Request.js";
import { SortOrder } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
dayjs.extend(isoWeek);
export const createReview = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const userId = req.user.id;
  let skill: any[] | undefined;
  let category: any[] | undefined;

  // Parse category for Physical Performance and Skill Practice
  if (req.body.sessionType === "Physical Performance" || req.body.sessionType === "Skill Practice") {
    let rawCategory = req.body.category;

    if (typeof rawCategory === "string") {
      try {
        const parsed = JSON.parse(rawCategory);
        rawCategory = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error("Invalid category data format");
      }
    }

    if (rawCategory && !Array.isArray(rawCategory)) {
      rawCategory = [rawCategory];
    }

    if (rawCategory && Array.isArray(rawCategory)) {
      category = rawCategory; // Just use IDs directly
    }
  }

  if (req.body.sessionType === "Skill Practice") {
    let rawSkill = req.body.skill;

    // Parse if it's stringified JSON
    if (typeof rawSkill === "string") {
      try {
        const parsed = JSON.parse(rawSkill);
        rawSkill = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error("Invalid skill data format");
      }
    }

    if (rawSkill && !Array.isArray(rawSkill)) {
      rawSkill = [rawSkill];
    }

    if (rawSkill && Array.isArray(rawSkill)) {
      skill = rawSkill; // Just use IDs directly
    }
  }

  const data = {
    user: userId,
    media: req.fileUrls?.media || [],
    ...(skill ? { skill } : {}),
    ...(category ? { category } : {}),
    ...req.body,
  };

  // Remove raw category from body if we parsed it
  if (category) {
    delete data.category;
    (data as any).category = category;
  }

  const review = (await Review.create(data)) as any;

  const notifications: any[] = [];
  const feedbackRequests: any[] = [];
  const pushTasks: Promise<any>[] = [];

  const entityType = "review";
  const entityId = review._id.toString();
  const requesterName = req.user.name || "Someone";

  const coachId = req.body["coachFeedback.coach"];
  const peerId = req.body["peerFeedback.friend"];

  const notifyUser = async (recipientId: string, role: "coach" | "peer") => {
    const roleLabel = role === "coach" ? "a coach" : "a friend";
    const message = `${requesterName} has requested a review from you as ${roleLabel}.`;

    notifications.push({
      user: recipientId,
      message,
      entityType,
      entityId,
      isRead: false,
    });

    // Create feedback request
    feedbackRequests.push({
      requester: userId,
      recipient: recipientId,
      review: review._id,
      sport: req.body.sport || review.sport,
      skills: skill || [],
      status: "pending",
      type: role,
      requestMessage: req.body.comment || message,
    });

    const user = await User.findById(recipientId).select("deviceToken");
    // if (user?.deviceToken) {
    //   return sendPushNotification(
    //     user.deviceToken,
    //     "Review Request",
    //     message,
    //     entityId,
    //     entityType
    //   );
    // }
  };

  if (coachId) pushTasks.push(notifyUser(coachId, "coach"));
  if (peerId) pushTasks.push(notifyUser(peerId, "peer"));

  await Promise.all(pushTasks);

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  if (feedbackRequests.length > 0) {
    await FeedbackRequest.insertMany(feedbackRequests);
  }

  return { message: "Review created successfully", data: review };
};

export const updateReview = async (req: AuthenticatedRequest) => {
  const { id } = req.params;
  let updateData: any = {};

  if (req.fileUrls?.media?.length) {
    updateData.media = req.fileUrls.media;
  }

  let skill: any[] | undefined;
  let category: any[] | undefined;

  // Parse category for Physical Performance and Skill Practice
  if (req.body.sessionType === "Physical Performance" || req.body.sessionType === "Skill Practice") {
    let rawCategory = req.body.category;

    if (typeof rawCategory === "string") {
      try {
        const parsed = JSON.parse(rawCategory);
        rawCategory = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error("Invalid category data format");
      }
    }

    if (rawCategory && !Array.isArray(rawCategory)) {
      rawCategory = [rawCategory];
    }

    if (rawCategory && Array.isArray(rawCategory)) {
      category = rawCategory; // Just use IDs directly
    }
  }

  if (req.body.sessionType === "Skill Practice") {
    let rawSkill = req.body.skill;

    if (typeof rawSkill === "string") {
      try {
        const parsed = JSON.parse(rawSkill);
        rawSkill = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error("Invalid skill data format");
      }
    }

    if (rawSkill && !Array.isArray(rawSkill)) {
      rawSkill = [rawSkill];
    }

    if (rawSkill && Array.isArray(rawSkill)) {
      skill = rawSkill; // Just use IDs directly
    }
  }

  updateData = {
    ...updateData,
    ...req.body,
    ...(skill ? { skill } : {}),
    ...(category ? { category } : {}),
  };

  const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  return {
    message: "Review updated successfully",
    data: updatedReview,
  };
};

export const getReviewById = async (req: Request) => {
  const { id } = req.params;
  const review = await Review.findById(id).populate([
    { path: "user" },
    { path: "sport" },
    { path: "category" },
    { path: "skill" },
    { path: "opponent" },
    { path: "coachFeedback.coach" },
    { path: "peerFeedback.friend" },
  ]);

  if (!review) throw new Error("Review not found");
  return review;
};

export const removeReview = async (req: Request) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new Error("Review not found");
  return {
    message: "Review removed successfully",
  };
};

export const getAllReviews = async (req: Request) => {
  const {
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "desc",
    stats,
    month,
    year,
    ...filters
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};

  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
    }
  }

  const sortOption: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  if (stats === "true") {
    const now = dayjs();

    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");
    const startOfWeek = now.startOf("isoWeek");
    const endOfWeek = now.endOf("isoWeek");

    const [monthReviews, weekReviews] = await Promise.all([
      Review.find({
        ...query,
        createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
      }).populate(["sport", "category", "skill"]),
      Review.find({
        ...query,
        createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() },
      }).populate(["sport", "category", "skill"]),
    ]);

    const groupedMonth: Record<string, any[]> = {};
    for (
      let d = startOfMonth.clone();
      d.isBefore(endOfMonth) || d.isSame(endOfMonth);
      d = d.add(1, "day")
    ) {
      const dateStr = d.format("YYYY-MM-DD");
      groupedMonth[dateStr] = [];
    }
    for (const review of monthReviews) {
      const dateStr = dayjs(review.createdAt).format("YYYY-MM-DD");
      if (groupedMonth[dateStr]) {
        groupedMonth[dateStr].push(review);
      }
    }

    const groupedWeek: Record<string, any[]> = {};
    for (
      let d = startOfWeek.clone();
      d.isBefore(endOfWeek) || d.isSame(endOfWeek);
      d = d.add(1, "day")
    ) {
      const dateStr = d.format("YYYY-MM-DD");
      groupedWeek[dateStr] = [];
    }
    for (const review of weekReviews) {
      const dateStr = dayjs(review.createdAt).format("YYYY-MM-DD");
      if (groupedWeek[dateStr]) {
        groupedWeek[dateStr].push(review);
      }
    }

    // ADDITION: Group matchResults if sessionType is 'Match Type'
    let matchResultStats: Record<string, number> = {};
    if (filters.sessionType === "Match Type") {
      const allMatchReviews = await Review.find({
        ...query,
        sessionType: "Match Type",
      });

      matchResultStats = allMatchReviews.reduce((acc, review) => {
        const result = review.matchResult || "Unknown";
        acc[result] = (acc[result] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }

    return {
      message: "Grouped review stats fetched successfully",
      stats: {
        currentMonth: groupedMonth,
        currentWeek: groupedWeek,
        ...(filters.sessionType === "Match Type" && {
          matchResultStats,
        }),
      },
    };
  }

  if (month && year) {
    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();
    query.createdAt = { $gte: start, $lte: end };
  }

  if (page && limit) {
    const skip = (Number(page) - 1) * Number(limit);

    const data = await Review.find(query)
      .populate(["sport", "category", "skill"])
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    return {
      message: "Reviews fetched with pagination",
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        totalResults: total,
      },
    };
  }

  const data = await Review.find(query)
    .populate(["sport", "category", "skill"])
    .sort(sortOption);

  return {
    message: "Reviews fetched successfully",
    data,
  };
};
