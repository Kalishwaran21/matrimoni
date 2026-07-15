import express from "express";
import { getMyProfile, getProfile, upsertProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, upload.single("photo"), upsertProfile);
router.put("/", protect, upload.single("photo"), upsertProfile);
router.get("/me", protect, getMyProfile);
router.get("/:id", protect, getProfile);

export default router;
