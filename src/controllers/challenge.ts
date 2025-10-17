import { Request, Response } from "express";
import {
  createChallenge,
  updateChallenge,
  removeChallenge,
  getChallengeById,
  getAllChallenges,
  handleGetLeaderBoard,
  updateChallengeSubmission,
} from "../services/challenge.js";

export const challengeController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createChallenge(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateChallenge(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await removeChallenge(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getChallengeById(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllChallenges(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getLeaderBoard: async (req: Request, res: Response) => {
    try {
      const result = await handleGetLeaderBoard(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  updateSubmission: async (req: Request, res: Response) => {
    try {
      const result = await updateChallengeSubmission(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
