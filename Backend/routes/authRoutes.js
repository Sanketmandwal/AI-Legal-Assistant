// src/routes/authRoutes.js
import { Router } from "express";
import {
  register,
  login,
  getMe,
  sendEmailOtp,
  verifyEmail,
  sendPhoneOtp,
  verifyPhone,
  verifyBothOtps,  // ← ADD THIS NEW ONE
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Authenticated user info
router.get("/me", authMiddleware, getMe);

// Email verification
router.post("/send-email-otp", authMiddleware, sendEmailOtp);
router.post("/verify-email", authMiddleware, verifyEmail);

// Phone verification
router.post("/send-phone-otp", authMiddleware, sendPhoneOtp);
router.post("/verify-phone", authMiddleware, verifyPhone);

// NEW: Verify both OTPs together (for registration step 2)
router.post("/verify-both-otps", authMiddleware, verifyBothOtps);

export default router;
