import { Request, Response } from "express";
import {
  getAllChallengeCategories,
  handleCreateChallenge,
  handleRemoveChallenge,
  handleCreateType,
  handleRemoveType,
  getAllChallengeCategoriesWithSubsAndExercises,
} from "../services/challengeCategory.js";

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

  challengeCategorySubAndExerciseDropdown: async (
    req: Request,
    res: Response
  ) => {
    try {
      const result = await getAllChallengeCategoriesWithSubsAndExercises(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const result = await handleCreateChallenge(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await handleRemoveChallenge(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
  createType: async (req: Request, res: Response) => {
    try {
      const result = await handleCreateType(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  removeType: async (req: Request, res: Response) => {
    try {
      const result = await handleRemoveType(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
