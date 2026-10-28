import { IncomingMessage, ServerResponse } from 'node:http';
import { Writable } from 'node:stream';
import pino from 'pino';
import type { Options } from 'pino-http';
import {
  buildLoggerParams,
  buildPinoHttpOptions,
  serializeRequest,
  shouldUsePrettyLogs,
} from './logger.config';

const JSON_SETTINGS = { level: 'info', pretty: false } as const;

/** Stream que guarda cada linha de log já como objeto. */
function captureStream() {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, done) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        lines.push(JSON.parse(line) as Record<string, unknown>);
      }
      done();
    },
  });
  return { lines, stream };
}

function fakeExchange(headers: Record<string, string | string[]> = {}) {
  const setHeader = jest.fn();
  const req = { headers } as unknown as IncomingMessage;
  const res = { setHeader } as unknown as ServerResponse;
  return { req, res, setHeader };
}

describe('shouldUsePrettyLogs', () => {
  it('usa pino-pretty só com NODE_ENV=development', () => {
    expect(shouldUsePrettyLogs('development')).toBe(true);
  });

  it.each([undefined, '', 'production', 'test', 'staging', 'Development'])(
    'usa JSON com NODE_ENV=%p',
    (nodeEnv) => {
      expect(shouldUsePrettyLogs(nodeEnv)).toBe(false);
    },
  );
});

describe('buildPinoHttpOptions', () => {
  it('remove do log authorization, cookie, senha, CPF e token', () => {
    const { lines, stream } = captureStream();
    const logger = pino(buildPinoHttpOptions(JSON_SETTINGS), stream);

    logger.info(
      {
        req: {
          method: 'POST',
          url: '/api/auth/login',
          headers: {
            authorization: 'Bearer eyJ.segredo',
            cookie: 'sessao=abc',
            'user-agent': 'jest',
          },
          body: { cpf: '96929456004', password: '123456' },
        },
        res: { statusCode: 200, headers: { 'set-cookie': 'sessao=abc' } },
        result: { accessToken: 'eyJ.token' },
      },
      'request completed',
    );

    const [line] = lines;
    const output = JSON.stringify(line);
    for (const secret of ['eyJ', 'sessao=abc', '96929456004', '123456']) {
      expect(output).not.toContain(secret);
    }
    // O resto do request continua no log.
    expect(line).toMatchObject({
      msg: 'request completed',
      req: { method: 'POST', headers: { 'user-agent': 'jest' } },
      res: { statusCode: 200 },
    });
  });

  it('usa o nível configurado', () => {
    expect(buildPinoHttpOptions({ level: 'silent', pretty: false }).level).toBe(
      'silent',
    );
  });

  it('gera o request-id e devolve no header x-request-id', () => {
    const { genReqId } = buildPinoHttpOptions(JSON_SETTINGS);
    const { req, res, setHeader } = fakeExchange();

    const id = genReqId!(req, res);

    expect(typeof id).toBe('string');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', id);
  });

  it('reaproveita o x-request-id válido do cliente', () => {
    const { genReqId } = buildPinoHttpOptions(JSON_SETTINGS);
    const { req, res, setHeader } = fakeExchange({ 'x-request-id': 'app-42' });

    expect(genReqId!(req, res)).toBe('app-42');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'app-42');
  });

  it('troca o x-request-id inválido do cliente', () => {
    const { genReqId } = buildPinoHttpOptions(JSON_SETTINGS);
    const { req, res } = fakeExchange({ 'x-request-id': 'a\nb' });

    expect(genReqId!(req, res)).not.toBe('a\nb');
  });

  it.each([
    [500, undefined, 'error'],
    [200, new Error('falhou'), 'error'],
    [404, undefined, 'warn'],
    [401, undefined, 'warn'],
    [200, undefined, 'info'],
    [304, undefined, 'info'],
  ])('status %d (erro: %p) vira nível %s', (statusCode, error, level) => {
    const { customLogLevel } = buildPinoHttpOptions(JSON_SETTINGS);
    const { req } = fakeExchange();
    const res = { statusCode } as ServerResponse;

    expect(customLogLevel!(req, res, error)).toBe(level);
  });

  it('em dev formata com pino-pretty', () => {
    expect(
      buildPinoHttpOptions({ level: 'info', pretty: true }).transport,
    ).toMatchObject({ target: 'pino-pretty' });
  });

  it('em produção sai JSON (sem transport)', () => {
    expect(buildPinoHttpOptions(JSON_SETTINGS).transport).toBeUndefined();
  });
});

describe('serializeRequest', () => {
  it('tira a query da url e não grava o objeto query', () => {
    expect(
      serializeRequest({
        id: '1',
        method: 'GET',
        url: '/api/me?access_token=eyJ.x&cpf=96929456004',
        query: { access_token: 'eyJ.x', cpf: '96929456004' },
        headers: { 'user-agent': 'jest' },
      }),
    ).toEqual({
      id: '1',
      method: 'GET',
      url: '/api/me',
      headers: { 'user-agent': 'jest' },
    });
  });

  it('mantém a url sem query como está', () => {
    expect(serializeRequest({ url: '/api/health' })).toEqual({
      url: '/api/health',
    });
  });

  it('é o serializer de req do pino-http', () => {
    expect(buildPinoHttpOptions(JSON_SETTINGS).serializers?.req).toBe(
      serializeRequest,
    );
  });
});

describe('buildLoggerParams', () => {
  it('sem destino, passa só as opções do pino-http', () => {
    const params = buildLoggerParams(JSON_SETTINGS);

    expect(Array.isArray(params.pinoHttp)).toBe(false);
    expect((params.pinoHttp as Options).level).toBe('info');
  });

  it('com destino (testes), escreve nele em JSON mesmo pedindo pretty', () => {
    const { stream } = captureStream();
    const params = buildLoggerParams({ level: 'info', pretty: true }, stream);

    expect(Array.isArray(params.pinoHttp)).toBe(true);
    const [options, destination] = params.pinoHttp as [Options, Writable];
    expect(destination).toBe(stream);
    expect(options.transport).toBeUndefined();
  });
});
