import { getAgenda } from '../lessons.service';

describe('getAgenda', () => {
  it('repassa o signal do React Query ao request (cancelar aborta de verdade)', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(getAgenda('s1', controller.signal)).rejects.toMatchObject({
      kind: 'canceled',
    });
  });
});
