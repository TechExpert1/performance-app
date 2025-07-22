import { Request, Response } from "express";
import {
  subscribeUser,
  cancelUserSubscription,
  getFilters,
} from "../services/userSubscription.js";

export const UserSubscriptionController = {
  subscribe: async (req: Request, res: Response) => {
    try {
      const result = await subscribeUser(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  filters: async (req: Request, res: Response) => {
    try {
      const result = await getFilters(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  cancel: async (req: Request, res: Response) => {
    try {
      const result = await cancelUserSubscription(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
