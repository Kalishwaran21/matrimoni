import Profile from "../models/Profile.js";

const numberFilter = (value) => (value === undefined || value === "" ? undefined : Number(value));

const matchScore = (profile, preferences = {}) => {
  let score = 0;
  const age = profile.basic?.age;

  if (age && preferences.ageMin && preferences.ageMax && age >= preferences.ageMin && age <= preferences.ageMax) score += 20;
  if (preferences.religion && profile.religion?.religion === preferences.religion) score += 30;
  if (preferences.location && profile.location?.city === preferences.location) score += 20;
  if (preferences.caste && profile.religion?.caste === preferences.caste) score += 10;
  if (preferences.education && profile.education?.degree?.toLowerCase().includes(preferences.education.toLowerCase())) score += 10;
  if (preferences.salary && profile.career?.salary >= preferences.salary) score += 10;

  return Math.min(score, 100);
};

export const searchProfiles = async (req, res, next) => {
  try {
    const query = { user: { $ne: req.user._id } };

    // Default to opposite gender matching if not specified
    const genderFilter = req.query.gender || (req.user.gender === "Male" ? "Female" : req.user.gender === "Female" ? "Male" : undefined);
    if (genderFilter) {
      query["basic.gender"] = genderFilter;
    }
    const ageMin = numberFilter(req.query.ageMin);
    const ageMax = numberFilter(req.query.ageMax);
    const salaryMin = numberFilter(req.query.salaryMin);

    if (ageMin || ageMax) query["basic.age"] = { ...(ageMin && { $gte: ageMin }), ...(ageMax && { $lte: ageMax }) };
    if (req.query.religion && req.query.religion !== "Any") query["religion.religion"] = req.query.religion;
    if (req.query.caste && req.query.caste !== "Any") query["religion.caste"] = req.query.caste;
    if (req.query.city && req.query.city !== "Any") query["location.city"] = req.query.city;
    if (req.query.education && req.query.education !== "Any") query["education.degree"] = new RegExp(req.query.education, "i");
    if (req.query.job && req.query.job !== "Any") query["career.jobTitle"] = new RegExp(req.query.job, "i");
    if (salaryMin) query["career.salary"] = { $gte: salaryMin };

    const current = await Profile.findOne({ user: req.user._id });
    const profiles = await Profile.find(query)
      .populate("user", "fullName gender isPremium lastSeenAt")
      .sort({ boostUntil: -1, completionScore: -1, createdAt: -1 })
      .limit(60);

    res.json({
      results: profiles.map((profile) => ({
        profile,
        matchPercentage: matchScore(profile, current?.preferences || {})
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyMatches = async (req, res, next) => {
  try {
    const current = await Profile.findOne({ user: req.user._id });
    const genderFilter = req.user.gender === "Male" ? "Female" : req.user.gender === "Female" ? "Male" : undefined;
    
    const query = { user: { $ne: req.user._id } };
    if (genderFilter) query["basic.gender"] = genderFilter;

    const profiles = await Profile.aggregate([
      { $match: query },
      { $sample: { size: 5 } }
    ]);

    const populatedProfiles = await Profile.populate(profiles, { path: "user", select: "fullName gender isPremium lastSeenAt" });

    res.json({
      results: populatedProfiles.map((profile) => ({
        profile,
        matchPercentage: matchScore(profile, current?.preferences || {})
      }))
    });
  } catch (error) {
    next(error);
  }
};
