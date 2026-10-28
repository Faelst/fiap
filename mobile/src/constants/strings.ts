/**
 * Textos da interface, exatamente como na tela (01-design.md, seção 5). As
 * telas, os testes e o Maestro leem daqui para não duplicar texto.
 */
export const strings = {
  login: {
    logoLabel: 'FIAP School',
    cpfLabel: 'CPF',
    cpfHint: 'Somente números',
    passwordLabel: 'SENHA',
    passwordAccessibilityLabel: 'Senha',
    submit: 'FAZER LOGIN',
    submitAccessibilityLabel: 'Fazer login',
    submittingAccessibilityLabel: 'Entrando',
    error: {
      invalid: 'Usuário ou senha inválida.\nPode tentar novamente?',
      cpf: 'Confira o CPF digitado.',
      network:
        'Não conseguimos falar com o servidor.\nConfira sua conexão e tente de novo.',
      tooMany:
        'Muitas tentativas seguidas.\nAguarde um minuto e tente de novo.',
      server: 'Algo deu errado do nosso lado.\nTente de novo em instantes.',
      sessionExpired: 'Sua sessão expirou. Entre de novo.',
    },
  },
  header: {
    logoLabel: 'FIAP School',
    /** Seguido do primeiro nome em `greetingName` (maiúsculo pela variante). */
    greeting: 'Olá, ',
    greetingAccessibilityLabel: (name: string) => `Olá, ${name}`,
    studentInfo: (className: string, rm: number, period: string) =>
      `${className} - RM ${rm} - ${period}`,
    studentAccessibilityLabel: (
      name: string,
      className: string,
      rm: number,
      period: string,
    ) => `Aluno ${name}, turma ${className}, RM ${rm}, período ${period}`,
    switchStudent: 'TROCAR PERFIL',
    switchStudentAccessibilityLabel: 'Trocar aluno',
    switchStudentHint: 'Abre a lista de alunos',
    logout: 'SAIR',
    logoutAccessibilityLabel: 'Sair da conta',
  },
  tabs: {
    agenda: 'AGENDA',
    agendaAccessibilityLabel: 'Agenda',
    boletim: 'BOLETIM',
    boletimAccessibilityLabel: 'Boletim',
  },
  agenda: {
    title: 'AGENDA',
    titleAccessibilityLabel: 'Agenda',
    dayAccessibilityPrefix: 'Dia',
    dayHint: 'Toque para escolher outro dia',
    /** `07:15 - 08:00`. */
    lessonTime: (start: string, end: string) => `${start} - ${end}`,
    lessonAccessibilityLabel: (start: string, end: string, subject: string) =>
      `Das ${start} às ${end}, ${subject}`,
    empty: 'Sem aulas neste dia',
    loadingAccessibilityLabel: 'Carregando agenda',
    error: { title: 'Não foi possível carregar a agenda.' },
  },
  boletim: {
    title: 'BOLETIM',
    titleAccessibilityLabel: 'Boletim',
    /** `7EF - 2025`. */
    yearLabel: (className: string, year: number) => `${className} - ${year}`,
    yearAccessibilityPrefix: 'Turma e ano',
    yearHint: 'Toque para ver outros anos',
    /** `1º TRIMESTRE` (ordinal `º`, U+00BA). */
    term: (term: number) => `${term}º TRIMESTRE`,
    termAccessibilityLabel: (term: number) => `${term}º trimestre`,
    grade: 'Nota:',
    absences: 'Faltas:',
    /** "Nota 9,5, 0 faltas" / "Nota 8,0, 1 falta". */
    resultAccessibilityLabel: (grade: string, absences: number) =>
      `Nota ${grade}, ${absences} ${absences === 1 ? 'falta' : 'faltas'}`,
    notReleasedAccessibilityLabel: 'Nota e faltas ainda não lançadas',
    gradeNotReleased: 'não lançada',
    absencesNotReleased: 'faltas não lançadas',
    loadingAccessibilityLabel: 'Carregando boletim',
    empty: 'Nenhum boletim disponível',
    error: {
      title: 'Não foi possível carregar o boletim.',
      notFound: 'Boletim não encontrado.',
    },
  },
  selectStudent: {
    close: 'FECHAR',
    closeAccessibilityLabel: 'Fechar',
    title: 'Escolha o perfil\nque você quer visualizar',
    studentInfo: (className: string, rm: number, period: string) =>
      `${className} - RM ${rm} - ${period}`,
    cardAccessibilityLabel: (
      fullName: string,
      className: string,
      rm: number,
      period: string,
    ) => `${fullName}, turma ${className}, RM ${rm}, ${period}`,
  },
  noStudent: {
    title: 'Nenhum aluno vinculado',
    description:
      'Não encontramos alunos ligados ao seu CPF. Fale com a secretaria da FIAP School para fazer o vínculo.',
  },
  boot: {
    error: { title: 'Não conseguimos conectar.' },
  },
  common: {
    /** Fundo do dropdown aberto: o leitor de tela também fecha a lista por ele. */
    closeListAccessibilityLabel: 'Fechar lista',
    error: { description: 'Confira sua conexão e tente de novo.' },
    retry: 'TENTAR DE NOVO',
    retryAccessibilityLabel: 'Tentar de novo',
  },
} as const;
