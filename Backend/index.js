// src/index.js
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./services/mongo.js";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import lawyerRoutes from "./routes/lawyerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import policeRoutes from "./routes/policeRoutes.js";
import firRoutes from "./routes/firRoutes.js";
import citizenRoutes from "./routes/citizenRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { registerChatSocket } from "./socket/chatSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

connectDB().catch((err) => console.error("DB connection error:", err));

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/", (req, res) => {
  res.send("API is running....");
});

app.use("/api/auth", authRoutes);
app.use("/api/lawyer", lawyerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/fir", firRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/chat", chatRoutes);

registerChatSocket(io);

server.listen(PORT, () => console.log("Server Started on port", PORT));
