import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Logo from '../components/Logo';
import { colors, typography, spacing } from '../styles/theme';

function EmptyPhotoFrame() {
  return (
    <View style={illustStyles.container}>
      <Svg width={80} height={80} viewBox="0 0 80 80">
        <Rect
          x="4" y="4" width="72" height="72" rx="12"
          stroke={colors.textTertiary}
          strokeWidth={2}
          strokeDasharray="8 6"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const illustStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
});

export default function EmptyScreen() {
  return (
    <View style={styles.container}>
      {/* 상단 로고 */}
      <View style={styles.topLogo}>
        <Logo size={32} />
      </View>

      <View style={styles.content}>
        <EmptyPhotoFrame />
        <Text style={styles.title}>정리할 사진이 없어요</Text>
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
    backgroundColor: colors.backgroundDark,
  },
  topLogo: {
    alignItems: 'center',
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.headingLg,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
});
