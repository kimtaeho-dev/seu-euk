# 스윽 (seu-euk)

> 스와이프로 사진을 빠르게 정리하는 모바일 앱

오래된 사진부터 순서대로 보면서, 위로 스와이프하면 유지, 아래로 스와이프하면 삭제. 직관적인 제스처로 사진을 빠르게 정리할 수 있습니다.

## 주요 기능

- **스와이프 정리** — 위(↑) 유지 / 아래(↓) 삭제, 촬영일 오래된 순으로 정렬
- **Undo** — 삭제 후 3초 내 되돌리기 (마지막 1장)
- **세션 저장/복원** — 마지막 정리 위치를 저장하여 재진입 시 이어서 진행
- **안전한 삭제 큐** — 앱 이탈 시 큐 삭제를 취소하여 데이터 보호
- **권한 처리** — 사진 라이브러리 접근 권한 요청 및 설정 안내

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React Native (Expo SDK 55, managed workflow) |
| Language | TypeScript (strict mode) |
| Routing | Expo Router v4+ |
| State | Zustand 5.x |
| Animation | React Native Reanimated 3.x |
| Gesture | React Native Gesture Handler 2.x |
| Media | expo-media-library |
| Haptics | expo-haptics |
| Storage | @react-native-async-storage/async-storage |

## 프로젝트 구조

```
seu-euk/
├── app/                     # Expo Router 페이지
│   ├── _layout.tsx           # 루트 레이아웃
│   ├── index.tsx             # S1. 스플래시
│   ├── permission.tsx        # S2. 권한 요청
│   ├── main.tsx              # S3. 메인 (정리)
│   ├── complete.tsx          # S4. 완료
│   └── empty.tsx             # S5. 빈 상태
├── components/              # UI 컴포넌트
│   ├── SwipeCard.tsx         # 스와이프 카드
│   ├── ProgressHeader.tsx    # 진척도 헤더
│   ├── UndoToast.tsx         # Undo 토스트
│   ├── PhotoDate.tsx         # 날짜 표시
│   └── Button.tsx            # 공통 버튼
├── stores/                  # Zustand 상태 관리
│   ├── usePhotoStore.ts      # 사진 상태
│   └── useSessionStore.ts    # 세션 상태
├── hooks/                   # 커스텀 훅
│   ├── usePhotos.ts          # 사진 로드/삭제
│   ├── useSwipeGesture.ts    # 스와이프 제스처
│   ├── useDeleteQueue.ts     # 삭제 큐 관리
│   └── useSession.ts         # 세션 저장/복원
├── styles/
│   └── theme.ts              # 디자인 토큰
├── utils/
│   ├── dateFormatter.ts      # 날짜 포맷
│   └── constants.ts          # 상수 정의
└── types/
    └── index.ts              # 타입 정의
```

## 시작하기

### 사전 요구사항

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (시뮬레이터) 또는 Expo Go 앱
- Android: Android Studio (에뮬레이터) 또는 Expo Go 앱

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npx expo start
```

## 화면 구성

| 화면 | 설명 |
|------|------|
| S1. 스플래시 | 앱 로딩 화면 |
| S2. 권한 요청 | 사진 라이브러리 접근 권한 요청 |
| S3. 메인 (정리) | 스와이프로 사진 정리하는 핵심 화면 |
| S4. 완료 | 모든 사진 정리 완료 시 표시 |
| S5. 빈 상태 | 정리할 사진이 없을 때 표시 |

## 테스트

```bash
# 테스트 실행
npm test
```
