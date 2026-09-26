import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Mic, MicOff, ArrowUp, Sparkles } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { THEME } from '../constants/theme';

const SUGGESTIONS = [
  'Modern hero header',
  'Pricing cards',
  'Clean navigation bar',
  'Testimonial grid',
  'Contact form',
  'Minimalist landing page'
];

export default function VoiceMicDeck({
  isListening,
  onStartListening,
  onStopListening,
  onSendCommand,
  desktopState,
  serverUrl = 'https://aethria-backend.onrender.com'
}) {
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef(null);
  const inputRef = useRef(null);
  
  // Siri-like pulse animation for mic button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const activeListening = isListening || isRecording;

  useEffect(() => {
    if (activeListening) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.18,
              duration: 700,
              useNativeDriver: true
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true
            }),
            Animated.timing(glowAnim, {
              toValue: 0.25,
              duration: 700,
              useNativeDriver: true
            })
          ])
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [activeListening]);

  // Start real audio recording
  const startAudioRecording = async () => {
    try {
      if (!Audio || !Audio.requestPermissionsAsync) {
        throw new Error('Native audio recording not available in this environment.');
      }

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Microphone Permission',
          'Please allow microphone access to record voice commands, or use keyboard voice dictation.',
          [{ text: 'OK', onPress: () => inputRef.current?.focus() }]
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      onStartListening?.();
    } catch (err) {
      console.warn('Audio record fallback:', err.message);
      setIsRecording(false);
      onStopListening?.();
      inputRef.current?.focus();
    }
  };

  // Stop recording & transcribe with Groq Whisper
  const stopAudioRecording = async () => {
    if (!recordingRef.current) {
      setIsRecording(false);
      onStopListening?.();
      return;
    }

    try {
      setIsRecording(false);
      onStopListening?.();
      setIsTranscribing(true);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        setIsTranscribing(false);
        return;
      }

      // Read audio blob as base64
      const response = await fetch(uri);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          const transcribeRes = await fetch(`${serverUrl}/api/chat/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              format: 'm4a'
            })
          });

          const data = await transcribeRes.json();
          if (data && data.text && data.text.trim()) {
            console.log('[VoiceMic] Whisper Transcribed:', data.text);
            onSendCommand(data.text.trim());
          } else {
            console.log('[VoiceMic] Whisper returned empty transcription');
          }
        } catch (postErr) {
          console.error('[VoiceMic] Transcription upload error:', postErr);
        } finally {
          setIsTranscribing(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('[VoiceMic] Stop recording error:', err);
      setIsTranscribing(false);
    }
  };

  const handleMicPress = () => {
    if (activeListening) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const handleSendText = () => {
    if (!textInput.trim()) return;
    onSendCommand(textInput.trim());
    setTextInput('');
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (prompt) => {
    onSendCommand(prompt);
  };

  return (
    <View style={styles.container}>
      {/* Apple style suggestion pills */}
      <View style={styles.suggestionsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {SUGGESTIONS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(item)}
              activeOpacity={0.65}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Microphone Button */}
      <View style={styles.micSection}>
        {/* Apple subtle breathing glow */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale: pulseAnim }],
              opacity: glowAnim
            }
          ]}
        />

        <TouchableOpacity
          style={[
            styles.micButton,
            activeListening && styles.micButtonActive
          ]}
          onPress={handleMicPress}
          activeOpacity={0.85}
        >
          {isTranscribing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : activeListening ? (
            <MicOff size={28} color="#FFFFFF" strokeWidth={2.2} />
          ) : (
            <Mic size={28} color="#FFFFFF" strokeWidth={2.2} />
          )}
        </TouchableOpacity>

        <Text style={styles.micStatusLabel}>
          {isTranscribing
            ? 'Transcribing voice...'
            : activeListening
            ? 'Listening... Tap to send'
            : desktopState?.status === 'thinking'
            ? 'Designing interface...'
            : 'Tap to speak'}
        </Text>
      </View>

      {/* Text Command Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.inputField}
          placeholder="Describe an interface or type an idea..."
          placeholderTextColor="#8E8E93"
          value={textInput}
          onChangeText={setTextInput}
          onSubmitEditing={handleSendText}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !textInput.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSendText}
          disabled={!textInput.trim()}
          activeOpacity={0.7}
        >
          <ArrowUp size={16} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7'
  },
  suggestionsWrapper: {
    marginBottom: 10
  },
  suggestionsScroll: {
    paddingRight: 16,
    gap: 8
  },
  suggestionChip: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  suggestionText: {
    color: '#1D1D1F',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative'
  },
  glowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    top: 0
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.35
  },
  micStatusLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    letterSpacing: -0.1
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingLeft: 14,
    paddingRight: 6,
    height: 44,
    marginTop: 6
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    color: '#1D1D1F',
    paddingVertical: 0
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D1D6',
    opacity: 0.8
  }
});

