import { http } from '../../../services/http/client';
import { parseResponse } from '../../../services/http/parseResponse';
import { onlyDigits } from '../../../utils/cpf';
import {
  loginResponseSchema,
  meSchema,
  type LoginResponse,
  type Me,
} from '../schemas';

export type LoginInput = { cpf: string; password: string };

export async function login({
  cpf,
  password,
}: LoginInput): Promise<LoginResponse> {
  const { data } = await http.post('/auth/login', {
    cpf: onlyDigits(cpf),
    password,
  });
  return parseResponse(loginResponseSchema, data, 'POST /auth/login');
}

export async function getMe(signal?: AbortSignal): Promise<Me> {
  const { data } = await http.get('/me', { signal });
  return parseResponse(meSchema, data, 'GET /me');
}
