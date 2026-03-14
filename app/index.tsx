import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { colors, typography, spacing } from '../styles/theme';
import { CONSTANTS } from '../utils/constants';

export default function SplashScreen() {
  const router = useRouter();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  const logoScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(-8);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (isFirstLaunch === null) return;

    if (!isFirstLaunch) {
      navigateByPermission();
      return;
    }

    // 최초 실행: 애니메이션
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 80 });
    logoRotation.value = withSpring(0, { damping: 14, stiffness: 80 });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    buttonOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
  }, [isFirstLaunch]);

  const checkFirstLaunch = async () => {
    const launched = await AsyncStorage.getItem(CONSTANTS.FIRST_LAUNCH_KEY);
    setIsFirstLaunch(launched === null);
  };

  const navigateByPermission = useCallback(async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted' || status === 'limited') {
      router.replace('/main');
    } else {
      router.replace('/permission');
    }
  }, [router]);

  const handleStart = useCallback(async () => {
    await AsyncStorage.setItem(CONSTANTS.FIRST_LAUNCH_KEY, 'true');
    router.replace('/year-select');
  }, [router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // 재방문 시 빈 화면 (즉시 라우팅)
  if (isFirstLaunch === null || isFirstLaunch === false) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 로고 + 코랄 glow */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.glow} />
          <Logo size={80} />
        </Animated.View>

        {/* 앱 이름 + 설명 */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.appName}>스윽</Text>
          <Text style={styles.description}>
            오래된 사진, 스윽 정리
          </Text>
        </Animated.View>
      </View>

      {/* CTA 버튼 */}
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <Button title="시작하기" onPress={handleStart} />
      </Animated.View>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '38%',
    gap: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(232, 132, 92, 0.12)',
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    ...typography.displaySm,
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  description: {
    ...typography.bodyLg,
    color: colors.textSecondary,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
});
