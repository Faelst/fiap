/**
 * Textos da interface, exatamente como na tela (01-design.md, seção 5). As
 * telas, os testes e o Maestro leem daqui para não duplicar texto.
 */
export const strings = {
  login: {
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
      storage:
        'Não foi possível salvar o acesso neste aparelho. Tente de novo.',
    },
  },
  header: {
    /** `Olá, Gustavo` (caixa normal, DV2). */
    greeting: (name: string) => `Olá, ${name}`,
    studentAccessibilityLabel: (
      name: string,
      className: string,
      rm: number,
      period: string,
    ) => `Aluno ${name}, turma ${className}, RM ${rm}, período ${period}`,
    /** Chip do aluno: `Rafael · 7EF` (nome e turma em `Text` separados). */
    studentChipSeparator: ' · ',
    studentHint: 'Abre o perfil',
  },
  tabs: {
    agenda: 'Agenda',
    agendaAccessibilityLabel: 'Agenda',
    boletim: 'Boletim',
    boletimAccessibilityLabel: 'Boletim',
    perfil: 'Perfil',
    perfilAccessibilityLabel: 'Perfil',
  },
  agenda: {
    title: 'Agenda',
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
    title: 'Boletim',
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
  profile: {
    title: 'Perfil',
    guardianRole: 'Responsável',
    cpfLabel: 'CPF',
    /** O leitor lê o card do responsável num elemento só (6.4). */
    guardianAccessibilityLabel: (fullName: string, cpf: string) =>
      `${fullName}, responsável. CPF ${cpf}`,
    /** Maiúsculas pela variante `overline`. */
    studentsHeader: 'Alunos',
    studentsHint: 'Toque em um aluno para ver as aulas e o boletim dele.',
    /** `7EF · RM 12567 · Matutino`. */
    studentInfo: (className: string, rm: number, period: string) =>
      `${className} · RM ${rm} · ${period}`,
    current: 'Atual',
    studentAccessibilityLabel: (
      fullName: string,
      className: string,
      rm: number,
      period: string,
    ) => `${fullName}, turma ${className}, RM ${rm}, ${period}`,
    studentHint: 'Mostra as aulas e o boletim deste aluno',
    switchedAnnouncement: (fullName: string) => `Agora mostrando ${fullName}.`,
    accountHeader: 'Conta',
    logout: 'Sair da conta',
    logoutConfirmQuestion: 'Sair deste aparelho?',
    logoutCancel: 'Cancelar',
    logoutConfirm: 'Sair',
    /**
     * Tela estreita: a pergunta some, e o leitor ouve o contexto no próprio
     * botão (`Sair deste aparelho? Cancelar`).
     */
    logoutInContext: (action: string) => `Sair deste aparelho? ${action}`,
    loggingOutAccessibilityLabel: 'Saindo…',
  },
  noStudent: {
    screenTitle: 'Sua conta',
    title: 'Nenhum aluno vinculado',
    description:
      'Não encontramos alunos ligados ao seu CPF. Fale com a secretaria da FIAP School para fazer o vínculo.',
    logout: 'Sair',
  },
  splash: {
    loadingAccessibilityLabel: 'Carregando',
  },
  boot: {
    screenTitle: 'Sem conexão',
    logout: 'Sair',
    error: { title: 'Não conseguimos conectar.' },
  },
  common: {
    /** Logo da splash, do Login e do header. */
    logoLabel: 'FIAP School',
    /** Fundo do dropdown aberto: o leitor de tela também fecha a lista por ele. */
    closeListAccessibilityLabel: 'Fechar lista',
    error: { description: 'Confira sua conexão e tente de novo.' },
    retry: 'Tentar de novo',
    retryAccessibilityLabel: 'Tentar de novo',
  },
} as const;
