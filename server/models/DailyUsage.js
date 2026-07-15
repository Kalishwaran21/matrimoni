import mongoose from "mongoose";

const dailyUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    profilesViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

// Index to quickly find a user's usage for a specific date
dailyUsageSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyUsage", dailyUsageSchema);
