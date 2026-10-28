# Plano — fiap-school

Brief: `00-brief.md` (aprovado em 2026-10-27). Design: `docs/figma/README.md`.
Dados: `docs/data/responsaveis.json`.

## Trilhas e worktrees

Monorepo com três trilhas independentes. Cada trilha tem uma branch e um
worktree próprios, todos a partir de `spec/fiap-school`. `api/` e `mobile/` são
pastas separadas, por isso as duas trilhas podem rodar ao mesmo tempo sem dois
developers no mesmo código. As tarefas dentro de uma trilha são sequenciais e
ficam na mesma branch.

| Trilha | Branch | Worktree |
|---|---|---|
| tooling | `chore/tooling` | `.claude/worktrees/tooling` |
| api | `feat/api` | `.claude/worktrees/api` |
| mobile | `feat/mobile` | `.claude/worktrees/mobile` |

Sem remote no GitHub ainda: commits locais em cada branch. Os PRs abrem quando o
repositório público existir.

## Contrato da API (consumido pelo mobile)

Prefixo `/api`. Erros no formato padrão do Nest `{statusCode, message, error}`.

```
POST /api/auth/login        {cpf: "969.294.560-04" | "96929456004", password}
  200 {accessToken, guardian: {id, firstName, lastName}}
  401 {message: "Usuário ou senha inválida."}   400 se CPF malformado
GET  /api/me
  200 {id, firstName, lastName, cpf: "***.294.560-**", students: [{id, rm, firstName, lastName, className, period}]}
GET  /api/students/:id/agenda
  200 [{date: "2025-03-16", lessons: [{startTime: "07:15", endTime: "08:00", subject: "Matemática I"}]}]  (7 dias, ordem de data)
GET  /api/students/:id/report-cards
  200 [{year: 2025, className: "7EF"}, {year: 2024, className: "6EF"}]   (desc)
GET  /api/students/:id/report-cards/:year
  200 {year, className, terms: [{term: 1, subjects: [{name, grade: 9.5|null, absences: 0|null}]}]}  (3 termos, ordem do JSON)
  404 ano inexistente
GET  /api/health → 200 {status: "ok"}
```
401 sem token ou com token inválido; 403 em aluno não vinculado. O parâmetro de rota é sempre `:id` (vence o `:studentId` do D21); o guard de ownership lê `params.id`. Em `/demo/grades` (Tarefa 16) o `studentId` vem no corpo e o use case confere o vínculo. `id` do aluno é
o `id` interno (cuid), não o RM.

## Tarefas

### Tarefa 1 — Adaptar o time do /squad ao projeto
- Trilha: tooling
- Depende de: nenhuma
- Arquivos: `.claude/agents/*.md`, `.claude/team/PROTOCOLO.md`
- Comportamento: trocar tudo o que é do Safety Swap (repos de /SS, Heroku, EAS
  production/OTA do SS, Asaas, i18n de 4 dicionários, Postgres, credenciais do
  SS, `master`) pelo contexto deste projeto (monorepo `api/` + `mobile/`, branch
  `main`, SQLite, RN CLI + Restyle, sem deploy em loja), mantendo o fluxo, os
  papéis e o formato de achados. O qa testa a API com curl/supertest e o app no
  iOS simulator (e no Maestro quando instalado), não no Chrome.
- Verificação: `grep -rniE "safety|/SS|heroku|asaas|master|i18n|postgres" .claude/agents .claude/team/PROTOCOLO.md` não acha nada.

### Tarefa 2 — Tooling da raiz
- Trilha: tooling · Depende de: Tarefa 1 (mesma branch)
- Arquivos: `package.json` (raiz, `private`, só tooling), `.husky/commit-msg`,
  `.husky/pre-commit`, `commitlint.config.js`, `.lintstagedrc.js`,
  `.editorconfig`, `.nvmrc`, `.github/workflows/commitlint.yml`, `README.md` (esqueleto)
- Comportamento: commit fora do padrão conventional é recusado; o pre-commit roda
  eslint/prettier nos arquivos staged de `api/` e `mobile/` (com os comandos de
  cada pasta, e sem quebrar enquanto as pastas ainda não existem).
- Teste: `echo "bad msg" | yarn commitlint` falha e `echo "feat(api): x" | yarn commitlint` passa.

### Tarefa 3 — API: scaffold, banco e seed
- Trilha: api · Depende de: nenhuma
- Arquivos: `api/**` (Nest 11 + TS strict), `api/prisma/schema.prisma`,
  migration inicial, `api/prisma/seed.ts`, `api/prisma/seed-data/responsaveis.json`
  (cópia de `docs/data/`), `src/main.ts` (prefixo `/api`, ValidationPipe global
  com whitelist/forbidNonWhitelisted/transform, CORS por env), `src/config`
  (env validada), `src/health`.
