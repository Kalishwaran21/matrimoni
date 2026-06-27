import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    basic: {
      name: String,
      age: Number,
      dob: Date,
      gender: String,
      height: String,
      weight: String,
      marital: String,
      language: String,
      physical: String,
      color: String
    },
    religion: {
      religion: String,
      caste: String,
      subCaste: String,
      gothram: String
    },
    location: {
      country: String,
      state: String,
      city: String,
      nativePlace: String,
      currentPlace: String
    },
    education: {
      degree: String,
      college: String
    },
    career: {
      jobTitle: String,
      company: String,
      salary: Number
    },
    family: {
      fatherOccupation: String,
      motherOccupation: String,
      siblings: Number,
      familytype: String
    },
    horoscope: {
      rasi: String,
      nakshatra: String,
      dosham: String
    },
    assets: {
      house: { type: String, enum: ["Own House", "Rented House", "None / Others"], default: "None / Others" },
      land: String,
      totalValue: String
    },
    about: String,
    preferences: {
      ageMin: Number,
      ageMax: Number,
      height: String,
      religion: String,
      caste: String,
      education: String,
      salary: Number,
      location: String,
      job: String,
      language: String
    },
    photos: [
      {
        url: String,
        publicId: String
      }
    ],
    boostUntil: Date,
    completionScore: { type: Number, default: 0 },
    isSubmitted: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    createdByAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

profileSchema.index({
  "basic.age": 1,
  "religion.religion": 1,
  "religion.caste": 1,
  "location.city": 1,
  "education.degree": 1,
  "career.jobTitle": 1,
  "career.salary": 1
});

export default mongoose.model("Profile", profileSchema);
