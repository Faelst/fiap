import { useLogout } from '../auth/useLogout';
import { useSessionStudent } from './useSessionStudent';

/** Sem aluno vinculado (M7, 01-design.md 3.6): saudação e SAIR. */
export function useNoStudentViewModel() {
  const { guardianFirstName } = useSessionStudent();
  const { logout, loggingOut } = useLogout();

  return {
    guardianFirstName,
    onLogout: logout,
    logoutDisabled: loggingOut,
  };
}
