import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface DownloadProgressProps {
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
}

export function DownloadProgress({
  progress,
  downloadedBytes,
  totalBytes,
}: DownloadProgressProps) {
  const { colors } = useAppTheme();

  const formatBytes = (bytes: number) => {
    if (bytes > 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Downloading model...
        </Text>
        <Text style={[typography.caption, { color: colors.text }]}>
          {progress.toFixed(1)}%
        </Text>
      </View>
      <View
        style={[styles.progressBar, { backgroundColor: colors.surfaceElevated }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${Math.min(progress, 100)}%`,
            },
          ]}
        />
      </View>
      <Text style={[typography.small, { color: colors.textTertiary }]}>
        {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: { height: '100%', borderRadius: 3 },
});
