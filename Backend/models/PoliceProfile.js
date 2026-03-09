// src/models/PoliceProfile.js
import mongoose from 'mongoose';

const policeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },
    stationName: {
      type: String,
      required: true,
      trim: true,
    },
    stationAddress: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    jurisdictionRadius: {
      type: Number,
      default: 15 // km
    },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    badgeId: { type: String, trim: true },

    jurisdictionAreas: [String],

    isVerified: { type: Boolean, default: false },
    aadharNumber: { type: String, required: true, unique: true },
    aadharPublicId: { type: String, required: true },
    roleDocuments: [{ type: String, required: true }], // police ID docs
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
    rejectionReason: String,

  },
  {
    timestamps: true,
  }
);

policeProfileSchema.index({ userId: 1 }, { unique: true });
policeProfileSchema.index({ district: 1 });
policeProfileSchema.index({ location: '2dsphere' }); 

const PoliceProfile = mongoose.model('PoliceProfile', policeProfileSchema);
export default PoliceProfile;

