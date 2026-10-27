import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import type { RootStackScreenProps } from '../../navigation/types';

/** Placeholder. O Login real (M1, M2) é a Tarefa 9. */
export function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  return (
    <PlaceholderScreen
      testID="login-screen"
      title="Login"
      description="FIAP School: tema, Montserrat e navegação prontos."
      actions={[
        {
          label: 'ENTRAR',
          testID: 'login-submit-button',
          onPress: () => navigation.replace('App', { screen: 'Agenda' }),
        },
      ]}
    />
  );
}
