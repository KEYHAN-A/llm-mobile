import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = React.memo(({ message }: MessageBubbleProps) => {
  const { colors } = useAppTheme();
  const isUser = message.role === 'user';
  const displayText = message.isStreaming
    ? message.streamingContent
    : message.content;

  if (!displayText && !message.isStreaming) return null;

  const mdStyles = {
    body: {
      color: isUser ? colors.userBubbleText : colors.assistantBubbleText,
      fontSize: 16,
      lineHeight: 22,
    },
    code_inline: {
      backgroundColor: isUser
        ? 'rgba(255,255,255,0.15)'
        : colors.surfaceElevated,
      color: isUser ? colors.userBubbleText : colors.text,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      fontSize: 14,
    },
    fence: {
      backgroundColor: isUser
        ? 'rgba(255,255,255,0.1)'
        : colors.surfaceElevated,
      borderColor: colors.border,
      borderRadius: 8,
      padding: spacing.md,
      marginVertical: spacing.sm,
    },
    code_block: {
      color: isUser ? colors.userBubbleText : colors.text,
      fontSize: 13,
      fontFamily: 'Menlo',
    },
    link: { color: isUser ? '#FFFFFF' : colors.primary },
    blockquote: {
      borderLeftColor: colors.textTertiary,
      borderLeftWidth: 3,
      paddingLeft: spacing.md,
      marginVertical: spacing.sm,
    },
    heading1: {
      ...typography.h2,
      color: isUser ? colors.userBubbleText : colors.text,
    },
    heading2: {
      ...typography.h3,
      color: isUser ? colors.userBubbleText : colors.text,
    },
    list_item: {
      color: isUser ? colors.userBubbleText : colors.assistantBubbleText,
    },
  };

  return (
    <View
      style={[
        styles.wrapper,
        isUser ? styles.userWrapper : styles.assistantWrapper,
      ]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.userBubble }]
            : [
                styles.assistantBubble,
                { backgroundColor: colors.assistantBubble },
              ],
        ]}>
        {isUser ? (
          <Text style={[typography.body, { color: colors.userBubbleText }]}>
            {displayText}
          </Text>
        ) : (
          <Markdown style={mdStyles}>{displayText || ' '}</Markdown>
        )}
      </View>
      {!message.isStreaming && message.timings && (
        <Text
          style={[
            typography.small,
            styles.timings,
            {
              color: colors.textTertiary,
              alignSelf: isUser ? 'flex-end' : 'flex-start',
            },
          ]}>
          {message.timings.tokensPerSecond.toFixed(1)} tok/s
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  userWrapper: { alignItems: 'flex-end' },
  assistantWrapper: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '85%',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  timings: {
    marginTop: 2,
    paddingHorizontal: spacing.xs,
  },
});
