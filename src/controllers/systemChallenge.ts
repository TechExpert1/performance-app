import { Request, Response } from "express";
import { getAllSystemChallenges } from "../services/systemChallenge.js";

export const SystemChallengeController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getAllSystemChallenges(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },
};
