import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { AccessibilityInfo } from 'react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { API_URL, meResponse } from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { useProfileViewModel } from '../useProfileViewModel';

type Props = { focused: boolean };

const renderProfile = (focused = true) =>
  renderHook(
    ({ focused: isFocused }: Props) =>
      useProfileViewModel({ focused: isFocused }),
    {
      initialProps: { focused },
      wrapper: QueryWrapper,
    },
  );

const onlyRafael = { ...meResponse, students: [meResponse.students[0]] };

const { selectStudent: realSelectStudent, signOut: realSignOut } =
  useSessionStore.getState();

describe('useProfileViewModel', () => {
  let announce: jest.SpyInstance;

  beforeAll(() => {
    queryClient.setQueryDefaults(queryKeys.me(), { retryDelay: 0 });
  });

  afterAll(() => {
    queryClient.setQueryDefaults(queryKeys.me(), {});
  });

  beforeEach(async () => {
    await createSecureStorage().setToken('jwt-salvo');
    useSessionStore.setState({
      status: 'signedIn',
      selectedStudentId: 's1',
      signOutReason: null,
    });
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meResponse);
    announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    // O preset do RN já mocka o AccessibilityInfo com jest.fn: o spyOn
    // devolve o mesmo mock, e as chamadas de um teste passariam ao próximo.
    announce.mockClear();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    // O hook do teste ainda está montado: a troca no store re-renderiza.
    await act(async () =>
      useSessionStore.setState({
        selectStudent: realSelectStudent,
        signOut: realSignOut,
      }),
    );
  });

  it('responsável com nome completo e o CPF como a API manda (já mascarado)', async () => {
    const { result } = await renderProfile();

    expect(result.current.guardian).toEqual({
      fullName: 'Gustavo da Silva',
      firstName: 'Gustavo',
      lastName: 'da Silva',
      cpfMasked: '***.294.560-**',
    });
  });

  it('lista os alunos com os dados da linha, marcando o atual', async () => {
    const { result } = await renderProfile();

    expect(result.current.students).toEqual([
      {
        id: 's1',
        fullName: 'Rafael da Silva',
        firstName: 'Rafael',
        lastName: 'da Silva',
        rm: 12567,
        className: '7EF',
        period: 'Matutino',
        selected: true,
      },
      {
        id: 's2',
        fullName: 'Marina da Silva',
        firstName: 'Marina',
        lastName: 'da Silva',
        rm: 12568,
        className: '3EF',
        period: 'Vespertino',
        selected: false,
      },
    ]);
    expect(result.current.canSwitch).toBe(true);
  });

  it('com 1 aluno, ele é o atual e não há troca', async () => {
    queryClient.setQueryData(queryKeys.me(), onlyRafael);
    const { result } = await renderProfile();

    expect(result.current.students.map(s => [s.id, s.selected])).toEqual([
      ['s1', true],
    ]);
    expect(result.current.canSwitch).toBe(false);
  });

  it('sem o /me no cache ainda: sem responsável e sem alunos', async () => {
    queryClient.clear();
    server.use(http.get(`${API_URL}/me`, () => new Promise<never>(() => {})));
    const { result } = await renderProfile();

    expect(result.current.guardian).toBeNull();
    expect(result.current.students).toEqual([]);
    expect(result.current.canSwitch).toBe(false);
  });

  describe('trocar de aluno (DV8)', () => {
    it('troca no store na hora, sem navegar, e o destaque muda de linha', async () => {
      const { result } = await renderProfile();

      await act(async () => result.current.onSelectStudent('s2'));

      expect(useSessionStore.getState().selectedStudentId).toBe('s2');
      expect(result.current.students.map(s => s.selected)).toEqual([
        false,
        true,
      ]);
    });

    it('anuncia ao leitor de tela quem está sendo mostrado', async () => {
      const { result } = await renderProfile();

      await act(async () => result.current.onSelectStudent('s2'));

      expect(announce).toHaveBeenCalledWith('Agora mostrando Marina da Silva.');
    });

    it('tocar no aluno atual não faz nada (sem troca e sem anúncio)', async () => {
      const selectStudent = jest.fn();
      useSessionStore.setState({ selectStudent });
      const { result } = await renderProfile();

      await act(async () => result.current.onSelectStudent('s1'));

      expect(selectStudent).not.toHaveBeenCalled();
      expect(announce).not.toHaveBeenCalled();
    });

    it('aluno que não é deste responsável é ignorado', async () => {
      const { result } = await renderProfile();

      await act(async () => result.current.onSelectStudent('s99'));

      expect(useSessionStore.getState().selectedStudentId).toBe('s1');
      expect(announce).not.toHaveBeenCalled();
    });

    it('trocar de aluno desfaz a confirmação de saída', async () => {
      const { result } = await renderProfile();

      await act(async () => result.current.onAskLogout());
      await act(async () => result.current.onSelectStudent('s2'));

      expect(result.current.confirmingLogout).toBe(false);
    });
  });

  describe('sair com confirmação inline (DV7)', () => {
    it('o 1º toque só pede confirmação, sem sair', async () => {
      const { result } = await renderProfile();
      expect(result.current.confirmingLogout).toBe(false);

      await act(async () => result.current.onAskLogout());

      expect(result.current.confirmingLogout).toBe(true);
      expect(useSessionStore.getState().status).toBe('signedIn');
    });

    it('Cancelar volta ao normal', async () => {
      const { result } = await renderProfile();

      await act(async () => result.current.onAskLogout());
      await act(async () => result.current.onCancelLogout());

      expect(result.current.confirmingLogout).toBe(false);
      expect(useSessionStore.getState().status).toBe('signedIn');
    });

    it('Sair faz o logout completo (token, aluno salvo e cache)', async () => {
      const { result } = await renderProfile();

      await act(async () => result.current.onAskLogout());
      await act(async () => result.current.onConfirmLogout());

      expect(await createSecureStorage().getToken()).toBeNull();
      expect(queryClient.getQueryData(queryKeys.me())).toBeUndefined();
      expect(useSessionStore.getState()).toMatchObject({
        status: 'signedOut',
        selectedStudentId: null,
        signOutReason: 'manual',
      });
    });

    it('fica carregando enquanto sai e não sai duas vezes', async () => {
      const signOut = jest.fn(() => new Promise<void>(() => {}));
      useSessionStore.setState({ signOut });
      const { result } = await renderProfile();

      await act(async () => result.current.onAskLogout());
      await act(async () => {
        result.current.onConfirmLogout();
      });
      expect(result.current.loggingOut).toBe(true);
      await act(async () => {
        result.current.onConfirmLogout();
      });

      expect(signOut).toHaveBeenCalledTimes(1);
    });

    it('sair da aba (blur) desfaz a confirmação', async () => {
      const { result, rerender } = await renderProfile(true);

      await act(async () => result.current.onAskLogout());
      await rerender({ focused: false });

      expect(result.current.confirmingLogout).toBe(false);
    });
  });

  describe('puxar para atualizar', () => {
    it('busca o /me de novo e mostra o indicador até terminar', async () => {
      let release = () => {};
      const gate = new Promise<void>(resolve => {
        release = resolve;
      });
      const renamed = { ...meResponse, firstName: 'Gustavo Henrique' };
      server.use(
        http.get(`${API_URL}/me`, async () => {
          await gate;
          return HttpResponse.json(renamed);
        }),
      );
      const { result } = await renderProfile();
      expect(result.current.refreshing).toBe(false);

      await act(async () => {
        result.current.onRefresh();
      });
      expect(result.current.refreshing).toBe(true);

      await act(async () => release());
      await waitFor(() => expect(result.current.refreshing).toBe(false));
      expect(result.current.guardian?.fullName).toBe(
        'Gustavo Henrique da Silva',
      );
    });

    it('falha no refresh: o indicador some e os dados ficam', async () => {
      server.use(
        http.get(`${API_URL}/me`, () =>
          HttpResponse.json({ statusCode: 500 }, { status: 500 }),
        ),
      );
      const { result } = await renderProfile();

      await act(async () => {
        await result.current.onRefresh();
      });

      expect(result.current.refreshing).toBe(false);
      expect(result.current.guardian?.fullName).toBe('Gustavo da Silva');
    });
  });
});
