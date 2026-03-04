import type { Asset } from 'expo-media-library';

/** 사진 판정 결과 */
export type SwipeDecision = 'keep' | 'delete';

/** 삭제 큐 아이템 */
export interface DeleteQueueItem {
  asset: Asset;
  timestamp: number;
}

/** 세션 데이터 */
export interface SessionData {
  lastIndex: number;
  totalCount: number;
  lastUpdated: number;
  deletedCount: number;
}

/** 스와이프 방향 */
export type SwipeDirection = 'up' | 'down' | 'none';

/** 스와이프 상태 */
export interface SwipeState {
  direction: SwipeDirection;
  progress: number;
  isThresholdReached: boolean;
}

/** 앱 화면 */
export type AppScreen = 'splash' | 'permission' | 'main' | 'complete' | 'empty';
