import { CONSTANTS } from '../utils/constants';

describe('CONSTANTS', () => {
  it('스와이프 임계값이 0~1 사이이다', () => {
    expect(CONSTANTS.SWIPE_THRESHOLD).toBeGreaterThan(0);
    expect(CONSTANTS.SWIPE_THRESHOLD).toBeLessThanOrEqual(1);
  });

  it('속도 임계값이 양수이다', () => {
    expect(CONSTANTS.VELOCITY_THRESHOLD).toBeGreaterThan(0);
  });

  it('Undo 타임아웃이 3초이다', () => {
    expect(CONSTANTS.UNDO_TIMEOUT).toBe(3000);
  });

  it('페이지 사이즈가 양수이다', () => {
    expect(CONSTANTS.PAGE_SIZE).toBeGreaterThan(0);
  });

  it('프리로드 임계값이 페이지 사이즈보다 작다', () => {
    expect(CONSTANTS.PRELOAD_THRESHOLD).toBeLessThan(CONSTANTS.PAGE_SIZE);
  });

  it('이미지 재시도 횟수가 3이다', () => {
    expect(CONSTANTS.IMAGE_LOAD_RETRY).toBe(3);
  });

  it('세션 스토리지 키가 존재한다', () => {
    expect(CONSTANTS.SESSION_STORAGE_KEY).toBeTruthy();
    expect(typeof CONSTANTS.SESSION_STORAGE_KEY).toBe('string');
  });
});
