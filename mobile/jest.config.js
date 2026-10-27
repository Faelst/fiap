module.exports = {
  preset: '@react-native/jest-preset',
  resolver: './jest/resolver.js',
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?|@react-navigation|@shopify/restyle|expo(nent)?|@expo(nent)?/.*|expo-modules-core)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/'],
};
