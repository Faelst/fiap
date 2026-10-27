import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

/** Contas do seed. */
export const ACCOUNTS = {
  gustavo: { cpf: '969.294.560-04', password: '123456' },
  adelaide: { cpf: '508.795.670-07', password: '987654' },
  carlos: { cpf: '314.159.265-90', password: '111111' },
} as const;

export async function loginAs(
  app: INestApplication<App>,
  account: keyof typeof ACCOUNTS,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send(ACCOUNTS[account])
    .expect(200);
  return (response.body as { accessToken: string }).accessToken;
}
