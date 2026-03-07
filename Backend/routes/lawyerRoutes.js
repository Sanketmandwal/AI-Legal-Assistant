// src/routes/lawyerRoutes.js
import express from "express";
import { 
  submitLawyerProfile, 
  getLawyerProfile 
} from "../controllers/lawyerController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerConfig.js";

const router = express.Router();

router.post(
  "/submit-profile",
  authMiddleware,
  upload.fields([
    { name: "aadharFile", maxCount: 1 },
    { name: "roleDocuments", maxCount: 3 },
  ]),
  submitLawyerProfile
);

router.get("/profile", authMiddleware, getLawyerProfile);

export default router;
