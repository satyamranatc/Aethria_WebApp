import Result from "../models/resultModel.js";

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
