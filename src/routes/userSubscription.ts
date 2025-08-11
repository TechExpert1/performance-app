// routes/userSubscription.ts
import express from "express";
import {
  createSubscription,
  updateSubscription,
  cancelSubscription,
  products,
} from "../controllers/userSubscription.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

router.post("/subscribe", userAuth, createSubscription);
router.post("/update-subscription", userAuth, updateSubscription);
router.post("/cancel-subscription", userAuth, cancelSubscription);
router.get("/plans", userAuth, products);

export default router;
