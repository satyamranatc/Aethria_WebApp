import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Db from "./config/dbConfig.js";
import { codeAssist } from "./utils/GeminiAi.js";
import Code from "./models/codeModel.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Connect to MongoDB
Db();

app.use(cors());
app.use(express.json());

// =======================================================
// POST /upload-code
// =======================================================
app.post("/upload-code", async (req, res) => {
  try {
    const { email, code, language } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const newCode = new Code({ email, code, language, sent: false });
    await newCode.save();

    return res.status(200).json({ message: "Code uploaded successfully", data: newCode });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Error saving code", error: error.message });
  }
});

// =======================================================
// GET /get-code?email=xyz@gmail.com
// Returns ONE unsent code and marks it as sent
// =======================================================
app.get("/get-code", async (req, res) => {
  console.log("getCode");
  try {
    const { email } = req.query;
    console.log(email);
    
    if (!email) return res.status(400).json({ message: "Email required" });

    console.log(`📨 Polling for ${email}`);
    
    // Find the first unsent code for this user
    const code = await Code.findOneAndUpdate(
      { email, sent: false },
      { sent: true },
      { new: true }
    );

    if (!code) {
      console.log(`✅ No new codes for ${email}`);
      return res.status(200).json({ message: "No new codes", code: null });
    }

    console.log(`✅ Found code for ${email}: ${code.code.substring(0, 30)}...`);

    return res.status(200).json({ 
      message: "Fetched user code", 
      code: {
        q: code.code,
        hint: code.language || "javascript"
      }
    });
  } catch (error) {
    console.error("Get-code error:", error);
    return res.status(500).json({ message: "Error fetching code", error: error.message });
  }
});

// =======================================================
// GET /all-code - Get all codes for a user (including sent)
// =======================================================
app.get("/all-code", async (req, res) => {
  try {
    const { email } = req.query;
    console.log(email);
    if (!email) return res.status(400).json({ message: "Email required" });
    const userCodes = await Code.find({ email }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Fetched user codes", codes: userCodes });
  } catch (error) {
    console.error("Get-code error:", error);
    return res.status(500).json({ message: "Error fetching code", error: error.message });
  }
});

// =======================================================
// GET /ask-aethria
// =======================================================
app.get("/ask-aethria", async (req, res) => {
  try {
    const { code, language } = req.query;

    if (!code) return res.status(400).json({ message: "No code provided" });

    const response = await codeAssist(code, language);
    return res.status(200).json({ response });
  } catch (error) {
    console.error("AI error:", error);
    return res.status(500).json({ message: "Error processing request", error: error.message });
  }
});

// Add this endpoint to your backend
app.get('/oauth-config', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost' // Can be dynamic too
  });
});

// =======================================================
// HEALTH CHECK
// =======================================================
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is live 🚀" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});