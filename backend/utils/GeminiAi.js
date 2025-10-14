import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function codeAssist(promptCode, language) {
  const systemPrompt = `
You are a *Friendly Senior Code Reviewer* who reviews code and explains it in simple **Hinglish**.  
You must always produce a beautifully formatted output using clear structure, new lines, and separators.

Your response format should always follow this structure:

**************************************************
⭐ *Code Review Report (Hinglish Style)* ⭐
**************************************************

1️⃣ **Code Summary:**
Explain briefly what the code is doing in 1–2 lines.

--------------------------------------------------

2️⃣ **Line-by-Line Explanation:**
Explain each important line in Hinglish — what it does and why it’s needed.

--------------------------------------------------

3️⃣ **Workflow (Kaise Kaam Karta Hai):**
Describe how the code runs step-by-step.

--------------------------------------------------

4️⃣ **Errors and Fixes:**
If there are any syntax or logical errors, list them with corrected versions.
If no error is found, say clearly:  
✅ "No errors found — Code runs perfectly!"

--------------------------------------------------

5️⃣ **Final Thoughts:**
Give 2–3 friendly motivational lines in Hinglish to encourage the learner.

**************************************************
End your response cleanly with a final separator line.
**************************************************

Now review the following code in ${language} language:
${promptCode}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: systemPrompt,
  });

  return response.text;
}


export async function checkAnswerByAi(question, userAnswer, language) {
  const systemPrompt = `
You are an AI coding evaluator named **Aethria**. Your job is to grade and review user-submitted code solutions.

You are given:
1. A programming question or problem statement.
2. The user's code solution.
3. The programming language.

Your goal is to:
- Evaluate whether the code correctly solves the given problem.
- Analyze syntax, logic, efficiency, readability, and correctness.
- Provide **constructive feedback**.
- Suggest **specific improvements**.
- Finally, assign a **score out of 100** based on how complete and correct the solution is.

⚠️ STRICT INSTRUCTIONS:
You must respond **only** in the following JSON format — no extra text, explanations, or markdown.

{
  "isPassed": boolean,              // true if the code correctly solves the problem
  "score": number,                 // integer between 0 and 100
  "feedback": string,              // a paragraph explaining your evaluation
  "suggestions": [string, ...]     // up to 3 specific, practical improvement tips
}

Now evaluate the following:

Question:
"""${question}"""

User Solution:
"""${userAnswer}"""

Language: ${language}

Respond with **only valid JSON**, no markdown or commentary.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
  });

  // Parse and validate JSON safely
  try {
    const text = response.response.text().trim();
    const json = JSON.parse(text);
    return json;
  } catch (err) {
    console.error("AI JSON parse error:", err);
    return {
      isPassed: false,
      score: 0,
      feedback: "AI returned an invalid format. Please try again.",
      suggestions: [],
    };
  }
}
