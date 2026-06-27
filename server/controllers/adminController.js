import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

const completionFields = [
  "basic.name",
  "basic.age",
  "basic.dob",
  "basic.gender",
  "basic.height",
  "religion.religion",
  "religion.caste",
  "location.city",
  "education.degree",
  "career.jobTitle",
  "family.fatherOccupation",
  "horoscope.rasi"
];

const getByPath = (source, path) => path.split(".").reduce((obj, key) => obj?.[key], source);

const calculateCompletion = (profile) => {
  const filled = completionFields.filter((path) => Boolean(getByPath(profile, path))).length;
  const photoScore = profile.photos?.length ? 1 : 0;
  return Math.round(((filled + photoScore) / (completionFields.length + 1)) * 100);
};

const uploadBuffer = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "soulmate-matrimony/profiles", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(file.buffer);
  });

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
    const { email, password, fullName, mobile, gender } = req.body;
    let profileData = req.body.profileData;
    if (typeof profileData === "string") {
      profileData = JSON.parse(profileData);
    }

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

    const photos = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadBuffer(file);
        photos.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    const finalProfileData = {
      ...profileData,
      user: user._id,
      photos,
      isSubmitted: true,
      isApproved: true
    };
    finalProfileData.completionScore = calculateCompletion(finalProfileData);

    const profile = await Profile.create(finalProfileData);

    res.status(201).json({ message: "Client profile created successfully", userId: user._id });
  } catch (error) {
    next(error);
  }
};
