// src/socket/chatSocket.js
import jwt from "jsonwebtoken";
import CaseChatRoom from "../models/CaseChatRoom.js";

const canAccessRoom = (room, userId) => {
  return (
    String(room.citizenId) === String(userId) ||
    String(room.lawyerUserId) === String(userId)
  );
};

export const registerChatSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id;

    socket.on("chat:join-room", async ({ roomId }) => {
      try {
        const room = await CaseChatRoom.findById(roomId);

        if (!room) {
          return socket.emit("chat:error", { message: "Room not found" });
        }

        if (!canAccessRoom(room, userId)) {
          return socket.emit("chat:error", { message: "Access denied" });
        }

        socket.join(`room:${roomId}`);
        socket.emit("chat:joined", { roomId });
      } catch (error) {
        socket.emit("chat:error", { message: "Failed to join room" });
      }
    });

    socket.on("chat:typing", async ({ roomId, isTyping }) => {
      try {
        const room = await CaseChatRoom.findById(roomId);

        if (!room || !canAccessRoom(room, userId)) return;

        socket.to(`room:${roomId}`).emit("chat:typing", {
          roomId,
          userId,
          isTyping,
        });
      } catch (error) {}
    });

    socket.on("disconnect", () => {});
  });
};
