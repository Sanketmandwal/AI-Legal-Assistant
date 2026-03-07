// src/controllers/adminController.js
import LawyerProfile from "../models/LawyerProfile.js";
import PoliceProfile from "../models/PoliceProfile.js";
import { generateSecureDocumentUrl } from "../services/documentService.js";


export const getPendingVerifications = async (req, res) => {
  try {
    const [lawyers, police] = await Promise.all([
      LawyerProfile.find({ verificationStatus: "pending" })
        .populate("userId", "name email phone role")
        .select("-roleDocuments -aadharFile")
        .sort({ createdAt: -1 }),
      PoliceProfile.find({ verificationStatus: "pending" })
        .populate("userId", "name email phone role")
        .sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      lawyers,
      police,
      totalPending: lawyers.length + police.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveLawyer = async (req, res) => {
  try {
    const profile = await LawyerProfile.findById(req.params.id).populate("userId");
    
    if (!profile || profile.verificationStatus !== "pending") {
      return res.status(404).json({ 
        success: false, 
        message: "Profile not found or already processed" 
      });
    }

    profile.verificationStatus = "approved";
    profile.verifiedBy = req.user._id;
    profile.verifiedAt = new Date();
    profile.verified = true;
    await profile.save();
    
    profile.userId.aadharVerified = true;
    profile.userId.roleVerified = true;
    await profile.userId.save();

    res.json({ 
      success: true, 
      message: `${profile.userId.name} verified as lawyer!` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectLawyer = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await LawyerProfile.findById(req.params.id);
    
    profile.verificationStatus = "rejected";
    profile.rejectionReason = reason;
    await profile.save();

    res.json({ success: true, message: "Lawyer verification rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD these methods to existing adminController.js

export const approvePolice = async (req, res) => {
  try {
    const profile = await PoliceProfile.findById(req.params.id).populate("userId");
    
    if (!profile || profile.verificationStatus !== "pending") {
      return res.status(404).json({ 
        success: false, 
        message: "Profile not found or already processed" 
      });
    }

    profile.verificationStatus = "approved";
    profile.verifiedBy = req.user._id;
    profile.verifiedAt = new Date();
    await profile.save();
    
    profile.userId.aadharVerified = true;
    profile.userId.roleVerified = true;
    await profile.userId.save();

    res.json({ 
      success: true, 
      message: `${profile.userId.name} verified as police!` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectPolice = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await PoliceProfile.findById(req.params.id);
    
    profile.verificationStatus = "rejected";
    profile.rejectionReason = reason;
    await profile.save();

    res.json({ success: true, message: "Police verification rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getLawyerDocuments = async (req, res) => {
  try {
    const profile = await LawyerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const aadharUrl = generateSecureDocumentUrl(profile.aadharPublicId);
    const roleDocsUrls = profile.roleDocuments.map(generateSecureDocumentUrl);

    res.json({
      success: true,
      aadharUrl,
      roleDocsUrls,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getPoliceDocuments = async (req, res) => {
  try {
    const profile = await PoliceProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const aadharUrl = generateSecureDocumentUrl(profile.aadharPublicId);
    const roleDocsUrls = profile.roleDocuments.map(generateSecureDocumentUrl);

    res.json({
      success: true,
      aadharUrl,
      roleDocsUrls,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

