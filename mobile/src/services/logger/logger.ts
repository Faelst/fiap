import { redact } from './redact';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

export type LogEntry = {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
};

/** Destino de um log já redigido (console, Reactotron...). */
export type LogTransport = (entry: LogEntry) => void;

export type Logger = Record<
  LogLevel,
  (message: string, context?: LogContext) => void
> & {
  addTransport: (transport: LogTransport) => void;
};

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

type LoggerOptions = {
  minLevel: LogLevel;
  transports: LogTransport[];
};

export function createLogger({ minLevel, transports }: LoggerOptions): Logger {
  const targets = [...transports];

  const write = (level: LogLevel, message: string, context?: LogContext) => {
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel]) {
      return;
    }
    const entry: LogEntry = {
      level,
      message,
      context: context === undefined ? undefined : redact(context),
      timestamp: new Date().toISOString(),
    };
    for (const transport of targets) {
      try {
        transport(entry);
      } catch {
        // Log nunca derruba o app.
      }
    }
  };

  return {
    debug: (message, context) => write('debug', message, context),
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context),
    addTransport: transport => {
      targets.push(transport);
    },
  };
}
