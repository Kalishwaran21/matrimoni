import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profileId: { type: String, unique: true, sparse: true },
    basic: {
      name: String,
      nameTamil: String,
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
      district: String,
      city: String,
      nativePlace: String,
      currentPlace: String
    },
    education: {
      degree: String,
      department: String,
      college: String
    },
    career: {
      jobTitle: String,
      customJobTitle: String,
      company: String,
      salary: Number
    },
    family: {
      familyType: String,
      fatherName: String,
      fatherOccupation: String,
      motherName: String,
      motherOccupation: String,
      siblings: Number,
      brotherCount: Number,
      sisterCount: Number,
      marriedSiblings: Number,
      unmarriedSiblings: Number
    },
    horoscope: {
      rasi: String,
      lagnam: String,
      nakshatra: String,
      dosham: String
    },
    contact: {
      email: String,
      phone: String,
      altPhone: String
    },
    assets: {
      house: { type: String, enum: ["Own House", "Rented House", "None / Others"], default: "None / Others" },
      description: String
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
    photo: {
      url: String,
      publicId: String
    },
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
});

profileSchema.index({ "basic.gender": 1 });
profileSchema.index({ isApproved: 1 });
profileSchema.index({ "basic.age": 1 });
profileSchema.index({ "location.city": 1 });
profileSchema.index({ "location.district": 1 });
profileSchema.index({ "location.state": 1 });
profileSchema.index({ "religion.religion": 1 });

export default mongoose.model("Profile", profileSchema);
