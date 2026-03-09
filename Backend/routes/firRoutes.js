// src/routes/firRoutes.js
import express from "express";
import { authMiddleware,requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerConfig.js";
import { submitFIR, getMyFIRs, getPoliceFIRs, updateFIRStatus, addFIREvidence , getSingleFIR ,getFIREvidence} from "../controllers/firController.js";

const router = express.Router();

router.post(
    "/submit",
    authMiddleware,
    requireRole(['citizen']),
    upload.array("evidenceFiles", 5),
    submitFIR
);

router.get(
    "/my-firs",
    authMiddleware,
    requireRole(['citizen']),
    getMyFIRs
);

router.get(
    "/police/all",
    authMiddleware,
    requireRole(['police']),
    getPoliceFIRs
);

router.patch(
    "/police/:id/status",
    authMiddleware,
    requireRole(['police']),
    updateFIRStatus
);

router.post(
    "/:id/evidence",
    authMiddleware,
    upload.array("evidenceFiles", 5),
    addFIREvidence
);

router.get(
  "/:id/evidence",
  authMiddleware,
  getFIREvidence
);

router.get(
    "/:id",
    authMiddleware,
    getSingleFIR
);


export default router;
