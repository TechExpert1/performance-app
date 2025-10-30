import express from "express";
import { journalController } from "../controllers/journal.js";
import { userAuth } from "../middlewares/user.js";

const router = express.Router();

// Get all journal entries with filters
router.get("/", userAuth, journalController.getAll);

export default router;
