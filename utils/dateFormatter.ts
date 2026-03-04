export function formatPhotoDate(date: Date): string {
  const now = new Date();
  const dayMs = 86400000;
  const diff = now.getTime() - date.getTime();

  if (diff < dayMs && now.getDate() === date.getDate()) {
    return '오늘';
  }

  const yesterday = new Date(now.getTime() - dayMs);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return '어제';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}
