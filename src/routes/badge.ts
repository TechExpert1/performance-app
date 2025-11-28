import { Router } from "express";
import { badgeController } from "../controllers/badge.js";
import { userAuth } from "../middlewares/user.js";

const router = Router();

// Get user badges with all categories (authenticated)
router.get("/", userAuth, badgeController.getUserBadges);

export default router;
