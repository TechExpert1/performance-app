// routes/userSubscription.ts
import express from "express";
import { UserSubscriptionController } from "../controllers/userSubscription.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

router.post("/subscribe", userAuth, UserSubscriptionController.subscribe);
router.post("/filters", userAuth, UserSubscriptionController.filters);

router.patch("/:userId/cancel", UserSubscriptionController.cancel);

export default router;
