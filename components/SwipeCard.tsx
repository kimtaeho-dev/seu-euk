import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import type { Asset } from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../styles/theme';
import { CONSTANTS } from '../utils/constants';
import type { useSwipeGesture } from '../hooks/useSwipeGesture';

interface SwipeCardProps {
  asset: Asset;
  nextAsset?: Asset;
  swipe: ReturnType<typeof useSwipeGesture>;
}

export default function SwipeCard({ asset, nextAsset, swipe }: SwipeCardProps) {
  const {
    gesture,
    cardAnimatedStyle,
    keepIndicatorStyle,
    deleteIndicatorStyle,
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
      {/* 다음 사진 프리렌더 (현재 카드 아래) */}
      {nextAsset && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: nextAsset.uri }}
            style={styles.blurBackground}
            contentFit="cover"
            blurRadius={30}
          />
          <Image
            source={{ uri: nextAsset.uri }}
            style={styles.nextImage}
            contentFit="contain"
          />
        </View>
      )}

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
              {/* 블러 배경 */}
              <Image
                source={{ uri: asset.uri }}
                style={styles.blurBackground}
                contentFit="cover"
                blurRadius={30}
              />
              {/* 원본 사진 */}
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

          {/* 유지 피드백 — 아이콘 */}
          <Animated.View
            style={[styles.iconContainer, keepIndicatorStyle]}
            pointerEvents="none"
          >
            <Ionicons name="checkmark-circle" size={48} color={colors.keepGreen} />
          </Animated.View>

          {/* 삭제 피드백 — 아이콘 */}
          <Animated.View
            style={[styles.iconContainer, deleteIndicatorStyle]}
            pointerEvents="none"
          >
            <Ionicons name="close-circle" size={48} color={colors.deleteRed} />
          </Animated.View>
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
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  nextImage: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    flex: 1,
  },
  iconContainer: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    zIndex: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 32,
    padding: spacing.xs,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
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
