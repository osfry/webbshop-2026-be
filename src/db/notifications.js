import Notification from "../models/Notification.js";

export async function createNotification(data) {
  const notification = new Notification({
    user: data.user,         // Matchar ditt schema
    message: data.message,   // Matchar ditt schema
    trade: data.trade        // Matchar ditt schema
  });
  
  await notification.save();
  return notification;
}

export async function getNotificationForUser({userId}) {
    return await Notification.find({ user: userId })
    .populate("trade")
    .sort({ createdAt: -1 })
}

export async function markReadNotification(notificationId) {
    return await Notification.findByIdAndUpdate(
        notificationId, 
        { read: true},
        { new: true }
    )
}