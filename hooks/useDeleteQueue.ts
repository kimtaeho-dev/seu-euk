import { useCallback, useRef } from 'react';
import { usePhotoStore } from '../stores/usePhotoStore';
import { useTrashStore } from '../stores/useTrashStore';
import { CONSTANTS } from '../utils/constants';
import type { Asset } from 'expo-media-library';

interface UseDeleteQueueOptions {
  onDeleteFailed?: () => void;
}

export function useDeleteQueue({ onDeleteFailed }: UseDeleteQueueOptions = {}) {
  const {
    pendingDeletes,
    lastDeletedAsset,
    showUndoToast,
    addPendingDelete,
    removePendingDelete,
    clearPendingDeletes,
    setLastDeletedAsset,
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

  /** 이전 대기 항목을 휴지통으로 즉시 이동 (assets 배열은 건드리지 않음 — trimPastAssets가 정리) */
  const flushPrevious = useCallback(() => {
    const items = usePhotoStore.getState().pendingDeletes;
    if (items.length === 0) return;

    const { addToTrash } = useTrashStore.getState();
    clearPendingDeletes();
    for (const asset of items) {
      addToTrash(asset);
      incrementDeletedCount();
    }
  }, [clearPendingDeletes, incrementDeletedCount]);

  /** 삭제 큐에 추가 (이전 항목은 즉시 휴지통으로 이동) */
  const enqueue = useCallback(
    (asset: Asset) => {
      // 정책: 큐 최대 1개, 새 삭제 시 이전 큐 즉시 실행
      flushPrevious();

      addPendingDelete(asset);
      setLastDeletedAsset(asset);
      setShowUndoToast(true);

      clearUndoTimer();
      undoTimerRef.current = setTimeout(() => {
        setShowUndoToast(false);
        flushPrevious();
      }, CONSTANTS.UNDO_TIMEOUT);
    },
    [flushPrevious, addPendingDelete, setLastDeletedAsset, setShowUndoToast, clearUndoTimer],
  );

  /** Undo: 마지막 삭제 취소 */
  const undo = useCallback((): Asset | null => {
    if (!lastDeletedAsset) return null;

    const restoredAsset = lastDeletedAsset;
    removePendingDelete(restoredAsset.id);
    clearUndoTimer();
    setLastDeletedAsset(null);
    setShowUndoToast(false);

    return restoredAsset;
  }, [lastDeletedAsset, removePendingDelete, clearUndoTimer, setLastDeletedAsset, setShowUndoToast]);

  /** 남은 대기 항목을 휴지통으로 이동 (세션 완료 시 호출) */
  const flush = useCallback(async () => {
    clearUndoTimer();
    setShowUndoToast(false);
    setLastDeletedAsset(null);
    flushPrevious();
  }, [clearUndoTimer, setShowUndoToast, setLastDeletedAsset, flushPrevious]);

  /** 큐 취소 (삭제하지 않고 비우기 — 앱 이탈 시) */
  const cancel = useCallback(() => {
    clearUndoTimer();
    clearPendingDeletes();
    setLastDeletedAsset(null);
    setShowUndoToast(false);
  }, [clearUndoTimer, clearPendingDeletes, setLastDeletedAsset, setShowUndoToast]);

  return {
    pendingDeletes,
    showUndoToast,
    enqueue,
    undo,
    cancel,
    flush,
  };
}
