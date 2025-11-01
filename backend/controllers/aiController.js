import { codeAssist, checkAnswerByAi,explainCode } from "../utils/GeminiAi.js";
import Result from "../models/resultModel.js";
import mongoose from "mongoose";

// Ask Aethria AI for code assistance
export const askAethria = async (req, res) => {
  try {
    const { code, language } = req.query;

    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }

    const response = await codeAssist(code, language);
    return res.status(200).json({ response });

  } catch (error) {
    console.error("AI error:", error);
    return res.status(500).json({ 
      message: "Error processing request", 
      error: error.message 
    });
  }
};

// Evaluate user's answer and save result
export const checkAnswer = async (req, res) => {
  try {
    const { email, questionId, question, userAnswer, language } = req.body;

    // Validate required fields
    if (!email || !question || !userAnswer) {
      return res.status(400).json({ 
        message: "Missing required fields: email, question, userAnswer" 
      });
    }

    if (!language) {
      return res.status(400).json({ 
        message: "Programming language is required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format" 
      });
    }

    // Get AI evaluation
    let evaluation;
    try {
      const evaluationResponse = await checkAnswerByAi(question, userAnswer, language);
      
      // Handle both string and object responses from AI
      evaluation = typeof evaluationResponse === "string"
        ? JSON.parse(evaluationResponse)
        : evaluationResponse;

      // Validate evaluation structure
      if (!evaluation.overallScore || !evaluation.verdict || !evaluation.detailedScores) {
        throw new Error("AI response missing required evaluation fields");
      }

    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return res.status(500).json({ 
        message: "Invalid AI response format",
        error: parseError.message,
        details: "The AI evaluation could not be processed. Please try again."
      });
    }

    // ✅ FIX: Validate and sanitize questionId before saving
    let validQuestionId = null;
    if (questionId) {
      // Check if questionId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(questionId)) {
        // Further check if it's a proper 24-char hex string
        if (String(questionId).match(/^[0-9a-fA-F]{24}$/)) {
          validQuestionId = questionId;
        }
      }
    }

    // Create and save result document
    const result = new Result({
      email: email.toLowerCase(),
      questionId: validQuestionId, // ✅ Use validated ObjectId or null
      question: question.trim(),
      userAnswer: userAnswer.trim(),
      language: language.trim(),
      evaluation, // Full evaluation object with all nested schemas
    });

    await result.save();

    // Return success with evaluation details
    return res.status(201).json({ 
      message: "Evaluation saved successfully",
      success: true,
      data: {
        resultId: result._id,
        email: result.email,
        verdict: evaluation.verdict,
        overallScore: evaluation.overallScore,
        evaluation: {
          detailedScores: evaluation.detailedScores,
          complexity: evaluation.complexity,
          skillAnalysis: evaluation.skillAnalysis,
          feedback: evaluation.feedback,
          analytics: evaluation.analytics,
          codeMetrics: evaluation.codeMetrics,
          comparativeAnalysis: evaluation.comparativeAnalysis,
        }
      }
    });

  } catch (error) {
    console.error("Evaluation error:", error);
    
    // Handle specific MongoDB validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: Object.values(error.errors).map(err => err.message),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This submission already exists",
        error: error.message,
      });
    }

    // Generic error response
    return res.status(500).json({
      message: "Error evaluating answer",
      error: error.message,
      details: "Please try again later"
    });
  }
};
export async function explain_Code(req, res) {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }

    const response = await explainCode(code);

    // Ensure the response is a string before processing
    let cleanedResponse;

    if (typeof response === "string") {
      cleanedResponse = response
        .replace(/```json\s*/g, "")
        .replace(/```/g, "")
        .trim();
    } else if (typeof response === "object") {
      // If already a JSON object, just use it directly
      cleanedResponse = JSON.stringify(response);
    } else {
      throw new Error("Unexpected response type from explainCode()");
    }

    // Parse safely
    const explanation = JSON.parse(cleanedResponse);

    return res.status(200).json({ 
      success: true,
      data: explanation 
    });

  } catch (error) {
    console.error("AI error:", error);
    return res.status(500).json({ 
      message: "Error processing request", 
      error: error.message 
    });
  }
}
