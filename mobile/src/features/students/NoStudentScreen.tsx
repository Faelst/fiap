import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { useSessionStore } from '../../stores/session.store';

/**
 * Placeholder. A tela real (01-design.md, 3.6: barra com SAIR, saudação e
 * EmptyState) é a Tarefa 10. A rota já existe porque a splash decide por ela.
 */
export function NoStudentScreen() {
  const signOut = useSessionStore(state => state.signOut);

  return (
    <PlaceholderScreen
      testID="no-student-screen"
      title="Nenhum aluno vinculado"
      description="Não encontramos alunos ligados ao seu CPF. Fale com a secretaria da FIAP School para fazer o vínculo."
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
