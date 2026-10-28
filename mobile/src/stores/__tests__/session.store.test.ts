import { queryClient } from '../../app/queryClient';
import { mmkv } from '../../services/storage/mmkv';
import { createSecureStorage } from '../../services/storage/secureStorage';
import { SESSION_STORAGE_KEY, useSessionStore } from '../session.store';

const guardian = { id: 'g1', firstName: 'Gustavo', lastName: 'da Silva' };

/** Token como o app veria depois de reaberto (lido do keychain). */
const tokenInKeychain = () => createSecureStorage().getToken();

describe('session store', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    useSessionStore.setState({ status: 'loading', signOutReason: null });
    queryClient.clear();
  });

  it('começa carregando', () => {
    expect(useSessionStore.getState().status).toBe('loading');
  });

  it('bootstrap sem token → signedOut', async () => {
    await useSessionStore.getState().bootstrap();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('bootstrap com token no keychain → signedIn', async () => {
    await createSecureStorage().setToken('jwt-antigo');
    await useSessionStore.getState().bootstrap();
    expect(useSessionStore.getState().status).toBe('signedIn');
  });

  it('bootstrapTimedOut fixa signedOut só se o keychain ainda não respondeu', () => {
    useSessionStore.getState().bootstrapTimedOut();
    expect(useSessionStore.getState().status).toBe('signedOut');

    useSessionStore.setState({ status: 'signedIn' });
    useSessionStore.getState().bootstrapTimedOut();
    expect(useSessionStore.getState().status).toBe('signedIn');
  });

  it('bootstrap atrasado não muda uma sessão que já foi decidida', async () => {
    await createSecureStorage().setToken('jwt-atrasado');
    const pending = useSessionStore.getState().bootstrap();
    useSessionStore.getState().bootstrapTimedOut();

    await pending;

    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('signIn grava o token no keychain e guarda o responsável', async () => {
    await useSessionStore.getState().signIn('jwt-1', guardian);

    const state = useSessionStore.getState();
    expect(state.status).toBe('signedIn');
    expect(state.guardian).toEqual(guardian);
    expect(state.signOutReason).toBeNull();
    expect(await tokenInKeychain()).toBe('jwt-1');
  });

  it('selectStudent persiste só o aluno no mmkv, nunca o token', async () => {
    await useSessionStore.getState().signIn('jwt-1', guardian);
    useSessionStore.getState().selectStudent('s2');

    const persisted = mmkv.getString(SESSION_STORAGE_KEY) ?? '';
    expect(JSON.parse(persisted).state).toEqual({ selectedStudentId: 's2' });
    expect(persisted).not.toContain('jwt-1');
    expect(persisted).not.toContain('Gustavo');
  });

  it('reidrata o aluno selecionado do mmkv', async () => {
    mmkv.set(
      SESSION_STORAGE_KEY,
      JSON.stringify({ state: { selectedStudentId: 's3' }, version: 1 }),
    );

    await useSessionStore.persist.rehydrate();
    expect(useSessionStore.getState().selectedStudentId).toBe('s3');
  });

  it('signOut apaga o token, limpa o estado e o cache do React Query', async () => {
    await useSessionStore.getState().signIn('jwt-1', guardian);
    useSessionStore.getState().selectStudent('s2');
    queryClient.setQueryData(['me'], { id: 'g1' });

    await useSessionStore.getState().signOut('expired');

    const state = useSessionStore.getState();
    expect(state.status).toBe('signedOut');
    expect(state.guardian).toBeNull();
    expect(state.selectedStudentId).toBeNull();
    expect(state.signOutReason).toBe('expired');
    expect(await tokenInKeychain()).toBeNull();
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
  });

  it('signOut aborta as queries em voo (o request da sessão antiga não volta depois)', async () => {
    let signal: AbortSignal | undefined;
    const pending = queryClient.fetchQuery({
      queryKey: ['agenda', 's1'],
      queryFn: ({ signal: querySignal }) => {
        signal = querySignal;
        return new Promise(() => {});
      },
    });
    pending.catch(() => undefined);

    await useSessionStore.getState().signOut('expired');
    expect(signal?.aborted).toBe(true);
  });

  it('signOut sem motivo é logout do usuário', async () => {
    await useSessionStore.getState().signIn('jwt-1', guardian);
    await useSessionStore.getState().signOut();
    expect(useSessionStore.getState().signOutReason).toBe('manual');
  });
});
