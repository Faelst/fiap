import { act, renderHook } from '@testing-library/react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { meResponse } from '../../../test/fixtures';
import { useLogout } from '../useLogout';

describe('useLogout', () => {
  beforeEach(async () => {
    await createSecureStorage().setToken('jwt-salvo');
    useSessionStore.setState({
      status: 'signedIn',
      selectedStudentId: 's2',
      signOutReason: null,
    });
    queryClient.setQueryData(queryKeys.me(), meResponse);
  });

  it('apaga o token, o aluno salvo e o cache, com motivo manual', async () => {
    const { result } = await renderHook(() => useLogout());

    await act(() => result.current.logout());

    expect(await createSecureStorage().getToken()).toBeNull();
    expect(queryClient.getQueryData(queryKeys.me())).toBeUndefined();
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      selectedStudentId: null,
      signOutReason: 'manual',
    });
  });

  it('fica desabilitado enquanto sai e não sai duas vezes', async () => {
    const signOut = jest.fn(() => new Promise<void>(() => {}));
    useSessionStore.setState({ signOut });
    const { result } = await renderHook(() => useLogout());

    expect(result.current.loggingOut).toBe(false);
    await act(async () => {
      result.current.logout();
    });
    expect(result.current.loggingOut).toBe(true);
    await act(async () => {
      result.current.logout();
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith('manual');
  });
});
