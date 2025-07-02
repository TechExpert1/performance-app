import express from "express";
import { landingPageController } from "../controllers/landingPage.js";
import { multerUpload, uploadSingleToS3 } from "../helpers/s3Utils.js";
const router = express.Router();

router.post(
  "/submit-career-form",
  multerUpload.single("file"),
  uploadSingleToS3,
  landingPageController.submit
);
export default router;
