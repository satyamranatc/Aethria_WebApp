import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { codeAssist } from "./utils/GeminiAi.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());


let codeQueue = [];

function enQueueCode(code) {
  codeQueue.push(code);
}

function deQueueCode() {
  return codeQueue.shift();
}


app.post("/upload-code", (req, res) => {
  const code = req.body;
  console.log(code);
  enQueueCode(code);
  return res.status(200).json({ message: "Code uploaded successfully" });
})

app.get("/get-code", (req, res) => {
  const code = deQueueCode();
  console.log(code);
  return res.status(200).json({ message: "Code sent successfully to Vs-Code", code });
})

// Add this route to your Express server
app.get("/ask-aethria", async (req, res) => {
  try {
    const { code, language } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }
    
    // TODO: Integrate with Aethria AI or your AI service here
    const response = await codeAssist(code, language);
    const aethraResponse = `${response}`;
    
    return res.status(200).json({ 
      response: aethraResponse 
    });
  } catch (error) {
    return res.status(500).json({ message: "Error processing request", error: error.message });
  }
});


// ======================= HEALTH CHECK =======================
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is live 🚀" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
