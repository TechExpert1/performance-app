import { Request, Response } from "express";
import {
  createAttendanceGoal,
  updateAttendanceGoal,
  removeAttendanceGoal,
  getAttendanceGoalById,
  getAllAttendanceGoals,
  getHomeStats,
} from "../services/attendanceGoal.js";

export const attendanceGoalController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createAttendanceGoal(req);
      res.status(201).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateAttendanceGoal(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await removeAttendanceGoal(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getAttendanceGoalById(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllAttendanceGoals(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
  homeStats: async (req: Request, res: Response) => {
    try {
      const result = await getHomeStats(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
};
