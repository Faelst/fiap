import { useEffect, useRef, useState } from 'react';

import type { RootStackScreenProps } from '../../navigation/types';
import { useSessionStore } from '../../stores/session.store';
import { motion } from '../../theme';
import { fullName } from '../../utils/names';
import { useSessionStudent } from './useSessionStudent';

type SelectStudentNavigation = Pick<
  RootStackScreenProps<'SelectStudent'>['navigation'],
  'goBack'
>;

/** A borda do card acende e o modal fecha logo depois (01-design.md, 4.7). */
const BACK_DELAY = motion.fast + motion.selectStudentBackDelay;

/**
 * Seleção de aluno (R9, M6). Escolher outro aluno marca o card na hora e,
 * depois do atraso, troca o aluno no store e volta para a aba de origem, que
 * já lê as queries do aluno novo (as keys levam o id). O aluno atual e o
 * FECHAR só voltam.
 */
export function useSelectStudentViewModel(navigation: SelectStudentNavigation) {
  const { students, student } = useSessionStudent();
  const selectStudent = useSessionStore(state => state.selectStudent);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const selectedId = chosenId ?? student?.id ?? null;

  const onSelect = (id: string) => {
    if (chosenId !== null) return;
    if (id === student?.id) {
      navigation.goBack();
      return;
    }
    setChosenId(id);
    timer.current = setTimeout(() => {
      timer.current = null;
      selectStudent(id);
      navigation.goBack();
    }, BACK_DELAY);
  };

  return {
    students: students.map(item => ({
      id: item.id,
      fullName: fullName(item.firstName, item.lastName),
      rm: item.rm,
      className: item.className,
      period: item.period,
      selected: item.id === selectedId,
    })),
    onSelect,
    onClose: () => navigation.goBack(),
  };
}
