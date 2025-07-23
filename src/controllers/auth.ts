import { Request, Response } from "express";
import {
  handleSignup,
  handleLogin,
  handleForgotPassword,
  handleVerifyOtp,
  handleResetPassword,
  handleVerifyCode,
} from "../services/auth.js";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await handleSignup(req);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await handleLogin(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await handleForgotPassword(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await handleVerifyOtp(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await handleResetPassword(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};
export const verifyCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await handleVerifyCode(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};
