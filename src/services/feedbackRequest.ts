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
      path: "skills.skillId",
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
      _id: s.skillId?._id,
      name: s.skillId?.name,
    })) || [],
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
