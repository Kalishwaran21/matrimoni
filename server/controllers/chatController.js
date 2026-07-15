import Chat from "../models/Chat.js";
import Interest from "../models/Interest.js";
import Subscription from "../models/Subscription.js";

export const canChat = async (userA, userB) => {
  // Check if initiating user (userA) is Diamond
  const activeSub = await Subscription.findOne({ user: userA, status: "Active" }).sort("-createdAt");
  if (activeSub && activeSub.plan === "Diamond") {
    return true;
  }

  return Interest.exists({
    status: "Accepted",
    $or: [
      { from: userA, to: userB },
      { from: userB, to: userA }
    ]
  });
};

export const getChat = async (req, res, next) => {
  try {
    const allowed = await canChat(req.user._id, req.params.userId);
    // If userB replies, they need to be able to access the chat.
    // So we should also check if userB initiated an accepted interest or is Diamond, OR if a chat document already exists.
    // Actually, if a chat document exists between them, we can allow access.
    const participants = [req.user._id, req.params.userId].sort();
    
    let chatExists = await Chat.findOne({ participants: { $all: participants, $size: 2 } });
    
    if (!allowed && !chatExists) {
      return res.status(403).json({ message: "Chat is available after an accepted interest or with a Diamond plan." });
    }

    const chat = await Chat.findOneAndUpdate(
      { participants: { $all: participants, $size: 2 } },
      { $setOnInsert: { participants } },
      { new: true, upsert: true }
    ).populate("participants", "fullName gender isPremium lastSeenAt");

    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

export const listChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "fullName gender isPremium lastSeenAt")
      .sort("-updatedAt");

    res.json({ chats });
  } catch (error) {
    next(error);
  }
};
