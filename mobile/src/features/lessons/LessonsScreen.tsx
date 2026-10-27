import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import type { AppTabsScreenProps } from '../../navigation/types';

/** Placeholder. A Agenda real (M4) é a Tarefa 11. */
export function LessonsScreen({ navigation }: AppTabsScreenProps<'Agenda'>) {
  return (
    <PlaceholderScreen
      testID="agenda-screen"
      title="Agenda"
      description="As aulas do dia entram aqui."
      actions={[
        {
          label: 'TROCAR PERFIL',
          testID: 'header-switch-student-button',
          onPress: () => navigation.navigate('SelectStudent'),
        },
      ]}
    />
  );
}
