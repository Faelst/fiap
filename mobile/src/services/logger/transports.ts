import type { LogTransport } from './logger';

const CONSOLE_METHOD = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
} as const;

export const consoleTransport: LogTransport = ({ level, message, context }) => {
  const method = CONSOLE_METHOD[level];
  if (context === undefined) {
    method(`[${level}] ${message}`);
  } else {
    method(`[${level}] ${message}`, context);
  }
};
