import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { getAllJournals } from "../services/journal.js";

export const journalController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllJournals(req as AuthenticatedRequest);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
