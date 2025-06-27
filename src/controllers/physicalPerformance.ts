import { Request, Response } from "express";
import {
  createPerformance,
  updatePerformance,
  removePerformance,
  getPerformanceById,
  getAllPerformances,
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
};
