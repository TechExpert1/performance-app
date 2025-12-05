import { sportsController } from "./../controllers/sports.js";
import { challengeCategoryController } from "../controllers/challengeCategories.js";
import { getDropdownController } from "../controllers/dropdownData.js";
import { userAuth } from "../middlewares/user.js";
import express from "express";

const router = express.Router();

router.get("/sports", userAuth, sportsController.getSportsDrowpdown);
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
router.get(
  "/journals-filters",
  getDropdownController.getJournalsFilterDropdowns
);

export default router;
