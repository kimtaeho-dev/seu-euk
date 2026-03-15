import { useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { CONSTANTS } from '../utils/constants';

// 모듈 레벨 상태 — 모든 hook 인스턴스가 동일 데이터 공유
let album: MediaLibrary.Album | null = null;
let sortedIds = new Set<string>();
let pendingIds: string[] = [];

export function useSortedAlbum() {
  /** 앨범 조회 + 모든 asset ID를 Set으로 로드 */
  const initialize = useCallback(async (): Promise<Set<string>> => {
    sortedIds = new Set();

    const found = await MediaLibrary.getAlbumAsync(CONSTANTS.SORTED_ALBUM_NAME);
    album = found;

    if (!found) {
      return sortedIds;
    }

    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        album: found,
        first: CONSTANTS.SORTED_ALBUM_BATCH,
        after: cursor,
        mediaType: MediaLibrary.MediaType.photo,
      });

      for (const asset of result.assets) {
        sortedIds.add(asset.id);
      }

      cursor = result.endCursor;
      hasMore = result.hasNextPage;
    }

    return sortedIds;
  }, []);

  /** 실제 앨범 쓰기 (배치) — ID로 앨범에 추가 */
  const flushPending = useCallback(async () => {
    const ids = pendingIds;
    if (ids.length === 0) return;

    pendingIds = [];

    try {
      if (!album) {
        const [first, ...rest] = ids;
        album = await MediaLibrary.createAlbumAsync(
          CONSTANTS.SORTED_ALBUM_NAME,
          first,
          false,
        );
        if (rest.length > 0) {
          await MediaLibrary.addAssetsToAlbumAsync(rest, album, false);
        }
      } else {
        await MediaLibrary.addAssetsToAlbumAsync(ids, album, false);
      }
    } catch (e) {
      console.warn('[useSortedAlbum] flush failed:', e);
    }
  }, []);

  /** 유지 사진 추가 (메모리에 ID만 축적) */
  const addToSorted = useCallback(
    (asset: MediaLibrary.Asset) => {
      sortedIds.add(asset.id);
      pendingIds.push(asset.id);
    },
    [],
  );

  /** 현재 정리완료 ID Set 반환 */
  const getSortedIds = useCallback((): Set<string> => {
    return sortedIds;
  }, []);

  /** 정리완료 수 반환 */
  const getSortedCount = useCallback((): number => {
    return sortedIds.size;
  }, []);

  /** 앱 이탈/세션 종료 시 앨범 flush */
  const forceFlush = useCallback(() => {
    flushPending();
  }, [flushPending]);

  return {
    initialize,
    addToSorted,
    getSortedIds,
    getSortedCount,
    forceFlush,
  };
}
