import express from "express";
import { challengeController } from "../controllers/challenge.js";
import { multerUpload, uploadSingleToS3 } from "../helpers/s3Utils.js";
import { gymOwnerAuth } from "../middlewares/gymOwner.js";
const router = express.Router();

router.post(
  "/",
  gymOwnerAuth,
  multerUpload.single("image"),
  uploadSingleToS3,
  challengeController.create
);
router.patch(
  "/:id",
  gymOwnerAuth,
  multerUpload.single("image"),
  uploadSingleToS3,
  challengeController.update
);
router.delete("/:id", gymOwnerAuth, challengeController.remove);
router.get("/:id", challengeController.getById);
router.get("/", challengeController.getAll);

export default router;
