import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { queryClient } from '../app/queryClient';
import type { Guardian } from '../features/auth/schemas';
import { mmkvStateStorage } from '../services/storage/mmkv';
import { secureStorage } from '../services/storage/secureStorage';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

/** `expired`: o interceptor recebeu 401; o Login mostra "Sua sessão expirou". */
export type SignOutReason = 'manual' | 'expired';

type SessionState = {
  status: SessionStatus;
  /** Vem do login; ao reabrir o app fica `null` até o `/me` responder. */
  guardian: Guardian | null;
  selectedStudentId: string | null;
  signOutReason: SignOutReason | null;
};

type SessionActions = {
  /** Lê o token do keychain. Quem valida com `/me` é a query. */
  bootstrap: () => Promise<void>;
  signIn: (token: string, guardian: Guardian) => Promise<void>;
  signOut: (reason?: SignOutReason) => Promise<void>;
  selectStudent: (studentId: string) => void;
};

export type SessionStore = SessionState & SessionActions;

export const SESSION_STORAGE_KEY = 'session';

export const useSessionStore = create<SessionStore>()(
  persist(
    set => ({
      status: 'loading',
      guardian: null,
      selectedStudentId: null,
      signOutReason: null,

      bootstrap: async () => {
        const token = await secureStorage.loadToken();
        set({ status: token ? 'signedIn' : 'signedOut' });
      },

      signIn: async (token, guardian) => {
        await secureStorage.setToken(token);
        set({ status: 'signedIn', guardian, signOutReason: null });
      },

      signOut: async (reason = 'manual') => {
        await secureStorage.clearToken();
        queryClient.clear();
        set({
          status: 'signedOut',
          guardian: null,
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
