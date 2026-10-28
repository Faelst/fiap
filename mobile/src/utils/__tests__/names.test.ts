import { firstName, fullName } from '../names';

describe('firstName', () => {
  it('pega a primeira palavra, sem espaços sobrando', () => {
    expect(firstName('Gustavo da Silva')).toBe('Gustavo');
    expect(firstName('  Rafael  ')).toBe('Rafael');
    expect(firstName('Ana')).toBe('Ana');
  });

  it('devolve vazio para nome vazio', () => {
    expect(firstName('')).toBe('');
    expect(firstName('   ')).toBe('');
  });
});

describe('fullName', () => {
  it('junta nome e sobrenome com um espaço', () => {
    expect(fullName('Rafael', 'da Silva')).toBe('Rafael da Silva');
  });

  it('não deixa espaço quando falta uma parte', () => {
    expect(fullName('Rafael', '')).toBe('Rafael');
    expect(fullName('', 'Silva')).toBe('Silva');
  });
});
