import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useModelStore } from '../../stores/modelStore';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ModelStatusBarProps {
  onLoad: () => void;
}

function displayName(filename: string | null): string {
  if (!filename) return 'No model';
  return filename.replace(/\.gguf$/i, '');
}

export function ModelStatusBar({ onLoad }: ModelStatusBarProps) {
  const { colors } = useAppTheme();
  const { status, loadProgress, error, loadedModelFilename, selectedModelFilename } = useModelStore(
    useShallow((s) => ({
      status: s.status,
      loadProgress: s.loadProgress,
      error: s.error,
      loadedModelFilename: s.loadedModelFilename,
      selectedModelFilename: s.selectedModelFilename,
    })),
  );

  if (status === 'ready') {
    return (
      <View style={[styles.bar, { backgroundColor: colors.successLight }]}>
        <View style={[styles.dot, { backgroundColor: colors.success }]} />
        <Text style={[typography.caption, { color: colors.success, flex: 1 }]} numberOfLines={1}>
          {displayName(loadedModelFilename)} ready
        </Text>
      </View>
    );
  }

  if (status === 'loading') {
    return (
      <View style={[styles.bar, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
          Loading {displayName(selectedModelFilename)}... {loadProgress.toFixed(0)}%
        </Text>
      </View>
    );
  }

  if (status === 'error' && error) {
    return (
      <TouchableOpacity
        style={[styles.bar, { backgroundColor: colors.errorLight }]}
        onPress={onLoad}
        activeOpacity={0.7}>
        <Text
          style={[typography.caption, { color: colors.error, flex: 1 }]}
          numberOfLines={2}>
          {error}
        </Text>
        <Text style={[typography.caption, { color: colors.primary }]}>
          Retry
        </Text>
      </TouchableOpacity>
    );
  }

  // unloaded
  return (
    <TouchableOpacity
      style={[styles.bar, { backgroundColor: colors.warningLight }]}
      onPress={onLoad}
      activeOpacity={0.7}>
      <Text style={[typography.caption, { color: colors.warning, flex: 1 }]} numberOfLines={1}>
        {selectedModelFilename ? displayName(selectedModelFilename) : 'No model selected'}
      </Text>
      <Text style={[typography.caption, { color: colors.primary }]}>
        {selectedModelFilename ? 'Tap to load' : 'Select model'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
