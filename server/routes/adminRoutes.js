import express from "express";
import { analytics, dashboard, listUsers, reports, toggleUserBlock, listPendingApprovals, approveProfile, createClientProfile, getClientInterests, respondClientInterest, getAdminCreatedProfiles, getSettings, updateSettings, getAdminChats, getAdminChatDetails, updateGpayQr, getPendingSubscriptions, approveSubscription, rejectSubscription, updateClientProfile, deleteClientProfile } from "../controllers/adminController.js";
import { importProfiles, previewImport } from "../controllers/importController.js";
import { adminOnly, managerOrAdmin, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerRules } from "../controllers/authController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

// Routes accessible by Admin OR Manager
router.post("/users/create", managerOrAdmin, upload.single("photo"), registerRules, validate, createClientProfile);
router.put("/users/:id", managerOrAdmin, upload.single("photo"), updateClientProfile);
router.delete("/users/:id", managerOrAdmin, deleteClientProfile);
router.get("/created-profiles", managerOrAdmin, getAdminCreatedProfiles);
router.post("/import-profiles", managerOrAdmin, importProfiles);
router.post("/import-preview", managerOrAdmin, previewImport);

// Routes accessible by Admin ONLY
router.use(adminOnly);
router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.get("/client-interests", getClientInterests);
router.post("/client-interests/respond", respondClientInterest);
router.patch("/users/:id/block", toggleUserBlock);
router.get("/reports", reports);
router.get("/analytics", analytics);
router.get("/approvals", listPendingApprovals);
router.patch("/approvals/:id/approve", approveProfile);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.post("/settings/gpay-qr", upload.single("qrCode"), updateGpayQr);
router.get("/subscriptions/pending", getPendingSubscriptions);
router.patch("/subscriptions/:id/approve", approveSubscription);
router.patch("/subscriptions/:id/reject", rejectSubscription);
router.get("/chats", getAdminChats);
router.get("/chats/:id", getAdminChatDetails);

export default router;
