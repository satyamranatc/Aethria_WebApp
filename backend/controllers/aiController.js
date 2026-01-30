import { codeAssist, checkAnswerByAi, explainCode, analyzeCodeFlow, processVoiceCommand } from "../utils/GeminiAi.js";
import Result from "../models/resultModel.js";
import mongoose from "mongoose";
import { HINGLISH_EXPLANATION_PROMPT } from "../utils/prompts.js";

// Ask Aethria AI for code assistance
export const askAethria = async (req, res) => {
  try {
    const isGetRequest = req.method === 'GET';
    const code = (req.body && req.body.code) || req.query.code;
    const language = (req.body && req.body.language) || req.query.language;

    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }

    const mode = (req.body && req.body.mode) || req.query.mode || (isGetRequest ? "explanation" : "chat");

    if (mode === "explanation") {
      // Automatic Hinglish Explanation for VS Code Extension or explicit requests
      const prompt = HINGLISH_EXPLANATION_PROMPT(language, code);
      const aiResponse = await codeAssist(prompt, language);
      return res.status(200).json({ response: aiResponse });
    }

    // Web App Flow
    // mode is already defined above

    if (mode === "voice") {
      const inputPayload = req.body.code || "";
      let transcript = inputPayload;
      let codeContext = "";

      if (inputPayload.length > 200 || inputPayload.includes("function") || inputPayload.includes("const ")) {
        codeContext = inputPayload;
        transcript = "Analyze this code/request";
      }

      const analysis = await processVoiceCommand(transcript, codeContext, language);
      return res.status(200).json({
        type: "ACTION",
        data: analysis.data
      });
    }

    // Default: Analysis/Chat for Web App
    const analysis = await analyzeCodeFlow(code, language);
    return res.status(200).json({
      type: "analysis",
      data: analysis
    });

  } catch (error) {
    console.error("[AskAethria] Error:", error.message);
    const status = error.status || 500;
    const message = status === 429 ? "Rate limited" : status === 503 ? "AI Service overloaded" : "Error processing request";
    return res.status(status).json({ message, error: error.message });
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

    // explainCode already returns a parsed object, no need for additional parsing
    const explanation = await explainCode(code);

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
