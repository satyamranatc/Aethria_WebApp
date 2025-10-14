import Code from "../models/codeModel.js";
import Result from "../models/resultModel.js";

// Upload new code
export const uploadCode = async (req, res) => {
  try {
    const { email, code, language } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const newCode = new Code({ email, code, language, sent: false });
    await newCode.save();

    return res.status(200).json({ 
      message: "Code uploaded successfully", 
      data: newCode 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ 
      message: "Error saving code", 
      error: error.message 
    });
  }
};

// Get one unsent code and mark it as sent
export const getCode = async (req, res) => {
  console.log("getCode");
  try {
    const { email } = req.query;
    console.log(email);
    
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

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
    return res.status(500).json({ 
      message: "Error fetching code", 
      error: error.message 
    });
  }
};

// Get all codes for a user
export const getAllCode = async (req, res) => {
  try {
    const { email } = req.query;
    console.log(email);
    
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const userCodes = await Code.find({ email }).sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      message: "Fetched user codes", 
      codes: userCodes 
    });
  } catch (error) {
    console.error("Get-code error:", error);
    return res.status(500).json({ 
      message: "Error fetching code", 
      error: error.message 
    });
  }
};

// Get all Result for a user
export const getAllResult = async (req, res) => {
  try {
    const { email } = req.query;
    console.log(email);
    
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const userResults = await Result.find({ email }).sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      message: "Fetched user results", 
      results: userResults 
    });
  } catch (error) {
    console.error("Get-code error:", error);
    return res.status(500).json({ 
      message: "Error fetching code", 
      error: error.message 
    });
  }
};