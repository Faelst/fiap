const CPF_LENGTH = 11;
const NON_DIGIT = /\D/g;
const REPEATED_DIGIT = /^(\d)\1{10}$/;

/** Tira tudo o que não é dígito. */
export function onlyDigits(value: string): string {
  return value.replace(NON_DIGIT, '');
}

/**
 * Máscara progressiva `XXX.XXX.XXX-XX`: aplica o que já foi digitado e corta
 * em 11 dígitos.
 */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, CPF_LENGTH);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11),
  ];

  let masked = parts[0];
  if (parts[1]) masked += `.${parts[1]}`;
  if (parts[2]) masked += `.${parts[2]}`;
  if (parts[3]) masked += `-${parts[3]}`;
  return masked;
}

function checkDigit(digits: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i += 1) {
    sum += Number(digits[i]) * (length + 1 - i);
  }
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** CPF com 11 dígitos e dígitos verificadores corretos (aceita máscara). */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== CPF_LENGTH || REPEATED_DIGIT.test(digits)) {
    return false;
  }
  return (
    checkDigit(digits, 9) === Number(digits[9]) &&
    checkDigit(digits, 10) === Number(digits[10])
  );
}
