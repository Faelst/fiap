import { useNavigation } from '@react-navigation/native';
import type { ReactNode } from 'react';

import { Header } from '../../components/Header';
import { useFloatingTabBarInset } from '../../hooks/useFloatingTabBarInset';
import { useHeaderViewModel } from './useHeaderViewModel';

/**
 * Header das abas Agenda e Boletim, ligado ao ViewModel. A tela passa o
 * conteúdo dela como `children` (rola junto com a saudação), que termina
 * acima da tab bar flutuante (V6/N1).
 */
export function AppHeader({ children }: { children?: ReactNode }) {
  const navigation = useNavigation();
  const vm = useHeaderViewModel(navigation);
  const contentInsetBottom = useFloatingTabBarInset();

  return (
    <Header
      guardianFirstName={vm.guardianFirstName}
      student={vm.student}
      canSwitchStudent={vm.canSwitchStudent}
      onSwitchStudent={vm.onSwitchStudent}
      onLogout={vm.onLogout}
      logoutDisabled={vm.logoutDisabled}
      contentInsetBottom={contentInsetBottom}
    >
      {children}
    </Header>
  );
}
