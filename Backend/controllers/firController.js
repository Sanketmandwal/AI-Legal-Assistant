// src/controllers/firController.js
import FIR from "../models/FIR.js";
import PoliceProfile from "../models/PoliceProfile.js";
import cloudinary from "../config/cloudinary.js";
import { generateSecureEvidenceUrl } from "../services/firEvidenceService.js";
import { mapTimelineWithSignedUrls } from "../services/firTimelineService.js";


export const submitFIR = async (req, res) => {
  try {
    const citizen = req.user;

    if (citizen.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can submit FIRs",
      });
    }

    const {
      title,
      description,
      category,
      incidentTime,
      address,
      lat,
      lng,
    } = req.body;

    if (!title || !description || !category || !incidentTime || !address || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const coordinates = [Number(lng), Number(lat)];

    if (Number.isNaN(coordinates[0]) || Number.isNaN(coordinates[1])) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    const nearestStations = await PoliceProfile.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates,
          },
          distanceField: "distanceInMeters",
          spherical: true,
          maxDistance: 25000,
        },
      },
      {
        $match: {
          verificationStatus: "approved",
          isVerified: true,
        },
      },
      {
        $sort: {
          distanceInMeters: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    console.log("Nearest stations found:", nearestStations);

    if (!nearestStations.length) {
      return res.status(404).json({
        success: false,
        message: "No verified police station found near this location",
      });
    }

    const station = nearestStations[0];

    const fir = await FIR.create({
      citizenId: citizen._id,
      stationId: station._id,
      incident: {
        title,
        description,
        category,
        incidentTime: new Date(incidentTime),
        address,
        location: {
          type: "Point",
          coordinates,
        },
      },
      status: "submitted",
      timeline: [
        {
          type: "system_note",
          message: "FIR submitted successfully",
          byRole: "system",
        },
        {
          type: "system_note",
          message: `FIR assigned to ${station.stationName}`,
          byRole: "system",
        },
      ],
    });

    const uploadedAttachments = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const resourceType =
          file.mimetype === "application/pdf"
            ? "raw"
            : file.mimetype.startsWith("video/")
            ? "video"
            : "image";

        const upload = await cloudinary.uploader.upload(file.path, {
          folder: `secure/firs/${fir._id}/citizen/${citizen._id}/initial-evidence`,
          public_id: file.originalname.split(".")[0],
          resource_type: resourceType,
          type: "authenticated",
          overwrite: true,
        });

        uploadedAttachments.push({
          publicId: upload.public_id,
          filename: file.originalname,
          resourceType,
        });
      }

      fir.timeline.push({
        type: "evidence_added",
        message: "Citizen added initial evidence files",
        byUserId: citizen._id,
        byRole: "citizen",
        attachments: uploadedAttachments,
      });

      await fir.save();
    }

    return res.status(201).json({
      success: true,
      message: "FIR submitted successfully",
      fir: {
        _id: fir._id,
        status: fir.status,
        stationId: station._id,
        stationName: station.stationName,
        stationAddress: station.stationAddress,
        distanceKm: Number((station.distanceInMeters / 1000).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("submitFIR error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit FIR",
    });
  }
};

export const getMyFIRs = async (req, res) => {
  try {
    const citizen = req.user;

    if (citizen.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can view their FIRs",
      });
    }

    const firs = await FIR.find({ citizenId: citizen._id })
      .populate("stationId", "stationName stationAddress district state")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: firs.length,
      firs,
    });
  } catch (error) {
    console.error("getMyFIRs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch FIRs",
    });
  }
};

export const getPoliceFIRs = async (req, res) => {
  try {
    const policeUser = req.user;

    if (policeUser.role !== "police") {
      return res.status(403).json({
        success: false,
        message: "Only police can access assigned FIRs",
      });
    }

    const policeProfile = await PoliceProfile.findOne({
      userId: policeUser._id,
      verificationStatus: "approved",
      isVerified: true,
    });

    if (!policeProfile) {
      return res.status(404).json({
        success: false,
        message: "Verified police profile not found",
      });
    }

    const status = req.query.status;

    const filter = {
      stationId: policeProfile._id,
    };

    if (status) {
      filter.status = status;
    }

    const firs = await FIR.find(filter)
      .populate("citizenId", "name email phone")
      .populate("stationId", "stationName stationAddress district state")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      station: {
        _id: policeProfile._id,
        stationName: policeProfile.stationName,
        stationAddress: policeProfile.stationAddress,
      },
      count: firs.length,
      firs,
    });
  } catch (error) {
    console.error("getPoliceFIRs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch police FIRs",
    });
  }
};

