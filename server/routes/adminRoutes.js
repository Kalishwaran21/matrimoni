import express from "express";
import { analytics, dashboard, listUsers, reports, toggleUserBlock, listPendingApprovals, approveProfile, createClientProfile, getClientInterests, respondClientInterest, getAdminCreatedProfiles, getSettings, updateSettings, getAdminChats, getAdminChatDetails } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerRules } from "../controllers/authController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.post("/users/create", upload.single("photo"), registerRules, validate, createClientProfile);
router.get("/client-interests", getClientInterests);
router.post("/client-interests/respond", respondClientInterest);
router.get("/created-profiles", getAdminCreatedProfiles);
router.patch("/users/:id/block", toggleUserBlock);
router.get("/reports", reports);
router.get("/analytics", analytics);
router.get("/approvals", listPendingApprovals);
router.patch("/approvals/:id/approve", approveProfile);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/chats", getAdminChats);
router.get("/chats/:id", getAdminChatDetails);

export default router;
