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

const router = express.Router();

// Routes
router.post("/sign-up", newMulterUpload, uploadMultipleToS3, signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/otp-verification", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-code", verifyCode);

export default router;
