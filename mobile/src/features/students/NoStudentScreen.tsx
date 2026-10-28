import { EmptyState } from '../../components/EmptyState';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import { Box } from '../../theme';
import { useNoStudentViewModel } from './useNoStudentViewModel';

/**
 * Responsável sem aluno vinculado (M7, 01-design.md 3.6): barra só com SAIR,
 * saudação e o estado vazio com a ilustração do "sem aulas". Sem tab bar.
 */
export function NoStudentScreen() {
  const vm = useNoStudentViewModel();

  return (
    <Screen testID="no-student-screen">
      <Header
        guardianFirstName={vm.guardianFirstName}
        canSwitchStudent={false}
        onSwitchStudent={() => {}}
        onLogout={vm.onLogout}
        logoutDisabled={vm.logoutDisabled}
      >
        <Box marginTop="section" paddingBottom="xxl">
          <EmptyState
            testID="no-student-empty"
            title={strings.noStudent.title}
            description={strings.noStudent.description}
          />
        </Box>
      </Header>
    </Screen>
  );
}
