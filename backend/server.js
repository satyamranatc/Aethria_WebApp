import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Db from "./config/dbConfig.js";
import codeRoutes from "./routes/codeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import commandRoutes from "./routes/commandRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Initialize HTTP server for Socket.io
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Use env var or allow all for dev
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



  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Connect to MongoDB
Db();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Restrict in production
}));
app.use(express.json());

// Routes
app.use("/", codeRoutes);
app.use("/", aiRoutes);
app.use("/", authRoutes);
app.use("/", commandRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is live 🚀" });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});