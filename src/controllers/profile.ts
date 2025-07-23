import { Request, Response } from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProfileImage,
} from "../services/profile.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

export const ProfileController = {
  get: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await getProfile(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await updateProfile(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await deleteProfile(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  updateImage: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await updateProfileImage(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
