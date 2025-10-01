import { Request, Response } from "express";
import {
  handleCreate,
  handleUpdate,
  handleDelete,
  handleShow,
  handleIndex,
} from "../services/userPerformanceExercise.js";

export const UserPerformanceExerciseController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handleCreate(req);
      res.status(201).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handleUpdate(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handleDelete(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  show: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handleShow(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  },

  index: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handleIndex(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },
};
