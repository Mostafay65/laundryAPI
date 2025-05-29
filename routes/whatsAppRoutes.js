import express from "express";
import { initializeSession } from "../controllers/whatsAppController.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router();

// Initialize WhatsApp session (admin only)
router.post("/initialize", authorize(roles.admin), initializeSession);

export default router;
