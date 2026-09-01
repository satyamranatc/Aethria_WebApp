import apiClient from './chatService';

export const register = async ({ name, email, password }) => {
  const response = await apiClient.post('/api/auth/register', {
    name,
    email,
    password
  });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await apiClient.post('/api/auth/login', {
    email,
    password
  });
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await apiClient.put('/api/auth/profile', data);
  return response.data;
};

export const fetchSavedConversations = async () => {
  const response = await apiClient.get('/api/conversations');
  return response.data.conversations;
};

export const saveConversation = async (conversation) => {
  const response = await apiClient.post('/api/conversations', conversation);
  return response.data.conversation;
};

export const updateSavedConversation = async (id, conversation) => {
  const response = await apiClient.put(`/api/conversations/${id}`, conversation);
  return response.data.conversation;
};

export const deleteSavedConversation = async (id) => {
  const response = await apiClient.delete(`/api/conversations/${id}`);
  return response.data;
};
