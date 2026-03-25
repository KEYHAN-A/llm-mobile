import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { StopButton } from './StopButton';

interface InputBarProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export function InputBar({ onSend, onStop, isStreaming, disabled }: InputBarProps) {
  const { colors } = useAppTheme();
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  const canSend = text.trim().length > 0 && !disabled && !isStreaming;

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      {isStreaming && (
        <View style={styles.stopRow}>
          <StopButton onPress={onStop} />
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            typography.body,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
            },
          ]}
          value={text}
          onChangeText={setText}
          placeholder={
            disabled ? 'Load model to start chatting...' : 'Message...'
          }
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={4000}
          editable={!disabled}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? colors.primary : colors.surfaceElevated,
            },
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.sendIcon,
              { color: canSend ? '#FFFFFF' : colors.textTertiary },
            ]}>
            {'\u2191'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  stopRow: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
});
