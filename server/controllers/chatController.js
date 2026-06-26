import Chat from "../models/Chat.js";
import Interest from "../models/Interest.js";

export const canChat = async (userA, userB) => {
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
    if (!(await canChat(req.user._id, req.params.userId))) {
      return res.status(403).json({ message: "Chat is available after an accepted interest" });
    }

    const participants = [req.user._id, req.params.userId].sort();
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
