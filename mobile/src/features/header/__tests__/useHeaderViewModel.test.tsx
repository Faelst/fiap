import { act, renderHook } from '@testing-library/react-native';

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

  it('mostra o primeiro nome do responsável e o aluno em uso, para o chip', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);
    useSessionStore.setState({ selectedStudentId: 's2' });

    const { result } = await renderHeader();

    expect(result.current.guardianFirstName).toBe('Gustavo');
    expect(result.current.student).toEqual({
      id: 's2',
      firstName: 'Marina',
      lastName: 'da Silva',
      rm: 12568,
      className: '3EF',
      period: 'Vespertino',
    });
  });

  it('tocar no chip leva à aba Perfil', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);
    const { result } = await renderHeader();

    await act(async () => result.current.onPressStudent());

    expect(navigate).toHaveBeenCalledWith('Perfil');
  });

  it('com um aluno só, o chip também leva ao Perfil (o Perfil é mais que a troca)', async () => {
    queryClient.setQueryData(queryKeys.me(), meWithOneStudent);
    const { result } = await renderHeader();

    expect(result.current.guardianFirstName).toBe('Adelaide');
    await act(async () => result.current.onPressStudent());

    expect(navigate).toHaveBeenCalledWith('Perfil');
  });

  it('sem /me no cache, sem aluno', async () => {
    const { result } = await renderHeader();

    expect(result.current.student).toBeNull();
  });
});
