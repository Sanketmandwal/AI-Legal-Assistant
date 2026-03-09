// src/models/FIR.js
import mongoose from "mongoose";

const firEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "status_update",
        "police_update",
        "citizen_update",
        "evidence_added",
        "system_note"
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    byUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    byRole: {
      type: String,
      enum: ["citizen", "police", "admin", "system"],
      required: true,
    },
    attachments: [
      {
        publicId: String,
        filename: String,
        resourceType: {
          type: String,
          enum: ["image", "raw", "video"],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    meta: {
      oldStatus: String,
      newStatus: String,
    },
  },
  { timestamps: true }
);

const firSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceProfile",
      required: true,
    },
    firNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    incident: {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },
      category: {
        type: String,
        enum: [
          "theft",
          "assault",
          "fraud",
          "harassment",
          "cybercrime",
          "missing",
          "other",
        ],
        required: true,
      },
      incidentTime: {
        type: Date,
        required: true,
      },
      address: {
        type: String,
        trim: true,
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
        },
      },
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "accepted",
        "rejected",
        "investigating",
        "resolved",
        "closed",
      ],
      default: "submitted",
    },
    timeline: [firEventSchema],
  },
  { timestamps: true }
);

firSchema.index({ citizenId: 1 });
firSchema.index({ stationId: 1 });
firSchema.index({ status: 1 });
firSchema.index({ "incident.location": "2dsphere" });

export default mongoose.model("FIR", firSchema);
