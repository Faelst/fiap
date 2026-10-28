import { CompactHeader } from '../../components/CompactHeader';
import { EmptyState } from '../../components/EmptyState';
import { LogoutIcon } from '../../components/icons/LogoutIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { PillButton } from '../../components/PillButton';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import { Box, sizes } from '../../theme';
import { useNoStudentViewModel } from './useNoStudentViewModel';

/** Ícone do Sair, na cor que o `PillButton` passa. */
const logoutIcon = (color: string) => (
  <LogoutIcon color={color} size={sizes.iconSmall} />
);

/**
 * Responsável sem aluno vinculado (M7, 01-design.md da v2 3.6): header
 * compacto sem chip, com a saudação e "Sua conta", e o estado vazio no meio
 * da sobra da tela. Sair é a única saída, então sai na hora (DV7). Sem tab
 * bar.
 */
export function NoStudentScreen() {
  const vm = useNoStudentViewModel();

  return (
    <Screen testID="no-student-screen">
      <CompactHeader
        title={strings.noStudent.screenTitle}
        titleTestID="no-student-title"
        guardianFirstName={vm.guardianFirstName}
      />
      <Box testID="no-student-body" flex={1} justifyContent="center">
        <EmptyState
          testID="no-student-empty"
          icon={UsersIcon}
          title={strings.noStudent.title}
          description={strings.noStudent.description}
          action={
            <PillButton
              testID="no-student-logout-button"
              label={strings.noStudent.logout}
              variant="secondary"
              size="sm"
              icon={logoutIcon}
              disabled={vm.logoutDisabled}
              onPress={vm.onLogout}
            />
          }
        />
      </Box>
    </Screen>
  );
}
