import { Router } from "express";
import { UserPerformanceExerciseController } from "../controllers/userPerformanceExercise.js";
import { userAuth } from "../middlewares/user.js";

const router = Router();

router.post("/", userAuth, UserPerformanceExerciseController.create);
router.put("/:id", userAuth, UserPerformanceExerciseController.update);
router.delete("/:id", userAuth, UserPerformanceExerciseController.delete);
router.get("/:id", UserPerformanceExerciseController.show);
router.get("/", UserPerformanceExerciseController.index);

export default router;
