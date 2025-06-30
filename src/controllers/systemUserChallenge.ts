import { Request, Response } from "express";
import {
  createSystemUserChallenge,
  updateSystemUserChallenge,
  getAllSystemUserChallenges,
  getAllStats,
} from "../services/systemUserChallenge.js";

export const SystemUserChallengeController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createSystemUserChallenge(req);
      res.status(201).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateSystemUserChallenge(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllSystemUserChallenges(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },
  stats: async (req: Request, res: Response) => {
    try {
      const result = await getAllStats(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },
};
