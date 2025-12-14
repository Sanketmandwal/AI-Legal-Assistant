import express from "express";
import {
  registerUser,
  loginUser,
    completeProfile,
    getMe,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";
import user from "../models/user.js";
const userrouter = express.Router();

// Public
userrouter.post("/register", registerUser);
userrouter.post("/login", loginUser);
userrouter.post("/complete-profile", authMiddleware, completeProfile);
userrouter.get("/me", authMiddleware, getMe);


export default userrouter;