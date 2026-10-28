import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { strings } from '../../constants/strings';
import { useSessionStore } from '../../stores/session.store';
import { fullName } from '../../utils/names';
import { useMeQuery } from '../auth/api/useMeQuery';
import { useLogout } from '../auth/useLogout';
import { useSessionStudent } from '../students/useSessionStudent';

type ProfileViewModelInput = {
  /** A aba está visível. Sair dela desfaz a confirmação de saída. */
  focused: boolean;
};

/**
 * Aba Perfil (V3, 01-design.md da v2 3.5): dados do `/me` (nome completo e
 * CPF, que já vem mascarado), os alunos com o atual em destaque e a troca na
 * hora, sem mudar de tela (DV8). Sair pede confirmação inline (DV7) e faz o
 * logout completo do `useLogout`.
 */
export function useProfileViewModel({ focused }: ProfileViewModelInput) {
  const { data: me, refetch } = useMeQuery();
  const { students, student } = useSessionStudent();
  const selectStudent = useSessionStore(state => state.selectStudent);
  const { logout, loggingOut } = useLogout();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!focused) setConfirmingLogout(false);
  }, [focused]);

  const onSelectStudent = (id: string) => {
    const chosen = students.find(item => item.id === id);
    if (!chosen || id === student?.id) return;
    setConfirmingLogout(false);
    selectStudent(id);
    AccessibilityInfo.announceForAccessibility(
      strings.profile.switchedAnnouncement(
        fullName(chosen.firstName, chosen.lastName),
      ),
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return {
    guardian: me
      ? {
          fullName: fullName(me.firstName, me.lastName),
          firstName: me.firstName,
          lastName: me.lastName,
          cpfMasked: me.cpf,
        }
      : null,
    students: students.map(item => ({
      id: item.id,
      fullName: fullName(item.firstName, item.lastName),
      firstName: item.firstName,
      lastName: item.lastName,
      rm: item.rm,
      className: item.className,
      period: item.period,
      selected: item.id === student?.id,
    })),
    canSwitch: students.length > 1,
    onSelectStudent,
    confirmingLogout,
    onAskLogout: () => setConfirmingLogout(true),
    onCancelLogout: () => setConfirmingLogout(false),
    onConfirmLogout: logout,
    loggingOut,
    refreshing,
    onRefresh,
  };
}
