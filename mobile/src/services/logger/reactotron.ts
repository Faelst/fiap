import type { LogTransport } from './logger';

export type ReactotronConnection = {
  /** Destino do logger. */
  transport: LogTransport;
  /** Mostra um valor já redigido na timeline (estado do app). */
  show: (name: string, preview: string, value: unknown) => void;
};

/**
 * Liga o Reactotron em dev. Os plugins de rede, de console e de AsyncStorage
 * ficam desligados: o de rede mostraria o header Authorization e o corpo do
 * login sem redação. Os requests aparecem pelo log do interceptor (já
 * redigido), e o estado do app pelo `show` (ver `app/stateInspector.ts`).
 *
 * No emulador Android rode `adb reverse tcp:9090 tcp:9090`.
 */
export function connectReactotron(): ReactotronConnection {
  const Reactotron = require('reactotron-react-native').default;

  Reactotron.configure({ name: 'FIAP School' })
    .useReactNative({ networking: false, log: false, asyncStorage: false })
    .connect();

  return {
    transport: ({ level, message, context }) => {
      Reactotron.display({
        name: level.toUpperCase(),
        preview: message,
        value: context ?? message,
        important: level === 'warn' || level === 'error',
      });
    },
    show: (name, preview, value) => {
      Reactotron.display({ name, preview, value });
    },
  };
}
