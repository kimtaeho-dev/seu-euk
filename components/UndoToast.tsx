import { useEffect } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { CONSTANTS } from '../utils/constants';

interface UndoToastProps {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function UndoToast({ visible, onUndo, onDismiss }: UndoToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // slide up 등장
      translateY.value = withTiming(0, {
        duration: CONSTANTS.TOAST_SLIDE_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: CONSTANTS.TOAST_SLIDE_DURATION,
      });
    } else {
      // fade out 사라짐
      opacity.value = withTiming(0, {
        duration: CONSTANTS.FADE_IN_DURATION,
      });
      translateY.value = withTiming(100, {
        duration: CONSTANTS.TOAST_SLIDE_DURATION,
      });
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: insets.bottom + spacing.base },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable
        onPress={onUndo}
        style={({ pressed }) => [
          styles.toast,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.label}>삭제됨</Text>
        <Text style={styles.separator}>·</Text>
        <Text style={styles.undoText}>실행취소</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    zIndex: 20,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  label: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  separator: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
  undoText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.accentStart,
  },
  pressed: {
    opacity: 0.8,
  },
});
