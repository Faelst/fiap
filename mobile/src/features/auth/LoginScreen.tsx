import { PlaceholderScreen } from '../../components/PlaceholderScreen';

/**
 * Placeholder. O Login real (M1, M2) é a Tarefa 9, com o `useLoginMutation`.
 * Desde a Tarefa 8 a sessão decide a navegação: sem token o app abre aqui.
 */
export function LoginScreen() {
  return (
    <PlaceholderScreen
      testID="login-screen"
      title="Login"
      description="O formulário de CPF e senha entra na Tarefa 9."
    />
  );
}
