# Brief — FIAP School (app do responsável + API)

> Spec do SDD (Spec-Driven Development). É o documento de design que o usuário
> aprova antes de qualquer código. Depois dele vem o `00-plano.md` (tarefas) e o
> `00-ledger.md` (andamento), no fluxo do `/squad`.

## 1. Pedido

Teste técnico de Mobile da FIAP (`teste-tecnico-mobile.docx`): app para os
responsáveis dos alunos da FIAP School acompanharem as aulas do dia e o boletim
anual (notas e faltas), seguindo o Figma da equipe.

Pedido do usuário, nas palavras dele:

> vamos criar a estrutura do app e tecnologias: mvvm; react-hook-form + form;
> expo push notification; react-query / tanstack; zod para controle de estados
> compartilhados; Autenticação; Restyle; Test de components; husky + conventional
> commits + ci test de components; CI/CD para test de components no github;
> maestro mapeando os casos de uso de test fluxo de tela; logs.
>
> ao invés de utilizar o JSON, vamos criar um backend simples em nestjs com jwt,
> com autenticação para o app consumir desta api: nestjs; class-validator; JWT;
> decorators; cors habilitado; test unitário; test e2e; arquitetura de
> controllers / usecases; cada use-case vai ter test unitário; sqlite + prisma +
> migrations + seed; husky + conventional commits + ci com os tests unitários;
> github actions com test unitário e test integração.
>
> apenas criar documento antes de implementar e adicionar alguma ferramenta para
> agregar o teste do processo seletivo. vamos utilizar /squad do projeto do SS.
> utilizando o spec driven development.

## 2. Requisitos do teste (fonte: o .docx)

Obrigatórios, conferidos pelo avaliador:

| # | Requisito |
|---|---|
| R1 | React Native **CLI** + TypeScript + **Restyle** |
| R2 | Funciona em iOS e Android |
| R3 | Login com CPF (máscara `XXX.XXX.XXX-XX`) + senha; erro quando inválidos; sem "esqueci a senha"/cadastro |
| R4 | Sessão persiste ao fechar/reabrir; autenticado abre direto em Aulas |
| R5 | Cabeçalho em toda tela autenticada: 1º nome do responsável; 1º nome, RM, turma e período do aluno; botão de trocar aluno (só se >1 aluno); botão de logout |
| R6 | Rodapé com navegação Aulas ⇄ Boletim |
| R7 | Aulas: aulas de um dia (início, término, disciplina) + navegação entre os dias da semana |
| R8 | Boletim: abre em 2025, só o 1º trimestre avaliado; mostra ano, turma, trimestres com disciplinas, nota geral e faltas. Bônus: anos anteriores |
| R9 | Seleção de aluno: fora do rodapé; não aparece com 1 aluno; lista nome completo, RM, turma; ao escolher volta para a tela anterior |
| R10 | Animações em todas as telas, sem prejudicar performance |
| R11 | Desenvolvido com IA de forma estruturada (SDD), com os arquivos de configuração da IA dentro do projeto |
| R12 | README com instalação e dependências (fotos/vídeos opcionais); repositório público no GitHub |
| R13 | Firebase/API própria no lugar do JSON exige passo a passo no README |

Extras sugeridos pelo teste e que entram: splash screen, testes unitários,
cenários de erro (responsável sem alunos), API própria.

## 3. Decisões

Legenda: **[usuário]** = pediu explicitamente · **[chief]** = decisão minha,
pode ser trocada na aprovação.

### Gerais

- **D1 [chief] Monorepo simples, sem workspaces.** Um repositório público com
  `mobile/` e `api/` independentes (cada um com seu `package.json` e
  `yarn.lock`) e na raiz só o tooling comum (husky, commitlint, CI, specs).
  *Por quê:* o avaliador recebe um link só; yarn workspaces com RN CLI dá dor de
  cabeça com o hoisting do Metro. *Custo se errado:* baixo, separar em dois repos
  depois é mover pastas.
