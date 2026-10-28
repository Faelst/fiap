import { act, renderHook } from '@testing-library/react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { useSessionStore } from '../../../stores/session.store';
import { motion } from '../../../theme';
import { meResponse } from '../../../test/fixtures';
import { QueryWrapper } from '../../../test/queryWrapper';
import { useSelectStudentViewModel } from '../useSelectStudentViewModel';

/** Borda acende (fast) e o modal fecha 120 ms depois (01-design.md, 4.7). */
const BACK_DELAY = motion.fast + motion.selectStudentBackDelay;

describe('useSelectStudentViewModel', () => {
  const goBack = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    goBack.mockClear();
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meResponse);
    useSessionStore.setState({
      status: 'signedIn',
      selectedStudentId: 's1',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderSelect = () =>
    renderHook(() => useSelectStudentViewModel({ goBack }), {
      wrapper: QueryWrapper,
    });

  it('lista os alunos com nome completo, RM, turma e período, marcando o atual', async () => {
    const { result } = await renderSelect();

    expect(result.current.students).toEqual([
      {
        id: 's1',
        fullName: 'Rafael da Silva',
        rm: 12567,
        className: '7EF',
        period: 'Matutino',
        selected: true,
      },
      {
        id: 's2',
        fullName: 'Marina da Silva',
        rm: 12568,
        className: '3EF',
        period: 'Vespertino',
        selected: false,
      },
    ]);
  });

  it('escolher outro aluno marca o card na hora, troca no store e volta depois do atraso', async () => {
    const { result } = await renderSelect();

    await act(async () => result.current.onSelect('s2'));

    expect(result.current.students.map(s => s.selected)).toEqual([false, true]);
    expect(goBack).not.toHaveBeenCalled();
    expect(useSessionStore.getState().selectedStudentId).toBe('s1');

    await act(async () => {
      jest.advanceTimersByTime(BACK_DELAY - 1);
    });
    expect(goBack).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(useSessionStore.getState().selectedStudentId).toBe('s2');
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('escolher o aluno atual só fecha, sem mexer no store', async () => {
    const original = useSessionStore.getState().selectStudent;
    const setSpy = jest.fn(original);
    useSessionStore.setState({ selectStudent: setSpy });
    const { result, unmount } = await renderSelect();

    await act(async () => result.current.onSelect('s1'));
    await act(async () => {
      jest.advanceTimersByTime(BACK_DELAY);
    });

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(setSpy).not.toHaveBeenCalled();
    await unmount();
    useSessionStore.setState({ selectStudent: original });
  });

  it('um 2º toque durante o atraso é ignorado', async () => {
    const { result } = await renderSelect();

    await act(async () => result.current.onSelect('s2'));
    await act(async () => result.current.onSelect('s1'));
    await act(async () => {
      jest.advanceTimersByTime(BACK_DELAY);
    });

    expect(useSessionStore.getState().selectedStudentId).toBe('s2');
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('FECHAR volta sem trocar o aluno', async () => {
    const { result } = await renderSelect();

    await act(async () => result.current.onClose());

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().selectedStudentId).toBe('s1');
  });

  it('se o modal sai durante o atraso (voltar do Android), não troca nem navega', async () => {
    const { result, unmount } = await renderSelect();

    await act(async () => result.current.onSelect('s2'));
    await unmount();
    jest.advanceTimersByTime(BACK_DELAY);

    expect(goBack).not.toHaveBeenCalled();
    expect(useSessionStore.getState().selectedStudentId).toBe('s1');
  });
});
