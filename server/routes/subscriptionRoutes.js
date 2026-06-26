import express from "express";
import { body } from "express-validator";
import { createOrder, getPlans, verifyPayment } from "../controllers/subscriptionController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/plans", getPlans);
router.post("/order", protect, body("plan").isIn(["Premium"]), validate, createOrder);
router.post("/verify", protect, body("plan").isIn(["Premium"]), validate, verifyPayment);

export default router;
