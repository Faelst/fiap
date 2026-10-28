import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { useSessionStore } from '../../stores/session.store';

/**
 * Placeholder. A tela real (01-design.md, 3.7: ErrorState com TENTAR DE NOVO,
 * que refaz o `/me`) é das Tarefas 10/13. A rota já existe porque a splash
 * decide por ela.
 */
export function BootErrorScreen() {
  const signOut = useSessionStore(state => state.signOut);

  return (
    <PlaceholderScreen
      testID="boot-error-screen"
      title="Não conseguimos conectar."
      description="Confira sua conexão e tente de novo."
      actions={[
        {
          label: 'SAIR',
          testID: 'header-logout-button',
          onPress: () => signOut(),
        },
      ]}
    />
  );
}
