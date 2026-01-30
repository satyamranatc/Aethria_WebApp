
import { HINGLISH_EXPLANATION_PROMPT } from './utils/prompts.js';
import { codeAssist } from './utils/GeminiAi.js';

async function testPrompt() {
  const codeWithBug = `
function addNumbers(a, b) {
  return a - b; // Should be addition
}

function getUserEmail(user) {
  return user.email; // Potential null pointer if user is null
}
  `;

  const language = 'javascript';
  const prompt = HINGLISH_EXPLANATION_PROMPT(language, codeWithBug);
  
  console.log("--- GENERATED PROMPT ---");
  console.log(prompt);
  console.log("\n--- AI RESPONSE (SIMULATED OR REAL) ---");
  
  try {
    const response = await codeAssist(prompt, language);
    console.log(response);
  } catch (err) {
    console.error("Error calling codeAssist:", err.message);
  }
}

testPrompt();
