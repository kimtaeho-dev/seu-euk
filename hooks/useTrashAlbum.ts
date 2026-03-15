import { useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { CONSTANTS } from '../utils/constants';

// 모듈 레벨 상태 — 모든 hook 인스턴스가 동일 데이터 공유
let album: MediaLibrary.Album | null = null;
let trashIds = new Set<string>();
let pendingIds: string[] = [];

export function useTrashAlbum() {
  /** 앨범 조회 + 모든 asset ID를 Set으로 로드 */
  const initialize = useCallback(async (): Promise<Set<string>> => {
    trashIds = new Set();

    const found = await MediaLibrary.getAlbumAsync(CONSTANTS.TRASH_ALBUM_NAME);
    album = found;

    if (!found) {
      return trashIds;
    }

    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        album: found,
        first: CONSTANTS.TRASH_ALBUM_BATCH,
        mediaType: MediaLibrary.MediaType.photo,
        after: cursor,
      });

      for (const asset of result.assets) {
        trashIds.add(asset.id);
      }

      cursor = result.endCursor;
      hasMore = result.hasNextPage;
    }

    return trashIds;
  }, []);

  /** 휴지통에 추가 (메모리에 ID만 축적) */
  const addToTrash = useCallback((assetId: string) => {
    trashIds.add(assetId);
    pendingIds.push(assetId);
  }, []);

  /** 실제 앨범 쓰기 (배치) */
  const flushPending = useCallback(async () => {
    const ids = pendingIds;
    if (ids.length === 0) return;

    pendingIds = [];

    try {
      if (!album) {
        const [first, ...rest] = ids;
        album = await MediaLibrary.createAlbumAsync(
          CONSTANTS.TRASH_ALBUM_NAME,
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
      console.warn('[useTrashAlbum] flush failed:', e);
    }
  }, []);

  /** 앨범에서 사진 제거 (라이브러리에는 유지) */
  const removeFromTrash = useCallback(async (assetId: string) => {
    trashIds.delete(assetId);
    if (album) {
      try {
        await MediaLibrary.removeAssetsFromAlbumAsync([assetId], album);
      } catch (e) {
        console.warn('[useTrashAlbum] removeFromTrash failed:', e);
      }
    }
  }, []);

  /** 앨범의 모든 사진을 OS에서 삭제 */
  const deleteAll = useCallback(async () => {
    if (!album) return;

    const ids: string[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        album,
        first: CONSTANTS.TRASH_ALBUM_BATCH,
        after: cursor,
      });
      for (const asset of result.assets) {
        ids.push(asset.id);
      }
      cursor = result.endCursor;
      hasMore = result.hasNextPage;
    }

    if (ids.length > 0) {
      await MediaLibrary.deleteAssetsAsync(ids);
    }

    trashIds = new Set();
    album = null;
  }, []);

  /** 앨범의 모든 사진을 복원 (앨범에서만 제거) */
  const restoreAll = useCallback(async () => {
    if (!album) {
      trashIds = new Set();
      return;
    }

    const ids: string[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        album,
        first: CONSTANTS.TRASH_ALBUM_BATCH,
        after: cursor,
      });
      for (const asset of result.assets) {
        ids.push(asset.id);
      }
      cursor = result.endCursor;
      hasMore = result.hasNextPage;
    }

    if (ids.length > 0) {
      await MediaLibrary.removeAssetsFromAlbumAsync(ids, album);
    }

    trashIds = new Set();
  }, []);

  /** 휴지통 사진 목록 조회 (trash 화면용) */
  const getTrashAssets = useCallback(async (): Promise<MediaLibrary.Asset[]> => {
    if (!album) return [];

    const assets: MediaLibrary.Asset[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await MediaLibrary.getAssetsAsync({
        album,
        first: CONSTANTS.TRASH_ALBUM_BATCH,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        after: cursor,
      });
      assets.push(...result.assets);
      cursor = result.endCursor;
      hasMore = result.hasNextPage;
    }

    return assets;
  }, []);

  /** 휴지통 사진 수 */
  const getTrashCount = useCallback((): number => {
    return trashIds.size;
  }, []);

  /** 앱 이탈/세션 종료 시 앨범 flush */
  const forceFlush = useCallback(() => {
    flushPending();
  }, [flushPending]);

  return {
    initialize,
    addToTrash,
    removeFromTrash,
    deleteAll,
    restoreAll,
    getTrashAssets,
    getTrashCount,
    forceFlush,
  };
}
