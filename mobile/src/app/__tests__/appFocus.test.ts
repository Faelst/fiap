import { focusManager, QueryObserver } from '@tanstack/react-query';
import type { AppStateStatus } from 'react-native';

import { connectFocusToAppState } from '../appFocus';
import { createQueryClient } from '../queryClient';

/** AppState falso: guarda o listener para o teste emitir as mudanças. */
function fakeAppState() {
  let listener: ((state: AppStateStatus) => void) | undefined;
  const remove = jest.fn();
  return {
    addEventListener: jest.fn(
      (_type: 'change', handler: (state: AppStateStatus) => void) => {
        listener = handler;
        return { remove };
      },
    ),
    emit: (state: AppStateStatus) => listener?.(state),
    remove,
  };
}

describe('connectFocusToAppState', () => {
  afterEach(() => {
    focusManager.setFocused(undefined);
  });

  it('o app em background perde o foco e volta a tê-lo ao ficar ativo', () => {
    const appState = fakeAppState();
    connectFocusToAppState(appState);

    appState.emit('background');
    expect(focusManager.isFocused()).toBe(false);

    appState.emit('active');
    expect(focusManager.isFocused()).toBe(true);
  });

  it('voltar do background refaz a query vencida que está na tela', async () => {
    const appState = fakeAppState();
    connectFocusToAppState(appState);
    const client = createQueryClient();
    client.mount(); // o QueryClientProvider faz isso no app
    const queryFn = jest.fn().mockResolvedValue('agenda');
    const observer = new QueryObserver(client, {
      queryKey: ['agenda', 's1'],
      queryFn,
      staleTime: 0,
      gcTime: Infinity, // sem timer de GC prendendo o Jest
    });
    const unsubscribe = observer.subscribe(() => undefined);
    await client.getQueryCache().find({ queryKey: ['agenda', 's1'] })?.promise;
    expect(queryFn).toHaveBeenCalledTimes(1);

    appState.emit('background');
    appState.emit('active');
    await client.getQueryCache().find({ queryKey: ['agenda', 's1'] })?.promise;

    expect(queryFn).toHaveBeenCalledTimes(2);
    unsubscribe();
    client.unmount();
    client.clear();
  });
});
