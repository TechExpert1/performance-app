import { NextFunction, Router, Request, Response } from "express";
import {
  adminSignup,
  deleteAUser,
  getAdmins,
  getGeneralUsers,
  getNoOfAllTypesOfUsers,
  getSingleUserDetails,
  LoginAdmin,
  searchGeneralUsersByEmail,
  sendOtpAdmin,
  uploadImageAdmin,
  verifyOTPAndResetPassAdmin,
} from "../controllers/admin.js";
import { verifyAdminToken as verifyToken } from "../middlewares/admin.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
const router = Router();
// auth
router.post("/login", LoginAdmin);
router.post("/signup", adminSignup);
// forget pass
router.post("/otp/send" , sendOtpAdmin);
router.post("/otp/verify-and-reset" , verifyOTPAndResetPassAdmin);
// homepage
router.get("/dashboard/home", verifyToken, getNoOfAllTypesOfUsers);
// all user types flows in admin
router.get("/users/general-users", verifyToken, getGeneralUsers);
router.get(
  "/users/general-users/search",
  verifyToken,
  searchGeneralUsersByEmail
);
router.get("/users/details/:userId", verifyToken, getSingleUserDetails);
router.delete("/users/:userId", verifyToken, deleteAUser);
router.get("/admins", verifyToken, getAdmins);
router.patch(
  "/profile",
  verifyToken,
  newMulterUpload,
  uploadMultipleToS3,
  uploadImageAdmin
);
export default router;
