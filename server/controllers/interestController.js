import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";
import Chat from "../models/Chat.js";
import Subscription from "../models/Subscription.js";

const PLAN_INTEREST_LIMITS = {
  Free: 5,
  Silver: 10,
  Gold: 15,
  Diamond: Infinity
};

export const sendInterest = async (req, res, next) => {
  try {
    if (String(req.body.to) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot send interest to yourself" });
    }

    // Check daily limits
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await Interest.countDocuments({
      from: req.user._id,
      createdAt: { $gte: startOfDay }
    });

    const activeSub = await Subscription.findOne({ user: req.user._id, status: "Active" }).sort("-createdAt");
    const userPlan = activeSub ? activeSub.plan : "Free";
    const limit = PLAN_INTEREST_LIMITS[userPlan] || PLAN_INTEREST_LIMITS.Free;

    if (todayCount >= limit) {
      return res.status(403).json({ 
        message: `You have reached your daily limit of ${limit} interests for the ${userPlan} plan. Please upgrade for more.` 
      });
    }

    const interest = await Interest.create({ from: req.user._id, to: req.body.to });
    await Notification.create({
      user: req.body.to,
      type: "New Interest",
      title: "New interest received",
      message: `${req.user.fullName} sent you an interest`
    });

    res.status(201).json({ interest });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Interest already sent" });
    }
    next(error);
  }
};

export const respondInterest = async (req, res, next) => {
  try {
    const interest = await Interest.findOne({ _id: req.body.interestId, to: req.user._id });
    if (!interest) {
      return res.status(404).json({ message: "Interest not found" });
    }

    interest.status = req.body.status;
    interest.respondedAt = new Date();
    await interest.save();

    if (interest.status === "Accepted") {
      await Notification.create({
        user: interest.from,
        type: "Interest Accepted",
        title: "Interest accepted",
        message: `${req.user.fullName} accepted your interest`
      });

      // Auto-initialize Chat document
      const participants = [interest.from, interest.to].sort();
      await Chat.findOneAndUpdate(
        { participants: { $all: participants, $size: 2 } },
        { $setOnInsert: { participants } },
        { new: true, upsert: true }
      );
    }

    res.json({ interest });
  } catch (error) {
    next(error);
  }
};

export const listInterests = async (req, res, next) => {
  try {
    const [received, sent] = await Promise.all([
      Interest.find({ to: req.user._id }).populate("from", "fullName gender isPremium lastSeenAt").sort("-createdAt"),
      Interest.find({ from: req.user._id }).populate("to", "fullName gender isPremium lastSeenAt").sort("-createdAt")
    ]);

    // Find profiles for these users to show details
    const userIds = [
      ...received.map((i) => i.from?._id),
      ...sent.map((i) => i.to?._id)
    ].filter(Boolean);

    const profiles = await Profile.find({ user: { $in: userIds } });
    const profileMap = new Map(profiles.map((p) => [String(p.user), p]));

    const receivedWithProfiles = received.map((item) => {
      const itemObj = item.toObject();
      itemObj.fromProfile = profileMap.get(String(item.from?._id)) || null;
      return itemObj;
    });

    const sentWithProfiles = sent.map((item) => {
      const itemObj = item.toObject();
      itemObj.toProfile = profileMap.get(String(item.to?._id)) || null;
      return itemObj;
    });

    res.json({ received: receivedWithProfiles, sent: sentWithProfiles });
  } catch (error) {
    next(error);
  }
};
