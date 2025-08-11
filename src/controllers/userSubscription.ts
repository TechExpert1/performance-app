import { Request, Response } from "express";
import {
  handleCreateSubscription,
  handleUpdateSubscription,
  handleCancelSubscription,
  getAllProductsWithPrices,
} from "../services/userSubscription.js";

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const result = await handleCreateSubscription(req);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(422)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const result = await handleUpdateSubscription(req);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(422)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const result = await handleCancelSubscription(req);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(422)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

export const products = async (req: Request, res: Response) => {
  try {
    const result = await getAllProductsWithPrices(req);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(422)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};