export const updateFIRStatus = async (req, res) => {
  try {
    const policeUser = req.user;

    if (policeUser.role !== "police") {
      return res.status(403).json({
        success: false,
        message: "Only police can update FIR status",
      });
    }

    const policeProfile = await PoliceProfile.findOne({
      userId: policeUser._id,
      verificationStatus: "approved",
      isVerified: true,
    });

    if (!policeProfile) {
      return res.status(404).json({
        success: false,
        message: "Verified police profile not found",
      });
    }

    const { id } = req.params;
    const { status, message } = req.body;

    const allowedStatuses = [
      "accepted",
      "rejected",
      "investigating",
      "resolved",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR status",
      });
    }

    const fir = await FIR.findById(id)
      .populate("citizenId", "name email phone")
      .populate("stationId", "stationName userId");

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    if (String(fir.stationId._id) !== String(policeProfile._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update FIRs assigned to your station",
      });
    }

    const oldStatus = fir.status;
    fir.status = status;

    fir.timeline.push({
      type: "status_update",
      message: message || `FIR status updated to ${status}`,
      byUserId: policeUser._id,
      byRole: "police",
      meta: {
        oldStatus,
        newStatus: status,
      },
    });

    if (status === "accepted" && !fir.firNumber) {
      const year = new Date().getFullYear();
      fir.firNumber = `FIR-${year}-${String(fir._id).slice(-6).toUpperCase()}`;
    }

    await fir.save();

    return res.status(200).json({
      success: true,
      message: "FIR status updated successfully",
      fir: {
        _id: fir._id,
        firNumber: fir.firNumber,
        status: fir.status,
      },
    });
  } catch (error) {
    console.error("updateFIRStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update FIR status",
    });
  }
};


export const addFIREvidence = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { message } = req.body;

    const fir = await FIR.findById(id)
      .populate("citizenId", "name email phone")
      .populate("stationId", "stationName userId");

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    let allowed = false;

    if (user.role === "citizen" && String(fir.citizenId._id) === String(user._id)) {
      allowed = true;
    }

    if (user.role === "police") {
      const policeProfile = await PoliceProfile.findOne({
        userId: user._id,
        verificationStatus: "approved",
        isVerified: true,
      });

      if (policeProfile && String(policeProfile._id) === String(fir.stationId._id)) {
        allowed = true;
      }
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to add evidence to this FIR",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one evidence file is required",
      });
    }

    const attachments = [];

    for (const file of req.files) {
      const resourceType =
        file.mimetype === "application/pdf"
          ? "raw"
          : file.mimetype.startsWith("video/")
          ? "video"
          : "image";

      const upload = await cloudinary.uploader.upload(file.path, {
        folder: `secure/firs/${fir._id}/${user.role}/${user._id}/evidence`,
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        resource_type: resourceType,
        type: "authenticated",
        overwrite: true,
      });

      attachments.push({
        publicId: upload.public_id,
        filename: file.originalname,
        resourceType,
      });
    }

    fir.timeline.push({
      type: "evidence_added",
      message: message || "New evidence uploaded",
      byUserId: user._id,
      byRole: user.role,
      attachments,
    });

    await fir.save();

    return res.status(200).json({
      success: true,
      message: "Evidence added successfully",
      addedCount: attachments.length,
      attachments,
    });
  } catch (error) {
    console.error("addFIREvidence error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add evidence",
    });
  }
};

export const getSingleFIR = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const fir = await FIR.findById(id)
      .populate("citizenId", "name email phone")
      .populate("stationId", "stationName stationAddress district state userId")
      .populate("timeline.byUserId", "name email phone role");

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    let allowed = false;

    if (user.role === "citizen" && String(fir.citizenId._id) === String(user._id)) {
      allowed = true;
    }

    if (user.role === "police") {
      const policeProfile = await PoliceProfile.findOne({
        userId: user._id,
        verificationStatus: "approved",
        isVerified: true,
      });

      if (policeProfile && String(policeProfile._id) === String(fir.stationId._id)) {
        allowed = true;
      }
    }

    if (user.role === "admin") {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this FIR",
      });
    }

    const firObject = fir.toObject();
    firObject.timeline = mapTimelineWithSignedUrls(fir.timeline);

    return res.status(200).json({
      success: true,
      fir: firObject,
    });
  } catch (error) {
    console.error("getSingleFIR error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch FIR details",
    });
  }
};



export const getFIREvidence = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const fir = await FIR.findById(id)
      .populate("citizenId", "name email phone")
      .populate("stationId", "stationName stationAddress userId")
      .populate("timeline.byUserId", "name role");

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    let allowed = false;

    if (user.role === "citizen" && String(fir.citizenId._id) === String(user._id)) {
      allowed = true;
    }

    if (user.role === "police") {
      const policeProfile = await PoliceProfile.findOne({
        userId: user._id,
        verificationStatus: "approved",
        isVerified: true,
      });

      if (policeProfile && String(policeProfile._id) === String(fir.stationId._id)) {
        allowed = true;
      }
    }

    if (user.role === "admin") {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this FIR evidence",
      });
    }

    return res.status(200).json({
      success: true,
      firId: fir._id,
      status: fir.status,
      station: fir.stationId,
      timeline: mapTimelineWithSignedUrls(fir.timeline),
    });
  } catch (error) {
    console.error("getFIREvidence error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch FIR evidence",
    });
  }
};

