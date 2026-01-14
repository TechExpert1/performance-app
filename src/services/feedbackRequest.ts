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
 * - mock: "true" - Return mock data for testing
 */
export const getFeedbackGraph = async (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { sportId, sessionType = "skill", timeFilter = "7D", mock } = req.query;

  if (!sportId) {
    throw new Error("sportId is required");
  }

  // Return mock data if requested
  if (mock === "true") {
    return getMockFeedbackGraphData(sportId as string, sessionType as string, timeFilter as string);
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

  // Determine session type filter
  const sessionTypeFilter = sessionType === "match" ? "Match Type" : "Skill Practice";

  // Build query for reviews
  const query: any = {
    user: req.user.id,
    sport: sportId,
    sessionType: sessionTypeFilter,
  };

  if (startDate) {
    query.createdAt = { $gte: startDate };
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

  // Build data points for the graph
  const dataPoints: Array<{
    date: string;
    dateFormatted: string;
    personalFeedback: number | null;
    peerFeedback: number | null;
    peerFeedbackCount: number;
    details: {
      matchType?: string;
      matchResult?: string;
      duration?: string;
      notes?: string;
      hasMedia: boolean;
    };
  }> = [];

  reviews.forEach((review: any) => {
    const reviewDate = new Date(review.createdAt);
    const dateFormatted = reviewDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    // Personal feedback is the rating field on the review
    const personalRating = review.rating || null;

    // Peer feedback - calculate average from all peer feedback requests
    const reviewId = review._id.toString();
    let peerRating: number | null = null;
    let peerCount = 0;

    if (peerFeedbackMap[reviewId] && peerFeedbackMap[reviewId].ratings.length > 0) {
      const ratings = peerFeedbackMap[reviewId].ratings;
      peerRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      peerRating = Math.round(peerRating * 10) / 10; // Round to 1 decimal
      peerCount = peerFeedbackMap[reviewId].count;
    } else if (review.peerFeedback?.rating) {
      // Fallback to inline peer feedback if exists
      peerRating = review.peerFeedback.rating;
      peerCount = 1;
    }

    // Duration - check match or roll duration
    let duration: string | undefined;
    if (review.matchDuration) {
      duration = review.matchDuration === "Other" ? `${review.matchDurationCustom} min` : review.matchDuration;
    } else if (review.rollDuration) {
      duration = review.rollDuration === "Other" ? `${review.rollDurationCustom} min` : review.rollDuration;
    }

    dataPoints.push({
      date: reviewDate.toISOString(),
      dateFormatted,
      personalFeedback: personalRating,
      peerFeedback: peerRating,
      peerFeedbackCount: peerCount,
      details: {
        matchType: review.matchType,
        matchResult: review.matchResult,
        duration,
        notes: review.notes,
        hasMedia: !!(review.media?.length > 0 || review.videoUrl),
      },
    });
  });

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
const getMockFeedbackGraphData = (sportId: string, sessionType: string, timeFilter: string) => {
  const sessionTypeFilter = sessionType === "match" ? "Match Type" : "Skill Practice";
  
  const mockDataPoints = [
    {
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: "Nov 1",
      personalFeedback: 2,
      peerFeedback: null,
      peerFeedbackCount: 0,
      details: {
        matchType: "No-Gi Competition",
        matchResult: null,
        duration: undefined,
        notes: undefined,
        hasMedia: false,
      },
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: "Nov 2",
      personalFeedback: 2,
      peerFeedback: 1,
      peerFeedbackCount: 1,
      details: {
        matchType: "No-Gi Competition",
        matchResult: null,
        duration: undefined,
        notes: undefined,
        hasMedia: false,
      },
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: "Nov 3",
      personalFeedback: 6,
      peerFeedback: 6,
      peerFeedbackCount: 1,
      details: {
        matchType: "Skill Practice",
        matchResult: null,
        duration: "1 hour",
        notes: "Good technique work today",
        hasMedia: false,
      },
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: "Nov 4",
      personalFeedback: 6,
      peerFeedback: 6,
      peerFeedbackCount: 1,
      details: {
        matchType: "Skill Practice",
        matchResult: null,
        duration: "1 hour",
        notes: "Focused on guard transitions",
        hasMedia: false,
      },
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: "Nov 5",
      personalFeedback: 7.4,
      peerFeedback: 7,
      peerFeedbackCount: 1,
      details: {
        matchType: "Skill Practice",
        matchResult: null,
        duration: "1.5 hours",
        notes: "Better escapes today",
        hasMedia: true,
      },
    },
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: "Nov 6",
      personalFeedback: 8.4,
      peerFeedback: 8.2,
      peerFeedbackCount: 3,
      details: {
        matchType: "No-Gi Competition",
        matchResult: "Win - Arm Triangle (Submission)",
        duration: "3:15",
        notes: "Felt sharper on knee-cut today.",
        hasMedia: true,
      },
    },
    {
      date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: "Nov 7",
      personalFeedback: 10,
      peerFeedback: 8.4,
      peerFeedbackCount: 2,
      details: {
        matchType: "No-Gi Competition",
        matchResult: "Win",
        duration: "5:00",
        notes: "Excellent performance overall",
        hasMedia: true,
      },
    },
  ];

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

  return {
    message: "Feedback graph data fetched successfully (MOCK DATA)",
    data: {
      sportId,
      sessionType: sessionTypeFilter,
      timeFilter,
      summary: {
        totalSessions: mockDataPoints.length,
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
