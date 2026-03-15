import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { usePhotos } from '../hooks/usePhotos';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useDeleteQueue } from '../hooks/useDeleteQueue';
import { useSession } from '../hooks/useSession';
import { useSortedAlbum } from '../hooks/useSortedAlbum';
import { usePhotoStore } from '../stores/usePhotoStore';
import { useTrashStore } from '../stores/useTrashStore';
import { CONSTANTS } from '../utils/constants';
import { findPhotoByDate } from '../utils/mediaQuery';
import SwipeCard from '../components/SwipeCard';
import ProgressHeader from '../components/ProgressHeader';
import PhotoDate from '../components/PhotoDate';
import UndoToast from '../components/UndoToast';
import JumpToDateSheet from '../components/JumpToDateSheet';
import Logo from '../components/Logo';
import { colors } from '../styles/theme';
import type { SwipeDecision } from '../types';

function BrandPulseLoader() {
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.9 + pulse.value * 0.1 }],
  }));

  return (
    <Animated.View style={[loaderStyles.container, animatedStyle]}>
      <Logo size={48} />
    </Animated.View>
  );
}

const loaderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
  },
});

export default function MainScreen() {
  useKeepAwake();
  const router = useRouter();
  const {
    assets,
    currentAsset,
    currentIndex,
    totalCount,
    isLoading,
    isComplete,
    loadInitial,
    moveToNext,
    checkAndPreload,
  } = usePhotos();

  const processedCount = usePhotoStore((s) => s.processedCount);
  const incrementProcessedCount = usePhotoStore((s) => s.incrementProcessedCount);
  const decrementProcessedCount = usePhotoStore((s) => s.decrementProcessedCount);

  const nextAsset = assets[currentIndex + 1] ?? undefined;
  const { restore, save } = useSession();
  const { enqueue, undo, showUndoToast, flush } = useDeleteQueue();
  const sortedAlbum = useSortedAlbum();
  const [showJumpSheet, setShowJumpSheet] = useState(false);

  // excludeIds를 ref로 유지하여 loadMore/checkAndPreload에서 재사용
  const excludeIdsRef = useRef<Set<string>>(new Set());
  const keptCountRef = useRef(0);
  const startCreationTimeRef = useRef<number | undefined>(undefined);
  const isCompletingRef = useRef(false);

  const handleJump = useCallback(
    async (targetCreationTime?: number) => {
      setShowJumpSheet(false);
      await flush();
      usePhotoStore.getState().reset();
      startCreationTimeRef.current = targetCreationTime;
      await loadInitial(excludeIdsRef.current, targetCreationTime);
      save({
        lastIndex: 0,
        lastCreationTime: targetCreationTime,
        startCreationTime: targetCreationTime,
        totalCount,
        deletedCount: 0,
        keptCount: keptCountRef.current,
        lastUpdated: Date.now(),
      });
    },
    [flush, loadInitial, save, totalCount],
  );

  const handleSwipeComplete = useCallback(
    (decision: SwipeDecision) => {
      const store = usePhotoStore.getState();
      const asset = store.assets[store.currentIndex];
      if (!asset) return;

      if (decision === 'delete') {
        enqueue(asset);
        excludeIdsRef.current.add(asset.id);
      } else if (decision === 'keep') {
        sortedAlbum.addToSorted(asset);
        // keep한 asset도 excludeIds에 추가 (다음 loadMore에서 필터링)
        excludeIdsRef.current.add(asset.id);
        keptCountRef.current += 1;
      }

      incrementProcessedCount();
      const nextIndex = moveToNext();
      checkAndPreload(excludeIdsRef.current);

      save({
        lastIndex: nextIndex,
        lastAssetId: asset.id,
        lastCreationTime: asset.creationTime,
        startCreationTime: startCreationTimeRef.current,
        totalCount,
        deletedCount: usePhotoStore.getState().deletedCount,
        keptCount: keptCountRef.current,
        lastUpdated: Date.now(),
      });
    },
    [enqueue, moveToNext, checkAndPreload, save, totalCount, sortedAlbum],
  );

  const swipe = useSwipeGesture({
    onSwipe: handleSwipeComplete,
    enabled: !!currentAsset,
  });

  const handleUndo = useCallback(() => {
    const restored = undo();
    if (restored) {
      const store = usePhotoStore.getState();
      store.setCurrentIndex(Math.max(0, store.currentIndex - 1));
      excludeIdsRef.current.delete(restored.id);
      decrementProcessedCount();
      swipe.resetPosition();
    }
  }, [undo, swipe, decrementProcessedCount]);

  useEffect(() => {
    const init = async () => {
      // 1. 앨범 ID Set 로드
      const sortedIds = await sortedAlbum.initialize();

      // 2. 휴지통 ID Set 합산
      const trashIds = new Set(
        useTrashStore.getState().trashItems.map((t) => t.asset.id),
      );
      const excludeIds = new Set([...sortedIds, ...trashIds]);
      excludeIdsRef.current = excludeIds;
      keptCountRef.current = sortedIds.size;

      // 3. 세션 복원
      const savedSession = await restore();

      if (savedSession?.lastCreationTime) {
        // creationTime 기반 세션 복원 (totalCount는 원래 시작 시점 기준)
        startCreationTimeRef.current = savedSession.startCreationTime;
        await loadInitial(
          excludeIds,
          savedSession.lastCreationTime,
          savedSession.startCreationTime,
        );
        if (savedSession.keptCount) {
          keptCountRef.current = savedSession.keptCount;
        }
        return;
      }

      // 세션 없을 때: 연도 선택 확인 (1회성)
      const selectedYear = await AsyncStorage.getItem(
        CONSTANTS.SELECTED_START_YEAR_KEY,
      );
      if (selectedYear) {
        await AsyncStorage.removeItem(CONSTANTS.SELECTED_START_YEAR_KEY);
        const targetDate = new Date(Number(selectedYear), 0, 1);
        const result = await findPhotoByDate(targetDate);
        startCreationTimeRef.current = result.creationTime;
        await loadInitial(excludeIds, result.creationTime);
        return;
      }

      // 처음부터 시작
      await loadInitial(excludeIds);
    };
    init();
  }, []);

  useEffect(() => {
    if (isLoading || isCompletingRef.current) return;

    if (isComplete || (!currentAsset && totalCount > 0)) {
      isCompletingRef.current = true;
      sortedAlbum.forceFlush();
      flush().then(() => {
        router.replace('/complete');
      });
    } else if (!currentAsset && totalCount === 0) {
      router.replace('/empty');
    }
  }, [isComplete, isLoading, currentAsset, totalCount, router, flush, sortedAlbum]);

  // 다음 N장 이미지 프리페치 (현재 윈도우만 추적하여 메모리 절약)
  const prefetchedRef = useRef(new Set<string>());
  useEffect(() => {
    const upcoming = assets.slice(
      currentIndex + 1,
      currentIndex + 1 + CONSTANTS.IMAGE_PREFETCH_COUNT,
    );
    const uris = upcoming
      .map((a) => a.uri)
      .filter((uri) => !prefetchedRef.current.has(uri));

    if (uris.length > 0) {
      // 이전 프리페치 기록 초기화하여 Set 무한 증가 방지
      const currentUris = new Set(upcoming.map((a) => a.uri));
      prefetchedRef.current = currentUris;
      Image.prefetch(uris);
    }
  }, [assets, currentIndex]);

  useEffect(() => {
    if (currentAsset) {
      swipe.resetPosition();
    }
  }, [currentAsset?.id]);

  if (isLoading && !currentAsset) {
    return <BrandPulseLoader />;
  }

  if (!currentAsset) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <ProgressHeader
        current={processedCount + 1}
        total={totalCount}
        onCounterPress={() => setShowJumpSheet(true)}
      />
      <SwipeCard asset={currentAsset} nextAsset={nextAsset} swipe={swipe} />
      <View style={styles.dateContainer}>
        <PhotoDate creationTime={currentAsset.creationTime} />
      </View>
      <UndoToast
        visible={showUndoToast}
        onUndo={handleUndo}
        onDismiss={() => {}}
      />
      <JumpToDateSheet
        visible={showJumpSheet}
        onClose={() => setShowJumpSheet(false)}
        onJump={handleJump}
        currentPhotoDate={currentAsset?.creationTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  dateContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});
