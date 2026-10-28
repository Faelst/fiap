const DEFAULT_PORT_AND_PATH = ':3333/api';
/** O emulador Android chega ao localhost da máquina por 10.0.2.2. */
const ANDROID_HOST_LOOPBACK = '10.0.2.2';
const LOCALHOST = /\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/;

/**
 * Base da API: o `API_URL` do `.env` (react-native-config) ou, sem ele, o
 * localhost da máquina de dev visto do simulador/emulador.
 */
export function resolveApiUrl(envUrl: string | undefined, os: string): string {
  const fromEnv = envUrl?.trim().replace(/\/+$/, '');
  const url = fromEnv || `http://localhost${DEFAULT_PORT_AND_PATH}`;
  return os === 'android'
    ? url.replace(LOCALHOST, `//${ANDROID_HOST_LOOPBACK}`)
    : url;
}
