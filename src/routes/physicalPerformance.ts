import express from "express";
import { PhysicalPerformanceController } from "../controllers/physicalPerformance.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

router.post("/", userAuth, PhysicalPerformanceController.create);
router.patch("/:id", userAuth, PhysicalPerformanceController.update);
router.delete("/:id", userAuth, PhysicalPerformanceController.remove);
router.get("/:id", PhysicalPerformanceController.getById);
router.get("/", PhysicalPerformanceController.getAll);
export default router;
