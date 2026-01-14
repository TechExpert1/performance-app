import FeedbackRequest from "../models/Feedback_Request.js";
import Review from "../models/Review.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

// Create a feedback request
export const createFeedbackRequest = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { recipientId, reviewId, sportId, skills, type, requestMessage } = req.body;

  // Validate required fields
  if (!recipientId || !reviewId || !sportId || !type) {
    throw new Error("recipientId, reviewId, sportId, and type are required");
  }

  if (!["peer", "coach"].includes(type)) {
    throw new Error("type must be either 'peer' or 'coach'");
  }

  // Check if review exists
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  // Check if request already exists
  const existingRequest = await FeedbackRequest.findOne({
    requester: req.user.id,
    recipient: recipientId,
    review: reviewId,
    status: { $in: ["pending", "completed"] },
  });

  if (existingRequest) {
    throw new Error("Feedback request already exists for this review and recipient");
  }

  // Create feedback request
  const feedbackRequest = await FeedbackRequest.create({
    requester: req.user.id,
    recipient: recipientId,
    review: reviewId,
    sport: sportId,
    skills: skills || [],
    status: "pending",
    type,
    requestMessage: requestMessage || `Please provide ${type} feedback on my session`,
  });

  return {
    message: "Feedback request created successfully",
    data: feedbackRequest,
  };
};

// Get received feedback requests
export const getReceivedRequests = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { status = "pending" } = req.query;

  const query: any = { recipient: req.user.id };
  if (status && status !== "all") {
    query.status = status;
  }

  const requests = await FeedbackRequest.find(query)
    .populate({
      path: "requester",
      select: "name email profileImage",
    })
    .populate({
      path: "sport",
      select: "name image",
    })
    .populate({
      path: "skills.skillId",
    })
    .populate({
      path: "review",
      select: "sessionType createdAt media",
    })
    .sort({ createdAt: -1 })
    .lean();

  // Transform to match design
  const formattedRequests = requests.map((request: any) => ({
    _id: request._id,
    sportType: request.sport?.name,
    sportImage: request.sport?.image,
    memberName: request.requester?.name,
    memberImage: request.requester?.profileImage,
    date: request.createdAt,
    message: request.requestMessage,
    skills: request.skills?.map((s: any) => s.skillId?.name).filter(Boolean) || [],
    status: request.status,
    type: request.type,
  }));

  return {
    message: "Received feedback requests retrieved successfully",
    data: formattedRequests,
  };
};

// Get sent feedback requests
export const getSentRequests = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { status = "pending" } = req.query;

  const query: any = { requester: req.user.id };
  if (status && status !== "all") {
    query.status = status;
  }

  const requests = await FeedbackRequest.find(query)
    .populate({
      path: "recipient",
      select: "name email profileImage",
    })
    .populate({
      path: "sport",
      select: "name image",
    })
    .populate({
      path: "skills.skillId",
    })
    .populate({
      path: "review",
      select: "sessionType createdAt media",
    })
    .sort({ createdAt: -1 })
    .lean();

  // Transform to match design
  const formattedRequests = requests.map((request: any) => ({
    _id: request._id,
    sportType: request.sport?.name,
    sportImage: request.sport?.image,
    memberName: request.recipient?.name,
    memberImage: request.recipient?.profileImage,
    date: request.createdAt,
    message: request.requestMessage,
    skills: request.skills?.map((s: any) => s.skillId?.name).filter(Boolean) || [],
    status: request.status,
    type: request.type,
  }));

  return {
    message: "Sent feedback requests retrieved successfully",
    data: formattedRequests,
  };
};

