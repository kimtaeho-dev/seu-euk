import { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.base, animatedStyle, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={[colors.accentStart, colors.accentEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.primaryText, disabled && styles.disabledText]}>
            {title}
          </Text>
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === 'text') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.textButton, animatedStyle, style]}
      >
        <Text style={[styles.textButtonLabel, disabled && styles.disabledText]}>
          {title}
        </Text>
      </AnimatedPressable>
    );
  }

  // secondary
  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.base, styles.secondary, animatedStyle, disabled && styles.disabled, style]}
    >
      <Text style={[styles.secondaryText, disabled && styles.disabledText]}>
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    ...typography.bodyLg,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.textPrimary,
  } as TextStyle,
  secondary: {
    backgroundColor: colors.surfaceDark,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    ...typography.bodyLg,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.textPrimary,
  } as TextStyle,
  textButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
  textButtonLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
  } as TextStyle,
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
