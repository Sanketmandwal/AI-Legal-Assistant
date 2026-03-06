// src/controllers/authController.js
import User from "../models/User.js";
import { signToken } from "../config/jwt.js";
import { createAndStoreOtp, verifyOtp } from "../utils/otpUtil.js";
import { sendEmailVerificationOtp } from "../services/emailService.js";
import { sendPhoneVerificationOtp } from "../services/smsService.js";

/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email, phone, password are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "Phone already registered" });
    }

    // Only allow specific roles from client
    const allowedRoles = ["citizen", "lawyer", "police"];
    const finalRole = allowedRoles.includes(role) ? role : "citizen";

    const user = new User({
      name,
      email,
      phone,
      password, // will be hashed by pre-save hook
      role: finalRole,
      emailVerified: false,
      phoneVerified: false,
      aadharVerified: false,
      roleVerified: finalRole === "citizen", // citizen considered verified role by default
    });

    await user.save();

    // Generate and send Email OTP
    const { code: emailOtp } = await createAndStoreOtp({
      userId: user._id,
      type: "email",
      destination: user.email,
      ttlMinutes: 100,
    });

    await sendEmailVerificationOtp({
      email: user.email,
      name: user.name,
      otp: emailOtp,
    });

    const { code: phoneOtp } = await createAndStoreOtp({
      userId: user._id,
      type: "phone",
      destination: user.phone,
      ttlMinutes: 100,
    });

    await sendPhoneVerificationOtp({
      phone: user.phone,
      otp: phoneOtp,
    });

    const tempToken = signToken(user); 

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify email and phone via OTP.",
      tempToken,
      user: { ...user, emailVerified: false, phoneVerified: false },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email/phone and password are required" });
    }

    // Try by email first, then phone
    let user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    }).select("+password +salt");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account is disabled. Contact support." });
    }

    // Enforce mandatory email + phone verification BEFORE full login
    if (!user.emailVerified || !user.phoneVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email and phone number before logging in.",
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      aadharVerified: user.aadharVerified,
      roleVerified: user.roleVerified,
    };

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/auth/me
 * Requires authMiddleware
 */
export const getMe = async (req, res) => {
  const user = req.user;

  return res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      aadharVerified: user.aadharVerified,
      roleVerified: user.roleVerified,
      createdAt: user.createdAt,
    },
  });
};

/**
 * POST /api/auth/send-email-otp
 * Requires auth (user must be logged in OR we can allow by email only – here we use auth)
 */
export const sendEmailOtp = async (req, res) => {
  try {
    const user = req.user;

    const { otpDoc, code } = await createAndStoreOtp({
      userId: user._id,
      type: "email",
      destination: user.email,
      ttlMinutes: 10,
    });

    await sendEmailVerificationOtp({
      email: user.email,
      name: user.name,
      otp: code,
    });

    return res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (err) {
    console.error("sendEmailOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/auth/verify-email
 * body: { otp }
 * Requires auth
 */
export const verifyEmail = async (req, res) => {
  try {
    const user = req.user;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    await verifyOtp({
      userId: user._id,
      type: "email",
      code: otp,
    });

    user.emailVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res
      .status(400)
      .json({ success: false, message: err.message || "Invalid or expired OTP" });
  }
};

/**
 * POST /api/auth/send-phone-otp
 * Requires auth
 */
export const sendPhoneOtp = async (req, res) => {
  try {
    const user = req.user;
    const { phone } = req.body;

    const phoneToUse = phone || user.phone;
    if (!phoneToUse) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    if (phone && phone !== user.phone) {
      // You might want extra checks here (uniqueness, etc.)
      user.phone = phone;
      await user.save();
    }

    const { code } = await createAndStoreOtp({
      userId: user._id,
      type: "phone",
      destination: phoneToUse,
      ttlMinutes: 10,
    });

    await sendPhoneVerificationOtp({
      phone: phoneToUse,
      otp: code,
    });

    return res.json({
      success: true,
      message: "Phone verification OTP sent",
    });
  } catch (err) {
    console.error("sendPhoneOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/auth/verify-phone
 * body: { otp }
 * Requires auth
 */
export const verifyPhone = async (req, res) => {
  try {
    const user = req.user;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    await verifyOtp({
      userId: user._id,
      type: "phone",
      code: otp,
    });

    user.phoneVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (err) {
    console.error("verifyPhone error:", err);
    return res
      .status(400)
      .json({ success: false, message: err.message || "Invalid or expired OTP" });
  }
};


/**
 * POST /api/auth/verify-both-otps
 * For step 2 of registration: verify email + phone OTPs together
 */
export const verifyBothOtps = async (req, res) => {
  try {
    const { emailOtp, phoneOtp } = req.body;
    const user = req.user; 

    if (!emailOtp || !phoneOtp) {
      return res.status(400).json({
        success: false,
        message: "Both email OTP and phone OTP are required",
      });
    }

    // Verify email OTP
    await verifyOtp({
      userId: user._id,
      type: "email",
      code: emailOtp,
    });

    // Verify phone OTP
    await verifyOtp({
      userId: user._id,
      type: "phone",
      code: phoneOtp,
    });

    // Mark both as verified
    user.emailVerified = true;
    user.phoneVerified = true;
    await user.save();

    // Issue FULL auth token (now user is fully verified)
    const token = signToken(user);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: true,
      phoneVerified: true,
      profileCompleted: user.profileCompleted || false,
    };

    return res.json({
      success: true,
      message: "Email and phone verified successfully. Welcome!",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("verifyBothOtps error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Verification failed. OTPs may be incorrect or expired.",
    });
  }
};