- Comportamento: `yarn prisma migrate reset --force` cria o SQLite e semeia o
  JSON + o responsável sem aluno (CPF válido documentado). `horario` "07:15 -
  08:00" vira `startTime`/`endTime`; a ordem das aulas e das disciplinas é
  preservada; senha com bcrypt.
- Teste que falha primeiro: `seed-mapper.spec.ts` (mapeamento JSON → registros,
  incluindo horário, nota e falta null) e e2e `health.e2e-spec.ts`.
- Verificação: `yarn lint && yarn tsc --noEmit && yarn test && yarn test:e2e`.

### Tarefa 4 — API: autenticação
- Trilha: api · Depende de: Tarefa 3
- Arquivos: `src/modules/auth/{controllers,use-cases,repositories,dto}`,
  `src/shared/decorators/{public,current-guardian,is-cpf}.ts`,
  `src/shared/guards/jwt-auth.guard.ts` (global), throttler no login.
- Comportamento: A1 e A2 do brief. `LoginUseCase` com repositório por interface
  (token de injeção). Mesma mensagem 401 para CPF inexistente e senha errada.
- Teste que falha primeiro: `login.use-case.spec.ts`, `is-cpf.spec.ts` e e2e de login (200/401/400).

### Tarefa 5 — API: me, agenda, boletim e ownership
- Trilha: api · Depende de: Tarefa 4
- Arquivos: `src/modules/{guardians,students}/...`,
  `src/shared/guards/student-ownership.guard.ts`
- Comportamento: A3, A4, A5 do brief, com o contrato acima. Um use case por rota,
  cada um com o seu `.spec.ts`.
- Teste que falha primeiro: specs dos use cases + e2e (200, 401, 403, 404).

### Tarefa 6 — API: logs, Swagger, Docker e CI
- Trilha: api · Depende de: Tarefa 5
- Arquivos: `nestjs-pino` (request-id, redact), `@nestjs/swagger` em `/docs`,
  `api/Dockerfile`, `docker-compose.yml` (raiz), `.github/workflows/api.yml`.
- Comportamento: A7, A8; o workflow roda lint, tsc, unit e e2e.
- Verificação: os comandos da Tarefa 3 + o YAML válido (`actionlint` se disponível).
  O Docker não existe na máquina: o Dockerfile é validado por revisão.

### Tarefa 7 — Mobile: scaffold e design system
- Trilha: mobile · Depende de: nenhuma
- Arquivos: `mobile/**` via `@react-native-community/cli init` (TypeScript, yarn,
  bundle id `br.com.fiap.school`), `npx install-expo-modules`, Restyle
  (`src/theme/` com os tokens de `docs/figma/README.md`), Montserrat embutida
  (iOS e Android), reanimated, React Navigation (stack + tabs com telas
  placeholder), `react-native-bootsplash` (logo da capa), Jest +
  `@testing-library/react-native`, `metro.config.js` com `useWatchman: false`
  (o watchman da máquina está quebrado).
- Comportamento: o app abre no iOS simulator com a splash e cai numa tela
  placeholder com fundo `#000` e texto em Montserrat via Restyle.
- Teste que falha primeiro: teste de render de um componente base do tema (`Text` variant).
- Verificação: `yarn lint && yarn tsc && yarn test` + build no iOS simulator
  (`yarn ios`). Android: sem JDK na máquina, então fica para o CI.

### Tarefa 8 — Mobile: camada de dados
- Trilha: mobile · Depende de: Tarefa 7
- Arquivos: `src/services/{http,storage,logger}`, `src/stores/session.store.ts`
  (zustand + mmkv), `src/app/queryClient.ts`, `src/features/*/schemas` (zod do
  contrato), `react-native-config` (`API_URL`), MSW nos testes.
- Comportamento: D8, D9, D15 e D16 do brief; interceptor de 401 limpa a sessão;
  o logger não registra token, senha nem CPF.
- Teste que falha primeiro: store de sessão, interceptor de 401 e parse dos schemas.

### Tarefa 8b — Mobile: splash animada com o logo FIAP
- Trilha: mobile · Depende de: Tarefa 8 (sessão) e `01-design.md` seção 3.1/4.1 (atualizada pelo designer)
- Pedido do usuário em 2026-10-27: "criar uma splash screen animada com o logo da fiap".
- Comportamento: a splash nativa (bootsplash) passa para a `SplashScreen` em JS sem piscar; a JS anima o logo FIAP (entrada + loop leve enquanto a sessão carrega, com duração mínima para a animação completar e máxima para não travar o app), e sai para Login (logo desliza até a posição do login), App (fade + scale) ou NoStudent/BootError, conforme 3.1. Respeita "reduzir movimento". 60 fps no UI thread (reanimated), sem JS thread na animação.
- Teste que falha primeiro: o ViewModel da splash decide o destino (sem token → Login; token + /me ok com aluno → App; 0 aluno → NoStudent; erro → BootError) e respeita a duração mínima; render da SplashScreen com `testID="splash-screen"`.
- Verificação: lint, tsc, test + gravação no iOS simulator (`xcrun simctl io <id> recordVideo`) em `evidencias/tarefa-8b-splash.mp4`.

