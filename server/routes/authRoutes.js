import express from "express";
import { body } from "express-validator";
import { forgotPassword, login, loginRules, me, register, registerRules, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", protect, me);
router.post("/forgot-password", body("email").isEmail(), validate, forgotPassword);
router.post("/reset-password", body("token").notEmpty(), body("password").isLength({ min: 8 }), validate, resetPassword);

export default router;
