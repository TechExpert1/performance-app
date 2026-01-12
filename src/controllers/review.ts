import { Request, Response } from "express";
import {
  createReview,
  updateReview,
  getReviewById,
  getAllReviews,
  removeReview,
  getSkillTrainingGraph,
} from "../services/review.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

export const reviewController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createReview(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateReview(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await removeReview(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getReviewById(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(404)
        .json({ error: err instanceof Error ? err.message : "Not found" });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllReviews(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  /**
   * Get skill training graph data for pie chart visualization
   * GET /reviews/skill-training-graph
   * Query: { sportId, giNoGi, timeFilter, mock }
   */
  getSkillTrainingGraphData: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await getSkillTrainingGraph(req);
      res.status(200).json(result);
    } catch (err: any) {
      if (err.message?.includes("required")) {
        res.status(400).json({ status: false, message: err.message });
        return;
      }
      if (err.message === "User not authenticated") {
        res.status(401).json({ status: false, message: err.message });
        return;
      }
      res.status(500).json({
        status: false,
        message: err instanceof Error ? err.message : "Failed to fetch skill training graph data",
      });
    }
  },
};
