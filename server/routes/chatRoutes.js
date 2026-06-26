import express from "express";
import { getChat, listChats } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, listChats);
router.get("/:userId", protect, getChat);

export default router;
