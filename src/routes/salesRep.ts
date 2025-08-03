import express from "express";
import { salesRepController } from "../controllers/salesRep.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { salesRepAuth as verifyToken } from "../middlewares/saleRep.js";
import { ProfileController } from "../controllers/profile.js";
const router = express.Router();

router.post(
  "/create-gym",
  verifyToken,
  newMulterUpload,
  uploadMultipleToS3,
  salesRepController.createGym
);
router.patch(
  "/update-gym/:id",
  verifyToken,
  newMulterUpload,
  uploadMultipleToS3,
  salesRepController.updateGym
);
router.post("/add-gym-member", verifyToken, salesRepController.addGymMember);
router.patch("/:id", verifyToken, ProfileController.update);

export default router;
