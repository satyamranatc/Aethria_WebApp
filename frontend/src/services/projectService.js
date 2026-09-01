import apiClient from './chatService';

// Projects CRUD & Filters
export const fetchUserProjects = async (params = {}) => {
  const response = await apiClient.get('/api/projects', { params });
  return response.data?.projects || [];
};

export const createNewProject = async (projectData) => {
  const response = await apiClient.post('/api/projects', projectData);
  return response.data?.project || null;
};

export const fetchProjectDetails = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}`);
  return response.data || null;
};

export const updateProjectDetails = async (projectId, updates) => {
  const response = await apiClient.patch(`/api/projects/${projectId}`, updates);
  return response.data?.project || null;
};

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(`/api/projects/${projectId}`);
  return response.data;
};

// Files
export const fetchProjectFileTree = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}/files`);
  return response.data?.files || [];
};

export const fetchProjectFileContent = async (projectId, fileId) => {
  const response = await apiClient.get(`/api/projects/${projectId}/files/${fileId}`);
  return response.data?.file || null;
};

// Kanban Tasks
export const fetchProjectTasks = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}/tasks`);
  return response.data?.tasks || [];
};

export const createProjectTask = async (projectId, taskData) => {
  const response = await apiClient.post(`/api/projects/${projectId}/tasks`, taskData);
  return response.data?.task || null;
};

export const updateProjectTask = async (projectId, taskId, updates) => {
  const response = await apiClient.patch(`/api/projects/${projectId}/tasks/${taskId}`, updates);
  return response.data?.task || null;
};

export const deleteProjectTask = async (projectId, taskId) => {
  const response = await apiClient.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};

// Code Quality & Issues
export const fetchProjectIssues = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}/issues`);
  return response.data?.issues || [];
};

export const resolveProjectIssue = async (projectId, issueId) => {
  const response = await apiClient.patch(`/api/projects/${projectId}/issues/${issueId}/resolve`);
  return response.data?.issue || null;
};

// AI Intelligence & Actions
export const analyzeProjectWithAi = async (projectId) => {
  const response = await apiClient.post(`/api/projects/${projectId}/ai/analyze`);
  return response.data?.analysis || null;
};

export const runComprehensiveCodeReview = async (projectId) => {
  const response = await apiClient.post(`/api/projects/${projectId}/ai/review`);
  return response.data || null;
};

export const fetchNextBestActionPlan = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}/ai/next-action`);
  return response.data?.plan || null;
};

export const generateProjectTasksFromAi = async (projectId, prompt = '') => {
  const response = await apiClient.post(`/api/projects/${projectId}/ai/generate-tasks`, { prompt });
  return response.data?.tasks || [];
};

export const chatWithProjectAi = async (projectId, prompt, selectedFilePath = '') => {
  const response = await apiClient.post(`/api/projects/${projectId}/ai/chat`, {
    prompt,
    selectedFilePath
  });
  return response.data?.message || null;
};

// Remote Changes
export const proposeCodeChange = async (projectId, { path, originalContent, proposedContent, description, diff }) => {
  const response = await apiClient.post(`/api/projects/${projectId}/changes`, {
    projectId,
    path,
    originalContent,
    proposedContent,
    description,
    diff
  });
  return response.data?.change || null;
};

export const fetchProjectChanges = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}/changes`);
  return response.data?.changes || [];
};
