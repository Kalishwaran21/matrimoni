import crypto from "crypto";
import { body } from "express-validator";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { signToken } from "../middleware/auth.js";

const userPayload = (user, isProfileSubmitted = false, isProfileApproved = false) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  mobile: user.mobile,
  gender: user.gender,
  role: user.role,
  isPremium: user.isPremium,
  isProfileSubmitted,
  isProfileApproved
});

export const registerRules = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("mobile").trim().isLength({ min: 8 }).withMessage("Mobile number is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("gender").isIn(["Male", "Female", "Other"]).withMessage("Gender is required")
];

export const loginRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

export const register = async (req, res, next) => {
  try {
    const existing = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create(req.body);
    const token = signToken(user._id);

    res.status(201).json({ token, user: userPayload(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.lastSeenAt = new Date();
    await user.save();

    const profile = await Profile.findOne({ user: user._id });
    const isSubmitted = profile ? profile.isSubmitted : false;
    const isApproved = profile ? profile.isApproved : false;

    res.json({ token: signToken(user._id), user: userPayload(user, isSubmitted, isApproved) });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  const isSubmitted = profile ? profile.isSubmitted : false;
  const isApproved = profile ? profile.isApproved : false;
  res.json({ user: userPayload(req.user, isSubmitted, isApproved) });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) {
      return res.json({ message: "If the email exists, a reset link will be sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 20);
    await user.save();

    // Wire an email provider here for production email delivery.
    res.json({
      message: "Password reset token generated",
      devResetToken: process.env.NODE_ENV === "production" ? undefined : token
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.body.token || "").digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
