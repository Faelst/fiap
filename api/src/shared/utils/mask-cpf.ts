const CPF_DIGITS = /^\d{11}$/;

/**
 * Mascara um CPF de 11 dígitos deixando só os 6 do meio visíveis:
 * `96929456004` → `***.294.560-**`. Qualquer outro valor vira a máscara toda,
 * para nunca vazar um CPF malformado.
 */
export function maskCpf(cpf: string): string {
  if (!CPF_DIGITS.test(cpf)) {
    return '***.***.***-**';
  }
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}
