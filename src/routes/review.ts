import express from "express";
import { reviewController } from "../controllers/review.js";
import { multerUpload, uploadSingleToS3 } from "../helpers/s3Utils.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { userAuth } from "../middlewares/user.js";
const router = express.Router();

/**
 * @route   GET /reviews/skill-training-graph
 * @desc    Get skill training graph data for pie chart visualization
 * @access  Private (User)
 * @query   { sportId: string, giNoGi: "gi" | "no-gi" | "all", timeFilter: "7D" | "30D" | "90D" | "all", mock: "true" }
 */
router.get("/skill-training-graph", userAuth, reviewController.getSkillTrainingGraphData);

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
