import cloudinary from "../config/cloudinary.js";
import Profile from "../models/Profile.js";
import Interest from "../models/Interest.js";

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
  "lifestyle.foodType",
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

export const upsertProfile = async (req, res, next) => {
  try {
    const updates = typeof req.body.profile === "string" ? JSON.parse(req.body.profile) : req.body;
    const photos = [];

    if (req.files?.length) {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(503).json({ message: "Cloudinary is not configured" });
      }

      for (const file of req.files) {
        const result = await uploadBuffer(file);
        photos.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    const existing = await Profile.findOne({ user: req.user._id });
    const currentPhotos = updates.photos !== undefined ? updates.photos : (existing?.photos || []);
    const mergedPhotos = [...currentPhotos, ...photos];
    const isApproved = existing ? existing.isApproved : false;
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { ...updates, user: req.user._id, photos: mergedPhotos, isApproved },
      { new: true, upsert: true, runValidators: true }
    );

    profile.completionScore = calculateCompletion(profile);
    await profile.save();

    res.status(existing ? 200 : 201).json({ profile });
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
    let interest = null;

    if (isOwnProfile || isAdmin) {
      isContactShared = true;
    } else {
      // Find interest between the two users
      interest = await Interest.findOne({
        $or: [
          { from: req.user._id, to: profile.user._id },
          { from: profile.user._id, to: req.user._id }
        ]
      });

      if (interest && interest.status === "Accepted") {
        isContactShared = true;
      }
    }

    const profileObj = profile.toObject();

    // Redact if not shared
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
