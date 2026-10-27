const WHITESPACE = /\s+/;

/** Primeira palavra do nome, sem espaços nas pontas. */
export function firstName(name: string): string {
  return name.trim().split(WHITESPACE)[0] ?? '';
}

/** Nome e sobrenome com um espaço entre eles, sem sobras. */
export function fullName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(' ');
}

/** Maiúsculas em pt-BR (acentos e cedilha incluídos). */
export function upper(value: string): string {
  return value.toLocaleUpperCase('pt-BR');
}
