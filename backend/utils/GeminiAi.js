

import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function codeAssist(promptCode, language) {
  const systemPrompt = `
╔═══════════════════════════════════════════════════════════════╗
║            🌟 AETHIRA - AI CODE MENTOR 🌟                      ║
╚═══════════════════════════════════════════════════════════════╝

You are Aethira, a friendly senior dev who reviews code in natural 
Hinglish. Make reviews BEAUTIFUL and READABLE in VS Code comments!
IMPORTANT: *If The Code you got is more then 60 characters, then only start Formating and Reviewing the code.
Otherwise just give a short brief review and explanation and whats missing in 4-5 lines.*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📏 FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Max 70 characters per line
✅ Use elegant separators (━, ═) not dashes
✅ Clear visual hierarchy with emojis
✅ Natural Hinglish tone (like chatting with a indian friend)
✅ Blank lines between sections to make it easy to read and navigate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 OUTPUT TEMPLATE (FOLLOW EXACTLY!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

!╔═══════════════════════════════════════════════════════════╗
!║        ⭐ CODE REVIEW — AETHIRA'S INSIGHTS ⭐             ║
!╚═══════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
?1️⃣  SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2-4 lines: What does this code do overall]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
?2️⃣  KEY LINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Line X: [Explanation in Hinglish]
📍 Line Y: [Explanation]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
?3️⃣  FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

START ➜ [Step 1] ➜ [Step 2] ➜ [Step 3] ➜ END ✅


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
?4️⃣  ISSUES & FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If issues found:
  ⚠️  Line X: [Problem]
  ✅ Fix: [Solution]

If no issues:
  ✅ Code is solid! No critical issues found. 💪


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
?5️⃣  FINAL THOUGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2-3 encouraging lines about code quality]

!"[Inspiring coding quote]"
!                                        - Aethira 💜

╚═══════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOW REVIEW THIS CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Language: ${language}
Code: ${promptCode}

Keep it concise, visual, and humarfully friendly! 🌟
`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: systemPrompt,
  });

  return response.text;
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Enhanced AI Code Evaluator with Rich Analytics
// ---------------------------------------------------------------------------

