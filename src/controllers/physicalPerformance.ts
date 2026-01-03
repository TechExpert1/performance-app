import { Request, Response } from "express";
import {
  createPerformance,
  updatePerformance,
  removePerformance,
  getPerformanceById,
  getAllPerformances,
  getPerformanceGraph,
  getExerciseCompletedGraph,
  getPerformanceGraphIds,
} from "../services/physicalPerformance.js";

export const PhysicalPerformanceController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await createPerformance(req);
      res.status(201).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await updatePerformance(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await removePerformance(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getPerformanceById(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getAllPerformances(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  /**
   * Unified Performance Graph endpoint
   * Query params determine the response type:
   * - type: categories | exercises | data
   * - categoryId: required when type=exercises
   * - exerciseId: required when type=data
   * - timeFilter: 7D | 30D | 90D | all (for type=data)
   */
  graph: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getPerformanceGraph(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  /**
   * Exercise Completed Graph endpoint
   * Shows total sets logged as a vertical bar chart
   * Query params:
   * - view: weekly | monthly (default: weekly)
   * - date: ISO date string for weekly view (any date in target week)
   * - year: number for monthly view (default: current year)
   * - userId: optional - for coaches/gym owners to view athlete's data
   */
  exerciseCompleted: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getExerciseCompletedGraph(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  /**
   * Get all IDs for Performance Graph
   * Returns all categories and exercises with their IDs
   */
  graphIds: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getPerformanceGraphIds();
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },
};
