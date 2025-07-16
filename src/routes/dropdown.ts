import { sportsController } from "./../controllers/sports.js";
import express from "express";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

router.get("/sports", sportsController.getSportsDrowpdown);
export default router;
