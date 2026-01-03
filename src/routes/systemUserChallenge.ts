import { SystemUserChallengeController } from "../controllers/systemUserChallenge.js";
import { userAuth } from "./../middlewares/user.js";
import express from "express";

import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
const router = express.Router();

// ========================================
// PERFORMANCE CHALLENGE GRAPH ROUTE
// ========================================
// Single unified endpoint with query parameters:
// - type: categories | packs | challenges | data | my-challenges | overview
// - categoryId: required when type=packs
// - packId: required when type=challenges  
// - challengeId: required when type=data
// - timeFilter: 7D | 30D | 90D | all (for type=data, default: 30D)
// - category: optional filter for type=my-challenges
router.get("/graph", userAuth, SystemUserChallengeController.graph);

// Get all IDs for Performance Challenge Graph (categories, packs, challenges)
router.get("/graph/ids", userAuth, SystemUserChallengeController.graphIds);

// ========================================
// EXISTING ROUTES
// ========================================

router.post("/", userAuth, SystemUserChallengeController.create);
router.patch(
  "/:id",
  userAuth,
  newMulterUpload,
  uploadMultipleToS3,
  SystemUserChallengeController.update
);
// router.delete("/:id", userAuth, userChallengeController.remove);
// router.get("/:id", userChallengeController.getById);
router.get("/", userAuth, SystemUserChallengeController.getAll);
router.get("/stats", userAuth, SystemUserChallengeController.stats);

export default router;
