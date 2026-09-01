import { useState, useCallback, useEffect } from 'react';
import { sendChatRequest } from '../services/chatService';
import {
  fetchSavedConversations,
  saveConversation,
  updateSavedConversation,
  deleteSavedConversation
} from '../services/authService';

const cleanMessages = (msgs) => {
  if (!Array.isArray(msgs)) return [];
  return msgs.filter(m => {
    const text = (m?.content || '').toLowerCase();
    return !text.includes('voicebox') && !text.includes('how can i help you today');
  });
};

const createInitialSession = () => ({
  id: `session-${Date.now()}`,
  title: 'New Conversation',
  createdAt: Date.now(),
  messages: []
});

export function useChat({ onAssistantReply, isAuthenticated } = {}) {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('voicebox_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map(sess => ({
            ...sess,
            messages: cleanMessages(sess.messages)
          })).filter(sess => sess.messages.length > 0 || sess.id);

          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {}
    return [createInitialSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id || 'default');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // When user logs in, fetch cloud conversations and sanitize
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedConversations()
        .then((cloudSessions) => {
          if (Array.isArray(cloudSessions) && cloudSessions.length > 0) {
            const cleaned = cloudSessions.map(sess => ({
              ...sess,
              messages: cleanMessages(sess.messages)
            }));
            setSessions(cleaned);
            setActiveSessionId(cleaned[0].id);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch cloud conversations:', err.message);
        });
    }
  }, [isAuthenticated]);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voicebox_sessions', JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || createInitialSession();
  const messages = currentSession.messages;

  const sendMessage = useCallback(async (content) => {
    const trimmed = content?.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];

    // Auto-update title if it's the first user message
    const isFirstUser = currentSession.messages.filter(m => m.role === 'user').length === 0;
    const newTitle = isFirstUser ? trimmed.slice(0, 32) + (trimmed.length > 32 ? '...' : '') : currentSession.title;

    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            messages: nextMessages
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      const data = await sendChatRequest({
        messages: nextMessages
      });

      if (data?.message) {
        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: data.model || 'Groq'
        };

        const finalMessages = [...nextMessages, assistantMsg];

        setSessions(prev =>
          prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: finalMessages
              };
            }
            return s;
          })
        );

        if (onAssistantReply) {
          onAssistantReply(assistantMsg);
        }

        // Sync to cloud if authenticated
        if (isAuthenticated) {
          try {
            await updateSavedConversation(activeSessionId, {
              title: newTitle,
              messages: finalMessages
            });
          } catch (cloudErr) {
            console.warn('Cloud sync error:', cloudErr.message);
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to send message. Please try again.';
      setErrorMessage(errMsg);

      const errorAssistantMsg = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };

      setSessions(prev =>
        prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...nextMessages, errorAssistantMsg]
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSession, activeSessionId, isLoading, onAssistantReply, isAuthenticated]);

  // Append a completed continuous voice turn into the active conversation session
  const appendVoiceTurn = useCallback(async (userMsg, assistantMsg) => {
    if (!userMsg && !assistantMsg) return;

    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          const isFirstUser = s.messages.filter(m => m.role === 'user').length === 0;
          const newTitle = isFirstUser && userMsg?.content
            ? userMsg.content.slice(0, 32) + (userMsg.content.length > 32 ? '...' : '')
            : s.title;

          const updatedMessages = [...s.messages];
          if (userMsg) updatedMessages.push(userMsg);
          if (assistantMsg) updatedMessages.push(assistantMsg);

          if (isAuthenticated) {
            updateSavedConversation(activeSessionId, {
              title: newTitle,
              messages: updatedMessages
            }).catch(e => console.warn('Cloud voice sync:', e.message));
          }

          return {
            ...s,
            title: newTitle,
            messages: updatedMessages
          };
        }
        return s;
      })
    );
  }, [activeSessionId, isAuthenticated]);

  // Append an executive summary note at the end of a voice session
  const appendVoiceSummary = useCallback(async (summaryText) => {
    if (!summaryText) return;

    const summaryMsg = {
      id: `ai-summary-${Date.now()}`,
      role: 'assistant',
      content: `## 🎙️ Voice Session Summary\n\n${summaryText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          const updatedMessages = [...s.messages, summaryMsg];
          if (isAuthenticated) {
            updateSavedConversation(activeSessionId, {
              messages: updatedMessages
            }).catch(e => console.warn('Cloud summary sync:', e.message));
          }
          return { ...s, messages: updatedMessages };
        }
        return s;
      })
    );
  }, [activeSessionId, isAuthenticated]);

  // Create new session ONLY if current session is not empty
  const createNewSession = useCallback(async () => {
    if (currentSession && currentSession.messages.length === 0) {
      return;
    }

    const newSession = createInitialSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);

    if (isAuthenticated) {
      try {
        const saved = await saveConversation({
          title: newSession.title,
          messages: newSession.messages
        });
        if (saved?.id) {
          setActiveSessionId(saved.id);
          setSessions(prev => prev.map(s => s.id === newSession.id ? { ...s, id: saved.id } : s));
        }
      } catch (err) {
        console.warn('Cloud save error:', err.message);
      }
    }
  }, [currentSession, isAuthenticated]);

  const deleteSession = useCallback(async (sessionId) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createInitialSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });

    if (isAuthenticated) {
      try {
        await deleteSavedConversation(sessionId);
      } catch (err) {
        console.warn('Cloud delete error:', err.message);
      }
    }
  }, [activeSessionId, isAuthenticated]);

  const clearChat = useCallback(() => {
    setErrorMessage(null);
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: []
          };
        }
        return s;
      })
    );

    if (isAuthenticated) {
      updateSavedConversation(activeSessionId, {
        messages: []
      }).catch(err => console.warn('Cloud clear error:', err.message));
    }
  }, [activeSessionId, isAuthenticated]);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    messages,
    isLoading,
    errorMessage,
    setErrorMessage,
    sendMessage,
    appendVoiceTurn,
    appendVoiceSummary,
    clearChat
  };
}
