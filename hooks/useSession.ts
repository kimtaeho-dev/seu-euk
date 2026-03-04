import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessionStore } from '../stores/useSessionStore';
import { CONSTANTS } from '../utils/constants';
import type { SessionData } from '../types';

export function useSession() {
  const { session, isRestored, setSession, setIsRestored, clearSession } =
    useSessionStore();

  /** AsyncStorage에서 세션 복원 */
  const restore = useCallback(async (): Promise<SessionData | null> => {
    try {
      const raw = await AsyncStorage.getItem(CONSTANTS.SESSION_STORAGE_KEY);
      if (!raw) {
        setIsRestored(true);
        return null;
      }

      const parsed: SessionData = JSON.parse(raw);

      // 데이터 유효성 검증
      if (
        typeof parsed.lastIndex !== 'number' ||
        typeof parsed.totalCount !== 'number' ||
        typeof parsed.deletedCount !== 'number' ||
        parsed.lastIndex < 0
      ) {
        await AsyncStorage.removeItem(CONSTANTS.SESSION_STORAGE_KEY);
        setIsRestored(true);
        return null;
      }

      setSession(parsed);
      setIsRestored(true);
      return parsed;
    } catch {
      // 데이터 손상 시 초기화
      await AsyncStorage.removeItem(CONSTANTS.SESSION_STORAGE_KEY);
      setIsRestored(true);
      return null;
    }
  }, [setSession, setIsRestored]);

  /** 세션 저장 */
  const save = useCallback(
    async (data: SessionData) => {
      try {
        const sessionData: SessionData = {
          ...data,
          lastUpdated: Date.now(),
        };
        await AsyncStorage.setItem(
          CONSTANTS.SESSION_STORAGE_KEY,
          JSON.stringify(sessionData),
        );
        setSession(sessionData);
      } catch {
        // 저장 실패 시 무시 (다음 스와이프에서 재시도)
      }
    },
    [setSession],
  );

  /** 세션 초기화 */
  const clear = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CONSTANTS.SESSION_STORAGE_KEY);
      clearSession();
    } catch {
      // 삭제 실패 시 무시
    }
  }, [clearSession]);

  return {
    session,
    isRestored,
    restore,
    save,
    clear,
  };
}
