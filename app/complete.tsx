import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoStore } from '../stores/usePhotoStore';
import { useSession } from '../hooks/useSession';
import Button from '../components/Button';
import { colors, typography, spacing } from '../styles/theme';

export default function CompleteScreen() {
  const router = useRouter();
  const { totalCount, deletedCount, reset } = usePhotoStore();
  const { clear } = useSession();

  const handleGoToTrash = useCallback(() => {
    router.push('/trash');
  }, [router]);

  const handleRestart = useCallback(async () => {
    await clear();
    reset();
    router.replace('/main');
  }, [clear, reset, router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 축하 아이콘 */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={64} color={colors.keepGreen} />
        </View>

        {/* 요약 텍스트 */}
        <Text style={styles.title}>정리 완료!</Text>
        <Text style={styles.summary}>
          전체 {totalCount.toLocaleString()}장 중{'\n'}
          <Text style={styles.highlight}>
            {deletedCount.toLocaleString()}장
          </Text>
          을 휴지통으로 이동했습니다
        </Text>
      </View>

      {/* CTA */}
      <View style={styles.buttonContainer}>
        <Button title="휴지통 확인하기" onPress={handleGoToTrash} />
        <View style={styles.buttonGap} />
        <Button title="처음부터 다시 정리" variant="secondary" onPress={handleRestart} />
      </View>
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
    gap: spacing.base,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.displaySm,
    color: colors.textPrimary,
  },
  summary: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  highlight: {
    color: colors.deleteRed,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  buttonGap: {
    height: spacing.md,
  },
});
