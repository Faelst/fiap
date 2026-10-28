import { QueryClient } from '@tanstack/react-query';
import { create } from 'zustand';

import { REDACTED } from '../../services/logger/redact';
import {
  snapshotQueryCache,
  snapshotStore,
  watchAppState,
} from '../stateInspector';

const credentials = { cpf: '52998224725', password: 'senha-secreta-123' };

const newClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

describe('stateInspector (Reactotron, D15)', () => {
  it('queries: chave, status e dados, com CPF redigido', () => {
    const client = newClient();
    client.setQueryData(['me'], {
      guardian: { firstName: 'Gustavo', cpf: '***.294.560-**' },
    });

    const { queries } = snapshotQueryCache(client);

    expect(queries).toEqual([
      expect.objectContaining({
        queryKey: ['me'],
        status: 'success',
        fetchStatus: 'idle',
        data: { guardian: { firstName: 'Gustavo', cpf: REDACTED } },
      }),
    ]);
  });

  it('mutations: só chave e status, nunca as variáveis (senha) nem o resultado (token)', async () => {
    const client = newClient();
    await client
      .getMutationCache()
      .build(client, {
        mutationKey: ['login'],
        mutationFn: async (_: typeof credentials) => ({
          accessToken: 'jwt-de-verdade',
        }),
        gcTime: Infinity,
      })
      .execute(credentials);

    const snapshot = snapshotQueryCache(client);

    expect(snapshot.mutations).toEqual([
      { mutationKey: ['login'], status: 'success' },
    ]);
    const serialized = JSON.stringify(snapshot);
    expect(serialized).not.toContain(credentials.password);
    expect(serialized).not.toContain(credentials.cpf);
    expect(serialized).not.toContain('jwt-de-verdade');
  });

  it('erro de query vira só nome e mensagem', async () => {
    const client = newClient();
    const failure = Object.assign(new Error('falhou'), {
      config: { headers: { Authorization: 'Bearer jwt-de-verdade' } },
    });
    await client
      .fetchQuery({
        queryKey: ['agenda', 's1'],
        queryFn: () => Promise.reject(failure),
      })
      .catch(() => undefined);

    const { queries } = snapshotQueryCache(client);

    expect(queries[0].error).toEqual({ name: 'Error', message: 'falhou' });
    expect(JSON.stringify(queries)).not.toContain('jwt-de-verdade');
  });

  it('store do zustand: só o estado (sem as ações), com CPF redigido', () => {
    const store = create(() => ({
      status: 'signedIn',
      guardian: { firstName: 'Gustavo', cpf: '***.294.560-**' },
      signOut: () => undefined,
    }));

    expect(snapshotStore(store)).toEqual({
      status: 'signedIn',
      guardian: { firstName: 'Gustavo', cpf: REDACTED },
    });
  });

  describe('watchAppState', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('manda o retrato das queries e das stores quando mudam, agrupando rajadas', () => {
      const client = newClient();
      const session = create(() => ({ selectedStudentId: 's1' }));
      const send = jest.fn();
      const stop = watchAppState({
        queryClient: client,
        stores: { session },
        send,
      });

      client.setQueryData(['me'], { ok: 1 });
      client.setQueryData(['me'], { ok: 2 });
      session.setState({ selectedStudentId: 's2' });
      expect(send).not.toHaveBeenCalled();

      jest.runOnlyPendingTimers();

      expect(send).toHaveBeenCalledTimes(1);
      const [state] = send.mock.calls[0];
      expect(state.stores).toEqual({ session: { selectedStudentId: 's2' } });
      expect(state.queryCache.queries[0].data).toEqual({ ok: 2 });

      stop();
      session.setState({ selectedStudentId: 's1' });
      jest.runOnlyPendingTimers();
      expect(send).toHaveBeenCalledTimes(1);
    });
  });
});
