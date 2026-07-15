import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

import Settings from "../models/Settings.js";

const getDynamicPlans = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return {
    Free: { amount: 0, days: 0 },
    Silver: { amount: settings.silverPrice * 100, days: 30 },
    Gold: { amount: settings.goldPrice * 100, days: 90 },
    Diamond: { amount: settings.diamondPrice * 100, days: 365 }
  };
};

export const getPlans = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      plans: [
        { name: "Free", price: 0, features: ["Create profile", "Search matches", "5 Interests/day"] },
        { name: "Silver", price: settings.silverPrice, features: ["10 Interests/day", "Basic matching", "Profile visibility"] },
        { name: "Gold", price: settings.goldPrice, features: ["15 Interests/day", "View 5 Contacts & Horoscopes/day", "Profile boost"] },
        { name: "Diamond", price: settings.diamondPrice, features: ["Unlimited Interests", "View 20 Contacts & Horoscopes/day", "Direct Chat"] }
      ],
      razorpayKey: process.env.RAZORPAY_KEY_ID || ""
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const plans = await getDynamicPlans();
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

    const plans = await getDynamicPlans();
    const selected = plans[plan];
    if (!selected) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }
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
