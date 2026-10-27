import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../features/auth/LoginScreen';
import { SelectStudentScreen } from '../features/students/SelectStudentScreen';
import { useSessionStore } from '../stores/session.store';
import { useTheme } from '../theme';
import { AppTabs } from './AppTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack raiz. A sessão decide as telas: sem sessão só existe o Login; com
 * sessão, as abas e a seleção de aluno. Quando o logout ou um 401 encerra a
 * sessão, o React Navigation troca para o Login sozinho.
 */
export function RootStack() {
  const { colors } = useTheme();
  const signedIn = useSessionStore(state => state.status === 'signedIn');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {signedIn ? (
        <>
          <Stack.Screen name="App" component={AppTabs} />
          <Stack.Screen
            name="SelectStudent"
            component={SelectStudentScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
