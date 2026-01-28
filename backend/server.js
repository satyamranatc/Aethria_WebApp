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

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://aethria-frontend.onrender.com",
    "https://aethria.in",
    "https://www.aethria.in",
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Pre-flight for all routes

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased limit for heavy polling in development
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Initialize HTTP server for Socket.io
import { createServer } from "http";
import { Server } from "socket.io";


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://aethria-frontend.onrender.com",
      "https://aethria.in",
      "https://www.aethria.in",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
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
// CORS already applied at the top
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