import cloudinary from "../config/cloudinary.js";
import Profile from "../models/Profile.js";
import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import Subscription from "../models/Subscription.js";
import DailyUsage from "../models/DailyUsage.js";
import User from "../models/User.js";

const PLAN_VIEW_LIMITS = {
  Free: 0,
  Silver: 0,
  Gold: 5,
  Diamond: 20
};

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
  "family.familyType",
  "contact.phone",
  "contact.email",
  "horoscope.rasi"
];

const getByPath = (source, path) => path.split(".").reduce((obj, key) => obj?.[key], source);

const calculateCompletion = (profile) => {
  const filled = completionFields.filter((path) => Boolean(getByPath(profile, path))).length;
  const photoScore = profile.photo?.url ? 1 : 0;
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

export const upsertProfile = async (req, res, next) => {
  try {
    const updates = typeof req.body.updates === "string" ? JSON.parse(req.body.updates) : req.body;
    let newPhoto = undefined;

    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(503).json({ message: "Cloudinary is not configured" });
      }
      const result = await uploadBuffer(req.file);
      newPhoto = { url: result.secure_url, publicId: result.public_id };
    }

    const existing = await Profile.findOne({ user: req.user._id });
    
    // If the user uploaded a new photo and they already had one, delete the old one
    if (newPhoto && existing && existing.photo?.publicId) {
       try {
         await cloudinary.uploader.destroy(existing.photo.publicId);
       } catch (err) {
         console.error("Failed to delete from Cloudinary", err);
       }
    }
    
    // Keep existing photo if no new photo uploaded
    const finalPhoto = newPhoto || (existing ? existing.photo : undefined);

    const isApproved = existing ? existing.isApproved : false;
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { ...updates, user: req.user._id, photo: finalPhoto, isApproved, isSubmitted: true },
      { new: true, upsert: true, runValidators: true }
    );

    let userUpdate = { isProfileSubmitted: true, isProfileApproved: profile.isApproved };
    
    // Sync Name and Gender changes back to the User model
    if (updates.basic?.name || updates.basic?.nameTamil || updates.basic?.gender) {
      const u = {};
      if (updates.basic?.name) u.fullName = updates.basic.name;
      if (updates.basic?.nameTamil) u.fullNameTamil = updates.basic.nameTamil;
      if (updates.basic?.gender) u.gender = updates.basic.gender;
      
      const updatedUser = await User.findByIdAndUpdate(req.user._id, u, { new: true });
      if (updatedUser) {
        userUpdate.fullName = updatedUser.fullName;
        userUpdate.gender = updatedUser.gender;
      }
    }

    profile.completionScore = calculateCompletion(profile);
    await profile.save();

    res.status(existing ? 200 : 201).json({ 
      profile, 
      user: userUpdate 
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id).populate("user", "fullName email mobile gender isPremium lastSeenAt");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const isOwnProfile = String(profile.user._id) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    let isContactShared = false;
    let limitExceeded = false;
    let interest = null;

    if (!isOwnProfile && !isAdmin) {
      interest = await Interest.findOne({
        $or: [
          { from: req.user._id, to: profile.user._id },
          { from: profile.user._id, to: req.user._id }
        ]
      });
    }

    if (isOwnProfile || isAdmin || (interest && interest.status === "Accepted")) {
      isContactShared = true;
    } else {
      // Check Daily Usage for views
      const today = new Date().toISOString().split("T")[0];
      let usage = await DailyUsage.findOne({ user: req.user._id, date: today });
      if (!usage) {
        usage = await DailyUsage.create({ user: req.user._id, date: today, profilesViewed: [] });
      }

      const activeSub = await Subscription.findOne({ user: req.user._id, status: "Active" }).sort("-createdAt");
      const userPlan = activeSub ? activeSub.plan : "Free";
      const viewLimit = PLAN_VIEW_LIMITS[userPlan] || PLAN_VIEW_LIMITS.Free;

      const targetIdStr = String(profile.user._id);
      const alreadyViewed = usage.profilesViewed.some(id => String(id) === targetIdStr);

      if (alreadyViewed) {
        isContactShared = true;
      } else {
        if (usage.profilesViewed.length >= viewLimit) {
          limitExceeded = true;
          isContactShared = false;
        } else {
          // Has limit, allow and record
          usage.profilesViewed.push(profile.user._id);
          await usage.save();
          isContactShared = true;
        }
      }

      // Add Profile Viewed Notification
      if (req.user.role !== "admin") {
        const recent = await Notification.findOne({
          user: profile.user._id,
          type: "Profile Viewed",
          message: { $regex: req.user.fullName },
          createdAt: { $gt: new Date(Date.now() - 3600000) }
        });
        
        if (!recent) {
          await Notification.create({
            user: profile.user._id,
            type: "Profile Viewed",
            title: "Someone viewed your profile",
            message: `${req.user.fullName} recently viewed your profile.`
          });
        }
      }
    }

    const profileObj = profile.toObject();

    // Redact if not shared (which is if limit exceeded and no accepted interest)
    if (!isContactShared) {
      if (profileObj.user) {
        profileObj.user.email = undefined;
        profileObj.user.mobile = undefined;
      }
      profileObj.horoscope = undefined;
    }

    res.json({
      profile: profileObj,
      isContactShared,
      limitExceeded,
      interest: interest ? {
        _id: interest._id,
        from: interest.from,
        to: interest.to,
        status: interest.status
      } : null
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", "fullName email mobile gender isPremium");
    res.json({ profile });
  } catch (error) {
    next(error);
  }
};
