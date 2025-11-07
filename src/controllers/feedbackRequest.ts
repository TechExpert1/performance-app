import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user.js";
import {
  createFeedbackRequest,
  getReceivedRequests,
  getSentRequests,
  getRequestDetails,
  submitFeedback,
} from "../services/feedbackRequest.js";

/**
 * Create a new feedback request
 * POST /feedback-requests
 */
export const createNewFeedbackRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await createFeedbackRequest(req);
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error creating feedback request:", error);
    
    if (
      error.message.includes("required") ||
      error.message.includes("must be either") ||
      error.message.includes("already exists")
    ) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
      return;
    }

    if (error.message === "Review not found") {
      res.status(404).json({
        status: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      status: false,
      message: error.message || "Failed to create feedback request",
    });
  }
};

/**
 * Get feedback requests received by the authenticated user
 * GET /feedback-requests/received
 */
export const getReceivedFeedbackRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await getReceivedRequests(req);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error fetching received feedback requests:", error);
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch received feedback requests",
    });
  }
};

/**
 * Get feedback requests sent by the authenticated user
 * GET /feedback-requests/sent
 */
export const getSentFeedbackRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await getSentRequests(req);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error fetching sent feedback requests:", error);
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch sent feedback requests",
    });
  }
};

/**
 * Get details of a specific feedback request
 * GET /feedback-requests/:id
 */
export const getFeedbackRequestDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await getRequestDetails(req);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error fetching feedback request details:", error);
    
    if (error.message === "Invalid feedback request ID") {
      res.status(400).json({
        status: false,
        message: error.message,
      });
      return;
    }

    if (error.message === "Feedback request not found") {
      res.status(404).json({
        status: false,
        message: error.message,
      });
      return;
    }
    
    if (error.message === "You are not authorized to view this request") {
      res.status(403).json({
        status: false,
        message: error.message,
      });
      return;
    }
    
    res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch feedback request details",
    });
  }
};

/**
 * Submit feedback for a request
 * POST /feedback-requests/:id/submit
 * Body: { feedbackRating: number, feedbackComment: string }
 */
export const submitFeedbackForRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await submitFeedback(req);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    
    if (error.message === "Invalid feedback request ID") {
      res.status(400).json({
        status: false,
        message: error.message,
      });
      return;
    }

    if (error.message === "Feedback request not found") {
      res.status(404).json({
        status: false,
        message: error.message,
      });
      return;
    }
    
    if (
      error.message === "Only the recipient can submit feedback" ||
      error.message === "Feedback has already been submitted for this request" ||
      error.message.includes("required") ||
      error.message.includes("between 1 and 10")
    ) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
      return;
    }
    
    res.status(500).json({
      status: false,
      message: error.message || "Failed to submit feedback",
    });
  }
};