- **D2 [chief] yarn** (o teste diz que usam yarn).
- **D2b [chief] Raiz do repositório = `/Users/fael_st/workspace/fiap`.** O
  `.gitignore` exclui `graft/` (cache e telemetria local) e `.claude/settings.local.json`.
- **D3 [usuário] SDD com o `/squad` adaptado.** A pasta `.claude/` do projeto
  leva os agents (chief, designer, developer, code-reviewer, cyber-security, qa)
  e o `PROTOCOLO.md` copiados do SS e reescritos para este projeto (sem Safety
  Swap, sem Heroku/EAS/OTA, branch `main`). **Feito em 2026-10-27:** os 6
  agents, o `PROTOCOLO.md`, a skill `squad` (já apontando para este projeto) e
  as 22 skills que os agents usam foram copiados para `.claude/`. **Falta:**
  reescrever o texto dos agents e do protocolo, que ainda citam Safety Swap,
  repos do SS, Heroku/EAS e `master` em cerca de 48 trechos (Tarefa 1 do plano).
  Os artefatos de cada entrega ficam em
  `.claude/team/tarefas/<data>-<slug>/` (brief → plano → ledger → dev → review
  → security → qa → relatório). Há também um `CLAUDE.md` na raiz. *Por quê:* o
  R11 pede os arquivos de configuração da IA no projeto, e a trilha de
  brief/plano/review commitada é a prova de SDD para o avaliador.

### Mobile

- **D4 [usuário] React Native CLI + TypeScript (strict) + Restyle.** Tema único
  em `src/theme/` com os tokens extraídos do Figma (cores, spacing, radii,
  textVariants, buttonVariants e cardVariants).
- **D5 [usuário] MVVM.** View = componente da tela (só renderiza); ViewModel =
  hook `useXViewModel` (estado da tela, chamadas aos hooks de dados, handlers);
  Model = `services/` (HTTP), `repositories/` (tipos e mapeamento DTO →
  domínio), `stores/` (estado global). A View nunca importa `services/` direto.
- **D6 [usuário] react-hook-form** no login, com `zodResolver`.
- **D7 [chief, corrigindo o pedido] Estado compartilhado em zustand, schemas em
  zod.** O pedido diz "zod para controle de estados compartilhados", mas zod
  valida dados e não guarda estado. Decisão: **zustand** para o estado global
  (sessão e aluno selecionado), com persistência; **zod** para validar o
  formulário de login e as **respostas da API** (os schemas são a fonte dos
  tipos `z.infer`). *Custo se errado:* se a intenção era outra (ex.: só zod +
  context), trocar o store é localizado em `stores/`.
- **D8 [usuário] TanStack Query** para todo dado remoto (`/me`, aulas, boletim),
  com query keys por aluno, cache e refetch ao trocar de aluno.
- **D9 [chief] Autenticação no app.** O JWT fica no **react-native-keychain**
  (Keychain/Keystore, não AsyncStorage); o aluno selecionado fica no zustand
  persistido em **react-native-mmkv**. Ao abrir o app: com token → valida com
  `GET /me` → Aulas; sem token ou 401 → Login. Um interceptor do axios trata 401
  limpando a sessão.
- **D10 [chief] Navegação com React Navigation:** native-stack (Splash/Login,
  App, Seleção de aluno em modal) + bottom-tabs (Aulas, Boletim) com tab bar
  customizada. A seleção de aluno é rota do stack e não aparece no rodapé, e
  `goBack()` volta para a tela anterior (R9).
- **D11 [chief] Animações com react-native-reanimated 3** (entering/layout
  animations, transição entre os dias, contagem nas notas, pressable com escala)
  e **react-native-bootsplash** para a splash nativa, com animação de saída.
- **D12 [usuário + chief] Push com expo-notifications em RN CLI.** Entra pelo
  `npx install-expo-modules` (Expo Modules no projeto bare, sem Expo Go nem
  expo-router). O app pede permissão depois do login, pega o **Expo Push
  Token** e o registra na API (`POST /devices`). A API envia pelo Expo Push
  Service (`expo-server-sdk`). Gatilho de demonstração: quando uma nota é
  lançada, por um endpoint protegido de demo e pelo seed, o responsável recebe
  "Nova nota de <disciplina> no boletim de <aluno>", e o toque abre o Boletim.
  Ver **Riscos**: isso exige conta Expo, credenciais FCM/APNs e aparelho físico.
