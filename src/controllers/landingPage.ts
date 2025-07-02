import { Request, Response } from "express";
import { submitForm } from "../services/landingPage.js";

export const landingPageController = {
  submit: async (req: Request, res: Response) => {
    try {
      const result = await submitForm(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
