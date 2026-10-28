import { createLogger, type LogEntry, type LogTransport } from '../logger';
import { REDACTED } from '../redact';

function setup(minLevel: 'debug' | 'warn') {
  const entries: LogEntry[] = [];
  const transport: LogTransport = entry => entries.push(entry);
  return {
    entries,
    logger: createLogger({ minLevel, transports: [transport] }),
  };
}

describe('createLogger', () => {
  it('em dev registra todos os níveis', () => {
    const { entries, logger } = setup('debug');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(entries.map(e => e.level)).toEqual([
      'debug',
      'info',
      'warn',
      'error',
    ]);
  });

  it('em produção registra só warn e error', () => {
    const { entries, logger } = setup('warn');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(entries.map(e => e.message)).toEqual(['w', 'e']);
  });

  it('redige o contexto antes de entregar aos transportes', () => {
    const { entries, logger } = setup('debug');
    logger.info('login', {
      cpf: '96929456004',
      password: '123456',
      headers: { Authorization: 'Bearer abc' },
      status: 200,
    });
    expect(entries[0].context).toEqual({
      cpf: REDACTED,
      password: REDACTED,
      headers: { Authorization: REDACTED },
      status: 200,
    });
  });

  it('um transporte que falha não derruba o app nem os outros', () => {
    const entries: LogEntry[] = [];
    const logger = createLogger({
      minLevel: 'debug',
      transports: [
        () => {
          throw new Error('quebrou');
        },
        entry => entries.push(entry),
      ],
    });
    expect(() => logger.error('x')).not.toThrow();
    expect(entries).toHaveLength(1);
  });
});
