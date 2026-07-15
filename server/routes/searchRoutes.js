import express from "express";
import { searchProfiles, getDailyMatches } from "../controllers/searchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, searchProfiles);
router.get("/daily-matches", protect, getDailyMatches);

export default router;
