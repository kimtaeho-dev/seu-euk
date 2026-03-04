import { useSessionStore } from '../stores/useSessionStore';
import type { SessionData } from '../types';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
    useSessionStore.getState().setIsRestored(false);
  });

  it('초기 상태가 올바르다', () => {
    const state = useSessionStore.getState();
    expect(state.session).toBeNull();
    expect(state.isRestored).toBe(false);
  });

  it('setSession으로 세션을 설정한다', () => {
    const session: SessionData = {
      lastIndex: 10,
      totalCount: 100,
      deletedCount: 5,
      lastUpdated: Date.now(),
    };
    useSessionStore.getState().setSession(session);
    expect(useSessionStore.getState().session).toEqual(session);
  });

  it('updateSession으로 세션을 부분 업데이트한다', () => {
    const session: SessionData = {
      lastIndex: 10,
      totalCount: 100,
      deletedCount: 5,
      lastUpdated: 1000,
    };
    useSessionStore.getState().setSession(session);
    useSessionStore.getState().updateSession({ lastIndex: 20, deletedCount: 8 });

    const updated = useSessionStore.getState().session!;
    expect(updated.lastIndex).toBe(20);
    expect(updated.deletedCount).toBe(8);
    expect(updated.totalCount).toBe(100); // 변경 안 됨
    expect(updated.lastUpdated).toBeGreaterThan(1000); // 자동 갱신
  });

  it('session이 null일 때 updateSession은 무시된다', () => {
    useSessionStore.getState().updateSession({ lastIndex: 5 });
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('clearSession으로 세션을 초기화한다', () => {
    useSessionStore.getState().setSession({
      lastIndex: 10,
      totalCount: 100,
      deletedCount: 5,
      lastUpdated: Date.now(),
    });
    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('setIsRestored로 복원 상태를 설정한다', () => {
    useSessionStore.getState().setIsRestored(true);
    expect(useSessionStore.getState().isRestored).toBe(true);
  });
});
