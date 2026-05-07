// src/routes/lawyerRoutes.js
import express from "express";
import {
  submitLawyerProfile,
  getLawyerProfile,
  getLawyerReviews,
  updateLawyerProfile,
} from "../controllers/lawyerController.js";
import {
  createConsultationRequest,
  respondToConsultationRequest,
  completeConsultation,
  submitConsultationReview,
  getIncomingConsultationRequests,
  getLawyerConsultationHistory,
} from "../controllers/consultationController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerConfig.js";
import { getRecommendedLawyersForFIR } from "../controllers/lawyerRecommendationController.js";

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

router.get(
  "/recommendations/:firId",
  authMiddleware,
  requireRole(["citizen"]),
  getRecommendedLawyersForFIR
);

router.post(
  "/consultations/request",
  authMiddleware,
  requireRole(["citizen"]),
  createConsultationRequest
);

router.patch(
  "/consultations/:id/respond",
  authMiddleware,
  requireRole(["lawyer"]),
  respondToConsultationRequest
);


router.patch(
  "/consultations/:id/complete",
  authMiddleware,
  requireRole(["citizen", "lawyer"]),
  completeConsultation
);

router.post(
  "/consultations/:id/review",
  authMiddleware,
  requireRole(["citizen", "lawyer"]),
  submitConsultationReview
);

router.get(
  "/consultations/incoming",
  authMiddleware,
  requireRole(["lawyer"]),
  getIncomingConsultationRequests
);

router.get(
  "/consultations/history",
  authMiddleware,
  requireRole(["lawyer"]),
  getLawyerConsultationHistory
);



router.get(
  "/:lawyerId/reviews",
  getLawyerReviews
);


router.get("/profile", authMiddleware, getLawyerProfile);

router.patch("/profile", authMiddleware, requireRole(["lawyer"]), updateLawyerProfile);

export default router;
