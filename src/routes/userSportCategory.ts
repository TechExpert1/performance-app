import { Router } from "express";
import { sportCategoryController } from "../controllers/userSportCategory.js";
import { userAuth } from "../middlewares/user.js";

const router = Router();

// Category routes
router.post("/categories", userAuth, sportCategoryController.createCategory);
router.patch("/categories/:id", userAuth, sportCategoryController.updateCategory);
router.delete("/categories/:id", userAuth, sportCategoryController.deleteCategory);

// Skill routes
router.post("/skills", userAuth, sportCategoryController.createSkill);
router.patch("/skills/:id", userAuth, sportCategoryController.updateSkill);
router.delete("/skills/:id", userAuth, sportCategoryController.deleteSkill);

// Aggregated data (sports → categories → skills) - works without auth, uses user query param
router.get(
  "/categories-with-skills",
  sportCategoryController.getSportsWithCategoriesAndSkills
);

export default router;
