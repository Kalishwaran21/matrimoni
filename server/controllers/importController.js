// server/controllers/importController.js
import User from "../models/User.js";
import Profile from "../models/Profile.js";

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseAge(ageStr) {
  if (!ageStr) return null;
  const match = String(ageStr).match(/^(\d+)/);
  const age = match ? parseInt(match[1]) : null;
  return age && age > 0 ? age : null;
}

function parseDob(ageStr) {
  if (!ageStr) return null;
  const dobMatch = String(ageStr).match(/\[(\d{4}-\d{2}-\d{2})\]/);
  if (dobMatch) {
    const d = new Date(dobMatch[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function parseGender(g) {
  if (!g) return "Other";
  if (g.includes("ஆண்") || g.toLowerCase().includes("male")) return "Male";
  if (g.includes("பெண்") || g.toLowerCase().includes("female")) return "Female";
  return "Other";
}

// Tamil month/rasi names → English
const rasiMap = {
  "மேஷம்": "Mesham", "மேஷம்": "Mesham",
  "ரிஷபம்": "Rishabam", "மிதுனம்": "Mithunam",
  "கடகம்": "Kadagam", "சிம்மம்": "Simmam",
  "கன்னி": "Kanni", "துலாம்": "Thulam",
  "விருச்சிகம்": "Viruchigam", "தனுசு": "Dhanusu",
  "மகரம்": "Magaram", "கும்பம்": "Kumbam",
  "மீனம்": "Meenam"
};
function parseRasi(r) {
  if (!r) return "";
  return rasiMap[r.trim()] || r.trim();
}

// Tamil religion → English
const religionMap = {
  "இந்து": "Hindu", "இந்துவம்": "Hindu",
  "கிறிஸ்டின்": "Christian", "கிறிஸ்தவம்": "Christian",
  "இஸ்லாம்": "Muslim", "முஸ்லீம்": "Muslim"
};
function parseReligion(r) {
  if (!r) return "";
  return religionMap[r.trim()] || r.trim();
}

// Parse caste — strip ", Any SubCaste Ok" and similar trailing text
function parseCaste(c) {
  if (!c) return "";
  return c.split(",")[0].trim();
}

// Parse salary — "NIL", "", "12000 PER MONTH" → number or 0
function parseSalary(s) {
  if (!s || s === "NIL" || s === "-" || s.trim() === "") return 0;
  const nums = String(s).replace(/[^\d]/g, "");
  return nums ? parseInt(nums) : 0;
}

// Parse siblings from "00/1 Married" or "2/2 Married" → total count
function parseSiblings(brothers, sisters) {
  let b = 0, s = 0;
  if (brothers) {
    const m = String(brothers).match(/^(\d+)/);
    b = m ? parseInt(m[1]) : 0;
  }
  if (sisters) {
    const m = String(sisters).match(/^(\d+)/);
    s = m ? parseInt(m[1]) : 0;
  }
  return b + s;
}

// Parse marital status Tamil → English
function parseMarital(m) {
  if (!m) return "Never Married";
  const s = String(m);
  if (s.includes("முதல்")) return "Never Married";
  if (s.includes("விவாகரத்து")) return "Divorced";
  if (s.includes("விதவை") || s.includes("widow")) return "Widow";
  if (s.toLowerCase().includes("never")) return "Never Married";
  if (s.toLowerCase().includes("divor")) return "Divorced";
  return "Never Married";
}

// Parse phone — clean spaces and filter "NIL"
function parsePhone(p) {
  if (!p || p === "NIL" || p === "-") return "";
  return String(p).replace(/\s/g, "").slice(0, 15);
}

// Parse education — strip "B.SC. - NIL" → "B.Sc"
function parseEducation(e) {
  if (!e || e === "-") return "";
  return e.split(" - ")[0].trim();
}

// Parse occupation — strip "Not Working - NIL" → "Not Working"
function parseOccupation(o) {
  if (!o || o === "-") return "";
  return o.split(" - ")[0].trim();
}

// Build photo URL
function parsePhoto(photo) {
  if (!photo) return "";
  if (photo.startsWith("http")) return photo;
  if (photo.includes("Female.png") || photo.includes("Male.png")) return ""; // placeholder images
  return `https://www.sriharimatrimony.com/${photo}`;
}

// ── Validation ────────────────────────────────────────────────────────────────

function isValid(p) {
  const name = p.Name;
  if (!name || name.trim() === "" || name === "Unknown") return false;

  const age = parseAge(p.Age);
  if (!age || age < 18 || age > 75) return false;

  // Skip profiles with no real data (empty profiles like MEMBER12227)
  const hasAnyData =
    p["மதம் (Religion)"] || p["இனம் (Caste)"] || p["கல்வி தகுதி (Education)"] || p["மொபைல் போன் 1"];
  if (!hasAnyData) return false;

  return true;
}

// ── Main Mapper ───────────────────────────────────────────────────────────────

function mapProfile(raw) {
  const memberId = raw.member_id || raw.RegisteredID || `IMP_${Date.now()}`;
  const name = raw.Name?.trim() || "Unknown";
  const gender = parseGender(raw["பாலினம் (Gender)"]);
  const email = `${memberId.toLowerCase()}@imported.soulmatematrimony.com`;
  const phone1 = parsePhone(raw["மொபைல் போன் 1"]) || "0000000000";
  const phone2 = parsePhone(raw["மொபைல் போன் 2"]);
  const age = parseAge(raw.Age);
  const dob = parseDob(raw.Age);

  const userDoc = {
    fullName: name,
    email,
    mobile: phone1,
    password: "Imported@2026",
    gender,
    role: "user",
    isActive: true,
    isPremium: false
  };

  const profileDoc = {
    basic: {
      name,
      age,
      dob,
      gender,
      height: raw["உயரம் (Height)"] || "",
      marital: parseMarital(raw["திருமண நிலை (Marital Status)"]),
      color: raw["நிறம் (Complexion)"] || ""
    },
    religion: {
      religion: parseReligion(raw["மதம் (Religion)"]),
      caste: parseCaste(raw["இனம் (Caste)"]),
      gothram: raw["கோத்திரம்"] && raw["கோத்திரம்"] !== "NIL" ? raw["கோத்திரம்"] : ""
    },
    location: {
      country: "India",
      nativePlace: raw["பூர்விகம் (Native Place)"] || "",
      currentPlace: raw["தற்போதைய இருப்பிடம் (Present Residance)"] || "",
      city: raw["பணிபுரியும் ஊர் (Working Place)"] && raw["பணிபுரியும் ஊர் (Working Place)"] !== "NIL"
        ? raw["பணிபுரியும் ஊர் (Working Place)"]
        : raw["தற்போதைய இருப்பிடம் (Present Residance)"] || ""
    },
    education: {
      degree: parseEducation(raw["கல்வி தகுதி (Education)"])
    },
    career: {
      jobTitle: parseOccupation(raw["தொழில் / வேலை (Occupation)"]),
      salary: parseSalary(raw["மாத வருமானம் (Monthly Income)"])
    },
    family: {
      fatherOccupation: raw["தந்தை தொழில் (Father Occupation)"] !== "NIL"
        ? raw["தந்தை தொழில் (Father Occupation)"] || ""
        : "",
      motherOccupation: raw["தாயார் தொழில் (Mother Occupation)"] !== "NIL"
        ? raw["தாயார் தொழில் (Mother Occupation)"] || ""
        : "",
      siblings: parseSiblings(raw["சகோதரர்கள் (Brothers)"], raw["சகோதரிகள் (sisters)"])
    },
    horoscope: {
      rasi: parseRasi(raw["ராசி (Rasi)"]),
      nakshatra: raw["நட்சத்திரம் (Star)"] || ""
    },
    contact: {
      phone: phone1,
      altPhone: phone2,
      email: raw["மின்னஞ்சல் ( E-mail)"] || email
    },
    photo: {
      url: parsePhoto(raw.ProfilePhoto),
      publicId: ""
    },
    isSubmitted: true,
    isApproved: true,
    createdByAdmin: true,
    completionScore: 60
  };

  return { userDoc, profileDoc, memberId };
}

// ── Preview endpoint (no DB write) ────────────────────────────────────────────
// POST /api/admin/import-preview
export const previewImport = async (req, res) => {
  try {
    const rawProfiles = req.body.profiles;
    if (!Array.isArray(rawProfiles)) {
      return res.status(400).json({ message: "profiles must be an array." });
    }

    const validProfiles = rawProfiles.filter(isValid);
    const invalidProfiles = rawProfiles.filter(p => !isValid(p));

    // Return sample of mapped data for verification
    const sample = validProfiles.slice(0, 5).map(raw => {
      const { userDoc, profileDoc, memberId } = mapProfile(raw);
      return {
        memberId,
        name: userDoc.fullName,
        gender: userDoc.gender,
        age: profileDoc.basic.age,
        religion: profileDoc.religion.religion,
        caste: profileDoc.religion.caste,
        education: profileDoc.education.degree,
        city: profileDoc.location.city,
        rasi: profileDoc.horoscope.rasi,
        phone: profileDoc.contact.phone,
        photo: profileDoc.photo.url,
        email: userDoc.email
      };
    });

    res.json({
      total: rawProfiles.length,
      valid: validProfiles.length,
      invalid: invalidProfiles.length,
      sampleMapped: sample,
      invalidReasons: invalidProfiles.slice(0, 5).map(p => ({
        member_id: p.member_id,
        name: p.Name || "(no name)",
        age: p.Age,
        reason: !p.Name ? "No name" : parseAge(p.Age) < 18 ? "Age < 18" : "Missing data"
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Import endpoint (writes to DB) ───────────────────────────────────────────
// POST /api/admin/import-profiles
export const importProfiles = async (req, res) => {
  try {
    const rawProfiles = req.body.profiles;
    if (!Array.isArray(rawProfiles)) {
      return res.status(400).json({ message: "profiles must be an array." });
    }

    let imported = 0, skipped = 0, errors = 0;
    const errorDetails = [];

    for (const raw of rawProfiles) {
      if (!isValid(raw)) { skipped++; continue; }

      try {
        const { userDoc, profileDoc } = mapProfile(raw);

        const existingUser = await User.findOne({ email: userDoc.email });
        if (existingUser) { skipped++; continue; }

        const user = await User.create(userDoc);
        profileDoc.user = user._id;
        await Profile.create(profileDoc);
        imported++;
      } catch (err) {
        errors++;
        errorDetails.push(err.message);
      }
    }

    res.json({
      message: "Import complete!",
      total: rawProfiles.length,
      imported,
      skipped,
      errors,
      errorDetails: errorDetails.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