// Get feedback request details
export const getRequestDetails = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { id } = req.params;

  // Validate ObjectId format
  if (!id || id === ":" || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new Error("Invalid feedback request ID");
  }

  const request = await FeedbackRequest.findById(id)
    .populate({
      path: "requester",
      select: "name email profileImage",
    })
    .populate({
      path: "recipient",
      select: "name email profileImage",
    })
    .populate({
      path: "sport",
      select: "name image",
    })
    .populate({
      path: "skills",
      populate: {
        path: "category",
        select: "name",
      },
    })
    .populate({
      path: "review",
      populate: [
        { path: "sport", select: "name image" },
        { path: "user", select: "name email profileImage" },
      ],
    })
    .lean();

  if (!request) {
    throw new Error("Feedback request not found");
  }

  // Check if user is authorized to view this request
  if (
    request.requester._id.toString() !== req.user.id &&
    request.recipient._id.toString() !== req.user.id
  ) {
    throw new Error("Not authorized to view this request");
  }

  // Format response based on design
  const requestData = request as any;
  const response: any = {
    _id: requestData._id,
    sportType: requestData.sport?.name,
    sportImage: requestData.sport?.image,
    memberName:
      requestData.recipient._id.toString() === req.user.id
        ? requestData.requester.name
        : requestData.recipient.name,
    memberImage:
      requestData.recipient._id.toString() === req.user.id
        ? requestData.requester.profileImage
        : requestData.recipient.profileImage,
    skills: requestData.skills?.map((s: any) => ({
      _id: s._id,
      name: s.name,
      category: s.category ? {
        _id: s.category._id,
        name: s.category.name,
      } : null,
    })) || [],
    categories: Array.from(
      new Set(
        requestData.skills
          ?.map((s: any) => s.category?._id?.toString())
          .filter(Boolean)
      )
    ).map((catId) => {
      const skill = requestData.skills.find(
        (s: any) => s.category?._id?.toString() === catId
      );
      return {
        _id: skill.category._id,
        name: skill.category.name,
      };
    }),
    status: requestData.status,
    type: requestData.type,
    requestMessage: requestData.requestMessage,
    createdAt: requestData.createdAt,
  };

  // Include review data if available
  if (requestData.review) {
    response.review = {
      _id: requestData.review._id,
      sessionType: requestData.review.sessionType,
      media: requestData.review.media || [],
      rating: requestData.review.rating,
      comment: requestData.review.comment,
      createdAt: requestData.review.createdAt,
    };
  }

  // Include feedback if completed
  if (request.status === "completed") {
    response.feedback = {
      rating: request.feedbackRating,
      comment: request.feedbackComment,
      submittedAt: request.submittedAt,
    };
  }

  return {
    message: "Feedback request details retrieved successfully",
    data: response,
  };
};

// Submit feedback on request
export const submitFeedback = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { id } = req.params;
  const { feedbackRating, feedbackComment } = req.body;

  // Validate ObjectId format
  if (!id || id === ":" || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new Error("Invalid feedback request ID");
  }

  // Validate rating
  if (!feedbackRating || feedbackRating < 1 || feedbackRating > 10) {
    throw new Error("Rating must be between 1 and 10");
  }

  // Find the request
  const request = await FeedbackRequest.findById(id);

  if (!request) {
    throw new Error("Feedback request not found");
  }

  // Check if user is the recipient
  if (request.recipient.toString() !== req.user.id) {
    throw new Error("Only the recipient can submit feedback");
  }

  // Check if already completed
  if (request.status === "completed") {
    throw new Error("Feedback already submitted for this request");
  }

  // Update feedback request
  request.feedbackRating = feedbackRating;
  request.feedbackComment = feedbackComment;
  request.status = "completed";
  request.submittedAt = new Date();
  await request.save();

  // Update the review with the feedback
  const review = await Review.findById(request.review);
  if (review) {
    if (request.type === "peer") {
      review.peerFeedback = {
        friend: request.recipient,
        rating: feedbackRating,
        comment: feedbackComment,
      };
    } else if (request.type === "coach") {
      review.coachFeedback = {
        coach: request.recipient,
        rating: feedbackRating,
        comment: feedbackComment,
      };
    }
    await review.save();
  }

  return {
    message: "Feedback submitted successfully",
    data: {
      _id: request._id,
      status: request.status,
      rating: request.feedbackRating,
      submittedAt: request.submittedAt,
    },
  };
};

/**
 * Feedback Graph API
 * 
 * Returns feedback data for graphing personal vs peer feedback over time
 * 
 * Query Parameters:
 * - sportId: Required - Filter by sport
 * - sessionType: "skill" | "match" - Filter by session type (Skill Practice or Match Type)
 * - timeFilter: "7D" | "30D" | "90D" | "all" (default: "7D")
 * - previous: number - Navigate to previous periods (0 = current, 1 = previous period, 2 = 2 periods ago, etc.)
 * - mock: "true" - Return mock data for testing
 */
