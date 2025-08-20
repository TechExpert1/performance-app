import express from "express";
import { userAuth } from "../middlewares/user.js";
import { newMulterUpload, uploadMultipleToS3 } from "../helpers/s3Utils.js";
import {
  sendMessage,
  getMessagesBetweenTwo,
  getAllChats,
} from "../controllers/chat.js";
const router = express.Router();
router.post(
  "/send",
  userAuth,
  newMulterUpload,
  uploadMultipleToS3,
  sendMessage
);
router.get("/:senderId/:receiverId", userAuth, getMessagesBetweenTwo);
router.get("/:userId", userAuth, getAllChats);
export default router;
