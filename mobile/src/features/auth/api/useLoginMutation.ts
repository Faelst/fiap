import { useMutation } from '@tanstack/react-query';

import { useSessionStore } from '../../../stores/session.store';
import { login } from '../services/auth.service';

/** Login: em caso de sucesso grava o token no keychain e abre a sessão. */
export function useLoginMutation() {
  const signIn = useSessionStore(state => state.signIn);

  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken, guardian }) => signIn(accessToken, guardian),
  });
}
