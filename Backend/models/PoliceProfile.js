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
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    badgeId: { type: String, trim: true },

    jurisdictionAreas: [String],

    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

policeProfileSchema.index({ userId: 1 }, { unique: true });
policeProfileSchema.index({ district: 1 });

const PoliceProfile = mongoose.model('PoliceProfile', policeProfileSchema);

export default PoliceProfile;
