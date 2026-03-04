import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../styles/theme';

interface ProgressHeaderProps {
  current: number;
  total: number;
}

export default function ProgressHeader({ current, total }: ProgressHeaderProps) {
  const insets = useSafeAreaInsets();

  const formattedCurrent = current.toLocaleString();
  const formattedTotal = total.toLocaleString();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={styles.text}>
        <Text style={styles.current}>{formattedCurrent}</Text>
        <Text style={styles.separator}> / </Text>
        <Text style={styles.total}>{formattedTotal}</Text>
      </Text>
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
    alignItems: 'center',
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(15, 15, 20, 0.6)',
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
});
