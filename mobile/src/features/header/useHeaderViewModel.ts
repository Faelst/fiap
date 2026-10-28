import type { NavigationProp } from '@react-navigation/native';

import type { AppTabsParamList } from '../../navigation/types';
import { useSessionStudent } from '../students/useSessionStudent';

type HeaderNavigation = Pick<NavigationProp<AppTabsParamList>, 'navigate'>;

/**
 * Header compacto das abas (V7, 01-design.md da v2 2.6): primeiro nome do
 * responsável e o aluno em uso no chip. O chip leva ao Perfil, mesmo com um
 * aluno só; a troca de aluno e o Sair ficam lá.
 */
export function useHeaderViewModel(navigation: HeaderNavigation) {
  const { guardianFirstName, student } = useSessionStudent();

  return {
    guardianFirstName,
    student: student
      ? {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          rm: student.rm,
          className: student.className,
          period: student.period,
        }
      : null,
    onPressStudent: () => navigation.navigate('Perfil'),
  };
}
