// src/controllers/citizenController.js
import CitizenProfile from "../models/CitizenProfile.js";
import cloudinary from "../config/cloudinary.js";

export const submitCitizenProfile = async (req, res) => {
  try {
    const user = req.user;
    const userFolder = `secure/users/${user._id}`;

    if (user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Citizen access only",
      });
    }

    const existingProfile = await CitizenProfile.findOne({ userId: user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Citizen profile already exists",
      });
    }

    if (!req.files || !req.files.aadharFile || !req.files.aadharFile[0]) {
      return res.status(400).json({
        success: false,
        message: "Aadhar file is required",
      });
    }

    const aadharFile = req.files.aadharFile[0];

    const aadharUpload = await cloudinary.uploader.upload(aadharFile.path, {
      folder: `${userFolder}/aadhar`,
      type: "authenticated",
      resource_type: aadharFile.mimetype === "application/pdf" ? "raw" : "image",
      overwrite: true,
    });

    const profileData = {
      userId: user._id,
      gender: req.body.gender,
      dob: req.body.dob,
      address: {
        line1: req.body.line1,
        line2: req.body.line2,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country || "India",
      },
      location: req.body.lat && req.body.lng
        ? {
            type: "Point",
            coordinates: [Number(req.body.lng), Number(req.body.lat)],
          }
        : undefined,
      aadharNumber: req.body.aadharNumber,
      aadharPublicId: aadharUpload.public_id,
      emergencyContact: {
        name: req.body.emergencyContactName,
        phone: req.body.emergencyContactPhone,
        relation: req.body.emergencyContactRelation,
      },
      preferredLanguage: req.body.preferredLanguage || "en",
      profileCompleted: true,
    };

    const citizenProfile = new CitizenProfile(profileData);
    await citizenProfile.save();

    user.aadharVerified = false;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Citizen profile submitted successfully!",
      profileId: citizenProfile._id,
      userId: citizenProfile.userId,
    });
  } catch (error) {
    console.error("submitCitizenProfile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCitizenProfile = async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Citizen access only",
      });
    }

    const profile = await CitizenProfile.findOne({ userId: req.user._id })
      .populate("userId", "name email phone role emailVerified phoneVerified");

    res.json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    console.error("getCitizenProfile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
