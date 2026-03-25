import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';

interface StopButtonProps {
  onPress: () => void;
}

export function StopButton({ onPress }: StopButtonProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.surfaceElevated }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[typography.caption, styles.icon]}>&#9632;</Text>
      <Text style={[typography.caption, { color: colors.text }]}>Stop</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  icon: { fontSize: 10 },
});
