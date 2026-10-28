import { useQueryClient } from '@tanstack/react-query';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { LoginScreen } from '../features/auth/LoginScreen';
import { BootErrorScreen } from '../features/splash/BootErrorScreen';
import { SplashScreen } from '../features/splash/SplashScreen';
import { NoStudentScreen } from '../features/students/NoStudentScreen';
import { SelectStudentScreen } from '../features/students/SelectStudentScreen';
import { queryKeys } from '../app/queryClient';
import type { Me } from '../features/auth/schemas';
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
 * Primeira tela do grupo autenticado quando a sessão abre pelo login: o
 * `useLoginMutation` grava o `/me` no cache antes de abrir a sessão, então
 * responsável sem aluno vai direto ao NoStudent (M7). Vindo da splash, quem
 * decide é o `reset` dela.
 */
function useAuthenticatedLanding(): 'App' | 'NoStudent' {
  const me = useQueryClient().getQueryData<Me>(queryKeys.me());
  return me && me.students.length === 0 ? 'NoStudent' : 'App';
}

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
  const landing = useAuthenticatedLanding();

  const noStudent = (
    <Stack.Screen
      name="NoStudent"
      component={NoStudentScreen}
      options={fromSplashOptions}
    />
  );

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
          {/*
           * Na troca Login → autenticado o stack recomeça na 1ª rota
           * declarada (o router guarda o initialRouteName do 1º render, que é
           * a splash). Por isso o destino vem primeiro.
           */}
          {landing === 'NoStudent' ? noStudent : null}
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
          {landing === 'NoStudent' ? null : noStudent}
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
