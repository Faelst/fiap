import { createLogger } from './logger';
import { consoleTransport } from './transports';

/** Logger do app: tudo em dev; em produção só warn e error. */
export const logger = createLogger({
  minLevel: __DEV__ ? 'debug' : 'warn',
  transports: [consoleTransport],
});

export type { LogContext, LogEntry, LogLevel, Logger } from './logger';
