const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/** `zod/v4/locales/index` (ESM ou CJS): todas as traduções do zod. */
const ZOD_LOCALES_INDEX = /[\\/]zod[\\/]v4[\\/]locales[\\/]index\.c?js$/;
const ZOD_LOCALES_SHIM = path.join(__dirname, 'metro', 'zod-locales.js');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * O watchman é desligado de propósito: na máquina de desenvolvimento ele está
 * quebrado (falta a libglog), e o crawler em Node atende bem um projeto deste
 * tamanho.
 *
 * As traduções do zod saem do bundle (~280 KB): o índice delas é trocado por
 * um módulo só com o `en`.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    useWatchman: false,
    resolveRequest: (context, moduleName, platform) => {
      const resolution = context.resolveRequest(context, moduleName, platform);
      if (
        resolution.type === 'sourceFile' &&
        ZOD_LOCALES_INDEX.test(resolution.filePath)
      ) {
        return { type: 'sourceFile', filePath: ZOD_LOCALES_SHIM };
      }
      return resolution;
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
