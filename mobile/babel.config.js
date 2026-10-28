module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // O zod 4 publica `export * as` e o preset do RN não transforma essa sintaxe.
    '@babel/plugin-transform-export-namespace-from',
    // O plugin do worklets (reanimated 4) precisa ser o último da lista.
    'react-native-worklets/plugin',
  ],
};
