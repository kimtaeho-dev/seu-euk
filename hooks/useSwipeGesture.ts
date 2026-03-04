import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { CONSTANTS } from '../utils/constants';
import type { SwipeDecision } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const THRESHOLD_DISTANCE = SCREEN_HEIGHT * CONSTANTS.SWIPE_THRESHOLD;

interface UseSwipeGestureOptions {
  onSwipe: (decision: SwipeDecision) => void;
  enabled?: boolean;
}

export function useSwipeGesture({ onSwipe, enabled = true }: UseSwipeGestureOptions) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const hasTriggeredHaptic = useSharedValue(false);

  /** 임계값 도달 시 햅틱 피드백 */
  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /** 스와이프 결과 처리 */
  const handleSwipeComplete = useCallback(
    (decision: SwipeDecision) => {
      onSwipe(decision);
    },
    [onSwipe],
  );

  /** 카드 초기 위치로 리셋 */
  const resetCard = useCallback(() => {
    translateY.value = withSpring(0, {
      damping: CONSTANTS.SNAP_BACK_DAMPING,
      stiffness: CONSTANTS.SNAP_BACK_STIFFNESS,
    });
    opacity.value = withTiming(1, { duration: CONSTANTS.FADE_IN_DURATION });
    scale.value = withSpring(1, {
      damping: CONSTANTS.SNAP_BACK_DAMPING,
      stiffness: CONSTANTS.SNAP_BACK_STIFFNESS,
    });
  }, [translateY, opacity, scale]);

  /** 새 카드 진입 애니메이션 */
  const animateIn = useCallback(() => {
    translateY.value = 0;
    opacity.value = 0;
    scale.value = 0.95;

    opacity.value = withTiming(1, { duration: CONSTANTS.FADE_IN_DURATION });
    scale.value = withSpring(1, {
      damping: CONSTANTS.SNAP_BACK_DAMPING,
      stiffness: CONSTANTS.SNAP_BACK_STIFFNESS,
    });
  }, [translateY, opacity, scale]);

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      hasTriggeredHaptic.value = false;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;

      const progress = Math.abs(event.translationY) / THRESHOLD_DISTANCE;

      // 임계값 도달 시 햅틱 (1회만)
      if (progress >= 1 && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerHaptic)();
      }
      // 임계값 이하로 돌아오면 리셋
      if (progress < 1) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd((event) => {
      const distance = Math.abs(event.translationY);
      const velocity = Math.abs(event.velocityY);
      const isThresholdReached =
        distance >= THRESHOLD_DISTANCE || velocity >= CONSTANTS.VELOCITY_THRESHOLD;

      if (!isThresholdReached) {
        // 스냅백
        translateY.value = withSpring(0, {
          damping: CONSTANTS.SNAP_BACK_DAMPING,
          stiffness: CONSTANTS.SNAP_BACK_STIFFNESS,
        });
        return;
      }

      const isUp = event.translationY < 0;
      const decision: SwipeDecision = isUp ? 'keep' : 'delete';
      const flyOutTarget = isUp ? -SCREEN_HEIGHT : SCREEN_HEIGHT;

      // 날아가는 애니메이션
      translateY.value = withTiming(
        flyOutTarget,
        {
          duration: CONSTANTS.SWIPE_ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          runOnJS(handleSwipeComplete)(decision);
        },
      );

      opacity.value = withTiming(0, {
        duration: CONSTANTS.SWIPE_ANIMATION_DURATION,
      });
    });

  /** 카드 애니메이션 스타일 */
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  /** 배경색 피드백 — 유지(초록) 오버레이 */
  const keepOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-THRESHOLD_DISTANCE, 0],
      [0.3, 0],
      Extrapolation.CLAMP,
    ),
  }));

  /** 배경색 피드백 — 삭제(빨강) 오버레이 */
  const deleteOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, THRESHOLD_DISTANCE],
      [0, 0.3],
      Extrapolation.CLAMP,
    ),
  }));

  /** 스와이프 진행률 (0~1) */
  const progressAnimatedStyle = useAnimatedStyle(() => {
    const progress = Math.min(
      Math.abs(translateY.value) / THRESHOLD_DISTANCE,
      1,
    );

    return {
      opacity: interpolate(progress, [0, 0.5, 1], [0, 0.5, 1]),
    };
  });

  return {
    gesture,
    cardAnimatedStyle,
    keepOverlayStyle,
    deleteOverlayStyle,
    progressAnimatedStyle,
    resetCard,
    animateIn,
    translateY,
  };
}