export const getFeedbackGraph = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { sportId, sessionType = "skill", timeFilter = "7D", previous = "0", mock } = req.query;

  if (!sportId) {
    throw new Error("sportId is required");
  }

  const previousPeriod = parseInt(previous as string) || 0;

  // Return mock data if requested
  if (mock === "true") {
    return getMockFeedbackGraphData(sportId as string, sessionType as string, timeFilter as string, previousPeriod);
  }

  // Calculate date range based on time filter and previous parameter
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date = new Date(now);

  switch (timeFilter) {
    case "7D":
      // Each period is 7 days
      endDate = new Date(now.getTime() - (previousPeriod * 7 * 24 * 60 * 60 * 1000));
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30D":
      // Each period is 30 days
      endDate = new Date(now.getTime() - (previousPeriod * 30 * 24 * 60 * 60 * 1000));
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90D":
      // Each period is 90 days
      endDate = new Date(now.getTime() - (previousPeriod * 90 * 24 * 60 * 60 * 1000));
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      startDate = null;
      endDate = now;
      break;
  }

  // Determine session type filter
  const sessionTypeFilter = sessionType === "match" ? "Match Type" : "Skill Practice";

  // Build query for reviews
  const query: any = {
    user: req.user.id,
    sport: sportId,
    sessionType: sessionTypeFilter,
  };

  if (startDate) {
    query.createdAt = { 
      $gte: startDate,
      $lte: endDate
    };
  }

  // Fetch reviews with personal feedback (rating field)
  const reviews = await Review.find(query)
    .select("_id sessionType matchType matchResult rating peerFeedback coachFeedback notes media videoUrl matchDuration rollDuration methodOfVictory submissionUsed createdAt")
    .sort({ createdAt: 1 })
    .lean();

  // Get peer feedback from FeedbackRequest for these reviews
  const reviewIds = reviews.map((r) => r._id);
  const peerFeedbacks = await FeedbackRequest.find({
    review: { $in: reviewIds },
    type: "peer",
    status: "completed",
  })
    .select("review feedbackRating submittedAt")
    .lean();

  // Create a map of review ID to peer feedback ratings (there can be multiple)
  const peerFeedbackMap: Record<string, { ratings: number[]; count: number }> = {};
  peerFeedbacks.forEach((pf) => {
    const reviewId = pf.review.toString();
    if (!peerFeedbackMap[reviewId]) {
      peerFeedbackMap[reviewId] = { ratings: [], count: 0 };
    }
    if (pf.feedbackRating) {
      peerFeedbackMap[reviewId].ratings.push(pf.feedbackRating);
      peerFeedbackMap[reviewId].count++;
    }
  });

  // Build data points grouped by date
  const dateGroups: Record<string, {
    date: Date;
    personalRatings: number[];
    peerRatings: number[];
    peerCounts: number;
    reviews: any[];
  }> = {};

  reviews.forEach((review: any) => {
    const reviewDate = new Date(review.createdAt);
    // Get date only (without time) for grouping
    const dateKey = reviewDate.toISOString().split('T')[0];

    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = {
        date: reviewDate,
        personalRatings: [],
        peerRatings: [],
        peerCounts: 0,
        reviews: [],
      };
    }

    // Personal feedback is the rating field on the review
    if (review.rating) {
      dateGroups[dateKey].personalRatings.push(review.rating);
    }

    // Peer feedback - calculate average from all peer feedback requests
    const reviewId = review._id.toString();
    if (peerFeedbackMap[reviewId] && peerFeedbackMap[reviewId].ratings.length > 0) {
      const ratings = peerFeedbackMap[reviewId].ratings;
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      dateGroups[dateKey].peerRatings.push(avgRating);
      dateGroups[dateKey].peerCounts += peerFeedbackMap[reviewId].count;
    } else if (review.peerFeedback?.rating) {
      // Fallback to inline peer feedback if exists
      dateGroups[dateKey].peerRatings.push(review.peerFeedback.rating);
      dateGroups[dateKey].peerCounts += 1;
    }

    dateGroups[dateKey].reviews.push(review);
  });

  // Convert grouped data to data points with averages
  const dataPoints: Array<{
    date: string;
    dateFormatted: string;
    personalFeedback: number | null;
    peerFeedback: number | null;
    peerFeedbackCount: number;
    sessionCount: number;
    details: {
      matchType?: string;
      matchResult?: string;
      duration?: string;
      notes?: string;
      hasMedia: boolean;
    } | null;
  }> = [];

  // For 7D, 30D, 90D: Different aggregation strategies
  if (startDate && timeFilter !== "all") {
    if (timeFilter === "7D") {
      // 7D: Daily data points
      const currentDate = new Date(startDate);
      const finalEndDate = new Date(endDate);
      finalEndDate.setHours(23, 59, 59, 999);

      while (currentDate <= finalEndDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const dateFormatted = currentDate.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        if (dateGroups[dateKey]) {
          // We have data for this date
          const group = dateGroups[dateKey];

          // Calculate average personal rating for this date
          const personalAvgForDate = group.personalRatings.length > 0
            ? Math.round((group.personalRatings.reduce((sum, r) => sum + r, 0) / group.personalRatings.length) * 10) / 10
            : null;

          // Calculate average peer rating for this date
          const peerAvgForDate = group.peerRatings.length > 0
            ? Math.round((group.peerRatings.reduce((sum, r) => sum + r, 0) / group.peerRatings.length) * 10) / 10
            : null;

          // Use first review's details as representative
          const firstReview = group.reviews[0];
          let duration: string | undefined;
          if (firstReview.matchDuration) {
            duration = firstReview.matchDuration === "Other" ? `${firstReview.matchDurationCustom} min` : firstReview.matchDuration;
          } else if (firstReview.rollDuration) {
            duration = firstReview.rollDuration === "Other" ? `${firstReview.rollDurationCustom} min` : firstReview.rollDuration;
          }

          dataPoints.push({
            date: new Date(dateKey).toISOString(),
            dateFormatted,
            personalFeedback: personalAvgForDate,
            peerFeedback: peerAvgForDate,
            peerFeedbackCount: group.peerCounts,
            sessionCount: group.reviews.length,
            details: {
              matchType: firstReview.matchType,
              matchResult: firstReview.matchResult,
              duration,
              notes: firstReview.notes,
              hasMedia: group.reviews.some((r: any) => !!(r.media?.length > 0 || r.videoUrl)),
            },
          });
        } else {
          // No data for this date - return null values
          dataPoints.push({
            date: new Date(dateKey).toISOString(),
            dateFormatted,
            personalFeedback: null,
            peerFeedback: null,
            peerFeedbackCount: 0,
            sessionCount: 0,
            details: null,
          });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (timeFilter === "30D") {
      // 30D: Weekly aggregation (4-5 weeks)
      const weeks: Array<{
        startDate: Date;
        endDate: Date;
        personalRatings: number[];
        peerRatings: number[];
        peerCounts: number;
        sessionCount: number;
        reviews: any[];
      }> = [];

      // Create week buckets
      let weekStart = new Date(startDate);
      while (weekStart < endDate) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        weeks.push({
          startDate: new Date(weekStart),
          endDate: weekEnd > endDate ? new Date(endDate) : weekEnd,
          personalRatings: [],
          peerRatings: [],
          peerCounts: 0,
          sessionCount: 0,
          reviews: [],
        });

        weekStart.setDate(weekStart.getDate() + 7);
      }

      // Assign date groups to weeks
      Object.keys(dateGroups).forEach((dateKey) => {
        const date = new Date(dateKey);
        const week = weeks.find(w => date >= w.startDate && date <= w.endDate);
        if (week) {
          const group = dateGroups[dateKey];
          week.personalRatings.push(...group.personalRatings);
          week.peerRatings.push(...group.peerRatings);
          week.peerCounts += group.peerCounts;
          week.sessionCount += group.reviews.length;
          week.reviews.push(...group.reviews);
        }
      });

      // Convert weeks to data points
      weeks.forEach((week) => {
        const weekLabel = `${week.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${week.endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

        const personalAvg = week.personalRatings.length > 0
          ? Math.round((week.personalRatings.reduce((sum, r) => sum + r, 0) / week.personalRatings.length) * 10) / 10
          : null;

        const peerAvg = week.peerRatings.length > 0
          ? Math.round((week.peerRatings.reduce((sum, r) => sum + r, 0) / week.peerRatings.length) * 10) / 10
          : null;

        let details = null;
        if (week.reviews.length > 0) {
          const firstReview = week.reviews[0];
          let duration: string | undefined;
          if (firstReview.matchDuration) {
            duration = firstReview.matchDuration === "Other" ? `${firstReview.matchDurationCustom} min` : firstReview.matchDuration;
          } else if (firstReview.rollDuration) {
            duration = firstReview.rollDuration === "Other" ? `${firstReview.rollDurationCustom} min` : firstReview.rollDuration;
          }
          details = {
            matchType: firstReview.matchType,
            matchResult: firstReview.matchResult,
            duration,
            notes: firstReview.notes,
            hasMedia: week.reviews.some((r: any) => !!(r.media?.length > 0 || r.videoUrl)),
          };
        }

        dataPoints.push({
          date: week.startDate.toISOString(),
          dateFormatted: weekLabel,
          personalFeedback: personalAvg,
          peerFeedback: peerAvg,
          peerFeedbackCount: week.peerCounts,
          sessionCount: week.sessionCount,
          details,
        });
      });
    } else if (timeFilter === "90D") {
      // 90D: Monthly aggregation (3 months)
      const months: Array<{
        startDate: Date;
        endDate: Date;
        monthLabel: string;
        personalRatings: number[];
        peerRatings: number[];
        peerCounts: number;
        sessionCount: number;
        reviews: any[];
      }> = [];

      // Create month buckets
      const currentMonth = new Date(startDate);
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      while (currentMonth <= endDate) {
        const monthStart = new Date(currentMonth);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
        const finalEnd = monthEnd > endDate ? new Date(endDate) : monthEnd;

        months.push({
          startDate: monthStart,
          endDate: finalEnd,
          monthLabel: monthStart.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
          personalRatings: [],
          peerRatings: [],
          peerCounts: 0,
          sessionCount: 0,
          reviews: [],
        });

        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      // Assign date groups to months
      Object.keys(dateGroups).forEach((dateKey) => {
        const date = new Date(dateKey);
        const month = months.find(m => date >= m.startDate && date <= m.endDate);
        if (month) {
          const group = dateGroups[dateKey];
          month.personalRatings.push(...group.personalRatings);
          month.peerRatings.push(...group.peerRatings);
          month.peerCounts += group.peerCounts;
          month.sessionCount += group.reviews.length;
          month.reviews.push(...group.reviews);
        }
      });

      // Convert months to data points
      months.forEach((month) => {
        const personalAvg = month.personalRatings.length > 0
          ? Math.round((month.personalRatings.reduce((sum, r) => sum + r, 0) / month.personalRatings.length) * 10) / 10
          : null;

        const peerAvg = month.peerRatings.length > 0
          ? Math.round((month.peerRatings.reduce((sum, r) => sum + r, 0) / month.peerRatings.length) * 10) / 10
          : null;

        let details = null;
        if (month.reviews.length > 0) {
          const firstReview = month.reviews[0];
          let duration: string | undefined;
          if (firstReview.matchDuration) {
            duration = firstReview.matchDuration === "Other" ? `${firstReview.matchDurationCustom} min` : firstReview.matchDuration;
          } else if (firstReview.rollDuration) {
            duration = firstReview.rollDuration === "Other" ? `${firstReview.rollDurationCustom} min` : firstReview.rollDuration;
          }
          details = {
            matchType: firstReview.matchType,
            matchResult: firstReview.matchResult,
            duration,
            notes: firstReview.notes,
            hasMedia: month.reviews.some((r: any) => !!(r.media?.length > 0 || r.videoUrl)),
          };
        }

        dataPoints.push({
          date: month.startDate.toISOString(),
          dateFormatted: month.monthLabel,
          personalFeedback: personalAvg,
          peerFeedback: peerAvg,
          peerFeedbackCount: month.peerCounts,
          sessionCount: month.sessionCount,
          details,
        });
      });
    }
  } else {
    // For "all" time filter: only return dates that have data
    Object.keys(dateGroups).sort().forEach((dateKey) => {
      const group = dateGroups[dateKey];
      const dateFormatted = group.date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      // Calculate average personal rating for this date
      const personalAvgForDate = group.personalRatings.length > 0
        ? Math.round((group.personalRatings.reduce((sum, r) => sum + r, 0) / group.personalRatings.length) * 10) / 10
        : null;

      // Calculate average peer rating for this date
      const peerAvgForDate = group.peerRatings.length > 0
        ? Math.round((group.peerRatings.reduce((sum, r) => sum + r, 0) / group.peerRatings.length) * 10) / 10
        : null;

      // Use first review's details as representative
      const firstReview = group.reviews[0];
      let duration: string | undefined;
      if (firstReview.matchDuration) {
        duration = firstReview.matchDuration === "Other" ? `${firstReview.matchDurationCustom} min` : firstReview.matchDuration;
      } else if (firstReview.rollDuration) {
        duration = firstReview.rollDuration === "Other" ? `${firstReview.rollDurationCustom} min` : firstReview.rollDuration;
      }

      dataPoints.push({
        date: group.date.toISOString(),
        dateFormatted,
        personalFeedback: personalAvgForDate,
        peerFeedback: peerAvgForDate,
        peerFeedbackCount: group.peerCounts,
        sessionCount: group.reviews.length,
        details: {
          matchType: firstReview.matchType,
          matchResult: firstReview.matchResult,
          duration,
          notes: firstReview.notes,
          hasMedia: group.reviews.some((r: any) => !!(r.media?.length > 0 || r.videoUrl)),
        },
      });
    });
  }

  // Calculate summary statistics
  const personalScores = dataPoints.filter((d) => d.personalFeedback !== null).map((d) => d.personalFeedback as number);
  const peerScores = dataPoints.filter((d) => d.peerFeedback !== null).map((d) => d.peerFeedback as number);

  const personalAvg = personalScores.length > 0 
    ? Math.round((personalScores.reduce((a, b) => a + b, 0) / personalScores.length) * 10) / 10 
    : null;
  const peerAvg = peerScores.length > 0 
    ? Math.round((peerScores.reduce((a, b) => a + b, 0) / peerScores.length) * 10) / 10 
    : null;

  const personalBest = personalScores.length > 0 ? Math.max(...personalScores) : null;
  const peerBest = peerScores.length > 0 ? Math.max(...peerScores) : null;

  return {
    message: "Feedback graph data fetched successfully",
    data: {
      sportId,
      sessionType: sessionTypeFilter,
      timeFilter,
      summary: {
        totalSessions: dataPoints.length,
        personalFeedback: {
          count: personalScores.length,
          average: personalAvg,
          best: personalBest,
        },
        peerFeedback: {
          count: peerScores.length,
          average: peerAvg,
          best: peerBest,
        },
      },
      dataPoints,
    },
  };
};

/**
 * Mock data for feedback graph
 */
const getMockFeedbackGraphData = (sportId: string, sessionType: string, timeFilter: string, previousPeriod: number = 0) => {
  const sessionTypeFilter = sessionType === "match" ? "Match Type" : "Skill Practice";
  
  // Sample data - only some days have data
  const sampleData: Record<number, { personal: number | null; peer: number | null; peerCount: number; sessionCount: number; details: any }> = {
    0: { personal: 10, peer: 8.4, peerCount: 2, sessionCount: 1, details: { matchType: "No-Gi Competition", matchResult: "Win", duration: "5:00", notes: "Excellent performance overall", hasMedia: true } },
    1: { personal: 8.4, peer: 8.2, peerCount: 3, sessionCount: 2, details: { matchType: "No-Gi Competition", matchResult: "Win - Arm Triangle (Submission)", duration: "3:15", notes: "Felt sharper on knee-cut today.", hasMedia: true } },
    2: { personal: 7.4, peer: 7, peerCount: 1, sessionCount: 1, details: { matchType: "Skill Practice", matchResult: null, duration: "1.5 hours", notes: "Better escapes today", hasMedia: true } },
    4: { personal: 6, peer: 6, peerCount: 1, sessionCount: 1, details: { matchType: "Skill Practice", matchResult: null, duration: "1 hour", notes: "Good technique work today", hasMedia: false } },
    6: { personal: 2, peer: null, peerCount: 0, sessionCount: 1, details: { matchType: "No-Gi Competition", matchResult: null, duration: undefined, notes: undefined, hasMedia: false } },
    10: { personal: 7, peer: 6.5, peerCount: 1, sessionCount: 1, details: { matchType: "Skill Practice", matchResult: null, duration: "1 hour", notes: "Working on passes", hasMedia: false } },
    15: { personal: 8, peer: 7.8, peerCount: 2, sessionCount: 1, details: { matchType: "No-Gi Competition", matchResult: "Win", duration: "4:00", notes: "Good match", hasMedia: true } },
    22: { personal: 6.5, peer: 6, peerCount: 1, sessionCount: 1, details: { matchType: "Skill Practice", matchResult: null, duration: "1 hour", notes: "Technical drilling", hasMedia: false } },
    45: { personal: 7.5, peer: 7.2, peerCount: 2, sessionCount: 2, details: { matchType: "Skill Practice", matchResult: null, duration: "1.5 hours", notes: "Great progress", hasMedia: true } },
    60: { personal: 8.5, peer: 8, peerCount: 1, sessionCount: 1, details: { matchType: "No-Gi Competition", matchResult: "Win", duration: "3:30", notes: "Strong performance", hasMedia: true } },
    75: { personal: 7.8, peer: 7.5, peerCount: 1, sessionCount: 1, details: { matchType: "Skill Practice", matchResult: null, duration: "1 hour", notes: "Technique improvement", hasMedia: false } },
  };

  const mockDataPoints: Array<{
    date: string;
    dateFormatted: string;
    personalFeedback: number | null;
    peerFeedback: number | null;
    peerFeedbackCount: number;
    sessionCount: number;
    details: any;
  }> = [];

  // Calculate offset based on previous period
  let periodOffset = 0;
  if (timeFilter === "7D") {
    periodOffset = previousPeriod * 7;
  } else if (timeFilter === "30D") {
    periodOffset = previousPeriod * 30;
  } else if (timeFilter === "90D") {
    periodOffset = previousPeriod * 90;
  }

  if (timeFilter === "7D") {
    // 7D: Daily data points
    for (let i = 6; i >= 0; i--) {
      const daysAgo = periodOffset + i;
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const dateFormatted = date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      if (sampleData[i]) {
        mockDataPoints.push({
          date: date.toISOString(),
          dateFormatted,
          personalFeedback: sampleData[i].personal,
          peerFeedback: sampleData[i].peer,
          peerFeedbackCount: sampleData[i].peerCount,
          sessionCount: sampleData[i].sessionCount,
          details: sampleData[i].details,
        });
      } else {
        mockDataPoints.push({
          date: date.toISOString(),
          dateFormatted,
          personalFeedback: null,
          peerFeedback: null,
          peerFeedbackCount: 0,
          sessionCount: 0,
          details: null,
        });
      }
    }
  } else if (timeFilter === "30D") {
    // 30D: Weekly aggregation (4-5 weeks)
    const numWeeks = 5;
    for (let weekIndex = numWeeks - 1; weekIndex >= 0; weekIndex--) {
      const daysAgoEnd = periodOffset + (weekIndex * 7);
      const daysAgoStart = daysAgoEnd + 6;
      const weekStart = new Date(Date.now() - daysAgoStart * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(Date.now() - daysAgoEnd * 24 * 60 * 60 * 1000);
      
      const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

      // Aggregate data for this week
      const weekData: number[] = [];
      const weekStartDay = periodOffset + (numWeeks - 1 - weekIndex) * 7;
      let personalRatings: number[] = [];
      let peerRatings: number[] = [];
      let peerCounts = 0;
      let sessionCounts = 0;
      let hasDetails = false;
      let weekDetails = null;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const dayIndex = weekStartDay + dayOffset;
        if (sampleData[dayIndex]) {
          if (sampleData[dayIndex].personal) personalRatings.push(sampleData[dayIndex].personal!);
          if (sampleData[dayIndex].peer) peerRatings.push(sampleData[dayIndex].peer!);
          peerCounts += sampleData[dayIndex].peerCount;
          sessionCounts += sampleData[dayIndex].sessionCount;
          if (!hasDetails && sampleData[dayIndex].details) {
            weekDetails = sampleData[dayIndex].details;
            hasDetails = true;
          }
        }
      }

      const personalAvg = personalRatings.length > 0
        ? Math.round((personalRatings.reduce((sum, r) => sum + r, 0) / personalRatings.length) * 10) / 10
        : null;

      const peerAvg = peerRatings.length > 0
        ? Math.round((peerRatings.reduce((sum, r) => sum + r, 0) / peerRatings.length) * 10) / 10
        : null;

      mockDataPoints.push({
        date: weekStart.toISOString(),
        dateFormatted: weekLabel,
        personalFeedback: personalAvg,
        peerFeedback: peerAvg,
        peerFeedbackCount: peerCounts,
        sessionCount: sessionCounts,
        details: weekDetails,
      });
    }
  } else if (timeFilter === "90D") {
    // 90D: Monthly aggregation (3 months)
    const numMonths = 3;
    for (let monthIndex = numMonths - 1; monthIndex >= 0; monthIndex--) {
      const now = new Date();
      const monthsAgo = previousPeriod * 3 + monthIndex;
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const monthLabel = monthDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

      // Aggregate data for this month (simplified - using day ranges)
      const monthStartDay = periodOffset + (numMonths - 1 - monthIndex) * 30;
      let personalRatings: number[] = [];
      let peerRatings: number[] = [];
      let peerCounts = 0;
      let sessionCounts = 0;
      let hasDetails = false;
      let monthDetails = null;

      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const dayIndex = monthStartDay + dayOffset;
        if (sampleData[dayIndex]) {
          if (sampleData[dayIndex].personal) personalRatings.push(sampleData[dayIndex].personal!);
          if (sampleData[dayIndex].peer) peerRatings.push(sampleData[dayIndex].peer!);
          peerCounts += sampleData[dayIndex].peerCount;
          sessionCounts += sampleData[dayIndex].sessionCount;
          if (!hasDetails && sampleData[dayIndex].details) {
            monthDetails = sampleData[dayIndex].details;
            hasDetails = true;
          }
        }
      }

      const personalAvg = personalRatings.length > 0
        ? Math.round((personalRatings.reduce((sum, r) => sum + r, 0) / personalRatings.length) * 10) / 10
        : null;

      const peerAvg = peerRatings.length > 0
        ? Math.round((peerRatings.reduce((sum, r) => sum + r, 0) / peerRatings.length) * 10) / 10
        : null;

      mockDataPoints.push({
        date: monthDate.toISOString(),
        dateFormatted: monthLabel,
        personalFeedback: personalAvg,
        peerFeedback: peerAvg,
        peerFeedbackCount: peerCounts,
        sessionCount: sessionCounts,
        details: monthDetails,
      });
    }
  }

  const personalScores = mockDataPoints.filter((d) => d.personalFeedback !== null).map((d) => d.personalFeedback as number);
  const peerScores = mockDataPoints.filter((d) => d.peerFeedback !== null).map((d) => d.peerFeedback as number);

  const personalAvg = personalScores.length > 0 
    ? Math.round((personalScores.reduce((a, b) => a + b, 0) / personalScores.length) * 10) / 10 
    : null;
  const peerAvg = peerScores.length > 0 
    ? Math.round((peerScores.reduce((a, b) => a + b, 0) / peerScores.length) * 10) / 10 
    : null;

  const personalBest = personalScores.length > 0 ? Math.max(...personalScores) : null;
  const peerBest = peerScores.length > 0 ? Math.max(...peerScores) : null;

  // Count actual sessions (days with data)
  const totalSessions = mockDataPoints.filter(d => d.sessionCount > 0).reduce((sum, d) => sum + d.sessionCount, 0);

  return {
    message: "Feedback graph data fetched successfully (MOCK DATA)",
    data: {
      sportId,
      sessionType: sessionTypeFilter,
      timeFilter,
      summary: {
        totalSessions,
        personalFeedback: {
          count: personalScores.length,
          average: personalAvg,
          best: personalBest,
        },
        peerFeedback: {
          count: peerScores.length,
          average: peerAvg,
          best: peerBest,
        },
      },
      dataPoints: mockDataPoints,
    },
  };
};
