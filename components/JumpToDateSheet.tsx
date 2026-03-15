import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { getOldestPhotoYear, findPhotoByDate } from '../utils/mediaQuery';

interface JumpToDateSheetProps {
  visible: boolean;
  onClose: () => void;
  onJump: (targetCreationTime?: number) => void;
  currentPhotoDate?: number;
}

const ANIMATION_DURATION = 300;
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function JumpToDateSheet({
  visible,
  onClose,
  onJump,
  currentPhotoDate,
}: JumpToDateSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(600);
  const overlayOpacity = useSharedValue(0);

  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const [previewAsset, setPreviewAsset] = useState<MediaLibrary.Asset | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewCreationTime, setPreviewCreationTime] = useState<number | undefined>();
  const [previewDate, setPreviewDate] = useState<Date | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);

  // 현재 사진의 연도 계산
  useEffect(() => {
    if (currentPhotoDate) {
      setCurrentYear(new Date(currentPhotoDate).getFullYear());
    }
  }, [currentPhotoDate]);

  // 시트 열릴 때 연도 범위 로드
  useEffect(() => {
    if (!visible) return;

    const loadDateRange = async () => {
      setIsLoadingYears(true);
      try {
        const oldestYear = await getOldestPhotoYear();
        if (oldestYear !== null) {
          const currentYear = new Date().getFullYear();
          const yearList: number[] = [];
          for (let y = currentYear; y >= oldestYear; y--) {
            yearList.push(y);
          }
          setYears(yearList);
        }
      } finally {
        setIsLoadingYears(false);
      }
    };

    loadDateRange();
  }, [visible]);

  // 시트 애니메이션
  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(600, {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
      });
      // 상태 리셋
      setSelectedYear(null);
      setSelectedMonth(null);
      setPreviewAsset(null);
      setPreviewUri(null);
      setPreviewDate(null);
      setPreviewCreationTime(undefined);
    }
  }, [visible, overlayOpacity, translateY]);

  // 월 선택 시 미리보기 로드
  useEffect(() => {
    if (selectedYear === null || selectedMonth === null) return;

    const loadPreview = async () => {
      setIsLoadingPreview(true);
      setPreviewAsset(null);
      setPreviewUri(null);
      setPreviewDate(null);
      setPreviewCreationTime(undefined);

      try {
        // 선택한 월의 다음 달 1일 = 해당 월 전체 포함 (createdBefore 기준)
        const targetDate = new Date(selectedYear, selectedMonth + 1, 1);
        const result = await findPhotoByDate(targetDate);

        setPreviewCreationTime(result.creationTime);
        setPreviewAsset(result.asset);
        if (result.asset) {
          setPreviewDate(new Date(result.asset.creationTime));
          const info = await MediaLibrary.getAssetInfoAsync(result.asset.id);
          setPreviewUri(info.localUri ?? result.asset.uri);
        }
      } finally {
        setIsLoadingPreview(false);
      }
    };

    loadPreview();
  }, [selectedYear, selectedMonth]);

  const handleYearPress = useCallback((year: number) => {
    setSelectedYear(year);
    setSelectedMonth(null);
    setPreviewAsset(null);
    setPreviewDate(null);
    setPreviewCreationTime(undefined);
  }, []);

  const handleMonthPress = useCallback((monthIndex: number) => {
    setSelectedMonth(monthIndex);
  }, []);

  const handleJump = useCallback(() => {
    onJump(previewCreationTime);
  }, [onJump, previewCreationTime]);

  const handleResetToStart = useCallback(() => {
    onJump(undefined);
  }, [onJump]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 오버레이 */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* 시트 */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + spacing.base },
          sheetStyle,
        ]}
      >
        {/* 핸들 */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* 제목 */}
        <Text style={styles.title}>어디서부터 정리할까요?</Text>

        {isLoadingYears ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : (
          <>
            {/* 연도 칩 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yearContainer}
              style={styles.yearScroll}
            >
              {years.map((year) => {
                const isSelected = selectedYear === year;
                const isCurrent = currentYear === year;
                return (
                  <Pressable
                    key={year}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                      !isSelected && isCurrent && styles.chipCurrent,
                    ]}
                    onPress={() => handleYearPress(year)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                        !isSelected && isCurrent && styles.chipTextCurrent,
                      ]}
                    >
                      {year}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* 월 그리드 */}
            {selectedYear !== null && (
              <View style={styles.monthGrid}>
                {MONTHS.map((label, idx) => {
                  const isSelected = selectedMonth === idx;
                  return (
                    <Pressable
                      key={idx}
                      style={[
                        styles.monthChip,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => handleMonthPress(idx)}
                    >
                      <Text
                        style={[
                          styles.monthChipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* 미리보기 */}
            {selectedMonth !== null && (
              <View style={styles.previewSection}>
                {isLoadingPreview ? (
                  <ActivityIndicator color={colors.accent} style={styles.loader} />
                ) : previewAsset ? (
                  <View style={styles.previewCard}>
                    <Image
                      source={{ uri: previewUri ?? undefined }}
                      style={styles.thumbnail}
                    />
                    <View style={styles.previewInfo}>
                      <Text style={styles.previewDate}>
                        {previewDate
                          ? `${previewDate.getFullYear()}년 ${previewDate.getMonth() + 1}월 ${previewDate.getDate()}일`
                          : ''}
                      </Text>
                      <Text style={styles.previewIndex}>
                        이 사진부터 정리 시작
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noPhotoText}>해당 시점의 사진이 없습니다</Text>
                )}
              </View>
            )}

            {/* 버튼 */}
            {selectedMonth !== null && previewAsset && !isLoadingPreview && (
              <View style={styles.buttonSection}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleJump}
                >
                  <Text style={styles.primaryButtonText}>여기서부터 정리</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.textButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleResetToStart}
                >
                  <Text style={styles.textButtonText}>처음부터 정리</Text>
                </Pressable>
              </View>
            )}

            {/* 연도 선택 전 또는 월 미선택 시 처음부터 버튼만 표시 */}
            {(selectedYear === null || (selectedMonth === null && selectedYear !== null)) && (
              <View style={styles.buttonSection}>
                <Pressable
                  style={({ pressed }) => [
                    styles.textButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleResetToStart}
                >
                  <Text style={styles.textButtonText}>처음부터 정리</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 100,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 27, 38, 0.95)',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.divider,
    zIndex: 101,
    ...shadows.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
  },
  title: {
    ...typography.headingSm,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  yearScroll: {
    maxHeight: 44,
    marginBottom: spacing.base,
  },
  yearContainer: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(245, 242, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipCurrent: {
    borderColor: colors.textTertiary,
  },
  chipText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accent,
    fontFamily: 'Pretendard-SemiBold',
  },
  chipTextCurrent: {
    color: colors.textPrimary,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  monthChip: {
    width: '22%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(245, 242, 238, 0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monthChipText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  previewSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
    minHeight: 72,
    justifyContent: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 242, 238, 0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceDark,
  },
  previewInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  previewDate: {
    ...typography.bodySm,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.textPrimary,
  },
  previewIndex: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  noPhotoText: {
    ...typography.bodySm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  loader: {
    paddingVertical: spacing.lg,
  },
  buttonSection: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.bodyLg,
    fontFamily: 'Pretendard-SemiBold',
    color: '#FFFFFF',
  },
  textButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  textButtonText: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
