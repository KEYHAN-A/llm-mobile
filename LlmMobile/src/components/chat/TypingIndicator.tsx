import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/useAppTheme';
import { spacing } from '../../theme/spacing';

export function TypingIndicator() {
  const { colors } = useAppTheme();
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animation = (delay: number) =>
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 }),
          ),
          -1,
        ),
      );

    dot1.value = animation(0);
    dot2.value = animation(150);
    dot3.value = animation(300);
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  const dotStyle = [styles.dot, { backgroundColor: colors.textSecondary }];

  return (
    <View style={[styles.container, { backgroundColor: colors.assistantBubble }]}>
      <Animated.View style={[dotStyle, style1]} />
      <Animated.View style={[dotStyle, style2]} />
      <Animated.View style={[dotStyle, style3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 18,
    marginLeft: spacing.lg,
    marginVertical: spacing.xs,
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
