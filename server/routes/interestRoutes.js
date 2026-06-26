import express from "express";
import { body } from "express-validator";
import { listInterests, respondInterest, sendInterest } from "../controllers/interestController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", protect, listInterests);
router.post("/send", protect, body("to").isMongoId(), validate, sendInterest);
router.post("/respond", protect, body("interestId").isMongoId(), body("status").isIn(["Accepted", "Rejected"]), validate, respondInterest);

export default router;
