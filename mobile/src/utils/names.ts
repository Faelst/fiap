const WHITESPACE = /\s+/;

/** Primeira palavra do nome, sem espaços nas pontas. */
export function firstName(name: string): string {
  return name.trim().split(WHITESPACE)[0] ?? '';
}

/** Nome e sobrenome com um espaço entre eles, sem sobras. */
export function fullName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(' ');
}

/**
 * Iniciais do avatar: 1ª letra do nome + 1ª letra da **última** palavra do
 * sobrenome ("Bianca" + "Silveira da Costa" → "BC"), em maiúsculas e com o
 * acento preservado. Sobrenome vazio: só a 1ª letra do nome.
 */
export function initials(first: string, last: string): string {
  const lastWord = last.trim().split(WHITESPACE).pop() ?? '';
  return (firstName(first).charAt(0) + lastWord.charAt(0)).toUpperCase();
}
