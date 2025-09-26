import { Request, Response } from "express";
import {
  joinCommunityRequest,
  updateCommunityMemberStatus,
  leaveCommunity,
  handleAddMembers,
} from "../services/communityMember.js";

export const communityMemberController = {
  join: async (req: Request, res: Response) => {
    try {
      const result = await joinCommunityRequest(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  addMembers: async (req: Request, res: Response) => {
    try {
      const result = await handleAddMembers(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  updateMemberStatus: async (req: Request, res: Response) => {
    try {
      const result = await updateCommunityMemberStatus(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  leftCommunity: async (req: Request, res: Response) => {
    try {
      const result = await leaveCommunity(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
