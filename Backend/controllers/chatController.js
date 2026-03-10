// src/controllers/chatController.js
import CaseChatRoom from "../models/CaseChatRoom.js";
import ChatMessage from "../models/ChatMessage.js";
import cloudinary from "../config/cloudinary.js";
import { generateSecureEvidenceUrl } from "../services/firEvidenceService.js";
import mongoose from "mongoose";

const canAccessRoom = (room, user) => {
  return (
    String(room.citizenId) === String(user._id) ||
    String(room.lawyerUserId) === String(user._id)
  );
};

const mapMessageWithSignedUrls = (message) => {
  const plain = typeof message.toObject === "function" ? message.toObject() : message;

  return {
    ...plain,
    attachments: (plain.attachments || []).map((file) => ({
      ...file,
      signedUrl: generateSecureEvidenceUrl(file.publicId, file.resourceType),
    })),
  };
};

export const getChatRoomDetails = async (req, res) => {
  try {
    const user = req.user;
    const { roomId } = req.params;

    const room = await CaseChatRoom.findById(roomId)
      .populate("citizenId", "name email phone")
      .populate("lawyerUserId", "name email phone")
      .populate("firId", "firNumber incident.title incident.category status");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    if (!canAccessRoom(room, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this chat room",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("getChatRoomDetails error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch chat room details",
    });
  }
};


export const getChatMessages = async (req, res) => {
  try {
    const user = req.user;
    const { roomId } = req.params;
    const { before } = req.query;
    const limit = Math.min(Number(req.query.limit || 20), 50);

    const room = await CaseChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    if (!canAccessRoom(room, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these messages",
      });
    }

    const query = { roomId };

    if (before) {
      if (!mongoose.Types.ObjectId.isValid(before)) {
        return res.status(400).json({
          success: false,
          message: "Invalid before cursor",
        });
      }

      query._id = { $lt: new mongoose.Types.ObjectId(before) };
    }

    const rawMessages = await ChatMessage.find(query)
      .populate("senderId", "name email role")
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = rawMessages.length > limit;
    const pageMessages = hasMore ? rawMessages.slice(0, limit) : rawMessages;

    const orderedMessages = pageMessages
      .reverse()
      .map(mapMessageWithSignedUrls);

    const nextCursor =
      hasMore && orderedMessages.length > 0
        ? orderedMessages[0]._id
        : null;

    return res.status(200).json({
      success: true,
      roomId,
      limit,
      hasMore,
      nextCursor,
      messages: orderedMessages,
    });
  } catch (error) {
    console.error("getChatMessages error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch chat messages",
    });
  }
};



export const sendChatMessage = async (req, res) => {
  try {
    const user = req.user;
    const { roomId } = req.params;
    const text = (req.body.text || "").trim();

    const room = await CaseChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Chat room is closed",
      });
    }

    if (!canAccessRoom(room, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to send messages in this room",
      });
    }

    const files = req.files || [];
    const attachments = [];

    if (!text && files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message text or attachment is required",
      });
    }

    for (const file of files) {
      const resourceType =
        file.mimetype.startsWith("image/")
          ? "image"
          : file.mimetype.startsWith("video/")
          ? "video"
          : "raw";

      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: `secure/chat-rooms/${room._id}`,
        type: "authenticated",
        resource_type: resourceType,
      });

      attachments.push({
        publicId: uploaded.public_id,
        filename: file.originalname,
        resourceType,
        uploadedAt: new Date(),
      });
    }

    const senderRole =
      String(room.citizenId) === String(user._id) ? "citizen" : "lawyer";

    const messageType =
      text && attachments.length > 0
        ? "text_file"
        : attachments.length > 0
        ? "file"
        : "text";

    const message = await ChatMessage.create({
      roomId: room._id,
      senderId: user._id,
      senderRole,
      messageType,
      text,
      attachments,
      readBy: [{ userId: user._id, readAt: new Date() }],
    });

    room.lastMessageAt = new Date();
    await room.save();

    const populatedMessage = await ChatMessage.findById(message._id).populate(
      "senderId",
      "name email role"
    );

    const finalMessage = mapMessageWithSignedUrls(populatedMessage);

    if (req.io) {
      req.io.to(`room:${roomId}`).emit("chat:new-message", {
        roomId,
        message: finalMessage,
      });
    }

    return res.status(201).json({
      success: true,
      message: finalMessage,
    });
  } catch (error) {
    console.error("sendChatMessage error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};


export const markMessagesAsRead = async (req, res) => {
  try {
    const user = req.user;
    const { roomId } = req.params;

    const room = await CaseChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    if (!canAccessRoom(room, user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this room",
      });
    }

    await ChatMessage.updateMany(
      {
        roomId,
        senderId: { $ne: user._id },
        "readBy.userId": { $ne: user._id },
      },
      {
        $push: {
          readBy: {
            userId: user._id,
            readAt: new Date(),
          },
        },
      }
    );

    if (req.io) {
      req.io.to(`room:${roomId}`).emit("chat:read-updated", {
        roomId,
        userId: user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("markMessagesAsRead error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark messages as read",
    });
  }
};



export const getMyChatRooms = async (req, res) => {
  try {
    const user = req.user;

    if (!["citizen", "lawyer"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only citizens and lawyers can access chat rooms",
      });
    }

    const query =
      user.role === "citizen"
        ? { citizenId: user._id }
        : { lawyerUserId: user._id };

    const rooms = await CaseChatRoom.find(query)
      .populate("citizenId", "name email phone")
      .populate("lawyerUserId", "name email phone")
      .populate("firId", "firNumber incident.title incident.category incident.address status")
      .sort({ updatedAt: -1 });

    const roomIds = rooms.map((room) => room._id);

    const latestMessages = await ChatMessage.aggregate([
      {
        $match: {
          roomId: { $in: roomIds },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$roomId",
          latestMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    const unreadCounts = await ChatMessage.aggregate([
      {
        $match: {
          roomId: { $in: roomIds },
          senderId: { $ne: user._id },
          "readBy.userId": { $ne: user._id },
        },
      },
      {
        $group: {
          _id: "$roomId",
          unreadCount: { $sum: 1 },
        },
      },
    ]);

    const latestMessageMap = new Map(
      latestMessages.map((item) => [String(item._id), item.latestMessage])
    );

    const unreadCountMap = new Map(
      unreadCounts.map((item) => [String(item._id), item.unreadCount])
    );

    const result = rooms.map((room) => {
      const latestMessage = latestMessageMap.get(String(room._id));
      const unreadCount = unreadCountMap.get(String(room._id)) || 0;
      const isCitizen = user.role === "citizen";
      const otherParticipant = isCitizen ? room.lawyerUserId : room.citizenId;

      return {
        _id: room._id,
        chatRoomId: room.chatRoomId,
        status: room.status,
        lastMessageAt: room.lastMessageAt || room.updatedAt,
        unreadCount,
        fir: room.firId,
        otherParticipant,
        latestMessage: latestMessage
          ? {
              _id: latestMessage._id,
              senderId: latestMessage.senderId,
              senderRole: latestMessage.senderRole,
              messageType: latestMessage.messageType,
              text: latestMessage.text,
              attachmentsCount: latestMessage.attachments?.length || 0,
              createdAt: latestMessage.createdAt,
            }
          : null,
      };
    });

    result.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    return res.status(200).json({
      success: true,
      total: result.length,
      rooms: result,
    });
  } catch (error) {
    console.error("getMyChatRooms error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch chat rooms",
    });
  }
};

