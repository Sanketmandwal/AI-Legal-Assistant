// src/models/ChatMessage.js
import mongoose from "mongoose";

const chatAttachmentSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true },
    filename: { type: String, required: true },
    resourceType: {
      type: String,
      enum: ["image", "raw", "video"],
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaseChatRoom",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["citizen", "lawyer"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "file", "text_file"],
      default: "text",
    },
    text: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
    attachments: [chatAttachmentSchema],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
