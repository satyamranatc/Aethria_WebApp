import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import Footer from '../components/layout/Footer';
import LandingNav from '../landing/ui/LandingNav';
import HeroStage from '../landing/huly/HeroStage';
import ProductivityBento from '../landing/huly/ProductivityBento';
import SyncGrid from '../landing/huly/SyncGrid';
import KnowledgeSection from '../landing/huly/KnowledgeSection';
import JoinSection from '../landing/huly/JoinSection';
import '../landing/landing.css';

export default function LandingPage({
  onLaunchChat,
  selectedVoiceGender: _selectedVoiceGender,
  onSelectVoiceGender: _onSelectVoiceGender,
  user,
  isAuthenticated,
  onOpenProfile,
  onOpenProjects,
  onOpenAuth,
  onLogout
}) {
  const navigate = useNavigate();

  const handleConnect = useCallback(() => {
    if (!isAuthenticated) {
      onOpenAuth?.('Sign in with your account to access the Aethria Workspace and link VS Code.');
      return;
    }
      if (onLaunchChat) onLaunchChat();
      else navigate('/chat');
  }, [isAuthenticated, onOpenAuth, onLaunchChat, navigate]);

  return (
    <div className="landing-root min-h-screen antialiased selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <SEOHead
        title="Aethria — The Intelligence Layer Around Your Codebase"
        description="Connect your VS Code projects to a persistent cloud intelligence layer. Understand architecture, execute multi-file changes, review diffs, and talk to your software in real time."
        canonicalUrl="https://www.aethria.in"
      />
      <LandingNav
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenAuth={onOpenAuth}
        onOpenProfile={onOpenProfile}
        onOpenProjects={onOpenProjects}
        onLogout={onLogout}
        onConnect={handleConnect}
      />
      <main>
        <HeroStage onConnect={handleConnect} />
        <ProductivityBento />
        <SyncGrid />
        <KnowledgeSection />
        <JoinSection onConnect={handleConnect} />
      </main>
      <Footer />
    </div>
  );
}
