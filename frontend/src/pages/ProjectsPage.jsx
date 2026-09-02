import React, { useState } from 'react';
import ProjectCommandCenterPage from './ProjectCommandCenterPage';
import ProjectWorkspacePage from './ProjectWorkspacePage';

export default function ProjectsPage({
  onBackToWorkspace,
  onOpenAuth,
  isAuthenticated,
  onOpenCanvas
}) {
  const [activeProject, setActiveProject] = useState(() => {
    try {
      const saved = sessionStorage.getItem('aethria_active_project');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleSelectProject = (project) => {
    setActiveProject(project);
    if (project) {
      try {
        sessionStorage.setItem('aethria_active_project', JSON.stringify(project));
      } catch (e) {}
    } else {
      sessionStorage.removeItem('aethria_active_project');
    }
  };

  const handleBackToCommandCenter = () => {
    handleSelectProject(null);
  };

  if (activeProject) {
    return (
      <ProjectWorkspacePage
        project={activeProject}
        onBackToCommandCenter={handleBackToCommandCenter}
        onOpenCanvas={onOpenCanvas}
      />
    );
  }

  return (
    <ProjectCommandCenterPage
      onSelectProject={handleSelectProject}
      onBackToWorkspace={onBackToWorkspace}
      onOpenAuth={onOpenAuth}
      isAuthenticated={isAuthenticated}
    />
  );
}
