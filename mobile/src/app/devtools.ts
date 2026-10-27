import { logger } from '../services/logger';

/** Só em dev: liga o Reactotron como mais um destino do logger. */
export function setupDevtools() {
  if (!__DEV__) {
    return;
  }
  try {
    const { connectReactotron } = require('../services/logger/reactotron');
    logger.addTransport(connectReactotron());
  } catch (error) {
    logger.warn('Reactotron não conectou', { error });
  }
}
