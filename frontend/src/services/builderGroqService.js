/**
 * Aethria Live Website Builder AI Engine (Backend Routed)
 * - All Groq LPU calls route through secure backend (/api/chat/canvas)
 * - RAG-Aware: Maintains live canvas DOM memory across turns
 * - Incremental Builder: Appends and refines components without erasing existing ones
 * - Best Web Practices: Semantic HTML5, Tailwind CSS, Lucide icons, responsive design
 * - Delimiter-based parsing: Immune to JSON string escaping errors
 */

import apiClient from "./chatService";

export async function generateCanvasUpdate(conversationHistory, currentHtml = "") {
  const recentHistory = conversationHistory.slice(-6).map((m) => ({
    role: m.role || "user",
    content: m.content || ""
  }));

  try {
    const response = await apiClient.post("/api/chat/canvas", {
      messages: recentHistory,
      currentHtml: currentHtml,
      temperature: 0.35
    });

    if (response.data && response.data.success) {
      return {
        speech: response.data.speech || "Canvas updated. What would you like to refine next?",
        html: response.data.html || currentHtml
      };
    }

    throw new Error(response.data?.error || "Unexpected backend response format");
  } catch (error) {
    console.error("Backend Canvas Generation Error:", error);
    if (error.code === "ECONNABORTED" || error.message?.includes("Network Error")) {
      throw new Error("Unable to connect to Aethria AI backend on port 5000. Please ensure the backend server is running.");
    }
    throw error;
  }
}