- **D13 [usuário] Testes de componente:** Jest + `@testing-library/react-native`
  nos componentes (Header, DaySelector, ClassCard, ReportCardTable, CpfInput) e
  nos ViewModels (`renderHook`, com API mockada por **MSW**). Utils puros (máscara
  e validação de CPF, primeiro nome) com teste unitário.
- **D14 [usuário] Maestro** com um flow por caso de uso (seção 6), em
  `mobile/.maestro/`, usando `testID` estável em cada elemento.
- **D15 [usuário + chief] Logs no mobile:** um `logger` próprio (níveis
  debug/info/warn/error) que em dev manda para o console e o **Reactotron**
  (inspeção de requests, estado do zustand e cache do React Query) e em produção
  só registra `warn`/`error`. O interceptor do axios loga request/response com
  duração e request-id, **sem token nem senha**.
- **D16 [chief] HTTP com axios** (interceptors de token, 401 e log). A base URL
  vem do `react-native-config` (`.env`), com padrão `10.0.2.2` no Android
  emulador e `localhost` no iOS simulador.

### API

- **D17 [usuário] NestJS 11 + Prisma + SQLite + migrations + seed.**
- **D18 [usuário] Arquitetura controllers → use cases.** Cada módulo tem
  `controllers/` (HTTP, DTOs com class-validator, sem regra), `use-cases/` (uma
  classe com `execute()` por caso de uso, sem conhecer HTTP) e `repositories/`
  (interface + implementação Prisma, injetada por token, para o use case ser
  testado com repositório falso). **Cada use case tem seu `.spec.ts`.**
- **D19 [usuário] class-validator + ValidationPipe global** (`whitelist`,
  `forbidNonWhitelisted`, `transform`).
- **D20 [usuário] JWT com `@nestjs/jwt` + passport-jwt.** Guard global, rotas
  abertas marcadas com `@Public()`. Token de acesso único com validade de 7 dias
  (`JWT_EXPIRES_IN`), sem refresh token. *Por quê:* o R4 pede sessão persistente
  e o escopo é de teste técnico. *Custo se errado:* refresh token é uma tarefa a
  mais (rota + rotação) e não muda o app além do interceptor.
- **D21 [usuário] Decorators próprios:** `@Public()`, `@CurrentGuardian()`
  (param decorator com o responsável do token), `@IsCpf()` (validador
  class-validator com dígitos verificadores) e `@StudentOwnership()` (guard que
  garante que o `:studentId` da rota é vinculado ao responsável logado).
- **D22 [usuário] CORS habilitado** (`app.enableCors`, origens via env, `*` em
  dev).
- **D23 [chief] Senha com bcrypt.** O CPF é guardado só com dígitos e é único.
  Login inválido devolve **401 com a mesma mensagem** para CPF inexistente e
  senha errada (não revela quais CPFs existem). Rate limit no login com
  `@nestjs/throttler`.
- **D24 [chief] Logs na API:** `nestjs-pino` (JSON em prod, pretty em dev), com
  request-id por requisição (`x-request-id` devolvido ao app) e `redact` de
  `authorization`, `password` e `cpf`.
- **D25 [usuário] Testes da API:** unitário (Jest) em todo use case, guard e
  decorator de validação; **e2e** com supertest sobre um SQLite de teste
  (`file:./test.db`, migrate + seed antes da suíte) cobrindo login,
  `/me`, aulas, boletim, ownership (403) e 401.

### Ferramentas que agregam ao teste ("adicionar alguma ferramenta")

- **D26 [chief] Swagger/OpenAPI** em `/docs` (`@nestjs/swagger`, com o botão de
  auth Bearer). O avaliador testa a API sem ler código.
- **D27 [chief] Docker Compose** para a API (`docker compose up` sobe com
  migrate + seed). É um caminho de um comando para o avaliador.
