import express from "express";
import {
  forgotPassword,
  login,
  signup,
  resetPassword,
  verifyOtp,
} from "../controllers/auth.js";
import {
  multerUpload,
  uploadSingleToS3,
  newMulterUpload,
  newUploadMultipleToS3,
} from "../helpers/s3Utils.js";

const router = express.Router();

// Routes
router.post("/sign-up", newMulterUpload, newUploadMultipleToS3, signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/otp-verification", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
