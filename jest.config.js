module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(expo-.*|@expo/.*|react-native.*|@react-native.*)/)',
  ],
};
