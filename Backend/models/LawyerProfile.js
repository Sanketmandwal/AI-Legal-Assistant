// src/models/LawyerProfile.js
import mongoose from "mongoose";

const lawyerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    barId: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    experienceYears: {
      type: Number,
      min: 0,
      max: 80,
    },

    city: { type: String, trim: true },
    state: { type: String, trim: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
      },
    },

    bio: { type: String, maxlength: 2000 },
    languages: [{ type: String, trim: true, lowercase: true }],
    feePerConsultation: { type: Number, min: 0 },

    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },


    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    verified: { type: Boolean, default: false },

    aadharNumber: {
      type: String,
      required: true,
      unique: true,
    },
    aadharPublicId: {
      type: String,
      required: true,
    },
    roleDocuments: [
      {
        type: String,
        required: true,
      },
    ],

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

lawyerProfileSchema.index({ userId: 1 }, { unique: true });
lawyerProfileSchema.index({ location: "2dsphere" });
lawyerProfileSchema.index({ verificationStatus: 1, specialization: 1 });
lawyerProfileSchema.index({ city: 1, state: 1 });

const LawyerProfile = mongoose.model("LawyerProfile", lawyerProfileSchema);

export default LawyerProfile;
