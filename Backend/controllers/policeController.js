// src/controllers/policeController.js
import PoliceProfile from "../models/PoliceProfile.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const submitPoliceProfile = async (req, res) => {
  try {
    const user = req.user;
    const userFolder = `secure/users/${user._id}`;
    
    if (user.role !== "police") {
      return res.status(403).json({
        success: false,
        message: "Police access only"
      });
    }

    const aadharUpload = await cloudinary.uploader.upload(
      req.files.aadharFile[0].path,
      {
        folder: `${userFolder}/aadhar`,
        type: "authenticated",
        resource_type: req.files.aadharFile[0].mimetype === 'application/pdf' ? 'raw' : 'image',
        overwrite: true,
      }
    );

    // Role documents upload
    const roleDocsUploads = await Promise.all(
      req.files.roleDocuments.map(async (file, index) => {
        const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
        return cloudinary.uploader.upload(file.path, {
          folder: `${userFolder}/role-docs`,
          public_id: `doc-${index + 1}`, // doc-1, doc-2, etc.
          type: "authenticated",
          resource_type: resourceType,
          overwrite: true,
        });
      })
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
      userId: policeProfile.userId,
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
