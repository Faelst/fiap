import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import { Logger } from 'nestjs-pino';
import { setupSwagger } from './app.swagger';
import {
  EnvironmentVariables,
  parseCorsOrigins,
} from './config/env.validation';
import { parseTrustProxy } from './config/trust-proxy';

export const API_PREFIX = 'api';

/** Configuração HTTP comum ao main.ts e aos testes e2e. */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.useLogger(app.get(Logger));
  // Atrás de proxy, define de onde vem o req.ip (que o rate limit usa).
  const http = app.getHttpAdapter().getInstance() as Express;
  http.set(
    'trust proxy',
    parseTrustProxy(config.get('TRUST_PROXY', { infer: true })),
  );

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: parseCorsOrigins(config.get('CORS_ORIGINS', { infer: true })),
    exposedHeaders: ['x-request-id'],
  });
  if (config.get('SWAGGER_ENABLED', { infer: true })) {
    setupSwagger(app);
  }
  app.enableShutdownHooks();
}
