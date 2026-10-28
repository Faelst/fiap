const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * O watchman é desligado de propósito: na máquina de desenvolvimento ele está
 * quebrado (falta a libglog), e o crawler em Node atende bem um projeto deste
 * tamanho.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    useWatchman: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
