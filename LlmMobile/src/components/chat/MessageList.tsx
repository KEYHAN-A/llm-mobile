import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useShallow } from 'zustand/shallow';
import { useChatStore } from '../../stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from '../common/EmptyState';
import { spacing } from '../../theme/spacing';
import type { Message } from '../../types/chat';

interface MessageListProps {
  conversationId: string | null;
}

export function MessageList({ conversationId }: MessageListProps) {
  const messages = useChatStore(
    useShallow((s) =>
      conversationId ? s.messages[conversationId] ?? [] : [],
    ),
  );
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const listRef = useRef<FlashListRef<Message>>(null);

  // Show typing indicator when streaming message has no content yet
  const streamingMsg = streamingMessageId
    ? messages.find((m) => m.id === streamingMessageId)
    : null;
  const showTyping =
    streamingMsg && !streamingMsg.streamingContent && streamingMsg.isStreaming;

  if (!conversationId || messages.length === 0) {
    return (
      <EmptyState
        title="Start a conversation"
        subtitle="Ask anything — brainstorm, learn, or just chat. Everything runs locally on your device."
      />
    );
  }

  // Reverse for inverted list (FlashList inverted renders bottom-up)
  const reversedMessages = [...messages].reverse();

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        data={reversedMessages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          showTyping ? (
            <View style={styles.typingContainer}>
              <TypingIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: spacing.sm },
  typingContainer: { paddingBottom: spacing.xs },
});
