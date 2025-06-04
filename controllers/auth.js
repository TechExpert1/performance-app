import {
  handleSignup,
  handleLogin,
  handleForgotPassword,
  handleVerifyOtp,
  handleResetPassword,
} from "../services/auth.js";

export const signup = async (req, res) => {
  try {
    const result = await handleSignup(req);
    res.status(201).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await handleLogin(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await handleForgotPassword(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const result = await handleVerifyOtp(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await handleResetPassword(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};
