import { Writable } from 'node:stream';
import { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { LOG_DESTINATION } from '../../src/infra/logger/logger.module';

interface TestAppOptions {
  /** Controllers só de teste, montados junto com o AppModule. */
  controllers?: Type[];
  /** Para onde o pino escreve (ver log-capture.ts). Padrão: stdout. */
  logDestination?: Writable;
}

export async function createTestApp(
  options: TestAppOptions = {},
): Promise<INestApplication<App>> {
  const builder = Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  });
  if (options.logDestination) {
    builder.overrideProvider(LOG_DESTINATION).useValue(options.logDestination);
  }
  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();
  return app;
}
