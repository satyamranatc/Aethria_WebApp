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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});