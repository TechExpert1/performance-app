import express from "express";
import {
  create,
  update,
  remove,
  getAll,
  getById,
} from "../controllers/sportsType.js";
import { sportsController } from "../controllers/sports.js";
import { sportCategoryController } from "../controllers/sportCategory.js";
import { sportCategorySkillController } from "../controllers/sportCategorySkill.js";

const router = express.Router();

// Sports Type Routes
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id", getById);
router.get("/", getAll);

// Nested Sports Routes under a specific SportsType
router.post("/:sportsTypesId/sports", sportsController.create);
router.patch("/:sportsTypesId/sports/:id", sportsController.update);
router.delete("/:sportsTypesId/sports/:id", sportsController.remove);
router.get("/:sportsTypesId/sports/:id", sportsController.getById);
router.get("/:sportsTypesId/sports", sportsController.getAll);

// sports category

router.post(
  "/:sportsTypesId/sports/:sportId/categories",
  sportCategoryController.create
);
router.get(
  "/:sportsTypesId/sports/:sportId/categories",
  sportCategoryController.getAll
);
router.get(
  "/:sportsTypesId/sports/:sportId/categories/:id",
  sportCategoryController.getById
);
router.patch(
  "/:sportsTypesId/sports/:sportId/categories/:id",
  sportCategoryController.update
);
router.delete(
  "/:sportsTypesId/sports/:sportId/categories/:id",
  sportCategoryController.remove
);

// Nested Skills under a Sport Category
router.post(
  "/:sportsTypesId/sports/:sportId/categories/:categoryId/skills",
  sportCategorySkillController.create
);
router.get(
  "/:sportsTypesId/sports/:sportId/categories/:categoryId/skills",
  sportCategorySkillController.getAll
);
router.get(
  "/:sportsTypesId/sports/:sportId/categories/:categoryId/skills/:id",
  sportCategorySkillController.getById
);
router.patch(
  "/:sportsTypesId/sports/:sportId/categories/:categoryId/skills/:id",
  sportCategorySkillController.update
);
router.delete(
  "/:sportsTypesId/sports/:sportId/categories/:categoryId/skills/:id",
  sportCategorySkillController.remove
);
export default router;
