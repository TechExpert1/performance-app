import { Request, Response } from "express";
import {
  handleSignup,
  handleLogin,
  handleForgotPassword,
  handleVerifyOtp,
  handleResetPassword,
  handleVerifyCode,
  handleGoogleLogin,
  handleAppleLogin,
  handleGoogleLoginGym,
  handleAppleLoginGym,
  handleDeleteAccount,
} from "../services/auth.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

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

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await handleGoogleLogin(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const appleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await handleAppleLogin(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const googleLoginGym = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await handleGoogleLoginGym(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const appleLoginGym = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await handleAppleLoginGym(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await handleDeleteAccount(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};
