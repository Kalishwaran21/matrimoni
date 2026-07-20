import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    silverPrice: { type: Number, default: 500 },
    goldPrice: { type: Number, default: 1500 },
    diamondPrice: { type: Number, default: 2500 },
    gpayQrUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
