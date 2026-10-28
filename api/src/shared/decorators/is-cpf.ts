import { ValidationOptions, registerDecorator } from 'class-validator';

/** Só dígitos (11) ou a máscara completa 000.000.000-00. */
const CPF_FORMAT = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

export const CPF_INVALID_MESSAGE = 'CPF inválido.';

function checkDigit(digits: number[]): number {
  const sum = digits.reduce(
    (total, digit, index) => total + digit * (digits.length + 1 - index),
    0,
  );
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** CPF com ou sem máscara, com dígitos verificadores válidos e sem sequência repetida. */
export function isCpf(value: unknown): boolean {
  if (typeof value !== 'string' || !CPF_FORMAT.test(value)) {
    return false;
  }

  const digits = value.replace(/\D/g, '').split('').map(Number);
  if (digits.every((digit) => digit === digits[0])) {
    return false;
  }

  const first = checkDigit(digits.slice(0, 9));
  const second = checkDigit(digits.slice(0, 10));
  return digits[9] === first && digits[10] === second;
}

/**
 * Tira a máscara de um CPF no formato aceito. Qualquer outro valor volta como
 * veio, para o `@IsCpf()` recusar em vez de aceitar um texto "limpo" à força.
 */
export function normalizeCpf(value: unknown): unknown {
  if (typeof value !== 'string' || !CPF_FORMAT.test(value)) {
    return value;
  }
  return value.replace(/\D/g, '');
}

export function IsCpf(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isCpf',
      target: target.constructor,
      propertyName: propertyName as string,
      options: { message: CPF_INVALID_MESSAGE, ...options },
      validator: {
        validate: (value: unknown) => isCpf(value),
      },
    });
  };
}
