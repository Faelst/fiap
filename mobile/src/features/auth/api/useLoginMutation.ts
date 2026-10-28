import { useMutation } from '@tanstack/react-query';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { ApiError } from '../../../services/http/errors';
import { useSessionStore } from '../../../stores/session.store';
import { getMe, login, type LoginInput } from '../services/auth.service';

const STORAGE_ERROR_MESSAGE =
  'Não foi possível salvar o acesso neste aparelho. Tente de novo.';

/**
 * Login: valida as credenciais na API, carrega o `/me` com o token novo e
 * grava o token no keychain. Se o `/me` falhar, o login falha junto (nada é
 * gravado). Se o keychain falhar, o erro sai como `ApiError('storage')`,
 * para o ViewModel ter sempre um `kind`.
 */
export function useLoginMutation() {
  const signIn = useSessionStore(state => state.signIn);

  return useMutation({
    // As variáveis (CPF e senha) saem do cache assim que o Login desmonta.
    gcTime: 0,
    mutationFn: async (input: LoginInput) => {
      const { accessToken, guardian } = await login(input);
      // O /me vem antes de abrir a sessão: com ele no cache, o RootStack já
      // abre no destino certo (abas ou sem aluno) e o Header não espera.
      const me = await getMe(undefined, { token: accessToken });
      queryClient.setQueryData(queryKeys.me(), me);
      try {
        await signIn(accessToken);
      } catch (cause) {
        // Sem sessão, os dados do responsável não ficam no cache.
        queryClient.removeQueries({ queryKey: queryKeys.me() });
        throw new ApiError('storage', {
          message: STORAGE_ERROR_MESSAGE,
          cause,
        });
      }
      return guardian;
    },
  });
}
