// src/controllers/consultationController.js
import crypto from "crypto";
import FIR from "../models/FIR.js";
import User from "../models/User.js";
import LawyerProfile from "../models/LawyerProfile.js";
import ConsultationRequest from "../models/ConsultationRequest.js";
import CaseChatRoom from "../models/CaseChatRoom.js";
import LawyerReview from "../models/LawyerReview.js";
import { updateLawyerRatingSummary } from "../services/lawyerRatingService.js";



export const createConsultationRequest = async (req, res) => {
  try {
    const user = req.user;
    const { firId, lawyerProfileId, initialMessage } = req.body;

    if (user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can request consultation",
      });
    }

    const fir = await FIR.findById(firId).populate("citizenId", "name email");
    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    if (String(fir.citizenId._id) !== String(user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can request consultation only for your own FIR",
      });
    }

    if (!["accepted", "investigating"].includes(fir.status)) {
      return res.status(400).json({
        success: false,
        message: "Consultation can be requested only for accepted or investigating FIRs",
      });
    }

    const lawyerProfile = await LawyerProfile.findById(lawyerProfileId).populate(
      "userId",
      "name email phone role"
    );

    if (!lawyerProfile) {
      return res.status(404).json({
        success: false,
        message: "Lawyer profile not found",
      });
    }

    if (lawyerProfile.verificationStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Lawyer is not approved yet",
      });
    }

    if (lawyerProfile.availabilityStatus !== "available") {
      return res.status(400).json({
        success: false,
        message: "Lawyer is currently unavailable",
      });
    }

    const existingRequest = await ConsultationRequest.findOne({
      firId,
      citizenId: user._id,
      lawyerUserId: lawyerProfile.userId._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Consultation request already exists for this FIR and lawyer",
      });
    }

    const consultationRequest = await ConsultationRequest.create({
      firId: fir._id,
      citizenId: user._id,
      lawyerUserId: lawyerProfile.userId._id,
      lawyerProfileId: lawyerProfile._id,
      caseType: fir.incident.category,
      initialMessage: initialMessage || "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Consultation request sent successfully",
      request: consultationRequest,
    });
  } catch (error) {
    console.error("createConsultationRequest error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create consultation request",
    });
  }
};

