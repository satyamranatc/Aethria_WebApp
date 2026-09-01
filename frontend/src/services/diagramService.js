import apiClient from './chatService';

export const generateDiagram = async (prompt) => {
  const response = await apiClient.post('/api/diagram/generate', { prompt });
  return response.data;
};
