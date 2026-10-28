import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppTabsParamList = {
  Agenda: undefined;
  Boletim: undefined;
  Perfil: undefined;
};

/**
 * `fromSplash`: a tela veio do fim da splash. Ela entra sem a animação do
 * stack (a splash já fez a saída) e o Login não mexe no logo no 1º frame.
 */
export type FromSplashParams = { fromSplash?: boolean } | undefined;

export type RootStackParamList = {
  Splash: undefined;
  Login: FromSplashParams;
  App: (NavigatorScreenParams<AppTabsParamList> & FromSplashParams) | undefined;
  NoStudent: FromSplashParams;
  BootError: FromSplashParams;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AppTabsScreenProps<T extends keyof AppTabsParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<AppTabsParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