- **D28 [chief] Tipos compartilhados pelo contrato:** os schemas zod do app
  seguem o Swagger, e o e2e da API confere o formato das respostas. Não há
  geração automática de cliente, para não somar dependência.
- **D29 [chief] Qualidade de código:** ESLint + Prettier nos dois projetos e
  `tsc --noEmit` no CI.
- **D30 [chief] README com GIFs** dos fluxos (gravados dos flows do Maestro) e
  uma seção "Como o projeto foi construído com IA (SDD)" que aponta para
  `.claude/` e `.claude/team/tarefas/`.

### Git e CI

- **D31 [usuário] husky + commitlint (`@commitlint/config-conventional`)** na
  raiz: `commit-msg` valida a mensagem; `pre-commit` roda **lint-staged**
  (eslint + prettier só nos arquivos staged). Escopos sugeridos: `mobile`,
  `api`, `ci`, `docs`, `spec`.
- **D32 [usuário] GitHub Actions**, com filtro de path para cada workflow:
  - `api.yml`: install → lint → tsc → **unit** → **e2e/integração** (SQLite
    em arquivo, migrate + seed).
  - `mobile.yml`: install → lint → tsc → **testes de componente** (jest
    `--coverage`) e o relatório de cobertura como artefato.
  - `commitlint.yml`: valida as mensagens dos commits do PR.
  - `maestro.yml` **[chief]**: Android emulator (`reactivecircus/android-emulator-runner`)
    + API subindo no próprio job + flows do Maestro. Roda no
    `workflow_dispatch` e em PR para `main` com label `e2e`, não a cada push.
    *Por quê:* build Android + emulador custa uns 20 min por execução. *Custo se
    errado:* virar obrigatório é trocar o gatilho.
  - "CD": não há deploy de loja. O CD é gerar o **APK de release** como artefato
    da Action em tag `v*`, para o avaliador instalar sem buildar. iOS não tem
    artefato (exige conta Apple paga).
- **D33 [chief] Branch padrão `main`**, com PR por entrega e sem merge pelo
  time (regra do `/squad`).

## 4. Escopo

### Entra

**API (`api/`)**

Modelo de dados (palpite meu até ver o JSON, ver Riscos):

```
Guardian      id, name, cpf (único, só dígitos), passwordHash
Student       id, name, rm (único), className (ex. "1A"), period ("Manhã"/"Tarde")
GuardianStudent guardianId, studentId            (N:N)
Lesson        id, studentClass, weekday (1–5), startTime "HH:mm", endTime, subject
ReportCard    id, studentId, year, className
TermResult    id, reportCardId, term (1–3), subject, grade (decimal | null), absences (int | null)
Device        id, guardianId, expoPushToken (único), platform, createdAt
```

Rotas (prefixo `/api`):

| Método | Rota | Use case | Auth |
|---|---|---|---|
| POST | `/auth/login` `{cpf, password}` | `LoginUseCase` → `{accessToken, guardian}` | pública |
| GET | `/me` | `GetMeUseCase` → responsável + alunos vinculados | JWT |
| GET | `/students/:id/lessons?weekday=1..5` | `GetStudentLessonsUseCase` | JWT + ownership |
| GET | `/students/:id/report-cards/years` | `ListReportCardYearsUseCase` | JWT + ownership |
| GET | `/students/:id/report-cards/:year` | `GetReportCardUseCase` | JWT + ownership |
| POST | `/devices` `{expoPushToken, platform}` | `RegisterDeviceUseCase` (upsert) | JWT |
| DELETE | `/devices/:token` | `UnregisterDeviceUseCase` (no logout) | JWT |
| POST | `/demo/grades` `{studentId, subject, term, grade}` | `PublishGradeUseCase` → grava a nota + `SendPushUseCase` | JWT + ownership, só com `DEMO_ENABLED=true` |
| GET | `/health` | — | pública |

Seed: responsáveis com 1 aluno, com 2+ alunos e **sem aluno** (cenário de
erro); grade semanal de seg–sex por turma; boletins de 2025 (só o T1 com nota
e falta, T2/T3 `null`) e de 2024/2023 completos para o bônus. As senhas do
seed vão documentadas no README.

