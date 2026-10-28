import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Params } from 'nestjs-pino';
import type { DestinationStream, LevelWithSilent } from 'pino';
import type { Options } from 'pino-http';
import { REQUEST_ID_HEADER, resolveRequestId } from './request-id';

export interface LoggerSettings {
  level: LevelWithSilent;
  /** pino-pretty (dev) ou JSON (produção, testes). */
  pretty: boolean;
}

/**
 * Removidos do log (não só mascarados). O pino-http não loga o corpo da
 * requisição; os caminhos de `body` e os coringas são defesa extra caso alguém
 * passe a logar o corpo ou um objeto com esses campos.
 */
export const REDACTED_LOG_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.cpf',
  'res.headers["set-cookie"]',
  '*.accessToken',
  '*.password',
  '*.cpf',
];

/**
 * O req já serializado pelo pino-http, sem a query: a URL vai sem `?...` e o
 * objeto `query` sai. Token ou CPF mandado por engano na URL não chega ao log.
 */
export function serializeRequest(
  req: Record<string, unknown>,
): Record<string, unknown> {
  const { query: _query, ...rest } = req;
  void _query;
  return typeof rest.url === 'string'
    ? { ...rest, url: rest.url.split('?')[0] }
    : rest;
}

/**
 * pino-pretty só com NODE_ENV=development explícito (vem do .env.example).
 * Qualquer outro caso, inclusive sem NODE_ENV, sai em JSON: esquecer a env em
 * produção não troca o formato do log.
 */
export function shouldUsePrettyLogs(nodeEnv: string | undefined): boolean {
  return nodeEnv === 'development';
}

export function buildPinoHttpOptions({
  level,
  pretty,
}: LoggerSettings): Options<IncomingMessage, ServerResponse> {
  return {
    level,
    redact: { paths: REDACTED_LOG_PATHS, remove: true },
    serializers: { req: serializeRequest },
    genReqId: (req, res) => {
      const id = resolveRequestId(req.headers[REQUEST_ID_HEADER]);
      res.setHeader(REQUEST_ID_HEADER, id);
      return id;
    },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) {
        return 'error';
      }
      return res.statusCode >= 400 ? 'warn' : 'info';
    },
    // Logs feitos dentro da requisição levam só o reqId, não o req inteiro.
    quietReqLogger: true,
    transport: pretty
      ? {
          target: 'pino-pretty',
          options: { singleLine: true, ignore: 'pid,hostname' },
        }
      : undefined,
  };
}

/**
 * Parâmetros do nestjs-pino. Com `destination` (usado nos testes para ler o
 * log), escreve nele em JSON: transport e stream próprio não se combinam.
 */
export function buildLoggerParams(
  settings: LoggerSettings,
  destination?: DestinationStream,
): Params {
  if (destination) {
    const options = buildPinoHttpOptions({ ...settings, pretty: false });
    return { pinoHttp: [options, destination] };
  }
  return { pinoHttp: buildPinoHttpOptions(settings) };
}
