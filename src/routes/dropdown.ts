import { sportsController } from "./../controllers/sports.js";
import { challengeCategoryController } from "../controllers/challengeCategories.js";
import express from "express";

const router = express.Router();

router.get("/sports", sportsController.getSportsDrowpdown);
router.get(
  "/sports-skillLevel",
  sportsController.getSportsDrowpdownWithSkillLevel
);
router.get(
  "/challange-categories-types",
  challengeCategoryController.challengeCategoryDropdown
);
router.get(
  "/challange-categories-sub-exercise",
  challengeCategoryController.challengeCategorySubAndExerciseDropdown
);
export default router;
