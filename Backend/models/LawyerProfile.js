// src/models/LawyerProfile.js
import mongoose from 'mongoose';

const lawyerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      },
    ],
    experienceYears: {
      type: Number,
      min: 0,
      max: 80,
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },

    bio: { type: String, maxlength: 2000 },
    languages: [String],
    feePerConsultation: Number,

    verified: { type: Boolean, default: false },
    // Add these fields to your existing schema:
    aadharNumber: {
      type: String,
      required: true,
      unique: true,
    },
    aadharPublicId : {
      type: String, // file path
      required: true,
    },
    roleDocuments: [{
      type: String, // bar council cert
      required: true,
    }],

    // Update verificationStatus to match Police:
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
    },
    verifiedAt: Date,
    rejectionReason: String,

  },
  {
    timestamps: true,
  }
);

lawyerProfileSchema.index({ userId: 1 }, { unique: true });
lawyerProfileSchema.index({ city: 1, specialization: 1 });

const LawyerProfile = mongoose.model('LawyerProfile', lawyerProfileSchema);

export default LawyerProfile;
