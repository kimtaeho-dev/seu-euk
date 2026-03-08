import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrashStore } from '../stores/useTrashStore';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

interface ProgressHeaderProps {
  current: number;
  total: number;
}

export default function ProgressHeader({ current, total }: ProgressHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const trashCount = useTrashStore((s) => s.trashItems.length);

  const formattedCurrent = current.toLocaleString();
  const formattedTotal = total.toLocaleString();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.spacer} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: 'rgba(15, 15, 20, 0.6)',
  },
  spacer: {
    width: 36,
  },
  text: {
    ...typography.bodySm,
  },
  current: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  separator: {
    color: colors.textTertiary,
  },
  total: {
    ...typography.bodySm,
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
    fontWeight: '700',
  },
});
