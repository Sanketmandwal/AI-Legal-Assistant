// src/models/LawyerReview.js
import mongoose from "mongoose";

const lawyerReviewSchema = new mongoose.Schema(
  {
    consultationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConsultationRequest",
      required: true,
    },
    firId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
    },
    lawyerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LawyerProfile",
      required: true,
    },
    lawyerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ["citizen", "lawyer"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },
  },
  { timestamps: true }
);

lawyerReviewSchema.index(
  { consultationRequestId: 1, reviewerId: 1 },
  { unique: true }
);

lawyerReviewSchema.index({ lawyerProfileId: 1, reviewerRole: 1, createdAt: -1 });

const LawyerReview = mongoose.model("LawyerReview", lawyerReviewSchema);

export default LawyerReview;
