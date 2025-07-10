import express from "express";
import { CoachController } from "../controllers/coach.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { gymOwnerAuth } from "../middlewares/gymOwner.js";
const router = express.Router();

router.post(
  "/",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  CoachController.create
);
router.patch(
  "/:id",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  CoachController.update
);
router.delete("/:id", gymOwnerAuth, CoachController.remove);
router.get("/:id", CoachController.getById);
router.get("/", CoachController.getAll);

export default router;
