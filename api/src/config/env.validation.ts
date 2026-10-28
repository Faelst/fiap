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
  MinLength,
  ValidateBy,
  validateSync,
} from 'class-validator';
import { isRefusedInProduction } from './public-secrets';
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

  /** HS256: 32+ caracteres, para não cair por força bruta a partir de um token. */
  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  /**
   * Número com unidade obrigatória: s, m, h, d, w ou y ("900s", "30m", "7d").
   * Sem unidade o jsonwebtoken lê a string como milissegundos ("3600" = 3,6 s).
   * Zero (ou zero à esquerda) é recusado: todo token já sairia expirado.
   */
  @IsString()
  @Matches(/^[1-9]\d*(s|m|h|d|w|y)$/)
  JWT_EXPIRES_IN: string = '7d';

  /**
   * "*" ou lista de origens separadas por vírgula. Sem a env: "*" fora de
   * produção; com NODE_ENV=production ela é obrigatória (ver applyDefaults).
   */
  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS!: string;

  /** Tentativas de login por IP dentro da janela LOGIN_THROTTLE_TTL_MS. */
  @IsInt()
  @Min(1)
  LOGIN_THROTTLE_LIMIT: number = 5;

  @IsInt()
  @Min(1)
  LOGIN_THROTTLE_TTL_MS: number = 60000;

  /**
   * Tentativas de login por CPF (qualquer IP) dentro da janela
   * LOGIN_THROTTLE_CPF_TTL_MS: segura força bruta com rodízio de IPs.
   */
  @IsInt()
  @Min(1)
  LOGIN_THROTTLE_CPF_LIMIT: number = 10;

  @IsInt()
  @Min(1)
  LOGIN_THROTTLE_CPF_TTL_MS: number = 900000;

  /** Nível do pino. Nos testes é "silent". */
  @IsIn(LOG_LEVELS)
  LOG_LEVEL: LogLevel = 'info';

  /**
   * Swagger em /docs e /docs-json. Sem a env: ligado fora de produção e
   * desligado com NODE_ENV=production (ver applyDefaults).
   */
  @Transform(toBoolean)
  @IsBoolean()
  SWAGGER_ENABLED!: boolean;

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

/** Padrões que dependem do NODE_ENV (só para as envs ausentes). */
function applyDefaults(env: EnvironmentVariables): void {
  const production = env.NODE_ENV === 'production';
  if (env.CORS_ORIGINS === undefined && !production) {
    env.CORS_ORIGINS = '*';
  }
  if (env.SWAGGER_ENABLED === undefined) {
    env.SWAGGER_ENABLED = !production;
  }
}

/** Regras que só valem com NODE_ENV=production. */
function productionProblems(env: EnvironmentVariables): string[] {
  if (env.NODE_ENV !== 'production') {
    return [];
  }
  const problems: string[] = [];
  if (
    typeof env.JWT_SECRET === 'string' &&
    isRefusedInProduction(env.JWT_SECRET)
  ) {
    problems.push(
      'JWT_SECRET: com NODE_ENV=production não use o valor do .env.example (gere um com `openssl rand -base64 48`)',
    );
  }
  return problems;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  applyDefaults(env);
  const problems = [
    ...validateSync(env, { skipMissingProperties: false }).map(
      (error) =>
        `${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
    ),
    ...productionProblems(env),
  ];

  if (problems.length > 0) {
    throw new Error(
      `Configuração de ambiente inválida. ${problems.join('; ')}`,
    );
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
