import { usePhotoStore } from '../stores/usePhotoStore';
import type { Asset } from 'expo-media-library';

const mockAsset = (id: string): Asset =>
  ({
    id,
    filename: `photo_${id}.jpg`,
    uri: `file:///photo_${id}.jpg`,
    mediaType: 'photo',
    width: 1080,
    height: 1920,
    creationTime: Date.now() / 1000,
    modificationTime: Date.now() / 1000,
    duration: 0,
  }) as Asset;

describe('usePhotoStore', () => {
  beforeEach(() => {
    usePhotoStore.getState().reset();
  });

  it('초기 상태가 올바르다', () => {
    const state = usePhotoStore.getState();
    expect(state.assets).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.totalCount).toBe(0);
    expect(state.deletedCount).toBe(0);
    expect(state.isLoading).toBe(false);
    expect(state.deleteQueue).toBeNull();
    expect(state.showUndoToast).toBe(false);
  });

  it('setAssets로 사진 목록을 설정한다', () => {
    const assets = [mockAsset('1'), mockAsset('2')];
    usePhotoStore.getState().setAssets(assets);
    expect(usePhotoStore.getState().assets).toHaveLength(2);
  });

  it('appendAssets로 사진을 추가한다', () => {
    usePhotoStore.getState().setAssets([mockAsset('1')]);
    usePhotoStore.getState().appendAssets([mockAsset('2'), mockAsset('3')]);
    expect(usePhotoStore.getState().assets).toHaveLength(3);
  });

  it('removeAssetById로 특정 사진을 제거한다', () => {
    usePhotoStore.getState().setAssets([mockAsset('1'), mockAsset('2'), mockAsset('3')]);
    usePhotoStore.getState().removeAssetById('2');
    const ids = usePhotoStore.getState().assets.map((a) => a.id);
    expect(ids).toEqual(['1', '3']);
  });

  it('incrementDeletedCount로 삭제 카운트를 증가시킨다', () => {
    expect(usePhotoStore.getState().deletedCount).toBe(0);
    usePhotoStore.getState().incrementDeletedCount();
    usePhotoStore.getState().incrementDeletedCount();
    expect(usePhotoStore.getState().deletedCount).toBe(2);
  });

  it('setDeleteQueue로 삭제 큐를 설정한다', () => {
    const item = { asset: mockAsset('1'), timestamp: Date.now() };
    usePhotoStore.getState().setDeleteQueue(item);
    expect(usePhotoStore.getState().deleteQueue).toEqual(item);
  });

  it('reset으로 초기 상태로 돌아간다', () => {
    usePhotoStore.getState().setAssets([mockAsset('1')]);
    usePhotoStore.getState().setCurrentIndex(5);
    usePhotoStore.getState().incrementDeletedCount();
    usePhotoStore.getState().reset();

    const state = usePhotoStore.getState();
    expect(state.assets).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.deletedCount).toBe(0);
  });
});
