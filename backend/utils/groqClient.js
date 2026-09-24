import Groq from "groq-sdk";

/**
 * Returns all configured, non-empty Groq API keys in priority order.
 */
export function getGroqApiKeys() {
  const candidateKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_FALLBACK,
    process.env.GROQ_BACKUP_API_KEY,
    process.env.GROQ_API
  ];

  const validKeys = candidateKeys.filter(
    (key) => key && typeof key === "string" && key.startsWith("gsk_") && key !== "your_groq_api_key_here"
  );

  return [...new Set(validKeys)];
}

/**
 * Executes a Groq Chat Completion with automated multi-key rotation and model fallback.
 * Strictly preserves the full messages array, system instructions, and canvas context across attempts.
 */
export async function executeGroqChatWithFallback({
  messages,
  model = "openai/gpt-oss-120b",
  fallbackModel = "openai/gpt-oss-20b",
  temperature = 0.35,
  max_tokens = 3800,
  response_format = null
}) {
  const keys = getGroqApiKeys();
  if (keys.length === 0) {
    throw new Error("No valid GROQ_API_KEY configured in backend environment.");
  }

  // Preserve context immutably
  const preservedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content
  }));

  const modelsToTry = [model, fallbackModel].filter(Boolean);
  let lastError = null;

  for (const currentModel of modelsToTry) {
    for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
      const apiKey = keys[keyIdx];
      const groq = new Groq({ apiKey });

      try {
        const payload = {
          messages: preservedMessages,
          model: currentModel,
          temperature,
          max_tokens
        };

        if (response_format) {
          payload.response_format = response_format;
        }

        const completion = await groq.chat.completions.create(payload);

        return {
          completion,
          activeKeyIndex: keyIdx,
          model: currentModel
        };
      } catch (err) {
        lastError = err;
        const errMsg = err.message || "";
        const isAuthOrQuota =
          err.status === 401 ||
          err.status === 429 ||
          errMsg.includes("rate_limit") ||
          errMsg.includes("quota") ||
          errMsg.includes("invalid_api_key") ||
          errMsg.includes("Unauthorized");

        console.warn(
          `[Aethria AI Fallback] Key #${keyIdx + 1} with model "${currentModel}" failed: ${errMsg}.` +
          (keyIdx + 1 < keys.length
            ? " Context preserved. Seamlessly switching to next Groq key..."
            : " No more keys for this model.")
        );

        // If it was an auth or quota error, try next key immediately
        if (isAuthOrQuota) {
          continue;
        }

        // If it is a model not found / invalid model error, break to try fallback model
        if (err.status === 404 || errMsg.includes("model_not_found")) {
          break;
        }
      }
    }
  }

  throw new Error(
    `All configured Groq API keys and fallback models exhausted. Last error: ${lastError?.message || "Unknown error"}`
  );
}
