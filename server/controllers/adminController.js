import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import Chat from "../models/Chat.js";

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
      isApproved: true,
      createdByAdmin: true
    };
    finalProfileData.completionScore = calculateCompletion(finalProfileData);

    const profile = await Profile.create(finalProfileData);

    res.status(201).json({ message: "Client profile created successfully", userId: user._id });
  } catch (error) {
    next(error);
  }
};

export const getClientInterests = async (req, res, next) => {
  try {
    const adminCreatedProfiles = await Profile.find({ createdByAdmin: true }).select("user");
    const clientUserIds = adminCreatedProfiles.map((p) => p.user);

    const interests = await Interest.find({
      $or: [
        { from: { $in: clientUserIds } },
        { to: { $in: clientUserIds } }
      ]
    })
      .populate("from", "fullName email mobile gender isPremium")
      .populate("to", "fullName email mobile gender isPremium")
      .sort("-createdAt");

    const allUserIds = [
      ...interests.map((i) => i.from?._id),
      ...interests.map((i) => i.to?._id)
    ].filter(Boolean);

    const profiles = await Profile.find({ user: { $in: allUserIds } });
    const profileMap = new Map(profiles.map((p) => [String(p.user), p]));

    const result = interests.map((item) => {
      const itemObj = item.toObject();
      itemObj.fromProfile = profileMap.get(String(item.from?._id)) || null;
      itemObj.toProfile = profileMap.get(String(item.to?._id)) || null;
      itemObj.isClientSender = clientUserIds.some((id) => String(id) === String(item.from?._id));
      return itemObj;
    });

    res.json({ interests: result });
  } catch (error) {
    next(error);
  }
};

export const respondClientInterest = async (req, res, next) => {
  try {
    const { interestId, status } = req.body;

    const interest = await Interest.findById(interestId);
    if (!interest) {
      return res.status(404).json({ message: "Interest transaction not found" });
    }

    interest.status = status;
    interest.respondedAt = new Date();
    await interest.save();

    if (status === "Accepted") {
      const adminCreatedProfiles = await Profile.find({ createdByAdmin: true }).select("user");
      const clientUserIds = adminCreatedProfiles.map((p) => p.user);
      const isClientSender = clientUserIds.some((id) => String(id) === String(interest.from));
      const targetUser = isClientSender ? interest.to : interest.from;
      const clientUser = isClientSender ? interest.from : interest.to;

      const clientRecord = await User.findById(clientUser);

      await Notification.create({
        user: targetUser,
        type: "Interest Accepted",
        title: "Interest accepted",
        message: `${clientRecord ? clientRecord.fullName : "Client"} accepted your interest request`
      });

      const participants = [interest.from, interest.to].sort();
      await Chat.findOneAndUpdate(
        { participants: { $all: participants, $size: 2 } },
        { $setOnInsert: { participants } },
        { new: true, upsert: true }
      );
    }

    res.json({ message: "Interest updated successfully", interest });
  } catch (error) {
    next(error);
  }
};
