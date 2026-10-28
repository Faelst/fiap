import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { queryClient } from '../app/queryClient';
import { mmkvStateStorage } from '../services/storage/mmkv';
import { secureStorage } from '../services/storage/secureStorage';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

/** `expired`: o interceptor recebeu 401; o Login mostra "Sua sessão expirou". */
export type SignOutReason = 'manual' | 'expired';

type SessionState = {
  status: SessionStatus;
  selectedStudentId: string | null;
  signOutReason: SignOutReason | null;
};

type SessionActions = {
  /** Lê o token do keychain. Quem valida com `/me` é a query. */
  bootstrap: () => Promise<void>;
  /**
   * A splash desistiu de esperar o keychain (trava de 10 s): a sessão fica
   * `signedOut`, e o `bootstrap` que responder depois é ignorado.
   */
  bootstrapTimedOut: () => void;
  signIn: (token: string) => Promise<void>;
  signOut: (reason?: SignOutReason) => Promise<void>;
  selectStudent: (studentId: string) => void;
};

export type SessionStore = SessionState & SessionActions;

export const SESSION_STORAGE_KEY = 'session';

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      status: 'loading',
      selectedStudentId: null,
      signOutReason: null,

      bootstrap: async () => {
        const token = await secureStorage.loadToken();
        // Resposta atrasada: a sessão já foi decidida (trava da splash).
        if (get().status !== 'loading') return;
        set({ status: token ? 'signedIn' : 'signedOut' });
      },

      bootstrapTimedOut: () => {
        if (get().status === 'loading') set({ status: 'signedOut' });
      },

      signIn: async token => {
        await secureStorage.setToken(token);
        set({ status: 'signedIn', signOutReason: null });
      },

      signOut: async (reason = 'manual') => {
        await secureStorage.clearToken();
        queryClient.clear();
        set({
          status: 'signedOut',
          selectedStudentId: null,
          signOutReason: reason,
        });
      },

      selectStudent: studentId => set({ selectedStudentId: studentId }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => mmkvStateStorage),
      // Só a preferência de aluno vai para o disco. Token fica no keychain.
      partialize: state => ({ selectedStudentId: state.selectedStudentId }),
    },
  ),
);
