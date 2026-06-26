import express from "express";
import { analytics, dashboard, listUsers, reports, toggleUserBlock, listPendingApprovals, approveProfile } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.patch("/users/:id/block", toggleUserBlock);
router.get("/reports", reports);
router.get("/analytics", analytics);
router.get("/approvals", listPendingApprovals);
router.patch("/approvals/:id/approve", approveProfile);

export default router;
