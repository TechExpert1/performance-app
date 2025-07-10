import { Request, Response } from "express";
import {
  createCoach,
  updateCoach,
  removeCoach,
  getCoachById,
  getAllCoachs,
} from "../services/coach.js";

export const CoachController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createCoach(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateCoach(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await removeCoach(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getCoachById(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllCoachs(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
