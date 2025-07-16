import { Request, Response } from "express";
import {
  createCommunity,
  updateCommunity,
  removeCommunity,
  getCommunityById,
  getAllCommunities,
  getActiveMembersOfCommunity,
  handleGetRequests,
} from "../services/community.js";

export const communityController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createCommunity(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateCommunity(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await removeCommunity(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getCommunityById(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getRequests: async (req: Request, res: Response) => {
    try {
      const result = await handleGetRequests(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getMembers: async (req: Request, res: Response) => {
    try {
      const result = await getActiveMembersOfCommunity(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllCommunities(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
