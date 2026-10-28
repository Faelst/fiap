import { create } from 'zustand';

type BootState = {
  /** A splash já entregou o app a outra tela; sai do stack e não volta. */
  splashDone: boolean;
  finishSplash: () => void;
};

/** Estado da abertura do app. Não é persistido: cada abertura passa pela splash. */
export const useBootStore = create<BootState>()(set => ({
  splashDone: false,
  finishSplash: () => set({ splashDone: true }),
}));
