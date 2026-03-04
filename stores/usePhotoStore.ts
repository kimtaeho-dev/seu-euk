import { create } from 'zustand';
import type { Asset } from 'expo-media-library';
import type { DeleteQueueItem } from '../types';

interface PhotoState {
  /** 로드된 사진 목록 */
  assets: Asset[];
  /** 현재 보고 있는 인덱스 */
  currentIndex: number;
  /** 전체 사진 수 (미디어 라이브러리 기준) */
  totalCount: number;
  /** 삭제한 사진 수 */
  deletedCount: number;
  /** 사진 로딩 중 여부 */
  isLoading: boolean;
  /** 다음 페이지 커서 */
  endCursor: string | undefined;
  /** 더 불러올 사진이 있는지 */
  hasNextPage: boolean;
  /** 삭제 큐 (최대 1개) */
  deleteQueue: DeleteQueueItem | null;
  /** Undo 토스트 표시 여부 */
  showUndoToast: boolean;

  // Actions
  setAssets: (assets: Asset[]) => void;
  appendAssets: (assets: Asset[]) => void;
  setCurrentIndex: (index: number) => void;
  setTotalCount: (count: number) => void;
  incrementDeletedCount: () => void;
  setIsLoading: (loading: boolean) => void;
  setEndCursor: (cursor: string | undefined) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setDeleteQueue: (item: DeleteQueueItem | null) => void;
  setShowUndoToast: (show: boolean) => void;
  removeAssetById: (id: string) => void;
  reset: () => void;
}

const initialState = {
  assets: [] as Asset[],
  currentIndex: 0,
  totalCount: 0,
  deletedCount: 0,
  isLoading: false,
  endCursor: undefined as string | undefined,
  hasNextPage: true,
  deleteQueue: null as DeleteQueueItem | null,
  showUndoToast: false,
};

export const usePhotoStore = create<PhotoState>((set) => ({
  ...initialState,

  setAssets: (assets) => set({ assets }),
  appendAssets: (newAssets) =>
    set((state) => ({ assets: [...state.assets, ...newAssets] })),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setTotalCount: (count) => set({ totalCount: count }),
  incrementDeletedCount: () =>
    set((state) => ({ deletedCount: state.deletedCount + 1 })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setEndCursor: (cursor) => set({ endCursor: cursor }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  setDeleteQueue: (item) => set({ deleteQueue: item }),
  setShowUndoToast: (show) => set({ showUndoToast: show }),
  removeAssetById: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
  reset: () => set(initialState),
}));
