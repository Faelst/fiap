import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

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
   */
  @IsString()
  @Matches(/^\d+(s|m|h|d|w|y)$/)
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
