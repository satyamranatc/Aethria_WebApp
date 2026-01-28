export const HINGLISH_EXPLANATION_PROMPT = (language, code) => `Act as Aethria, a professional and empathetic AI coding assistant.
      
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

export const VOICE_COMMAND_PROMPT = (transcript, codeContext, language) => `
Analyze the following voice command for a coding assistant.
Transcript: "${transcript}"
Code Context: "${codeContext || 'None'}"
Language: "${language || 'javascript'}"

Identify the action requested and provide a structured response.
`;
