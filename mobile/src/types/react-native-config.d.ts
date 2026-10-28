declare module 'react-native-config' {
  export interface NativeConfig {
    /** Base da API, ex.: `http://localhost:3333/api`. Ver `.env.example`. */
    API_URL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
