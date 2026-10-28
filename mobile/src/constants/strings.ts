/**
 * Textos da interface, exatamente como na tela (01-design.md, seção 5). As
 * telas, os testes e o Maestro leem daqui para não duplicar texto.
 */
export const strings = {
  login: {
    title: 'Bem-vindo',
    subtitle: 'Acompanhe as aulas e o boletim do seu filho.',
    cpfLabel: 'CPF',
    cpfHint: 'Somente números',
    cpfPlaceholder: '000.000.000-00',
    passwordLabel: 'Senha',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
    submit: 'Entrar',
    submittingAccessibilityLabel: 'Entrando…',
    help: 'Problemas para entrar? Fale com a secretaria da FIAP School.',
    error: {
      invalid: 'Usuário ou senha inválida. Confira e tente de novo.',
      cpf: 'Confira o CPF digitado.',
      network: 'Não conseguimos falar com o servidor. Confira sua conexão.',
      tooMany: 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.',
      server: 'Algo deu errado do nosso lado. Tente de novo em instantes.',
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
    today: 'Hoje',
    todayHint: 'Volta para o dia de hoje',
    /** `{n} aulas` / `1 aula`. */
    lessonCount: (count: number) => (count === 1 ? '1 aula' : `${count} aulas`),
    /** `Segunda-feira, 17 de março, 6 aulas` (+ `, hoje`). */
    dayAccessibilityLabel: (
      weekday: string,
      day: number,
      month: string,
      count: number,
      isToday: boolean,
    ) =>
      `${weekday}, ${day} de ${month}, ${
        count === 0 ? 'sem aulas' : count === 1 ? '1 aula' : `${count} aulas`
      }${isToday ? ', hoje' : ''}`,
    /** Anúncio da troca de dia pelo swipe (6.4). */
    dayChangedAnnouncement: (
      weekday: string,
      day: number,
      month: string,
      count: number,
    ) =>
      `${weekday}, ${day} de ${month}. ${
        count === 0 ? 'Sem aulas' : count === 1 ? '1 aula' : `${count} aulas`
      }.`,
    /** `07:15 – 08:00 · 45 min`. */
    lessonTime: (start: string, end: string, minutes: number) =>
      `${start} – ${end} · ${minutes} min`,
    lessonAccessibilityLabel: (start: string, end: string, subject: string) =>
      `Das ${start} às ${end}, ${subject}`,
    lessonNowSuffix: ', agora',
    lessonPastSuffix: ', encerrada',
    nowBadge: 'Agora',
    banner: {
      now: (subject: string) => `Agora: ${subject}`,
      nowDetail: (end: string) => ` · até ${end}`,
      break: 'Intervalo',
      breakDetail: (start: string) => ` · próxima aula às ${start}`,
      before: (start: string) => `Próxima aula às ${start}`,
      after: 'Aulas encerradas',
      summaryDetail: (start: string, end: string) =>
        ` · das ${start} às ${end}`,
    },
    /** `Intervalo · 30 min`. */
    break: (minutes: number) => `Intervalo · ${minutes} min`,
    empty: 'Sem aulas neste dia',
    emptyWeekend: 'Aproveite o fim de semana.',
    emptyWeekday: 'Nenhuma aula marcada para este dia.',
    weekEmpty: 'Nenhuma aula nesta semana',
    loadingAccessibilityLabel: 'Carregando agenda…',
    error: { title: 'Não foi possível carregar a agenda.' },
  },
  boletim: {
    title: 'Boletim',
    /** `2025 · 7EF`. */
    yearOption: (year: number, className: string) => `${year} · ${className}`,
    /** Pílula única (aluno com 1 ano só). */
    yearSingle: (year: number, className: string) =>
      `Ano letivo ${year} · ${className}`,
    /** `1º tri` (ordinal `º`, U+00BA). */
    termShort: (term: number) => `${term}º tri`,
    termAccessibilityLabel: (term: number) => `${term}º trimestre`,
    /** `1º trimestre · 2025` (maiúsculas pela variante `overline`). */
    summaryTitle: (term: number, year: number) =>
      `${term}º trimestre · ${year}`,
    average: 'Média geral',
    averagePartial: (evaluated: number) =>
      `Média de ${evaluated} disciplinas avaliadas`,
    statAbsences: (absences: number) => (absences === 1 ? 'falta' : 'faltas'),
    statSubjects: 'disciplinas',
    statBelow: 'abaixo de 7',
    band: {
      good: 'Bom',
      warning: 'Atenção',
      low: 'Baixo',
      none: 'Sem nota',
    },
    legend: {
      good: '7 ou mais',
      warning: '5 a 6,9',
      low: 'abaixo de 5',
      accessibilityLabel:
        'Faixas de nota: 7 ou mais, bom; 5 a 6,9, atenção; abaixo de 5, baixo.',
    },
    /** `Disciplinas · 12` (maiúsculas pela variante `overline`). */
    subjectsHeader: (count: number) => `Disciplinas · ${count}`,
    /** Nota no card sem nota lançada (en dash). */
    gradeMissing: '–',
    absencesCount: (absences: number | null) =>
      absences === null
        ? 'Faltas não lançadas'
        : `${absences} ${absences === 1 ? 'falta' : 'faltas'}`,
    notEvaluatedTitle: 'Ainda não avaliado',
    notEvaluatedDescription: (term: number) =>
      `As notas do ${term}º trimestre aparecem aqui assim que forem lançadas.`,
    /** `Língua Portuguesa. Nota 9,5, Bom. 0 faltas.` */
    subjectAccessibilityLabel: (
      name: string,
      grade: string,
      band: string,
      absences: string,
    ) => `${name}. Nota ${grade}, ${band}. ${absences}.`,
    subjectNotReleasedAccessibilityLabel: (name: string) =>
      `${name}. Nota e faltas ainda não lançadas.`,
    /** `1º trimestre de 2025. Média 8,2, Bom. 14 faltas em 12 disciplinas. 1 abaixo de 7.` */
    summaryAccessibilityLabel: (
      term: number,
      year: number,
      average: string,
      band: string,
      absences: number,
      subjects: number,
      below: number,
    ) =>
      `${term}º trimestre de ${year}. Média ${average}, ${band}. ${absences} ${
        absences === 1 ? 'falta' : 'faltas'
      } em ${subjects} disciplinas. ${below} abaixo de 7.`,
    loadingAccessibilityLabel: 'Carregando boletim…',
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
    error: { description: 'Confira sua conexão e tente de novo.' },
    retry: 'Tentar de novo',
    retryAccessibilityLabel: 'Tentar de novo',
  },
} as const;
