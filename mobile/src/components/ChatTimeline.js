import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Sparkles, ArrowDown } from 'lucide-react-native';

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
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant
          ]}
        >
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
        <View style={styles.emptyCircle}>
          <Sparkles size={22} color="#0071E3" />
        </View>
        <Text style={styles.emptyTitle}>Design with your voice</Text>
        <Text style={styles.emptySubtitle}>
          Describe an idea or tap a suggestion below. It will appear instantly on your desktop.
        </Text>
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
    backgroundColor: '#FFFFFF'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10
  },
  messageRow: {
    flexDirection: 'row',
    maxWidth: '82%'
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end'
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start'
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20
  },
  bubbleUser: {
    backgroundColor: '#0071E3',
    borderBottomRightRadius: 6
  },
  bubbleAssistant: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderBottomLeftRadius: 6
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15
  },
  textUser: {
    color: '#FFFFFF',
    fontWeight: '400'
  },
  textAssistant: {
    color: '#1D1D1F',
    fontWeight: '400'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF'
  },
  emptyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.1,
    maxWidth: 260
  }
});

