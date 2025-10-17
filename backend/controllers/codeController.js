import Code from "../models/codeModel.js";
import Result from "../models/resultModel.js";
import Solution from "../models/solutionModel.js";


// Upload new code by React
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
  console.log("Hi By result");
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


// Extension uploads solution every 3-4s
export const uploadSolution = async (req, res) => {
  try {
    const { email, code, language } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    // Update or create latest solution
    const solution = await Solution.findOneAndUpdate(
      { email },
      { code, language, fetched: false, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ 
      message: "Solution uploaded successfully", 
      data: solution 
    });
  } catch (error) {
    console.error("Upload solution error:", error);
    return res.status(500).json({ 
      message: "Error saving solution", 
      error: error.message 
    });
  }
};

// React fetches user's latest solution
export const getSolution = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const solution = await Solution.findOneAndUpdate(
      { email, fetched: false },
      { fetched: true },
      { new: true }
    );

    if (!solution) {
      return res.status(200).json({ 
        message: "No new solution", 
        code: null 
      });
    }

    return res.status(200).json({ 
      message: "Fetched solution", 
      code: solution.code,
      language: solution.language 
    });
  } catch (error) {
    console.error("Get solution error:", error);
    return res.status(500).json({ 
      message: "Error fetching solution", 
      error: error.message 
    });
  }
};
