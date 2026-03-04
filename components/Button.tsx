import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

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
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
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
      </Pressable>
    );
  }

  if (variant === 'text') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.textButton,
          pressed && styles.pressed,
          style,
        ]}
      >
        <Text style={[styles.textButtonLabel, disabled && styles.disabledText]}>
          {title}
        </Text>
      </Pressable>
    );
  }

  // secondary
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.secondaryText, disabled && styles.disabledText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
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
    fontWeight: '600',
    color: colors.textPrimary,
  } as TextStyle,
  secondary: {
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    ...typography.bodyLg,
    fontWeight: '600',
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
    textDecorationLine: 'underline',
  } as TextStyle,
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
