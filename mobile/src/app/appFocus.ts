import { focusManager } from '@tanstack/react-query';
import type { AppStateStatus } from 'react-native';

type AppStateLike = {
  addEventListener: (
    type: 'change',
    listener: (state: AppStateStatus) => void,
  ) => { remove: () => void };
};

/**
 * No RN o React Query não sabe quando o app volta ao primeiro plano. Ligado ao
 * `AppState`, voltar do background refaz as queries vencidas que estão na
 * tela (agenda, boletim, `/me`).
 */
export function connectFocusToAppState(appState: AppStateLike): void {
  focusManager.setEventListener(handleFocus => {
    const subscription = appState.addEventListener('change', state =>
      handleFocus(state === 'active'),
    );
    return () => subscription.remove();
  });
}
