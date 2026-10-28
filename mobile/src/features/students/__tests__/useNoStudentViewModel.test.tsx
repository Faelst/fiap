import { act, renderHook } from '@testing-library/react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { useSessionStore } from '../../../stores/session.store';
import { meWithoutStudents } from '../../../test/fixtures';
import { QueryWrapper } from '../../../test/queryWrapper';
import { useNoStudentViewModel } from '../useNoStudentViewModel';

describe('useNoStudentViewModel', () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meWithoutStudents);
    useSessionStore.setState({ status: 'signedIn', signOutReason: null });
  });

  it('saúda o responsável pelo primeiro nome do /me', async () => {
    const { result } = await renderHook(() => useNoStudentViewModel(), {
      wrapper: QueryWrapper,
    });

    expect(result.current.guardianFirstName).toBe('Carlos');
  });

  it('SAIR encerra a sessão e desabilita o botão', async () => {
    const { result } = await renderHook(() => useNoStudentViewModel(), {
      wrapper: QueryWrapper,
    });

    expect(result.current.logoutDisabled).toBe(false);
    await act(() => result.current.onLogout());

    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      signOutReason: 'manual',
    });
  });
});
