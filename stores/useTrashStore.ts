import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Asset } from 'expo-media-library';
import type { TrashItem } from '../types';
import { CONSTANTS } from '../utils/constants';

interface TrashState {
  trashItems: TrashItem[];
  isLoaded: boolean;

  addToTrash: (asset: Asset) => void;
  removeFromTrash: (id: string) => void;
  clearTrash: () => void;
  loadTrash: () => Promise<void>;
  saveTrash: () => Promise<void>;
}

export const useTrashStore = create<TrashState>((set, get) => ({
  trashItems: [],
  isLoaded: false,

  addToTrash: (asset) => {
    set((state) => {
      // 중복 방지
      if (state.trashItems.some((item) => item.asset.id === asset.id)) {
        return state;
      }
      return {
        trashItems: [...state.trashItems, { asset, deletedAt: Date.now() }],
      };
    });
    get().saveTrash();
  },

  removeFromTrash: (id) => {
    set((state) => ({
      trashItems: state.trashItems.filter((item) => item.asset.id !== id),
    }));
    get().saveTrash();
  },

  clearTrash: () => {
    set({ trashItems: [] });
    get().saveTrash();
  },

  loadTrash: async () => {
    try {
      const raw = await AsyncStorage.getItem(CONSTANTS.TRASH_STORAGE_KEY);
      if (raw) {
        const items: TrashItem[] = JSON.parse(raw);
        set({ trashItems: items, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  saveTrash: async () => {
    try {
      const { trashItems } = get();
      await AsyncStorage.setItem(
        CONSTANTS.TRASH_STORAGE_KEY,
        JSON.stringify(trashItems),
      );
    } catch {
      // 저장 실패 무시
    }
  },

}));
