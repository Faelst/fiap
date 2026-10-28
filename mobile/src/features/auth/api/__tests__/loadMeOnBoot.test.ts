import { delay, http, HttpResponse } from 'msw';

import { queryClient, queryKeys } from '../../../../app/queryClient';
import { useSessionStore } from '../../../../stores/session.store';
import { API_URL, loginResponse, meResponse } from '../../../../test/fixtures';
import { server } from '../../../../test/msw/server';
import { loadMeOnBoot } from '../loadMeOnBoot';

describe('loadMeOnBoot', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    queryClient.clear();
    await useSessionStore.getState().signIn('jwt-1', loginResponse.guardian);
  });

  it('devolve o /me e já deixa no cache da query do /me', async () => {
    const me = await loadMeOnBoot({ timeoutMs: 8000 });

    expect(me).toEqual(meResponse);
    expect(queryClient.getQueryData(queryKeys.me())).toEqual(meResponse);
  });

  it('API que não responde dentro do timeout vira erro de rede', async () => {
    server.use(
      http.get(`${API_URL}/me`, async () => {
        await delay(300);
        return HttpResponse.json(meResponse);
      }),
    );

    await expect(loadMeOnBoot({ timeoutMs: 20 })).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'network',
    });
    expect(queryClient.getQueryData(queryKeys.me())).toBeUndefined();
  });

  it('signal abortado vira canceled', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      loadMeOnBoot({ timeoutMs: 8000, signal: controller.signal }),
    ).rejects.toMatchObject({ kind: 'canceled' });
  });
});
