import { useState } from 'react';

import { useSessionStore } from '../../stores/session.store';

/**
 * Logout (M2, 01-design.md 3.9): sem confirmação. O `signOut` apaga o token
 * do keychain, o aluno salvo e o cache do React Query; com a sessão fechada o
 * RootStack troca para o Login. O botão fica desabilitado até lá, e um 2º
 * toque não sai de novo. Funciona offline (só estado local).
 */
export function useLogout() {
  const signOut = useSessionStore(state => state.signOut);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await signOut('manual');
  };

  return { logout, loggingOut };
}
