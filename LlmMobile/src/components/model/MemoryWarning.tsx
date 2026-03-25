import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface MemoryWarningProps {
  message: string;
  onDismiss: () => void;
}

export function MemoryWarning({ message, onDismiss }: MemoryWarningProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.warningLight, borderBottomColor: colors.warning },
      ]}>
      <Text
        style={[typography.caption, { color: colors.warning, flex: 1 }]}
        numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity onPress={onDismiss}>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>
          Dismiss
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
});
