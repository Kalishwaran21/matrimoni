import express from "express";
import { getMyProfile, getProfile, upsertProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, upload.array("photos", 6), upsertProfile);
router.put("/", protect, upload.array("photos", 6), upsertProfile);
router.get("/me", protect, getMyProfile);
router.get("/:id", protect, getProfile);

export default router;
