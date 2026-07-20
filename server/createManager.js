import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

async function createManager() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: "manager@matrimoni.com" });
    if (existing) {
      console.log("Manager already exists!");
      console.log("Email: manager@matrimoni.com");
      console.log("Password: Manager@123");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Manager@123", 10);
    const manager = new User({
      fullName: "Data Manager",
      email: "manager@matrimoni.com",
      mobile: "9999999998",
      password: hashedPassword,
      role: "manager",
      gender: "Male"
    });

    await manager.save();
    console.log("Manager created successfully!");
    console.log("Email: manager@matrimoni.com");
    console.log("Password: Manager@123");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createManager();
