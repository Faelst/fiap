import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * Armazenamento rápido e não criptografado, para preferência de tela
 * (aluno selecionado). Token e dado pessoal não entram aqui.
 */
export const mmkv = createMMKV({ id: 'fiap-school' });

/** Adaptador do mmkv para o `persist` do zustand. */
export const mmkvStateStorage: StateStorage = {
  getItem: name => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: name => {
    mmkv.remove(name);
  },
};
