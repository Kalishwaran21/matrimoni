import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["Free", "Silver", "Gold", "Diamond"], default: "Free" },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Expired", "Pending"], default: "Active" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    startedAt: { type: Date, default: Date.now },
    expiresAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
