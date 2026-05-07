// src/controllers/lawyerController.js
import LawyerProfile from "../models/LawyerProfile.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import LawyerReview from "../models/LawyerReview.js";

export const submitLawyerProfile = async (req, res) => {
  try {
    const user = req.user;
    const userFolder = `secure/users/${user._id}`;

    if (user.role !== "lawyer") {
      return res.status(403).json({
        success: false,
        message: "Lawyer access only",
      });
    }

    const existingProfile = await LawyerProfile.findOne({ userId: user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Lawyer profile already exists",
      });
    }

    const aadharUpload = await cloudinary.uploader.upload(
      req.files.aadharFile[0].path,
      {
        folder: `${userFolder}/aadhar`,
        type: "authenticated",
        resource_type:
          req.files.aadharFile[0].mimetype === "application/pdf" ? "raw" : "image",
        overwrite: true,
      }
    );

    const roleDocsUploads = await Promise.all(
      req.files.roleDocuments.map(async (file, index) => {
        const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";
        return cloudinary.uploader.upload(file.path, {
          folder: `${userFolder}/role-docs`,
          public_id: `doc-${index + 1}`,
          type: "authenticated",
          resource_type: resourceType,
          overwrite: true,
        });
      })
    );

    const lat = req.body.lat ? Number(req.body.lat) : null;
    const lng = req.body.lng ? Number(req.body.lng) : null;

    const profileData = {
      userId: user._id,
      aadharNumber: req.body.aadharNumber,
      aadharPublicId: aadharUpload.public_id,
      roleDocuments: roleDocsUploads.map((d) => d.public_id),
      barId: req.body.barId,
      specialization: req.body.specialization
        ? req.body.specialization.split(",").map((s) => s.trim().toLowerCase())
        : [],
      experienceYears: Number(req.body.experienceYears),
      city: req.body.city,
      state: req.body.state,
      bio: req.body.bio,
      languages: req.body.languages
        ? req.body.languages.split(",").map((l) => l.trim().toLowerCase())
        : [],
      feePerConsultation: Number(req.body.feePerConsultation),
      verificationStatus: "pending",
      availabilityStatus: "available",
      ...(lat !== null &&
        lng !== null && {
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
        }),
    };

    const lawyerProfile = new LawyerProfile(profileData);
    await lawyerProfile.save();

    user.roleVerified = false;
    await user.save();

    return res.json({
      success: true,
      message: "Lawyer profile submitted for admin verification!",
      profileId: lawyerProfile._id,
      userId: lawyerProfile.userId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getLawyerReviews = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 20);
    const skip = (page - 1) * limit;

    const lawyerProfile = await LawyerProfile.findById(lawyerId)
      .populate("userId", "name email");

    if (!lawyerProfile) {
      return res.status(404).json({
        success: false,
        message: "Lawyer profile not found",
      });
    }

    const [reviews, total] = await Promise.all([
      LawyerReview.find({
        lawyerProfileId: lawyerProfile._id,
        reviewerRole: "citizen",
      })
        .populate("reviewerId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LawyerReview.countDocuments({
        lawyerProfileId: lawyerProfile._id,
        reviewerRole: "citizen",
      }),
    ]);

    return res.status(200).json({
      success: true,
      lawyer: {
        _id: lawyerProfile._id,
        userId: lawyerProfile.userId?._id,
        name: lawyerProfile.userId?.name,
        email: lawyerProfile.userId?.email,
        specialization: lawyerProfile.specialization,
        city: lawyerProfile.city,
        state: lawyerProfile.state,
        feePerConsultation: lawyerProfile.feePerConsultation,
        ratingAverage: lawyerProfile.ratingAverage || 0,
        ratingCount: lawyerProfile.ratingCount || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      reviews: reviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        reviewText: review.reviewText,
        reviewerName: review.reviewerId?.name || "Anonymous",
        createdAt: review.createdAt,
      })),
    });
  } catch (error) {
    console.error("getLawyerReviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lawyer reviews",
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

export const updateLawyerProfile = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "lawyer") {
      return res.status(403).json({ success: false, message: "Lawyer access only" });
    }

    const { name, phone, bio, specialization, languages, feePerConsultation, experienceYears, city, state, availabilityStatus } = req.body;

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

    // Update LawyerProfile model
    const profile = await LawyerProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (bio !== undefined) profile.bio = bio;
    if (specialization) {
      profile.specialization = Array.isArray(specialization) 
        ? specialization 
        : specialization.split(",").map((s) => s.trim().toLowerCase());
    }
    if (languages) {
      profile.languages = Array.isArray(languages)
        ? languages
        : languages.split(",").map((l) => l.trim().toLowerCase());
    }
    if (feePerConsultation !== undefined) profile.feePerConsultation = Number(feePerConsultation);
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (city !== undefined) profile.city = city;
    if (state !== undefined) profile.state = state;
    if (availabilityStatus !== undefined) profile.availabilityStatus = availabilityStatus;

    await profile.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("updateLawyerProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
