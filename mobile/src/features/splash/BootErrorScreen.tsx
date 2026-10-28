import { CompactHeader } from '../../components/CompactHeader';
import { ErrorState } from '../../components/ErrorState';
import { WifiOffIcon } from '../../components/icons/WifiOffIcon';
import { PillButton } from '../../components/PillButton';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import type { RootStackScreenProps } from '../../navigation/types';
import { Box } from '../../theme';
import { useBootErrorViewModel } from './useBootErrorViewModel';

/**
 * Erro de rede na abertura (01-design.md da v2, 3.7): header compacto só
 * com o logo e "Sem conexão" (sem saudação: o `/me` falhou), e o erro no
 * meio da tela com "Tentar de novo" em destaque e Sair embaixo, que sai na
 * hora e funciona offline.
 */
export function BootErrorScreen({
  navigation,
}: RootStackScreenProps<'BootError'>) {
  const vm = useBootErrorViewModel(navigation);

  return (
    <Screen testID="boot-error-screen">
      <CompactHeader
        title={strings.boot.screenTitle}
        titleTestID="boot-error-title"
      />
      <Box testID="boot-error-body" flex={1} justifyContent="center">
        <ErrorState
          testID="boot-error"
          icon={WifiOffIcon}
          title={strings.boot.error.title}
          description={strings.common.error.description}
          onRetry={vm.onRetry}
          retrying={vm.retrying}
          retryVariant="primary"
          shakeKey={vm.shakeKey}
          announce
          secondaryAction={
            <PillButton
              testID="boot-error-logout-button"
              label={strings.boot.logout}
              variant="ghost"
              size="sm"
              disabled={vm.logoutDisabled}
              onPress={vm.onLogout}
            />
          }
        />
      </Box>
    </Screen>
  );
}
