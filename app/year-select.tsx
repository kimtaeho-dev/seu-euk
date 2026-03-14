import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import { CONSTANTS } from '../utils/constants';

const START_YEAR = 2010;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i,
);

export default function YearSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const navigateByPermission = useCallback(async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted' || status === 'limited') {
      router.replace('/main');
    } else {
      router.replace('/permission');
    }
  }, [router]);

  const handleSelectYear = useCallback(async () => {
    if (selectedYear === null) return;
    await AsyncStorage.setItem(
      CONSTANTS.SELECTED_START_YEAR_KEY,
      String(selectedYear),
    );
    navigateByPermission();
  }, [selectedYear, navigateByPermission]);

  const handleFromStart = useCallback(() => {
    navigateByPermission();
  }, [navigateByPermission]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 로고 + 타이틀 */}
        <View style={styles.header}>
          <Logo size={56} />
          <Text style={styles.title}>어떤 시절부터{'\n'}정리할까요?</Text>
        </View>

        {/* 연도 그리드 (4열) */}
        <View style={styles.yearGrid}>
          {YEARS.map((year) => {
            const isSelected = selectedYear === year;
            return (
              <Pressable
                key={year}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {year}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View
        style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Button
          title={
            selectedYear ? `${selectedYear}년부터 정리` : '연도를 선택해주세요'
          }
          onPress={handleSelectYear}
          disabled={selectedYear === null}
        />
        <Button
          title="처음부터 정리"
          variant="text"
          onPress={handleFromStart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  header: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.headingLg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  chip: {
    width: '22%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(245, 242, 238, 0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accent,
    fontFamily: 'Pretendard-SemiBold',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
});
