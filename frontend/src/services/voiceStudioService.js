import apiClient from "./chatService";

// Fetch all saved Voice Studio builds
export const fetchVoiceStudioSessions = async () => {
  const response = await apiClient.get("/api/voice-studio/sessions");
  return response.data?.sessions || [];
};

// Fetch single Voice Studio build with complete canvas HTML & chat history
export const fetchVoiceStudioSessionById = async (id) => {
  const response = await apiClient.get(`/api/voice-studio/sessions/${id}`);
  return response.data?.session || null;
};

// Save or update Voice Studio build
export const saveVoiceStudioSession = async ({
  id,
  title,
  projectId,
  canvasHtml,
  chatHistory,
  selectedVoice,
  viewport
}) => {
  const response = await apiClient.post("/api/voice-studio/sessions", {
    id,
    title,
    projectId,
    canvasHtml,
    chatHistory,
    selectedVoice,
    viewport
  });
  return response.data?.session || null;
};

// Delete a saved Voice Studio build
export const deleteVoiceStudioSession = async (id) => {
  const response = await apiClient.delete(`/api/voice-studio/sessions/${id}`);
  return response.data?.success || false;
};
