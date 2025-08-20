import express from "express";
import { challengeController } from "../controllers/challenge.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { gymOwnerAuth } from "../middlewares/gymOwner.js";
const router = express.Router();

router.post(
  "/",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  challengeController.create
);
router.patch(
  "/:id",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  challengeController.update
);
router.delete("/:id", gymOwnerAuth, challengeController.remove);
router.get("/:id", challengeController.getById);
router.get("/:id/leader-board", challengeController.getLeaderBoard);
router.get("/", challengeController.getAll);

export default router;
