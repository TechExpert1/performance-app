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
import Gym_Member from "../models/Gym_Member.js";
dayjs.extend(isoWeek);

export const createReview = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const userId = req.user.id;
  let skill: any[] | undefined;
  let category: any[] | undefined;

  // Helper function to deeply parse JSON strings and flatten arrays
  const parseIds = (input: any): string[] => {
    if (!input) return [];

    // If it's a string, try to parse it
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        return parseIds(parsed); // Recursively parse in case of double-stringification
      } catch {
        // It's a plain string ID
        return [input];
      }
    }

    // If it's an array, flatten and parse each element
    if (Array.isArray(input)) {
      return input.flatMap((item) => parseIds(item));
    }

    // If it's something else, convert to string
    return [String(input)];
  };

  // Parse category for Physical Performance and Skill Practice
  if (req.body.sessionType === "Physical Performance" || req.body.sessionType === "Skill Practice") {
    const parsedCategory = parseIds(req.body.category);
    if (parsedCategory.length > 0) {
      category = parsedCategory;
    }
  }

  if (req.body.sessionType === "Skill Practice") {
    const parsedSkill = parseIds(req.body.skill);
    if (parsedSkill.length > 0) {
      skill = parsedSkill;
    }
  }

  // Create a copy of req.body without category and skill (we'll add parsed versions)
  const { category: bodyCategory, skill: bodySkill, ...restBody } = req.body;

  // Build the review data object with all match fields
  const data: any = {
    user: userId,
    media: req.fileUrls?.media || [],
    ...(skill ? { skill } : {}),
    ...(category ? { category } : {}),
    ...restBody,
  };

  // Handle BJJ-specific fields based on match type
  if (req.body.sessionType === "Match Type") {
    // BJJ Competition fields
    if (req.body.matchType === "Competition") {
      // Method of Victory
      if (req.body.methodOfVictory) {
        data.methodOfVictory = req.body.methodOfVictory;
      }
      // Match Duration
      if (req.body.matchDuration) {
        data.matchDuration = req.body.matchDuration;
        if (req.body.matchDuration === "Other" && req.body.matchDurationCustom) {
          data.matchDurationCustom = Number(req.body.matchDurationCustom);
        }
      }
      // Submission Used (if Method of Victory = Submission)
      if (req.body.methodOfVictory === "Submission") {
        if (req.body.submissionUsed) {
          data.submissionUsed = req.body.submissionUsed;
          if (req.body.submissionUsed === "Other" && req.body.submissionCustom) {
            data.submissionCustom = req.body.submissionCustom;
          }
        }
      }
      // Score (if Method of Victory = Points or Advantage)
      if (req.body.methodOfVictory === "Points" || req.body.methodOfVictory === "Advantage") {
        if (req.body.yourScore !== undefined) {
          data.yourScore = Number(req.body.yourScore);
        }
        if (req.body.opponentScore !== undefined) {
          data.opponentScore = Number(req.body.opponentScore);
        }
      }
      // Belt Division (BJJ)
      if (req.body.beltDivision) {
        data.beltDivision = req.body.beltDivision;
      }
      // Weight Class (BJJ)
      if (req.body.bjjWeightClass) {
        data.bjjWeightClass = req.body.bjjWeightClass;
      }
    }

    // BJJ Roll/Sparring fields
    if (req.body.matchType === "Roll/Sparring" || req.body.matchType === "Roll / Sparring") {
      // Roll Duration
      if (req.body.rollDuration) {
        data.rollDuration = req.body.rollDuration;
        if (req.body.rollDuration === "Other" && req.body.rollDurationCustom) {
          data.rollDurationCustom = Number(req.body.rollDurationCustom);
        }
      }
      // Submission Used (if Method of Victory = Submission)
      if (req.body.methodOfVictory === "Submission") {
        if (req.body.submissionUsed) {
          data.submissionUsed = req.body.submissionUsed;
          if (req.body.submissionUsed === "Other" && req.body.submissionCustom) {
            data.submissionCustom = req.body.submissionCustom;
          }
        }
      }
      // Score (if Method of Victory = Points)
      if (req.body.methodOfVictory === "Points") {
        if (req.body.yourScore !== undefined) {
          data.yourScore = Number(req.body.yourScore);
        }
        if (req.body.opponentScore !== undefined) {
          data.opponentScore = Number(req.body.opponentScore);
        }
      }
    }

    // Common BJJ fields
    if (req.body.giNoGi) {
      data.giNoGi = req.body.giNoGi;
    }

    // Boxing Competition fields
    if (req.body.matchType === "Competition" && req.body.boxingVictoryMethod) {
      data.boxingVictoryMethod = req.body.boxingVictoryMethod;

      // Decision Type (if Points Decision)
      if (req.body.boxingVictoryMethod === "Points Decision" && req.body.decisionType) {
        data.decisionType = req.body.decisionType;
      }

      // Rounds Fought
      if (req.body.roundsFought) {
        data.roundsFought = Number(req.body.roundsFought);
      }

      // KO/TKO Details
      if (req.body.boxingVictoryMethod === "KO" || req.body.boxingVictoryMethod === "TKO") {
        if (req.body.roundOfStoppage) {
          data.roundOfStoppage = Number(req.body.roundOfStoppage);
        }
        if (req.body.timeOfStoppageMinutes !== undefined) {
          data.timeOfStoppageMinutes = Number(req.body.timeOfStoppageMinutes);
        }
        if (req.body.timeOfStoppageSeconds !== undefined) {
          data.timeOfStoppageSeconds = Number(req.body.timeOfStoppageSeconds);
        }
      }

      // Boxing Weight Class
      if (req.body.boxingWeightClass) {
        data.boxingWeightClass = req.body.boxingWeightClass;
      }

      // Event Name
      if (req.body.eventName) {
        data.eventName = req.body.eventName;
      }
    }

    // Boxing Sparring fields
    if (req.body.matchType === "Sparring") {
      // Rounds Sparred
      if (req.body.roundsSparred) {
        data.roundsSparred = Number(req.body.roundsSparred);
      }

      // Time per Round
      if (req.body.timePerRound) {
        data.timePerRound = req.body.timePerRound;
        if (req.body.timePerRound === "Other" && req.body.timePerRoundCustom) {
          data.timePerRoundCustom = Number(req.body.timePerRoundCustom);
        }
      }

      // Boxing Weight Class (optional for sparring)
      if (req.body.boxingWeightClass) {
        data.boxingWeightClass = req.body.boxingWeightClass;
      }

      // Gym Name (auto-filled if opponent is tagged)
      if (req.body.gymName) {
        data.gymName = req.body.gymName;
      }
    }

    // Common optional fields
    if (req.body.notes) {
      data.notes = req.body.notes;
    }
    if (req.body.videoUrl) {
      data.videoUrl = req.body.videoUrl;
    }
    if (req.body.videoThumbnail) {
      data.videoThumbnail = req.body.videoThumbnail;
    }
    if (req.body.requestPeerFeedback !== undefined) {
      data.requestPeerFeedback = req.body.requestPeerFeedback === true || req.body.requestPeerFeedback === "true";
    }
    if (req.body.requestCoachReview !== undefined) {
      data.requestCoachReview = req.body.requestCoachReview === true || req.body.requestCoachReview === "true";
    }
    if (req.body.coachToReview) {
      data.coachToReview = req.body.coachToReview;
    }
  }

  const review = (await Review.create(data)) as any;

  const notifications: any[] = [];
  const feedbackRequests: any[] = [];
  const pushTasks: Promise<any>[] = [];

  const entityType = "review";
  const entityId = review._id.toString();
  const requesterName = req.user.name || "Someone";

  const coachId = req.body["coachFeedback.coach"] || req.body.coachToReview;
  const peerId = req.body["peerFeedback.friend"];
  const taggedOpponentId = req.body.tagFriend; // For BJJ Roll/Sparring mirrored entry

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

  // Handle tagged opponent for BJJ Roll/Sparring - create mirrored entry
  if (taggedOpponentId && (req.body.matchType === "Roll/Sparring" || req.body.matchType === "Roll / Sparring")) {
    // Flip the result for the opponent
    let opponentResult = req.body.matchResult;
    if (req.body.matchResult === "Win") {
      opponentResult = "Loss";
    } else if (req.body.matchResult === "Loss") {
      opponentResult = "Win";
    }
    // Draw stays as Draw

    // Flip the scores for the opponent
    const opponentData: any = {
      user: taggedOpponentId,
      sport: req.body.sport,
      sessionType: "Match Type",
      matchType: req.body.matchType,
      matchResult: opponentResult,
      opponent: req.user.name || "Unknown",
      tagFriend: userId, // Link back to the original user
      methodOfVictory: req.body.methodOfVictory,
      rollDuration: req.body.rollDuration,
      rollDurationCustom: req.body.rollDurationCustom,
      submissionUsed: req.body.submissionUsed,
      submissionCustom: req.body.submissionCustom,
      yourScore: req.body.opponentScore, // Flip scores
      opponentScore: req.body.yourScore, // Flip scores
      giNoGi: req.body.giNoGi,
      notes: "", // Opponent can add their own reflection
      private: req.body.private,
    };

    // Create mirrored entry for opponent
    const mirroredReview = await Review.create(opponentData) as any;

    // Notify the tagged opponent
    const opponentMessage = `${requesterName} tagged you in a ${req.body.matchType} session.`;
    notifications.push({
      user: taggedOpponentId,
      message: opponentMessage,
      entityType: "review",
      entityId: mirroredReview._id.toString(),
      isRead: false,
    });
  }

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

  // Helper function to deeply parse JSON strings and flatten arrays
  const parseIds = (input: any): string[] => {
    if (!input) return [];

    // If it's a string, try to parse it
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        return parseIds(parsed); // Recursively parse in case of double-stringification
      } catch {
        // It's a plain string ID
        return [input];
      }
    }

    // If it's an array, flatten and parse each element
    if (Array.isArray(input)) {
      return input.flatMap((item) => parseIds(item));
    }

    // If it's something else, convert to string
    return [String(input)];
  };

  // Parse category for Physical Performance and Skill Practice
  if (req.body.sessionType === "Physical Performance" || req.body.sessionType === "Skill Practice") {
    const parsedCategory = parseIds(req.body.category);
    if (parsedCategory.length > 0) {
      category = parsedCategory;
    }
  }

  if (req.body.sessionType === "Skill Practice") {
    const parsedSkill = parseIds(req.body.skill);
    if (parsedSkill.length > 0) {
      skill = parsedSkill;
    }
  }

  // Create a copy of req.body without category and skill (we'll add parsed versions)
  const { category: bodyCategory, skill: bodySkill, ...restBody } = req.body;

  updateData = {
    ...updateData,
    ...restBody,
    ...(skill ? { skill } : {}),
    ...(category ? { category } : {}),
  };

  // Handle Match Type specific fields
  if (req.body.sessionType === "Match Type") {
    // BJJ Competition fields
    if (req.body.matchType === "Competition") {
      if (req.body.methodOfVictory !== undefined) {
        updateData.methodOfVictory = req.body.methodOfVictory;
      }
      if (req.body.matchDuration !== undefined) {
        updateData.matchDuration = req.body.matchDuration;
        if (req.body.matchDuration === "Other" && req.body.matchDurationCustom) {
          updateData.matchDurationCustom = Number(req.body.matchDurationCustom);
        }
      }
      if (req.body.methodOfVictory === "Submission") {
        if (req.body.submissionUsed !== undefined) {
          updateData.submissionUsed = req.body.submissionUsed;
          if (req.body.submissionUsed === "Other" && req.body.submissionCustom) {
            updateData.submissionCustom = req.body.submissionCustom;
          }
        }
      }
      if (req.body.methodOfVictory === "Points" || req.body.methodOfVictory === "Advantage") {
        if (req.body.yourScore !== undefined) {
          updateData.yourScore = Number(req.body.yourScore);
        }
        if (req.body.opponentScore !== undefined) {
          updateData.opponentScore = Number(req.body.opponentScore);
        }
      }
      if (req.body.beltDivision !== undefined) {
        updateData.beltDivision = req.body.beltDivision;
      }
      if (req.body.bjjWeightClass !== undefined) {
        updateData.bjjWeightClass = req.body.bjjWeightClass;
      }
    }

    // BJJ Roll/Sparring fields
    if (req.body.matchType === "Roll/Sparring" || req.body.matchType === "Roll / Sparring") {
      if (req.body.rollDuration !== undefined) {
        updateData.rollDuration = req.body.rollDuration;
        if (req.body.rollDuration === "Other" && req.body.rollDurationCustom) {
          updateData.rollDurationCustom = Number(req.body.rollDurationCustom);
        }
      }
      if (req.body.methodOfVictory === "Submission" && req.body.submissionUsed !== undefined) {
        updateData.submissionUsed = req.body.submissionUsed;
        if (req.body.submissionUsed === "Other" && req.body.submissionCustom) {
          updateData.submissionCustom = req.body.submissionCustom;
        }
      }
      if (req.body.methodOfVictory === "Points") {
        if (req.body.yourScore !== undefined) {
          updateData.yourScore = Number(req.body.yourScore);
        }
        if (req.body.opponentScore !== undefined) {
          updateData.opponentScore = Number(req.body.opponentScore);
        }
      }
    }

    // Common BJJ fields
    if (req.body.giNoGi !== undefined) {
      updateData.giNoGi = req.body.giNoGi;
    }

    // Boxing Competition fields
    if (req.body.matchType === "Competition" && req.body.boxingVictoryMethod !== undefined) {
      updateData.boxingVictoryMethod = req.body.boxingVictoryMethod;

      if (req.body.boxingVictoryMethod === "Points Decision" && req.body.decisionType !== undefined) {
        updateData.decisionType = req.body.decisionType;
      }

      if (req.body.roundsFought !== undefined) {
        updateData.roundsFought = Number(req.body.roundsFought);
      }

      if (req.body.boxingVictoryMethod === "KO" || req.body.boxingVictoryMethod === "TKO") {
        if (req.body.roundOfStoppage !== undefined) {
          updateData.roundOfStoppage = Number(req.body.roundOfStoppage);
        }
        if (req.body.timeOfStoppageMinutes !== undefined) {
          updateData.timeOfStoppageMinutes = Number(req.body.timeOfStoppageMinutes);
        }
        if (req.body.timeOfStoppageSeconds !== undefined) {
          updateData.timeOfStoppageSeconds = Number(req.body.timeOfStoppageSeconds);
        }
      }

      if (req.body.boxingWeightClass !== undefined) {
        updateData.boxingWeightClass = req.body.boxingWeightClass;
      }

      if (req.body.eventName !== undefined) {
        updateData.eventName = req.body.eventName;
      }
    }

    // Boxing Sparring fields
    if (req.body.matchType === "Sparring") {
      if (req.body.roundsSparred !== undefined) {
        updateData.roundsSparred = Number(req.body.roundsSparred);
      }

      if (req.body.timePerRound !== undefined) {
        updateData.timePerRound = req.body.timePerRound;
        if (req.body.timePerRound === "Other" && req.body.timePerRoundCustom) {
          updateData.timePerRoundCustom = Number(req.body.timePerRoundCustom);
        }
      }

      if (req.body.boxingWeightClass !== undefined) {
        updateData.boxingWeightClass = req.body.boxingWeightClass;
      }

      if (req.body.gymName !== undefined) {
        updateData.gymName = req.body.gymName;
      }
    }

    // Common optional fields
    if (req.body.notes !== undefined) {
      updateData.notes = req.body.notes;
    }
    if (req.body.videoUrl !== undefined) {
      updateData.videoUrl = req.body.videoUrl;
    }
    if (req.body.videoThumbnail !== undefined) {
      updateData.videoThumbnail = req.body.videoThumbnail;
    }
    if (req.body.requestPeerFeedback !== undefined) {
      updateData.requestPeerFeedback = req.body.requestPeerFeedback === true || req.body.requestPeerFeedback === "true";
    }
    if (req.body.requestCoachReview !== undefined) {
      updateData.requestCoachReview = req.body.requestCoachReview === true || req.body.requestCoachReview === "true";
    }
    if (req.body.coachToReview !== undefined) {
      updateData.coachToReview = req.body.coachToReview;
    }
  }

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
    { path: "coachToReview" },
    { path: "tagFriend" },
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

