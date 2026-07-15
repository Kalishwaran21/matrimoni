import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import Settings from "../models/Settings.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { silverPrice, goldPrice, diamondPrice } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ silverPrice, goldPrice, diamondPrice });
    } else {
      settings.silverPrice = silverPrice ?? settings.silverPrice;
      settings.goldPrice = goldPrice ?? settings.goldPrice;
      settings.diamondPrice = diamondPrice ?? settings.diamondPrice;
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

export default router;
