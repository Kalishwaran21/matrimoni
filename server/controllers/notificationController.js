import Notification from "../models/Notification.js";

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt").limit(50);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, _id: { $in: req.body.ids || [] } }, { isRead: true });
    res.json({ message: "Notifications updated" });
  } catch (error) {
    next(error);
  }
};
