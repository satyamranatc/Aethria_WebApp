import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  ScrollView,
  Keyboard
} from 'react-native';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react-native';
import { THEME } from '../constants/theme';

const SUGGESTIONS = [
  'Make a modern glassmorphic hero',
  'Add a SaaS pricing cards section',
  'Create dark mode navbar with CTA',
  'Add customer testimonials carousel',
  'Make a newsletter subscription card',
  'Make it clean minimalist Apple style'
];

export default function VoiceMicDeck({
  isListening,
  onStartListening,
  onStopListening,
  onSendCommand,
  desktopState
}) {
  const [textInput, setTextInput] = useState('');
  
  // Pulse animation for mic button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.18,
              duration: 800,
              useNativeDriver: true
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 800,
              useNativeDriver: true
            })
          ])
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isListening]);

  const handleMicPress = () => {
    if (isListening) {
      onStopListening?.();
    } else {
      onStartListening?.();
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
      {/* Suggestions Carousel */}
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
              activeOpacity={0.7}
            >
              <Sparkles size={11} color={THEME.colors.accent} style={{ marginRight: 5 }} />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Microphone Deck */}
      <View style={styles.micSection}>
        {/* Glow Halo */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale: pulseAnim }],
              opacity: glowAnim
            }
          ]}
        />

        {/* Mic Button */}
        <TouchableOpacity
          style={[
            styles.micButton,
            isListening && styles.micButtonActive
          ]}
          onPress={handleMicPress}
          activeOpacity={0.85}
        >
          {isListening ? (
            <MicOff size={32} color="#FFF" />
          ) : (
            <Mic size={32} color="#FFF" />
          )}
        </TouchableOpacity>

        <Text style={styles.micStatusLabel}>
          {isListening
            ? 'Listening... Speak your interface idea'
            : desktopState?.status === 'thinking'
            ? 'Desktop is rendering components...'
            : 'Tap microphone to speak to desktop'}
        </Text>
      </View>

      {/* Text Command Fallback Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Or type a voice prompt..."
          placeholderTextColor={THEME.colors.textMuted}
          value={textInput}
          onChangeText={setTextInput}
          onSubmitEditing={handleSendText}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !textInput.trim() && { opacity: 0.3 }
          ]}
          onPress={handleSendText}
          disabled={!textInput.trim()}
          activeOpacity={0.7}
        >
          <Send size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.background
  },
  suggestionsWrapper: {
    marginBottom: THEME.spacing.sm
  },
  suggestionsScroll: {
    paddingRight: THEME.spacing.md,
    gap: 7
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2
  },
  suggestionText: {
    color: THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '600'
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.sm,
    position: 'relative'
  },
  glowRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: THEME.colors.accentGlow,
    top: THEME.spacing.sm - 14
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: THEME.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10
  },
  micButtonActive: {
    backgroundColor: THEME.colors.rose,
    shadowColor: THEME.colors.rose
  },
  micStatusLabel: {
    marginTop: 10,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 3,
    marginTop: THEME.spacing.xs,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2
  },
  inputField: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 13,
    paddingVertical: 7,
    paddingHorizontal: 8
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.darkButton,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
