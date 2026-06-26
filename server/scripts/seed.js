import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Chat from "../models/Chat.js";
import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import Subscription from "../models/Subscription.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/soulmate-matrimony";

const seedData = async () => {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Database connected. Cleaning existing collections...");

    // Clear all existing collections
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Chat.deleteMany({});
    await Interest.deleteMany({});
    await Notification.deleteMany({});
    await Subscription.deleteMany({});
    console.log("Database cleared.");

    // 1. Create Admin
    const admin = await User.create({
      fullName: "Soulmate Admin",
      email: "admin@soulmate.com",
      mobile: "9876543210",
      password: "Password123",
      gender: "Other",
      role: "admin",
      isActive: true,
      isPremium: true
    });
    console.log("Admin user seeded: admin@soulmate.com / Password123");

    // 2. Create Groom Users
    const groom1 = await User.create({
      fullName: "Rahul Kumar",
      email: "rahul.kumar@gmail.com",
      mobile: "9123456780",
      password: "Password123",
      gender: "Male",
      role: "user",
      isActive: true,
      isPremium: false
    });

    const groom2 = await User.create({
      fullName: "John Doe",
      email: "john.doe@gmail.com",
      mobile: "9123456781",
      password: "Password123",
      gender: "Male",
      role: "user",
      isActive: true,
      isPremium: true
    });

    // 3. Create Bride Users
    const bride1 = await User.create({
      fullName: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      mobile: "9123456782",
      password: "Password123",
      gender: "Female",
      role: "user",
      isActive: true,
      isPremium: true
    });

    const bride2 = await User.create({
      fullName: "Jane Smith",
      email: "jane.smith@gmail.com",
      mobile: "9123456783",
      password: "Password123",
      gender: "Female",
      role: "user",
      isActive: true,
      isPremium: false
    });

    console.log("Users seeded successfully.");

    // 4. Create Profiles
    await Profile.create({
      user: groom1._id,
      basic: {
        name: "Rahul Kumar",
        age: 28,
        dob: new Date("1998-05-15"),
        gender: "Male",
        height: "5 ft 10 in",
        weight: "72 kg"
      },
      religion: {
        religion: "Hinduism",
        caste: "Sharma",
        subCaste: "Saraswat"
      },
      location: {
        country: "India",
        state: "Delhi",
        city: "New Delhi"
      },
      education: {
        degree: "B.Tech in Computer Science",
        college: "Delhi Technological University"
      },
      career: {
        jobTitle: "Senior Software Engineer",
        company: "Google India",
        salary: 3200000
      },
      family: {
        fatherOccupation: "Retired Government Officer",
        motherOccupation: "Homemaker",
        siblings: 1
      },
      lifestyle: {
        smoking: "No",
        drinking: "Occasionally",
        foodType: "Vegetarian"
      },
      horoscope: {
        rasi: "Leo",
        nakshatra: "Magha",
        dosham: "No"
      },
      preferences: {
        ageMin: 23,
        ageMax: 28,
        height: "5 ft 4 in",
        religion: "Hinduism",
        caste: "Sharma",
        education: "Bachelor's",
        salary: 1000000,
        location: "Delhi NCR"
      },
      photos: [
        {
          url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
          publicId: "seed_groom1_1"
        }
      ],
      completionScore: 90
    });

    await Profile.create({
      user: groom2._id,
      basic: {
        name: "John Doe",
        age: 30,
        dob: new Date("1996-09-20"),
        gender: "Male",
        height: "6 ft 1 in",
        weight: "80 kg"
      },
      religion: {
        religion: "Christianity",
        caste: "Catholic",
        subCaste: "None"
      },
      location: {
        country: "India",
        state: "Karnataka",
        city: "Bangalore"
      },
      education: {
        degree: "MBA",
        college: "IIM Bangalore"
      },
      career: {
        jobTitle: "Product Manager",
        company: "Microsoft India",
        salary: 2800000
      },
      family: {
        fatherOccupation: "Doctor",
        motherOccupation: "Professor",
        siblings: 2
      },
      lifestyle: {
        smoking: "No",
        drinking: "Occasionally",
        foodType: "Non-Vegetarian"
      },
      horoscope: {
        rasi: "Virgo",
        nakshatra: "Hasta",
        dosham: "No"
      },
      preferences: {
        ageMin: 25,
        ageMax: 30,
        height: "5 ft 6 in",
        religion: "Christianity",
        caste: "Any",
        education: "Master's",
        salary: 1500000,
        location: "Bangalore"
      },
      photos: [
        {
          url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
          publicId: "seed_groom2_1"
        }
      ],
      completionScore: 85
    });

    await Profile.create({
      user: bride1._id,
      basic: {
        name: "Priya Sharma",
        age: 26,
        dob: new Date("2000-02-14"),
        gender: "Female",
        height: "5 ft 5 in",
        weight: "58 kg"
      },
      religion: {
        religion: "Hinduism",
        caste: "Sharma",
        subCaste: "Saraswat"
      },
      location: {
        country: "India",
        state: "Delhi",
        city: "Noida"
      },
      education: {
        degree: "M.Tech in Data Science",
        college: "IIT Delhi"
      },
      career: {
        jobTitle: "Data Scientist",
        company: "Adobe India",
        salary: 2400000
      },
      family: {
        fatherOccupation: "Businessman",
        motherOccupation: "School Principal",
        siblings: 0
      },
      lifestyle: {
        smoking: "No",
        drinking: "No",
        foodType: "Vegetarian"
      },
      horoscope: {
        rasi: "Aries",
        nakshatra: "Ashwini",
        dosham: "No"
      },
      preferences: {
        ageMin: 26,
        ageMax: 31,
        height: "5 ft 8 in",
        religion: "Hinduism",
        caste: "Sharma",
        education: "Master's",
        salary: 2000000,
        location: "Delhi NCR"
      },
      photos: [
        {
          url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
          publicId: "seed_bride1_1"
        }
      ],
      completionScore: 95
    });

    await Profile.create({
      user: bride2._id,
      basic: {
        name: "Jane Smith",
        age: 27,
        dob: new Date("1999-11-30"),
        gender: "Female",
        height: "5 ft 6 in",
        weight: "60 kg"
      },
      religion: {
        religion: "Christianity",
        caste: "Catholic",
        subCaste: "None"
      },
      location: {
        country: "India",
        state: "Karnataka",
        city: "Bangalore"
      },
      education: {
        degree: "B.Arch",
        college: "RV College of Architecture"
      },
      career: {
        jobTitle: "Senior Architect",
        company: "SpaceMatrix",
        salary: 1800000
      },
      family: {
        fatherOccupation: "Engineer",
        motherOccupation: "Artist",
        siblings: 1
      },
      lifestyle: {
        smoking: "No",
        drinking: "Occasionally",
        foodType: "Non-Vegetarian"
      },
      horoscope: {
        rasi: "Taurus",
        nakshatra: "Krittika",
        dosham: "No"
      },
      preferences: {
        ageMin: 27,
        ageMax: 32,
        height: "5 ft 10 in",
        religion: "Christianity",
        caste: "Any",
        education: "Bachelor's",
        salary: 1500000,
        location: "Bangalore"
      },
      photos: [
        {
          url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
          publicId: "seed_bride2_1"
        }
      ],
      completionScore: 88
    });

    console.log("Profiles seeded successfully.");
    console.log("Database seeding completed successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
