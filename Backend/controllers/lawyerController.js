// src/controllers/lawyerController.js
import LawyerProfile from "../models/LawyerProfile.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const submitLawyerProfile = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== "lawyer") {
      return res.status(403).json({ 
        success: false, 
        message: "Lawyer access only" 
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
