import Notification from "../models/notificationModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";

// Get all notifications
export const getAllNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find();
  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: {
      notifications,
    },
  });
});

// Create a notification (admin only)
export const createNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.create(req.body);
  res.status(201).json({
    status: "success",
    message: "Notification created successfully",
  });
});

// Delete a notification (admin only)
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) {
    return next(new AppError("No notification found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
