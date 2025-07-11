import express from "express";
import { landingPageController } from "../controllers/landingPage.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
const router = express.Router();

router.post(
  "/submit-career-form",
  newMulterUpload,
  uploadMultipleToS3,
  landingPageController.careerForm
);
router.get("/career-forms", landingPageController.indexCareerForm);
router.post("/early-access-form", landingPageController.earlyAccessForm);
export default router;
