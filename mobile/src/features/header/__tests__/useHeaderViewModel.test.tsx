import { act, renderHook, waitFor } from '@testing-library/react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { meResponse } from '../../../test/fixtures';
import { QueryWrapper } from '../../../test/queryWrapper';
import { useHeaderViewModel } from '../useHeaderViewModel';

const meWithOneStudent = {
  ...meResponse,
  firstName: 'Adelaide',
  students: [meResponse.students[0]],
};

describe('useHeaderViewModel', () => {
  const navigate = jest.fn();

  beforeEach(async () => {
    navigate.mockClear();
    await useSessionStore.getState().signOut();
    await createSecureStorage().setToken('jwt-salvo');
    useSessionStore.setState({ status: 'signedIn', signOutReason: null });
    queryClient.clear();
  });

  const renderHeader = () =>
    renderHook(() => useHeaderViewModel({ navigate }), {
      wrapper: QueryWrapper,
    });

  it('mostra o primeiro nome do responsável e o aluno em uso', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);
    useSessionStore.setState({ selectedStudentId: 's2' });

    const { result } = await renderHeader();

    expect(result.current.guardianFirstName).toBe('Gustavo');
    expect(result.current.student).toEqual({
      id: 's2',
      firstName: 'Marina',
      rm: 12568,
      className: '3EF',
      period: 'Vespertino',
    });
  });

  it('com mais de um aluno, pode trocar e TROCAR PERFIL abre a seleção', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);
    const { result } = await renderHeader();

    expect(result.current.canSwitchStudent).toBe(true);
    await act(async () => result.current.onSwitchStudent());

    expect(navigate).toHaveBeenCalledWith('SelectStudent');
  });

  it('com um aluno só, não pode trocar e TROCAR PERFIL não navega', async () => {
    queryClient.setQueryData(queryKeys.me(), meWithOneStudent);
    const { result } = await renderHeader();

    expect(result.current.canSwitchStudent).toBe(false);
    await act(async () => result.current.onSwitchStudent());

    expect(navigate).not.toHaveBeenCalled();
  });

  it('SAIR encerra a sessão e desabilita o botão enquanto sai', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);
    const { result } = await renderHeader();

    expect(result.current.logoutDisabled).toBe(false);
    await act(() => result.current.onLogout());

    await waitFor(() =>
      expect(useSessionStore.getState().status).toBe('signedOut'),
    );
    expect(await createSecureStorage().getToken()).toBeNull();
  });
});
