import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { LoginScreen } from '../features/auth/LoginScreen';
import { BootErrorScreen } from '../features/splash/BootErrorScreen';
import { SplashScreen } from '../features/splash/SplashScreen';
import { NoStudentScreen } from '../features/students/NoStudentScreen';
import { SelectStudentScreen } from '../features/students/SelectStudentScreen';
import { useBootStore } from '../stores/boot.store';
import { useSessionStore } from '../stores/session.store';
import { useTheme } from '../theme';
import { AppTabs } from './AppTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Quem vem do fim da splash entra sem a animação do stack (a splash já saiu). */
const fromSplashOptions = ({
  route,
}: {
  route: { params?: { fromSplash?: boolean } };
}): NativeStackNavigationOptions =>
  route.params?.fromSplash ? { animation: 'none' } : {};

/**
 * Stack raiz. A splash é a primeira rota até entregar o app a outra tela
 * (`reset`) e depois sai da lista. Fora isso, a sessão decide as telas: sem
 * sessão só existe o Login; com sessão, as abas, a seleção de aluno e os
 * estados de início. Quando o logout ou um 401 encerra a sessão, o React
 * Navigation troca para o Login sozinho.
 */
export function RootStack() {
  const { colors } = useTheme();
  const signedIn = useSessionStore(state => state.status === 'signedIn');
  const splashDone = useBootStore(state => state.splashDone);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {splashDone ? null : (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'none' }}
        />
      )}
      {signedIn ? (
        <>
          <Stack.Screen
            name="App"
            component={AppTabs}
            options={fromSplashOptions}
          />
          <Stack.Screen
            name="SelectStudent"
            component={SelectStudentScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="NoStudent"
            component={NoStudentScreen}
            options={fromSplashOptions}
          />
          <Stack.Screen
            name="BootError"
            component={BootErrorScreen}
            options={fromSplashOptions}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={fromSplashOptions}
        />
      )}
    </Stack.Navigator>
  );
}
