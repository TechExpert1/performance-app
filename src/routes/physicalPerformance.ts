import express from "express";
import { PhysicalPerformanceController } from "../controllers/physicalPerformance.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

// ========================================
// PERFORMANCE GRAPH ROUTE
// ========================================
// Single unified endpoint with query parameters:
// - type: categories | exercises | data
// - categoryId: required when type=exercises
// - exerciseId: required when type=data
// - timeFilter: 7D | 30D | 90D | all (for type=data, default: 30D)
router.get("/graph", userAuth, PhysicalPerformanceController.graph);

// Get all IDs for Performance Graph (categories, exercises)
router.get("/graph/ids", userAuth, PhysicalPerformanceController.graphIds);

// ========================================
// EXERCISE COMPLETED GRAPH ROUTE
// ========================================
// Vertical bar chart showing total sets logged
// Query parameters:
// - view: weekly | monthly (default: weekly)
// - date: ISO date string for weekly view (any date within the target week)
// - year: number for monthly view (default: current year)
// - userId: optional - for coaches/gym owners to view athlete's data
router.get("/exercise-completed", userAuth, PhysicalPerformanceController.exerciseCompleted);

// ========================================
// EXISTING ROUTES
// ========================================
router.post("/", userAuth, PhysicalPerformanceController.create);
router.patch("/:id", userAuth, PhysicalPerformanceController.update);
router.delete("/:id", userAuth, PhysicalPerformanceController.remove);
router.get("/:id", PhysicalPerformanceController.getById);
router.get("/", PhysicalPerformanceController.getAll);
export default router;
