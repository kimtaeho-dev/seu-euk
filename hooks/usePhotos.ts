import { useCallback } from 'react';
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

  /** 첫 페이지 로드 (오래된 순) */
  const loadInitial = useCallback(
    async (startIndex: number = 0) => {
      setIsLoading(true);
      try {
        const result = await MediaLibrary.getAssetsAsync({
          first: CONSTANTS.PAGE_SIZE,
          mediaType: MediaLibrary.MediaType.photo,
          sortBy: [MediaLibrary.SortBy.creationTime],
        });

        let allAssets = [...result.assets];
        let cursor = result.endCursor;
        let hasMore = result.hasNextPage;

        // startIndex까지 필요한 만큼 추가 로드
        while (allAssets.length <= startIndex && hasMore) {
          const nextResult = await MediaLibrary.getAssetsAsync({
            first: CONSTANTS.PAGE_SIZE,
            after: cursor,
            mediaType: MediaLibrary.MediaType.photo,
            sortBy: [MediaLibrary.SortBy.creationTime],
          });
          allAssets = [...allAssets, ...nextResult.assets];
          cursor = nextResult.endCursor;
          hasMore = nextResult.hasNextPage;
        }

        setAssets(allAssets);
        setTotalCount(result.totalCount);
        setEndCursor(cursor);
        setHasNextPage(hasMore);
        setCurrentIndex(Math.min(startIndex, allAssets.length - 1));
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

  /** 다음 페이지 프리로드 */
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoading || !endCursor) return;

    setIsLoading(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first: CONSTANTS.PAGE_SIZE,
        after: endCursor,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      appendAssets(result.assets);
      setEndCursor(result.endCursor);
      setHasNextPage(result.hasNextPage);
    } finally {
      setIsLoading(false);
    }
  }, [hasNextPage, isLoading, endCursor, appendAssets, setEndCursor, setHasNextPage, setIsLoading]);

  /** 남은 사진 수 체크 후 프리로드 트리거 */
  const checkAndPreload = useCallback(() => {
    const remaining = assets.length - currentIndex;
    if (remaining <= CONSTANTS.PRELOAD_THRESHOLD && hasNextPage) {
      loadMore();
    }
  }, [assets.length, currentIndex, hasNextPage, loadMore]);

  /** 다음 사진으로 이동 */
  const moveToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    checkAndPreload();
    return nextIndex;
  }, [currentIndex, setCurrentIndex, checkAndPreload]);

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
  };
}
