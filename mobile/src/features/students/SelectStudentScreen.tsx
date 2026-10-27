import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import type { RootStackScreenProps } from '../../navigation/types';

/** Placeholder. A seleção de aluno real (M6) é a Tarefa 10. */
export function SelectStudentScreen({
  navigation,
}: RootStackScreenProps<'SelectStudent'>) {
  return (
    <PlaceholderScreen
      testID="select-student-screen"
      title="Escolha o perfil"
      description="Os cards dos alunos entram aqui."
      actions={[
        {
          label: 'FECHAR',
          testID: 'select-student-close-button',
          onPress: () => navigation.goBack(),
        },
      ]}
    />
  );
}
