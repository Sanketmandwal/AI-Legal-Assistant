import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { validatetoken } from "../services/auth.js";


export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
  

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = validatetoken(token);
    if (!decoded?._id) return res.status(401).json({ success: false, message: "Invalid token" });

    const user = await User.findById(decoded._id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user;
    next();

    
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ success: false, message: "Token verification failed" });
  }
};

// role guard helper
export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};
