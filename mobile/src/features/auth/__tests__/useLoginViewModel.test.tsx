import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import * as Keychain from 'react-native-keychain';

import { queryClient } from '../../../app/queryClient';
import { strings } from '../../../constants/strings';
import { ApiError } from '../../../services/http/errors';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { API_URL, loginResponse } from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import * as authService from '../services/auth.service';
import { useLoginViewModel } from '../useLoginViewModel';

const VALID_CPF = '96929456004';
const INVALID_DV_CPF = '96929456005';

const setup = () =>
  renderHook(() => useLoginViewModel(), { wrapper: QueryWrapper });

type Result = Awaited<ReturnType<typeof setup>>['result'];

const fill = async (result: Result, cpf: string, password: string) => {
  await act(() => result.current.cpf.onChangeText(cpf));
  await act(() => result.current.password.onChangeText(password));
};

const submit = (result: Result) =>
  act(async () => {
    result.current.submit();
  });

const loginReplies = (response: Response | (() => Response)) =>
  server.use(
    http.post(`${API_URL}/auth/login`, () =>
      typeof response === 'function' ? response() : response,
    ),
  );

describe('useLoginViewModel', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    useSessionStore.setState({ signOutReason: null });
    queryClient.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('máscara e botão', () => {
    it('aplica a máscara do CPF no valor do formulário', async () => {
      const { result } = await setup();

      await act(() => result.current.cpf.onChangeText('9692945'));
      expect(result.current.cpf.value).toBe('969.294.5');

      await act(() => result.current.cpf.onChangeText(`${VALID_CPF}99`));
      expect(result.current.cpf.value).toBe('969.294.560-04');
    });

    it('começa com o botão desabilitado e sem mensagem', async () => {
      const { result } = await setup();

      expect(result.current.canSubmit).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errorMessage).toBeNull();
    });

    it('habilita só com CPF válido e senha preenchida', async () => {
      const { result } = await setup();

      await act(() => result.current.cpf.onChangeText(VALID_CPF));
      await waitFor(() => expect(result.current.canSubmit).toBe(false));

      await act(() => result.current.password.onChangeText('1'));
      await waitFor(() => expect(result.current.canSubmit).toBe(true));

      await act(() => result.current.password.onChangeText(''));
      await waitFor(() => expect(result.current.canSubmit).toBe(false));
    });

    it('CPF com 11 dígitos e dígito verificador errado não habilita', async () => {
      const { result } = await setup();

      await fill(result, INVALID_DV_CPF, '123456');

      await waitFor(() => expect(result.current.canSubmit).toBe(false));
    });

    it('enviar com o formulário inválido (tecla "go") não chama a API', async () => {
      const onLogin = jest.fn();
      server.use(
        http.post(`${API_URL}/auth/login`, () => {
          onLogin();
          return HttpResponse.json(loginResponse);
        }),
      );
      const { result } = await setup();
      await fill(result, INVALID_DV_CPF, '123456');

      await submit(result);

      expect(onLogin).not.toHaveBeenCalled();
      expect(useSessionStore.getState().status).toBe('signedOut');
    });
  });

  describe('CPF com dígito errado', () => {
    it('ao sair do campo mostra "Confira o CPF digitado." e some quando o CPF muda', async () => {
      const { result } = await setup();
      await act(() => result.current.cpf.onChangeText(INVALID_DV_CPF));

      await act(() => result.current.cpf.onBlur());
      await waitFor(() =>
        expect(result.current.errorMessage).toBe(strings.login.error.cpf),
      );

      await act(() => result.current.cpf.onChangeText('9692945600'));
      expect(result.current.errorMessage).toBeNull();
    });

    it('CPF incompleto não mostra erro ao sair do campo', async () => {
      const { result } = await setup();
      await act(() => result.current.cpf.onChangeText('969294'));

      await act(() => result.current.cpf.onBlur());

      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('envio', () => {
    it('credencial certa abre a sessão (o stack troca para as abas)', async () => {
      const { result } = await setup();
      await fill(result, VALID_CPF, '123456');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));

      await submit(result);

      await waitFor(() =>
        expect(useSessionStore.getState().status).toBe('signedIn'),
      );
      expect(await createSecureStorage().getToken()).toBe('jwt-gustavo');
      expect(result.current.errorMessage).toBeNull();
    });

    it('fica carregando enquanto a API responde e não envia duas vezes', async () => {
      let release: () => void = () => {};
      const onLogin = jest.fn();
      server.use(
        http.post(`${API_URL}/auth/login`, async () => {
          onLogin();
          await new Promise<void>(resolve => {
            release = resolve;
          });
          return HttpResponse.json(loginResponse);
        }),
      );
      const { result } = await setup();
      await fill(result, VALID_CPF, '123456');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));

      await submit(result);
      await waitFor(() => expect(result.current.isSubmitting).toBe(true));
      expect(result.current.canSubmit).toBe(false);
      await submit(result);

      await act(async () => release());
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(onLogin).toHaveBeenCalledTimes(1);
    });

    it('401 mostra o texto do Figma, mantém os valores e dispara o shake', async () => {
      const { result } = await setup();
      await fill(result, VALID_CPF, 'errada');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));
      const shakeBefore = result.current.shakeKey;

      await submit(result);

      await waitFor(() =>
        expect(result.current.errorMessage).toBe(strings.login.error.invalid),
      );
      expect(result.current.shakeKey).not.toBe(0);
      expect(result.current.shakeKey).not.toBe(shakeBefore);
      expect(result.current.cpf.value).toBe('969.294.560-04');
      expect(result.current.password.value).toBe('errada');
      expect(result.current.canSubmit).toBe(true);
      expect(useSessionStore.getState().status).toBe('signedOut');
    });

    it('errar de novo sem editar dispara outro shake', async () => {
      let now = 1_000;
      jest.spyOn(Date, 'now').mockImplementation(() => (now += 1_000));
      const { result } = await setup();
      await fill(result, VALID_CPF, 'errada');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));
      await submit(result);
      await waitFor(() => expect(result.current.shakeKey).not.toBe(0));
      const firstShake = result.current.shakeKey;

      await submit(result);

      await waitFor(() => expect(result.current.shakeKey).not.toBe(firstShake));
      expect(result.current.errorMessage).toBe(strings.login.error.invalid);
    });

    it('a mensagem de erro some quando edita qualquer campo', async () => {
      const { result } = await setup();
      await fill(result, VALID_CPF, 'errada');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));
      await submit(result);
      await waitFor(() =>
        expect(result.current.errorMessage).toBe(strings.login.error.invalid),
      );

      await act(() => result.current.password.onChangeText('errada1'));

      expect(result.current.errorMessage).toBeNull();
    });

    it('429 mostra a mensagem de muitas tentativas', async () => {
      loginReplies(
        HttpResponse.json(
          { statusCode: 429, message: 'ThrottlerException' },
          { status: 429 },
        ),
      );
      const { result } = await setup();
      await fill(result, VALID_CPF, '123456');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));

      await submit(result);

      await waitFor(() =>
        expect(result.current.errorMessage).toBe(strings.login.error.tooMany),
      );
      expect(result.current.shakeKey).not.toBe(0);
    });

    it('sem rede mostra a mensagem de conexão', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      loginReplies(() => HttpResponse.error());
      const { result } = await setup();
      await fill(result, VALID_CPF, '123456');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));

      await submit(result);

      await waitFor(() =>
        expect(result.current.errorMessage).toBe(strings.login.error.network),
      );
      expect(result.current.shakeKey).not.toBe(0);
    });

    it('5xx mostra a mensagem de erro do servidor', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      loginReplies(
        HttpResponse.json(
          { statusCode: 500, message: 'Internal server error' },
          { status: 500 },
        ),
      );
      const { result } = await setup();
      await fill(result, VALID_CPF, '123456');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));

      await submit(result);

      await waitFor(() =>
        expect(result.current.errorMessage).toBe(strings.login.error.server),
      );
    });

    it('falha do keychain mostra a mensagem pronta do erro storage', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Keystore bloqueado'),
      );
      const { result } = await setup();
      await fill(result, VALID_CPF, '123456');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));

      await submit(result);

      await waitFor(() =>
        expect(result.current.errorMessage).toBe(
          'Não foi possível salvar o acesso neste aparelho. Tente de novo.',
        ),
      );
      expect(useSessionStore.getState().status).toBe('signedOut');
    });

    it('request cancelado não é erro de tela: sem mensagem e sem shake', async () => {
      let cancel: (error: ApiError) => void = () => {};
      jest.spyOn(authService, 'login').mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            cancel = reject;
          }),
      );
      const { result } = await setup();
      await fill(result, VALID_CPF, '123456');
      await waitFor(() => expect(result.current.canSubmit).toBe(true));
      await submit(result);
      await waitFor(() => expect(result.current.isSubmitting).toBe(true));

      await act(async () => cancel(new ApiError('canceled')));

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.shakeKey).toBe(0);
    });
  });

  describe('sessão expirada', () => {
    it('abre com o aviso de sessão expirada, sem shake', async () => {
      useSessionStore.setState({ signOutReason: 'expired' });

      const { result } = await setup();

      expect(result.current.errorMessage).toBe(
        strings.login.error.sessionExpired,
      );
      expect(result.current.shakeKey).toBe(0);
    });

    it('o aviso some quando começa a digitar', async () => {
      useSessionStore.setState({ signOutReason: 'expired' });
      const { result } = await setup();

      await act(() => result.current.cpf.onChangeText('9'));

      expect(result.current.errorMessage).toBeNull();
    });

    it('logout manual não mostra aviso', async () => {
      useSessionStore.setState({ signOutReason: 'manual' });

      const { result } = await setup();

      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('teclado', () => {
    it('"next" do CPF foca a senha', async () => {
      const { result } = await setup();
      const focus = jest.fn();
      Object.assign(result.current.passwordRef, { current: { focus } });

      await act(() => result.current.focusPassword());

      expect(focus).toHaveBeenCalledTimes(1);
    });
  });
});
