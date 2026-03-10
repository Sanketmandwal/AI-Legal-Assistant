// src/models/ConsultationRequest.js
import mongoose from "mongoose";

const consultationRequestSchema = new mongoose.Schema(
  {
    firId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LawyerProfile",
      required: true,
    },
    caseType: {
      type: String,
      trim: true,
      required: true,
    },
    initialMessage: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled", "completed"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
    responseMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

consultationRequestSchema.index({ firId: 1, citizenId: 1, lawyerUserId: 1 }, { unique: true });
consultationRequestSchema.index({ lawyerUserId: 1, status: 1 });
consultationRequestSchema.index({ citizenId: 1, status: 1 });

export default mongoose.model("ConsultationRequest", consultationRequestSchema);
