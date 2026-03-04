import { formatPhotoDate } from '../utils/dateFormatter';

describe('formatPhotoDate', () => {
  const RealDate = Date;

  function mockDate(isoDate: string) {
    const fixed = new RealDate(isoDate);
    jest.spyOn(global, 'Date').mockImplementation((...args: any[]) => {
      if (args.length === 0) return fixed;
      // @ts-ignore
      return new RealDate(...args);
    });
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('오늘 날짜는 "오늘"을 반환한다', () => {
    mockDate('2026-03-05T12:00:00');
    const today = new RealDate('2026-03-05T10:00:00');
    expect(formatPhotoDate(today)).toBe('오늘');
  });

  it('어제 날짜는 "어제"를 반환한다', () => {
    mockDate('2026-03-05T12:00:00');
    const yesterday = new RealDate('2026-03-04T15:00:00');
    expect(formatPhotoDate(yesterday)).toBe('어제');
  });

  it('올해 다른 날짜는 "M월 D일" 형식을 반환한다', () => {
    mockDate('2026-03-05T12:00:00');
    const date = new RealDate('2026-01-15T10:00:00');
    expect(formatPhotoDate(date)).toBe('1월 15일');
  });

  it('작년 이전 날짜는 "YYYY년 M월 D일" 형식을 반환한다', () => {
    mockDate('2026-03-05T12:00:00');
    const date = new RealDate('2024-12-25T10:00:00');
    expect(formatPhotoDate(date)).toBe('2024년 12월 25일');
  });

  it('1월 1일 날짜도 올바르게 처리한다', () => {
    mockDate('2026-01-01T12:00:00');
    const date = new RealDate('2025-12-31T23:00:00');
    expect(formatPhotoDate(date)).toBe('어제');
  });

  it('같은 해 다른 월의 날짜를 올바르게 표시한다', () => {
    mockDate('2026-12-01T12:00:00');
    const date = new RealDate('2026-06-15T10:00:00');
    expect(formatPhotoDate(date)).toBe('6월 15일');
  });
});
