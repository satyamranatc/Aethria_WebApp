import Groq from "groq-sdk";

export const handleChat = async (req, res) => {
  try {
    const { messages, temperature = 0.7, model = "openai/gpt-oss-120b", max_tokens = 2048 } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "A valid messages array is required." });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
      return res.status(500).json({
        error: "GROQ_API_KEY is not configured in backend/.env. Please configure your Groq API key."
      });
    }

    const groq = new Groq({ apiKey });

    // Aethria AI System Prompt
    const systemPrompt = {
      role: "system",
      content: `You are Aethria, an elite Principal Software Architect and Code Intelligence Engine developed by Satyam Rana. Powered by ultra-low-latency Groq LPUs.

CORE PRINCIPLES & MODULAR CODE ARCHITECTURE:
1. STRICT MODULAR DESIGN:
   - Never dump monolithic multi-thousand-line single files when building, extending, or refactoring features.
   - Decompose systems into clean, decoupled, single-responsibility modules:
     * Custom Hooks / State Management (\`src/hooks/...\` or \`services/...\`)
     * Dedicated UI Components (\`src/components/...\`)
     * Pure Utilities & Parsers (\`src/utils/...\`)
     * Data Contracts & Schemas (\`src/types/...\` or \`models/...\`)
     * API Controllers & Handlers (\`controllers/...\` or \`routes/...\`)

2. DIRECT FILE-BY-FILE EDITING FORMAT:
   - When suggesting new code or modifying existing files, always annotate each code block with its target file path and action:
     ### 📄 \`path/to/target/file.ext\` [Action: CREATE | UPDATE | PATCH]
   - Provide clean, drop-in ready modular code for that specific file so it can be directly applied to the codebase.
   - For modifications to existing files, provide the exact modular functions, hooks, or clean components without bloating unchanged code.

3. CONVERSATIONAL & REASONING GUIDELINES:
   - Dive STRAIGHT into the architectural solution, modular plan, or code immediately.
   - NEVER start responses with boilerplate intros (do NOT say "I am Aethria...", "Below you'll find...", "Here is the code...").
   - AVOID EMOJIS: Keep responses clean, professional, and elegant.
   - Explain the step-by-step connection between each module (how props, state, or APIs flow).
   - Only mention your identity or creator if the user explicitly asks "Who are you?" or "Who created you?".

4. CODE QUALITY & LANGUAGE FLUENCY:
   - Fluent in English, Indian English, and Hinglish. If the user prompts in Hinglish, respond in natural, professional Hinglish without emojis.
   - Format all code with proper markdown language fences (e.g. \`\`\`javascript, \`\`\`typescript, \`\`\`python, \`\`\`go, \`\`\`rust, \`\`\`sql).`
    };


    let selectedModel = model;
    let completion;

    try {
      completion = await groq.chat.completions.create({
        messages: [systemPrompt, ...messages],
        model: selectedModel,
        temperature: temperature,
        max_tokens: Math.min(max_tokens, 4096),
      });
    } catch (primaryErr) {
      console.warn(`Primary model ${selectedModel} failed, trying fallback openai/gpt-oss-20b:`, primaryErr.message);
      selectedModel = "openai/gpt-oss-20b";
      completion = await groq.chat.completions.create({
        messages: [systemPrompt, ...messages],
        model: selectedModel,
        temperature: temperature,
        max_tokens: Math.min(max_tokens, 4096),
      });
    }

    const reply = completion.choices[0]?.message?.content || "No response generated.";

    return res.json({
      success: true,
      message: {
        role: "assistant",
        content: reply
      },
      model: selectedModel,
      usage: completion.usage
    });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI response from Groq."
    });
  }
};

export const summarizeVoiceSession = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required for summary." });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    if (!apiKey) {
      return res.status(500).json({ error: "Groq API key is not configured." });
    }

    const groq = new Groq({ apiKey });

    const formattedConversation = messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => `${m.role === "user" ? "User" : "Aethria"}: ${m.content}`)
      .join("\n\n");

    const prompt = `You are an executive summarizer. Below is a transcript of a continuous voice conversation between a User and Aethria.
Provide a clear, 2-3 bullet point summary of key discussion points, decisions, or code discussed. Do NOT use emojis.

Transcript:
${formattedConversation}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a concise executive summarizer. Output 2-3 clean bullet points without emojis." },
        { role: "user", content: prompt }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      max_tokens: 512
    });

    const summary = completion.choices[0]?.message?.content || "Voice session concluded.";

    return res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("Voice Summarization Error:", error);
    return res.status(500).json({ error: error.message || "Failed to summarize voice session." });
  }
};
