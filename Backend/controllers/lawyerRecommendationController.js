// src/controllers/lawyerRecommendationController.js
import FIR from "../models/FIR.js";
import LawyerProfile from "../models/LawyerProfile.js";
import ConsultationRequest from "../models/ConsultationRequest.js";
import { getRelevantSpecializationsFromFIR } from "../services/lawyerMatchingService.js";

export const getRecommendedLawyersForFIR = async (req, res) => {
  try {
    const user = req.user;
    const { firId } = req.params;

    if (user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can view lawyer recommendations",
      });
    }

    const fir = await FIR.findById(firId)
      .populate("citizenId", "name email")
      .populate("stationId", "stationName");

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    if (String(fir.citizenId._id) !== String(user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only view recommendations for your own FIR",
      });
    }

    if (fir.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Lawyer recommendations are available only for accepted FIRs",
      });
    }

    const coordinates = fir?.incident?.location?.coordinates;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "FIR location is missing",
      });
    }

    const specializations = getRelevantSpecializationsFromFIR(fir);
    const maxDistanceInMeters = 30000;

    const lawyers = await LawyerProfile.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates,
          },
          distanceField: "distanceInMeters",
          maxDistance: maxDistanceInMeters,
          spherical: true,
          query: {
            verificationStatus: "approved",
            availabilityStatus: "available",
            specialization: { $in: specializations },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          phone: "$user.phone",
          specialization: 1,
          experienceYears: 1,
          city: 1,
          state: 1,
          bio: 1,
          languages: 1,
          feePerConsultation: 1,
          availabilityStatus: 1,
          verified: 1,
          verificationStatus: 1,
          ratingAverage: { $ifNull: ["$ratingAverage", 0] },
          ratingCount: { $ifNull: ["$ratingCount", 0] },
          distanceInMeters: 1,
        },
      },
      {
        $sort: {
          distanceInMeters: 1,
          ratingAverage: -1,
          ratingCount: -1,
          feePerConsultation: 1,
          experienceYears: -1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    const consultationRequests = await ConsultationRequest.find({
      firId: fir._id,
      citizenId: user._id,
      lawyerUserId: { $in: lawyers.map((lawyer) => lawyer.userId) },
    }).select("lawyerUserId status consultationMode createdAt updatedAt");

    const consultationMap = new Map(
      consultationRequests.map((request) => [
        String(request.lawyerUserId),
        {
          consultationRequestId: request._id,
          consultationStatus: request.status,
          consultationMode: request.consultationMode || null,
          requestedAt: request.createdAt,
          updatedAt: request.updatedAt,
        },
      ])
    );

    return res.status(200).json({
      success: true,
      fir: {
        id: fir._id,
        status: fir.status,
        category: fir?.incident?.category || null,
        title: fir?.incident?.title || null,
      },
      matchedSpecializations: specializations,
      total: lawyers.length,
      lawyers: lawyers.map((lawyer) => {
        const consultation = consultationMap.get(String(lawyer.userId));

        return {
          ...lawyer,
          distanceKm: Number((lawyer.distanceInMeters / 1000).toFixed(2)),
          consultationStatus: consultation?.consultationStatus || "not_requested",
          consultationRequestId: consultation?.consultationRequestId || null,
          consultationMode: consultation?.consultationMode || null,
          requestedAt: consultation?.requestedAt || null,
          consultationUpdatedAt: consultation?.updatedAt || null,
        };
      }),
    });
  } catch (error) {
    console.error("getRecommendedLawyersForFIR error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lawyer recommendations",
    });
  }
};