**Mobile (`mobile/`)**

```
src/
  app/            providers (Restyle, QueryClient, Navigation), bootstrap
  navigation/     RootStack, AppTabs, tipos de rota
  theme/          tokens do Figma, Restyle theme, componentes base (Box, Text, Button, Card)
  components/     Header, TabBar, DaySelector, ClassCard, ReportCardTable, CpfInput, EmptyState, ErrorState, Skeleton
  features/
    auth/         LoginScreen, useLoginViewModel, auth.service, auth.schema
    lessons/      LessonsScreen, useLessonsViewModel, lessons.service, lessons.schema
    report-card/  ReportCardScreen, useReportCardViewModel, ...
    students/     SelectStudentScreen, useSelectStudentViewModel, ...
    notifications/ usePushRegistration, handlers de toque
  stores/         session.store (zustand + mmkv)
  services/       http (axios + interceptors), storage (keychain), logger
  utils/          cpf (máscara/validação), names (primeiro nome), weekday
.maestro/         flows
```

Telas: Splash → Login → (Aulas | Boletim) com Header e TabBar → Seleção de
aluno (modal). Estados de loading (skeleton), erro (com tentar de novo) e vazio
em cada tela, mais o caso do responsável sem aluno (tela própria com logout).

**Raiz:** `.claude/` (squad adaptado), `CLAUDE.md`, `.github/workflows/`,
husky, commitlint, `README.md`, `docker-compose.yml`.

### Fica de fora

- Recuperação de senha e cadastro (o teste dispensa).
- Refresh token (D20).
- Tela de configurações/notificações e painel admin para lançar nota (o lançamento
  é pelo endpoint de demo / Swagger).
- Deploy da API em nuvem (roda local ou via Docker). *Pergunta em aberto:* ver
  seção 11.
- Publicação nas lojas e build iOS assinado.
- Internacionalização (só pt-BR).
- Tema escuro, a não ser que o Figma tenha.

## 5. Critérios de aceite

**API**

- A1 `POST /api/auth/login` com CPF (com ou sem máscara) e senha do seed → 200
  com `accessToken`; senha errada ou CPF inexistente → 401 com a mesma mensagem;
  CPF malformado → 400 com mensagem do `@IsCpf`.
- A2 Rota protegida sem token ou com token inválido → 401; com aluno não
  vinculado → 403.
- A3 `GET /me` devolve nome, CPF mascarado e alunos (id, nome, rm, turma,
  período); responsável sem aluno → `students: []`.
- A4 Aulas por dia ordenadas por `startTime`; `weekday` fora de 1–5 → 400.
- A5 Boletim de 2025: T1 com nota e falta por disciplina, T2 e T3 `null`; `years`
  lista 2025, 2024 e 2023 (desc); ano sem dado → 404.
- A6 `yarn test` (unit), `yarn test:e2e` e `prisma migrate reset --force` +
  seed passam do zero; cada arquivo de `use-cases/` tem `.spec.ts`.
- A7 Swagger em `/docs` lista todas as rotas com os DTOs e o Bearer funciona.
- A8 Logs não contêm senha, token nem CPF completo.

**Mobile**

- M1 CPF mascarado enquanto digita, limitado a 11 dígitos; botão "Entrar" só
  habilita com CPF válido e senha preenchida; credencial errada mostra a
  mensagem da API no formulário, com animação.
- M2 Login ok → Aulas. Fechar e reabrir o app → Aulas, sem passar pelo Login.
  Logout → Login, token apagado do keychain, cache do React Query limpo, device
  removido da API.
- M3 Header em Aulas e Boletim com os dados do R5. O botão de trocar aluno só
  aparece com mais de um aluno.
- M4 Aulas abre no dia da semana atual (sábado/domingo → segunda) e o seletor
  troca entre seg–sex com animação. Cada aula mostra início, término e
  disciplina. Dia sem aula mostra estado vazio.
- M5 Boletim abre em 2025 e mostra ano, turma, T1 com notas e faltas, T2/T3 como
  "Não avaliado". O seletor de ano navega para 2024/2023.
