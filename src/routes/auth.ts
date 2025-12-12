import express from "express";
import {
  forgotPassword,
  login,
  signup,
  resetPassword,
  verifyOtp,
  verifyCode,
  googleLogin,
  appleLogin,
  googleLoginGym,
  appleLoginGym,
  deleteAccount,
} from "../controllers/auth.js";
import { userAuth } from "../middlewares/user.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { validateUser } from "../validations/signup.js";
const router = express.Router();
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    error: "Too many attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
router.post(
  "/sign-up",
  newMulterUpload,
  uploadMultipleToS3,
  validateUser,
  signup
);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/apple-login", appleLogin);
router.post("/google-login-gym", googleLoginGym);
router.post("/apple-login-gym", appleLoginGym);
router.delete("/delete-account", userAuth, deleteAccount);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/otp-verification", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-code", verifyCode);

export default router;
