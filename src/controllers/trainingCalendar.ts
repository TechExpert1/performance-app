import { Request, Response } from "express";
import {
  createTrainingCalendar,
  updateTrainingCalendar,
  getAllTrainingCalendars,
  getTrainingCalendarById,
  deleteTrainingCalendar,
  getUserMonthlyTrainingCount,
} from "../services/trainingCalendar.js";

export const trainingCalendarController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createTrainingCalendar(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateTrainingCalendar(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getTrainingCalendarById(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(404)
        .json({ error: err instanceof Error ? err.message : "Not found" });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllTrainingCalendars(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getMonthlyCount: async (req: Request, res: Response) => {
    try {
      const result = await getUserMonthlyTrainingCount(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await deleteTrainingCalendar(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
