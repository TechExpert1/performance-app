import { sportsController } from "./../controllers/sports.js";
import express from "express";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

router.get("/sports", sportsController.getSportsDrowpdown);
router.get(
  "/sports-skillLevel",
  sportsController.getSportsDrowpdownWithSkillLevel
);
export default router;
