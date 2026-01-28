import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Editor from "@monaco-editor/react";
import {
  Mic,
  MicOff,
  Send,
  Code as CodeIcon,
  User,
  Bot,
  AlertCircle,
  Download,
  Upload,
  Save,
  RefreshCw,
  FileCode,
  CheckCircle,
  XCircle,
  Edit3,
  Sparkles,
  ArrowRight,
  Zap,
  Terminal,
  Play,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500";

export default function ProjectAssistant() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  // Voice Mode State - Initialize from URL to prevent flash
  const [isVoiceMode, setIsVoiceMode] = useState(
    () => searchParams.get("mode") === "voice",
  );

  useEffect(() => {
    if (mode === "voice") {
      setIsVoiceMode(true);
      setViewMode("chat");
    }
  }, [mode]);

  // Chat state
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Welcome to Aethria Project Assistant! I'm connected to your VS Code environment. You can fetch code, ask questions, and I'll help you edit with AI assistance.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Editor state
  const [editorCode, setEditorCode] = useState(
    "// Click 'Fetch from VS Code' to load your code here\n// Or start typing to edit manually",
  );
  const [currentFile, setCurrentFile] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorLanguage, setEditorLanguage] = useState("javascript");
  const [showDiff, setShowDiff] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [originalCode, setOriginalCode] = useState("");

  // Visualizer State
  const [executionFlow, setExecutionFlow] = useState(null);
  const [fixedCode, setFixedCode] = useState(null);
  const [errorSummary, setErrorSummary] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(800);
  const [viewMode, setViewMode] = useState("chat"); // chat | visualizer
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const flowContainerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll execution flow
  useEffect(() => {
    if (currentStep >= 0 && flowContainerRef.current) {
      const stepEl = document.getElementById(`step-${currentStep}`);
      if (stepEl) {
        stepEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep]);

  // Animation Loop
  useEffect(() => {
    let timer;
    if (isPlaying && executionFlow && currentStep < executionFlow.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, playbackSpeed);
    } else if (
      isPlaying &&
      executionFlow &&
      currentStep >= executionFlow.length - 1
    ) {
      setIsPlaying(false); // Stop at end
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, executionFlow, playbackSpeed]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Changed to match "Continuous Listening" requirement
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      let silenceTimer;
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setInputText(currentText);

          // Smooth Logic: If we have a final result, or if using interim with a pause
          // Clear any existing timer
          clearTimeout(silenceTimer);

          // Wait for 2.0s of silence before processing
          silenceTimer = setTimeout(() => {
            if (currentText.trim().length > 3) {
              handleSend(currentText);
            }
          }, 2000);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        // Auto-restart if in Voice Mode (unless error is "not-allowed")
        if (isVoiceMode && event.error !== "not-allowed") {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (e) {
              /* ignore already started */
            }
          }, 1000);
        } else {
          setError("Voice recognition error. Please try again.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Auto-restart for Voice Mode
        if (isVoiceMode) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (e) {
              /* ignore already started */
            }
          }, 500);
        }
      };
    }
  }, []); // Re-run if isVoiceMode changes? No, controlled by state in onend

  // Auto-start listening when Voice Mode is active
  useEffect(() => {
    const triggerStart = () => {
      if (isVoiceMode && !isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          // Already started or background error
        }
      }
    };

    if (isVoiceMode) {
      // Try immediately
      triggerStart();
      // and a small delay in case recognitionRef was just initialized
      const timer = setTimeout(triggerStart, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVoiceMode, isListening]);

  // Auto-Sync Polling Effect for Voice Mode
  useEffect(() => {
    let syncInterval;
    if (isVoiceMode && isSignedIn) {
      // Start polling code from VS Code every 2 seconds
      syncInterval = setInterval(() => {
        // "Silent" fetch - don't show loading spinners for this background sync
        const email = user?.primaryEmailAddress?.emailAddress;
        if (email) {
          // Use a silent version of triggerExtensionCommand or handle loading state carefully
          // Here we just fire and forget, updating editorCode on success
          triggerExtensionCommand(email, "FETCH_CODE", {})
            .then((code) => {
              if (code && code !== editorCode) {
                setEditorCode(code);
                setOriginalCode(code); // Assume sync is "clean"
              }
            })
            .catch(() => {
              /* ignore silent sync errors */
            });
        }
      }, 2000);
    }
    return () => clearInterval(syncInterval);
  }, [isVoiceMode, isSignedIn, user, editorCode]); // Dep on editorCode might cause re-renders, but needed for comparison. Maybe optimize later.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleListening = () => {
    if (isListening) {
      if (isVoiceMode) {
        // If in Voice Mode, "stopping" might mean disabling voice mode entirely?
        // Or just temporary pause. Let's toggle the mode actually.
        if (confirm("Exit Voice Mode?")) {
          setIsVoiceMode(false);
          recognitionRef.current?.stop();
        }
      } else {
        recognitionRef.current?.stop();
      }
    } else {
      setError(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text = inputText) => {
    if (!text.trim() || isProcessing) return;

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      setError("Please sign in to continue");
      return;
    }

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);
    setError(null);

    // Reset Visualizer
    setExecutionFlow(null);
    setFixedCode(null);
    setErrorSummary([]);
    setCurrentStep(-1);
    setIsPlaying(false);

    try {
      let contextCode = "";

      // VOICE MODE: Always fetch latest code before processing to ensure context
      if (isVoiceMode) {
        try {
          contextCode = await triggerExtensionCommand(email, "FETCH_CODE", {});
          if (contextCode) {
            setEditorCode(contextCode);
            setOriginalCode(contextCode);
          }
        } catch (e) {
          console.error("Context fetch failed", e);
        }
      }

      const lineMatch = text.match(/line (?:no )?(\\d+)/i);
      const fullCodeMatch = text.match(
        /current code|whole code|my code|this code|explain|fix|debug/i,
      );

      if (!contextCode) {
        // If not already fetched or not in voice mode
        if (lineMatch) {
          const lineNo = parseInt(lineMatch[1]);
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: `Fetching line ${lineNo} from VS Code...`,
              isSystem: true,
            },
          ]);
          contextCode = await triggerExtensionCommand(email, "FETCH_LINE", {
            lineNo,
          });
        } else if (fullCodeMatch || editorCode.length > 50) {
          contextCode = editorCode;
        }
      }

      const prompt = contextCode
        ? contextCode // Send raw code if context exists, letting backend analyze it
        : text;

      // Call API
      const aiRes = await axios.post(`${API_URL}/ask-aethria`, {
        code: prompt,
        language: editorLanguage,
        mode: isVoiceMode ? "voice" : "chat", // Pass mode to backend
      });

      const responseData = aiRes.data;

      if (isVoiceMode && responseData.type === "ACTION") {
        // Handle Voice Actions (e.g. Insert Comment)
        const action = responseData.data;

        if (action.actionType === "INSERT_COMMENT") {
          const { line, text } = action;
          // Insert comment into editorCode
          const lines = editorCode.split("\n");
          // Insert at index (line - 1) + 1 to be "below" the line, or just at the line
          // "Below line 5" means index 5 (since 0-indexed line 5 is the 6th line).
          // Let's assume 'line' is 1-indexed.
          const insertIndex = line;
          const indentation = lines[line - 1]
            ? lines[line - 1].match(/^\s*/)[0]
            : "";

          lines.splice(insertIndex, 0, `${indentation}// 🤖 AI: ${text}`);
          const newCode = lines.join("\n");

          applyCodeToEditor(newCode); // Updates editor and sets unsaved changes

          // Auto-save/sync back to VS Code for "Real-time" feel
          // We need to trigger the sync immediately
          setTimeout(() => {
            syncCodeToVSCode();
            // Also add a chat message so user sees history
            setMessages((prev) => [
              ...prev,
              {
                role: "bot",
                content: `(Voice Action) Added comment on line ${line}: "${text}"`,
              },
            ]);
          }, 500);
        } else if (action.actionType === "CHAT") {
          setMessages((prev) => [
            ...prev,
            { role: "bot", content: action.text },
          ]);
        }
      } else if (responseData.type === "analysis") {
        // New Project Assistant Flow -> Visualizer
        const analysis = responseData.data;
        // ... (rest of visualizer logic)
        setExecutionFlow(analysis.executionFlow || []);
        setFixedCode(analysis.fixedCode);
        setErrorSummary(analysis.errorSummary || []);
        setViewMode("visualizer");

        let botMessage = "I've analyzed the code execution flow.";
        if (analysis.errorSummary && analysis.errorSummary.length > 0) {
          botMessage += ` Found ${analysis.errorSummary.length} issues.`;
        } else {
          botMessage += " No critical errors found.";
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: botMessage,
            isSystem: true,
          },
        ]);

        // Auto-play
        setTimeout(() => setIsPlaying(true), 500);
      } else {
        // Legacy Text/Comment Flow
        const responseText = responseData.response || "";
        // ... (rest of legacy flow)

        // Extract code blocks from AI response
        const codeBlockMatches = responseText.match(
          /```(?:\w+)?\n([\s\S]+?)\n```/g,
        );
        const hasCodeBlocks = codeBlockMatches && codeBlockMatches.length > 0;

        // Add message with code block info
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: responseText,
            hasCodeBlocks,
            codeBlocks: hasCodeBlocks
              ? codeBlockMatches.map((block) => {
                  const match = block.match(/```(?:\w+)?\n([\s\S]+?)\n```/);
                  return match ? match[1] : "";
                })
              : [],
          },
        ]);

        setViewMode("chat");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerExtensionCommand = async (email, type, payload) => {
    const createRes = await axios.post(`${API_URL}/create-command`, {
      email,
      type,
      payload,
    });
    const commandId = createRes.data.commandId;

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 15) {
          clearInterval(interval);
          reject(
            new Error(
              "VS Code extension not responding. Please ensure it's running.",
            ),
          );
        }

        const statusRes = await axios.get(`${API_URL}/command-status`, {
          params: { commandId },
        });
        if (statusRes.data.status === "COMPLETED") {
          clearInterval(interval);
          resolve(statusRes.data.result);
        } else if (statusRes.data.status === "FAILED") {
          clearInterval(interval);
          reject(new Error(statusRes.data.result));
        }
      }, 1000);
    });
  };

  const fetchCodeFromVSCode = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setIsSyncing(true);
    setError(null);

    try {
      const result = await triggerExtensionCommand(email, "FETCH_CODE", {});
      setEditorCode(result);
      setOriginalCode(result);
      setHasUnsavedChanges(false);
      setCurrentFile("Active File");

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "✓ Code fetched from VS Code successfully!",
          isSystem: true,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditorChange = (value) => {
    setEditorCode(value || "");
    setHasUnsavedChanges(value !== originalCode);
  };

  const applyCodeToEditor = (code) => {
    setEditorCode(code);
    setHasUnsavedChanges(true);
    setViewMode("editor"); // Switch to editor view
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        content: "✓ Fixed code applied to editor. Review and Sync.",
        isSystem: true,
      },
    ]);
  };

  // Calculate line-based diff for incremental sync
  const calculateLineDiff = (original, edited) => {
    const originalLines = original.split("\n");
    const editedLines = edited.split("\n");
    const changes = [];

    // Find changed, added, or deleted lines
    const maxLength = Math.max(originalLines.length, editedLines.length);

    for (let i = 0; i < maxLength; i++) {
      const origLine = originalLines[i];
      const editLine = editedLines[i];

      if (origLine !== editLine) {
        changes.push({
          lineNumber: i + 1, // 1-indexed
          oldText: origLine || "",
          newText: editLine || "",
          type: !origLine ? "added" : !editLine ? "deleted" : "modified",
        });
      }
    }

    return changes;
  };

  const syncCodeToVSCode = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setIsSyncing(true);
    setError(null);

    try {
      // Calculate only the changed lines
      const changes = calculateLineDiff(originalCode, editorCode);

      if (changes.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "No changes to sync.", isSystem: true },
        ]);
        setIsSyncing(false);
        return;
      }

      // Send incremental changes instead of full code
      await triggerExtensionCommand(email, "APPLY_INCREMENTAL_EDIT", {
        changes,
        fullCode: editorCode, // Fallback in case extension doesn't support incremental
      });

      setOriginalCode(editorCode);
      setHasUnsavedChanges(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: `✓ Synced ${changes.length} line change(s) to VS Code!`,
          isSystem: true,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          <span className="font-semibold text-red-600">
            Please sign in to access Project Assistant
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Terminal className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                Project Assistant
              </h1>
              {isVoiceMode && (
                <div className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-red-600">
                    Voice Mode Active
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle size={14} className="text-green-500" />
                <span>
                  Connected to {user.primaryEmailAddress.emailAddress}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("chat")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "chat" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Chat
              </button>
              {!isVoiceMode && (
                <button
                  onClick={() => setViewMode("visualizer")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "visualizer" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Visualizer
                </button>
              )}
              <button
                onClick={() => setViewMode("editor")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "editor" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Editor
              </button>
            </div>
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                <AlertCircle size={14} /> Unsaved changes
              </span>
            )}
            {isSyncing && (
              <span className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                <RefreshCw size={14} className="animate-spin" /> Syncing...
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Main Pane - Dynamic based on View Mode */}
        {/* Left/Main Pane - Dynamic based on View Mode */}
        {viewMode === "chat" && (
          <div className="flex-1 flex flex-col bg-white border-r border-gray-200 lg:max-w-[40%]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"}`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex text-gray-500 italic p-4">Thinking...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area / Voice HUD */}
            <div className="p-4 border-t border-gray-200">
              {isVoiceMode ? (
                // VOICE HUD
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl ring-4 ring-indigo-500/20 flex flex-col items-center gap-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                      Voice Mode Active
                    </span>
                    {isSyncing ? (
                      <span className="text-xs flex items-center gap-1 text-indigo-300">
                        <RefreshCw size={12} className="animate-spin" /> Syncing
                        VS Code
                      </span>
                    ) : (
                      <span className="text-xs flex items-center gap-1 text-emerald-400">
                        <CheckCircle size={12} /> Synced
                      </span>
                    )}
                  </div>

                  {/* Audio Visualizer (Simulated) */}
                  <div className="flex items-center gap-1 h-12">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 bg-indigo-500 rounded-full transition-all duration-100 ${isListening ? "animate-[pulse_1s_ease-in-out_infinite]" : "h-2"}`}
                        style={{
                          height: isListening
                            ? `${Math.random() * 24 + 8}px`
                            : "8px",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      ></div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-medium text-white mb-1">
                      {isProcessing
                        ? isSyncing
                          ? "Syncing Context..."
                          : "Processing Command..."
                        : inputText || "Listening..."}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isProcessing
                        ? "AI is analyzing your code..."
                        : "Say 'Add comment on line 5...' or 'Explain this code'"}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-2 w-full">
                    <button
                      onClick={() => toggleListening()}
                      className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <MicOff size={16} /> Stop Voice Mode
                    </button>
                    {/* Force Trigger Button if silence detection fails */}
                    <button
                      onClick={() => handleSend(inputText)}
                      disabled={!inputText || isProcessing}
                      className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                // STANDARD CHAT INPUT
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl p-2">
                  <button
                    onClick={toggleListening}
                    className={`p-2 rounded-lg ${isListening ? "text-red-500 animate-pulse" : "text-gray-500"}`}
                  >
                    <Mic size={20} />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type or speak (e.g. 'Explain this code', 'Fix bug on line 5')"
                    className="flex-1 bg-transparent border-none focus:outline-none placeholder:text-gray-500"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isProcessing}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Send size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "visualizer" && (
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto flex flex-col gap-6 scroll-smooth">
            {!executionFlow ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-200 blur-xl opacity-50 rounded-full animate-pulse"></div>
                  <Zap
                    size={64}
                    className="relative z-10 mb-6 text-indigo-500"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-500 max-w-sm text-center">
                  Run code analysis to see a live visual execution flow and spot
                  errors instantly.
                </p>
              </div>
            ) : (
              <>
                {/* Visualizer Controls */}
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-3 text-lg">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Play
                          size={20}
                          className="text-indigo-600 fill-current"
                        />
                      </div>
                      Execution Flow
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isPlaying ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                      >
                        {isPlaying ? "Pause" : "Play"}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentStep(-1);
                          setIsPlaying(false);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {fixedCode && (
                      <button
                        onClick={() => applyCodeToEditor(fixedCode)}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-105 transition-all duration-200"
                      >
                        <Sparkles
                          size={18}
                          className="group-hover:rotate-12 transition-transform"
                        />
                        Fix All Issues
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline / Steps */}
                <div
                  ref={flowContainerRef}
                  className="space-y-6 pb-32 pt-4 px-4"
                >
                  {executionFlow.map((step, index) => {
                    const isActive = index === currentStep;
                    const isPast = index < currentStep;
                    const isError = step.status === "error";

                    return (
                      <div
                        id={`step-${index}`}
                        key={index}
                        className={`relative transition-all duration-700 ease-out pl-10 ${isActive ? "scale-100 opacity-100 translate-x-0" : isPast ? "opacity-60 scale-95" : "opacity-40 blur-sm translate-y-4"}`}
                      >
                        {/* Timeline Line */}
                        <div
                          className={`absolute left-[19px] top-10 bottom-[-40px] w-0.5 bg-gray-200 ${index === executionFlow.length - 1 ? "hidden" : ""}`}
                        />

                        {/* Status Dot */}
                        <div
                          className={`absolute left-0 top-6 w-10 h-10 rounded-full border-[3px] border-white shadow-md flex items-center justify-center z-10 transition-colors duration-500
                                        ${isActive ? "bg-indigo-600 ring-4 ring-indigo-100 scale-110" : isError ? "bg-red-500" : "bg-emerald-500"}
                                    `}
                        >
                          {isActive ? (
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                          ) : isError ? (
                            <XCircle size={18} className="text-white" />
                          ) : (
                            <CheckCircle size={18} className="text-white" />
                          )}
                        </div>

                        {/* Card */}
                        <div
                          className={`group relative overflow-hidden bg-white rounded-2xl border-l-[6px] p-5 shadow-sm transition-all duration-300
                                        ${isActive ? "border-indigo-500 shadow-xl ring-1 ring-indigo-50 translate-x-2" : isError ? "border-red-500" : "border-emerald-500 hover:shadow-md"}
                                    `}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                Line {step.line}
                              </span>
                              <h4
                                className={`text-sm font-bold uppercase tracking-wider ${isError ? "text-red-600" : "text-emerald-600"}`}
                              >
                                {step.status}
                              </h4>
                            </div>
                            {isActive && (
                              <span className="text-xs font-semibold text-indigo-500 animate-pulse">
                                Executing...
                              </span>
                            )}
                          </div>

                          {/* Code Snippet - "Tight Code" Style */}
                          <div className="relative group/code">
                            <div
                              className={`absolute inset-y-0 left-0 w-1 ${isError ? "bg-red-200" : "bg-gray-200"} rounded-full opacity-50`}
                            ></div>
                            <code
                              className={`block font-mono text-[13px] leading-relaxed pl-4 py-2 rounded-lg ${isError ? "bg-red-50/50 text-red-900" : "bg-slate-50 text-slate-700"}`}
                            >
                              {step.content}
                            </code>
                          </div>

                          <p
                            className={`mt-3 text-sm leading-relaxed ${isError ? "text-gray-800 font-medium" : "text-gray-500"}`}
                          >
                            {step.explanation}
                          </p>

                          {isError && step.fix && (
                            <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
                              <div className="text-xs font-bold text-red-700 mb-2 flex items-center gap-2">
                                <AlertCircle size={14} /> SUGGESTED FIX
                              </div>
                              <div className="bg-white/80 p-3 rounded-lg border border-red-100 font-mono text-emerald-700 text-sm shadow-sm flex justify-between items-center group/fix cursor-pointer hover:bg-white transition-colors">
                                <span>{step.fix}</span>
                                <CheckCircle
                                  size={14}
                                  className="opacity-0 group-hover/fix:opacity-100 transition-opacity text-emerald-500"
                                />
                              </div>
                            </div>
                          )}

                          {/* Variables State */}
                          {step.variables && (
                            <div className="mt-4 pt-3 border-t border-gray-50 flex gap-2 flex-wrap">
                              {Object.entries(step.variables).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1"
                                >
                                  <span className="opacity-50">{k} =</span>{" "}
                                  <span className="font-bold">
                                    {JSON.stringify(v)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Right Pane: Code Editor (Always visible or toggleable?) - For now, show in Editor Mode or split */}
        {(viewMode === "editor" || viewMode === "chat") && (
          <div className="flex-1 lg:w-1/2 flex flex-col bg-white border-l border-gray-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <FileCode size={18} /> Code Editor
              </span>
              <div className="flex gap-2">
                <button
                  onClick={fetchCodeFromVSCode}
                  className="px-3 py-1 text-gray-600 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Fetch
                </button>
                <button
                  onClick={syncCodeToVSCode}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm flex items-center gap-1"
                >
                  <Upload size={14} /> Sync
                </button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                language={editorLanguage}
                value={editorCode}
                onChange={handleEditorChange}
                theme="vs-light"
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
