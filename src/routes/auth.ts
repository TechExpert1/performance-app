import express from "express";
import {
  forgotPassword,
  login,
  signup,
  resetPassword,
  verifyOtp,
  verifyCode,
} from "../controllers/auth.js";
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
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/otp-verification", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-code", verifyCode);

export default router;
