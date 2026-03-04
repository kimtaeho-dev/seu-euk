import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useDeleteQueue } from '../hooks/useDeleteQueue';
import { useSession } from '../hooks/useSession';
import { usePhotos } from '../hooks/usePhotos';
import { colors } from '../styles/theme';

export default function RootLayout() {
  const { deleteAsset } = usePhotos();
  const { cancel } = useDeleteQueue({ onDelete: deleteAsset });
  const { save, session } = useSession();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (
        appState.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        // 앱 이탈 시: 큐 취소 + 세션 저장
        cancel();
        if (session) {
          save(session);
        }
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [cancel, save, session]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.backgroundDark }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.backgroundDark },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="permission" options={{ animation: 'fade' }} />
          <Stack.Screen name="main" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="complete" options={{ animation: 'fade' }} />
          <Stack.Screen name="empty" options={{ animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
