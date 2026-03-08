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
    removeAssetById,
  } = usePhotoStore();

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Undo 타이머 정리 */
  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  /** 삭제 큐에 추가 (실제 삭제는 flush 시 일괄 수행) */
  const enqueue = useCallback(
    (asset: Asset) => {
      addPendingDelete(asset);
      setLastDeletedAsset(asset);
      setShowUndoToast(true);

      clearUndoTimer();
      undoTimerRef.current = setTimeout(() => {
        setShowUndoToast(false);
      }, CONSTANTS.UNDO_TIMEOUT);
    },
    [addPendingDelete, setLastDeletedAsset, setShowUndoToast, clearUndoTimer],
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

  /** 휴지통으로 이동 (세션 완료 시 호출) */
  const flush = useCallback(async () => {
    clearUndoTimer();
    setShowUndoToast(false);
    setLastDeletedAsset(null);

    const items = usePhotoStore.getState().pendingDeletes;
    if (items.length === 0) return;

    clearPendingDeletes();

    const { addToTrash } = useTrashStore.getState();
    for (const asset of items) {
      addToTrash(asset);
      removeAssetById(asset.id);
      incrementDeletedCount();
    }
  }, [clearUndoTimer, setShowUndoToast, setLastDeletedAsset, clearPendingDeletes, removeAssetById, incrementDeletedCount]);

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
