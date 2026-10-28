import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// Tentativas simultâneas do mesmo CPF: a vaga é reservada no mesmo tick da
// checagem, antes do bcrypt, então o lote não fura o limite.
process.env.TRUST_PROXY = '1';
process.env.LOGIN_THROTTLE_LIMIT = '1000';
process.env.LOGIN_THROTTLE_CPF_TTL_MS = '900000';

async function bootWithCpfLimit(limit: number) {
  process.env.LOGIN_THROTTLE_CPF_LIMIT = String(limit);
  jest.resetModules();
  const { createTestApp } = await import('./setup/create-test-app.js');
  return createTestApp();
}

let ip = 0;
const attempt = (app: INestApplication<App>, cpf: string, password: string) =>
  request(app.getHttpServer())
    .post('/api/auth/login')
    .set('X-Forwarded-For', `198.51.100.${++ip % 250}`)
    .send({ cpf, password });

const count = (statuses: number[], status: number) =>
  statuses.filter((s) => s === status).length;

describe('Limite por CPF com tentativas simultâneas (e2e)', () => {
  describe('limite 3', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
      app = await bootWithCpfLimit(3);
    });

    afterAll(async () => {
      await app.close();
    });

    it('6 senhas erradas em paralelo, de IPs diferentes: só 3 chegam à senha', async () => {
      const statuses = (
        await Promise.all(
          Array.from({ length: 6 }, () =>
            attempt(app, '969.294.560-04', 'errada'),
          ),
        )
      ).map((response) => response.status);

      expect(count(statuses, 401)).toBe(3);
      expect(count(statuses, 429)).toBe(3);
    });
  });

  describe('limite 10', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
      app = await bootWithCpfLimit(10);
    });

    afterAll(async () => {
      await app.close();
    });

    // Só senhas erradas: nenhuma resposta zera o contador, então exatamente
    // 10 reservam vaga e 10 recebem 429, seja qual for a ordem de chegada ou o
    // tempo do bcrypt. A senha certa no lote deixava o resultado depender de
    // tempo (o reset dela abre uma janela nova para as que chegam depois).
    // Que a certa além do limite dá 429 está provado de forma determinística
    // no spec do interceptor.
    it('20 senhas erradas em paralelo: exatamente 10 chegam à senha', async () => {
      const responses = await Promise.all(
        Array.from({ length: 20 }, () => attempt(app, '96929456004', 'errada')),
      );
      const statuses = responses.map((response) => response.status);

      expect(count(statuses, 401)).toBe(10);
      expect(count(statuses, 429)).toBe(10);
    });
  });
});
