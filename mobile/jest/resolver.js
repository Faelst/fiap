/**
 * Encadeia o resolver do preset do RN (libera subpaths de `react-native`) com o
 * do reanimated/worklets (que tira as extensões `.native` de alguns módulos no
 * Jest, senão o reanimated tenta iniciar o módulo nativo).
 */
const rnResolver = require('@react-native/jest-preset/jest/resolver');
const reanimatedResolver = require('react-native-reanimated/jest/resolver');

module.exports = (request, options) =>
  reanimatedResolver(request, {
    ...options,
    defaultResolver: (req, opts) =>
      rnResolver(req, { ...opts, defaultResolver: options.defaultResolver }),
  });
