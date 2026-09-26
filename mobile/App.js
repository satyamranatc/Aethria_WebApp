import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { remoteSocket } from './src/services/remoteSocket';
import RemoteHeader from './src/components/RemoteHeader';
import ProjectPickerBar from './src/components/ProjectPickerBar';
import RemoteControlDeck from './src/components/RemoteControlDeck';
import ChatTimeline from './src/components/ChatTimeline';
import VoiceMicDeck from './src/components/VoiceMicDeck';
import PairingModal from './src/components/PairingModal';
import ProfileModal from './src/components/ProfileModal';
import AuthSplashScreen from './src/screens/AuthSplashScreen';
import { THEME } from './src/constants/theme';

export default function App() {
  // Authentication & User State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useState(null);

  // Studio Remote State
  const [isConnected, setIsConnected] = useState(false);
  const [hasDesktopPeer, setHasDesktopPeer] = useState(false);
  const [desktopState, setDesktopState] = useState({
    status: 'idle',
    title: '',
    turnsCount: 0
  });
  const [activeViewport, setActiveViewport] = useState('desktop');

  // Cloud Projects State
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Connected to Aethria Studio. Select a project and speak or tap below to build.',
      spoken: true,
      timestamp: Date.now()
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [roomId, setRoomId] = useState('AETH-STUDIO');
  const [serverUrl, setServerUrl] = useState('https://aethria-backend.onrender.com');

  // Fetch Cloud Projects from server
  const fetchProjects = useCallback(async (token = null) => {
    try {
      setIsLoadingProjects(true);
      const headers = { 'Content-Type': 'application/json' };
      const tokenToUse = token || userToken;
      if (tokenToUse) {
        headers['Authorization'] = `Bearer ${tokenToUse}`;
      }
      const res = await fetch(`${serverUrl}/api/projects`, { headers });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.projects || [];
      setProjects(list);
      if (list.length > 0 && !activeProject) {
        setActiveProject(list[0]);
        remoteSocket.selectProject(list[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch projects on mobile:', e.message);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [serverUrl, userToken, activeProject]);

  // Connect socket on mount
  useEffect(() => {
    remoteSocket.connect(serverUrl, roomId);

    const unsubConn = remoteSocket.on('connection_change', (data) => {
      setIsConnected(data.isConnected);
      if (!data.isConnected) {
        setHasDesktopPeer(false);
      }
    });

    const unsubPeer = remoteSocket.on('peer_status', (data) => {
      setHasDesktopPeer(data.hasDesktop || false);
    });

    const unsubState = remoteSocket.on('desktop_state', (state) => {
      setDesktopState(state);
      if (state.viewport) {
        setActiveViewport(state.viewport);
      }
      if (state.activeProjectId) {
        setProjects((prev) => {
          const match = prev.find((p) => p._id === state.activeProjectId || p.id === state.activeProjectId);
          if (match) {
            setActiveProject(match);
          } else if (state.activeProjectName) {
            setActiveProject({
              _id: state.activeProjectId,
              name: state.activeProjectName,
              framework: state.activeProjectFramework || 'React',
              workspacePath: state.activeProjectWorkspace,
              filesCount: state.activeProjectFilesCount
            });
          }
          return prev;
        });
      }
      if (state.lastSpoken) {
        setMessages((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].content === state.lastSpoken) {
            return prev;
          }
          return [
            ...prev,
            {
              role: 'assistant',
              content: state.lastSpoken,
              spoken: true,
              timestamp: Date.now()
            }
          ];
        });
      }
    });

    const unsubChat = remoteSocket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    const unsubProjectSel = remoteSocket.on('project_selected', (data) => {
      if (data?.projectId) {
        setProjects((prev) => {
          const match = prev.find((p) => p._id === data.projectId || p.id === data.projectId);
          if (match) {
            setActiveProject(match);
          } else {
            setActiveProject({
              _id: data.projectId,
              name: data.projectName || 'Selected Project',
              framework: data.framework || 'React',
              workspacePath: data.workspacePath
            });
          }
          return prev;
        });
      }
    });

    const unsubProjectCreated = remoteSocket.on('project_created', (data) => {
      if (data?.project) {
        setProjects((prev) => [data.project, ...prev]);
        setActiveProject(data.project);
      }
    });

    return () => {
      unsubConn();
      unsubPeer();
      unsubState();
      unsubChat();
      unsubProjectSel();
      unsubProjectCreated();
      remoteSocket.disconnect();
    };
  }, [serverUrl, roomId]);

  // Handle Auth
  const handleAuthSuccess = ({ token, user }) => {
    setCurrentUser(user);
    setUserToken(token);
    setIsAuthenticated(true);
    fetchProjects(token);
  };

  const handleSkipAuth = () => {
    setCurrentUser({ name: 'Guest Developer' });
    setIsAuthenticated(true);
    fetchProjects(null);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Do you want to sign out of your Aethria session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            setIsAuthenticated(false);
            setCurrentUser(null);
            setUserToken(null);
            setProjects([]);
            setActiveProject(null);
          }
        }
      ]
    );
  };

  // Handle Project Selection on Mobile
  const handleSelectProject = (project) => {
    setActiveProject(project);
    remoteSocket.selectProject(project);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Active project: "${project.name}" (${project.framework || 'React'}).`,
        spoken: false,
        timestamp: Date.now()
      }
    ]);
  };

  // Handle Project Creation on Mobile
  const handleCreateProject = async ({ name, framework, language }) => {
    const headers = { 'Content-Type': 'application/json' };
    if (userToken) headers['Authorization'] = `Bearer ${userToken}`;
    const res = await fetch(`${serverUrl}/api/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, framework, language })
    });
    const created = await res.json();
    if (created && created._id) {
      setProjects((prev) => [created, ...prev]);
      setActiveProject(created);
      remoteSocket.selectProject(created);
      remoteSocket.notifyProjectCreated(created);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Created and linked project "${created.name}". Speak or tap suggestions to build on canvas.`,
          spoken: false,
          timestamp: Date.now()
        }
      ]);
      return created;
    }
    throw new Error(created?.error || 'Failed to create project');
  };

  // Handle sending a voice or text command to desktop
  const handleSendCommand = useCallback((text) => {
    if (!text || !text.trim()) return;

    if (!activeProject) {
      Alert.alert(
        'Project Required',
        'Please select or create an Aethria Cloud Project before sending voice instructions.'
      );
      return;
    }

    const userMsg = {
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);

    const sent = remoteSocket.sendVoiceCommand(text.trim());
    if (!sent && !hasDesktopPeer) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Creating "${text.trim()}" for ${activeProject.name} on desktop.`,
            spoken: false,
            timestamp: Date.now()
          }
        ]);
      }, 500);
    }
  }, [hasDesktopPeer, activeProject]);

  // Voice recording toggle
  const handleStartListening = () => {
    setIsListening(true);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  // Viewport switcher
  const handleSelectViewport = (viewport) => {
    setActiveViewport(viewport);
    remoteSocket.sendControlAction('set_viewport', viewport);
  };

  // Remote actions (VS Code, Save, Clear, etc.)
  const handleTriggerAction = (action) => {
    if (action === 'push_vscode') {
      if (!activeProject) {
        Alert.alert('No Project Selected', 'Please select a project before syncing with VS Code.');
        return;
      }
      remoteSocket.sendControlAction('push_vscode');
      Alert.alert(
        'VS Code Sync Triggered',
        `Sync requested for "${activeProject.name}". Desktop is planning code-split integration.`
      );
      return;
    }

    if (action === 'clear_canvas') {
      Alert.alert(
        'Reset Canvas',
        'Are you sure you want to clear your current workspace?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: () => {
              remoteSocket.sendControlAction('clear_canvas');
              setMessages([
                {
                  role: 'assistant',
                  content: 'Canvas reset. Ready for your next idea.',
                  spoken: false,
                  timestamp: Date.now()
                }
              ]);
            }
          }
        ]
      );
      return;
    }

    remoteSocket.sendControlAction(action);
  };

  // Save pairing config
  const handleSavePairing = ({ serverUrl: newUrl, roomId: newRoom }) => {
    setServerUrl(newUrl);
    setRoomId(newRoom);
    remoteSocket.connect(newUrl, newRoom);
    fetchProjects(userToken);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />

      {!isAuthenticated ? (
        /* AETHRIA AUTH & SPLASH SCREEN */
        <AuthSplashScreen
          onAuthSuccess={handleAuthSuccess}
          onSkipAuth={handleSkipAuth}
          serverUrl={serverUrl}
          onOpenServerConfig={() => setIsPairingModalOpen(true)}
        />
      ) : (
        /* CLEAN SIMPLE REMOTE CONTROL PAGE */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* 1. Floating Header with Logo & Status */}
          <RemoteHeader
            isConnected={isConnected}
            hasDesktopPeer={hasDesktopPeer}
            roomId={roomId}
            desktopState={desktopState}
            onOpenSettings={() => setIsPairingModalOpen(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />

          {/* 2. Active Cloud Project Bar & VS Code Stats */}
          <ProjectPickerBar
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            isLoading={isLoadingProjects}
            desktopState={desktopState}
            onTriggerVsCodeSync={() => handleTriggerAction('push_vscode')}
          />

          {/* 3. Conversational Dialogue Stream */}
          <ChatTimeline messages={messages} />

          {/* 4. Studio Controls Deck (Viewport & Actions) */}
          <RemoteControlDeck
            activeViewport={activeViewport}
            onSelectViewport={handleSelectViewport}
            onTriggerAction={handleTriggerAction}
          />

          {/* 5. Microphone Voice Deck & Suggestions */}
          <VoiceMicDeck
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onSendCommand={handleSendCommand}
            desktopState={desktopState}
            serverUrl={serverUrl}
          />
        </KeyboardAvoidingView>
      )}

      {/* 6. Profile & Account Modal */}
      <ProfileModal
        visible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        serverUrl={serverUrl}
        activeProject={activeProject}
        onLogout={handleLogout}
      />

      {/* 7. Pairing Modal */}
      <PairingModal
        visible={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        initialServerUrl={serverUrl}
        initialRoomId={roomId}
        onSave={handleSavePairing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  keyboardContainer: {
    flex: 1
  }
});
