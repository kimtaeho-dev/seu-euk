import * as MediaLibrary from 'expo-media-library';

/** 사진 라이브러리의 가장 오래된 촬영 연도 조회 */
export async function getOldestPhotoYear(): Promise<number | null> {
  // 오래된 순 정렬 (ASC) — 첫 번째가 가장 오래된 사진
  const result = await MediaLibrary.getAssetsAsync({
    first: 1,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [[MediaLibrary.SortBy.creationTime, true]],
  });

  if (result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  console.log('[mediaQuery] oldest asset:', {
    id: asset.id,
    filename: asset.filename,
    creationTime: asset.creationTime,
    asDate: new Date(asset.creationTime).toISOString(),
    year: new Date(asset.creationTime).getFullYear(),
    totalCount: result.totalCount,
  });

  return new Date(asset.creationTime).getFullYear();
}

/** 특정 날짜 이후 첫 사진의 인덱스와 Asset 조회 */
export async function findPhotoByDate(targetDate: Date): Promise<{
  index: number;
  asset: MediaLibrary.Asset | null;
}> {
  // targetDate 이전의 사진 수 = 해당 시점의 인덱스
  const beforeResult = await MediaLibrary.getAssetsAsync({
    first: 0,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [[MediaLibrary.SortBy.creationTime, true]],
    createdBefore: targetDate,
  });

  const index = beforeResult.totalCount;

  // targetDate 이후 첫 사진 (미리보기용)
  const afterResult = await MediaLibrary.getAssetsAsync({
    first: 1,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [[MediaLibrary.SortBy.creationTime, true]],
    createdAfter: targetDate,
  });

  return {
    index,
    asset: afterResult.assets[0] ?? null,
  };
}
