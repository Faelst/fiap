import { useEffect } from 'react';

import { useSessionStore } from '../../stores/session.store';
import { firstName } from '../../utils/names';
import { useMeQuery } from '../auth/api/useMeQuery';
import type { Student } from '../auth/schemas';
import { resolveSelectedStudent } from './selectedStudent';

const NO_STUDENTS: readonly Student[] = [];

/**
 * Responsável e aluno em uso, a partir do `/me` (já em cache depois da splash
 * ou do login) e do `selectedStudentId` do store. Quando o aluno salvo falta
 * ou não é mais deste responsável, mostra o primeiro e grava a troca, para
 * as queries por aluno usarem o mesmo id.
 */
export function useSessionStudent() {
  const { data: me } = useMeQuery();
  const selectedId = useSessionStore(state => state.selectedStudentId);
  const selectStudent = useSessionStore(state => state.selectStudent);

  const students = me?.students ?? NO_STUDENTS;
  const student = resolveSelectedStudent(students, selectedId);
  const studentId = student?.id ?? null;

  useEffect(() => {
    if (studentId !== null && studentId !== selectedId) {
      selectStudent(studentId);
    }
  }, [studentId, selectedId, selectStudent]);

  return {
    guardianFirstName: me ? firstName(me.firstName) : '',
    students,
    student,
  };
}
