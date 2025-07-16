import { Request, Response } from "express";
import {
  joinCommunityRequest,
  updateCommunityMemberStatus,
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
};
