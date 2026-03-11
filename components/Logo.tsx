import { Text } from 'react-native';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 64 }: LogoProps) {
  return (
    <Text style={{ fontSize: size * 0.75, lineHeight: size }}>
      🧹
    </Text>
  );
}
