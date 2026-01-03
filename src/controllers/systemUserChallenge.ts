import { Request, Response } from "express";
import {
  createSystemUserChallenge,
  updateSystemUserChallenge,
  getAllSystemUserChallenges,
  getAllStats,
  getPerformanceChallengeGraph,
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

  /**
   * Unified Performance Challenge Graph endpoint
   * Query params determine the response type:
   * - type: categories | packs | challenges | data | my-challenges | overview
   * - categoryId: required when type=packs
   * - packId: required when type=challenges
   * - challengeId: required when type=data
   * - timeFilter: 7D | 30D | 90D | all (for type=data)
   * - category: optional filter for type=my-challenges
   */
  graph: async (req: Request, res: Response) => {
    try {
      const result = await getPerformanceChallengeGraph(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },
};
