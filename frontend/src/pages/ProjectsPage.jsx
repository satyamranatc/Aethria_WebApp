import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectCommandCenterPage from './ProjectCommandCenterPage';
import ProjectWorkspacePage from './ProjectWorkspacePage';
import SEOHead from '../components/common/SEOHead';
import { fetchProjectDetails } from '../services/projectService';

export default function ProjectsPage({
  onBackToWorkspace,
  onOpenAuth,
  isAuthenticated,
  onOpenCanvas
}) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [activeProject, setActiveProject] = useState(() => {
    try {
      const saved = sessionStorage.getItem('aethria_active_project');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Load project by URL param if deep-linked directly via URL
  useEffect(() => {
    if (projectId) {
      if (!activeProject || activeProject._id !== projectId) {
        fetchProjectDetails(projectId)
          .then((res) => {
            if (res && res.project) {
              setActiveProject(res.project);
              sessionStorage.setItem('aethria_active_project', JSON.stringify(res.project));
            }
          })
          .catch((err) => {
            console.warn('Failed to load deep-linked project:', err);
          });
      }
    } else {
      setActiveProject(null);
      sessionStorage.removeItem('aethria_active_project');
    }
  }, [projectId]);


  const handleSelectProject = (project) => {
    setActiveProject(project);
    if (project && project._id) {
      try {
        sessionStorage.setItem('aethria_active_project', JSON.stringify(project));
      } catch (e) {}
      navigate(`/projects/${project._id}`);
    } else {
      sessionStorage.removeItem('aethria_active_project');
      navigate('/projects');
    }
  };

  const handleBackToCommandCenter = () => {
    setActiveProject(null);
    sessionStorage.removeItem('aethria_active_project');
    navigate('/projects');
  };

  if (activeProject) {
    return (
      <>
        <SEOHead
          title={`${activeProject.name || 'Project'} — Aethria Workspace`}
          description={`Cloud codebase intelligence for ${activeProject.name || 'project'}. Review code, tasks, and diffs with VS Code sync.`}
          canonicalUrl={`https://www.aethria.in/projects/${activeProject._id}`}
        />
        <ProjectWorkspacePage
          project={activeProject}
          onBackToCommandCenter={handleBackToCommandCenter}
          onOpenCanvas={onOpenCanvas}
        />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Projects Command Center — Aethria Intelligence"
        description="Manage connected VS Code workspaces, view code health scores, and execute multi-file AI change reviews."
        canonicalUrl="https://www.aethria.in/projects"
      />
      <ProjectCommandCenterPage
        onSelectProject={handleSelectProject}
        onBackToWorkspace={onBackToWorkspace || (() => navigate('/chat'))}
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}
