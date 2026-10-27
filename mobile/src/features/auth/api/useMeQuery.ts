import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../app/queryClient';
import { useSessionStore } from '../../../stores/session.store';
import { getMe } from '../services/auth.service';

/** Responsável logado e seus alunos. Também valida o token ao abrir o app. */
export function useMeQuery() {
  const signedIn = useSessionStore(state => state.status === 'signedIn');

  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: getMe,
    enabled: signedIn,
  });
}
