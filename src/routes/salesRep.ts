import express from "express";
import { salesRepController } from "../controllers/salesRep.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { salesRepAuth as verifyToken } from "../middlewares/saleRep.js";
import { ProfileController } from "../controllers/profile.js";
import { signup } from "../controllers/auth.js";
import { validateUser } from "../validations/signup.js";
const router = express.Router();

router.post(
  "/gyms",
  verifyToken,
  newMulterUpload,
  uploadMultipleToS3,
  salesRepController.createGym
);
router.patch(
  "/gyms/:id",
  verifyToken,
  newMulterUpload,
  uploadMultipleToS3,
  salesRepController.updateGym
);
router.post(
  "/members",
  verifyToken,
  newMulterUpload,
  uploadMultipleToS3,
  validateUser,
  signup
);
router.get("/members", verifyToken, salesRepController.getMembers);
router.post("/gyms/add-member", verifyToken, salesRepController.addGymMember);
router.patch("/profile/:id", verifyToken, ProfileController.update);
router.get("/gyms/:gymId", salesRepController.getGymById);
router.get("/gyms", verifyToken, salesRepController.getAllGyms);

export default router;
