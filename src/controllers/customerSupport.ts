import { Request, Response } from "express";
import {
  handleCustomerSupportEmail,
  getAllCustomerSupports,
} from "../services/customerSupport.js";

export const customerSupportController = {
  sendEmail: async (req: Request, res: Response) => {
    try {
      const result = await handleCustomerSupportEmail(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Failed to send customer support email",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllCustomerSupports(req);
      res.status(200).json(result);
    } catch (err) {
      res.status(422).json({
        error: err instanceof Error ? err.message : "Failed to fetch customer support entries",
      });
    }
  },
};
