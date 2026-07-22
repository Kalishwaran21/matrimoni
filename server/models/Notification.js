import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["New Interest", "Interest Accepted", "New Message", "Subscription Expiry", "Profile Viewed"],
      required: true
    },
    title: String,
    message: String,
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.post("save", function (doc) {
  if (global.io) {
    global.io.to(String(doc.user)).emit("notification:new", doc);
  }
});

export default mongoose.model("Notification", notificationSchema);
