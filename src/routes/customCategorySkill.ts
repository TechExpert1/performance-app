import express from "express";
import { customCategorySkillController } from "../controllers/customCategorySkill.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

// All routes require authentication
router.use(userAuth);

// Custom Category Routes
router.post("/categories", customCategorySkillController.createCategory);
router.get("/categories", customCategorySkillController.getCategories);
router.delete("/categories/:id", customCategorySkillController.deleteCategory);

// Custom Skill Routes
router.post("/skills", customCategorySkillController.createSkill);
router.get("/skills", customCategorySkillController.getSkills);
router.delete("/skills/:id", customCategorySkillController.deleteSkill);

export default router;
