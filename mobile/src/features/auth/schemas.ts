import { z } from 'zod';

import { isValidCpf } from '../../utils/cpf';

/* Respostas da API (contrato do plano). Os tipos saem daqui por z.infer. */

export const guardianSchema = z.object({
  id: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  guardian: guardianSchema,
});

export const studentSchema = z.object({
  id: z.string().min(1),
  rm: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  className: z.string(),
  period: z.string(),
});

export const meSchema = guardianSchema.extend({
  /** Já vem mascarado da API (`***.294.560-**`). */
  cpf: z.string(),
  students: z.array(studentSchema),
});

export type Guardian = z.infer<typeof guardianSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type Student = z.infer<typeof studentSchema>;
export type Me = z.infer<typeof meSchema>;

/* Formulário de login (react-hook-form + zodResolver na Tarefa 9). */

export const CPF_INVALID_MESSAGE = 'Confira o CPF digitado.';

export const loginFormSchema = z.object({
  cpf: z.string().refine(isValidCpf, { message: CPF_INVALID_MESSAGE }),
  password: z.string().min(1),
});

export type LoginForm = z.infer<typeof loginFormSchema>;
