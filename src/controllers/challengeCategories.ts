import { Request, Response } from "express";
import { getAllChallengeCategories } from "../services/challengeCategory.js";

export const challengeCategoryController = {
  challengeCategoryDropdown: async (req: Request, res: Response) => {
    try {
      const result = await getAllChallengeCategories(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
