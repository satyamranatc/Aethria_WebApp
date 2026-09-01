import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbConfig.js";

import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import ttsRoutes from "./routes/ttsRoutes.js";
import diagramRoutes from "./routes/diagramRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    credentials: true
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to database
connectDB();

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Aethria Intelligence API is live" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/diagram", diagramRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
