import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import Button from '../components/Button';
import { colors, typography, spacing } from '../styles/theme';

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
        <Text style={styles.emoji}>📸</Text>

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
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
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