- M6 Seleção de aluno: lista nome completo, RM e turma; escolher volta para a
  tela de origem (Aulas ou Boletim) já com os dados do novo aluno. Não aparece no
  rodapé.
- M7 Responsável sem aluno vê a tela de estado vazio com logout, sem crash.
- M8 API fora do ar → estado de erro com "Tentar de novo".
- M9 Toda tela tem animação de entrada; as listas não perdem frame no Android em
  modo release (verificação visual do qa).
- M10 Push: em aparelho físico, `POST /api/demo/grades` faz a notificação chegar
  e o toque abre o Boletim do aluno certo.
- M11 `yarn test`, `yarn lint` e `yarn tsc` passam; os flows do Maestro passam no
  emulador Android e no simulador iOS.
- M12 Visual fiel ao Figma (cores, tipografia, espaçamentos e componentes), pela
  comparação lado a lado do qa.

**Repo**

- G1 Commit fora do padrão conventional é recusado pelo hook e pelo CI.
- G2 PR roda `api.yml` e `mobile.yml` e fica vermelho se qualquer teste falhar.
- G3 O README permite que alguém sem contexto suba a API e rode o app em iOS e
  Android seguindo só ele.

## 6. Casos de uso → flows do Maestro

| Flow | Caso de uso |
|---|---|
| `01-login-invalido.yaml` | CPF/senha errados → mensagem de erro |
| `02-login-sucesso.yaml` | login → Aulas com header correto |
| `03-sessao-persistida.yaml` | login → `stopApp` → `launchApp` → Aulas sem login |
| `04-aulas-navegar-dias.yaml` | troca seg→sex e confere as disciplinas de cada dia |
| `05-boletim-2025.yaml` | Boletim mostra 2025, T1 com notas e T2/T3 não avaliados |
| `06-boletim-anos-anteriores.yaml` | troca para 2024 (bônus) |
| `07-trocar-aluno.yaml` | responsável com 2 alunos: troca no Boletim e volta ao Boletim com o novo aluno |
| `08-um-aluno-sem-botao.yaml` | responsável com 1 aluno não vê o botão de troca |
| `09-sem-aluno.yaml` | responsável sem aluno vê o estado vazio |
| `10-logout.yaml` | logout → Login; reabrir continua no Login |

Os flows usam os responsáveis do seed e `testID`s, nunca texto de posição.

## 7. Design system

**Criar.** Não há design system existente: o designer extrai do Figma os
tokens (cores, tipografia, spacing, radii, sombras) e os componentes base para o
tema Restyle, e especifica as quatro telas e os estados (loading, vazio, erro)
em `01-design.md`, incluindo as animações de cada tela.

## 8. Riscos

- **R-JSON:** o JSON oficial ainda não foi lido. O modelo de dados da seção 4 é
  palpite. Se o JSON tiver outro formato (ex.: nota por avaliação em vez de nota
  geral, horário em outro formato), o schema Prisma e o seed mudam antes da
  Tarefa 1 da API. **Bloqueia o início da API.**
- **R-Figma:** o Figma ainda não foi lido (o MCP do Figma pede autenticação). Sem
  ele, o designer não especifica as telas. **Bloqueia o início do mobile (telas).**
- **R-Push:** Expo Push em RN CLI precisa de: conta Expo e `projectId`
  (`eas init`), um projeto Firebase com `google-services.json` para FCM (Android)
  e uma chave APNs, que exige conta Apple Developer paga (iOS). Simulador iOS não
  recebe push remoto. Sem essas credenciais, o push funciona só no Android físico.
  O avaliador também precisaria delas para testar. *Mitigação:* push opcional
  por env (`PUSH_ENABLED`); o app funciona inteiro sem ele, e o README traz o
  passo a passo e um GIF gravado.
- **R-Expo-modules:** `install-expo-modules` mexe no `Podfile`, no
  `MainApplication` e no `AppDelegate` do projeto RN CLI. Tem que ser feito logo
  depois do `init`, antes do resto das libs nativas, e conferido em iOS e Android.
