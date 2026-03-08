import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import type { Asset } from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../styles/theme';
import { CONSTANTS } from '../utils/constants';
import type { useSwipeGesture } from '../hooks/useSwipeGesture';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeCardProps {
  asset: Asset;
  swipe: ReturnType<typeof useSwipeGesture>;
}

export default function SwipeCard({ asset, swipe }: SwipeCardProps) {
  const {
    gesture,
    cardAnimatedStyle,
    keepOverlayStyle,
    deleteOverlayStyle,
  } = swipe;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const retryCount = useRef(0);
  const [retryKey, setRetryKey] = useState(0);

  const handleLoadEnd = useCallback(() => {
    setImageLoading(false);
    retryCount.current = 0;
  }, []);

  const handleError = useCallback(() => {
    if (retryCount.current < CONSTANTS.IMAGE_LOAD_RETRY) {
      retryCount.current += 1;
      setRetryKey((prev) => prev + 1);
    } else {
      setImageLoading(false);
      setImageError(true);
    }
  }, []);

  // asset 변경 시 리셋
  const prevAssetId = useRef(asset.id);
  if (prevAssetId.current !== asset.id) {
    prevAssetId.current = asset.id;
    setImageLoading(true);
    setImageError(false);
    retryCount.current = 0;
  }

  return (
    <View style={styles.container}>
      {/* 유지(초록) 배경 오버레이 */}
      <Animated.View
        style={[styles.overlay, styles.keepOverlay, keepOverlayStyle]}
        pointerEvents="none"
      />

      {/* 삭제(빨강) 배경 오버레이 */}
      <Animated.View
        style={[styles.overlay, styles.deleteOverlay, deleteOverlayStyle]}
        pointerEvents="none"
      />

      {/* 스와이프 카드 */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {imageError ? (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.placeholderText}>이미지를 불러올 수 없습니다</Text>
            </View>
          ) : (
            <>
              <Image
                key={retryKey}
                source={{ uri: asset.uri }}
                style={styles.image}
                contentFit="contain"
                onLoad={handleLoadEnd}
                onError={handleError}
              />
              {imageLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.accentStart} />
                </View>
              )}
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  keepOverlay: {
    backgroundColor: colors.keepGreen,
  },
  deleteOverlay: {
    backgroundColor: colors.deleteRed,
  },
  card: {
    flex: 1,
    zIndex: 1,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderText: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
});
