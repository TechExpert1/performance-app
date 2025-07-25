import express from "express";
import { reviewController } from "../controllers/review.js";
import { multerUpload, uploadSingleToS3 } from "../helpers/s3Utils.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { userAuth } from "../middlewares/user.js";
const router = express.Router();

router.post(
  "/",
  userAuth,
  newMulterUpload,
  uploadMultipleToS3,
  reviewController.create
);
router.patch(
  "/:id",
  userAuth,
  newMulterUpload,
  uploadMultipleToS3,
  reviewController.update
);
router.delete("/:id", reviewController.remove);
router.get("/:id", reviewController.getById);
router.get("/", reviewController.getAll);

export default router;
