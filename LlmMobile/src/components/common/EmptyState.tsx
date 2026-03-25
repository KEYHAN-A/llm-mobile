import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.h2, { color: colors.textSecondary }]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            typography.body,
            styles.subtitle,
            { color: colors.textTertiary },
          ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
