import { REQUEST_ID_HEADER, resolveRequestId } from './request-id';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('resolveRequestId', () => {
  it('usa o header x-request-id', () => {
    expect(REQUEST_ID_HEADER).toBe('x-request-id');
  });

  it.each([
    'abc-123',
    'A1_b2.c3',
    '0f8fad5b-d9cb-469f-a165-70867728950e',
    'x'.repeat(64),
  ])('reaproveita o id que o cliente mandou: "%s"', (incoming) => {
    expect(resolveRequestId(incoming)).toBe(incoming);
  });

  it('gera um UUID quando o cliente não manda id', () => {
    expect(resolveRequestId(undefined)).toMatch(UUID_V4);
  });

  it('gera um id diferente a cada requisição', () => {
    expect(resolveRequestId(undefined)).not.toBe(resolveRequestId(undefined));
  });

  it.each([
    ['vazio', ''],
    ['longo demais', 'x'.repeat(65)],
    ['com espaço', 'abc 123'],
    ['com quebra de linha (injeção no log)', 'abc\n{"level":60}'],
    ['com aspas', 'abc"def'],
    ['com acento', 'requisição'],
    ['com barra', '../etc'],
  ])('troca por um UUID o id %s', (_, incoming) => {
    const id = resolveRequestId(incoming);
    expect(id).not.toBe(incoming);
    expect(id).toMatch(UUID_V4);
  });

  it('troca por um UUID quando o header vem repetido (array)', () => {
    expect(resolveRequestId(['a', 'b'])).toMatch(UUID_V4);
  });
});
