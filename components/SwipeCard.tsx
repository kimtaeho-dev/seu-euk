import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import type { Asset } from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
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

  const [imageReady, setImageReady] = useState(true);
  const [imageError, setImageError] = useState(false);
  const retryCount = useRef(0);
  const [retryKey, setRetryKey] = useState(0);

  const nextAssetRef = useRef(nextAsset);
  nextAssetRef.current = nextAsset;
  const [displayNextAsset, setDisplayNextAsset] = useState(nextAsset);

  const handleLoadEnd = useCallback(() => {
    setImageReady(true);
    setDisplayNextAsset(nextAssetRef.current);
    retryCount.current = 0;
  }, []);

  const handleError = useCallback(() => {
    if (retryCount.current < CONSTANTS.IMAGE_LOAD_RETRY) {
      retryCount.current += 1;
      setRetryKey((prev) => prev + 1);
    } else {
      setImageReady(true);
      setDisplayNextAsset(nextAssetRef.current);
      setImageError(true);
    }
  }, []);

  const prevAssetId = useRef(asset.id);
  let isTransitioning = false;
  if (prevAssetId.current !== asset.id) {
    prevAssetId.current = asset.id;
    const isForward = displayNextAsset?.id === asset.id;
    if (isForward) {
      setImageReady(false);
    } else {
      // Backward transition (undo): behind-card만 갱신, 카드는 불투명 유지
      setDisplayNextAsset(nextAsset);
    }
    setImageError(false);
    retryCount.current = 0;
    isTransitioning = true;
  }

  if (imageReady && !isTransitioning && nextAsset?.id !== displayNextAsset?.id) {
    setDisplayNextAsset(nextAsset);
  }

  return (
    <View style={styles.container}>
      {/* 다음 사진 프리렌더 */}
      {displayNextAsset && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: displayNextAsset.uri }}
            style={styles.blurBackground}
            contentFit="cover"
            blurRadius={40}
            cachePolicy="disk"
            recyclingKey={`next-blur-${displayNextAsset.id}`}
          />
          <Image
            source={{ uri: displayNextAsset.uri }}
            style={styles.nextImage}
            contentFit="contain"
            recyclingKey={`next-${displayNextAsset.id}`}
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
              <Image
                source={{ uri: asset.uri }}
                style={[styles.blurBackground, { opacity: imageReady ? 1 : 0 }]}
                contentFit="cover"
                blurRadius={40}
                cachePolicy="disk"
              />
              <Image
                key={retryKey}
                source={{ uri: asset.uri }}
                style={[styles.image, { opacity: imageReady ? 1 : 0 }]}
                contentFit="contain"
                onLoad={handleLoadEnd}
                onError={handleError}
              />
              {/* 비네팅 오버레이 */}
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent', 'transparent', 'rgba(0,0,0,0.15)']}
                locations={[0, 0.2, 0.8, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </>
          )}

        </Animated.View>
      </GestureDetector>

      {/* 유지 피드백 — 정중앙 고정 */}
      <Animated.View
        style={[styles.feedbackPill, keepIndicatorStyle]}
        pointerEvents="none"
      >
        <Ionicons name="checkmark" size={20} color={colors.keepGreen} />
        <Text style={[styles.feedbackText, { color: colors.keepGreen }]}>유지</Text>
      </Animated.View>

      {/* 삭제 피드백 — 정중앙 고정 */}
      <Animated.View
        style={[styles.feedbackPill, deleteIndicatorStyle]}
        pointerEvents="none"
      >
        <Ionicons name="trash-outline" size={20} color={colors.deleteRed} />
        <Text style={[styles.feedbackText, { color: colors.deleteRed }]}>삭제</Text>
      </Animated.View>
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
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  feedbackPill: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  feedbackText: {
    ...typography.bodySm,
    fontFamily: 'Pretendard-SemiBold',
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
