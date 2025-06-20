import express from "express";
import { attendanceGoalController } from "../controllers/attendanceGoal.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

router.get("/home-stats", userAuth, attendanceGoalController.homeStats);
router.post("/", userAuth, attendanceGoalController.create);
router.patch("/:id", userAuth, attendanceGoalController.update);
router.delete("/:id", userAuth, attendanceGoalController.remove);

router.get("/", userAuth, attendanceGoalController.getAll);
router.get(
  "/type-grouped",
  userAuth,
  attendanceGoalController.attendanceGoalsGroupedByType
);
router.get("/:id", attendanceGoalController.getById);
export default router;
