// src/controllers/policeController.js
import PoliceProfile from "../models/PoliceProfile.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const submitPoliceProfile = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "police") {
      return res.status(403).json({
        success: false,
        message: "Police access only"
      });
    }

    const aadharUpload = await cloudinary.uploader.upload(
      req.files.aadharFile[0].path,
      {
        folder: process.env.CLOUDINARY_AADHAR_FOLDER,
        type: "authenticated",        // or "private"
        access_control: [{ access_type: "token" }], // tightened control if enabled on plan
      }
    );

    // 2) Upload role documents
    const roleDocsUploads = await Promise.all(
      req.files.roleDocuments.map((f) =>
        cloudinary.uploader.upload(f.path, {
          folder: process.env.CLOUDINARY_DOCS_FOLDER,
          type: "authenticated",
          access_control: [{ access_type: "token" }],
        })
      )
    );

    const profileData = {
      userId: user._id,
      aadharNumber: req.body.aadharNumber,
      aadharPublicId: aadharUpload.public_id,
      roleDocuments: roleDocsUploads.map((d) => d.public_id),
      stationName: req.body.stationName,
      stationAddress: req.body.stationAddress,
      district: req.body.district,
      state: req.body.state,
      badgeId: req.body.badgeId,
      jurisdictionAreas: req.body.jurisdictionAreas?.split(",") || [],
      verificationStatus: "pending",
    };

    const policeProfile = new PoliceProfile(profileData);
    await policeProfile.save();

    // Mark user role as pending verification
    user.roleVerified = false;
    await user.save();

    res.json({
      success: true,
      message: "Police profile submitted for admin verification!",
      profileId: policeProfile._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPoliceProfile = async (req, res) => {
  try {
    const profile = await PoliceProfile.findOne({ userId: req.user._id })
      .populate("userId", "name email phone");

    res.json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
