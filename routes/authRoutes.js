import express from "express";
import {
  signup,
  resendVerificationCode,
  verifyPhone,
  signin,
  refreshToken,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
  // initializeSession,
} from "../controllers/authController.js";
import authorize from "../middleware/authorize.js";
import roles from "../helpers/roles.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/resendcode", resendVerificationCode);
router.post("/verifyemail/:code", verifyPhone);
router.post("/login", signin);
router.get("/refresh", refreshToken);
router.patch("/resetpassword/:code", resetPassword);
router.post("/forgotpassword", forgotPassword);

router.use(authorize());

router.patch("/updatepassword", updatePassword);
router.post("/logout", logout);

// router.post("/initialize", authorize(roles.admin), initializeSession);

export default router;