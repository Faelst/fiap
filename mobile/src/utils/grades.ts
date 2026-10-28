const NOT_EVALUATED = '-';

/** `9.5` → `"9,5"`, `8` → `"8,0"`, `null` → `"-"`. */
export function formatGrade(grade: number | null): string {
  return grade === null ? NOT_EVALUATED : grade.toFixed(1).replace('.', ',');
}

/** `0` → `"0"`, `null` → `"-"`. */
export function formatAbsences(absences: number | null): string {
  return absences === null ? NOT_EVALUATED : String(absences);
}

/** Faixa da nota (01-design.md da v2, 1.2, DV6): o corte do 7 fica só aqui. */
export type GradeBand = 'good' | 'warning' | 'low' | 'none';

/** Nota mínima da faixa "Bom" (a marca na barra). */
export const GRADE_TARGET = 7;
const GRADE_WARNING = 5;

/**
 * `>= 7` "Bom", `5 <= nota < 7` "Atenção", `< 5` "Baixo", `null` "Sem nota".
 * Compara o número da API, não o texto formatado (`6.95` é "Atenção").
 */
export function gradeBand(grade: number | null): GradeBand {
  if (grade === null) return 'none';
  if (grade >= GRADE_TARGET) return 'good';
  return grade >= GRADE_WARNING ? 'warning' : 'low';
}

/**
 * Média simples das notas lançadas, com uma casa (a mesma do `formatGrade`,
 * para a faixa da média bater com o número na tela). Sem nota: `null`.
 */
export function averageGrade(
  grades: readonly (number | null)[],
): number | null {
  const released = grades.filter((grade): grade is number => grade !== null);
  if (released.length === 0) return null;
  const sum = released.reduce((total, grade) => total + grade, 0);
  return Math.round((sum / released.length) * 10) / 10;
}
