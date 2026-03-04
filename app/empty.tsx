import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../styles/theme';

export default function EmptyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 빈 상태 아이콘 */}
        <Ionicons name="image-outline" size={64} color={colors.textDarkSecondary} />

        {/* 안내 텍스트 */}
        <Text style={styles.title}>정리할 사진이 없습니다</Text>
        <Text style={styles.subtitle}>
          사진을 촬영한 후 다시 시도해주세요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.headingLg,
    color: colors.textDarkPrimary,
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textDarkSecondary,
  },
});
