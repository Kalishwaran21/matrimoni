import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

export const dashboard = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, premiumUsers, subscriptions, pendingInterests] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ isActive: true, role: "user" }),
      User.countDocuments({ isPremium: true, role: "user" }),
      Subscription.find({ status: "Active" }),
      Interest.countDocuments({ status: "Pending" })
    ]);

    const revenue = subscriptions.reduce((sum, item) => sum + item.amount, 0);

    res.json({ totalUsers, activeUsers, premiumUsers, revenue, pendingInterests });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort("-createdAt").limit(200);
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const reports = async (req, res, next) => {
  try {
    const lowCompletion = await Profile.find({ completionScore: { $lt: 35 } })
      .populate("user", "fullName email isActive")
      .limit(50);
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    res.json({ lowCompletion, unreadNotifications });
  } catch (error) {
    next(error);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const monthlyRevenue = await Subscription.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ monthlyRevenue });
  } catch (error) {
    next(error);
  }
};

export const listPendingApprovals = async (req, res, next) => {
  try {
    const pending = await Profile.find({ isSubmitted: true, isApproved: false })
      .populate("user", "fullName email mobile gender isActive isPremium")
      .sort("-updatedAt")
      .limit(100);
    res.json({ pending });
  } catch (error) {
    next(error);
  }
};

export const approveProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.isApproved = true;
    await profile.save();
    res.json({ message: "Profile approved successfully", profile });
  } catch (error) {
    next(error);
  }
};

export const createClientProfile = async (req, res, next) => {
  try {
    const { email, password, fullName, mobile, gender, profileData } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      email,
      password,
      fullName,
      mobile,
      gender
    });

    const profile = await Profile.create({
      user: user._id,
      ...profileData,
      isSubmitted: true,
      isApproved: true
    });

    res.status(201).json({ message: "Client profile created successfully", userId: user._id });
  } catch (error) {
    next(error);
  }
};
