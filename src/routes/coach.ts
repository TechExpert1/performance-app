import express from "express";
import { CoachController } from "../controllers/coach.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import { gymOwnerAuth } from "../middlewares/gymOwner.js";
import { salesRepController } from "../controllers/salesRep.js";
const router = express.Router();
import { validateCoach } from "../validations/coach.js";
router.post(
  "/",
  gymOwnerAuth,
  newMulterUpload,
  uploadMultipleToS3,
  validateCoach,
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
router.post("/:id/assign-member", gymOwnerAuth, CoachController.assignMember);
router.post("/add-gym-member", gymOwnerAuth, salesRepController.addGymMember);
router.get("/:id", CoachController.getById);
router.get("/:id/get-members", CoachController.getMembers);
router.get("/", CoachController.getAll);

export default router;
