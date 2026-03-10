// src/routes/chatRoutes.js
import express from "express";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";
import {
  getChatRoomDetails,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
    getMyChatRooms,
} from "../controllers/chatController.js";
import chatUpload from "../middlewares/chatUpload.js";

const router = express.Router();

router.get(
  "/my-rooms",
  authMiddleware,
  requireRole(["citizen", "lawyer"]),
  getMyChatRooms
);

router.get(
  "/rooms/:roomId",
  authMiddleware,
  requireRole(["citizen", "lawyer"]),
  getChatRoomDetails
);

router.get(
  "/rooms/:roomId/messages",
  authMiddleware,
  requireRole(["citizen", "lawyer"]),
  getChatMessages
);

router.post(
  "/rooms/:roomId/messages",
  authMiddleware,
  requireRole(["citizen", "lawyer"]),
  chatUpload.array("attachments", 5),
  sendChatMessage
);

router.patch(
  "/rooms/:roomId/read",
  authMiddleware,
  requireRole(["citizen", "lawyer"]),
  markMessagesAsRead
);

export default router;
