import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import type { Asset } from 'expo-media-library';
import { colors } from '../styles/theme';
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
          <Image
            source={{ uri: asset.uri }}
            style={styles.image}
            resizeMode="contain"
          />
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
});
