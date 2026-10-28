import { ApiError } from '../../services/http/errors';
import { createQueryClient, queryKeys, shouldRetry } from '../queryClient';

describe('shouldRetry', () => {
  it.each([
    'unauthorized',
    'forbidden',
    'notFound',
    'invalidResponse',
    'badRequest',
  ] as const)('não tenta de novo em %p', kind => {
    expect(shouldRetry(0, new ApiError(kind))).toBe(false);
  });

  it('tenta de novo uma vez em erro de rede ou de servidor', () => {
    expect(shouldRetry(0, new ApiError('network'))).toBe(true);
    expect(shouldRetry(1, new ApiError('network'))).toBe(false);
    expect(shouldRetry(0, new ApiError('server', { status: 500 }))).toBe(true);
    expect(shouldRetry(1, new ApiError('server', { status: 500 }))).toBe(false);
  });
});

describe('createQueryClient', () => {
  it('usa o shouldRetry nas queries e não repete mutation', () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(shouldRetry);
    expect(defaults.queries?.staleTime).toBeGreaterThan(0);
    expect(defaults.mutations?.retry).toBe(false);
  });
});

describe('queryKeys', () => {
  it('separa o cache por aluno e por ano', () => {
    expect(queryKeys.me()).toEqual(['me']);
    expect(queryKeys.agenda('s1')).toEqual(['agenda', 's1']);
    expect(queryKeys.reportCards('s1')).toEqual(['reportCards', 's1']);
    expect(queryKeys.reportCard('s1', 2025)).toEqual([
      'reportCard',
      's1',
      2025,
    ]);
  });
});
