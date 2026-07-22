import Profile from "../models/Profile.js";
import { calculateAge } from "./profileController.js";

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
    if (req.query.state && req.query.state !== "Any") query["location.state"] = req.query.state;
    if (req.query.district && req.query.district !== "Any") query["location.district"] = req.query.district;
    if (req.query.city && req.query.city !== "Any") query["location.city"] = new RegExp(req.query.city, "i");
    if (req.query.education && req.query.education !== "Any") query["education.degree"] = new RegExp(req.query.education, "i");
    if (req.query.profession && req.query.profession !== "Any") query["career.profession"] = req.query.profession;
    if (req.query.job && req.query.job !== "Any") query["career.jobTitle"] = new RegExp(req.query.job, "i");
    if (salaryMin) query["career.salary"] = { $gte: salaryMin };

    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const current = await Profile.findOne({ user: req.user._id }).lean();
    
    // Project only fields needed for the MatchCard to reduce MongoDB load
    const profiles = await Profile.find(query)
      .select("basic.name basic.age basic.gender basic.height basic.dob location.city location.district location.state education.degree career.jobTitle career.profession religion.religion religion.caste religion.motherTongue photo isApproved isSubmitted profileId boostUntil completionScore user")
      .populate("user", "fullName fullNameTamil gender isPremium lastSeenAt")
      .lean();

    // Filter out orphaned profiles
    const validProfiles = profiles.filter((p) => p.user);

    // Calculate match percentage and assign dynamic sorting score
    const scoredResults = validProfiles.map((profile) => {
      if (profile.basic && profile.basic.dob) {
        profile.basic.age = calculateAge(profile.basic.dob);
      }
      const matchPct = matchScore(profile, current?.preferences || {});
      const isPremium = profile.user?.isPremium ? 20 : 0;
      const isBoosted = profile.boostUntil && new Date(profile.boostUntil) > new Date() ? 30 : 0;
      
      // Dynamic exploration algorithm: Match Score + Premium/Boost Bonus + 0 to 15 Random points
      const randomFactor = Math.random() * 15;
      const sortScore = matchPct + isPremium + isBoosted + randomFactor;

      return {
        profile,
        matchPercentage: matchPct,
        sortScore
      };
    });

    // Sort by sortScore descending
    scoredResults.sort((a, b) => b.sortScore - a.sortScore);

    const totalResults = scoredResults.length;
    const paginatedResults = scoredResults.slice(skip, skip + limit).map(r => ({
      profile: r.profile,
      matchPercentage: r.matchPercentage
    }));

    res.json({
      results: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyMatches = async (req, res, next) => {
  try {
    const current = await Profile.findOne({ user: req.user._id }).lean();
    const genderFilter = req.user.gender === "Male" ? "Female" : req.user.gender === "Female" ? "Male" : undefined;
    
    const query = { user: { $ne: req.user._id } };
    if (genderFilter) query["basic.gender"] = genderFilter;

    const profiles = await Profile.aggregate([
      { $match: query },
      { $sample: { size: 5 } }
    ]);

    const populatedProfiles = await Profile.populate(profiles, { path: "user", select: "fullName fullNameTamil gender isPremium lastSeenAt" });

    // Filter out orphaned profiles
    const validProfiles = populatedProfiles.filter((p) => p.user);

    res.json({
      results: validProfiles.map((profile) => {
        if (profile.basic && profile.basic.dob) {
          profile.basic.age = calculateAge(profile.basic.dob);
        }
        return {
          profile,
          matchPercentage: matchScore(profile, current?.preferences || {})
        };
      })
    });
  } catch (error) {
    next(error);
  }
};
