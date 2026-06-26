import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

const plans = {
  Free: { amount: 0, days: 0 },
  Premium: { amount: 149900, days: 90 }
};

export const getPlans = (req, res) => {
  res.json({
    plans: [
      { name: "Free", price: 0, features: ["Create profile", "Search matches", "Send limited interests"] },
      { name: "Premium", price: 1499, features: ["Unlimited chat", "View contact details", "Profile boost"] }
    ],
    razorpayKey: process.env.RAZORPAY_KEY_ID || ""
  });
};

export const createOrder = async (req, res, next) => {
  try {
    const selected = plans[req.body.plan];
    if (!selected || req.body.plan === "Free") {
      return res.status(400).json({ message: "Select a paid plan" });
    }

    if (!razorpay) {
      return res.status(503).json({ message: "Razorpay is not configured" });
    }

    const order = await razorpay.orders.create({
      amount: selected.amount,
      currency: "INR",
      receipt: `atm_${req.user._id}_${Date.now()}`
    });

    await Subscription.create({
      user: req.user._id,
      plan: req.body.plan,
      amount: selected.amount / 100,
      status: "Pending",
      razorpayOrderId: order.id
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const selected = plans[plan];
    const expiresAt = new Date(Date.now() + selected.days * 24 * 60 * 60 * 1000);
    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id, razorpayOrderId: razorpay_order_id },
      { status: "Active", razorpayPaymentId: razorpay_payment_id, expiresAt },
      { new: true }
    );

    await User.findByIdAndUpdate(req.user._id, { isPremium: true });
    res.json({ subscription });
  } catch (error) {
    next(error);
  }
};
