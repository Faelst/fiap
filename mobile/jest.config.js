module.exports = {
  preset: '@react-native/jest-preset',
  resolver: './jest/resolver.js',
  transform: {
    '^.+\\.(js|ts|tsx|mjs)$': 'babel-jest',
  },
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?|@react-navigation|@shopify/restyle|msw|@mswjs|rettime|until-async|@bundled-es-modules|@open-draft|outvariant|strict-event-emitter|headers-polyfill|is-node-process)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/'],
};
