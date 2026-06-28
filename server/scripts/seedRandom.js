import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/soulmate-matrimony";

const religions = ["Hinduism", "Christianity", "Islam", "Sikhism"];
const castes = ["Any", "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Catholic", "Protestant", "Sunni", "Shia"];
const jobs = ["Software Engineer", "Doctor", "Teacher", "Business", "Architect", "Data Scientist"];
const locations = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];
const genders = ["Male", "Female"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randAge = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedRandom = async () => {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Database connected. Generating 20 random profiles...");

    for (let i = 1; i <= 20; i++) {
      const gender = rand(genders);
      const email = `randomuser${i}@soulmate.com`;
      
      const user = await User.create({
        fullName: `Random User ${i}`,
        email,
        mobile: `999000${String(i).padStart(4, "0")}`,
        password: "Password123",
        gender,
        role: "user",
        isActive: true,
        isPremium: Math.random() > 0.5
      });

      const age = randAge(22, 35);
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - age);

      await Profile.create({
        user: user._id,
        basic: {
          name: `Random User ${i}`,
          age,
          dob,
          gender,
          height: `5 ft ${randAge(0, 11)} in`,
          weight: `${randAge(50, 90)} kg`
        },
        religion: {
          religion: rand(religions),
          caste: rand(castes),
          subCaste: "None"
        },
        location: {
          country: "India",
          state: "Random State",
          city: rand(locations)
        },
        education: {
          degree: "Bachelor's",
          college: "Random College"
        },
        career: {
          jobTitle: rand(jobs),
          company: "Random Corp",
          salary: randAge(5, 30) * 100000
        },
        family: {
          fatherOccupation: "Business",
          motherOccupation: "Homemaker",
          siblings: randAge(0, 3)
        },
        lifestyle: {
          smoking: "No",
          drinking: "No",
          foodType: "Any"
        },
        horoscope: {
          rasi: "Any",
          nakshatra: "Any",
          dosham: "No"
        },
        preferences: {
          ageMin: 20,
          ageMax: 40,
          height: "Any",
          religion: "Any",
          caste: "Any",
          education: "Any",
          salary: 0,
          location: "Any"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop",
            publicId: `seed_random_${i}`
          }
        ],
        isApproved: true,
        isSubmitted: true,
        completionScore: 100
      });

      console.log(`Created random profile ${i}/20: ${email}`);
    }

    console.log("Successfully generated 20 random profiles! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding random profiles:", error);
    process.exit(1);
  }
};

seedRandom();
