import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { DestinationStream } from 'pino';
import { EnvironmentVariables } from '../../config/env.validation';
import { buildLoggerParams, shouldUsePrettyLogs } from './logger.config';

/**
 * Destino do log. `null` = stdout (ou pino-pretty em dev). Os e2e trocam por
 * um stream próprio com `overrideProvider` para ler o que foi logado.
 */
export const LOG_DESTINATION = Symbol('LOG_DESTINATION');

@Module({
  imports: [
    LoggerModule.forRootAsync({
      providers: [{ provide: LOG_DESTINATION, useValue: null }],
      inject: [ConfigService, LOG_DESTINATION],
      useFactory: (
        config: ConfigService<EnvironmentVariables, true>,
        destination: DestinationStream | null,
      ) =>
        buildLoggerParams(
          {
            level: config.get('LOG_LEVEL', { infer: true }),
            pretty: shouldUsePrettyLogs(
              config.get('NODE_ENV', { infer: true }),
            ),
          },
          destination ?? undefined,
        ),
    }),
  ],
})
export class AppLoggerModule {}
