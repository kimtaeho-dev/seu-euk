import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { usePhotoStore } from '../stores/usePhotoStore';
import { useSession } from '../hooks/useSession';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

export default function CompleteScreen() {
  const router = useRouter();
  const { totalCount, deletedCount, reset } = usePhotoStore();
  const { clear } = useSession();

  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);
  const cardOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    cardTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);

  const handleGoToTrash = useCallback(() => {
    router.push('/trash');
  }, [router]);

  const handleRestart = useCallback(async () => {
    await clear();
    reset();
    router.replace('/main');
  }, [clear, reset, router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const keptCount = totalCount - deletedCount;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 로고 */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Logo size={56} />
        </Animated.View>

        <Text style={styles.title}>정리 끝!</Text>

        {/* 스탯 카드 */}
        <Animated.View style={[styles.statCard, cardStyle]}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>전체</Text>
            <Text style={styles.statValue}>{totalCount.toLocaleString()}장</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>유지</Text>
            <Text style={[styles.statValue, { color: colors.keepGreen }]}>
              {keptCount.toLocaleString()}장
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>삭제</Text>
            <Text style={[styles.statValue, { color: colors.deleteRed }]}>
              {deletedCount.toLocaleString()}장
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* CTA */}
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <Button title="휴지통 확인하기" onPress={handleGoToTrash} />
        <View style={styles.buttonGap} />
        <Button title="처음부터 다시 정리" variant="secondary" onPress={handleRestart} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  logoContainer: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.displaySm,
    color: colors.textPrimary,
  },
  statCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.xxl,
    width: '75%',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.bodyLg,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.textPrimary,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  buttonGap: {
    height: spacing.md,
  },
});
