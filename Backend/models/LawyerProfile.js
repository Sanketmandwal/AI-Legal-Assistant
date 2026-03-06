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
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

lawyerProfileSchema.index({ userId: 1 }, { unique: true });
lawyerProfileSchema.index({ city: 1, specialization: 1 });

const LawyerProfile = mongoose.model('LawyerProfile', lawyerProfileSchema);

export default LawyerProfile;