/**
 * Skill Training Graph API
 * 
 * Returns skill training breakdown by category for pie chart visualization
 * 
 * Query Parameters:
 * - sportId: Required - Filter by sport
 * - giNoGi: "gi" | "no-gi" | "all" - Filter by Gi/No-Gi (BJJ specific, default: "all")
 * - timeFilter: "7D" | "30D" | "90D" | "all" (default: "all")
 * - mock: "true" - Return mock data for testing
 */
export const getSkillTrainingGraph = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { sportId, giNoGi = "all", timeFilter = "all", mock } = req.query;

  if (!sportId) {
    throw new Error("sportId is required");
  }

  // Return mock data if requested
  if (mock === "true") {
    return getMockSkillTrainingData(sportId as string, giNoGi as string, timeFilter as string);
  }

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

  // Build query for skill practice reviews
  const query: any = {
    user: req.user.id,
    sport: sportId,
    sessionType: "Skill Practice",
  };

  // Filter by Gi/No-Gi if specified
  if (giNoGi && giNoGi !== "all") {
    query.giNoGi = giNoGi === "gi" ? "Gi" : "No-Gi";
  }

  if (startDate) {
    query.createdAt = { $gte: startDate };
  }

  // Fetch reviews with categories and skills
  const reviews = await Review.find(query)
    .populate({
      path: "category",
      select: "_id name type",
    })
    .populate({
      path: "skill",
      select: "_id name category",
    })
    .select("_id category skill trainingCalendar createdAt")
    .lean();

  // Count how many came from training calendar (classes) vs manual logs
  const classCount = reviews.filter((r: any) => r.trainingCalendar).length;
  const manualLogCount = reviews.filter((r: any) => !r.trainingCalendar).length;

  // Build category breakdown
  const categoryMap: Record<string, {
    _id: string;
    name: string;
    count: number;
    skills: Record<string, { _id: string; name: string; count: number }>;
  }> = {};

  reviews.forEach((review: any) => {
    // Handle multiple categories
    const categories = Array.isArray(review.category) ? review.category : [review.category];
    const skills = Array.isArray(review.skill) ? review.skill : [review.skill];

    categories.forEach((cat: any) => {
      if (!cat) return;
      
      const catId = cat._id.toString();
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          _id: catId,
          name: cat.name,
          count: 0,
          skills: {},
        };
      }
      categoryMap[catId].count++;
    });

    // Map skills to their categories
    skills.forEach((skill: any) => {
      if (!skill) return;
      
      const skillCatId = skill.category?.toString();
      if (skillCatId && categoryMap[skillCatId]) {
        const skillId = skill._id.toString();
        if (!categoryMap[skillCatId].skills[skillId]) {
          categoryMap[skillCatId].skills[skillId] = {
            _id: skillId,
            name: skill.name,
            count: 0,
          };
        }
        categoryMap[skillCatId].skills[skillId].count++;
      }
    });
  });

  // Convert to array and calculate percentages
  const totalCount = Object.values(categoryMap).reduce((sum, cat) => sum + cat.count, 0);
  
  const categoryBreakdown = Object.values(categoryMap)
    .map((cat) => ({
      _id: cat._id,
      name: cat.name,
      count: cat.count,
      percentage: totalCount > 0 ? Math.round((cat.count / totalCount) * 100) : 0,
      skills: Object.values(cat.skills)
        .sort((a, b) => b.count - a.count)
        .map((skill) => ({
          _id: skill._id,
          name: skill.name,
          count: skill.count,
        })),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    message: "Skill training graph data fetched successfully",
    data: {
      sportId,
      giNoGi: giNoGi === "all" ? "All" : (giNoGi === "gi" ? "Gi" : "No-Gi"),
      timeFilter,
      summary: {
        totalSessions: totalCount,
        classCount,
        manualLogCount,
        categoryCount: categoryBreakdown.length,
      },
      categories: categoryBreakdown,
    },
  };
};

/**
 * Mock data for skill training graph
 */
const getMockSkillTrainingData = (sportId: string, giNoGi: string, timeFilter: string) => {
  const mockCategories = [
    {
      _id: "cat1",
      name: "Takedowns",
      count: 20,
      percentage: 20,
      skills: [
        { _id: "skill1", name: "Single Leg Takedown", count: 8 },
        { _id: "skill2", name: "Double Leg Takedown", count: 6 },
        { _id: "skill3", name: "Ankle Pick", count: 4 },
        { _id: "skill4", name: "Arm Drag to Takedown", count: 2 },
      ],
    },
    {
      _id: "cat2",
      name: "Guard Passes",
      count: 13,
      percentage: 13,
      skills: [
        { _id: "skill5", name: "Knee Cut Pass", count: 5 },
        { _id: "skill6", name: "Torreando Pass", count: 4 },
        { _id: "skill7", name: "Over-Under Pass", count: 3 },
        { _id: "skill8", name: "Leg Drag", count: 1 },
      ],
    },
    {
      _id: "cat3",
      name: "Sweeps",
      count: 15,
      percentage: 15,
      skills: [
        { _id: "skill9", name: "Scissor Sweep", count: 6 },
        { _id: "skill10", name: "Flower Sweep", count: 5 },
        { _id: "skill11", name: "Butterfly Sweep", count: 4 },
        { _id: "skill12", name: "Hip Bump Sweep", count: 3 },
        { _id: "skill13", name: "X-Guard Sweep", count: 2 },
      ],
    },
    {
      _id: "cat4",
      name: "Guard Passing",
      count: 22,
      percentage: 22,
      skills: [
        { _id: "skill14", name: "Pressure Passing", count: 10 },
        { _id: "skill15", name: "Speed Passing", count: 7 },
        { _id: "skill16", name: "Standing Guard Pass", count: 5 },
      ],
    },
    {
      _id: "cat5",
      name: "Submissions (Chokes)",
      count: 12,
      percentage: 12,
      skills: [
        { _id: "skill17", name: "Rear Naked Choke", count: 5 },
        { _id: "skill18", name: "Triangle Choke", count: 4 },
        { _id: "skill19", name: "Guillotine", count: 2 },
        { _id: "skill20", name: "Arm Triangle", count: 1 },
      ],
    },
    {
      _id: "cat6",
      name: "Submissions (Joint Locks)",
      count: 8,
      percentage: 8,
      skills: [
        { _id: "skill21", name: "Armbar", count: 4 },
        { _id: "skill22", name: "Kimura", count: 2 },
        { _id: "skill23", name: "Americana", count: 1 },
        { _id: "skill24", name: "Straight Ankle Lock", count: 1 },
      ],
    },
    {
      _id: "cat7",
      name: "Guards & Positions",
      count: 10,
      percentage: 10,
      skills: [
        { _id: "skill25", name: "Closed Guard", count: 3 },
        { _id: "skill26", name: "Half Guard", count: 3 },
        { _id: "skill27", name: "De La Riva", count: 2 },
        { _id: "skill28", name: "Spider Guard", count: 2 },
      ],
    },
  ];

  return {
    message: "Skill training graph data fetched successfully (MOCK DATA)",
    data: {
      sportId,
      giNoGi: giNoGi === "all" ? "All" : (giNoGi === "gi" ? "Gi" : "No-Gi"),
      timeFilter,
      summary: {
        totalSessions: 100,
        classCount: 12,
        manualLogCount: 10,
        categoryCount: mockCategories.length,
      },
      categories: mockCategories,
    },
  };
};
