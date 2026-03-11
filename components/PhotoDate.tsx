import { Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../styles/theme';
import { formatPhotoDate } from '../utils/dateFormatter';

interface PhotoDateProps {
  creationTime: number;
  style?: ViewStyle;
}

export default function PhotoDate({ creationTime, style }: PhotoDateProps) {
  const label = formatPhotoDate(new Date(creationTime));

  return (
    <Text style={[styles.date, style]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  date: {
    ...typography.bodySm,
    fontFamily: 'Pretendard-Medium',
    color: colors.textSecondary,
    backgroundColor: 'rgba(30, 27, 38, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(245,242,238,0.08)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 9999,
    overflow: 'hidden',
    alignSelf: 'center',
  },
});
