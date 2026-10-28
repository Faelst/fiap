import { cpfThrottleTracker } from './login-throttle';

describe('cpfThrottleTracker', () => {
  it.each([
    ['com máscara', '969.294.560-04'],
    ['só dígitos', '96929456004'],
  ])('CPF válido %s vira a chave pelos dígitos', (_, cpf) => {
    expect(cpfThrottleTracker({ cpf })).toBe('cpf:96929456004');
  });

  it.each([
    ['sem corpo', undefined],
    ['corpo sem cpf', {}],
    ['cpf não texto', { cpf: 96929456004 }],
    ['cpf objeto', { cpf: { $ne: 1 } }],
    ['cpf curto', { cpf: '123' }],
    ['dígito verificador errado', { cpf: '96929456005' }],
    ['formato torto', { cpf: '969 294 560 04' }],
  ])('%s: sem chave (fica só o limite por IP)', (_, body) => {
    expect(cpfThrottleTracker(body)).toBeNull();
  });
});
