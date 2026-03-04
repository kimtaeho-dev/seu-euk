import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { colors, typography, spacing } from '../styles/theme';

export default function PermissionScreen() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  const handleRequestPermission = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === 'granted') {
      // 사진 수 확인
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
        {/* 아이콘 */}
        <View style={styles.iconContainer}>
          <Ionicons name="images-outline" size={64} color={colors.textDarkPrimary} />
        </View>

        {/* 안내 텍스트 */}
        <Text style={styles.title}>
          {denied
            ? '사진 접근 권한이 필요합니다'
            : '사진을 정리하려면\n사진 접근 권한이 필요합니다'}
        </Text>
        {denied && (
          <Text style={styles.subtitle}>
            설정에서 사진 접근 권한을 허용해주세요
          </Text>
        )}
      </View>

      {/* 버튼 */}
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
    backgroundColor: colors.backgroundLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingLg,
    color: colors.textDarkPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textDarkSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
});
