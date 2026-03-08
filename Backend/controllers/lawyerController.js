// src/controllers/lawyerController.js
import LawyerProfile from "../models/LawyerProfile.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const submitLawyerProfile = async (req, res) => {
  try {
    const user = req.user;
    const userFolder = `secure/users/${user._id}`;
    
    if (user.role !== "lawyer") {
      return res.status(403).json({
        success: false,
        message: "Lawyer access only"
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
      barId: req.body.barId,
      specialization: req.body.specialization?.split(",") || [],
      experienceYears: Number(req.body.experienceYears),
      city: req.body.city,
      state: req.body.state,
      bio: req.body.bio,
      languages: req.body.languages?.split(",") || [],
      feePerConsultation: Number(req.body.feePerConsultation),
      verificationStatus: "pending",
    };

    const lawyerProfile = new LawyerProfile(profileData);
    await lawyerProfile.save();

    // Mark user role as pending verification
    user.roleVerified = false;
    await user.save();

    res.json({
      success: true,
      message: "Lawyer profile submitted for admin verification!",
      profileId: lawyerProfile._id,
      userId: lawyerProfile.userId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLawyerProfile = async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ userId: req.user._id })
      .populate("userId", "name email phone");

    res.json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
