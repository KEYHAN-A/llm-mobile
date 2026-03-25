import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../components/common/SafeScreen';
import { EmptyState } from '../components/common/EmptyState';
import { useChatStore } from '../stores/chatStore';
import { useAppTheme } from '../theme/useAppTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { Conversation } from '../types/chat';

export function ConversationListScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const conversations = useChatStore((s) => s.conversations);

  const sortedConversations = useMemo(
    () =>
      Object.values(conversations).sort(
        (a, b) => b.updatedAt - a.updatedAt,
      ),
    [conversations],
  );

  const handleSelect = useCallback(
    (conv: Conversation) => {
      useChatStore.getState().setActiveConversation(conv.id);
      navigation.navigate('Chat');
    },
    [navigation],
  );

  const handleDelete = useCallback((conv: Conversation) => {
    Alert.alert(
      'Delete conversation?',
      `"${conv.title}" will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => useChatStore.getState().deleteConversation(conv.id),
        },
      ],
    );
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeScreen>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[typography.body, { color: colors.primary }]}>
            {'\u2190'} Back
          </Text>
        </TouchableOpacity>
        <Text style={[typography.bodyBold, { color: colors.text }]}>
          Conversations
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {sortedConversations.length === 0 ? (
        <EmptyState
          title="No conversations"
          subtitle="Start chatting to see your conversations here."
        />
      ) : (
        <FlashList
          data={sortedConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, { borderBottomColor: colors.border }]}
              onPress={() => handleSelect(item)}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.6}>
              <View style={styles.itemContent}>
                <Text
                  style={[typography.body, { color: colors.text }]}
                  numberOfLines={1}>
                  {item.title}
                </Text>
                <Text
                  style={[typography.caption, { color: colors.textTertiary }]}>
                  {item.messageCount} messages
                </Text>
              </View>
              <Text
                style={[typography.caption, { color: colors.textTertiary }]}>
                {formatDate(item.updatedAt)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: { flex: 1, marginRight: spacing.md },
});
