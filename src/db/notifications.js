import Notification from "../models/Notification.js";

export async function createNotification({ user, message, trade}) {
    const notification = new Notification({ user, message, trade })
    await notification.save()
    return notification
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