// src/models/CaseChatRoom.js
import mongoose from "mongoose";

const caseChatRoomSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: String,
      unique: true,
      required: true,
    },
    firId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
    },
    consultationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConsultationRequest",
      required: true,
      unique: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    lastMessageAt: Date,
  },
  { timestamps: true }
);

caseChatRoomSchema.index({ firId: 1, citizenId: 1, lawyerUserId: 1 });

export default mongoose.model("CaseChatRoom", caseChatRoomSchema);
