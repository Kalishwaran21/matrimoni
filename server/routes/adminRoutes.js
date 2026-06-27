import express from "express";
import { analytics, dashboard, listUsers, reports, toggleUserBlock, listPendingApprovals, approveProfile, createClientProfile, getClientInterests, respondClientInterest } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.post("/users/create", upload.array("photos", 6), createClientProfile);
router.get("/client-interests", getClientInterests);
router.post("/client-interests/respond", respondClientInterest);
router.patch("/users/:id/block", toggleUserBlock);
router.get("/reports", reports);
router.get("/analytics", analytics);
router.get("/approvals", listPendingApprovals);
router.patch("/approvals/:id/approve", approveProfile);

export default router;
