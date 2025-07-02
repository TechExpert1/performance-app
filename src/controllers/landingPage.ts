import { Request, Response } from "express";
import {
  submitcareerForm,
  submitEarlyAccessForm,
} from "../services/landingPage.js";

export const landingPageController = {
  careerForm: async (req: Request, res: Response) => {
    try {
      const result = await submitcareerForm(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
  earlyAccessForm: async (req: Request, res: Response) => {
    try {
      const result = await submitEarlyAccessForm(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
