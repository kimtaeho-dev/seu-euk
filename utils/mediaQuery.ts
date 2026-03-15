import * as MediaLibrary from 'expo-media-library';

/** 사진 라이브러리의 가장 오래된 촬영 연도 조회 */
export async function getOldestPhotoYear(): Promise<number | null> {
  const result = await MediaLibrary.getAssetsAsync({
    first: 1,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [[MediaLibrary.SortBy.creationTime, true]],
  });

  if (result.assets.length === 0) {
    return null;
  }

  return new Date(result.assets[0].creationTime).getFullYear();
}

/** 특정 날짜 이전 가장 최신 사진의 촬영 시간과 Asset 조회 (최신→과거 정렬) */
export async function findPhotoByDate(targetDate: Date): Promise<{
  creationTime: number | undefined;
  asset: MediaLibrary.Asset | null;
}> {
  const result = await MediaLibrary.getAssetsAsync({
    first: 1,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    createdBefore: targetDate,
  });

  const asset = result.assets[0] ?? null;

  return {
    creationTime: asset?.creationTime,
    asset,
  };
}
