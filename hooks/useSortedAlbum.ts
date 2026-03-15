import { useRef, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { CONSTANTS } from '../utils/constants';

export function useSortedAlbum() {
  const albumRef = useRef<MediaLibrary.Album | null>(null);
  const sortedIdsRef = useRef<Set<string>>(new Set());
  const pendingAssetsRef = useRef<MediaLibrary.Asset[]>([]);

  /** 앨범 조회 + 모든 asset ID를 Set으로 로드 */
  const initialize = useCallback(async (): Promise<Set<string>> => {
    sortedIdsRef.current = new Set();

    const album = await MediaLibrary.getAlbumAsync(CONSTANTS.SORTED_ALBUM_NAME);
    albumRef.current = album;

    if (!album) {
      return sortedIdsRef.current;
    }

    // 배치로 앨범 내 모든 asset ID 로드
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        album,
        first: CONSTANTS.SORTED_ALBUM_BATCH,
        after: cursor,
        mediaType: MediaLibrary.MediaType.photo,
      });

      for (const asset of result.assets) {
        sortedIdsRef.current.add(asset.id);
      }

      cursor = result.endCursor;
      hasMore = result.hasNextPage;
    }

    return sortedIdsRef.current;
  }, []);

  /** 실제 앨범 쓰기 (배치) */
  const flushPending = useCallback(async () => {
    const assets = pendingAssetsRef.current;
    if (assets.length === 0) return;

    pendingAssetsRef.current = [];

    try {
      if (!albumRef.current) {
        // 첫 keep: 앨범 생성 (첫 번째 asset으로)
        const [first, ...rest] = assets;
        albumRef.current = await MediaLibrary.createAlbumAsync(
          CONSTANTS.SORTED_ALBUM_NAME,
          first,
          false,
        );
        if (rest.length > 0) {
          await MediaLibrary.addAssetsToAlbumAsync(rest, albumRef.current, false);
        }
      } else {
        await MediaLibrary.addAssetsToAlbumAsync(assets, albumRef.current, false);
      }
    } catch (e) {
      // 실패 시 다음 배치에 재시도
      console.warn('[useSortedAlbum] flush failed:', e);
    }
  }, []);

  /** 유지 사진 추가 (메모리에만 축적, 앨범 쓰기는 forceFlush 시에만) */
  const addToSorted = useCallback(
    (asset: MediaLibrary.Asset) => {
      sortedIdsRef.current.add(asset.id);
      pendingAssetsRef.current.push(asset);
    },
    [],
  );

  /** 현재 정리완료 ID Set 반환 */
  const getSortedIds = useCallback((): Set<string> => {
    return sortedIdsRef.current;
  }, []);

  /** 정리완료 수 반환 */
  const getSortedCount = useCallback((): number => {
    return sortedIdsRef.current.size;
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
