import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Button from '../components/Button';
import { colors, typography, spacing } from '../styles/theme';
import { CONSTANTS } from '../utils/constants';

export default function SplashScreen() {
  const router = useRouter();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (isFirstLaunch === null) return;

    if (!isFirstLaunch) {
      // 재방문: 바로 라우팅
      navigateByPermission();
      return;
    }

    // 최초 실행: 애니메이션
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    textOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, [isFirstLaunch]);

  const checkFirstLaunch = async () => {
    const launched = await AsyncStorage.getItem(CONSTANTS.FIRST_LAUNCH_KEY);
    setIsFirstLaunch(launched === null);
  };

  const navigateByPermission = useCallback(async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === 'granted') {
      router.replace('/main');
    } else {
      router.replace('/permission');
    }
  }, [router]);

  const handleStart = useCallback(async () => {
    await AsyncStorage.setItem(CONSTANTS.FIRST_LAUNCH_KEY, 'true');
    navigateByPermission();
  }, [navigateByPermission]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
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
        {/* 로고 */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient
            colors={[colors.accentStart, colors.accentEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoText}>스</Text>
          </LinearGradient>
        </Animated.View>

        {/* 앱 이름 + 설명 */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.appName}>스윽</Text>
          <Text style={styles.description}>
            스와이프로 사진을 빠르게 정리하세요
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    ...typography.displaySm,
    color: colors.textPrimary,
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
