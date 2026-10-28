import { useMutation } from '@tanstack/react-query';

import { ApiError } from '../../../services/http/errors';
import { useSessionStore } from '../../../stores/session.store';
import { login, type LoginInput } from '../services/auth.service';

const STORAGE_ERROR_MESSAGE =
  'Não foi possível salvar o acesso neste aparelho. Tente de novo.';

/**
 * Login: valida as credenciais na API e grava o token no keychain. Se o
 * keychain falhar, o erro sai como `ApiError('storage')`, para o ViewModel
 * ter sempre um `kind`.
 */
export function useLoginMutation() {
  const signIn = useSessionStore(state => state.signIn);

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { accessToken, guardian } = await login(input);
      try {
        await signIn(accessToken, guardian);
      } catch (cause) {
        throw new ApiError('storage', {
          message: STORAGE_ERROR_MESSAGE,
          cause,
        });
      }
      return guardian;
    },
  });
}
