import express from "express";
import {
  createNewFeedbackRequest,
  getReceivedFeedbackRequests,
  getSentFeedbackRequests,
  getFeedbackRequestDetails,
  submitFeedbackForRequest,
  getFeedbackGraphData,
} from "../controllers/feedbackRequest.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

/**
 * @route   GET /feedback-requests/graph
 * @desc    Get feedback graph data for visualizing personal vs peer feedback over time
 * @access  Private (User)
 * @query   { sportId: string, sessionType: "skill" | "match", timeFilter: "7D" | "30D" | "90D" | "all", previous: number }
 */
router.get("/graph", userAuth, getFeedbackGraphData);

/**
 * @route   POST /feedback-requests
 * @desc    Create a new feedback request
 * @access  Private (User)
 * @body    { recipientId, reviewId, sportId, skills, type, requestMessage }
 */
router.post("/", userAuth, createNewFeedbackRequest);

/**
 * @route   GET /feedback-requests/received
 * @desc    Get all feedback requests received by the authenticated user
 * @access  Private (User)
 */
router.get("/received", userAuth, getReceivedFeedbackRequests);

/**
 * @route   GET /feedback-requests/sent
 * @desc    Get all feedback requests sent by the authenticated user
 * @access  Private (User)
 */
router.get("/sent", userAuth, getSentFeedbackRequests);

/**
 * @route   GET /feedback-requests/:id
 * @desc    Get details of a specific feedback request
 * @access  Private (User - must be requester or recipient)
 */
router.get("/:id", userAuth, getFeedbackRequestDetails);

/**
 * @route   POST /feedback-requests/:id/submit
 * @desc    Submit feedback for a request (recipient only)
 * @access  Private (User - must be recipient)
 * @body    { feedbackRating: number, feedbackComment: string }
 */
router.post("/:id/submit", userAuth, submitFeedbackForRequest);

export default router;
