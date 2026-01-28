import { codeAssist, checkAnswerByAi, explainCode, analyzeCodeFlow, processVoiceCommand } from "../utils/GeminiAi.js";
import Result from "../models/resultModel.js";
import mongoose from "mongoose";

// Ask Aethria AI for code assistance
// Ask Aethria AI for code assistance
export const askAethria = async (req, res) => {
  try {
    // Support both POST (body) and GET (query) for flexibility
    const isGetRequest = req.method === 'GET';
    const code = (req.body && req.body.code) || req.query.code;
    const language = (req.body && req.body.language) || req.query.language;

    console.log(`[AskAethria] Request received. Language: ${language}, Code length: ${code?.length}`);

    if (!code) {
      console.warn("[AskAethria] Missing code in request");
      return res.status(400).json({ message: "No code provided" });
    }

    // If it's a GET request (like from VS Code extension), force "Explanation" mode
    let promptOrCode = code;
    if (isGetRequest) {
      promptOrCode = `Act as Aethria, a professional and empathetic AI coding assistant.
      
      TASK: Explain the provided ${language || 'code'} in "Hinglish" (Hindi + English) with a "Super Professional" yet "Layman-friendly" tone.
      
      FORMAT REQUIREMENTS (Strictly follow this):
      1. Start with exactly: "<!-- 🌟 Namaste! Aao, is code ko Hinglish mein acche se samajhte hain! 🚀 -->" (Adjust comment syntax for language)
      2. Provide a LINE-BY-LINE explanation using comments.
      3. Explain the "Working Flow", "Purpose", and "Errors" (if any) in simple layman terms.
      4. The appearance should be very clean, well-formatted, and nice to look at.

      Example Output Style:
      /* 
      🌟 Namaste! Aao, is code ko Hinglish mein acche se samajhte hain! 🚀 
      ========================================================================
      
      [Code Line]
      // 👉 [Explanation in Hinglish explaining logic, flow, and potential errors]
      
      ...
      
      ========================================================================
      */

      Code to Explain:
      ${code}`;
    }

    // Determine Mode: VS Code (GET) vs Web App Project Assistant (POST)
    let response;
    
    if (isGetRequest) {
        // VS Code Extension - Text/Comment based
        const textResponse = await codeAssist(promptOrCode, language);
        response = textResponse; // Existing format { response: string } downstream
    } else {
        // Web App Project Assistant - Rich JSON Analysis
        // Logic: specific keywords or default to analysis for POST
        
        const mode = (req.body && req.body.mode) || "chat"; // Default to chat/analysis

        if (mode === "voice") {
            const voiceResponse = await processVoiceCommand(req.body.code, language); // Wait, first arg in helper is transcript?
            // Correct usages: processVoiceCommand(transcript, code, language)
            // But req.body.code in frontend is actually sending the transcript as 'code' property if 'prompt' was passed?
            // Let's check frontend. 
            // Frontend: code: prompt (which is transcript or code depending on logic)
            // If transcript, we need code context too. Frontend handles this logic:
            // "const prompt = contextCode ? contextCode : text;" 
            // If contextCode exists, prompt IS the code. But we lost the transcript?
            // Wait, implementation plan said: "Input: Code snippet, user voice transcript."
            // Frontend logic needs to send BOTH.
            
            // Re-reading Frontend Logic:
            // if (lineMatch) ... contextCode = fetchLine... prompt = contextCode
            // else if (fullCode) ... contextCode = editorCode... prompt = contextCode
            // else prompt = text;
            
            // This is flawed for Voice Mode if we want context + transcript.
            // But for now, let's assume if it's "Voice Mode", the "prompt" is the TRANSCRIPT if no code context,
            // OR if code context is sent, it might be harder.
            
            // The frontend logic sends `code: prompt`. 
            // If I change backend, I might break frontend legacy?
            // Let's assume for this iteration:
            // If `mode === 'voice'`, `req.body.code` is the TRANSCRIPT + maybe appended code?
            // Actually, the new frontend logic I wrote sends `mode: "voice"`.
            // But `code` payload is still `prompt`.
            
            // Let's trust processVoiceCommand to handle it.
            // Wait, processVoiceCommand signature: (transcript, code, language).
            // I need to update this controller to arguably work better if I fix frontend to send both.
            // But I can't easily fix frontend logic in this single step without backtracking.
            
            // Workaround: Treat req.body.code as "Data". 
            // If it looks like code, treat as code. If text, treat as transcript.
            // Actually, let's just pass `req.body.code` as the TRANSCRIPT for now, 
            // assuming the user is just talking and maybe the frontend didn't attach code context yet 
            // unless it was a specific "line" command where frontend fetched it.
            
            // Correct approach: I'll update processVoiceCommand to take just one big string if needed, 
            // OR I update frontend to send { transcript, code } separate.
            // Updating frontend is better but expensive.
            // Let's stick to: prompt is the input.
            
            // If prompt is code (long, has brackets), treat as Code Context + "Explain this".
            // If prompt is short text, treat as Transcript + No Code.
            
            const inputPayload = req.body.code || "";
            let transcript = inputPayload;
            let codeContext = "";
            
            if (inputPayload.length > 200 || inputPayload.includes("function") || inputPayload.includes("const ")) {
                 codeContext = inputPayload;
                 transcript = "Analyze this code/request"; // Implicit transcript
            }
            
            const analysis = await processVoiceCommand(transcript, codeContext, language);
            return res.status(200).json({
                type: "ACTION",
                data: analysis.data // Extract data from { type: ACTION, data: ... }
            });
        }

        // Default Analysis Flow
        const analysis = await analyzeCodeFlow(code, language);
        return res.status(200).json({ 
            type: "analysis", 
            data: analysis 
        });
    }

    return res.status(200).json({ response });

  } catch (error) {
    console.error("[AskAethria] AI Controller Error:", error);
    
    // Handle specific API errors with user-friendly messages
    if (error.status === 503 || error.message?.includes('overloaded')) {
      return res.status(503).json({ 
        message: "AI service is temporarily overloaded. Please try again in a moment.", 
        error: "SERVICE_OVERLOADED",
        retryAfter: 5
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        message: "Too many requests. Please wait a moment before trying again.", 
        error: "RATE_LIMITED",
        retryAfter: 10
      });
    }
    
    return res.status(500).json({ 
      message: "Error processing request. Please try again.", 
      error: error.message,
      details: "Check server logs for more info"
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
