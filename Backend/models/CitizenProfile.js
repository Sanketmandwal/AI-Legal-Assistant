// src/models/CitizenProfile.js
import mongoose from "mongoose";

const citizenProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            required: true,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            trim: true,
        },

        dob: {
            type: Date,
        },

        address: {
            line1: { type: String, trim: true },
            line2: { type: String, trim: true },
            city: { type: String, trim: true },
            district: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
            country: { type: String, trim: true, default: "India" },
        },

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

        aadharNumber: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },

        aadharPublicId: {
            type: String,
            trim: true,
        },

        emergencyContact: {
            name: { type: String, trim: true },
            phone: { type: String, trim: true },
            relation: { type: String, trim: true },
        },

        preferredLanguage: {
            type: String,
            default: "en",
            trim: true,
        },

        profileCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

citizenProfileSchema.index({ userId: 1 }, { unique: true });
citizenProfileSchema.index({ aadharNumber: 1 }, { unique: true, sparse: true });
citizenProfileSchema.index({ location: "2dsphere" });

const CitizenProfile = mongoose.model("CitizenProfile", citizenProfileSchema);

export default CitizenProfile;
