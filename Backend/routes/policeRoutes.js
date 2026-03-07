// src/routes/policeRoutes.js
import express from "express";
import {
    submitPoliceProfile,
    getPoliceProfile
} from "../controllers/policeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerConfig.js";

const router = express.Router();

router.post(
    "/submit-profile",
    authMiddleware,
    upload.fields([
        { name: "aadharFile", maxCount: 1 },
        { name: "roleDocuments", maxCount: 3 },
    ]),
    submitPoliceProfile
);

router.get("/profile", authMiddleware, getPoliceProfile);

export default router;
