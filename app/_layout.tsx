import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useDeleteQueue } from '../hooks/useDeleteQueue';
import { useSession } from '../hooks/useSession';
import { useTrashStore } from '../stores/useTrashStore';
import { colors } from '../styles/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { cancel } = useDeleteQueue();
  const { saveImmediate, session } = useSession();
  const appState = useRef(AppState.currentState);
  const loadTrash = useTrashStore((s) => s.loadTrash);

  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 앱 시작 시 휴지통 데이터 복원
  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (
        appState.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        // 앱 이탈 시: 큐 취소 + 세션 즉시 저장
        cancel();
        if (session) {
          saveImmediate(session);
        }
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [cancel, saveImmediate, session]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.backgroundDark }}
      onLayout={onLayoutRootView}
    >
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.backgroundDark },
            animation: 'fade',
            animationDuration: 350,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="year-select" options={{ animation: 'fade' }} />
          <Stack.Screen name="permission" options={{ animation: 'fade' }} />
          <Stack.Screen name="main" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="complete" options={{ animation: 'fade' }} />
          <Stack.Screen name="empty" options={{ animation: 'fade' }} />
          <Stack.Screen name="trash" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
