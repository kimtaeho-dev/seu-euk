import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Button from '../components/Button';
import { colors, typography, spacing } from '../styles/theme';

function PhotoCardStack() {
  return (
    <View style={illustStyles.container}>
      <Svg width={120} height={100} viewBox="0 0 120 100">
        <Defs>
          <LinearGradient id="card1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accentStart} stopOpacity="0.3" />
            <Stop offset="1" stopColor={colors.accentEnd} stopOpacity="0.3" />
          </LinearGradient>
          <LinearGradient id="card2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accentStart} stopOpacity="0.5" />
            <Stop offset="1" stopColor={colors.accentEnd} stopOpacity="0.5" />
          </LinearGradient>
          <LinearGradient id="card3" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accentStart} stopOpacity="0.8" />
            <Stop offset="1" stopColor={colors.accentEnd} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        {/* 뒤쪽 카드 (살짝 오른쪽 회전) */}
        <Rect
          x="38" y="5" width="60" height="75" rx="8"
          fill="url(#card1)" rotation={6} origin="68, 42"
        />
        {/* 중간 카드 (살짝 왼쪽 회전) */}
        <Rect
          x="28" y="10" width="60" height="75" rx="8"
          fill="url(#card2)" rotation={-3} origin="58, 47"
        />
        {/* 앞쪽 카드 */}
        <Rect
          x="30" y="12" width="60" height="75" rx="8"
          fill="url(#card3)"
        />
      </Svg>
    </View>
  );
}

const illustStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
});

export default function PermissionScreen() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  const handleRequestPermission = useCallback(async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    const { status } = permission;

    if (status === 'granted' || status === 'limited') {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 1,
      });

      if (result.totalCount === 0) {
        router.replace('/empty');
      } else {
        router.replace('/main');
      }
    } else {
      setDenied(true);
    }
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <PhotoCardStack />

        <Text style={styles.title}>
          {denied
            ? '사진 접근 권한이 필요해요'
            : '사진을 정리하려면\n사진 접근 권한이 필요해요'}
        </Text>
        {denied && (
          <Text style={styles.subtitle}>
            설정에서 사진 접근 권한을 허용해주세요
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {denied ? (
          <>
            <Button title="설정에서 직접 변경" onPress={handleOpenSettings} />
            <Button
              title="다시 시도"
              variant="text"
              onPress={handleRequestPermission}
            />
          </>
        ) : (
          <Button title="권한 허용하기" onPress={handleRequestPermission} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
  },
  title: {
    ...typography.headingLg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
});
