import { ActionBar } from '../../components/ActionBar';
import { ErrorState } from '../../components/ErrorState';
import { WifiOffIcon } from '../../components/icons/WifiOffIcon';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import type { RootStackScreenProps } from '../../navigation/types';
import { useBootErrorViewModel } from './useBootErrorViewModel';

/**
 * Erro de rede na abertura (01-design.md, 3.7): barra só com SAIR, sem
 * saudação (o `/me` falhou), e o ErrorState com TENTAR DE NOVO.
 */
export function BootErrorScreen({
  navigation,
}: RootStackScreenProps<'BootError'>) {
  const vm = useBootErrorViewModel(navigation);

  return (
    <Screen testID="boot-error-screen">
      <ActionBar
        canSwitchStudent={false}
        onLogout={vm.onLogout}
        logoutDisabled={vm.logoutDisabled}
      />
      <ErrorState
        testID="boot-error"
        icon={WifiOffIcon}
        title={strings.boot.error.title}
        description={strings.common.error.description}
        onRetry={vm.onRetry}
        retrying={vm.retrying}
        shakeKey={vm.shakeKey}
        announce
      />
    </Screen>
  );
}