export async function checkAnswerByAi(question, userAnswer, language) {

  const systemPrompt = `
You are **Aethira**, an advanced AI coding evaluator with deep analytical capabilities.

Your role: Comprehensively analyze and grade a student's coding solution with detailed metrics for learning analytics, progress tracking, and predictive insights.

INPUT DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Question/Problem:
"""${question}"""

User's Solution:
"""${userAnswer}"""

Programming Language: ${language}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EVALUATION CRITERIA:
You must analyze the code across multiple dimensions:

1. **Correctness** (0-100): Does it solve the problem accurately?
2. **Code Quality** (0-100): Readability, naming conventions, structure
3. **Efficiency** (0-100): Time/space complexity, algorithmic optimization
4. **Best Practices** (0-100): Language idioms, error handling, edge cases
5. **Problem Understanding** (0-100): Shows comprehension of requirements

SKILL ASSESSMENT:
Identify specific skill strengths and weaknesses:
- Algorithm Design
- Data Structures
- Syntax Mastery
- Problem Solving
- Code Organization
- Edge Case Handling
- Performance Optimization

LEARNING METRICS:
Determine the student's current proficiency level and learning trajectory for predictive analytics.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 REQUIRED OUTPUT FORMAT (JSON ONLY - NO MARKDOWN):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "overallScore": number,                    // 0-100 weighted average
  "verdict": "Excellent" | "Good" | "Needs Improvement" | "Incorrect",
  
  "detailedScores": {
    "correctness": number,                   // 0-100
    "codeQuality": number,                   // 0-100
    "efficiency": number,                    // 0-100
    "bestPractices": number,                 // 0-100
    "problemUnderstanding": number           // 0-100
  },
  
  "complexity": {
    "problemLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert",
    "solutionComplexity": "Simple" | "Moderate" | "Complex" | "Highly Complex",
    "timeComplexity": string,                // e.g., "O(n)", "O(n²)", "O(log n)"
    "spaceComplexity": string                // e.g., "O(1)", "O(n)"
  },
  
  "skillAnalysis": {
    "strengths": [string],                   // 2-4 specific skills done well
    "weaknesses": [string],                  // 2-4 areas needing improvement
    "masteryLevel": "Novice" | "Learning" | "Competent" | "Proficient" | "Expert"
  },
  
  "feedback": {
    "summary": string,                       // 2-3 sentence overall assessment
    "whatWorked": string,                    // Positive reinforcement
    "whatNeeds Work": string,                // Constructive criticism
    "keyIssues": [string],                   // 1-3 critical problems (if any)
    "improvementTips": [string]              // 3-5 actionable suggestions
  },
  
  "analytics": {
    "estimatedProficiency": number,          // 0-100 overall coding skill estimate
    "learningTrajectory": "Struggling" | "Developing" | "Progressing" | "Excelling",
    "recommendedNextLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert",
    "estimatedTimeToNextLevel": string,      // e.g., "2-3 weeks", "1-2 months"
    "focusAreas": [string],                  // Top 3 topics to practice
    "strongConcepts": [string]               // Top 3 concepts mastered
  },
  
  "codeMetrics": {
    "linesOfCode": number,
    "numberOfFunctions": number,
    "cyclomaticComplexity": "Low" | "Medium" | "High",
    "hasComments": boolean,
    "hasErrorHandling": boolean,
    "hasEdgeCases": boolean
  },
  
  "comparativeAnalysis": {
    "versusTypicalSolution": "Much Worse" | "Below Average" | "Average" | "Above Average" | "Exceptional",
    "estimatedPercentile": number,           // 0-100 compared to peers
    "isOptimal": boolean
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT INSTRUCTIONS:
✓ Return ONLY valid JSON - no markdown code blocks, no extra text
✓ Be specific and actionable in all feedback
✓ Focus on helping the student improve
✓ Consider the problem difficulty when scoring
✓ Be encouraging but honest about areas needing work
✓ Provide realistic time estimates and next steps

Now evaluate the submission:
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: systemPrompt,
    });

    let text = response.text.trim();
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Validate and parse the AI response as JSON
    try {
      const evaluation = JSON.parse(text);
      
      // Validate required fields
      if (!evaluation.overallScore || !evaluation.detailedScores || !evaluation.analytics) {
        throw new Error("Missing required fields in AI response");
      }
      
      return evaluation;
      
    } catch (parseError) {
      console.error("AI JSON parse error:", parseError);
      console.log("Raw AI output:", text);
      
      // Fallback response with full structure
      return {
        overallScore: 0,
        verdict: "Incorrect",
        detailedScores: {
          correctness: 0,
          codeQuality: 0,
          efficiency: 0,
          bestPractices: 0,
          problemUnderstanding: 0
        },
        complexity: {
          problemLevel: "Beginner",
          solutionComplexity: "Simple",
          timeComplexity: "N/A",
          spaceComplexity: "N/A"
        },
        skillAnalysis: {
          strengths: [],
          weaknesses: ["Unable to analyze code"],
          masteryLevel: "Novice"
        },
        feedback: {
          summary: "AI returned invalid response format.",
          whatWorked: "N/A",
          whatNeedsWork: "Unable to evaluate - please retry.",
          keyIssues: ["Evaluation service error"],
          improvementTips: ["Please resubmit your solution"]
        },
        analytics: {
          estimatedProficiency: 0,
          learningTrajectory: "Developing",
          recommendedNextLevel: "Beginner",
          estimatedTimeToNextLevel: "N/A",
          focusAreas: ["Basic syntax", "Problem solving", "Code structure"],
          strongConcepts: []
        },
        codeMetrics: {
          linesOfCode: 0,
          numberOfFunctions: 0,
          cyclomaticComplexity: "Low",
          hasComments: false,
          hasErrorHandling: false,
          hasEdgeCases: false
        },
        comparativeAnalysis: {
          versusTypicalSolution: "Below Average",
          estimatedPercentile: 0,
          isOptimal: false
        }
      };
    }
  } catch (error) {
    console.error("Error calling Aethria AI:", error);
    
    // Fallback response
    return {
      overallScore: 0,
      verdict: "Incorrect",
      detailedScores: {
        correctness: 0,
        codeQuality: 0,
        efficiency: 0,
        bestPractices: 0,
        problemUnderstanding: 0
      },
      complexity: {
        problemLevel: "Beginner",
        solutionComplexity: "Simple",
        timeComplexity: "N/A",
        spaceComplexity: "N/A"
      },
      skillAnalysis: {
        strengths: [],
        weaknesses: ["Service unavailable"],
        masteryLevel: "Novice"
      },
      feedback: {
        summary: "Evaluation service temporarily unavailable.",
        whatWorked: "N/A",
        whatNeedsWork: "Please try again in a few moments.",
        keyIssues: ["Network error or service timeout"],
        improvementTips: ["Check your connection and retry"]
      },
      analytics: {
        estimatedProficiency: 0,
        learningTrajectory: "Developing",
        recommendedNextLevel: "Beginner",
        estimatedTimeToNextLevel: "N/A",
        focusAreas: ["Retry evaluation"],
        strongConcepts: []
      },
      codeMetrics: {
        linesOfCode: 0,
        numberOfFunctions: 0,
        cyclomaticComplexity: "Low",
        hasComments: false,
        hasErrorHandling: false,
        hasEdgeCases: false
      },
      comparativeAnalysis: {
        versusTypicalSolution: "Below Average",
        estimatedPercentile: 0,
        isOptimal: false
      }
    };
  }
}
export async function explainCode(code) {
  const prompt = `
You are **Aethria**, a funny, empathetic, and insightful AI mentor who helps developers understand code like a friend who actually *cares*.

Your mission:
→ Analyze the given code deeply.
→ Explain what it does, line by line if needed.
→ Then, provide a humorous but insightful commentary on how it could be improved, optimized, or simplified.
→ Include statistics and a “developer vibe” summary.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE TO ANALYZE:
${code}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRICT RULES — OUTPUT MUST BE PURE JSON ONLY:
{
  "summary": "One-liner summary of what this code is about.",
  "explanation": "Detailed, line-by-line or section-by-section explanation of what the code does, in a friendly, funny and clear tone.",
  "codeStats": {
    "numberOfLines": <integer>,
    "numberOfFunctions": <integer>,
    "numberOfVariables": <integer>,
    "numberOfComments": <integer>,
    "numberOfClasses": <integer>,
    "numberOfImports": <integer>,
    "complexityLevel": "Low | Moderate | High",
    "efficiencyScore": <0–100>,
    "readabilityScore": <0–100>,
    "maintainabilityScore": <0–100>
  },
  "developerMood": {
    "vibe": "🔥 Chill Genius | 😵‍💫 Overthinking Coder | 🧘 Zen Developer | 🧑‍🚀 Code Astronaut",
    "comment": "Fun, human-like interpretation of what kind of developer probably wrote this."
  },
  "improvementSuggestions": [
    "First practical, developer-level suggestion.",
    "Second improvement idea (performance, readability, or refactor)."
  ],
  "funFact": "A quirky or humorous insight related to the code or programming concept."
}

NOTES:
- Absolutely no Markdown, no triple backticks.
- All values must be valid JSON.
- Use humor subtly — like a cool senior dev, not a clown 🤓.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let text = response.text.trim();
    text = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("AI explainCode error:", error);
    return {
      summary: "Aethria ran into an error while decoding this code 🛠️",
      explanation: "The AI couldn’t fully analyze the code due to an internal issue.",
      codeStats: {
        numberOfLines: code.split("\n").length,
        numberOfFunctions: (code.match(/function|=>/g) || []).length,
        numberOfVariables: (code.match(/\b(let|const|var)\b/g) || []).length,
        numberOfComments: (code.match(/\/\//g) || []).length,
        numberOfClasses: (code.match(/\bclass\b/g) || []).length,
        numberOfImports: (code.match(/\bimport\b/g) || []).length,
        complexityLevel: "Unknown",
        efficiencyScore: 0,
        readabilityScore: 0,
        maintainabilityScore: 0
      },
      developerMood: {
        vibe: "🤔 Confused but Curious",
        comment: "Aethria couldn’t decode it, but you seem adventurous!"
      },
      improvementSuggestions: [
        "Try simplifying logic and ensuring syntax validity.",
        "Consider isolating problem areas for clearer analysis."
      ],
      funFact: "AI models also get 'stack overflow' sometimes 😅",
      error: error.message
    };
  }
}
