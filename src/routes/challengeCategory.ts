import express from "express";
import { challengeCategoryController } from "../controllers/challengeCategories.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
const router = express.Router();

router.post(
  "/",
  newMulterUpload,
  uploadMultipleToS3,
  challengeCategoryController.create
);
router.delete("/:id", challengeCategoryController.remove);
router.post("/:categoryId/types", challengeCategoryController.createType);
router.delete(
  "/:categoryId/types/:typeId",
  challengeCategoryController.removeType
);

export default router;
