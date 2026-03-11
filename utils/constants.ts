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

  // 저장소
  SESSION_STORAGE_KEY: '@seu_euk_session',
  FIRST_LAUNCH_KEY: '@seu_euk_first_launch',

  // 휴지통
  TRASH_STORAGE_KEY: '@seu_euk_trash',
} as const;
