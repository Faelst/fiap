import { firstName, fullName, initials } from '../names';

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

describe('initials', () => {
  it('1ª letra do nome + 1ª letra da última palavra do sobrenome', () => {
    expect(initials('Rafael', 'da Silva')).toBe('RS');
    expect(initials('Bianca', 'Silveira da Costa')).toBe('BC');
    expect(initials('Gustavo', 'da Silva')).toBe('GS');
  });

  it('maiúsculas, com acento preservado', () => {
    expect(initials('élida', 'ávila')).toBe('ÉÁ');
  });

  it('ignora espaços sobrando', () => {
    expect(initials('  Joana ', ' da  Costa  ')).toBe('JC');
  });

  it('sobrenome vazio: só a 1ª letra do nome', () => {
    expect(initials('Rafael', '')).toBe('R');
    expect(initials('Rafael', '   ')).toBe('R');
  });

  it('nome vazio: só a do sobrenome; os dois vazios, vazio', () => {
    expect(initials('', 'Silva')).toBe('S');
    expect(initials('', '')).toBe('');
  });
});
