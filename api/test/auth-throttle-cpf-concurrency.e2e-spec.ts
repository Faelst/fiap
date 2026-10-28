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

    // Critério: as 20 chegam ao servidor bem antes de o primeiro bcrypt
    // (~70 ms) terminar, então exatamente 10 reservam vaga e 10 recebem 429,
    // seja qual for a ordem de chegada. A senha certa só pode dar 200 se ela
    // estiver entre as 10 primeiras a chegar; nesse caso ela ocupa uma das 10
    // vagas. Que a certa além do limite dá 429 está provado de forma
    // determinística no spec do interceptor.
    it('20 em paralelo com a senha certa no fim: no máximo 10 passam do limite', async () => {
      const passwords = [...Array<string>(19).fill('errada'), '123456'];
      const responses = await Promise.all(
        passwords.map((password) => attempt(app, '96929456004', password)),
      );
      const statuses = responses.map((response) => response.status);

      expect(count(statuses, 429)).toBe(10);
      expect(count(statuses, 401) + count(statuses, 200)).toBe(10);
      expect(count(statuses, 200)).toBeLessThanOrEqual(1);
    });
  });
});
