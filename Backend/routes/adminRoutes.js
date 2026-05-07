// src/routes/adminRoutes.js
import express from "express";
import {
  getPendingVerifications,
  approveLawyer,
  rejectLawyer,
  listUserDocuments,
  getVerificationHistory,
  updateAdminProfile
} from "../controllers/adminController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";
import { approvePolice, rejectPolice } from "../controllers/adminController.js";


const router = express.Router();


router.get("/pending-verifications", authMiddleware, requireRole(['admin']), getPendingVerifications);
router.patch("/lawyers/:id/approve", authMiddleware, requireRole(['admin']), approveLawyer);
router.patch("/lawyers/:id/reject", authMiddleware, requireRole(['admin']), rejectLawyer);
router.patch("/police/:id/approve", authMiddleware, requireRole(['admin']), approvePolice);
router.patch("/police/:id/reject", authMiddleware, requireRole(['admin']), rejectPolice);
// router.get("/lawyers/:id/documents", authMiddleware, requireRole(['admin']), getLawyerDocuments);
// router.get("/police/:id/documents", authMiddleware, requireRole(['admin']), getPoliceDocuments);
router.get("/users/:userId/documents", authMiddleware, requireRole(['admin']), listUserDocuments);
router.get("/verification-history", authMiddleware, requireRole(['admin']), getVerificationHistory);
router.patch("/profile", authMiddleware, requireRole(['admin']), updateAdminProfile);




export default router;