- **Autenticação/dados pessoais:** CPF e senha trafegam no login. Sem HTTPS em
  dev local. Em produção seria obrigatório (README avisa). CPF nunca vai para log.
- **R-Maestro-CI:** emulador no GitHub Actions é lento e às vezes instável. Por
  isso não é obrigatório em todo push (D32).
- **R-Prazo:** a lista é grande para um teste. A ordem do plano prioriza os
  requisitos obrigatórios (R1–R12), e push, Maestro no CI e Docker vêm por último,
  para que um corte de tempo não deixe obrigatório pendente.

## 9. Restrições globais

Copiadas literalmente em cada revisão:

- React Native **CLI** (não Expo managed, não expo-router) + TypeScript strict +
  **Restyle**. Nenhum `StyleSheet.create` com cor ou espaçamento literal: tudo
  vem do tema.
- MVVM: a View não importa `services/` nem axios; a lógica fica no
  `useXViewModel`.
- Dado remoto só via TanStack Query; estado global só via zustand; validação só
  via zod (app) e class-validator (API).
- Token só no keychain. Nunca logar token, senha ou CPF completo.
- API: controller sem regra de negócio; um use case = uma classe com `execute()`
  e um `.spec.ts`; use case depende da interface do repositório, não do Prisma.
- Rotas por aluno passam pelo guard de ownership.
- Toda tela tem animação de entrada (reanimated) e `testID` nos elementos que o
  Maestro usa.
- Boletim padrão = **2025**, só **T1** avaliado.
- Commits conventional (`feat(mobile): ...`), mensagens e PR em português.
- yarn em tudo.

## 10. Plano de alto nível (vira o `00-plano.md` após aprovação)

1. Raiz: git, husky, commitlint, lint-staged, `.claude/` squad adaptado,
   `CLAUDE.md`, esqueleto do README.
2. API: scaffold Nest + Prisma/SQLite + schema + migration + seed (depois do JSON).
3. API: auth (login use case, JWT, `@Public`, `@CurrentGuardian`, `@IsCpf`, throttler).
4. API: `/me`, aulas, boletim + guard de ownership + e2e.
5. API: logs pino, Swagger, CORS, Docker, workflow `api.yml`.
6. Mobile: `react-native init` + expo-modules + Restyle + tema do Figma + navegação + splash.
7. Mobile: camada de dados (axios, keychain, zustand/mmkv, React Query, schemas zod, logger, Reactotron).
8. Mobile: Login (RHF + zod + máscara) + sessão persistida.
9. Mobile: Header + TabBar + Seleção de aluno.
10. Mobile: Aulas.
11. Mobile: Boletim (+ anos anteriores).
12. Mobile: estados vazio/erro/sem aluno + animações finais.
13. Mobile: testes de componente + workflow `mobile.yml`.
14. Maestro flows + `maestro.yml`.
15. Push (API: devices + demo + expo-server-sdk; app: registro + toque).
16. CD do APK em tag + README final com GIFs e passo a passo.

## 11. Perguntas em aberto (builder check, 2026-10-27)

1. **Push sem Expo?** O `install-expo-modules` + `expo-notifications` pode ser
   lido pelo avaliador como "usou Expo" (R1 pede RN CLI). A alternativa é
   `@react-native-firebase/messaging` + `notifee` (FCM direto, a API envia pelo
   `firebase-admin`). Tem que ser decidido antes do `init`.
2. **Credenciais de push e aparelho físico:** conta Expo e/ou projeto Firebase,
   Apple Developer paga? Sem isso o M10 vira "só Android físico" ou sai.
3. **Como o avaliador roda:** API local (Docker) ou API publicada? O APK da tag
   só funciona fora do emulador com uma API pública (hospedagem + HTTPS).
4. **Prazo de entrega**, para definir onde cortar (Maestro no CI, Docker, push,
   CD do APK).
5. **JSON e Figma:** os dois links estão no .docx, mas o conteúdo ainda não foi
   lido. Bloqueiam a API (schema/seed) e as telas.

## 12. Aprovação

Pendente: o usuário responde a seção 11 e aprova este brief antes do
`00-plano.md`.
