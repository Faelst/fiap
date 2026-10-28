import type { RootStackScreenProps } from '../../navigation/types';
import { useLogout } from '../auth/useLogout';
import { useSessionStudent } from '../students/useSessionStudent';

type HeaderNavigation = Pick<
  RootStackScreenProps<'App'>['navigation'],
  'navigate'
>;

/**
 * Header das abas (R5, M3): primeiro nome do responsável, aluno em uso,
 * TROCAR PERFIL só com mais de um aluno e SAIR sempre.
 */
export function useHeaderViewModel(navigation: HeaderNavigation) {
  const { guardianFirstName, students, student } = useSessionStudent();
  const { logout, loggingOut } = useLogout();
  const canSwitchStudent = students.length > 1;

  const onSwitchStudent = () => {
    if (canSwitchStudent) navigation.navigate('SelectStudent');
  };

  return {
    guardianFirstName,
    student: student
      ? {
          id: student.id,
          firstName: student.firstName,
          rm: student.rm,
          className: student.className,
          period: student.period,
        }
      : null,
    canSwitchStudent,
    onSwitchStudent,
    onLogout: logout,
    logoutDisabled: loggingOut,
  };
}
