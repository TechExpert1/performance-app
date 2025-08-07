import express from "express";
import { trainingCalendarController } from "../controllers/trainingCalendar.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

// Sports Type Routes
router.get("/monthly-counts", trainingCalendarController.getMonthlyCount);
router.get(
  "/update-status/:id",
  userAuth,
  trainingCalendarController.updateTrainingMemberStatus
);
router.get(
  "/:id/checkin-request",
  userAuth,
  trainingCalendarController.checkInRequest
);
router.post("/", userAuth, trainingCalendarController.create);
router.patch("/:id", trainingCalendarController.update);
router.delete("/:id", trainingCalendarController.remove);
router.get("/:id", trainingCalendarController.getById);
router.get("/", trainingCalendarController.getAll);
export default router;
