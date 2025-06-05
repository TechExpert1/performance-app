import express from "express";
import {
  create,
  update,
  remove,
  getAll,
  getById,
} from "../controllers/sportsType.js";
import { sportsController } from "../controllers/sports.js";
const router = express.Router();

router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id", getById);
router.get("/", getAll);
// sports
router.post("/:sportsTypesId/sports", sportsController.create);
router.patch("/:sportsTypesId/sports/:id", sportsController.update);
router.delete("/:sportsTypesId/sports/:id", sportsController.remove);
router.get("/:sportsTypesId/sports/:id", sportsController.getById);
router.get("/:sportsTypesId/sports", sportsController.getAll);

export default router;
