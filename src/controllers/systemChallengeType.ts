import { Request, Response } from "express";
import { getAllSystemChallengeTypes } from "../services/systemChallengeType.js";
export const SystemChallengeTypeController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getAllSystemChallengeTypes(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({ error: (err as Error).message });
    }
  },
};
