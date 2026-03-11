import * as MediaLibrary from 'expo-media-library';

/** 사진 라이브러리의 최소/최대 촬영일 조회 */
export async function getPhotoDateRange(): Promise<{ oldest: Date; newest: Date } | null> {
  const [oldestResult, newestResult] = await Promise.all([
    MediaLibrary.getAssetsAsync({
      first: 1,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [MediaLibrary.SortBy.creationTime], // ASC → 가장 오래된 것
    }),
    MediaLibrary.getAssetsAsync({
      first: 1,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]], // DESC → 가장 최근 것
    }),
  ]);

  if (oldestResult.assets.length === 0 || newestResult.assets.length === 0) {
    return null;
  }

  return {
    oldest: new Date(oldestResult.assets[0].creationTime),
    newest: new Date(newestResult.assets[0].creationTime),
  };
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
    sortBy: [MediaLibrary.SortBy.creationTime],
    createdBefore: targetDate,
  });

  const index = beforeResult.totalCount;

  // targetDate 이후 첫 사진 (미리보기용)
  const afterResult = await MediaLibrary.getAssetsAsync({
    first: 1,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [MediaLibrary.SortBy.creationTime],
    createdAfter: targetDate,
  });

  return {
    index,
    asset: afterResult.assets[0] ?? null,
  };
}
