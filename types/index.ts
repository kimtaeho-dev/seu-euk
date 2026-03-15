/** 사진 판정 결과 */
export type SwipeDecision = 'keep' | 'delete';

/** 세션 데이터 */
export interface SessionData {
  lastIndex: number;
  lastAssetId?: string;
  lastCreationTime?: number;
  /** 정리 시작 시점 (totalCount 계산 기준) */
  startCreationTime?: number;
  totalCount: number;
  lastUpdated: number;
  deletedCount: number;
  keptCount?: number;
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
export type AppScreen = 'splash' | 'permission' | 'main' | 'complete' | 'empty' | 'trash';
