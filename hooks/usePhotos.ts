import { useCallback, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { usePhotoStore } from '../stores/usePhotoStore';
import { CONSTANTS } from '../utils/constants';

export function usePhotos() {
  const {
    assets,
    currentIndex,
    totalCount,
    isLoading,
    endCursor,
    hasNextPage,
    setAssets,
    appendAssets,
    setCurrentIndex,
    setTotalCount,
    setIsLoading,
    setEndCursor,
    setHasNextPage,
    removeAssetById,
  } = usePhotoStore();

  /** 필터링된 사진 로드 (excludeIds 제외, afterCreationTime 이후) */
  const loadInitial = useCallback(
    async (excludeIds: Set<string>, afterCreationTime?: number) => {
      setIsLoading(true);
      try {
        const queryOptions: MediaLibrary.AssetsOptions = {
          first: CONSTANTS.PAGE_SIZE,
          mediaType: MediaLibrary.MediaType.photo,
          sortBy: [[MediaLibrary.SortBy.creationTime, true]],
        };

        if (afterCreationTime) {
          queryOptions.createdAfter = afterCreationTime;
        }

        let filtered: MediaLibrary.Asset[] = [];
        let cursor: string | undefined;
        let hasMore = true;
        let rawTotalCount = 0;

        // 필터링 루프: 충분한 사진이 모일 때까지 페이지 로드
        while (filtered.length < CONSTANTS.PAGE_SIZE && hasMore) {
          const result = await MediaLibrary.getAssetsAsync({
            ...queryOptions,
            after: cursor,
          });

          if (rawTotalCount === 0) {
            rawTotalCount = result.totalCount;
          }

          const newFiltered = result.assets.filter(
            (a) => !excludeIds.has(a.id),
          );
          filtered = [...filtered, ...newFiltered];
          cursor = result.endCursor;
          hasMore = result.hasNextPage;
        }

        const adjustedTotal = Math.max(0, rawTotalCount - excludeIds.size);

        setAssets(filtered);
        setTotalCount(adjustedTotal);
        setEndCursor(cursor);
        setHasNextPage(hasMore);
        setCurrentIndex(0);
      } finally {
        setIsLoading(false);
      }
    },
    [
      setAssets,
      setTotalCount,
      setEndCursor,
      setHasNextPage,
      setCurrentIndex,
      setIsLoading,
    ],
  );

  /** 다음 페이지 프리로드 (필터링 포함) */
  const loadMore = useCallback(
    async (excludeIds: Set<string>) => {
      if (!hasNextPage || isLoading || !endCursor) return;

      setIsLoading(true);
      try {
        let filtered: MediaLibrary.Asset[] = [];
        let cursor: string | undefined = endCursor;
        let hasMore = true;

        while (filtered.length < CONSTANTS.PAGE_SIZE && hasMore) {
          const result = await MediaLibrary.getAssetsAsync({
            first: CONSTANTS.PAGE_SIZE,
            after: cursor,
            mediaType: MediaLibrary.MediaType.photo,
            sortBy: [[MediaLibrary.SortBy.creationTime, true]],
          });

          const newFiltered = result.assets.filter(
            (a) => !excludeIds.has(a.id),
          );
          filtered = [...filtered, ...newFiltered];
          cursor = result.endCursor;
          hasMore = result.hasNextPage;
        }

        appendAssets(filtered);
        setEndCursor(cursor);
        setHasNextPage(hasMore);
      } finally {
        setIsLoading(false);
      }
    },
    [hasNextPage, isLoading, endCursor, appendAssets, setEndCursor, setHasNextPage, setIsLoading],
  );

  /** 남은 사진 수 체크 후 프리로드 트리거 */
  const checkAndPreload = useCallback(
    (excludeIds: Set<string>) => {
      const remaining = assets.length - currentIndex;
      if (remaining <= CONSTANTS.PRELOAD_THRESHOLD && hasNextPage) {
        loadMore(excludeIds);
      }
    },
    [assets.length, currentIndex, hasNextPage, loadMore],
  );

  const moveCount = useRef(0);

  /** 다음 사진으로 이동 */
  const moveToNext = useCallback(() => {
    const current = usePhotoStore.getState().currentIndex;
    const nextIndex = current + 1;
    setCurrentIndex(nextIndex);

    moveCount.current += 1;
    if (moveCount.current % CONSTANTS.TRIM_INTERVAL === 0) {
      usePhotoStore.getState().trimPastAssets();
    }

    return nextIndex;
  }, [setCurrentIndex]);

  /** 사진 삭제 (미디어 라이브러리에서) */
  const deleteAsset = useCallback(
    async (assetId: string): Promise<boolean> => {
      try {
        const success = await MediaLibrary.deleteAssetsAsync([assetId]);
        if (success) {
          removeAssetById(assetId);
        }
        return success;
      } catch {
        return false;
      }
    },
    [removeAssetById],
  );

  /** 현재 사진 */
  const currentAsset = assets[currentIndex] ?? null;

  /** 모든 사진을 정리했는지 */
  const isComplete = currentIndex >= assets.length && !hasNextPage;

  return {
    assets,
    currentIndex,
    currentAsset,
    totalCount,
    isLoading,
    isComplete,
    hasNextPage,
    loadInitial,
    loadMore,
    moveToNext,
    deleteAsset,
    checkAndPreload,
  };
}
