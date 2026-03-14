import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTrashStore } from '../stores/useTrashStore';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

interface ProgressHeaderProps {
  current: number;
  total: number;
  onCounterPress?: () => void;
}

export default function ProgressHeader({ current, total, onCounterPress }: ProgressHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const trashCount = useTrashStore((s) => s.trashItems.length);

  const formattedCurrent = current.toLocaleString();
  const formattedTotal = total.toLocaleString();
  const progress = total > 0 ? Math.min(current / total, 1) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* 프로그레스 바 */}
      <View style={styles.progressBar}>
        <LinearGradient
          colors={[colors.accentStart, colors.accentEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      {/* 카운터 + 휴지통 */}
      <View style={styles.row}>
        <Pressable
          style={styles.calendarButton}
          onPress={onCounterPress}
          disabled={!onCounterPress}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.accent} />
        </Pressable>
        <Text style={styles.text}>
          <Text style={styles.current}>{formattedCurrent}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.total}>{formattedTotal}</Text>
        </Text>
        <Pressable
          style={styles.trashButton}
          onPress={() => router.push('/trash')}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
          {trashCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {trashCount > 99 ? '99+' : trashCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(19, 17, 24, 0.6)',
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.base,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  calendarButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.caption,
  },
  current: {
    ...typography.caption,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.textPrimary,
  },
  separator: {
    color: colors.textTertiary,
  },
  total: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  trashButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: colors.deleteRed,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontFamily: 'Pretendard-Bold',
  },
});
