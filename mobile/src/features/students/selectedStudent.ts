import type { Student } from '../auth/schemas';

/**
 * Aluno que o app mostra: o salvo, se ele ainda estiver no `/me`; senão o
 * primeiro, na ordem do `/me`. `null` só quando o responsável não tem aluno.
 */
export function resolveSelectedStudent(
  students: readonly Student[],
  selectedId: string | null,
): Student | null {
  return (
    students.find(student => student.id === selectedId) ?? students[0] ?? null
  );
}
