import { http as mswHttp, HttpResponse } from 'msw';

import { queryClient } from '../../../app/queryClient';
import { useSessionStore } from '../../../stores/session.store';
import { API_URL, loginResponse } from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { logger } from '../../logger';
import { createSecureStorage } from '../../storage/secureStorage';
import { http } from '../client';
import { ApiError } from '../errors';

const guardian = loginResponse.guardian;

async function signedIn(token = 'jwt-1') {
  await useSessionStore.getState().signIn(token, guardian);
}

describe('http client', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    useSessionStore.setState({ signOutReason: null });
    queryClient.clear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('usa o API_URL do react-native-config como baseURL', () => {
    expect(http.defaults.baseURL).toBe(API_URL);
  });

  it('manda o token do keychain como Bearer', async () => {
    await signedIn('jwt-1');
    let authorization: string | null = null;
    server.use(
      mswHttp.get(`${API_URL}/me`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return HttpResponse.json({});
      }),
    );

    await http.get('/me');
    expect(authorization).toBe('Bearer jwt-1');
  });

  it('sem token não manda Authorization', async () => {
    let authorization: string | null = 'x';
    server.use(
      mswHttp.get(`${API_URL}/me`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return HttpResponse.json({});
      }),
    );

    await http.get('/me');
    expect(authorization).toBeNull();
  });

  it('401 numa rota protegida limpa a sessão (sessão expirada)', async () => {
    await signedIn();
    queryClient.setQueryData(['me'], { id: 'g1' });
    server.use(
      mswHttp.get(`${API_URL}/me`, () =>
        HttpResponse.json({ statusCode: 401 }, { status: 401 }),
      ),
    );

    await expect(http.get('/me')).rejects.toMatchObject({
      kind: 'unauthorized',
    });

    const state = useSessionStore.getState();
    expect(state.status).toBe('signedOut');
    expect(state.signOutReason).toBe('expired');
    expect(await createSecureStorage().getToken()).toBeNull();
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
  });

  it('vários 401 juntos encerram a sessão uma vez só', async () => {
    await signedIn();
    const signOut = jest.spyOn(useSessionStore.getState(), 'signOut');
    server.use(
      mswHttp.get(`${API_URL}/me`, () =>
        HttpResponse.json({ statusCode: 401 }, { status: 401 }),
      ),
    );

    await Promise.allSettled([http.get('/me'), http.get('/me')]);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('401 atrasado de um request feito com o token antigo não derruba a sessão nova', async () => {
    await signedIn('jwt-antigo');
    let release!: () => void;
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    let arrived!: (authorization: string | null) => void;
    const reachedApi = new Promise<string | null>(resolve => {
      arrived = resolve;
    });
    server.use(
      mswHttp.get(`${API_URL}/students/:id/agenda`, async ({ request }) => {
        arrived(request.headers.get('authorization'));
        await gate;
        return HttpResponse.json({ statusCode: 401 }, { status: 401 });
      }),
    );

    const slow = http.get('/students/s1/agenda');
    expect(await reachedApi).toBe('Bearer jwt-antigo');
    await useSessionStore.getState().signOut('expired');
    await useSessionStore.getState().signIn('jwt-novo', guardian);
    release();

    await expect(slow).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(useSessionStore.getState().status).toBe('signedIn');
    expect(await createSecureStorage().getToken()).toBe('jwt-novo');
  });

  it('request cancelado pelo signal vira canceled e não mexe na sessão', async () => {
    await signedIn();
    const controller = new AbortController();
    controller.abort();

    await expect(
      http.get('/me', { signal: controller.signal }),
    ).rejects.toMatchObject({ kind: 'canceled' });
    expect(useSessionStore.getState().status).toBe('signedIn');
  });

  it('401 no login é credencial errada: não mexe na sessão', async () => {
    await signedIn('jwt-velho');

    await expect(
      http.post('/auth/login', { cpf: '96929456004', password: 'errada' }),
    ).rejects.toMatchObject({
      kind: 'unauthorized',
      apiMessage: 'Usuário ou senha inválida.',
    });
    expect(useSessionStore.getState().status).toBe('signedIn');
    expect(await createSecureStorage().getToken()).toBe('jwt-velho');
  });

  it('o login não leva o token de uma sessão anterior', async () => {
    await signedIn('jwt-velho');
    let authorization: string | null = 'x';
    server.use(
      mswHttp.post(`${API_URL}/auth/login`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return HttpResponse.json(loginResponse);
      }),
    );

    await http.post('/auth/login', { cpf: '96929456004', password: '123456' });
    expect(authorization).toBeNull();
  });

  it('erro de rede vira ApiError network', async () => {
    server.use(mswHttp.get(`${API_URL}/me`, () => HttpResponse.error()));

    const error = await http.get('/me').catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe('network');
  });

  it('loga método, URL, status e duração, sem token nem corpo', async () => {
    await signedIn('jwt-secreto');
    const info = jest.spyOn(logger, 'info');

    await http.get('/me');

    expect(info).toHaveBeenCalledWith(
      'http GET /me 200',
      expect.objectContaining({
        method: 'GET',
        url: '/me',
        status: 200,
        durationMs: expect.any(Number),
      }),
    );
    expect(JSON.stringify(info.mock.calls)).not.toContain('jwt-secreto');
  });

  it('erro esperado (4xx) é info, sem warn (o LogBox não cobre a tela em dev), e sem CPF nem senha', async () => {
    const info = jest.spyOn(logger, 'info');
    const warn = jest.spyOn(logger, 'warn');

    await http
      .post('/auth/login', { cpf: '96929456004', password: 'errada' })
      .catch(() => undefined);

    expect(info).toHaveBeenCalledWith(
      'http POST /auth/login 401',
      expect.objectContaining({ status: 401, kind: 'unauthorized' }),
    );
    expect(warn).not.toHaveBeenCalled();
    const logged = JSON.stringify(info.mock.calls);
    expect(logged).not.toContain('96929456004');
    expect(logged).not.toContain('errada');
  });

  it('erro inesperado (5xx, rede) continua warn', async () => {
    const warn = jest.spyOn(logger, 'warn');
    server.use(
      mswHttp.get(`${API_URL}/me`, () =>
        HttpResponse.json({ statusCode: 500 }, { status: 500 }),
      ),
    );

    await http.get('/me').catch(() => undefined);
    expect(warn).toHaveBeenCalledWith(
      'http GET /me 500',
      expect.objectContaining({ kind: 'server' }),
    );
  });
});
