import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { User, Sparkles, Volume2 } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function ChatTimeline({ messages = [] }) {
  const flatListRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant
        ]}
      >
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            isUser ? styles.avatarUser : styles.avatarAssistant
          ]}
        >
          {isUser ? (
            <User size={12} color="#FFF" />
          ) : (
            <Sparkles size={12} color={THEME.colors.accent} />
          )}
        </View>

        {/* Content Bubble */}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant
          ]}
        >
          <View style={styles.bubbleHeader}>
            <Text
              style={[
                styles.bubbleAuthor,
                isUser ? styles.authorUser : styles.authorAssistant
              ]}
            >
              {isUser ? 'You (Voice / Remote)' : 'Aethria AI'}
            </Text>
            {item.spoken && (
              <Volume2 size={11} color={THEME.colors.emeraldDark} style={{ marginLeft: 4 }} />
            )}
          </View>

          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.textUser : styles.textAssistant
            ]}
          >
            {item.content || item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Sparkles size={20} color={THEME.colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>Voice Studio Stream</Text>
          <Text style={styles.emptySubtitle}>
            Speak a command or tap a suggestion below. Aethria will build your interface on desktop in real-time.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  listContent: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    gap: 10
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '88%'
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  messageRowAssistant: {
    alignSelf: 'flex-start'
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  avatarUser: {
    backgroundColor: THEME.colors.darkButton
  },
  avatarAssistant: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder
  },
  bubble: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: THEME.radius.lg
  },
  bubbleUser: {
    backgroundColor: THEME.colors.darkButton,
    borderBottomRightRadius: 4
  },
  bubbleAssistant: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  bubbleAuthor: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  authorUser: {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  authorAssistant: {
    color: THEME.colors.accent
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 18
  },
  textUser: {
    color: '#FFF'
  },
  textAssistant: {
    color: THEME.colors.textPrimary
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
    maxWidth: 320,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16
  }
});
