// backend/src/controllers/authController.js
import User from "../models/user.js";
import { createtokenforuser } from "../services/auth.js";

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "user", phone, location } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // check existing
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "User already exists" });

    const user = new User({ name, email, password, role, phone, location });
    await user.save();

    const token = createtokenforuser(user);

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user,
      role: user.role,
      userId: user._id,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Missing credentials" });

    const user = await User.matchPassword(email, password); // returns user without password
    const token = createtokenforuser(user);

    // Update lastLogin
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    

    res.json({ success: true, message: "Login successful", token, user, role: user.role, userId: user._id });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Complete profile for role (police or lawyer)
export const completeProfile = async (req, res) => {
  try {
    const user = req.user; // from authMiddleware
    const { role } = user;
    console.log("req.body:", req.body);

    if (role === "police") {
      const { stationName, stationAddress, district, badgeId } = req.body;
      user.policeInfo = { stationName, stationAddress, district, badgeId };
    } else if (role === "lawyer") {
      const { barId, specialization, experience, city, verified } = req.body;
      user.lawyerInfo = { barId, specialization, experience, city, verified: !!verified };
    } else {
      return res.status(400).json({ success: false, message: "No extra info required for this role" });
    }

    await user.save();
    return res.json({ success: true, message: "Profile completed", user });
  } catch (err) {
    console.error("Complete profile error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = req.user; 
    return res.json({ success: true, user });
  } catch (err) {
    console.error("Get me error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
