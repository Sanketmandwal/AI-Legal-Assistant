// src/routes/policeRoutes.js
import express from "express";
import {
    submitPoliceProfile,
    getPoliceProfile,
    updatePoliceProfile
} from "../controllers/policeController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";
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

router.patch("/profile", authMiddleware, requireRole(["police"]), updatePoliceProfile);

export default router;
