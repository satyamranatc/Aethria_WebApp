import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/dbConfig.js";

import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import ttsRoutes from "./routes/ttsRoutes.js";
import diagramRoutes from "./routes/diagramRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

// Production JWT security check
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "voicebox_jwt_fallback_key")) {
  console.warn("⚠️ [SECURITY WARNING]: JWT_SECRET is not configured or using fallback key in production. Please set a strong JWT_SECRET.");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for hosted reverse-proxies (Render, Vercel, Cloudflare)
app.set("trust proxy", 1);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

// Response Compression (Gzip) for faster API payloads
app.use(compression());

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again after 15 minutes." }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded for AI generation. Please slow down." }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
});

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://www.aethria.in",
  "https://aethria.in",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".aethria.in") ||
        origin === "https://aethria.in" ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  })
);

app.use(generalLimiter);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to database
connectDB();

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Aethria Intelligence API is live", status: "healthy" });
});

// API Routes with tailored rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/chat", aiLimiter, chatRoutes);
app.use("/api/tts", aiLimiter, ttsRoutes);
app.use("/api/diagram", aiLimiter, diagramRoutes);
app.use("/api/projects", projectRoutes);

// Global Safe Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error occurred." : err.message
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
