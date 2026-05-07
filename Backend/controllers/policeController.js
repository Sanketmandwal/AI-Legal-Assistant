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

    // Geocode address to lat/lng (Google Maps or manual)
    const { stationAddress, district, state, lat, lng } = req.body;
    const coordinates = [parseFloat(lng), parseFloat(lat)]; // [lng, lat]

    // Upload files (unchanged)
    const aadharUpload = await cloudinary.uploader.upload(
      req.files.aadharFile[0].path,
      {
        folder: `${userFolder}/aadhar`,
        type: "authenticated",
        resource_type: req.files.aadharFile[0].mimetype === 'application/pdf' ? 'raw' : 'image',
        overwrite: true,
      }
    );

    const roleDocsUploads = await Promise.all(
      req.files.roleDocuments.map(async (file, index) => {
        const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
        return cloudinary.uploader.upload(file.path, {
          folder: `${userFolder}/role-docs`,
          public_id: `doc-${index + 1}`,
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
      roleDocuments: roleDocsUploads.map(d => d.public_id), // Fixed field name
      stationName: req.body.stationName,
      stationAddress,
      location: {
        type: 'Point',
        coordinates, // [lng, lat]
      },
      jurisdictionRadius: parseFloat(req.body.jurisdictionRadius) || 15,
      district,
      state,
      badgeId: req.body.badgeId,
      jurisdictionAreas: req.body.jurisdictionAreas?.split(",") || [],
      verificationStatus: "pending",
    };

    const policeProfile = new PoliceProfile(profileData);
    await policeProfile.save();

    // Mark user pending verification
    user.roleVerified = false;
    await user.save();

    res.json({
      success: true,
      message: "Police station profile submitted for admin verification!",
      profileId: policeProfile._id,
      userId: policeProfile.userId,
    });
  } catch (error) {
    console.error("Police profile error:", error);
    res.status(500).json({ success: false, message: error.message });
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

export const updatePoliceProfile = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "police") {
      return res.status(403).json({ success: false, message: "Police access only" });
    }

    const { name, phone, stationAddress, jurisdictionRadius } = req.body;

    // Update User model
    let userUpdated = false;
    if (name && name !== user.name) {
      user.name = name;
      userUpdated = true;
    }
    if (phone && phone !== user.phone) {
      user.phone = phone;
      userUpdated = true;
    }
    if (userUpdated) {
      await user.save();
    }

    // Update PoliceProfile model
    const profile = await PoliceProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (stationAddress !== undefined) profile.stationAddress = stationAddress;
    if (jurisdictionRadius !== undefined) profile.jurisdictionRadius = Number(jurisdictionRadius);

    await profile.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("updatePoliceProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
