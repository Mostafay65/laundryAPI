import express from "express";
import { upload } from "../configurations/multerConfig.js";
import {
  getAllBanners,
  createBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router();

// Public route - anyone can view banners
router.get("/", getAllBanners);

// Protected routes - only authenticated users with admin role can modify banners
router.use(authorize(roles.admin));

router.post("/", upload.single("image"), createBanner);
router.delete("/:id", deleteBanner);

export default router;