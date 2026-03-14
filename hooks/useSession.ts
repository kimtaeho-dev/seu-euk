import { useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessionStore } from '../stores/useSessionStore';
import { CONSTANTS } from '../utils/constants';
import type { SessionData } from '../types';

export function useSession() {
  const { session, isRestored, setSession, setIsRestored, clearSession } =
    useSessionStore();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /** 실제 저장 로직 */
  const doSave = useCallback(
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

  /** 세션 저장 (디바운싱 적용) */
  const save = useCallback(
    (data: SessionData) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        doSave(data);
        debounceTimer.current = null;
      }, CONSTANTS.SESSION_DEBOUNCE_MS);
    },
    [doSave],
  );

  /** 즉시 저장 (앱 이탈 시) */
  const saveImmediate = useCallback(
    (data: SessionData) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      doSave(data);
    },
    [doSave],
  );

  /** 세션 초기화 */
  const clear = useCallback(async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
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
    saveImmediate,
    clear,
  };
}
