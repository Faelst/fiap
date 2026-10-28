const NOT_EVALUATED = '-';

/** `9.5` → `"9,5"`, `8` → `"8,0"`, `null` → `"-"`. */
export function formatGrade(grade: number | null): string {
  return grade === null ? NOT_EVALUATED : grade.toFixed(1).replace('.', ',');
}

/** `0` → `"0"`, `null` → `"-"`. */
export function formatAbsences(absences: number | null): string {
  return absences === null ? NOT_EVALUATED : String(absences);
}
