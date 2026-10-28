import { renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { API_URL, meResponse, meWithoutStudents } from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { resolveSelectedStudent } from '../selectedStudent';
import { useSessionStudent } from '../useSessionStudent';

const [rafael, marina] = meResponse.students;

describe('resolveSelectedStudent', () => {
  it('devolve o aluno salvo quando ele está na lista', () => {
    expect(resolveSelectedStudent(meResponse.students, 's2')).toBe(marina);
  });

  it('sem aluno salvo, usa o primeiro da ordem do /me', () => {
    expect(resolveSelectedStudent(meResponse.students, null)).toBe(rafael);
  });

  it('aluno salvo que não está mais no /me cai no primeiro', () => {
    expect(resolveSelectedStudent(meResponse.students, 'sumiu')).toBe(rafael);
  });

  it('sem alunos, não há aluno', () => {
    expect(resolveSelectedStudent([], 's1')).toBeNull();
  });
});

describe('useSessionStudent', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    await createSecureStorage().setToken('jwt-salvo');
    useSessionStore.setState({ status: 'signedIn' });
    queryClient.clear();
  });

  const renderSessionStudent = () =>
    renderHook(() => useSessionStudent(), { wrapper: QueryWrapper });

  it('usa o /me do cache: responsável, alunos e o aluno salvo', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);
    useSessionStore.setState({ selectedStudentId: 's2' });

    const { result } = await renderSessionStudent();

    expect(result.current.guardianFirstName).toBe('Gustavo');
    expect(result.current.students).toEqual(meResponse.students);
    expect(result.current.student).toEqual(marina);
  });

  it('sem aluno salvo, mostra o primeiro e grava a escolha no store', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);

    const { result } = await renderSessionStudent();

    expect(result.current.student).toEqual(rafael);
    await waitFor(() =>
      expect(useSessionStore.getState().selectedStudentId).toBe('s1'),
    );
  });

  it('aluno salvo inválido é trocado pelo primeiro no store', async () => {
    queryClient.setQueryData(queryKeys.me(), meResponse);
    useSessionStore.setState({ selectedStudentId: 'de-outro-responsavel' });

    const { result } = await renderSessionStudent();

    expect(result.current.student).toEqual(rafael);
    await waitFor(() =>
      expect(useSessionStore.getState().selectedStudentId).toBe('s1'),
    );
  });

  it('sem cache, busca o /me', async () => {
    const { result } = await renderSessionStudent();

    await waitFor(() => expect(result.current.student).toEqual(rafael));
    expect(result.current.guardianFirstName).toBe('Gustavo');
  });

  it('responsável sem aluno: student nulo e nada gravado', async () => {
    server.use(
      http.get(`${API_URL}/me`, () => HttpResponse.json(meWithoutStudents)),
    );
    const { result } = await renderSessionStudent();

    await waitFor(() =>
      expect(result.current.guardianFirstName).toBe('Carlos'),
    );
    expect(result.current.student).toBeNull();
    expect(result.current.students).toEqual([]);
    expect(useSessionStore.getState().selectedStudentId).toBeNull();
  });

  it('primeiro nome do responsável sem sobrenome nem espaços', async () => {
    queryClient.setQueryData(queryKeys.me(), {
      ...meResponse,
      firstName: '  Gustavo Henrique ',
    });

    const { result } = await renderSessionStudent();

    expect(result.current.guardianFirstName).toBe('Gustavo');
  });
});
