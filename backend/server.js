import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Db from "./config/dbConfig.js";
import codeRoutes from "./routes/codeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Initialize HTTP server for Socket.io
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now (Frontend + VS Code Extension)
    methods: ["GET", "POST"]
  }
});

// Socket.io Logic
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User joins their email room
  socket.on("join_room", (data) => {
    if (data && data.email) {
      const room = data.email.toLowerCase();
      socket.join(room);
      console.log(`User with ID: ${socket.id} joined room: ${room}`);
      socket.emit("room_joined", { room });
    }
  });

  // Receive data (Code or Problem) from Frontend/Extension and forward it
  socket.on("send_data", (data) => {
    // data: { email, type: 'CODE' | 'PROBLEM', content, language }
    if (data && data.email) {
      const room = data.email.toLowerCase();
      
      // Forward to the specific user's room (except sender)
      socket.to(room).emit("receive_data", data);
      
      console.log(`Forwarded ${data.type} to room: ${room}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Connect to MongoDB
Db();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", codeRoutes);
app.use("/", aiRoutes);
app.use("/", authRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is live 🚀" });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});