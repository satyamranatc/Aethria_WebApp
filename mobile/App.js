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
import RemoteControlDeck from './src/components/RemoteControlDeck';
import ChatTimeline from './src/components/ChatTimeline';
import VoiceMicDeck from './src/components/VoiceMicDeck';
import PairingModal from './src/components/PairingModal';
import AuthSplashScreen from './src/screens/AuthSplashScreen';
import { THEME } from './src/constants/theme';

export default function App() {
  // Authentication & User State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Studio Remote State
  const [isConnected, setIsConnected] = useState(false);
  const [hasDesktopPeer, setHasDesktopPeer] = useState(false);
  const [desktopState, setDesktopState] = useState({
    status: 'idle',
    title: '',
    turnsCount: 0
  });
  const [activeViewport, setActiveViewport] = useState('desktop');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Connected to Aethria Studio. Speak or tap below to build your interface.',
      spoken: true,
      timestamp: Date.now()
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [roomId, setRoomId] = useState('AETH-STUDIO');
  const [serverUrl, setServerUrl] = useState('https://aethria-backend.onrender.com');

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

    return () => {
      unsubConn();
      unsubPeer();
      unsubState();
      unsubChat();
      remoteSocket.disconnect();
    };
  }, [serverUrl, roomId]);

  // Handle Auth
  const handleAuthSuccess = ({ token, user }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleSkipAuth = () => {
    setCurrentUser({ name: 'Guest Developer' });
    setIsAuthenticated(true);
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
          }
        }
      ]
    );
  };

  // Handle sending a voice or text command to desktop
  const handleSendCommand = useCallback((text) => {
    if (!text || !text.trim()) return;

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
            content: `Creating "${text.trim()}" on your desktop screen.`,
            spoken: false,
            timestamp: Date.now()
          }
        ]);
      }, 500);
    }
  }, [hasDesktopPeer]);

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
          />

          {/* 2. Conversational Dialogue Stream */}
          <ChatTimeline messages={messages} />

          {/* 3. Studio Controls Deck (Viewport & Actions) */}
          <RemoteControlDeck
            activeViewport={activeViewport}
            onSelectViewport={handleSelectViewport}
            onTriggerAction={handleTriggerAction}
          />

          {/* 4. Microphone Voice Deck & Suggestions */}
          <VoiceMicDeck
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onSendCommand={handleSendCommand}
            desktopState={desktopState}
          />
        </KeyboardAvoidingView>
      )}

      {/* 5. Pairing Modal */}
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
