export const CONSTANTS = {
  // 스와이프
  SWIPE_THRESHOLD: 0.3,
  VELOCITY_THRESHOLD: 800,

  // 애니메이션
  SWIPE_ANIMATION_DURATION: 250,
  FADE_IN_DURATION: 150,
  SNAP_BACK_DAMPING: 30,
  SNAP_BACK_STIFFNESS: 200,

  // Undo
  UNDO_TIMEOUT: 3000,
  TOAST_SLIDE_DURATION: 300,

  // 사진 로드
  PAGE_SIZE: 100,
  PRELOAD_THRESHOLD: 20,
  IMAGE_LOAD_RETRY: 3,
  IMAGE_PREFETCH_COUNT: 5,

  // 저장소
  SESSION_STORAGE_KEY: '@seu_euk_session',
  FIRST_LAUNCH_KEY: '@seu_euk_first_launch',

  // 휴지통
  TRASH_STORAGE_KEY: '@seu_euk_trash',

  // 연도 선택
  SELECTED_START_YEAR_KEY: '@seu_euk_selected_start_year',

  // 메모리 최적화
  WINDOW_KEEP_BEHIND: 5,
  TRIM_INTERVAL: 50,
  SESSION_DEBOUNCE_MS: 1000,
  TRASH_DEBOUNCE_MS: 500,
} as const;
