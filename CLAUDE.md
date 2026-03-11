# CLAUDE.md

## Project Overview
**스윽 (seu-euk)** — 스와이프로 사진을 빠르게 정리하는 모바일 앱 (MVP 1)
- 오래된 사진부터 순서대로 보면서 ↑유지 / ↓삭제
- iOS + Android 동시 지원

## Tech Stack
- **Language:** TypeScript (strict mode)
- **Framework:** React Native (Expo SDK 52+, managed workflow)
- **Routing:** Expo Router v4+ (파일 기반 라우팅)
- **State:** Zustand 5.x
- **Animation:** React Native Reanimated 3.x (UI thread worklet)
- **Gesture:** React Native Gesture Handler 2.x
- **Media:** expo-media-library
- **Haptics:** expo-haptics
- **Storage:** @react-native-async-storage/async-storage

## Project Structure
```
seu-euk/
├── app/                    # Expo Router 페이지
│   ├── _layout.tsx          # 루트 레이아웃
│   ├── index.tsx            # S1. 스플래시
│   ├── permission.tsx       # S2. 권한 요청
│   ├── main.tsx             # S3. 메인 (정리)
│   ├── complete.tsx         # S4. 완료
│   ├── empty.tsx            # S5. 빈 상태
│   └── trash.tsx            # S6. 휴지통
├── components/
│   ├── SwipeCard.tsx        # 스와이프 카드
│   ├── ProgressHeader.tsx   # 진척도 헤더
│   ├── UndoToast.tsx        # Undo 토스트
│   ├── PhotoDate.tsx        # 날짜 표시
│   └── Button.tsx           # 공통 버튼
├── stores/
│   ├── usePhotoStore.ts     # 사진 상태
│   ├── useTrashStore.ts     # 휴지통 상태
│   └── useSessionStore.ts   # 세션 상태
├── hooks/
│   ├── usePhotos.ts         # 사진 로드/삭제
│   ├── useSwipeGesture.ts   # 스와이프 제스처
│   ├── useDeleteQueue.ts    # 삭제 큐 관리
│   └── useSession.ts        # 세션 저장/복원
├── styles/
│   └── theme.ts             # 디자인 토큰
├── utils/
│   ├── dateFormatter.ts     # 날짜 포맷
│   └── constants.ts         # 상수 정의
└── types/
    └── index.ts             # 타입 정의
```

## Core Policies
- **대상 미디어:** 동영상 제외 모든 이미지 (사진, 스크린샷, GIF, RAW 등)
- **정렬:** 촬영일 오래된 순 고정 (변경 불가)
- **스와이프:** ↑위=유지, ↓아래=삭제, 좌우 미사용
- **임계값:** 화면 높이 30% 이상 또는 속도 800px/s 이상
- **삭제 큐:** 항상 최대 1개, 새 삭제 시 이전 큐 즉시 실행
- **휴지통:** 삭제 스와이프 시 앱 내 휴지통으로 이동 (만료 없음, 사용자가 직접 삭제)
- **실제 삭제:** 휴지통 화면에서 "전체 삭제" 시 OS 삭제 1회 호출
- **Undo:** 3초 토스트, 마지막 1장만
- **앱 이탈:** 큐 삭제 취소, 휴지통 데이터는 AsyncStorage에 영속 보존
- **세션:** 마지막 정리 위치 로컬 저장, 재진입 시 이어서 진행

## Coding Conventions
- 함수형 컴포넌트 (React.FC 사용 금지)
- StyleSheet.create 사용
- 애니메이션은 모두 Reanimated worklet (UI thread)
- 하드코딩 금지 — 반드시 디자인 토큰(theme.ts) 및 상수(constants.ts) 참조
- 색상: backgroundDark #0F0F14, keepGreen #4ADE80, deleteRed #F87171, accent #667EEA

## Development Phases
1. Phase 0: 디자인 시스템 (styles/theme.ts)
2. Phase 1: 프로젝트 세팅 + 타입/상수 정의
3. Phase 2: 핵심 훅 (usePhotos, useSwipeGesture, useDeleteQueue, useSession, dateFormatter)
4. Phase 3: 컴포넌트 (SwipeCard, ProgressHeader, UndoToast, PhotoDate, Button)
5. Phase 4: 화면 구현 + 통합
6. Phase 5: 에러 처리 + 테스트

## Notion Documents
- 메인: https://www.notion.so/318106cd05c581d89150f4d5cb18ad19
- 정책서: https://www.notion.so/318106cd05c5816896a7e5391ac8f830
- 테크스펙: https://www.notion.so/319106cd05c581da961ece9808879c23
- 화면별 기획서: https://www.notion.so/318106cd05c5810eae66cd439f926da9
- 개발 프롬프트: https://www.notion.so/319106cd05c581ab8ad1d49ed6ea48a1
