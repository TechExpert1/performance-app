import { Router } from "express";
import { sportCategoryController } from "../controllers/userSportCategory.js";

const router = Router();

// Category routes
router.post("/categories", sportCategoryController.createCategory);
router.patch("/categories/:id", sportCategoryController.updateCategory);
router.delete("/categories/:id", sportCategoryController.deleteCategory);

// Skill routes
router.post("/skills", sportCategoryController.createSkill);
router.patch("/skills/:id", sportCategoryController.updateSkill);
router.delete("/skills/:id", sportCategoryController.deleteSkill);

// Aggregated data (sports → categories → skills)
router.get(
  "/categories-with-skills",
  sportCategoryController.getSportsWithCategoriesAndSkills
);

export default router;
