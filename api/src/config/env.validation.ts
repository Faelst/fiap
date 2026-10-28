import 'reflect-metadata';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateBy,
  validateSync,
} from 'class-validator';
import { parseTrustProxy } from './trust-proxy';

export const LOG_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * "true"/"false" (sem diferenciar maiúsculas). Outro texto segue como está
 * para o IsBoolean recusar; a conversão implícita faria "false" virar true.
 */
function toBoolean({
  obj,
  key,
}: {
  obj: Record<string, unknown>;
  key: string;
}) {
  const raw = obj[key];
  if (typeof raw !== 'string') {
    return raw;
  }
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return raw;
}

function IsTrustProxy() {
  return ValidateBy({
    name: 'isTrustProxy',
    validator: {
      validate: (value: unknown) => {
        if (typeof value !== 'string') return false;
        try {
          parseTrustProxy(value);
          return true;
        } catch {
          return false;
        }
      },
      defaultMessage: () =>
        'TRUST_PROXY deve ser false, true, número de saltos ou lista de IPs/sub-redes',
    },
  });
}

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3333;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  /**
   * Número com unidade obrigatória: s, m, h, d, w ou y ("900s", "30m", "7d").
   * Sem unidade o jsonwebtoken lê a string como milissegundos ("3600" = 3,6 s).
   * Zero (ou zero à esquerda) é recusado: todo token já sairia expirado.
   */
  @IsString()
  @Matches(/^[1-9]\d*(s|m|h|d|w|y)$/)
  JWT_EXPIRES_IN: string = '7d';

  /** "*" ou lista de origens separadas por vírgula. */
  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string = '*';

  /** Tentativas de login por IP dentro da janela LOGIN_THROTTLE_TTL_MS. */
  @IsInt()
  @Min(1)
  LOGIN_THROTTLE_LIMIT: number = 5;

  @IsInt()
  @Min(1)
  LOGIN_THROTTLE_TTL_MS: number = 60000;

  /** Nível do pino. Nos testes é "silent". */
  @IsIn(LOG_LEVELS)
  LOG_LEVEL: LogLevel = 'info';

  /** Swagger em /docs e /docs-json. */
  @Transform(toBoolean)
  @IsBoolean()
  SWAGGER_ENABLED: boolean = true;

  /**
   * `trust proxy` do express, que decide o req.ip (usado pelo rate limit):
   * false, true, número de saltos ou lista de IPs/sub-redes. Ver trust-proxy.ts.
   */
  @IsTrustProxy()
  TRUST_PROXY: string = 'false';

  @IsOptional()
  @IsString()
  NODE_ENV?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map(
        (error) =>
          `${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
      )
      .join('; ');
    throw new Error(`Configuração de ambiente inválida. ${details}`);
  }
  return env;
}

export function parseCorsOrigins(value: string): '*' | string[] {
  if (value.trim() === '*') {
    return '*';
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
