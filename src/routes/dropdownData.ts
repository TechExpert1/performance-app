import express from "express";
import { getDropdownController } from "../controllers/dropdownData.js";

const router = express.Router();

// Sports endpoints
router.get("/sports", getDropdownController.getAllSports);
router.get("/sports/:id", getDropdownController.getSportById);

// Exercises endpoints
router.get("/exercises", getDropdownController.getAllExercises);
router.get("/exercises/:id", getDropdownController.getExerciseById);
router.get("/exercises/category/:categoryId", getDropdownController.getExercisesByCategory);

export default router;