### Tarefa 9 — Mobile: Login
- Trilha: mobile · Depende de: Tarefa 8 e `01-design.md`
- Comportamento: M1 e M2 (login e sessão persistida), com os estados do Figma
  (vazio, máscara, ativo, carregando e erro) e as animações do `01-design.md`.
- Teste que falha primeiro: `useLoginViewModel` (máscara, habilitar botão, erro
  401) e render do `CpfInput`.

### Tarefa 10 — Mobile: cabeçalho, tab bar, seleção de aluno e sem aluno
- Trilha: mobile · Depende de: Tarefa 9
- Comportamento: M3, M6, M7 e logout do M2.

### Tarefa 11 — Mobile: Agenda
- Trilha: mobile · Depende de: Tarefa 10 · Comportamento: M4 + D35.

### Tarefa 12 — Mobile: Boletim
- Trilha: mobile · Depende de: Tarefa 10 · Comportamento: M5 (acordeões, `-`, dropdown de ano).

### Tarefa 13 — Mobile: estados, animações e CI
- Trilha: mobile · Depende de: Tarefas 11 e 12
- Comportamento: M8, M9; `.github/workflows/mobile.yml` (lint, tsc e jest com cobertura).

### Tarefa 14 — Maestro
- Trilha: mobile · Depende de: Tarefa 13
- Arquivos: `mobile/.maestro/*.yaml` (os 10 flows da seção 6 do brief) e `.github/workflows/maestro.yml`.
- Verificação: Maestro não está instalado na máquina; os flows rodam assim que o
  usuário instalar, e o workflow fica com `workflow_dispatch`.

### Tarefa 15 — OTA (expo-updates) — **REMOVIDA em 2026-10-28 a pedido do usuário** ("remover o OTA")
- Trilha: mobile · Depende de: Tarefa 13 · Comportamento: D34.

### Tarefa 16a — API: ordem dos alunos e e2e estável (substitui a parte API da antiga Tarefa 16)
- Trilha: api · Depende de: nenhuma
- Comportamento: `GET /api/me` devolve os alunos na ordem do JSON/seed (Rafael antes de Joana), com e2e que fixa a ordem; o e2e de concorrência caso (b) deixa de depender de tempo (adiado da revisão final).

### Tarefa 16b — Mobile: remover Expo Modules
- Trilha: mobile · Depende de: Tarefa 14
- Motivo: OTA e push foram removidos a pedido do usuário; os Expo Modules ficaram sem uso e o enunciado pede só as dependências necessárias e React Native CLI.
- Comportamento: `expo` e afins saem do `package.json`; AppDelegate/SceneDelegate/MainApplication/MainActivity/Podfile/settings.gradle/babel voltam ao template do RN 0.88 (mantendo bootsplash, fontes, modo escuro, nome do módulo); app continua idêntico no iOS; build Android configurado.

### Tarefa 16 — Push — **REMOVIDA em 2026-10-28 a pedido do usuário** ("remover o Push")
- Trilhas: api + mobile · Depende de: Tarefas 6 e 13 (a 15 foi removida) · Comportamento: D12, M10.

### Tarefa 17 — README final e CD
- Trilha: tooling · Depende de: tudo
- Comportamento: G3 + D30 + APK de release em tag (D32).

## Conferência do plano contra ele mesmo

| Produz | Consome | Interface |
|---|---|---|
| Tarefas 3–5 | Tarefa 8 (schemas zod) | contrato da API acima, que é a fonte da verdade nas duas trilhas |
| Tarefa 2 (lint-staged) | Tarefas 3 e 7 | cada pasta expõe `yarn lint` e `yarn format`; o lint-staged chama esses scripts |
| Tarefa 7 (tema) | designer (`01-design.md`) | nomes dos tokens e das variantes de `docs/figma/README.md` |
| Tarefa 6 (`api.yml`), Tarefa 13 (`mobile.yml`) | Tarefa 2 (`commitlint.yml`) | arquivos de workflow diferentes, sem conflito |
| Tarefa 16 | Tarefa 6 (API) e 15 (Expo modules) | rota `POST /api/devices` |
