import { Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../styles/theme';
import { formatPhotoDate } from '../utils/dateFormatter';

interface PhotoDateProps {
  creationTime: number;
  style?: ViewStyle;
}

export default function PhotoDate({ creationTime, style }: PhotoDateProps) {
  const label = formatPhotoDate(new Date(creationTime * 1000));

  return (
    <Text style={[styles.date, style]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  date: {
    ...typography.bodySm,
    color: colors.textSecondary,
    backgroundColor: colors.overlay,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 9999,
    overflow: 'hidden',
    alignSelf: 'center',
  },
});
