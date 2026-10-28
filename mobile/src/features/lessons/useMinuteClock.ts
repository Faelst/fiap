import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  clockPhase,
  minutesOfDay,
  samePhase,
  type ClockPhase,
  type MinuteSpan,
} from './timetable';
import { motion } from '../../theme';

const MS_PER_MINUTE = 60_000;

/** Milissegundos até a próxima virada de minuto. */
function msToNextMinute(date: Date): number {
  return MS_PER_MINUTE - (date.getSeconds() * 1000 + date.getMilliseconds());
}

/**
 * Chama `onTick` em cada virada de minuto (um `setTimeout` até a próxima e
 * depois um `setInterval` de `motion.nowTick`) e na volta do background.
 */
export function useMinuteTicker(
  now: () => Date,
  onTick: () => void,
  enabled = true,
) {
  const tick = useRef(onTick);
  tick.current = onTick;

  useEffect(() => {
    if (!enabled) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      tick.current();
      interval = setInterval(() => tick.current(), motion.nowTick);
    }, msToNextMinute(now()));
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') tick.current();
    });
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      subscription.remove();
    };
  }, [enabled, now]);
}

export type MinuteClock = {
  /** Minutos do dia, animados a cada virada (UI thread). */
  minutes: SharedValue<number>;
  phase: ClockPhase;
};

/**
 * Relógio da linha de agora (01-design.md da v2, 2.10): escreve os minutos
 * num shared value e só faz `setState` quando a fase do dia muda (antes,
 * aula, intervalo, depois). Assim a lista não re-renderiza a cada minuto.
 * `now` é injetável (testes e roteiros de demonstração).
 */
export function useMinuteClock({
  lessons,
  now,
  enabled = true,
}: {
  lessons: readonly MinuteSpan[];
  now: () => Date;
  enabled?: boolean;
}): MinuteClock {
  const reducedMotion = useReducedMotion();
  const minutes = useSharedValue(minutesOfDay(now()));
  const [phase, setPhase] = useState(() =>
    clockPhase(lessons, minutesOfDay(now())),
  );

  // Aulas novas (outro aluno, refetch): a fase é recalculada na hora.
  const [phaseFor, setPhaseFor] = useState(lessons);
  if (phaseFor !== lessons) {
    setPhaseFor(lessons);
    const next = clockPhase(lessons, minutesOfDay(now()));
    if (!samePhase(next, phase)) setPhase(next);
  }

  useMinuteTicker(
    now,
    () => {
      const current = minutesOfDay(now());
      minutes.set(
        reducedMotion
          ? current
          : withTiming(current, {
              duration: motion.slow,
              easing: motion.standard,
            }),
      );
      const next = clockPhase(lessons, current);
      setPhase(previous => (samePhase(previous, next) ? previous : next));
    },
    enabled,
  );

  return { minutes, phase };
}
