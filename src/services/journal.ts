import Review from "../models/Review.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { SortOrder } from "mongoose";

export const getAllJournals = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    sport,
    sessionType,
    category,
    skill,
    startDate,
    endDate,
    minReviewScore,
    maxReviewScore,
    matchType,
    userId,
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Build query
  let query: Record<string, any> = {};

  // Filter by user - if userId is provided (for viewing others' public journals), use that
  // Otherwise, use the authenticated user's ID to get their own journals
  if (userId) {
    query.user = userId;
    query.private = { $ne: true }; // Only show public reviews when viewing others
  } else {
    query.user = req.user.id; // User's own reviews (public or private)
  }

  // Apply filters
  if (sport) {
    query.sport = sport;
  }

  if (sessionType) {
    query.sessionType = sessionType;
  }

  if (matchType) {
    query.matchType = matchType;
  }

  if (category) {
    query["category.categoryId"] = category;
  }

  if (skill) {
    query["skill.skillId"] = skill;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate as string);
    }
  }

  // Review score filter (personal rating)
  if (minReviewScore || maxReviewScore) {
    query.rating = {};
    if (minReviewScore) {
      query.rating.$gte = parseFloat(minReviewScore as string);
    }
    if (maxReviewScore) {
      query.rating.$lte = parseFloat(maxReviewScore as string);
    }
  }

  const sortOption: Record<string, SortOrder> = {
    [sortBy as string]: sortOrder === "asc" ? 1 : -1,
  };

  // Get total count
  const total = await Review.countDocuments(query);

  // Get paginated data
  const reviews = await Review.find(query)
    .populate([
      {
        path: "user",
        select: "name email profilePicture",
      },
      {
        path: "sport",
        select: "name image",
      },
      {
        path: "category.categoryId",
      },
      {
        path: "skill.skillId",
      },
      {
        path: "coachFeedback.coach",
        select: "name email profilePicture",
      },
      {
        path: "peerFeedback.friend",
        select: "name email profilePicture",
      },
    ])
    .sort(sortOption)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  // Transform data to match the journal format expected by frontend
  const journals = reviews.map((review: any) => ({
    _id: review._id,
    date: review.createdAt,
    sport: review.sport,
    sessionType: review.sessionType,
    matchType: review.matchType,
    matchResult: review.matchResult,
    opponent: review.opponent,
    clubOrTeam: review.clubOrTeam,
    category: review.category?.categoryId,
    skills: review.skill?.map((s: any) => s.skillId) || [],
    
    // Personal Feedback
    personalFeedback: review.rating || review.comment ? {
      rating: review.rating,
      text: review.comment,
    } : null,
    
    // Peer Feedback
    peerFeedback: review.peerFeedback ? {
      rating: review.peerFeedback.rating,
      text: review.peerFeedback.comment,
      friend: review.peerFeedback.friend,
    } : null,
    
    // Coach Feedback
    coachFeedback: review.coachFeedback ? {
      rating: review.coachFeedback.rating,
      text: review.coachFeedback.comment,
      coach: review.coachFeedback.coach,
    } : null,
    
    // Video/Media
    media: review.media || [],
    videoUrl: review.media?.[0] || null,
    
    // Calculate average review score
    reviewScore: (() => {
      const ratings = [
        review.rating,
        review.peerFeedback?.rating,
        review.coachFeedback?.rating,
      ].filter((r) => r !== undefined && r !== null);
      
      return ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;
    })(),
    
    isPublic: !review.private,
    user: review.user,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }));

  return {
    message: "Journals retrieved successfully",
    data: journals,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};
