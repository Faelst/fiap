import { logger } from '..';

describe('logger no Jest', () => {
  afterEach(() => jest.restoreAllMocks());

  it('o logger do app não escreve no console (a saída do CI fica limpa)', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation();

    logger.info('http GET /me 200');
    logger.warn('http GET /me sem resposta');

    expect(consoleInfo).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('quem testa o logger continua vendo as chamadas pelo spy', () => {
    const info = jest.spyOn(logger, 'info');

    logger.info('login', { status: 200 });

    expect(info).toHaveBeenCalledWith('login', { status: 200 });
  });

  it('o transporte de console de verdade escreve no nível certo, com o contexto', () => {
    const { consoleTransport } =
      jest.requireActual<typeof import('../transports')>('../transports');
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    consoleTransport({
      level: 'warn',
      message: 'sem resposta',
      context: { url: '/me' },
      timestamp: '2026-10-28T00:00:00.000Z',
    });

    expect(consoleWarn).toHaveBeenCalledWith('[warn] sem resposta', {
      url: '/me',
    });
  });
});
