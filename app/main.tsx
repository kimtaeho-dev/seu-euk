import { useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhotos } from '../hooks/usePhotos';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useDeleteQueue } from '../hooks/useDeleteQueue';
import { useSession } from '../hooks/useSession';
import { usePhotoStore } from '../stores/usePhotoStore';
import SwipeCard from '../components/SwipeCard';
import ProgressHeader from '../components/ProgressHeader';
import PhotoDate from '../components/PhotoDate';
import UndoToast from '../components/UndoToast';
import { colors } from '../styles/theme';
import type { SwipeDecision } from '../types';

export default function MainScreen() {
  const router = useRouter();
  const {
    currentAsset,
    currentIndex,
    totalCount,
    isLoading,
    isComplete,
    loadInitial,
    moveToNext,
    deleteAsset,
  } = usePhotos();
  const { restore, save } = useSession();
  const { enqueue, undo, showUndoToast, flushOnKeep } = useDeleteQueue({
    onDelete: deleteAsset,
  });

  const handleSwipeComplete = useCallback(
    async (decision: SwipeDecision) => {
      if (!currentAsset) return;

      if (decision === 'delete') {
        await enqueue(currentAsset);
      } else {
        await flushOnKeep();
      }

      const nextIndex = moveToNext();

      // 세션 저장
      save({
        lastIndex: nextIndex,
        totalCount,
        deletedCount: usePhotoStore.getState().deletedCount,
        lastUpdated: Date.now(),
      });
    },
    [currentAsset, enqueue, flushOnKeep, moveToNext, save, totalCount],
  );

  const swipe = useSwipeGesture({
    onSwipe: handleSwipeComplete,
    enabled: !!currentAsset,
  });

  const handleUndo = useCallback(() => {
    const restored = undo();
    if (restored) {
      // 이전 사진으로 복귀
      const store = usePhotoStore.getState();
      store.setCurrentIndex(Math.max(0, store.currentIndex - 1));
      swipe.animateIn();
    }
  }, [undo, swipe]);

  // 초기 로드
  useEffect(() => {
    const init = async () => {
      const savedSession = await restore();
      const startIndex = savedSession ? savedSession.lastIndex : 0;
      await loadInitial(startIndex);
    };
    init();
  }, []);

  // 완료 체크
  useEffect(() => {
    if (isComplete && !isLoading) {
      router.replace('/complete');
    }
  }, [isComplete, isLoading, router]);

  // 새 사진 전환 시 animateIn
  useEffect(() => {
    if (currentAsset) {
      swipe.animateIn();
    }
  }, [currentAsset?.id]);

  if (isLoading && !currentAsset) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentStart} />
      </View>
    );
  }

  if (!currentAsset) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* 진척도 헤더 */}
      <ProgressHeader current={currentIndex + 1} total={totalCount} />

      {/* 스와이프 카드 */}
      <SwipeCard asset={currentAsset} swipe={swipe} />

      {/* 날짜 표시 */}
      <View style={styles.dateContainer}>
        <PhotoDate creationTime={currentAsset.creationTime} />
      </View>

      {/* Undo 토스트 */}
      <UndoToast
        visible={showUndoToast}
        onUndo={handleUndo}
        onDismiss={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
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
