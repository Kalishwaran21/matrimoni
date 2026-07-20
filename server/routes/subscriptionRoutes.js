import express from "express";
import { getPlans, submitPaymentRequest } from "../controllers/subscriptionController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/plans", getPlans);
router.post("/submit", protect, upload.single("screenshot"), submitPaymentRequest);

export default router;
