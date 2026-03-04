import { useCallback, useRef } from 'react';
import { usePhotoStore } from '../stores/usePhotoStore';
import { CONSTANTS } from '../utils/constants';
import type { Asset } from 'expo-media-library';
import type { DeleteQueueItem } from '../types';

interface UseDeleteQueueOptions {
  onDelete: (assetId: string) => Promise<boolean>;
  onDeleteFailed?: () => void;
}

export function useDeleteQueue({ onDelete, onDeleteFailed }: UseDeleteQueueOptions) {
  const {
    deleteQueue,
    showUndoToast,
    setDeleteQueue,
    setShowUndoToast,
    incrementDeletedCount,
  } = usePhotoStore();

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Undo 타이머 정리 */
  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  /** 큐에 있는 아이템 실제 삭제 실행 */
  const flush = useCallback(
    async (item?: DeleteQueueItem | null) => {
      const target = item ?? deleteQueue;
      if (!target) return;

      clearUndoTimer();
      setShowUndoToast(false);
      setDeleteQueue(null);

      const success = await onDelete(target.asset.id);
      if (success) {
        incrementDeletedCount();
      } else {
        onDeleteFailed?.();
      }
    },
    [deleteQueue, clearUndoTimer, setShowUndoToast, setDeleteQueue, onDelete, incrementDeletedCount, onDeleteFailed],
  );

  /** 삭제 큐에 추가 (이전 큐는 즉시 flush) */
  const enqueue = useCallback(
    async (asset: Asset) => {
      // 이전 큐가 있으면 즉시 실행
      if (deleteQueue) {
        await flush(deleteQueue);
      }

      const newItem: DeleteQueueItem = {
        asset,
        timestamp: Date.now(),
      };

      setDeleteQueue(newItem);
      setShowUndoToast(true);

      // 3초 후 토스트 숨기기 (실제 삭제는 다음 스와이프 시)
      clearUndoTimer();
      undoTimerRef.current = setTimeout(() => {
        setShowUndoToast(false);
      }, CONSTANTS.UNDO_TIMEOUT);
    },
    [deleteQueue, flush, setDeleteQueue, setShowUndoToast, clearUndoTimer],
  );

  /** Undo: 큐 취소 + 사진 복귀 */
  const undo = useCallback((): Asset | null => {
    if (!deleteQueue) return null;

    const restoredAsset = deleteQueue.asset;
    clearUndoTimer();
    setDeleteQueue(null);
    setShowUndoToast(false);

    return restoredAsset;
  }, [deleteQueue, clearUndoTimer, setDeleteQueue, setShowUndoToast]);

  /** 큐 취소 (삭제하지 않고 비우기 — 앱 이탈 시) */
  const cancel = useCallback(() => {
    clearUndoTimer();
    setDeleteQueue(null);
    setShowUndoToast(false);
  }, [clearUndoTimer, setDeleteQueue, setShowUndoToast]);

  /** 유지 스와이프 시: 이전 큐 flush + 토스트 숨기기 */
  const flushOnKeep = useCallback(async () => {
    if (deleteQueue) {
      await flush(deleteQueue);
    }
    setShowUndoToast(false);
  }, [deleteQueue, flush, setShowUndoToast]);

  return {
    deleteQueue,
    showUndoToast,
    enqueue,
    undo,
    cancel,
    flush,
    flushOnKeep,
  };
}
