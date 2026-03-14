# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**스윽 (seu-euk)** — 스와이프로 사진을 빠르게 정리하는 모바일 앱 (MVP 1)
- 오래된 사진부터 순서대로 보면서 ↑유지 / ↓삭제
- iOS + Android 동시 지원

## Commands
```bash
npx expo start          # 개발 서버 시작 (Expo Go)
npx expo run:ios        # iOS 네이티브 빌드
npx expo run:android    # Android 네이티브 빌드
npx jest                # 전체 테스트 실행 (ts-jest, 26개)
npx jest __tests__/dateFormatter.test.ts  # 단일 테스트 파일 실행
```

## Tech Stack
- **React Native** (Expo SDK 55, managed workflow) + **TypeScript** (strict mode)
- **Expo Router v4+** (파일 기반 라우팅) — `app/` 디렉토리
- **Zustand 5.x** — 전역 상태 (usePhotoStore, useTrashStore, useSessionStore)
- **Reanimated 4.x** — 모든 애니메이션은 UI thread worklet로 실행
- **Gesture Handler 2.x** — 스와이프 제스처 감지
- **expo-media-library** — 사진 접근 및 삭제
- **AsyncStorage** — 세션/휴지통 영속 저장
- **Pretendard** 폰트 (Regular, Medium, SemiBold, Bold)

## Architecture

### Data Flow: 3단계 삭제 파이프라인
```
스와이프(↓) → Undo 큐 (메모리, 3초) → 앱 휴지통 (AsyncStorage) → OS 삭제 (MediaLibrary)
```
- **Undo 큐**: 항상 최대 1개. 새 삭제 시 이전 큐를 즉시 휴지통으로 flush
- **앱 휴지통**: 만료 없음. 사용자가 trash 화면에서 "전체 삭제" 시 OS 삭제 1회 호출
- **앱 이탈 시**: 큐 취소(삭제 안 됨), 휴지통은 AsyncStorage에 보존

### Exclusion-Based 필터링
세션 중 단일 `excludeIds: Set<string>`을 유지하며 trash IDs + sorted album IDs를 합산. loadInitial/loadMore에 전달하여 이미 처리한 사진을 재표시하지 않음.

### 메모리 최적화: Sliding Window
- 현재 인덱스 기준 과거 5장만 메모리 유지 (`WINDOW_KEEP_BEHIND`)
- 50회 이동마다 trim 실행 (`TRIM_INTERVAL`)
- 다음 5장 이미지 프리페치 (`IMAGE_PREFETCH_COUNT`)

### Debouncing 전략
| 대상 | 디바운스 | 즉시 flush 조건 |
|------|---------|----------------|
| 세션 저장 | 1000ms | 앱 백그라운드 |
| 휴지통 저장 | 500ms | - |
| 정리 완료 앨범 추가 | 500ms | 앱 백그라운드 |

### 세션 복원
`lastCreationTime` 기준으로 해당 시점 이후 사진부터 다시 로드. 라이브러리 변경(사진 삭제 등)에도 안전하게 동작.

### 정리 완료 앨범
유지(↑) 스와이프 시 시스템 앨범 '스윽 정리 완료'에 추가. 재진입 시 이 앨범의 사진을 excludeIds에 포함하여 건너뜀.

### 화면 흐름
```
index(스플래시) → year-select(시작 연도) → permission(권한) → main(정리)
                                                              ├→ complete(완료)
                                                              ├→ empty(빈 상태)
                                                              └→ trash(휴지통)
```

## Core Policies
- **대상 미디어:** 동영상 제외 모든 이미지 (사진, 스크린샷, GIF, RAW 등)
- **정렬:** 촬영일 오래된 순 고정 (변경 불가)
- **스와이프:** ↑위=유지, ↓아래=삭제, 좌우 미사용
- **임계값:** 화면 높이 30% 이상 또는 속도 800px/s 이상
- **Undo:** 3초 토스트, 마지막 1장만

## Coding Conventions
- 함수형 컴포넌트 (React.FC 사용 금지)
- StyleSheet.create 사용
- 애니메이션은 모두 Reanimated worklet (UI thread)
- 하드코딩 금지 — 반드시 디자인 토큰(`styles/theme.ts`) 및 상수(`utils/constants.ts`) 참조
- 색상: backgroundDark #131118, keepGreen #6BCB97, deleteRed #E07070, accent #E8845C
- 폰트: Pretendard (Regular, Medium, SemiBold, Bold)

## Notion Documents
- 메인: https://www.notion.so/318106cd05c581d89150f4d5cb18ad19
- 정책서: https://www.notion.so/318106cd05c5816896a7e5391ac8f830
- 테크스펙: https://www.notion.so/319106cd05c581da961ece9808879c23
- 화면별 기획서: https://www.notion.so/318106cd05c5810eae66cd439f926da9
- 개발 프롬프트: https://www.notion.so/319106cd05c581ab8ad1d49ed6ea48a1
