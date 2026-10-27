import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import type { AppTabsScreenProps } from '../../navigation/types';

/** Placeholder. O Boletim real (M5) é a Tarefa 12. */
export function ReportCardScreen({
  navigation,
}: AppTabsScreenProps<'Boletim'>) {
  return (
    <PlaceholderScreen
      testID="boletim-screen"
      title="Boletim"
      description="Notas e faltas por trimestre entram aqui."
      actions={[
        {
          label: 'SAIR',
          testID: 'header-logout-button',
          onPress: () => navigation.replace('Login'),
        },
      ]}
    />
  );
}
