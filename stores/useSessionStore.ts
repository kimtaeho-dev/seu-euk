import { create } from 'zustand';
import type { SessionData } from '../types';

interface SessionState {
  /** 저장된 세션 데이터 */
  session: SessionData | null;
  /** 세션 로드 완료 여부 */
  isRestored: boolean;

  // Actions
  setSession: (session: SessionData | null) => void;
  setIsRestored: (restored: boolean) => void;
  updateSession: (partial: Partial<SessionData>) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  isRestored: false,

  setSession: (session) => set({ session }),
  setIsRestored: (restored) => set({ isRestored: restored }),
  updateSession: (partial) =>
    set((state) => ({
      session: state.session
        ? { ...state.session, ...partial, lastUpdated: Date.now() }
        : null,
    })),
  clearSession: () => set({ session: null }),
}));
