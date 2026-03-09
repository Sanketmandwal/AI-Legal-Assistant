// src/routes/citizenRoutes.js
import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerConfig.js";
import {
  submitCitizenProfile,
  getCitizenProfile,
} from "../controllers/citizenController.js";

const router = express.Router();

router.post(
  "/submit-profile",
  authMiddleware,
  upload.fields([
    { name: "aadharFile", maxCount: 1 },
  ]),
  submitCitizenProfile
);

router.get(
  "/profile",
  authMiddleware,
  getCitizenProfile
);

export default router;
