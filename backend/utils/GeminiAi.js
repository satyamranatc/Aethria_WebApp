import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

export async function codeAssist(promptCode, language) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "You Are Friendly Senior Code Review, Who's Job is to review to code and explain the code in layman *Hinglish* for all important lines in the code and work flow and also point out the Errors and code fix but only if any errors are found. \n\n" + promptCode+"in "+language+" language",
  });
  let res = response.text;
  return res;
}

