import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../components/common/SafeScreen';
import { ModelStatusBar } from '../components/model/ModelStatusBar';
import { MessageList } from '../components/chat/MessageList';
import { InputBar } from '../components/chat/InputBar';
import { useInference } from '../hooks/useInference';
import { useModelLifecycle } from '../hooks/useModelLifecycle';
import { useMemoryMonitor } from '../hooks/useMemoryMonitor';
import { useChatStore } from '../stores/chatStore';
import { useAppTheme } from '../theme/useAppTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function ChatScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const { sendMessage, stopGeneration, isStreaming, isModelReady } =
    useInference();
  const { status, selectedModelFilename, load } = useModelLifecycle();
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  // Monitor memory during inference
  useMemoryMonitor();

  const handleSend = useCallback(
    (text: string) => {
      let convId = activeConversationId;
      if (!convId) {
        convId = useChatStore.getState().createConversation();
      }
      sendMessage(convId, text);
    },
    [activeConversationId, sendMessage],
  );

  const handleNewChat = useCallback(() => {
    const convId = useChatStore.getState().createConversation();
    useChatStore.getState().setActiveConversation(convId);
  }, []);

  return (
    <SafeScreen>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ConversationList')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[typography.body, { color: colors.primary }]}>
            {'\u2630'}
          </Text>
        </TouchableOpacity>
        <Text style={[typography.bodyBold, { color: colors.text }]}>
          Local AI
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleNewChat}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[typography.body, { color: colors.primary }]}>
              {'\u270E'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[typography.body, { color: colors.primary }]}>
              {'\u2699'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Model Status */}
      <ModelStatusBar onLoad={() => load()} />

      {/* Messages */}
      <MessageList conversationId={activeConversationId} />

      {/* Input — sticky above keyboard */}
      <KeyboardStickyView offset={{ opened: 0, closed: 0 }}>
        <InputBar
          onSend={handleSend}
          onStop={stopGeneration}
          isStreaming={isStreaming}
          disabled={status !== 'ready'}
        />
      </KeyboardStickyView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
});