export const respondToConsultationRequest = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { action, responseMessage } = req.body;

    if (user.role !== "lawyer") {
      return res.status(403).json({
        success: false,
        message: "Only lawyers can respond to consultation requests",
      });
    }

    if (!["accepted", "declined"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be accepted or declined",
      });
    }

    const consultationRequest = await ConsultationRequest.findById(id)
      .populate("lawyerUserId", "name email")
      .populate("citizenId", "name email")
      .populate("firId");

    if (!consultationRequest) {
      return res.status(404).json({
        success: false,
        message: "Consultation request not found",
      });
    }

    if (String(consultationRequest.lawyerUserId._id) !== String(user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can respond only to your own consultation requests",
      });
    }

    if (consultationRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This request is already ${consultationRequest.status}`,
      });
    }

    consultationRequest.status = action;
    consultationRequest.respondedAt = new Date();
    consultationRequest.responseMessage = responseMessage || "";
    await consultationRequest.save();

    let chatRoom = null;

    if (action === "accepted") {
      chatRoom = await CaseChatRoom.findOne({
        consultationRequestId: consultationRequest._id,
      });

      if (!chatRoom) {
        chatRoom = await CaseChatRoom.create({
          chatRoomId: `fir-${consultationRequest.firId._id}-lawyer-${crypto.randomBytes(6).toString("hex")}`,
          firId: consultationRequest.firId._id,
          consultationRequestId: consultationRequest._id,
          citizenId: consultationRequest.citizenId._id,
          lawyerUserId: consultationRequest.lawyerUserId._id,
          status: "active",
          lastMessageAt: new Date(),
        });
      }
    }

    return res.status(200).json({
      success: true,
      message:
        action === "accepted"
          ? "Consultation request accepted and chat room created"
          : "Consultation request declined",
      request: consultationRequest,
      chatRoom,
    });
  } catch (error) {
    console.error("respondToConsultationRequest error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to respond to consultation request",
    });
  }
};



export const completeConsultation = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const consultationRequest = await ConsultationRequest.findById(id)
      .populate("citizenId", "name email")
      .populate("lawyerUserId", "name email");

    if (!consultationRequest) {
      return res.status(404).json({
        success: false,
        message: "Consultation request not found",
      });
    }

    const isCitizen =
      String(consultationRequest.citizenId._id) === String(user._id);
    const isLawyer =
      String(consultationRequest.lawyerUserId._id) === String(user._id);

    if (!isCitizen && !isLawyer) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to complete this consultation",
      });
    }

    if (consultationRequest.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: `Only accepted consultations can be completed. Current status: ${consultationRequest.status}`,
      });
    }

    consultationRequest.status = "completed";
    consultationRequest.respondedAt = consultationRequest.respondedAt || new Date();
    await consultationRequest.save();

    const chatRoom = await CaseChatRoom.findOne({
      consultationRequestId: consultationRequest._id,
    });

    if (chatRoom) {
      chatRoom.status = "closed";
      await chatRoom.save();
    }

    if (req.io && chatRoom) {
      req.io.to(`room:${chatRoom._id}`).emit("chat:room-closed", {
        roomId: chatRoom._id,
        consultationRequestId: consultationRequest._id,
        status: "closed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Consultation marked as completed",
      consultation: consultationRequest,
      chatRoom: chatRoom || null,
    });
  } catch (error) {
    console.error("completeConsultation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to complete consultation",
    });
  }
};


export const submitConsultationReview = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    const consultationRequest = await ConsultationRequest.findById(id)
      .populate("citizenId", "name email")
      .populate("lawyerUserId", "name email");

    if (!consultationRequest) {
      return res.status(404).json({
        success: false,
        message: "Consultation request not found",
      });
    }

    const isCitizen =
      String(consultationRequest.citizenId._id) === String(user._id);
    const isLawyer =
      String(consultationRequest.lawyerUserId._id) === String(user._id);

    if (!isCitizen && !isLawyer) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to review this consultation",
      });
    }

    if (consultationRequest.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Review can only be submitted after consultation is completed",
      });
    }

    const lawyerProfile = await LawyerProfile.findOne({
      userId: consultationRequest.lawyerUserId._id,
    });

    if (!lawyerProfile) {
      return res.status(404).json({
        success: false,
        message: "Lawyer profile not found",
      });
    }

    const existingReview = await LawyerReview.findOne({
      consultationRequestId: consultationRequest._id,
      reviewerId: user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this consultation",
      });
    }

    const review = await LawyerReview.create({
      consultationRequestId: consultationRequest._id,
      firId: consultationRequest.firId,
      lawyerProfileId: lawyerProfile._id,
      lawyerUserId: consultationRequest.lawyerUserId._id,
      reviewerId: user._id,
      reviewerRole: user.role,
      rating: numericRating,
      reviewText: reviewText || "",
    });

    if (user.role === "citizen") {
      await updateLawyerRatingSummary(lawyerProfile._id);
    }

    return res.status(201).json({
      success: true,
      message:
        user.role === "citizen"
          ? "Review submitted successfully and lawyer rating updated"
          : "Feedback submitted successfully",
      review,
    });
  } catch (error) {
    console.error("submitConsultationReview error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
};

// src/controllers/consultationController.js
export const getIncomingConsultationRequests = async (req, res) => {
  try {
    const user = req.user;
    const status = req.query.status || "pending";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 20);
    const skip = (page - 1) * limit;

    if (user.role !== "lawyer") {
      return res.status(403).json({
        success: false,
        message: "Only lawyers can access incoming consultation requests",
      });
    }

    const query = {
      lawyerUserId: user._id,
    };

    if (status !== "all") {
      query.status = status;
    }

    const [requests, total] = await Promise.all([
      ConsultationRequest.find(query)
        .populate("citizenId", "name email phone")
        .populate(
          "firId",
          "firNumber status incident.title incident.category incident.description incident.address incident.dateTime"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ConsultationRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      requests,
    });
  } catch (error) {
    console.error("getIncomingConsultationRequests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch incoming consultation requests",
    });
  }
};



export const getCitizenConsultations = async (req, res) => {
  try {
    const user = req.user;
    const status = req.query.status || "all";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 20);
    const skip = (page - 1) * limit;

    if (user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can access consultation history",
      });
    }

    const query = { citizenId: user._id };

    if (status !== "all") {
      query.status = status;
    }

    const [consultations, total] = await Promise.all([
      ConsultationRequest.find(query)
        .populate("lawyerUserId", "name email phone")
        .populate(
          "firId",
          "firNumber status incident.title incident.category incident.description incident.address incident.dateTime"
        )
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ConsultationRequest.countDocuments(query),
    ]);

    const consultationIds = consultations.map((item) => item._id);

    const chatRooms = await CaseChatRoom.find({
      consultationRequestId: { $in: consultationIds },
    }).select("_id consultationRequestId status lastMessageAt createdAt updatedAt");

    const chatRoomMap = new Map(
      chatRooms.map((room) => [String(room.consultationRequestId), room])
    );

    const result = consultations.map((consultation) => {
      const room = chatRoomMap.get(String(consultation._id));

      return {
        _id: consultation._id,
        status: consultation.status,
        consultationMode: consultation.consultationMode || null,
        message: consultation.message || "",
        declineReason: consultation.declineReason || null,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
        respondedAt: consultation.respondedAt || null,
        fir: consultation.firId,
        lawyer: consultation.lawyerUserId,
        chatRoom: room
          ? {
              _id: room._id,
              status: room.status,
              lastMessageAt: room.lastMessageAt || null,
              createdAt: room.createdAt,
              updatedAt: room.updatedAt,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      consultations: result,
    });
  } catch (error) {
    console.error("getCitizenConsultations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch citizen consultations",
    });
  }
};


export const getLawyerConsultationHistory = async (req, res) => {
  try {
    const user = req.user;
    const status = req.query.status || "all";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 20);
    const skip = (page - 1) * limit;

    if (user.role !== "lawyer") {
      return res.status(403).json({
        success: false,
        message: "Only lawyers can access consultation history",
      });
    }

    const query = {
      lawyerUserId: user._id,
    };

    if (status === "all") {
      query.status = { $in: ["accepted", "declined", "completed"] };
    } else {
      query.status = status;
    }

    const [consultations, total] = await Promise.all([
      ConsultationRequest.find(query)
        .populate("citizenId", "name email phone")
        .populate(
          "firId",
          "firNumber status incident.title incident.category incident.description incident.address incident.dateTime"
        )
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ConsultationRequest.countDocuments(query),
    ]);

    const consultationIds = consultations.map((item) => item._id);

    const chatRooms = await CaseChatRoom.find({
      consultationRequestId: { $in: consultationIds },
    }).select("_id consultationRequestId status lastMessageAt createdAt updatedAt");

    const chatRoomMap = new Map(
      chatRooms.map((room) => [String(room.consultationRequestId), room])
    );

    const result = consultations.map((consultation) => {
      const room = chatRoomMap.get(String(consultation._id));

      return {
        _id: consultation._id,
        status: consultation.status,
        consultationMode: consultation.consultationMode || null,
        message: consultation.message || "",
        declineReason: consultation.declineReason || null,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
        respondedAt: consultation.respondedAt || null,
        fir: consultation.firId,
        citizen: consultation.citizenId,
        chatRoom: room
          ? {
              _id: room._id,
              status: room.status,
              lastMessageAt: room.lastMessageAt || null,
              createdAt: room.createdAt,
              updatedAt: room.updatedAt,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      consultations: result,
    });
  } catch (error) {
    console.error("getLawyerConsultationHistory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lawyer consultation history",
    });
  }
};
