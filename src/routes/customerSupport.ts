import express from "express";
import { customerSupportController } from "../controllers/customerSupport.js";
const router = express.Router();

router.post("/", customerSupportController.sendEmail);
router.get("/", customerSupportController.getAll);

export default router;
