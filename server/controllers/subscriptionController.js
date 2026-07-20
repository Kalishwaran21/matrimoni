import cloudinary from "../config/cloudinary.js";
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
    Silver: { amount: settings.silverPrice, days: 30 },
    Gold: { amount: settings.goldPrice, days: 90 },
    Diamond: { amount: settings.diamondPrice, days: 365 }
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
      gpayQrUrl: settings.gpayQrUrl || ""
    });
  } catch (error) {
    next(error);
  }
};

const uploadBuffer = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "soulmate-matrimony/payments", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(file.buffer);
  });

export const submitPaymentRequest = async (req, res, next) => {
  try {
    const { plan, transactionId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Payment screenshot is required" });
    }
    
    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    const plans = await getDynamicPlans();
    const selected = plans[plan];
    if (!selected || plan === "Free") {
      return res.status(400).json({ message: "Select a paid plan" });
    }

    const result = await uploadBuffer(req.file);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      amount: selected.amount,
      status: "Pending",
      transactionId,
      screenshotUrl: result.secure_url
    });

    res.status(201).json({ message: "Payment submitted for approval", subscription });
  } catch (error) {
    next(error);
  }
};
