import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { colors } from '../styles/theme';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 64 }: LogoProps) {
  const viewBox = '0 0 64 64';

  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.accentStart} />
          <Stop offset="1" stopColor={colors.accentEnd} />
        </LinearGradient>
      </Defs>
      {/* "ㅅ" 자형 S-커브 브러시스트로크 */}
      <Path
        d="M16 48 C20 28, 28 16, 32 14 C36 16, 44 28, 48 48"
        stroke="url(#logoGrad)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
