import { Request, Response } from "express";
import {
  createReview,
  updateReview,
  getReviewById,
  getAllReviews,
  removeReview,
} from "../services/review.js";

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
};
