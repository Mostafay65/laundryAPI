import express from "express";
import {
  getAllNotifications,
  createNotification,
  deleteNotification,
  getUserNotifications,
} from "../controllers/notificationController.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router();

// Public route - anyone can view notifications
router.get("/", getAllNotifications);
router.get("/user", authorize(), getUserNotifications);

// Protected routes - only authenticated users with admin role can modify notifications
router.use(authorize(roles.admin));

router.post("/", createNotification);
router.delete("/:id", deleteNotification);

export default router;
