import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Attach JWT token from localStorage to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('voicebox_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendChatRequest = async ({ messages, temperature = 0.7 }) => {
  const sanitizedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await apiClient.post('/api/chat', {
    messages: sanitizedMessages,
    temperature
  });

  return response.data;
};

export const fetchTTSAudio = async (text, gender = 'female') => {
  const response = await apiClient.post('/api/tts/generate', { text, gender }, {
    responseType: 'blob'
  });
  return response.data;
};

export const summarizeVoiceConversation = async (messages) => {
  const sanitizedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await apiClient.post('/api/chat/summarize', {
    messages: sanitizedMessages
  });

  return response.data;
};

export default apiClient;
