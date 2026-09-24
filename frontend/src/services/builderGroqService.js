/**
 * Aethria Live Website Builder AI Engine (Groq LPU)
 * - RAG-Aware: Maintains live canvas DOM memory across turns
 * - Incremental Builder: Appends and refines components without erasing existing ones
 * - Best Web Practices: Semantic HTML5, Tailwind CSS, Lucide icons, responsive design
 * - Delimiter-based parsing: Immune to JSON string escaping errors
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const AETHRIA_ENGINEER_PROMPT = `You are a world-class senior Apple & Aethria UI engineer and website architect building a live production website with the user.

CORE ENGINEERING PRINCIPLES:
1. RAG & PERSISTENT CANVAS AWARENESS (CRITICAL):
   - You will receive the "CURRENT CANVAS HTML" representing the live webpage.
   - If the canvas already has components (e.g. a navbar) and the user requests a new component (e.g. "add a hero section", "add pricing cards", "create a footer"), you MUST PRESERVE the existing components and seamlessly append the new component in proper visual order inside a cohesive page layout.
   - If the user requests a styling modification (e.g. "make the navbar sky blue" or "increase spacing"), update that specific component while keeping all other sections completely intact.
   - NEVER return an empty response or accidentally erase previous work unless explicitly commanded to "clear", "reset", or "start over".

2. BEST MODERN WEB PRACTICES & LIBRARIES:
   - Use semantic HTML5 elements: <header>, <nav>, <main>, <section>, <footer>.
   - Use Tailwind CSS classes for all styling:
     * Premium modern themes (clean dark or light mode as requested)
     * Subtle translucent borders (border border-black/[0.08] or border-white/10)
     * High-end typography (tracking-tight, font-semibold, leading-relaxed)
     * Smooth micro-interactions (transition-all duration-300 hover:scale-[1.01])
     * Fully responsive layouts (flex, grid, sm:, md:, lg:)
   - Support icons via Lucide: You can use <i data-lucide="icon-name" class="w-5 h-5"></i> or inline SVGs.

3. STRICT ELEVENLABS TOKEN CONSERVATION IN SPEECH:
   - Keep "speech" to strictly 1 short, natural sentence (under 14 words) confirming what was engineered, followed by 1 sharp follow-up question specifically about that component.
   - NEVER read code, HTML tags, or CSS classes aloud.

FORMAT SPECIFICATION (EXACT):
You must format your response with these exact delimiters:
===SPEECH===
[1 short spoken sentence under 14 words with sharp question]
===HTML===
[Complete updated HTML page/component code with Tailwind CSS]`;

export async function generateCanvasUpdate(conversationHistory, currentHtml = "") {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || "";

  const recentHistory = conversationHistory.slice(-6);

  const messages = [
    { role: "system", content: AETHRIA_ENGINEER_PROMPT },
    ...(currentHtml && currentHtml.trim().length > 10 
      ? [{ role: "system", content: `CURRENT CANVAS HTML (PRESERVE AND ENHANCE THIS):\n\`\`\`html\n${currentHtml}\n\`\`\`` }] 
      : [{ role: "system", content: "CANVAS STATUS: Currently blank. Build the requested component as the foundation." }]),
    ...recentHistory
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: messages,
      temperature: 0.35,
      max_tokens: 3800
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `Groq API Error: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "";

  let speech = "Canvas updated.";
  let html = "";

  if (rawContent.includes("===SPEECH===") && rawContent.includes("===HTML===")) {
    const speechPart = rawContent.split("===HTML===")[0].replace("===SPEECH===", "").trim();
    const htmlPart = rawContent.split("===HTML===")[1].trim();

    speech = speechPart.replace(/[*_#`~]/g, "").trim();
    html = htmlPart.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
  } else {
    try {
      let cleaned = rawContent.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned);
      speech = parsed.speech || speech;
      html = parsed.html || "";
    } catch (e) {
      const htmlMatch = rawContent.match(/<([a-z]+)[\s\S]*<\/\1>/i);
      if (htmlMatch) {
        html = htmlMatch[0];
      }
      const firstLine = rawContent.split("\n")[0].replace(/[*_#`~]/g, "").trim();
      if (firstLine && firstLine.length < 120 && !firstLine.includes("<")) {
        speech = firstLine;
      }
    }
  }

  if (!html || html.trim().length < 15) {
    html = currentHtml;
  }

  return {
    speech: speech || "Canvas updated. What would you like to refine?",
    html: html
  };
}
