import express from "express";
import { SystemChallengeTypeController } from "../controllers/systemChallengeType.js";
import { SystemChallengeController } from "../controllers/systemChallenge.js";

const router = express.Router();

// router.post("/", userAuth, SystemChallengeTypeController.create);
// router.patch("/:id", userAuth, SystemChallengeTypeController.update);
// router.delete("/:id", userAuth, SystemChallengeTypeController.remove);
// router.get("/:id", SystemChallengeTypeController.getById);
router.get("/", SystemChallengeTypeController.getAll);

// type challenge
router.get("/:challengeType/challenges", SystemChallengeController.getAll);
export default router;
