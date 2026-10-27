import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { useSessionStore } from '../../stores/session.store';

/**
 * Placeholder. O Boletim real (M5) é a Tarefa 12, e o SAIR de verdade fica no
 * Header (Tarefa 10), por um ViewModel.
 */
export function ReportCardScreen() {
  const signOut = useSessionStore(state => state.signOut);

  return (
    <PlaceholderScreen
      testID="boletim-screen"
      title="Boletim"
      description="Notas e faltas por trimestre entram aqui."
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
