import { queryClient, queryKeys } from '../../../app/queryClient';
import type { Me } from '../schemas';
import { getMe } from '../services/auth.service';

type LoadMeOnBootOptions = {
  timeoutMs: number;
  signal?: AbortSignal;
};

/**
 * `GET /me` da abertura do app (splash): sem retry, com timeout próprio e
 * cancelável. O resultado vai para o cache do `useMeQuery`, então a primeira
 * tela autenticada não repete o request.
 */
export async function loadMeOnBoot({
  timeoutMs,
  signal,
}: LoadMeOnBootOptions): Promise<Me> {
  const me = await getMe(signal, { timeoutMs });
  queryClient.setQueryData(queryKeys.me(), me);
  return me;
}
