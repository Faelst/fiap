import type { LogTransport } from './logger';

/**
 * Liga o Reactotron em dev e devolve um transporte para o logger. Os plugins
 * de rede, de console e de AsyncStorage ficam desligados: o de rede mostraria
 * o header Authorization e o corpo do login sem redação. Os requests aparecem
 * pelo log do interceptor (já redigido).
 *
 * No emulador Android rode `adb reverse tcp:9090 tcp:9090`.
 */
export function connectReactotron(): LogTransport {
  const Reactotron = require('reactotron-react-native').default;

  Reactotron.configure({ name: 'FIAP School' })
    .useReactNative({ networking: false, log: false, asyncStorage: false })
    .connect();

  return ({ level, message, context }) => {
    Reactotron.display({
      name: level.toUpperCase(),
      preview: message,
      value: context ?? message,
      important: level === 'warn' || level === 'error',
    });
  };
}
