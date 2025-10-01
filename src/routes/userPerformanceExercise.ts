import { Router } from "express";
import { UserPerformanceExerciseController } from "../controllers/userPerformanceExercise.js";
import { userAuth } from "../middlewares/user.js";

const router = Router();

router.post("/", userAuth, UserPerformanceExerciseController.create);
router.put("/:id", UserPerformanceExerciseController.update);
router.delete("/:id", UserPerformanceExerciseController.delete);
router.get("/:id", UserPerformanceExerciseController.show);
router.get("/", userAuth, UserPerformanceExerciseController.index);

export default router;
