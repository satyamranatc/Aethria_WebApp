import { codeAssist, checkAnswerByAi } from "../utils/GeminiAi.js";
import Result from "../models/resultModel.js";

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

    if (!email || !question || !userAnswer) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get AI evaluation (expected JSON string or object)
    const evaluationResponse = await checkAnswerByAi(question, userAnswer, language);
      // Ensure the AI response is valid JSON
    let evaluation;
    try {
      evaluation = typeof evaluationResponse === "string"
        ? JSON.parse(evaluationResponse)
        : evaluationResponse;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return res.status(500).json({ 
        message: "Invalid AI response format", 
        error: parseError.message 
      });
    }

    // Save result in database
    const result = new Result({
      email,
      questionId,
      question,
      userAnswer,
      language,
      evaluation,
    });

    await result.save();

    return res.status(200).json({ 
      message: "Evaluation saved successfully", 
      evaluation 
    });

  } catch (error) {
    console.error("AI evaluation error:", error);
    return res.status(500).json({
      message: "Error evaluating answer",
      error: error.message,
    });
  }
};
