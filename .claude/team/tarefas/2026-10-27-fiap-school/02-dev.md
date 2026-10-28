# Dev — fiap-school

## Tarefa 1

- Trilha: tooling · worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/tooling` · branch `chore/tooling` · commit `8d61283` (base `40c8577`). Sem remote: sem push.

### O que mudou
- `.claude/team/PROTOCOLO.md`: título e papéis do FIAP School; qa = API (curl/supertest) + iOS simulator/Maestro; trilhas (`tooling`, `api`, `mobile`) com worktree por trilha e paralelismo só entre trilhas; `main`, conventional commits, fim da trilha sem remote = branch local; tabela do projeto com stack e comandos de verificação; SQLite + `yarn prisma migrate reset --force` (e o aviso do checkpoint de consentimento do Prisma); credenciais do seed; "sem deploy, OTA só via `yarn ota:update <canal>` a pedido do usuário"; seção nova **Restrições do ambiente local** (sem JDK/Android, Docker, Maestro; watchman quebrado).
- `.claude/agents/chief.md`: contexto lido de `CLAUDE.md`/brief/Figma em vez da memória do outro projeto; tamanhos do pedido por pasta/autenticação/CPF; builder check com domínio "engenheiro mobile sênior RN + NestJS"; plano por trilha; diffs contra `main`; fechamento sem remote (branch local) ou `gh pr create --base main`; relatório com "Como rodar" no lugar de deploy e pendências externas reais (Expo, FCM, APNs, GitHub, JDK, Docker, Maestro); regras que não se quebram sem dinheiro/marca, com "nunca logar token/senha/CPF" e "nunca publicar OTA sem pedido".
- `.claude/agents/designer.md`: fontes = `docs/figma/README.md`, `docs/figma/screens|assets`, `mobile/src/theme`; regras Restyle, tema escuro único, Montserrat, frame 414×736, React Navigation, animação de entrada, `testID`; skills `vercel-react-native-skills` + `web-design-guidelines` (saíram `expo-native-ui` e `expo-router`).
- `.claude/agents/developer.md`: padrões da API (controllers → use-cases → repositories por token, `.spec.ts` por use case, decorators/guards, ownership, pino com redact, Swagger) e do mobile (RN CLI, Restyle, MVVM, TanStack Query, zustand+mmkv, zod, RHF, keychain, testID, mudança nativa ≠ OTA); TDD nos dois Jest; comandos de entrega pedidos; contas Gustavo/Adelaide; skills sem `vercel-react-best-practices` e `supabase-postgres-best-practices`.
- `.claude/agents/code-reviewer.md`: diff contra `main...HEAD` por trilha; checklist de correção com os limites do domínio (nota/falta null, sem aluno, ano inexistente, CPF com/sem máscara); padrões API/mobile do brief; skills sem as de Next.js e Postgres.
- `.claude/agents/cyber-security.md`: foco em JWT/sessão (guard global, `@Public()` só em login/health, segredo por env, token só no keychain), IDOR responsável↔aluno (Adelaide no aluno do Gustavo = 403), validação/mass assignment, CPF/senha/token em log e resposta, mesma resposta 401, throttler, CORS por env, segredos, `DEMO_ENABLED`, dependências.
- `.claude/agents/qa.md`: subir API (migrate reset + start:dev) e app (`yarn ios`); integração com curl + sqlite3/prisma studio + `yarn test:e2e`; tela com `xcrun simctl io booted screenshot/recordVideo`, terminate/launch para sessão, comparação com `docs/figma/screens`; Maestro só se `which maestro`; Android/Docker/Maestro/push = NÃO TESTADO com motivo.

### Decisões
- Arquivos da pasta da tarefa ficam no checkout principal, não nos worktrees (escrito no PROTOCOLO), porque é assim que o plano e o ledger já estão sendo usados com três trilhas em paralelo.
- Designer ganhou `vercel-react-native-skills` no lugar das skills de Expo: é a skill do stack que cobre UI/animação/navegação RN.
- Mantive o `chief` e o `PushNotification` do original; troquei a menção à memória do projeto (`MEMORY.md`) pelo `CLAUDE.md` + brief, que é onde o contexto deste projeto mora; decisão permanente vai para `CLAUDE.md`.
- Nas descrições do `code-reviewer` e do `cyber-security`, troquei "Não corrige: aponta" por "Não corrige; aponta": o `: ` deixava o frontmatter YAML inválido num parser estrito (o original já tinha esse defeito).
- Base dos worktrees escrita como "a base que o plano indicar (padrão `main`)", porque nesta tarefa a base é `spec/fiap-school`.

### Verificação
Tarefa de documentação/configuração: não há teste unitário; a verificação é a do plano.

```
$ grep -rniE "safety|/SS|heroku|asaas|master|i18n|postgres|pushinpay|escrow|kyc" .claude/agents .claude/team/PROTOCOLO.md
(nenhuma saída) grep exit=1

$ # frontmatter dos 6 agents com js-yaml (parser estrito)
ok .claude/agents/chief.md
ok .claude/agents/code-reviewer.md
ok .claude/agents/cyber-security.md
ok .claude/agents/designer.md
ok .claude/agents/developer.md
ok .claude/agents/qa.md
```

Skills referenciadas nos frontmatters existem todas em `.claude/skills/`. `.claude/skills/`, brief e plano não foram tocados.

### Para o qa / pendências
- Nada a subir. Verificação manual possível: abrir `/squad` numa sessão nova e conferir que o chief cita `main`, trilhas e o ambiente local.
- Sem envs, migrations ou mudança nativa.
- O `CLAUDE.md` da raiz ainda diz que "os textos dos agents ... ainda citam Safety Swap" (parágrafo da seção "Como o time trabalha"); ficou fora do escopo da Tarefa 1 (arquivos: só agents e PROTOCOLO).

### Rodada 1

Achados de `03-review.md` (seção Tarefa 1), todos corrigidos em `ff99716`:

- **[IMPORTANTE 1] `main` fixo como base**: corrigido em `ff99716`. Os diffs de revisão e o `--stat` antes do PR passam a usar a BASE do ledger em `chief.md` (§4.3, §4 "Não confie no resumo"), `code-reviewer.md` (descrição, modo branch inteira, "Como revisar" passo 1, regressão "rodando contra a BASE") e `cyber-security.md` (passo 1). Em `chief.md` §5 e na seção "Git e PRs" do `PROTOCOLO.md`, entrou a regra: a branch de spec (`spec/fiap-school`) é o primeiro PR para `main`, os PRs das trilhas abrem para `main` só depois do merge dela, e todo diff de revisão usa a BASE do ledger.
- **[IMPORTANTE 2] caminho absoluto**: corrigido em `ff99716`. `developer.md` passa a usar `git worktree add .claude/worktrees/<trilha> ...`, rodado da raiz, e o `PROTOCOLO.md` diz só "aberto na raiz do repositório".
- **[SUGESTÃO 4] `/demo/grades`**: corrigido em `ff99716`. Em `cyber-security.md`, as rotas com `:id` (o guard lê `params.id`) ficaram separadas do `POST /demo/grades`, que tem o `studentId` no corpo e o ownership conferido no use case. O item pede para testar a Adelaide lançando nota no aluno do Gustavo.
- **[SUGESTÃO 5] "Leia antes"**: corrigido em `ff99716`. `CLAUDE.md` (raiz) entra no início do "Leia antes" de `designer.md`, `cyber-security.md` e `qa.md`.
- **[SUGESTÃO 3]**: o chief adiou (ledger); não foi mexida.

Verificação:

```
$ grep -rniE "safety|/SS|heroku|asaas|master|i18n|postgres|pushinpay|escrow|kyc" .claude/agents .claude/team/PROTOCOLO.md
(nenhuma saída) grep exit=1
$ grep -rn "/Users\|main\.\.\.\|diff main" .claude/agents .claude/team/PROTOCOLO.md
(nenhuma saída) exit=1
$ js-yaml no frontmatter dos 6 agents: ok nos 6
```

## Tarefa 3

- Trilha: api · worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/api` · branch `feat/api` · commit `e1cf9b7` (base `40c8577`). Sem remote, então não houve push.

### Versões
- NestJS **11.2.8** (gerado com `@nestjs/cli@11.0.24`, porque o `latest` já é o 12), `@nestjs/config` 4.0.4, TypeScript **5.9.3** com `strict: true` (o ts-jest 29 não aceita o TS 7), Jest 30, ESLint 9.
- Prisma **7.10.1** (o `latest` do npm é `8.0.0-rc`, então fixei a última estável), generator `prisma-client` com `moduleFormat = "cjs"` gerando em `src/generated/prisma` (no gitignore; o `postinstall` roda `prisma generate`), SQLite via `@prisma/adapter-better-sqlite3` 7.10.1 (better-sqlite3 12.11.1).
- `bcryptjs` 3 (bcrypt em JS puro, mesmo formato `$2b$`, sem build nativo no CI e no Docker), class-validator 0.15 e class-transformer 0.5, `tsx` para o seed e `dotenv` no `prisma.config.ts`.
- yarn **1.22.22**, fixado em `packageManager`.

### O que mudou (tudo em `api/`)
- `package.json`: scripts `lint`, `lint:fix`, `format`, `format:check`, `tsc`, `test`, `test:e2e`, `build`, `start:dev`, `prisma:{generate,migrate,deploy,seed,setup,reset,validate}`, além de `postinstall`. Config do jest com `watchman: false`.
- `tsconfig.json` passou a usar `strict: true`. O `tsconfig.build.json` compila só `src/`. O `tsconfig.jest.json` usa CJS só nos testes (ver decisões).
- `eslint.config.mjs` ignora `dist`, `coverage` e `src/generated`. O `.prettierrc` é o do scaffold.
- `.gitignore`: `node_modules`, `dist`, `coverage`, `src/generated`, `*.db*` e `.env*`, com exceção do `.env.example`.
- `.env.example`: `DATABASE_URL="file:./dev.db"`, `PORT=3333`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CORS_ORIGINS=*`.
- `prisma.config.ts`: schema, migrations, `seed: tsx prisma/seed.ts` e a URL lida de `DATABASE_URL`.
- `prisma/schema.prisma` e `prisma/migrations/20261027224531_init`: Guardian, Student, GuardianStudent (N:N), AgendaDay, Lesson, ReportCard (único por `studentId+year`) e TermResult (`grade Float?`, `absences Int?`), com IDs `cuid()` e cascade nas filhas.
- `prisma/seed-data/responsaveis.json` é uma cópia byte a byte de `docs/data/responsaveis.json`.
- `prisma/seed-mapper.ts` é puro e converte JSON em `{guardians, students}`. Ele divide `horario` em `startTime`/`endTime` (aceita `"HH:MM - HH:MM"` e recusa outros formatos), guarda `order` pela posição no JSON, converte o ano de string para int (recusa valor que não seja número), mantém nota e falta `null`, deixa o CPF só com dígitos, deduplica aluno por RM e exporta `GUARDIAN_WITHOUT_STUDENTS`.
- `prisma/seed.ts` gera o hash bcrypt (custo 10) e grava tudo numa transação que antes apaga os dados, então pode rodar de novo sem duplicar.
- `src/config/env.validation.ts` valida a env com class-validator (`validateEnv`, com padrões de PORT, JWT_EXPIRES_IN e CORS_ORIGINS) e tem `parseCorsOrigins` (`*` ou lista separada por vírgula).
- `src/infra/prisma/{prisma.service,prisma.module}.ts` montam o PrismaService global com o adapter, conectando no init e desconectando no destroy.
- `src/modules/health/{health.module,controllers/health.controller}.ts` atendem `GET /api/health` e devolvem `{status: "ok"}`.
- `src/app.setup.ts` tem o `configureApp(app)` com prefixo `api`, o ValidationPipe global (whitelist, forbidNonWhitelisted, transform), `enableCors` por env e shutdown hooks. O `main.ts` e os e2e usam essa mesma função.
- `src/app.module.ts` junta ConfigModule (global, com `validate`), PrismaModule e HealthModule. O `main.ts` escuta na `PORT`.
- `test/jest-e2e.json` e `test/setup/{global-setup,test-env,create-test-app}.ts`: o global setup apaga o `test.db`, roda `prisma migrate deploy` e `prisma db seed` com `DATABASE_URL=file:./test.db`, e o `test-env` fixa as envs dos workers.
- Testes novos: `prisma/seed-mapper.spec.ts`, `src/config/env.validation.spec.ts`, `test/health.e2e-spec.ts` e `test/seed.e2e-spec.ts`.
- Os arquivos de demonstração do scaffold (`app.controller`, `app.service` e os testes deles, o README do Nest) foram removidos.

### Decisões
- **`AgendaDay` no lugar de `Lesson.studentId + date`, que é o que está no brief.** O A4 pede os 7 dias com sábado e domingo em `lessons: []`. Com só `Lesson`, os dias 16/03 e 22/03 não ficariam no banco, e como estão nas pontas da semana também não dá para deduzir os dois a partir das outras datas. Então `AgendaDay {studentId, date}` (único por aluno e data) tem as `Lesson {startTime, endTime, subject, order}`. O contrato da API não muda.
- **`Device` ficou de fora**, porque é da Tarefa 16 e vai entrar numa migration própria.
- **Responsável sem aluno:** Carlos Sem Aluno, CPF **314.159.265-90** (`31415926590`), `carlos@example.com`, senha `111111`. O CPF tem dígitos verificadores válidos, conferidos no spec por um cálculo próprio que também valida os CPFs reais do JSON. O meu primeiro valor (`...-92`) estava errado e foi o teste que pegou.
- **Unicidade de `order` (`@@unique`)** em Lesson (por dia) e em TermResult (por boletim e trimestre), para a ordem do JSON ficar garantida no banco.
- **Jest com `tsconfig.jest.json` (module commonjs).** O client do Prisma 7 carrega o compilador WASM com `import()` dinâmico. Com `module: nodenext` o ts-jest preserva o `import()`, e o Jest exige `--experimental-vm-modules`. Compilar os testes em CJS transforma o `import()` em `require` e resolve. O build (`nest build`) continua em nodenext e roda normalmente, como mostra o smoke test abaixo. Também há um `moduleNameMapper` para os imports `.js` do client gerado.
- **`yarn prisma:reset` = `prisma migrate reset --force && prisma db seed`.** No Prisma 7 o reset não roda mais o seed sozinho. Criei também o `yarn prisma:setup` = `migrate deploy && db seed`, que é o caminho sem destruir nada para um clone novo (ou para o Docker na Tarefa 6).
- **Health em `src/modules/health/`** (decisão de arquitetura do chief) no lugar de `src/health`, como estava no plano. Por enquanto ele não consulta o banco, para seguir o contrato `{status: "ok"}`.
- **`configureApp` compartilhado**, para os e2e testarem o prefixo, o pipe e o CORS iguais aos de produção.

### TDD: falhas e sucessos
- `seed-mapper.spec.ts`, RED: `Cannot find module './seed-mapper' from 'prisma/seed-mapper.spec.ts'`. Primeiro GREEN: 22/23, com falha em `GUARDIAN_WITHOUT_STUDENTS ... CPF de dígitos verificadores válidos` (o CPF `31415926592` estava errado e virou `31415926590`). GREEN final: `Tests: 23 passed`.
- `env.validation.spec.ts`: escrevi o spec primeiro, mas rodei o RED só depois da primeira versão da implementação. Para registrar a falha, tirei o arquivo e rodei de novo: `Cannot find module './env.validation'`. Depois veio uma falha real, `Reflect.getMetadata is not a function` (faltava `import 'reflect-metadata'`), corrigida até `Tests: 10 passed`.
- e2e, RED 1: o global setup falhou com `Cannot find module .../prisma/seed.ts`. RED 2: `Cannot find module '../src/infra/prisma/prisma.service'` e `'./app.controller'`. RED 3: `A dynamic import callback was invoked without --experimental-vm-modules` (resolvido com o `tsconfig.jest.json`). GREEN: `Tests: 8 passed`.

### Verificação (`cd api`, com `YARN_IGNORE_PATH=1` nesta máquina, ver ressalva 1)
```
yarn format:check  -> All matched files use Prettier code style!
yarn lint          -> eslint "{src,test,prisma}/**/*.ts"   Done (0 erros, 0 avisos)
yarn tsc           -> tsc --noEmit   Done
yarn test          -> Test Suites: 2 passed; Tests: 33 passed
yarn test:e2e      -> Test Suites: 2 passed; Tests: 8 passed
yarn build         -> nest build   Done
yarn prisma:validate -> The schema at prisma/schema.prisma is valid
yarn prisma:reset  -> BLOQUEADO pelo checkpoint de agente de IA do Prisma (ver ressalva 2)
```
Equivalente que não destrói dados, num arquivo novo (`DATABASE_URL=file:./verify.db yarn prisma:setup`): migration aplicada, `Seed concluído: 3 responsáveis e 3 alunos.` No sqlite3 ficaram Guardian 3, Student 3, AgendaDay 21, Lesson 90, ReportCard 4 e TermResult 143 (36+36+36+35), com os 3 hashes começando por `$2b$`. Rodei `yarn prisma:seed` duas vezes seguidas no `dev.db` sem erro e sem duplicar.
Smoke: `PORT=3399 node dist/main` → `GET /api/health` = `{"status":"ok"}`, e `GET /health` = 404.

### Como o qa sobe e testa
```
cd api
cp .env.example .env
YARN_IGNORE_PATH=1 yarn install        # roda prisma generate (também funciona sem .env)
YARN_IGNORE_PATH=1 yarn prisma:setup   # banco novo: migrate deploy + seed (ou prisma:reset, com consentimento)
YARN_IGNORE_PATH=1 yarn start:dev      # http://localhost:3333/api/health
YARN_IGNORE_PATH=1 yarn test:e2e       # usa api/test.db, recriado a cada execução
```
Contas do seed: Gustavo `969.294.560-04` / `123456` (Rafael e Joana), Adelaide `508.795.670-07` / `987654` (Bianca), Carlos `314.159.265-90` / `111111` (sem aluno). Login ainda não existe (é a Tarefa 4).

### Pendências de deploy e ambiente
- Uma migration nova (`init`). Não há env nova além das cinco do `.env.example`, e não há mudança nativa.

### Ressalvas
1. **Yarn nesta máquina:** `/Users/fael_st/workspace/` (fora do repo) tem um `package.json` com `packageManager: yarn@3.6.4` e um `.yarnrc.yml` com `yarnPath` (os timestamps são de 2026-10-27 19:38; não fui eu que criei e não mexi). Por causa disso, `yarn` dentro de `api/` vira o yarn 3 e falha com "nearest package directory isn't part of the project". O yarn 1 só roda com `YARN_IGNORE_PATH=1` na frente. Num clone fora dessa pasta (e no CI) isso não acontece. Na Tarefa 2, o `package.json` da raiz pode fixar `packageManager: yarn@1.22.22` também.
2. **`yarn prisma:reset` não foi executado:** o Prisma 7 bloqueia `migrate reset` quando detecta um agente de IA e só libera com o consentimento explícito do usuário (`PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`). A mensagem do chief não conta como consentimento, então não contornei o bloqueio. O mesmo caminho (migrations do zero + seed) foi verificado com `prisma:setup` num banco novo e no global setup do e2e. Se o usuário autorizar, o comando a rodar é `cd api && yarn prisma:reset`, que apaga só o `api/dev.db` local.
3. O modelo de dados do brief (seção 4) muda: entra `AgendaDay`, como explicado em Decisões. Vale atualizar o brief.

### Rodada 1

Commit `c8df872` (`fix(api): generate sem .env e disciplina única por trimestre`), na branch `feat/api`.

1. **[BLOQUEANTE] `env('DATABASE_URL')` derrubava o postinstall sem `.env`:** corrigido em `c8df872`. O `prisma.config.ts` agora usa `process.env.DATABASE_URL ?? 'file:./dev.db'`; `migrate` e `seed` continuam lendo a env real quando ela existe.
   - Antes da correção, numa cópia de `prisma/` + `prisma.config.ts` sem `.env`, `env -u DATABASE_URL prisma generate` deu `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL.` e `EXIT=1`.
   - Depois da correção, na mesma cópia: `✔ Generated Prisma Client (7.10.1)` e `EXIT=0`.
   - Clone limpo (cópia de `api/` sem `node_modules`, `.env`, `*.db`, `dist` e `src/generated`): `env -u DATABASE_URL YARN_IGNORE_PATH=1 yarn install --frozen-lockfile` mostrou `✔ Generated Prisma Client ...` e `Done in 33.82s.`, com `EXIT=0`, e gerou `src/generated/prisma/client.ts`.
2. **[SUGESTÃO aceita] `@@unique([reportCardId, term, subject])` em `TermResult`:** corrigido em `c8df872`, dentro da própria migration `init`. Regerei o SQL com `prisma migrate diff --from-empty --to-schema` e mantive a mesma pasta. A única diferença para a versão anterior é o `CREATE UNIQUE INDEX "TermResult_reportCardId_term_subject_key"`. Não rodei `migrate reset`.
   - Teste novo em `test/seed.e2e-spec.ts`: "não aceita a mesma disciplina duas vezes no mesmo trimestre".
   - RED, com schema e migration antigos (`git stash`): `Received promise resolved instead of rejected`, `Tests: 1 failed, 8 passed, 9 total`.
   - GREEN: `Tests: 9 passed, 9 total`.
   - Num banco novo (`DATABASE_URL=file:./r1.db`), `yarn prisma:setup` aplicou a `init` e o seed terminou com `Seed concluído: 3 responsáveis e 3 alunos.`. Rodei o seed de novo e deu ok. O banco ficou com TermResult 143 e os índices `..._term_order_key` e `..._term_subject_key`. `prisma migrate diff --from-config-datasource --to-schema --exit-code` saiu com 0, então não há drift entre a migration e o schema.
   - Atenção: um `api/dev.db` criado antes deste commit tem o checksum antigo da `init`. Ele precisa ser recriado com `yarn prisma:reset` (com o consentimento do usuário) ou apagado e montado de novo com `yarn prisma:setup`. O arquivo está no gitignore.
3. **Roteiro do qa:** corrigido neste arquivo. O `cp .env.example .env` agora vem antes do `yarn install`.
4. **[SUGESTÃO] O RED do `env.validation.spec` veio depois da implementação:** concordo e não há nada a refazer aqui. Nas próximas tarefas, rodo o spec antes de escrever a classe.

Verificação completa depois da rodada (`cd api`, `YARN_IGNORE_PATH=1`):
```
yarn lint            -> ok
yarn tsc             -> ok
yarn test            -> Test Suites: 2 passed; Tests: 33 passed
yarn test:e2e        -> Test Suites: 2 passed; Tests: 9 passed
yarn build           -> ok
yarn prisma:validate -> The schema at prisma/schema.prisma is valid
```

## Tarefa 2 — Tooling da raiz

Worktree `.claude/worktrees/tooling`, branch `chore/tooling`, commit `45dcc6f` (`chore(ci): husky, commitlint e lint-staged na raiz`).

### O que mudou
- `package.json`: `private`, nome `fiap-school`, devDependencies husky 9.1.7, @commitlint/cli e config-conventional 21.2.4, lint-staged 17.6.0; scripts `prepare: husky` e `commitlint`. `yarn.lock` gerado (yarn 1).
- `.husky/commit-msg` (`yarn commitlint --edit "$1"`) e `.husky/pre-commit` (`npx lint-staged`), executáveis.
- `commitlint.config.js`: config-conventional; `scope-enum` em warning (api, mobile, ci, docs, spec, squad, deps, release); `subject-case` desligado.
- `.lintstagedrc.js`: função por pasta; roda `yarn --cwd api|mobile eslint --fix` + `prettier --write`; se a pasta não tem `package.json` ou `node_modules/.bin`, ignora sem falhar (avisa no segundo caso).
- `.nvmrc` (24), `.editorconfig`, `.github/workflows/commitlint.yml` (pull_request, fetch-depth 0, Node da `.nvmrc`, `yarn install --frozen-lockfile`, `npx commitlint --from base.sha --to head.sha --verbose`).
- `README.md`: esqueleto com credenciais; `.gitignore`: `node_modules/`; `CLAUDE.md`: removido o parágrafo do Safety Swap, acrescentada linha sobre husky/commitlint.

### Verificação
```
ANTES de configurar: echo "bad msg" | yarn commitlint -> "commitlint: command not found" (exit 127)
DEPOIS:
echo "bad msg" | yarn commitlint            -> subject-empty, type-empty; exit=1
echo "feat(api): adiciona rota" | yarn commitlint -> passa; exit=0
echo "feat(xyz): adiciona rota" | yarn commitlint -> warning scope-enum, exit=0
lint-staged com api/x.ts staged e api sem package.json -> "Done", exit=0
Commit da tarefa pelo hook: pre-commit "no staged files matching" + commit-msg "Done" (commit 45dcc6f criado)
git commit --allow-empty -m "bad" -> "husky - commit-msg script failed (code 1)"; nenhum commit criado (git log segue em 45dcc6f)
```
Não testado: o caminho do lint-staged com `api/`/`mobile/` reais (não existem nesta branch); validar quando as trilhas mergearem.

### Ressalvas / ambiente
- Nesta máquina existe um projeto yarn 3.6.4 perdido em `/Users/fael_st/workspace/{package.json,.yarnrc.yml,.yarn}` que captura qualquer pasta abaixo; o `yarn` 1.22 global delega a ele e falha. Usei um shim de yarn 1 com `SKIP_YARN_COREPACK_CHECK=1 YARN_IGNORE_PATH=1`. Não mexi nesses arquivos. Isso afeta o checkout real do usuário (e os hooks, que chamam `yarn`); remover o projeto perdido de `workspace/` resolve. No CI não há o problema.
- Nada nativo, sem envs, sem migrations.
- Sem testes unitários (tooling); verificação acima.

## Mensagens
→ chief (usuário): o projeto yarn 3.6.4 em `/Users/fael_st/workspace` quebra `yarn` em todo o repo fiap; vale remover ou ajustar antes de rodar os hooks na máquina.
→ code-reviewer: revisar `.lintstagedrc.js` (path de `api/` e `mobile/` ainda não existem) e o workflow `commitlint.yml`.

### Complemento (pedido do chief)
- `package.json` ganhou `"packageManager": "yarn@1.22.22"` e o README, uma seção Troubleshooting sobre o yarn 3 capturando o repo a partir de `~/workspace` (contorno `YARN_IGNORE_PATH=1`). Commits `7e73352` e `b3c9dc0` (este atualiza o `yarn.lock` para `husky ^9.1.7`; antes do ajuste `yarn install --frozen-lockfile` falhava, depois passa).
- O `yarn` do PATH continuou caindo no yarn 3 mesmo com `packageManager`; todos os meus comandos rodaram com `YARN_IGNORE_PATH=1` (+ `SKIP_YARN_COREPACK_CHECK=1`, por causa do `packageManager: yarn@3.6.4` do projeto externo) via shim. Nada fora do repo foi alterado.
- Recheck: `bad msg` -> exit 1; `feat(api): x` -> exit 0.
- **Push não feito**: o repositório não tem remote configurado (`git remote -v` vazio); `git push` falha com "Could not read from remote repository". Commits ficam locais em `chore/tooling` (HEAD `b3c9dc0`).

### Rodada 1 (Tarefa 2)

Commit `414cb6b`. Todas as provas abaixo foram rodadas SEM shim e SEM `YARN_IGNORE_PATH` (o `yarn` do PATH é o yarn 3 e falha com `Internal Error ... not present in your lockfile`, confirmado).

- **[BLOQUEANTE] hooks dependiam do yarn**: corrigido em `414cb6b`. `.husky/commit-msg` = `commitlint --edit "$1"`; `.husky/pre-commit` = `npx --no-install lint-staged`; o lint-staged não chama mais yarn. Prova: o commit `414cb6b` passou pelos dois hooks com o yarn 3 ativo; `git commit --allow-empty -m "bad"` saiu com "husky - commit-msg script failed (code 1)" e nenhum commit foi criado.
- **[IMPORTANTE] lint-staged**: corrigido em `414cb6b`. Api: só `eslint --fix --no-warn-ignored`; mobile: `eslint --fix` e `prettier --write`; cada um roda com `sh -c 'cd <pasta> && ./node_modules/.bin/...'` (a pasta como cwd, para o eslint achar a config). Testado com uma cópia da `api/` real (src, eslint.config.mjs, node_modules linkado) e um arquivo ruim staged: o eslint da api rodou, reportou `no-unused-vars` em `zz-tmp.ts` e o commit foi barrado (exit 1), sem warning "File ignored". Mobile real não testado (só o caminho sem `node_modules`). Desvio do plano (eslint/prettier direto em vez de `yarn lint`/`format`): registrado aqui, conforme a decisão do ledger.
- **[IMPORTANTE] pular lint em silêncio**: corrigido em `414cb6b`. Pasta sem `node_modules` não falha, mas imprime `!! lint-staged: mobile/node_modules não existe, LINT PULADO ... Rode "yarn install" em mobile/` (testado, exit 0). `CLAUDE.md` e README (seção Instalação) mandam instalar na raiz, em `api/` e em `mobile/`.
- **[IMPORTANTE] Troubleshooting**: corrigido em `414cb6b`, com o erro real, a explicação de que os hooks não usam yarn e `export YARN_IGNORE_PATH=1` (ou prefixo por comando).
- **[SUGESTÃO] permissions**: corrigido em `414cb6b` (`permissions: contents: read`).
- **[SUGESTÃO] CLAUDE.md fora do escopo**: a Tarefa 1 já adaptou os agents na mesma branch, então a remoção do parágrafo é coerente; o pedido do chief inclui o arquivo.
- Push continua impossível (sem remote).

## Tarefa 7 — Mobile: scaffold e design system

Worktree `.claude/worktrees/mobile`, branch `feat/mobile`, último commit `bd67851`.
Commits: `52649c8` (scaffold RN CLI), `589c2f3` (expo modules + metro sem watchman),
`cb16f21` (tema Restyle + jest), `bd67851` (navegação, splash, Montserrat).
Push não feito: o repositório não tem remote.

### Versões
| Pacote | Versão |
|---|---|
| react-native / react | 0.88.0 / 19.3.0 (`@react-native-community/cli` 20.2.0) |
| expo (Expo Modules, via `install-expo-modules@0.18.2`) | 58.0.19 (expo-modules-core 58.0.26) |
| @shopify/restyle | 2.4.5 |
| @react-navigation/native / native-stack / bottom-tabs | 7.5.1 / 7.21.0 / 7.21.0 |
| react-native-screens / safe-area-context / gesture-handler | 4.30.0 / 5.10.1 / 3.3.0 |
| react-native-reanimated / react-native-worklets | 4.7.1 / 0.13.0 |
| react-native-bootsplash | 7.3.4 |
| jest / @testing-library/react-native / test-renderer | 29.7.0 / 14.1.0 / 1.3.1 |
| typescript | 6.0.3 (strict, pelo `@react-native/typescript-config`) |
| yarn (fixado em `mobile/`) | 4.18.1 (`yarnPath` + `nodeLinker: node-modules`) |

As versões nativas são as do `bundledNativeModules.json` do Expo 58, para casar com o expo-updates/expo-notifications das Tarefas 15 e 16.

### O que mudou (tudo em `mobile/`)
- `init` do RN CLI: `FiapSchool`, bundle/applicationId `br.com.fiap.school`, nome "FIAP School" (Info.plist, `strings.xml`, `app.json`). O template `App.tsx`, `__tests__/` e `@react-native/new-app-screen` foram removidos.
- `.yarnrc.yml`, `.yarn/releases/yarn-4.18.1.cjs`, `packageManager` e `yarn.lock` próprios do `mobile/`.
- Expo Modules: `install-expo-modules` mexeu em Podfile (iOS 16.4), `babel.config.js` (`babel-preset-expo`), `metro.config.js` (`expo/metro-config`), gradle, `MainApplication.kt` e `MainActivity.kt`.
- `ios/FiapSchool/AppDelegate.swift` e `SceneDelegate.swift`: reescritos pelo template do Expo 58 (`ExpoAppDelegate` + `ExpoReactNativeFactoryProvider`, `ExpoAppSceneDelegate`), com o módulo `FiapSchool`, bundle `index` e o `RNBootSplash.initWithStoryboard` no `customize`.
- `metro.config.js`: `resolver.useWatchman = false`; `.watchmanconfig` removido.
- `src/theme/`: `palette.ts`, `fonts.ts`, `sizes.ts`, `motion.ts`, `theme.ts` (createTheme: colors, spacing, borderRadii, breakpoints, textVariants, buttonVariants, cardVariants, sizes, motion), `components.ts` (`Box`, `Text`, `Card`), `useTheme.ts`, `index.ts`.
- `src/navigation/`: `types.ts` (param lists e `ReactNavigation.RootParamList`), `RootStack.tsx` (native-stack Login → App, SelectStudent `fullScreenModal` + `slide_from_bottom`, `animation: 'fade'`), `AppTabs.tsx` (bottom-tabs Agenda/Boletim com cores do tema; a tab bar do Figma é a Tarefa 10).
- `src/app/App.tsx` (GestureHandlerRootView, SafeAreaProvider, ThemeProvider, StatusBar clara) e `src/app/Navigation.tsx` (NavigationContainer com tema escuro do Restyle; `BootSplash.hide({fade: true})` no `onReady`).
- `src/components/PlaceholderScreen.tsx` e as 4 telas placeholder em `src/features/{auth,lessons,report-card,students}` com os testIDs da seção 7 do design (`login-screen`, `agenda-screen`, `boletim-screen`, `select-student-screen` e os botões).
- Fontes: `assets/fonts/Montserrat-{Regular,Medium,SemiBold,Bold}.ttf`, `react-native.config.js` (`assets`) e `yarn link:assets` (react-native-asset): `android/app/src/main/assets/fonts/`, `UIAppFonts` no Info.plist, recursos no Xcode. Licença em `assets/licenses/Montserrat-OFL.txt` (fora da pasta linkada, senão vira asset do app).
- Splash: `react-native-bootsplash generate` a partir de `assets/logo-fiap-school.png` (cópia de `docs/figma/assets/logo-login.png`), fundo `000000`: iOS `BootSplash.storyboard` (logo 306), Android `BootTheme` + `drawable-*/bootsplash_logo.png` (logo 180), `RNBootSplash.init` e `RNScreensFragmentFactory` no `MainActivity.onCreate`.
- `Info.plist`: `UIViewControllerBasedStatusBarAppearance=false` e `UIStatusBarStyle=LightContent` (com `true`, o `<StatusBar barStyle>` era ignorado e o RN avisava `RCTStatusBarManager is a no-op`).
- Jest: `jest.config.js` (transformIgnorePatterns para `react-native-*`, `@react-navigation`, restyle, expo), `jest/resolver.js` (encadeia o resolver do preset do RN com o do reanimated/worklets), `jest.setup.ts` (mocks de worklets, reanimated, safe-area-context e bootsplash; o gesture-handler usa o `jestSetup.js` dele).
- Scripts: `lint`, `format`, `format:check`, `tsc`, `test`, `ios`, `android`, `start`, `link:assets`. `.prettierignore` e `.eslintignore`.

### Decisões
1. **RN 0.88.0, não 0.88.1:** o 0.88.1 saiu hoje (2026-10-27) e o yarn 4 deixa pacote com menos de 24 h em quarentena (`npmMinimalAgeGate`). Mantive a proteção e usei o 0.88.0 (de 15/10). Expo SDK 58 é o par do RN 0.88 na tabela do `install-expo-modules`.
2. **Yarn 4 fixado dentro do `mobile/`** (`yarnPath`), em vez do yarn 1 da raiz e da `api/`. Com isso, `yarn` funciona no `mobile/` sem `YARN_IGNORE_PATH`, mesmo com o projeto yarn 3 em `~/workspace` (o `.yarnrc.yml` mais próximo vence). No CI e no clone do avaliador, qualquer yarn delega ao release commitado. Ver Mensagens: se o chief quiser yarn 1 em tudo, troco.
3. **AppDelegate/SceneDelegate do Expo 58:** o template do RN 0.88 já usa ciclo de vida por cena, e o `install-expo-modules` só trocou a classe do AppDelegate. O build quebrava (`overriding declaration requires an 'override' keyword`) e o SceneDelegate do RN não usaria a factory do Expo. Segui o template do próprio pacote `expo` (`template.tgz`), mantendo o módulo `FiapSchool` e o bundle `index`.
4. **Tema** igual à seção 1 do `01-design.md` (nomes, valores, `inputLine` em `#5C5C5C`, `transparent`, `greetingName`, `labelFocused`, `termTitle`, `captionPlain`, `detail`, `inputValue` responsivo). `sizes` e `motion` são chaves extras do tema e ficam também exportadas soltas. `motion` importa o `Easing` do reanimated.
5. **`Card`** (createRestyleComponent + `cardVariants`) entrou já nesta tarefa, porque o D4 coloca as variantes de card no tema. O `Button` fica para a Tarefa 9 (precisa de Pressable + estados); as `buttonVariants` já estão no tema.
6. **Splash Android com logo de 180dp** e iOS com 306: o bootsplash se recusa a gerar acima de 192dp no Android (o Android 12+ corta o ícone num círculo de 192). Com 180×29 os cantos ficam dentro do círculo (raio 91 < 96). O aviso "exceeds 134x134dp" do gerador diz respeito ao quadrado inscrito e não se aplica a um logo largo e baixo.
7. A rota inicial é fixa em `Login`. O placeholder do Login tem "ENTRAR" (vai para as abas), a Agenda tem "TROCAR PERFIL" (abre o modal) e o Boletim tem "SAIR" (volta ao Login), só para dar para navegar até as Tarefas 8 a 12.

### Testes (TDD)
- `src/theme/__tests__/Text.test.tsx` (variante `sectionTitle` → `#29F4D5`, `Montserrat-Bold`, 20).
  RED: `Cannot find module '..' from 'src/theme/__tests__/Text.test.tsx'` (o tema não existia).
  Depois da implementação, duas falhas de ambiente, já corrigidas: reanimated sem transform (`Cannot use import statement outside a module`, corrigido no `transformIgnorePatterns`) e `[Reanimated] setCSSEventHandler is not available in JSReanimated` (corrigido com o resolver encadeado). Depois veio `` `render` function has not been called ``: a RNTL 14 tem `render` assíncrono, e o teste passou a usar `await render`.
  GREEN: `✓ aplica cor primary, Montserrat Bold e tamanho 20 na variante sectionTitle`.
  Mutação: com `sectionTitle.color = 'text'`, o teste falha com `- "color": "#29F4D5"  + "color": "#FFFFFF"`.
- `src/theme/__tests__/Card.test.tsx` (`studentSelected` com borda `primary` 1px, raio 8, altura 90, fundo `surfaceRaised`; `student` com borda `transparent`).
  RED: `Element type is invalid: expected a string ... but got: undefined` (o `Card` não existia), 2 falhas. GREEN: 2 passam.
- `src/app/__tests__/App.test.tsx` (abre no Login, chama `BootSplash.hide({fade: true})`, Login → Agenda → modal SelectStudent). Escrito **depois** da navegação, porque é a fiação dos navegadores, sem regra de negócio. Para provar que ele pega a falha, tirei o `onReady`: `✕ abre no Login e esconde a splash nativa...` e o outro passa.

### Verificação (fresca, `cd mobile`)
```
yarn lint          -> exit 0 (0 erros, 0 avisos)
yarn tsc           -> exit 0
yarn test          -> Test Suites: 3 passed; Tests: 5 passed
yarn format:check  -> All matched files use Prettier code style!
cd ios && pod install -> Pod installation complete! There are 105 dependencies from the Podfile and 104 total pods installed.
xcodebuild -workspace FiapSchool.xcworkspace -scheme FiapSchool -configuration Debug \
  -sdk iphonesimulator -destination 'id=1E7DEFC7-963D-47CD-82A7-224BC5EAD850' \
  -derivedDataPath build/DerivedData build   -> ** BUILD SUCCEEDED **
simctl install + launch br.com.fiap.school no iPhone 16 (iOS 18.1) com Metro (yarn start, sem watchman)
```
- Splash nativa aparece (logo sobre preto) e some quando a navegação monta. O app cai no placeholder do Login com fundo `#000`, título `sectionTitle` em teal e corpo em Montserrat. Evidência: `evidencias/tarefa-7-ios.png`.
- Console do app lido por CDP (Metro `/json/list` → inspector): só `Running "FiapSchool"`, sem warning nem erro, depois da correção da status bar.
- O `-destination 'name=iPhone 16'` falha nesta máquina, porque o iPhone 16 só existe no runtime iOS 18.1 e o xcodebuild procura em `OS:latest` (27.0). Use o id, ou `yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850`.
- Na primeira vez, um aviso de `act(...)` apareceu 2 vezes no `yarn test`. Ele não voltou em 14 execuções seguidas. Pode ser timer da animação `fade` das tabs. Fica anotado caso volte no CI.

### Como o qa sobe e testa
```
cd mobile
yarn install                     # yarn 4 do próprio mobile/, sem YARN_IGNORE_PATH
cd ios && pod install && cd ..
yarn start                       # Metro na 8081, sem watchman
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850   # ou xcodebuild como acima
```
Não precisa de API nem de conta nesta tarefa. Roteiro na tela: splash → Login (placeholder) → ENTRAR → Agenda (abas AGENDA/BOLETIM) → TROCAR PERFIL (modal de baixo para cima) → FECHAR → aba BOLETIM → SAIR → Login.
Sem teste unitário de tela além dos 3 arquivos acima: a entrada animada (FadeInDown) e a splash só dá para conferir no simulador.

### Pendências de deploy / nativo / ambiente
- Tudo nesta tarefa é nativo (Expo Modules, reanimated, screens, gesture-handler, bootsplash, fontes): depois de puxar a branch, rode `pod install` e faça build nativo de novo.
- **Android não foi buildado** (a máquina não tem JDK/SDK). Estão configurados: fontes em `android/app/src/main/assets/fonts`, `BootTheme` + drawables, `RNBootSplash.init`, `RNScreensFragmentFactory` e o gradle do Expo. A primeira prova vem com o CI (Tarefa 13).
- Sem envs e sem migrations.

### Ressalvas
1. **Logo da splash em PNG ampliado:** a fonte é o `logo-login.png` de 250×40, e o iOS @3x pede 918 px, então o logo sai borrado (dá para ver no simulador). Tentei exportar o nó `4001:4` em vetor pelo MCP do Figma, mas a conta bateu o limite do plano Starter. Com o SVG em mãos, basta rodar `npx react-native-bootsplash generate <svg> --platforms=android,ios --background=000000 --logo-width=306 --assets-output=assets/bootsplash` (e repetir só para android com `--logo-width=180`).
2. O brief (D11) fala em reanimated 3. O RN 0.88 e o Expo 58 pedem o reanimated **4** (com `react-native-worklets`), que é o que entrou. A API de `entering`/`useSharedValue` é a mesma.
3. O `LaunchScreen.storyboard` do template ficou no projeto, mas fora de uso (o Info.plist aponta para `BootSplash`). Dá para remover depois sem impacto.

### Mensagens
→ chief: o `mobile/` usa **yarn 4.18.1 fixado** (`yarnPath`), e a raiz e a `api/` usam yarn 1.22.22. Com isso, o `yarn` funciona no mobile sem contorno nesta máquina, e qualquer yarn global (1 ou berry) delega ao release commitado, inclusive no CI. Se preferir yarn 1 em tudo por uniformidade, eu troco: é o `yarn.lock` e o `.yarnrc.yml` do mobile.
→ chief (usuário): pedir o logo da capa (`4001:4`) em SVG para a splash, para o login e para a barra. O MCP do Figma recusou por limite de plano.
→ chief: mudança nativa grande nesta tarefa (ver Pendências). O Android só vai ser validado no CI.
→ code-reviewer: vale olhar o `ios/FiapSchool/AppDelegate.swift` e o `SceneDelegate.swift` (reescritos à mão a partir do template do Expo 58) e o `jest/resolver.js`.

### Rodada 1

Commit `6df8b24` (`fix(mobile): força o tema escuro e limpa restos do template nativo`), em cima de `bd67851`.

- **[IMPORTANTE] modo escuro não forçado**: corrigido em `6df8b24`.
  - iOS: `UIUserInterfaceStyle = Dark` no Info.plist. Prova: com o simulador em modo claro (`xcrun simctl ui ... appearance` → `light`), o app responde `dark` no `nativeModuleProxy.Appearance.getColorScheme()` (lido por CDP no Metro).
  - Android: `AppCompatDelegate.setDefaultNightMode(MODE_NIGHT_YES)` no `MainApplication.onCreate` (antes do `loadReactNative`), para o `isDarkMode` do RN edge-to-edge ficar `true`. No `AppTheme`: `android:enforceNavigationBarContrast` e `android:enforceStatusBarContrast` em `false` (`tools:targetApi="29"`) e `android:windowBackground` preto (evita o branco entre a splash e o primeiro frame). ⚠️ Não foi buildado (sem JDK). O `androidx.appcompat` vem transitivo do `react-android` (o `ReactActivity` é um `AppCompatActivity`). A prova fica com o CI (Tarefa 13) ou com o qa num aparelho em modo claro.
- **[SUG] `settings.gradle`**: corrigido em `6df8b24`. Agora é o arquivo do `template.tgz` do Expo 58, trocando só o `rootProject.name` para `br.com.fiap.school`. O gradle-plugin do RN é resolvido por `require.resolve` no `pluginManagement`, e o `includeBuild` aparece uma vez só no fim (`expoAutolinking.reactNativeGradlePlugin`), além do `EXPO_USE_COMMUNITY_AUTOLINKING`. ⚠️ Também sem build local.
- **[SUG] restos do template**: corrigido em `6df8b24`. Info.plist sem `NSLocationWhenInUseUsageDescription` e com `CFBundleDevelopmentRegion = pt-BR`. O projeto ficou com `developmentRegion = "pt-BR"` e `pt-BR` em `knownRegions`. O `LaunchScreen.storyboard` foi apagado e saiu das 4 referências do `project.pbxproj` (`plutil -lint` OK; o `UILaunchStoryboardName` já era `BootSplash`). O `mobile/README.md` foi reescrito: yarn 4 do próprio mobile, `pod install`, `yarn start` sem watchman e `yarn ios --udid`.
- **[SUG] `palette` no barrel**: corrigido em `6df8b24`. Saiu do `src/theme/index.ts`, e só o `theme.ts` importa `./palette` (grep sem outro uso).
- **[SUG] `hitSlop` literal**: corrigido em `6df8b24`. Agora é `hitSlop={spacing.s}` via `useTheme()`.

Verificação (fresca, `cd mobile`):
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn test          -> Test Suites: 3 passed; Tests: 5 passed
yarn format:check  -> All matched files use Prettier code style!
cd ios && pod install -> Pod installation complete! 105 dependencies, 104 pods
xcodebuild ... -destination 'id=1E7DEFC7-963D-47CD-82A7-224BC5EAD850' build -> ** BUILD SUCCEEDED **
app reinstalado (uninstall + install) e aberto com Metro: console só com `Running "FiapSchool"`, sem warning
```
Evidência: `evidencias/tarefa-7-ios-r1.png` (simulador em modo claro e app escuro, com status bar clara). Não há teste unitário novo: as mudanças são de configuração nativa e de texto. A ressalva 3 da entrega (LaunchScreen) deixou de existir.

## Tarefa 4

- Trilha: api · worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/api` · branch `feat/api` · commit `a5d38ab` (`feat(api): login com JWT, guard global e rate limit`), base `c8df872`. Não há remote, então o `git push` falha ("Could not read from remote repository") e o commit fica só local.

### Versões novas
`@nestjs/jwt` 11.0.2, `@nestjs/passport` 11.0.5, `passport` 0.7.0, `passport-jwt` 4.0.1, `@nestjs/throttler` 6.7.1 e `@types/passport-jwt` 4.0.1 (dev).

### O que mudou (tudo em `api/`)
- `src/modules/auth/auth.module.ts`: registra `JwtModule` (HS256, segredo e validade lidos da env), `PassportModule`, `ThrottlerModule` (limite e janela lidos da env, mensagem em pt-BR), os providers por token (`GUARDIANS_REPOSITORY`, `PASSWORD_HASHER`), o `JwtStrategy` e o `JwtAuthGuard` como `APP_GUARD`.
- `src/modules/auth/controllers/auth.controller.ts`: `POST /api/auth/login`, com `@Public()`, `@UseGuards(ThrottlerGuard)` e `@HttpCode(200)`. Só repassa para o use case.
- `src/modules/auth/dto/login.dto.ts`: `cpf` passa por `@Transform(normalizeCpf)` e `@IsCpf()`; `password` usa `@Length(1, 128)`, com uma mensagem só. O DTO é importado como valor no controller.
- `src/modules/auth/use-cases/login.use-case.ts`: `LoginUseCase.execute({cpf, password})` devolve `{accessToken, guardian: {id, firstName, lastName}}`. Exporta `INVALID_CREDENTIALS_MESSAGE` e `AccessTokenPayload {sub}`.
- `src/modules/auth/repositories/guardians.repository.ts`: interface `GuardiansRepository.findCredentialsByCpf` e o token. `prisma-guardians.repository.ts` implementa com `findUnique` e um `select` só dos campos usados.
- `src/modules/auth/services/password-hasher.ts`: interface `PasswordHasher`, a implementação `BcryptPasswordHasher` (bcryptjs) e `DUMMY_PASSWORD_HASH`, um hash bcrypt de custo 10 de um texto aleatório que foi descartado.
- `src/modules/auth/strategies/jwt.strategy.ts`: passport-jwt com Bearer, `ignoreExpiration: false` e `algorithms: ['HS256']`. `validate` devolve `{id: sub}` e recusa um `sub` vazio ou que não seja string.
- `src/shared/decorators/public.ts`: `@Public()` com `IS_PUBLIC_KEY`, para método ou classe.
- `src/shared/decorators/current-guardian.ts`: `@CurrentGuardian()` devolve o `AuthenticatedGuardian {id}` de `request.user`. Sem usuário, lança 401.
- `src/shared/decorators/is-cpf.ts`: `isCpf`, `normalizeCpf`, `IsCpf()` (mensagem "CPF inválido.") e `CPF_INVALID_MESSAGE`.
- `src/shared/guards/jwt-auth.guard.ts`: `AuthGuard('jwt')` que deixa passar as rotas `@Public()` (lidas do handler ou da classe).
- `src/modules/health/controllers/health.controller.ts`: ganhou `@Public()`, como o review da Tarefa 3 apontou.
- `src/app.module.ts`: importa o `AuthModule`.
- `src/config/env.validation.ts`: `JWT_EXPIRES_IN` agora é validado (`^\d+(ms|s|m|h|d|w|y)?$`). Entram `LOGIN_THROTTLE_LIMIT` (padrão 5) e `LOGIN_THROTTLE_TTL_MS` (padrão 60000), as duas inteiras e ≥ 1.
- `.env.example`: comentário sobre o formato do `JWT_EXPIRES_IN` e as duas envs do rate limit.
- `test/setup/create-test-app.ts`: aceita `controllers` extras, que só existem nos testes.
- `test/setup/protected-probe.controller.ts`: rota protegida mínima, só para os e2e. `GET /api/e2e-protected` devolve o `@CurrentGuardian()`, e `GET /api/e2e-protected/ping` não usa o decorator, para que o 401 dali só possa vir do guard. Ela não entra no app de produção.
- `test/setup/test-env.ts`: `LOGIN_THROTTLE_LIMIT=1000` nos e2e (ver decisões).
- Testes novos: `src/shared/decorators/is-cpf.spec.ts`, `src/modules/auth/use-cases/login.use-case.spec.ts`, `src/shared/guards/jwt-auth.guard.spec.ts`, `src/modules/auth/strategies/jwt.strategy.spec.ts`, `test/auth.e2e-spec.ts` e `test/auth-throttle.e2e-spec.ts`. O `src/config/env.validation.spec.ts` ganhou casos.

### Decisões
- **`PasswordHasher` por interface e token**, em vez de chamar o bcryptjs direto no use case. Assim o spec confirma que, quando o CPF não existe, a comparação roda contra o `DUMMY_PASSWORD_HASH` (com o mesmo custo 10 do seed). O spec usa o bcrypt real, com um hash de custo 4 para ser rápido, e não um mock. O `JwtService` do spec também é o real, e o token gerado é verificado.
- **O formato do CPF é estrito:** só 11 dígitos ou a máscara completa `000.000.000-00`. O `normalizeCpf` só tira a máscara de um valor nesse formato. Qualquer outro valor (por exemplo `abc96929456004`, `969 294 560 04` ou `969.294.560.04`) chega intacto ao `@IsCpf()` e é recusado. Isso evita aceitar texto que só fica válido depois de limpo à força.
- **Senha com um validador só (`@Length(1, 128)`)**, porque o `Length` do class-validator já recusa o que não é string. Com `IsString` + `IsNotEmpty` + `MaxLength`, um corpo sem senha devolvia três mensagens (o e2e mostrou isso). O limite de 128 segura o custo do bcrypt, que só usa os primeiros 72 bytes. A mensagem é "Informe a senha (até 128 caracteres).".
- **O rate limit pode ser configurado pela env, e não só desligado.** Os e2e fazem cerca de 15 logins do mesmo IP, então o `test-env.ts` põe o limite em 1000. O limite real é testado em `auth-throttle.e2e-spec.ts`, que baixa o limite para 3 e só depois importa o `AppModule` com `import()` dinâmico, porque o `ConfigModule.forRoot` lê a env quando o módulo é carregado. O `ThrottlerGuard` fica só na rota de login, não é global. Como os guards rodam antes dos pipes, um corpo malformado também conta como tentativa.
- **Payload `{sub}` assinado com HS256**, e a estratégia também só aceita HS256. Ela não consulta o banco: o `/me` da Tarefa 5 é que busca o responsável e devolve 401 ou 404 se ele não existir mais.
- **A mensagem do 429 não cita o tempo** ("Muitas tentativas de login. Aguarde um pouco e tente novamente."), porque a janela pode ser configurada.
- Não mexi no `ValidationPipe` global (por exemplo, para ligar `stopAtFirstError`). O problema da mensagem repetida foi resolvido no próprio DTO.

### TDD: falhas e sucessos
- `env.validation.spec.ts` (casos novos). RED: `Tests: 9 failed, 14 passed, 23 total`, com "Received function did not throw" para o `JWT_EXPIRES_IN` inválido e os limites, e o objeto sem `LOGIN_THROTTLE_*`. GREEN: `Tests: 23 passed`.
- `is-cpf.spec.ts`. RED: `Cannot find module './is-cpf' from 'src/shared/decorators/is-cpf.spec.ts'`. GREEN: `Tests: 31 passed` (válidos com e sem máscara, dígito errado, sequências repetidas, tamanho errado, formatos tortos, valores que não são texto, `normalizeCpf` e o decorator com a mensagem "CPF inválido.").
- `login.use-case.spec.ts`. RED: `Cannot find module '../services/password-hasher'`. GREEN: `Tests: 8 passed` (sucesso com o `sub` certo e só `exp/iat/sub` no payload, nenhum hash ou CPF na saída, CPF inexistente com 401, senha errada com 401, mesma resposta nos dois casos, comparação contra o hash falso, custo 10 do hash falso e nenhum token assinado quando a senha está errada).
- `jwt-auth.guard.spec.ts` e `jwt.strategy.spec.ts`. RED: `Cannot find module './jwt.strategy'` e `Cannot find module '../decorators/public'`. GREEN: `Tests: 7 passed`.
- `auth.e2e-spec.ts` + `auth-throttle.e2e-spec.ts`. RED (antes do controller e do módulo): `Tests: 20 failed, 2 passed, 22 total`. O login deu 404 em todos os casos (11 que esperavam 200, 400 ou 401), e a rota protegida `/ping` deu 200 quando o esperado era 401 (4 casos, porque ainda não havia guard). Na primeira versão os casos de 401 apontavam para a rota com `@CurrentGuardian()` e passavam sem guard nenhum, porque era o decorator que lançava o 401. Por isso criei o `/ping`, que não usa o decorator. Primeiro GREEN: 31/32, com falha em "400 sem senha" por causa das 3 mensagens (ver decisões). GREEN final: `Test Suites: 4 passed; Tests: 32 passed`.
- Prova extra do 429: tirei o `@UseGuards(ThrottlerGuard)` de propósito e o teste deu `Expected: 429, Received: 401`. Com o guard de volta, passou.
- Prova extra do health: tirei o `@Public()` do `HealthController` de propósito e o teste deu `Expected: 200, Received: 401`. Com o decorator de volta, passou.

### Verificação (`cd api`, `YARN_IGNORE_PATH=1`)
```
yarn format:check -> All matched files use Prettier code style!   exit 0
yarn lint         -> exit 0 (0 erros, 0 avisos)
yarn tsc          -> exit 0
yarn test         -> Test Suites: 6 passed; Tests: 92 passed
yarn test:e2e     -> Test Suites: 4 passed; Tests: 32 passed
yarn build        -> exit 0
```
Smoke no build (`DATABASE_URL=file:./t4.db yarn prisma:setup` num arquivo novo, depois `PORT=3398 node dist/main`):
- `GET /api/health` respondeu 200.
- Login com `969.294.560-04`/`123456` respondeu 200 com `{"accessToken":"<jwt>","guardian":{"id":"cmv…","firstName":"Gustavo","lastName":"da Silva"}}`. O payload do token é `{"sub":"cmv…","iat":…,"exp":…}`, com 7 dias de validade.
- Senha errada e CPF válido sem cadastro deram o mesmo corpo: `{"message":"Usuário ou senha inválida.","error":"Unauthorized","statusCode":401}`.
- `cpf: "123"` deu 400 com `{"message":["CPF inválido."],...}`.
- A 6ª tentativa no mesmo minuto deu 429 com `"Muitas tentativas de login. Aguarde um pouco e tente novamente."`.
- O log do servidor só tem as linhas de boot do Nest. O `grep` por `123456`, `96929456004` e `eyJ` achou 0 ocorrências (A8). Nenhum arquivo novo usa `Logger` ou `console`.

### Como o qa sobe e testa
```
cd api
cp .env.example .env             # ou acrescente LOGIN_THROTTLE_LIMIT/TTL ao .env existente (são opcionais)
YARN_IGNORE_PATH=1 yarn install
rm -f dev.db && YARN_IGNORE_PATH=1 yarn prisma:setup
YARN_IGNORE_PATH=1 yarn start:dev   # http://localhost:3333
curl -s -X POST localhost:3333/api/auth/login -H 'content-type: application/json' \
  -d '{"cpf":"969.294.560-04","password":"123456"}'
```
- Contas: Gustavo `969.294.560-04`/`123456`, Adelaide `508.795.670-07`/`987654`, Carlos (sem aluno) `314.159.265-90`/`111111`. Um CPF válido sem cadastro, para o 401: `529.982.247-25`.
- O rate limit é de 5 tentativas por minuto por IP. Para testar à mão sem esperar, suba com `LOGIN_THROTTLE_LIMIT=2`. O limite é guardado em memória e zera quando o servidor reinicia.
- Ainda não existe rota protegida de produção (o `/api/me` é da Tarefa 5). O 401 com e sem token está coberto nos e2e pela rota de teste `/api/e2e-protected`.

### Pendências de deploy e ambiente
- Duas envs novas e opcionais: `LOGIN_THROTTLE_LIMIT` (padrão 5) e `LOGIN_THROTTLE_TTL_MS` (padrão 60000). O `JWT_EXPIRES_IN` agora é validado: um valor fora do formato derruba o boot com "Configuração de ambiente inválida".
- Não há migration nova nem mudança nativa.

### Ressalvas
1. **Proxy e IP do throttler:** o rate limit usa o `req.ip`. Atrás de um proxy (Docker com reverse proxy, ou hospedagem), todos os clientes viriam do mesmo IP sem `app.set('trust proxy', ...)`. Hoje não há proxy. Vale lembrar na Tarefa 6 (Docker).
2. **Força do `JWT_SECRET`:** ele continua aceitando qualquer string não vazia. Não pus tamanho mínimo porque não foi pedido. Fica para a avaliação do cyber-security.
3. **O token continua válido depois que o responsável é apagado**, porque a estratégia não consulta o banco (escolha de desempenho, de acordo com o `@CurrentGuardian()` → `{id}` decidido pelo chief). Os use cases da Tarefa 5 precisam tratar o responsável que não existe mais.
4. O `@CurrentGuardian()` não tem spec unitário próprio. Ele é coberto pelo e2e (200 com `{id}` na rota protegida). O D25 pede unitário de "use case, guard e decorator de validação", e os três têm spec.

**Status: PRONTO COM RESSALVAS** (ressalvas 1 a 3 acima, que não bloqueiam a tarefa).
Commits: `a5d38ab`. Testes: unit 92/92, e2e 32/32, e lint, tsc e build limpos.


### Rodada 1

Commit `c36ace5` (`fix(api): exige unidade no JWT_EXPIRES_IN`), na branch `feat/api`. O push falha porque não há remote.

- **[IMPORTANTE] `JWT_EXPIRES_IN` sem unidade valia milissegundos:** corrigido em `c36ace5`. O regex agora é `^\d+(s|m|h|d|w|y)$` e exige a unidade (também deixa de aceitar `ms`). O comentário em `env.validation.ts` explica o motivo ("3600" = 3,6 s no jsonwebtoken). O `.env.example` e o comentário do `auth.module.ts` mostram o formato com unidade (`3600s`, `30m`, `7d`).
  - Teste em `src/config/env.validation.spec.ts`: `'3600'` e `'500ms'` saíram da lista de aceitos e entraram na de recusados. A lista de aceitos ficou `7d`, `12h`, `30m`, `900s` e `1w`.
  - RED, com o regex antigo: `yarn jest src/config` deu `Received function did not throw` em 2 casos, e `Tests: 2 failed, 23 passed, 25 total`.
  - GREEN: `Tests: 25 passed, 25 total`.
  - Os valores em uso (`7d` no `.env`, no `.env.example` e no `test-env.ts`) continuam válidos.
- **[SUGESTÃO] guard spec:** fica adiada, por decisão do chief.

Verificação completa depois da rodada (`cd api`, `YARN_IGNORE_PATH=1`):
```
yarn format:check -> exit 0
yarn lint         -> exit 0
yarn tsc          -> exit 0
yarn test         -> Tests: 94 passed, 94 total
yarn test:e2e     -> Tests: 32 passed, 32 total
yarn build        -> exit 0
```
Pendência de deploy: um `JWT_EXPIRES_IN` sem unidade (ex.: `3600`) agora derruba o boot com "Configuração de ambiente inválida". Use `3600s`.

## Mensagens
→ chief: duas envs opcionais novas (`LOGIN_THROTTLE_LIMIT` e `LOGIN_THROTTLE_TTL_MS`) e o `JWT_EXPIRES_IN` agora validado. O `trust proxy` do throttler fica para a Tarefa 6 (Docker). Não há remote, então não houve push.
→ code-reviewer: o ValidationPipe agora é exercitado nos e2e (campo extra → `property role should not exist`). Vale olhar a rota de teste `test/setup/protected-probe.controller.ts` e o import dinâmico em `test/auth-throttle.e2e-spec.ts`.
→ cyber-security: comparação contra o hash falso para CPF inexistente; HS256 fixo nos dois lados; `JWT_SECRET` sem tamanho mínimo; throttler por IP e em memória.

## Tarefa 5

- Trilha: api · worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/api` · branch `feat/api` · commit `ea1473b` (`feat(api): me, agenda, boletim e guard de ownership do aluno`), base `c36ace5`. Não há remote, então o push falha e o commit fica só local.

### O que mudou (tudo em `api/`)
- `src/shared/utils/mask-cpf.ts`: `maskCpf('96929456004')` devolve `***.294.560-**`. Qualquer valor que não tenha 11 dígitos vira `***.***.***-**`, para nunca vazar um CPF malformado.
- `src/shared/guards/student-ownership.guard.ts`: `StudentOwnershipGuard` lê `request.user.id` e `params.id` e consulta um `StudentAccessChecker` (token `STUDENT_ACCESS_CHECKER`), que responde `granted`, `denied` ou `unknown-guardian`. `denied` (aluno de outro responsável ou inexistente) dá 403 com a mensagem "Você não tem acesso a este aluno.". `unknown-guardian` dá 401. Sem usuário na requisição dá 401, e sem `:id` dá 403. Também exporta `@StudentOwnership()` (o decorator do D21, que é `UseGuards(StudentOwnershipGuard)`).
- `src/modules/guardians/`: `controllers/me.controller.ts` (`GET /api/me`), `use-cases/get-me.use-case.ts` (CPF mascarado, alunos ordenados por `firstName` com `localeCompare('pt-BR')` e `toSorted`, responsável inexistente dá 401), `repositories/guardian-profiles.repository.ts` (interface e token) + `prisma-guardian-profiles.repository.ts` (um `findUnique` com `select` dos alunos via `GuardianStudent`) e `guardians.module.ts`.
- `src/modules/students/`: `controllers/students.controller.ts` (`@StudentOwnership()` na classe, `@Controller('students/:id')`, com as rotas `agenda`, `report-cards` e `report-cards/:year` e o `ParseIntPipe` no ano), três use cases (`get-student-agenda`, `list-report-cards`, `get-report-card`), `repositories/students.repository.ts` (interface, token e records) + `prisma-students.repository.ts` (implementa `StudentsRepository` e `StudentAccessChecker`) e `students.module.ts` (os dois tokens com `useExisting` na mesma classe Prisma).
- `src/modules/students/testing/in-memory-students.repository.ts`: repositório falso dos três specs de aluno.
- `tsconfig.build.json`: exclui `**/testing/**`, para o repositório falso não ir para o `dist`. Conferi que o `dist/modules/students` não tem `testing/`.
- `src/app.module.ts`: importa o `GuardiansModule` e o `StudentsModule`.
- `test/setup/auth-helpers.ts`: contas do seed e o `loginAs(app, conta)`.
- Testes novos: `mask-cpf.spec.ts`, `student-ownership.guard.spec.ts`, `get-me.use-case.spec.ts`, `get-student-agenda.use-case.spec.ts`, `list-report-cards.use-case.spec.ts`, `get-report-card.use-case.spec.ts`, `test/me.e2e-spec.ts` e `test/students.e2e-spec.ts`.

### Decisões
- **Uma consulta para o ownership:** `checkAccess` faz `guardian.findUnique({where: {id}, select: {students: {where: {studentId}}}})`. Se o responsável não existe, devolve `unknown-guardian` (401, como manda o ledger). Se a lista vem vazia, `denied`. Se não, `granted`. Assim o responsável apagado com token válido dá 401 também nas rotas de aluno, e não só no `/me`, e um id inventado dá o mesmo corpo 403 que o aluno de outro responsável.
- **A interface do checker fica em `shared/guards`**, junto do guard, e não em `modules/students`, para o `shared` não importar de um módulo. O `PrismaStudentsRepository` implementa as duas interfaces.
- **O guard roda antes dos pipes**, então `GET /students/<de outro>/report-cards/abc` dá 403 e não 400 (testado). Não é possível descobrir nada sobre um aluno alheio pela validação do ano.
- **A ordem é decidida no use case** (dias por data, aulas por `startTime` com desempate por `order`, anos em ordem decrescente, disciplinas por `order`). O repositório Prisma também usa `orderBy`, mas quem garante o contrato é o use case, e é isso que o spec cobre.
- **O boletim sempre tem os trimestres 1, 2 e 3**, mesmo quando um trimestre não tem nenhuma disciplina lançada (`subjects: []`), porque o contrato pede 3 termos e o app desenha 3 acordeões. Hoje os dados sempre têm os três.
- **Ano fora de 1..9999 dá 404 no use case, sem consultar o banco.** O motivo é o seguinte: sem essa checagem, `/report-cards/9223372036854775808` (acima do inteiro de 64 bits do SQLite) passa pelo `ParseIntPipe` e o Prisma devolve **500**. Isso foi provado com um e2e que falhou sem a checagem (veja abaixo).
- **Os specs usam fakes que implementam a interface**, não `jest.fn()`. O e2e pega os ids dos alunos pelo `PrismaService` (por RM), para não depender do `/me` que está sendo testado.

### TDD: falhas e sucessos
- Unit, RED (os 6 specs escritos antes de qualquer código de produção), com `yarn jest src/shared/utils src/shared/guards/student-ownership src/modules/guardians src/modules/students`:
  ```
  FAIL src/shared/utils/mask-cpf.spec.ts               Cannot find module './mask-cpf'
  FAIL .../get-student-agenda.use-case.spec.ts          Cannot find module './get-student-agenda.use-case'
  FAIL .../list-report-cards.use-case.spec.ts           Cannot find module './list-report-cards.use-case'
  FAIL .../get-me.use-case.spec.ts                      Cannot find module './get-me.use-case'
  FAIL src/shared/guards/student-ownership.guard.spec.ts Cannot find module './student-ownership.guard'
  FAIL .../get-report-card.use-case.spec.ts             Cannot find module './get-report-card.use-case'
  Tests: 0 total
  ```
  GREEN: `Tests: 34 passed, 34 total`. Os specs cobrem a máscara (meio visível, CPF malformado), o `/me` (ordem por nome, sem CPF completo, não altera a lista do repositório, `students: []`, 401 quando o responsável não existe mais), a agenda (ordem de data e de `startTime`, desempate por `order`, dia vazio, sem o campo `order` na saída, aluno sem agenda), os report cards (ordem decrescente, `[]`), o boletim (agrupamento T1–T3 na ordem do JSON, nota e falta `0` continuam número, 3 termos vazios, 404 com "Boletim não encontrado.", e ano 0, -1, 10000 e 2³¹ dão 404 sem chamar o repositório) e o guard (granted, 403 para não vinculado, mesmo 403 para inexistente, 401 para responsável apagado, 401 sem usuário, 403 sem `:id` sem chamar o banco).
- e2e, RED (specs escritos antes dos controllers e módulos): `Tests: 24 failed, 33 passed, 57 total`. Todas as rotas novas deram 404 ("Cannot GET /api/students/.../report-cards"). Os 33 que passaram são os 32 antigos e mais "404 com ano grande", que só passou por acaso porque a rota não existia. Ele foi trocado depois (veja abaixo).
- Primeiro GREEN do e2e: 55/57. (1) O `period` da Joana no meu teste estava errado: o JSON diz "Matutino". Corrigi o teste. (2) `report-cards/20e3` deu 404 em vez de 400, e está explicado nas ressalvas. Tirei esse caso da lista de 400 e coloquei `-` no lugar. GREEN: `Tests: 57 passed`.
- Prova do guard: tirei o `@StudentOwnership()` do controller e rodei de novo. Deu `Tests: 5 failed, 14 passed`, com falha em todos os casos de 403 e no 401 do responsável apagado. Com o decorator de volta, passou.
- Prova da checagem de faixa do ano: sem a checagem, `99999999999` ainda dava 404 (o SQLite aceita), então o teste não provava nada. Com uma sonda, achei que `9223372036854775808` dá `500 Internal server error`. Troquei o e2e para esse valor. Sem a checagem, ele falha com `expected 404 "Not Found", got 500`. Com a checagem, `Tests: 19 passed`.

### Verificação (`cd api`, `YARN_IGNORE_PATH=1`, depois do commit)
```
yarn format:check -> All matched files use Prettier code style!
yarn lint         -> exit 0 (0 erros, 0 avisos)
yarn tsc          -> exit 0
yarn test         -> Test Suites: 12 passed; Tests: 128 passed, 128 total
yarn test:e2e     -> Test Suites: 6 passed;  Tests: 57 passed, 57 total
yarn build        -> exit 0 (dist sem testing/)
```
Smoke no build, com um banco novo (`DATABASE_URL=file:./t5.db yarn prisma:setup` e `PORT=3397 node dist/main`):
- `/api/me` do Gustavo deu `{"id":"…","firstName":"Gustavo","lastName":"da Silva","cpf":"***.294.560-**","students":[{…"firstName":"Joana","className":"2EM","period":"Matutino"},{…"firstName":"Rafael","className":"7EF","period":"Matutino"}]}`.
- A agenda do Rafael tem os dias 16/03 a 22/03 com 0, 6, 6, 6, 6, 6 e 0 aulas, e 17/03 começa com `{startTime:"07:15", endTime:"08:00", subject:"Matemática I"}`.
- `report-cards` deu `[{"year":2025,"className":"7EF"},{"year":2024,"className":"6EF"}]`, e o de 2025 começa com `{"name":"Língua Portuguesa","grade":9.5,"absences":0}`.
- A Adelaide na agenda do Rafael deu 403, e `/api/me` sem token deu 401.
- O `grep` no log por `123456`, `96929456004` e `eyJ` achou 0 ocorrências. O banco e o log do smoke foram apagados.

### Como o qa sobe e testa
```
cd api
YARN_IGNORE_PATH=1 yarn install
rm -f dev.db && YARN_IGNORE_PATH=1 yarn prisma:setup
YARN_IGNORE_PATH=1 yarn start:dev        # http://localhost:3333
TOKEN=$(curl -s -X POST localhost:3333/api/auth/login -H 'content-type: application/json' \
  -d '{"cpf":"969.294.560-04","password":"123456"}' | python3 -c "import json,sys;print(json.load(sys.stdin)['accessToken'])")
curl -s localhost:3333/api/me -H "Authorization: Bearer $TOKEN"     # pega os ids dos alunos aqui
curl -s localhost:3333/api/students/<id>/agenda -H "Authorization: Bearer $TOKEN"
curl -s localhost:3333/api/students/<id>/report-cards -H "Authorization: Bearer $TOKEN"
curl -s localhost:3333/api/students/<id>/report-cards/2025 -H "Authorization: Bearer $TOKEN"
```
- Contas: Gustavo `969.294.560-04`/`123456` (Rafael e Joana), Adelaide `508.795.670-07`/`987654` (Bianca), Carlos `314.159.265-90`/`111111` (sem aluno).
- Casos negativos: a Adelaide com o id do Rafael dá 403, um id inventado dá o mesmo 403, sem token dá 401, a Bianca com `/report-cards/2024` dá 404 e `/report-cards/abc` dá 400.
- Os ids são cuid e mudam a cada `prisma:setup`, então pegue os ids no `/me`.

### Pendências de deploy e ambiente
- Não há migration nova, env nova nem mudança nativa.

### Ressalvas
1. **`/report-cards/20e3` dá 404, e não 400.** O `ValidationPipe` global (`transform: true`) converte o parâmetro para `Number` (o metatipo é `number`) antes do `ParseIntPipe`. Assim `"20e3"` vira `20000`, passa pelo regex do pipe e cai no 404 de ano fora da faixa (`"0x7E9"` viraria 2025). É inofensivo, porque só aceita números que existem, e o guard roda antes. Para ter 400 seria preciso um pipe próprio ou mudar o metatipo do parâmetro para `string`. Não fiz isso, porque não está no contrato e mexer no comportamento global do pipe sai do escopo.
2. Os repositórios Prisma não têm teste unitário (seguindo o padrão da Tarefa 4). Eles são cobertos pelos e2e com o seed real.
3. O `@StudentOwnership()` aparece no D21 com o nome `:studentId`. Vale o `:id` do contrato e do ledger.

**Status: PRONTO COM RESSALVAS** (1 a 3 acima, nenhuma bloqueia).
Commits: `ea1473b`. Testes: unit 128/128, e2e 57/57, e lint, tsc e build limpos.

### Rodada 1

Commit `94e69d7` (`fix(api): ano do boletim só com 4 dígitos no parâmetro da rota`), na branch `feat/api`. O push falha porque não há remote.

- **[SUGESTÃO, corrigir por decisão do chief] o `:year` aceitava `0x7E9`, `0b11111101001`, `2025.0` e `%202025` (200) e `20e3` (404):** corrigido em `94e69d7`. A ressalva 1 da entrega fica resolvida.
  - `src/shared/pipes/parse-year.pipe.ts`: o `ParseYearPipe` aceita só uma string com `^\d{4}$` (dígitos ASCII). Qualquer outro valor, inclusive um que não seja string, dá 400 com "Ano inválido: use 4 dígitos, ex.: 2025.".
  - `src/shared/decorators/raw-param.ts`: `@RawParam('year')` devolve `request.params.year` cru. O controller agora usa `@RawParam('year', ParseYearPipe) year: number`.
  - Um ano de 4 dígitos sem boletim continua dando 404 (`2023`, e `0000` cai na checagem de faixa do use case). O guard continua rodando antes: a Adelaide em `/report-cards/0x7E9` do Rafael recebe 403.
  - **Por que não deu certo só trocar o tipo do parâmetro.** Primeiro tentei `@Param('year', ParseYearPipe)` com um tipo de interseção (`number & {brand}`), contando que o metadado sairia `Object` e o `ValidationPipe` global não converteria o valor. O e2e passou, mas no `nest build` o metadado saiu `[String, Number]`, e o smoke deu **400 para `2025`**. A causa: o ts-jest compila com `isolatedModules` e emite `Object` para o alias, enquanto o `tsc` completo resolve o tipo para `Number`. Ou seja, **os e2e não enxergam diferença de metadado de tipo entre o teste e o build**. Por isso a solução final não depende de metadado: um parâmetro de decorator próprio (`type: 'custom'`) nunca é convertido pelo `ValidationPipe` (o `validateCustomDecorators` está desligado), seja qual for o tipo declarado. O `raw-param.spec.ts` fixa esse comportamento do pipe global (`param` + `Number` vira 2025; `custom` + `Number` continua `'0x7E9'`).
- Testes:
  - e2e em `test/students.e2e-spec.ts`. Ano fora do formato dá 400 com o corpo exato para `abc`, `2025.5`, `-`, `0x7E9`, `0b11111101001`, `2025.0`, `%202025`, `20e3`, `+2025`, `-2025`, `02025`, `999` e `9223372036854775808`. Este último antes esperava 404: agora o formato barra antes do use case. `0000` e `2023` dão 404, e a Adelaide em `abc` e `0x7E9` recebe 403. O 200 de `2025` e `2024` já estava coberto.
    - RED, antes de qualquer código de produção: `Tests: 13 failed, 16 passed, 29 total`. Os status recebidos foram 6× 200, 4× 404 e 3× 400, estes com a mensagem antiga "Validation failed (numeric string is expected)".
    - GREEN: `Tests: 29 passed`.
  - `src/shared/pipes/parse-year.pipe.spec.ts`: RED `Cannot find module './parse-year.pipe'`, GREEN `Tests: 20 passed` (3 aceitos, 13 formatos recusados, incluindo dígitos de largura total `２０２５`, e 4 valores que não são texto).
  - `src/shared/decorators/raw-param.spec.ts`: RED `Cannot find module './raw-param'`, GREEN `Tests: 3 passed`.
  - Prova de mutação: troquei `@RawParam` por `@Param` no controller e o e2e deu `Tests: 4 failed` (2025 e 2024 passam a dar 400, porque o pipe recebe um número). Com o `@RawParam` de volta, passou.
- Verificação completa (`cd api`, `YARN_IGNORE_PATH=1`):
  ```
  yarn format:check -> All matched files use Prettier code style!
  yarn lint         -> exit 0
  yarn tsc          -> exit 0
  yarn test         -> Test Suites: 14 passed; Tests: 151 passed, 151 total
  yarn test:e2e     -> Test Suites: 6 passed;  Tests: 67 passed, 67 total
  yarn build        -> exit 0
  ```
  Smoke no build (`dist` apagado e gerado de novo, banco novo): `2025=200 2024=200 2023=404 0000=404 0x7E9=400 0b11111101001=400 2025.0=400 %202025=400 20e3=400 abc=400 9223372036854775808=400`, e a Adelaide em `0x7E9` recebe 403.
- Não há migration, env nem mudança nativa.

## Mensagens
→ chief: não há migration nem env nova. O D21 fica atendido com o `@StudentOwnership()` lendo `params.id`. O responsável apagado com token válido dá 401 também nas rotas de aluno, e não só no `/me`. Não há remote, então não houve push.
→ code-reviewer: vale olhar o `useExisting` com dois tokens na mesma classe em `students.module.ts`, a exclusão de `**/testing/**` no `tsconfig.build.json` e a ressalva do `20e3` (efeito do `transform` global).
→ cyber-security: o 403 é idêntico para aluno inexistente e para aluno alheio (testado no corpo), o guard roda antes da validação do ano, o `/me` nunca devolve o CPF completo (`maskCpf` falha fechado) e um ano acima de 64 bits dava 500 antes da checagem de faixa.
→ code-reviewer (Rodada 1): os e2e rodam via ts-jest com `isolatedModules`, que emite metadado de tipo diferente do `nest build` para tipos não primitivos. Qualquer comportamento que dependa de `design:paramtypes` precisa de smoke no build.

## Tarefa 8 — Mobile: camada de dados

Worktree `.claude/worktrees/mobile`, branch `feat/mobile`, base `6df8b24`, último commit `a86adcd`.
Commits: `6a35cae` (utils), `2a89b9a` (camada de dados), `a86adcd` (sessão na navegação, react-native-config, Reactotron, nativo).
Push não feito: o repositório não tem remote.

### Versões novas
| Pacote | Versão | Nativo? |
|---|---|---|
| axios | 1.20.0 (o 1.21.0 saiu hoje e cai na quarentena de 24 h do yarn) | não |
| @tanstack/react-query | 5.104.5 | não |
| zustand | 5.0.16 | não |
| zod | 4.6.7 | não |
| react-native-keychain | 10.0.0 | **sim** (RNKeychain) |
| react-native-mmkv / react-native-nitro-modules | 4.3.2 / 0.37.1 | **sim** (NitroMmkv, MMKVCore 2.4.0, NitroModules) |
| react-native-config | 1.7.2 | **sim** |
| reactotron-react-native | 5.3.1 (só carrega em `__DEV__`) | não |
| msw (dev) | 2.15.0 (o 3.x é só ESM, e o jest 29 não carrega) | não |

### O que mudou (tudo em `mobile/`)
- `src/utils/{cpf,names,dates,grades}.ts`: máscara progressiva e DV do CPF, primeiro nome/nome completo/maiúsculas, `parseLocalDate`/`weekdayOf`/`weekdayName`/`formatDayLabel` sem `Intl`, `formatGrade`/`formatAbsences`.
- `src/services/logger/`: `createLogger` (níveis, `minLevel` dev=debug e prod=warn, transportes que não derrubam o app), `redact` (authorization, password, cpf, accessToken em qualquer profundidade; `Error` vira só `{name, message}`; aguenta ciclo), `consoleTransport`, `reactotron.ts` (`connectReactotron`).
- `src/services/storage/secureStorage.ts`: token só no keychain (`service br.com.fiap.school.session`, `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`), com cópia em memória; `loadToken` relê o keychain (abertura do app).
- `src/services/storage/mmkv.ts`: instância `fiap-school` e adaptador `StateStorage` do zustand.
- `src/services/http/`: `client.ts` (instância axios, `baseURL` por `resolveApiUrl(Config.API_URL, Platform.OS)`, timeout 15 s, `expireSession` com trava de um signOut por vez), `interceptors.ts` (Bearer fora das `PUBLIC_PATHS`; log com método, URL, status, duração e `x-request-id`; 401 fora do login → `onUnauthorized`; todo erro sai como `ApiError`), `errors.ts` (`ApiError` com `kind`/`status`/`apiMessage`, `apiErrorBodySchema` zod do corpo do Nest, `toApiError`), `parseResponse.ts` (zod `safeParse`; fora do contrato → `invalidResponse` + log só com caminho e código do campo), `apiUrl.ts`.
- `src/stores/session.store.ts`: zustand + persist no mmkv; `status`, `guardian`, `selectedStudentId`, `signOutReason` (`manual`/`expired`, para o "Sua sessão expirou" do design 3.2); `bootstrap`, `signIn`, `signOut` (keychain + `queryClient.clear()` + estado), `selectStudent`. O `partialize` persiste só `selectedStudentId`.
- `src/app/queryClient.ts`: `shouldRetry` (1 retry, nenhum em 400/401/403/404/invalidResponse), `staleTime` 5 min, mutations sem retry, `Register.defaultError = ApiError`, `queryKeys` (`['me']`, `['agenda', id]`, `['reportCards', id]`, `['reportCard', id, ano]`).
- `src/features/auth/{schemas.ts, services/auth.service.ts, api/useLoginMutation.ts, api/useMeQuery.ts}`: schemas de login, `/me` e aluno; `loginFormSchema` (CPF com DV → "Confira o CPF digitado.", senha não vazia); login manda o CPF só com dígitos; mutation abre a sessão no sucesso; `/me` só roda com sessão.
- `src/features/lessons/{schemas.ts, services/lessons.service.ts, api/useAgendaQuery.ts}` e `src/features/report-card/{schemas.ts, services/reportCard.service.ts, api/useReportCardsQuery.ts, api/useReportCardQuery.ts}`: queries com `skipToken` quando falta aluno ou ano.
- `src/app/App.tsx` (`QueryClientProvider` + `bootstrap()`), `Navigation.tsx` (devolve `null` enquanto `loading`, então a splash nativa fica), `navigation/RootStack.tsx` (telas condicionais: sem sessão só `Login`; com sessão `App` + `SelectStudent`).
- Placeholders: `LoginScreen` sem o botão ENTRAR (ver Decisões 5); `ReportCardScreen` com SAIR chamando `signOut()`.
- `src/app/devtools.ts` + `index.js`: Reactotron como transporte do logger, só em dev.
- `src/types/react-native-config.d.ts`, `.env.example`, `.gitignore` (`.env`, `.env.*`, menos o example).
- Nativo: `android/app/build.gradle` com `apply from: …react-native-config…/dotenv.gradle`; `ios/Podfile.lock` (5 pods novos).
- Jest: `transform` também para `.mjs` e o `transformIgnorePatterns` libera msw e as dependências ESM dele; `jest.setup.ts` com mocks de keychain (`jest/mocks/react-native-keychain.ts`, em memória), nitro-modules (o mmkv usa mock em memória no Jest, mas importa o Nitro) e config, e o servidor MSW global com `onUnhandledRequest: 'error'`. Fixtures do contrato em `src/test/fixtures.ts`, handlers em `src/test/msw/`, `QueryWrapper` em `src/test/queryWrapper.tsx`.

### Decisões
1. **`msw/native`, não `msw/node`:** o env de teste do RN resolve com a condição `react-native`, e nela o `msw/node` aponta para `null`. Testei o `msw/native` antes (spike apagado) e ele intercepta o axios no Jest. No Node, o axios usa o adapter `fetch`.
2. **Token em memória + keychain:** sem a cópia em memória, cada request iria ao keychain. O `bootstrap` usa `loadToken()` e sempre relê o keychain. O token nunca entra no zustand nem no mmkv (teste `selectStudent persiste só o aluno no mmkv, nunca o token`).
3. **401 com trava:** dois 401 em paralelo chamam `signOut` uma vez só (`expiringSession`). Quando o 401 chega e a sessão já acabou, nada é feito.
4. **Rotas públicas por caminho** (`PUBLIC_PATHS = {'/auth/login'}`): não levam token, e o 401 delas é erro de credencial.
5. **Navegação pela sessão (padrão de auth do React Navigation).** Com isso o placeholder do Login perdeu o "ENTRAR" que só navegava, porque a rota `App` só existe com sessão. Até a Tarefa 9, para ver as abas no simulador é preciso já ter um token no keychain.
6. **Reactotron ligado só como destino do logger** (`display` com o contexto já redigido). Os plugins de rede, console e AsyncStorage ficam desligados, porque o de rede mostraria o `Authorization` e o corpo do login. Inspeção do zustand e do cache do React Query (D15) **não** entrou: precisaria de plugins extras. Fica o ponto de extensão (`logger.addTransport`).
7. **`resolveApiUrl`:** sem `.env` usa `localhost` (iOS) ou `10.0.2.2` (Android). No Android também troca `localhost` por `10.0.2.2`, para o mesmo `.env` servir aos dois.
8. **Erro da API (mensagem do chief durante a tarefa):** `apiErrorBodySchema` aceita `message` string ou `string[]`, e a UI recebe a primeira em `ApiError.apiMessage`. Corpo fora do formato → `apiMessage` indefinido, sem quebrar. Os ViewModels decidem o texto pelo `kind` (o design usa texto fixo para 401/429/5xx/rede).
9. Services em `src/features/<f>/services/`, hooks em `src/features/<f>/api/`, para a regra "View não importa services/" ser checável por caminho.

### Testes (TDD) — RED registrado antes de cada implementação
- utils (`cpf`, `names`, `dates`, `grades`): RED `Cannot find module '../cpf'` (e os outros 3); GREEN 30 testes. As datas também passam com `TZ=America/Sao_Paulo` e `TZ=Pacific/Kiritimati`.
- logger (`redact`, `logger`): RED `Cannot find module '../redact'` / `'../logger'`; GREEN 10.
- `secureStorage`: RED `Cannot find module '../secureStorage'`; GREEN 5. Depois, `loadToken`: RED `TypeError: secureStorage.loadToken is not a function`; GREEN 6.
- `errors`, `queryClient`, `session.store`: RED `Cannot find module '../errors'` / `'../../services/http/errors'` / `'../../app/queryClient'`. Depois veio a falha `Failed to get NitroModules` (ambiente, corrigida com o mock do Nitro). Duas falhas eram dos próprios testes e foram corrigidas: o `setState` persistia `null` antes do rehydrate, e o bootstrap lia a memória (isso levou ao `loadToken`). GREEN 20 + 8.
- schemas (auth, lessons, report-card): RED `TypeError: Cannot read properties of undefined (reading 'parse')` e `Cannot find module '../schemas'`; GREEN 17.
- `apiUrl` e `client` (interceptors com MSW): RED `Cannot find module '../apiUrl'` / `'../client'`; GREEN 13.
- `parseResponse` e os hooks (`useLoginMutation`, `useMeQuery`, `useAgendaQuery`, `useReportCardsQuery`/`useReportCardQuery`): RED `Cannot find module` de cada arquivo; GREEN 17. Cobrem login 200/401 e resposta sem token, `/me` 200, sem aluno, 401 global e schema inválido (sem crash e sem retry), 403 e 404.
- `App.test.tsx` reescrito antes da fiação: RED 4/4 (o app ainda não lia a sessão); GREEN 4 (sem token → Login + splash some; com token → abas + modal; `signOut('expired')` → Login; SAIR → Login e keychain vazio).
- `apiErrorBodySchema`: refatoração sem mudar o comportamento (o caso string/array já tinha teste). Os 2 casos novos (403 com a mensagem do contrato, corpo fora do formato) foram escritos **junto** com a refatoração e passaram de primeira. São caracterização, não RED.
- Mutações (cada uma quebra o teste certo e foi revertida): sem `onUnauthorized` → `✕ 401 numa rota protegida limpa a sessão` e `✕ vários 401 juntos`; 401 do login derrubando a sessão → `✕ 401 no login é credencial errada`; sem a trava → `✕ vários 401 juntos encerram a sessão uma vez só`; `partialize` persistindo tudo → `✕ selectStudent persiste só o aluno no mmkv, nunca o token`.

### Verificação (fresca, `cd mobile`, sobre `a86adcd`)
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn test          -> Test Suites: 23 passed; Tests: 129 passed
yarn format:check  -> All matched files use Prettier code style!
cd ios && pod install -> Installing MMKVCore 2.4.0, NitroMmkv 4.3.2, NitroModules 0.37.1, RNKeychain 10.0.0, react-native-config 1.7.2
                         Pod installation complete! 109 dependencies, 109 pods
xcodebuild -workspace FiapSchool.xcworkspace -scheme FiapSchool -configuration Debug -sdk iphonesimulator \
  -destination 'id=1E7DEFC7-963D-47CD-82A7-224BC5EAD850' -derivedDataPath build/DerivedData build -> ** BUILD SUCCEEDED **
simctl install + launch br.com.fiap.school -> conectado ao Metro (`/json/list`: "br.com.fiap.school (iPhone 16)")
```
O app abre, passa pela splash e cai no placeholder do Login com o texto novo da Tarefa 8, sem tela vermelha. Evidência: `evidencias/tarefa-8-ios.png`. Isso prova em runtime nativo o keychain (o `bootstrap` leu o keychain: sem token, deu `signedOut`) e o mmkv/Nitro (o store é criado no import). **O react-native-config ainda não foi exercido em runtime:** o `client.ts` só é importado pelos hooks, e nenhuma tela usa hook ainda. O pod compila e linka, e a primeira leitura de `Config` acontece no Login real (Tarefa 9).
Usei o Metro que já rodava na 8081 a partir deste mesmo worktree (cwd conferido). Reiniciá-lo com `--reset-cache` foi negado pela permissão do ambiente.

### Como o qa sobe e testa
```
cd mobile
cp .env.example .env            # opcional; sem .env usa localhost / 10.0.2.2
yarn install && (cd ios && pod install)
yarn start                      # Metro 8081
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
yarn test                       # 129 testes; a API real não é necessária (MSW)
```
Na tela, nesta tarefa, só dá para ver que o app abre no Login quando não há token. O fluxo login → abas → 401 → Login está coberto pelos testes de hook e do App. O qa vê na tela a partir da Tarefa 9. Os utils de data e nota não aparecem em tela ainda.

### Pendências de deploy / nativo / ambiente
- **Mudança nativa:** keychain, mmkv + nitro-modules e react-native-config. É preciso `pod install` e build nativo de novo (não é OTA).
- **Android não buildado** (sem JDK). Configurado: `dotenv.gradle` aplicado no `app/build.gradle`, com o autolinking cuidando do resto. A prova vem do CI (Tarefa 13).
- **Env nova:** `API_URL` (react-native-config, lida em tempo de build). `.env` fora do git; `.env.example` versionado.
- **Release Android e HTTP:** o RN põe `usesCleartextTraffic=false` no release. O APK de release (CD, Tarefa 17) não fala com `http://10.0.2.2` sem config de rede ou HTTPS. Fica para a 13/17.
- Reactotron: app desktop na 9090. No emulador Android, `adb reverse tcp:9090 tcp:9090`.

### Ressalvas
1. Inspeção de zustand/React Query no Reactotron (D15) não entrou (Decisão 6).
2. Placeholder do Login sem ação até a Tarefa 9 (Decisão 5). O SAIR do placeholder do Boletim lê o store direto, sem ViewModel. É provisório, e o SAIR real é do Header (Tarefa 10).
3. react-native-config sem leitura em runtime ainda (ver Verificação).
4. `react-native-keychain` 10.0.0 é de março/2025 (a última publicada). Compila no RN 0.88 com codegen (`RNKeychainSpec`).

### Mensagens
→ chief: mudança nativa (3 libs + Nitro). Exige pod install e build; não vai por OTA.
→ chief: pendência de release Android × HTTP em claro para a Tarefa 13/17.
→ chief: a mensagem sobre `message: string | string[]` foi tratada (`apiErrorBodySchema` em `src/services/http/errors.ts`; a UI usa `ApiError.apiMessage` = a primeira mensagem).
→ developer da Tarefa 9: use `useLoginMutation` (o erro tem `kind` e `apiMessage`), `loginFormSchema` + `zodResolver`, `formatCpf`/`onlyDigits`, e `useSessionStore(s => s.signOutReason) === 'expired'` para "Sua sessão expirou. Entre de novo.".
→ developer da Tarefa 10/11/12: `useMeQuery` não preenche `guardian` no store ao reabrir o app (o nome vem do `/me`); a escolha do aluno padrão (primeiro aluno quando `selectedStudentId` é nulo ou não está em `me.students`) fica no ViewModel.
→ code-reviewer: vale olhar `src/services/http/client.ts` (trava do 401), o `jest.config.js` (transform de `.mjs` para o MSW) e o `RootStack` condicional.

## Tarefa 6 — API: logs, Swagger, Docker e CI

- Trilha: api · worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/api` · branch `feat/api` · base `94e69d7`. Os commits são `ffa4059` (`feat(api): logs com pino, swagger em /docs e trust proxy`), `8f2d8b4` (`feat(api): Dockerfile multi-stage e docker compose na raiz`) e `e0aa371` (`chore(ci): workflow da api com lint, testes e smoke no build`). Não há remote, então o push falha e os commits ficam só locais.

### Versões novas
`nestjs-pino` 5.3.1, `pino` 10.4.0, `pino-http` 11.0.0, `@nestjs/swagger` 11.4.7 (o `latest` é o 12, que pede Nest 12) e `pino-pretty` 13.2.0 (dev).

### O que mudou
- `api/src/infra/logger/request-id.ts`: `resolveRequestId(header)` devolve o `x-request-id` do cliente se ele bater com `^[A-Za-z0-9._-]{1,64}$`. Se não bater (vazio, longo, com quebra de linha, aspas, acento, barra ou header repetido), gera um `randomUUID()`.
- `api/src/infra/logger/logger.config.ts`: `REDACTED_LOG_PATHS` remove (`remove: true`) `req.headers.authorization`, `req.headers.cookie`, `req.body.password`, `req.body.cpf`, `res.headers["set-cookie"]`, `*.accessToken`, `*.password` e `*.cpf`. `buildPinoHttpOptions` monta o `genReqId` (que grava o id no header da resposta), o `customLogLevel` (5xx ou erro → error, 4xx → warn, resto → info), `quietReqLogger` e o pino-pretty só quando `pretty`. `buildLoggerParams` escreve em JSON num destino próprio quando ele é passado. `shouldUsePrettyLogs` usa JSON com `NODE_ENV` igual a `production` ou `test`, e pretty no resto.
- `api/src/infra/logger/logger.module.ts`: `AppLoggerModule` com `LoggerModule.forRootAsync` lendo `LOG_LEVEL` e `NODE_ENV`, e o token `LOG_DESTINATION` (`null` = stdout), que os e2e trocam com `overrideProvider`.
- `api/src/config/trust-proxy.ts`: `parseTrustProxy` aceita `false` ou vazio, `true`, número de saltos ou uma lista de IPs, CIDR (IPv4 /0–32, IPv6 /0–128) e `loopback`/`linklocal`/`uniquelocal`. Qualquer outro valor lança erro com `TRUST_PROXY`.
- `api/src/config/env.validation.ts`: entram `LOG_LEVEL` (`IsIn` fatal…silent, padrão `info`), `SWAGGER_ENABLED` (padrão `true`; aceita só `true`/`false`, porque a conversão implícita faria `"false"` virar `true`) e `TRUST_PROXY` (padrão `'false'`, validado pelo `parseTrustProxy`).
- `api/src/app.setup.ts`: `app.useLogger(app.get(Logger))`, `trust proxy` aplicado no express, `exposedHeaders: ['x-request-id']` no CORS e `setupSwagger` quando `SWAGGER_ENABLED`.
- `api/src/main.ts`: `bufferLogs: true`, para os logs do boot saírem pelo pino.
- `api/src/app.module.ts`: importa o `AppLoggerModule`.
- `api/src/app.swagger.ts`: `DocumentBuilder` com o roteiro de uso (login do Gustavo `969.294.560-04`/`123456` → Authorize → id do `/me`), `addBearerAuth` (http/bearer/JWT, nome `bearer`), `persistAuthorization`. Fica em `/docs` e `/docs-json`, fora do prefixo `/api`.
- `api/src/shared/swagger/error-response.ts`: `ErrorResponse {statusCode, message (texto ou lista), error}`.
- `api/src/shared/swagger/api-docs.ts`: `ApiAuthenticated()` (Bearer + 401) e `ApiStudentRoute()` (+ 403).
- DTOs de resposta, todos com `implements` da interface do use case, para o Swagger não se afastar do contrato sem o `tsc` reclamar: `auth/dto/login.response.ts`, `guardians/dto/me.response.ts`, `students/dto/agenda.response.ts`, `students/dto/report-card.response.ts` e `health/dto/health.response.ts`.
- `api/src/modules/auth/dto/login.dto.ts`: `@ApiProperty` com os exemplos do seed.
- Controllers (`auth`, `me`, `students`, `health`): `@ApiTags`, `@ApiOperation`, `@ApiOkResponse` com o tipo, e os erros que cada rota devolve. O login documenta 400, 401 e 429. Me e students documentam 401, students também 403, e o boletim também 400 e 404. O `:year` tem `@ApiParam` com `pattern ^\d{4}$`, porque o `@RawParam` não é detectado sozinho.
- `api/.env.example`: entram `LOG_LEVEL`, `SWAGGER_ENABLED` e `TRUST_PROXY`, com comentário.
- `api/Dockerfile`: multi-stage `base → deps → build → runtime` sobre `node:24-bookworm-slim`. O yarn 1.22.22 vem pelo `npm i -g --force` (sem corepack) com `YARN_IGNORE_PATH=1`. O `openssl` fica na base, por causa dos engines do Prisma. `python3 make g++` ficam só no estágio deps, para o better-sqlite3. O runtime roda como usuário `node`, com o volume `/app/data`, `DATABASE_URL=file:/app/data/fiap-school.db`, `NODE_ENV=production`, `HEALTHCHECK` com `fetch` em `/api/health` e `CMD sh -c "yarn -s prisma:setup && exec node dist/main"`.
- `api/.dockerignore`: fora do contexto ficam node_modules, dist, coverage, src/generated, test, scripts, `*.db*`, `.env*` e logs.
- `docker-compose.yml` (raiz): projeto `fiap-school` com o serviço `api` (build `./api`), as envs de exemplo, a porta `0.0.0.0:3333:3333`, o volume nomeado `api-data` e `restart: unless-stopped`.
- `.github/workflows/api.yml` (raiz): roda em push na `main` e em PR, com `paths` `api/**` e o próprio workflow, `permissions: contents: read`, `concurrency` e `working-directory: api`. Usa Node 24 com cache do yarn e roda `yarn install --frozen-lockfile`, `cp .env.example .env`, lint, tsc, `yarn test`, `yarn test:e2e`, build e `./scripts/smoke.sh`.
- `api/scripts/smoke.sh`: cria o `smoke.db` novo com `yarn prisma:setup` e sobe `node dist/main` com `NODE_ENV=production`, `LOG_LEVEL=info` e um `JWT_SECRET` descartável (não usa o `.env` nem o `dev.db`). Faz login do Gustavo e confere `/api/health`, `/api/me` (nome, CPF mascarado e 2 alunos), `/api/students/<rafael>/report-cards/2025` (ano, turma 7EF, termos 1–3 e 12 disciplinas no T1), `/api/me` sem token = 401, `/docs-json`, o `x-request-id` enviado voltando no header e no log JSON, e que o log não tem `"123456"`, o CPF (com e sem máscara), o token nem `Bearer`. Apaga o banco e mata o servidor no `trap`. Precisa de curl e jq.
- Testes novos: `src/config/trust-proxy.spec.ts`, `src/infra/logger/request-id.spec.ts`, `src/infra/logger/logger.config.spec.ts`, `test/logging.e2e-spec.ts`, `test/swagger.e2e-spec.ts`, `test/swagger-disabled.e2e-spec.ts` e `test/trust-proxy.e2e-spec.ts`, além do helper `test/setup/log-capture.ts`. Ganharam casos `src/config/env.validation.spec.ts`, `test/auth-throttle.e2e-spec.ts` (o X-Forwarded-For não troca o IP sem `TRUST_PROXY`) e `test/health.e2e-spec.ts` (`access-control-expose-headers`).
- `test/setup/test-env.ts`: fixa `LOG_LEVEL=silent`, `TRUST_PROXY=false` e `SWAGGER_ENABLED=true` antes de cada arquivo, para a env de um arquivo não vazar para o próximo no `--runInBand`. `test/setup/create-test-app.ts` aceita `logDestination`.

### Decisões
- **O destino do log é um provider (`LOG_DESTINATION`) e não uma env.** Assim o e2e lê exatamente o que o pino escreveria no stdout, passando pela mesma cadeia de produção (pino-http, redact, genReqId). Com destino próprio a saída é sempre JSON, porque o transport do pino-pretty não aceita stream.
- **Pretty fora de `production` e `test`.** Em `NODE_ENV=test` o transport abriria uma worker thread no jest. O Docker e o smoke usam `NODE_ENV=production` (JSON). O `pino-pretty` é devDependency e está na imagem, porque o runtime leva o `node_modules` completo (ver abaixo).
- **O request log mantém os headers, com redact.** O serializer padrão do pino-http não inclui o corpo. Além dos caminhos pedidos, removi `*.password` e `*.cpf` como defesa extra. A URL entra no log com o id do aluno (cuid), que não é dado pessoal.
- **`x-request-id` exposto no CORS**, para o app web conseguir ler o header (o RN não aplica CORS).
- **Swagger com decorators explícitos, sem o plugin do CLI do `@nestjs/swagger`.** O plugin só rodaria no `nest build`, e não no ts-jest, então o `/docs-json` do e2e seria diferente do build. Os DTOs de resposta fazem `implements` das interfaces dos use cases.
- **TRUST_PROXY validado na env.** Um valor ruim derruba o boot com "Configuração de ambiente inválida", como as outras envs, em vez de o `proxy-addr` quebrar depois ou confiar no proxy errado.
- **O runtime do Docker leva o `node_modules` completo.** O `CMD` roda `prisma migrate deploy` (CLI `prisma`) e o seed (`tsx`), que são devDependencies, e o seed importa `src/generated`, que também vai para a imagem. Uma imagem menor exigiria passar `prisma`/`tsx` para dependencies ou compilar o seed. Não fiz isso, para não mexer na classificação das dependências.
- **yarn instalado pelo npm na imagem**, e não pelo corepack. O corepack seria afetado pelo `packageManager`, e a imagem do Node pode ou não trazer yarn. `--force` sobrescreve o que existir.
- **Compose em `0.0.0.0:3333`** de propósito, para um celular na mesma rede alcançar a API. O comentário mostra como restringir a `127.0.0.1`.
- **Node 24 fixo no `api.yml`.** O `.nvmrc` da raiz existe só na branch `chore/tooling` (valor `24`). Com `node-version-file`, o workflow quebraria nesta branch até o merge. O comentário cita os dois.
- **O smoke procura a senha com aspas (`"123456"`)**, porque `123456` solto pode aparecer por acaso num timestamp ou numa porta e deixar o teste instável. Uma senha que vazasse viria como string JSON. O e2e faz a mesma coisa.

### TDD: falhas e sucessos
- `trust-proxy.spec.ts` + `request-id.spec.ts`. RED: `Cannot find module './trust-proxy'` e `Cannot find module './request-id'`, com `Tests: 0 total`. GREEN: `Tests: 36 passed`.
- `logger.config.spec.ts`. RED: `Cannot find module './logger.config'`. GREEN: `Tests: 35 passed` (junto com o request-id). O redact é testado com um `pino` real escrevendo num stream.
  - Prova de mutação: tirei `'*.accessToken'` dos caminhos e o teste deu `Expected substring: not "eyJ"`, com `Tests: 1 failed, 19 passed`. Com o caminho de volta, `20 passed`.
- `env.validation.spec.ts` (casos novos). RED: `Tests: 14 failed, 34 passed, 48 total`. Falharam o objeto de padrões sem `LOG_LEVEL`/`SWAGGER_ENABLED`/`TRUST_PROXY` e todas as recusas, que não lançavam. Os "aceita" passavam porque a chave desconhecida atravessava o `plainToInstance`. GREEN: `Tests: 69 passed` em `src/config`.
- e2e. RED 1: com o `create-test-app` importando o token, todos falharam com `Cannot find module '../../src/infra/logger/logger.module'`. Criei o `logger.module.ts` sem ligar no `AppModule` e veio o RED 2: `Tests: 22 failed, 71 passed, 93 total`, com os 7 de logging (sem linha capturada e sem header `x-request-id`), os 14 do swagger (`/docs-json` 404) e o de trust proxy (o 3º login de `203.0.113.1` passava e o IP `203.0.113.2` caía no mesmo balde). O `swagger-disabled` (404) e o "XFF não troca o IP sem TRUST_PROXY" já passavam no RED, porque descrevem o comportamento padrão. Eles ficam como trava de regressão. GREEN: `Tests: 93 passed`.
  - Prova de mutação do e2e de log: tirei `'req.headers.authorization'` e o teste deu `Expected substring: not "eyJhbGciOi…"`, com `1 failed, 6 passed`.
  - CORS: o teste de `access-control-expose-headers` deu `1 failed, 3 passed` sem o `exposedHeaders` e `4 passed` com ele.
- Smoke: com o mesmo redact de `authorization` removido e o build refeito, o `smoke.sh` falhou (log com `Bearer eyJ…`). Com o redact de volta, `SMOKE OK`.

### Verificação (`cd api`, `YARN_IGNORE_PATH=1`, depois dos commits)
```
yarn install --frozen-lockfile -> ok (lock coerente)
yarn format:check -> All matched files use Prettier code style!
yarn lint         -> exit 0
yarn tsc          -> exit 0
yarn test         -> Test Suites: 17 passed; Tests: 230 passed, 230 total
yarn test:e2e     -> Test Suites: 10 passed; Tests: 94 passed, 94 total
yarn build        -> exit 0
./scripts/smoke.sh -> SMOKE OK
actionlint .github/workflows/api.yml (1.7.12) -> sem erros
```
- Docker: não há Docker na máquina, nem hadolint. `npx dockerfilelint api/Dockerfile` deu 4 avisos, todos falsos positivos de uma ferramenta antiga: 3× "Base Image Missing Tag" nos `FROM base`/`FROM deps` (estágios nomeados) e 1× "Invalid Argument" no `HEALTHCHECK --start-period`, que existe desde o Docker 17.05. `npx dclint docker-compose.yml`: 0 erros e 1 aviso de aspas na porta, que já está entre aspas.
- O que validei fora do Docker: `DATABASE_URL` com caminho absoluto (`file:/tmp/.../fiap.db`) funciona no `prisma:setup` e no `node dist/main` (login 200), e o comando do `HEALTHCHECK` (`node -e "fetch(...)"`) sai com 0 contra a API no ar.
- Amostra do log em produção (`NODE_ENV=production`): uma linha JSON por requisição com `reqId`, `req {id, method, url, headers sem authorization}`, `res {statusCode, headers}`, `responseTime` e `msg: "request completed"`. Em dev sai uma linha só pelo pino-pretty.

### Como o qa sobe e testa
```
cd api
cp .env.example .env          # ou acrescente LOG_LEVEL, SWAGGER_ENABLED e TRUST_PROXY (opcionais)
YARN_IGNORE_PATH=1 yarn install
rm -f dev.db && YARN_IGNORE_PATH=1 yarn prisma:setup
YARN_IGNORE_PATH=1 yarn start:dev          # http://localhost:3333/docs
YARN_IGNORE_PATH=1 yarn build && ./scripts/smoke.sh   # smoke no build (porta 3399; SMOKE_PORT muda)
```
- Swagger: abra `http://localhost:3333/docs` e faça `POST /api/auth/login` com `{"cpf":"969.294.560-04","password":"123456"}`. Cole o `accessToken` em **Authorize**, pegue o id do Rafael em `GET /api/me` e teste agenda, report-cards e `report-cards/2025`. Sem Authorize, as rotas dão 401.
- Logs: `curl -i localhost:3333/api/health -H 'x-request-id: qa-1'` devolve `x-request-id: qa-1`, e a linha do log tem `reqId: "qa-1"`. Para JSON no terminal, suba com `NODE_ENV=production`. Faça login e confira que senha, CPF e token não aparecem no terminal.
- `SWAGGER_ENABLED=false` → `/docs` e `/docs-json` dão 404. `TRUST_PROXY=1` com `X-Forwarded-For` diferentes → o rate limit separa por IP.
- Docker (numa máquina com Docker): `docker compose up --build` na raiz, depois `curl localhost:3333/api/health` e `/docs`. `docker compose down -v` apaga o banco.
- Contas: Gustavo `969.294.560-04`/`123456`, Adelaide `508.795.670-07`/`987654` e Carlos (sem aluno) `314.159.265-90`/`111111`.

### Pendências de deploy e ambiente
- **Envs novas (todas opcionais, com padrão):**
  - `LOG_LEVEL`: `fatal|error|warn|info|debug|trace|silent`, padrão `info`. Nos e2e é `silent`.
  - `SWAGGER_ENABLED`: `true|false`, padrão `true`. Qualquer outro valor derruba o boot.
  - `TRUST_PROXY`: `false` (padrão), `true`, número de saltos ou lista de IPs/sub-redes/`loopback`/`linklocal`/`uniquelocal`. Atrás de um reverse proxy, use `1`. `true` confia em qualquer `X-Forwarded-For` e anula o rate limit por IP.
  - `NODE_ENV` agora decide o formato do log: `production` sai em JSON.
- Não há migration nem mudança nativa. O workflow `api.yml` só roda quando houver remote no GitHub.
- O Docker ainda não foi executado de verdade. O primeiro `docker compose up --build` é a prova (fica para o qa, ou para o CI, se quisermos um job de `docker build`).

### Ressalvas
1. **Dockerfile validado só por revisão e lint.** Não há Docker na máquina. Os pontos de maior risco são o download do binário do better-sqlite3 e dos engines do Prisma no `yarn install` da imagem (há toolchain e openssl como fallback) e as permissões do volume com o usuário `node` (o diretório é criado com dono `node` antes do `VOLUME`).
2. **Cada boot do container roda o seed, que recria os dados.** Os ids (cuid) mudam e um token emitido antes do restart dá 401 (o app limpa a sessão). Foi isso que o chief pediu (`CMD` com `prisma:setup`). Se incomodar, o seed pode pular quando o banco já tiver dados.
3. **A imagem leva o `node_modules` completo** (prisma e tsx no boot), então ela é maior que o necessário. Veja em Decisões.
4. O `api.yml` não tem um job de `docker build`. Seria a prova automática do Dockerfile, mas está fora do que foi pedido. Fica como sugestão.
5. Pelo plano não há README da API. O `TRUST_PROXY` está documentado no `.env.example`, no `docker-compose.yml` e no comentário da env. O README da raiz é da Tarefa 17.

**Status: PRONTO COM RESSALVAS** (1 a 5 acima, nenhuma bloqueia).
Commits: `ffa4059`, `8f2d8b4`, `e0aa371`. Testes: unit 230/230, e2e 94/94, smoke OK, e lint, tsc, build e actionlint limpos.

### Rodada 1

Commits `aeb7983`, `079a947` e `7a7b58c`, na branch `feat/api`. O push falha porque não há remote.

1. **[SUGESTÃO, corrigir por decisão do chief] o seed recriava os dados a cada boot do container:** corrigido em `aeb7983`.
   - `api/prisma/seed-policy.ts`: `decideSeed({existingGuardians, seedReset})` devolve `seed` para banco vazio, `skip` para banco com dados e `reset` para banco com dados e `SEED_RESET=true` (sem diferenciar maiúsculas e ignorando espaços). Qualquer outro valor de `SEED_RESET` dá `skip`.
   - `api/prisma/seed.ts`: conta os responsáveis e, no `skip`, só registra "Seed ignorado: o banco já tem dados (SEED_RESET=true apaga e recria)." e sai. O `deleteMany` agora só roda no `reset`. O hash bcrypt passou a ser feito depois da decisão, então o `skip` não gasta CPU.
   - `prisma:setup` num banco novo continua populando. `yarn prisma:reset` continua recriando tudo, porque o `migrate reset` esvazia o banco e o seed cai no caso `seed`.
   - `SEED_RESET=false` entrou no `.env.example` e no `docker-compose.yml`, e os comentários do Dockerfile e do compose foram atualizados.
   - Testes:
     - `prisma/seed-policy.spec.ts`. RED: `Cannot find module './seed-policy'`. GREEN: `Tests: 10 passed`.
     - `test/seed-policy.e2e-spec.ts`, que usa um banco próprio (`seed-policy.db`, sem tocar o `test.db` das outras suítes) e roda o seed de verdade pelo CLI. RED, com o seed antigo: `Tests: 1 failed, 1 passed`. O caso "rodar de novo mantém os ids" falhou com os 3 ids diferentes. O caso do `SEED_RESET=true` já passava, porque era o comportamento antigo. GREEN: `Tests: 2 passed`.
2. **[SUGESTÃO, corrigir] job `docker` no CI:** corrigido em `7a7b58c`.
   - `.github/workflows/api.yml`: novo job `docker`, que roda `docker build -t fiap-school-api:ci .` em `api/` e depois `./scripts/docker-smoke.sh`.
   - `api/scripts/docker-smoke.sh` (também roda local com Docker): cria um volume novo e faz `docker run` em `127.0.0.1:3334`. Espera o `Health.Status` ficar `healthy` e o `/api/health` responder ok, faz login do Gustavo e confere `/api/me` = 200. Depois faz `docker restart`, espera o healthy de novo, confere que o log do container tem "Seed ignorado" e que `/api/me` com o **mesmo token** continua dando 200, o que prova o item 1. O `trap` remove o container e o volume.
   - `actionlint .github/workflows/api.yml` saiu sem erros e o `shellcheck` dos dois scripts também. O shellcheck pegou um SC2155 no `smoke.sh` (`export X=$(...)`), corrigido no mesmo commit.
   - **Não executado:** não há Docker na máquina. A primeira execução real do job é a prova.
3. **[SUGESTÃO, corrigir] pino-pretty sem `NODE_ENV`:** corrigido em `079a947`.
   - `shouldUsePrettyLogs` agora devolve `nodeEnv === 'development'`. O `start:dev` e o `start:debug` passam a rodar com `NODE_ENV=development nest start ...`.
   - Teste em `logger.config.spec.ts`: pretty só com `development`, e JSON com `undefined`, `''`, `production`, `test`, `staging` e `Development`. RED: `Tests: 4 failed, 18 passed` (undefined, "", staging e Development). GREEN: `Tests: 22 passed`.
   - `yarn start:dev` conferido na mão: o log sai pelo pino-pretty (`[20:59:50.971] INFO: request completed ...`). O `node dist/main` sem `NODE_ENV` sai em JSON.
   - O `NODE_ENV=development cmd` do script funciona em shell POSIX (macOS, Linux, CI), mas não no `cmd` do Windows. Para isso precisaria do `cross-env`, que não adicionei.

Verificação completa depois da rodada (`cd api`, `YARN_IGNORE_PATH=1`):
```
yarn format:check -> All matched files use Prettier code style!
yarn lint         -> exit 0
yarn tsc          -> exit 0
yarn test         -> Test Suites: 18 passed; Tests: 242 passed, 242 total
yarn test:e2e     -> Test Suites: 11 passed; Tests: 96 passed, 96 total
yarn build        -> exit 0
./scripts/smoke.sh -> SMOKE OK
actionlint (api.yml) e shellcheck (smoke.sh, docker-smoke.sh) -> sem erros
```
Env nova: `SEED_RESET`, opcional, padrão `false`. Ela só é lida pelo seed, não pela API, e por isso não passa pelo `env.validation`. Como pendência de deploy, quem contava com o seed para "resetar" o `dev.db` agora precisa rodar `SEED_RESET=true yarn prisma:seed`. A ressalva 2 da entrega fica resolvida e a 4 também (fica faltando só a primeira execução real do job). A ressalva 1 continua: o Docker não foi executado nesta máquina.

### Rodada 2

Commit `650b5fe` (`fix(api): NODE_ENV de desenvolvimento no .env, não inline no script`), na branch `feat/api`. O push falha porque não há remote.

- **[SUGESTÃO, corrigir] `NODE_ENV=development` inline no `start:dev`/`start:debug` quebrava no cmd.exe do Windows:** corrigido em `650b5fe`.
  - Os dois scripts voltaram a ser `nest start --watch` e `nest start --debug --watch`. O `.env.example` passou a ter `NODE_ENV=development`, com um comentário dizendo que qualquer outro valor (ou a variável ausente) sai em JSON e que o Docker usa `production`. Também acrescentei a linha no `.env` local do worktree, que está no gitignore.
  - **Ordem de leitura:** o logger não lê `process.env`. O `AppLoggerModule` usa `config.get('NODE_ENV')` do `ConfigService`, que já tem o `.env` carregado e validado (`NODE_ENV` é opcional no `EnvironmentVariables`). Por isso não mudei nenhuma lógica nem criei teste novo: a regra `nodeEnv === 'development'` continua coberta pelo `logger.config.spec.ts` da rodada 1.
  - Prova manual:
    - `env -u NODE_ENV yarn start:dev`, com `NODE_ENV=development` só no `.env`, saiu em pretty: `[21:04:39.300] INFO: request completed {"reqId":...`.
    - `env -u NODE_ENV node dist/main`, com um `.env` sem `NODE_ENV`, saiu em JSON: `{"level":30,"time":...,"reqId":...`.
  - Nada muda nos outros ambientes. O jest define `NODE_ENV=test` no `process.env`, que vence o `.env`. O `smoke.sh` exporta `NODE_ENV=production`. O Dockerfile tem `ENV NODE_ENV=production` e o `.dockerignore` deixa o `.env` fora da imagem. No CI, o `cp .env.example .env` traz `development`, mas os testes e o smoke sobrescrevem pelo `process.env`.
  - Atenção para quem já tem um `api/.env`: sem acrescentar `NODE_ENV=development`, o `yarn start:dev` sai em JSON. Não é um erro, só o formato do log.

Verificação (`cd api`, `YARN_IGNORE_PATH=1`): format:check ok, `lint` exit 0, `tsc` exit 0, `yarn test` `Tests: 242 passed`, `yarn test:e2e` `Tests: 96 passed`, `build` exit 0 e `./scripts/smoke.sh` `SMOKE OK`.

## Mensagens
→ chief: três envs opcionais novas (`LOG_LEVEL`, `SWAGGER_ENABLED`, `TRUST_PROXY`). O `NODE_ENV=production` agora define o log em JSON. O Docker não foi executado (não há Docker na máquina): o primeiro `docker compose up --build` é uma pendência de verificação. Fica a sugestão de um job de `docker build` no CI. O `api.yml` usa Node 24 fixo porque o `.nvmrc` só existe na `chore/tooling`. Não há remote, então não houve push.
→ code-reviewer: vale olhar o override de `LOG_DESTINATION` em `create-test-app.ts`, os DTOs de resposta com `implements` das interfaces, o `toBoolean` do `SWAGGER_ENABLED` (usa `obj[key]`, o valor cru) e o `test-env.ts` que agora reseta as três envs a cada arquivo.
→ cyber-security: redact com `remove` (authorization, cookie, set-cookie, senha, CPF, `*.accessToken`), corpo fora do log, `x-request-id` do cliente limitado a `[A-Za-z0-9._-]{1,64}` (sem injeção de linha), `TRUST_PROXY=false` por padrão (testado: o XFF não muda o IP do throttler), container com usuário `node`, `JWT_SECRET` de exemplo no compose (só local) e o Swagger público em `/docs`, que pode ser desligado com `SWAGGER_ENABLED=false`.

### Rodada 1

Commits em cima de `a86adcd`: `1ac93aa` (test: handle do Jest), `2d13f7b` (refactor: remove `upper`) e `d158e0f` (fix: 401 atrasado, signal, logs, erros e redação).

- **[SUG] 401 atrasado derruba a sessão nova**: corrigido em `d158e0f`.
  - O interceptor guarda no `WeakMap` do request o token com que ele saiu e passa esse token ao `onUnauthorized`. O `expireSession(requestToken)` só encerra a sessão se esse token ainda for o atual.
  - Os services (`getMe`, `getAgenda`, `getReportCards`, `getReportCard`) recebem o `signal` do React Query e o repassam ao axios. Request abortado vira `ApiError('canceled')`, log `debug`, sem retry e sem mexer na sessão.
  - Testes:
    - `client.test` › `401 atrasado de um request feito com o token antigo não derruba a sessão nova`. RED no código anterior: `Expected: "signedIn" Received: "signedOut"`. A primeira versão do teste tinha uma corrida: o `signOut` rodava antes do interceptor ler o token, e o request saía sem token. O teste agora espera o request chegar à API com `Bearer jwt-antigo`.
    - Duas mutações quebram esse teste: tirar a comparação de token no `client.ts` e o interceptor usar o token atual em vez do token do request (as duas dão `✕ 401 atrasado…`).
    - `client.test` › `request cancelado pelo signal vira canceled…` (RED: `kind: "network"`).
    - `lessons.service.test` › `repassa o signal do React Query ao request` (RED: `Received promise resolved instead of rejected`).
    - `session.store.test` › `signOut aborta as queries em voo` **passou de primeira**: o `queryClient.clear()` já destrói a query e aborta o `signal`. O que faltava era repassar o `signal` aos services, e isso o teste do `getAgenda` cobre. Mantive o teste do store como caracterização.
- **[SUG] erro esperado em `console.warn`**: corrigido em `d158e0f`.
  - A tabela `ERROR_LOG_LEVEL` no interceptor manda 400/401/403/404/429 para `info`, `canceled` para `debug` e 5xx, rede, `invalidResponse`, `storage` e `unknown` para `warn`. Em produção (`minLevel: warn`) o 4xx esperado deixa de ser logado.
  - Testes: `erro esperado (4xx) é info, sem warn…` (RED: o `info` não era chamado com o 401) e `erro inesperado (5xx, rede) continua warn`.
- **[SUG] handle aberto no Jest**: corrigido em `1ac93aa`.
  - Causa, achada com um wrapper temporário de `setTimeout` no setup (removido): sobravam timers de 300000 ms do `Query.scheduleGc` e do GC das mutations, porque o `MutationCache.clear()` não chama `destroy()` e não cancela o timer.
  - Correção: o `jest.setup.ts` põe `gcTime: Infinity` nas queries e mutations do `queryClient` do app (o TanStack não agenda GC com tempo infinito) e roda `queryClient.clear()` no `afterAll`.
  - Antes, rodando cada arquivo com `--runInBand --detectOpenHandles` e limite de 40 s, `useMeQuery` e `useLoginMutation` eram mortos pelo alarme (rc=142). Depois: rc=0 em 5 s e 2 s.
  - Suíte inteira: `yarn test --detectOpenHandles` deu rc=0 em 8 s, sem aviso. `yarn test` deu 24/138, sem `failed to exit gracefully`.
- **[SUG] falha do keychain no login**: corrigido em `d158e0f`. O `mutationFn` faz login e `signIn`. Se o `signIn` falhar, ele lança `ApiError('storage', { message: 'Não foi possível salvar o acesso neste aparelho. Tente de novo.', cause })`. Teste: `useLoginMutation` › `falha ao gravar no keychain vira erro storage…` (RED: `Expected: "storage" Received: undefined`).
- **[SUG] `ApiError` descarta `cause`**: corrigido em `d158e0f`. O construtor chama `super(msg, { cause })` e atribui a causa à mão se o motor ignorar o 2º argumento. Os erros HTTP também guardam o `AxiosError` como causa. Ganhou também a opção `message` (mensagem do app). Testes: `guarda a causa original…` (RED: `Received: undefined`) e `aceita uma mensagem própria…` (RED: `Received: "storage"`). O redact continua reduzindo `Error` a `{name, message}`, então a causa não chega ao log.
- **[SUG] redação sem `token`**: corrigido em `d158e0f`. Entraram `token`, `refreshtoken` e `expopushtoken`. Teste: `troca também token genérico, refresh token e push token` (RED: os 3 valores em claro). O mesmo teste prova que `tokenType` continua em claro: a regra é por chave exata, não por sufixo.
- **[SUG] `upper()`**: corrigido em `2d13f7b`. A função e o teste saíram, e nada no `src` usava a função.

Verificação (fresca, `cd mobile`, sobre `d158e0f`):
```
yarn lint                       -> exit 0
yarn tsc                        -> exit 0
yarn test                       -> Test Suites: 24 passed; Tests: 138 passed (sem "failed to exit gracefully")
yarn test --detectOpenHandles   -> exit 0 em 8 s, nenhum handle
yarn format:check               -> All matched files use Prettier code style!
```
Sem mudança nativa, env ou dependência nesta rodada. Não refiz o build iOS: a rodada só mexe em JS.

→ developer da Tarefa 9: o erro do login agora pode ter `kind: 'storage'` (texto pronto em `error.message`). `canceled` não é erro de tela: ignore.

### Rodada 2

Commit `c5612af` (`fix(mobile): causa do ApiError sem corpo nem headers do request`), em cima de `d158e0f`.

- **[SUG] `cause` com o AxiosError inteiro**: corrigido em `c5612af`.
  - O `toApiError` agora grava em `cause` um `HttpErrorCause` saneado, `{ name, code, status, method, url }`, com o método em maiúsculas e a URL sem query string. Vale para `canceled`, `network` e os status HTTP. O `config.data`, os headers e o `response.data` não entram.
  - As causas que não são do axios ficam como estavam: `ZodError` (os issues trazem caminho e código, não o valor) e o erro do keychain no `storage`.
  - Teste: `errors.test` › `a causa de erro HTTP é saneada: sem corpo, headers nem query string`. Ele monta o 401 do login com CPF e senha no corpo, Bearer no header, CPF no `response.data` e CPF na query string. Depois serializa o erro, todas as propriedades próprias dele (inclusive `cause`) e a `cause` sozinha, e procura os três segredos.
    RED: `Expected - 7 / Received + 1` (a `cause` era o `AxiosError`). GREEN depois da correção.
  - O teste da rodada 1 (`guarda a causa original…`) passou a conferir `{ name: 'AxiosError', code: 'ERR_NETWORK' }` em vez da identidade do objeto.
- **[SUG] "sessão expirada" em `warn`**: corrigido em `c5612af`. Agora é `logger.info` (`client.ts`). É uma linha de nível de log, sem teste novo.

Verificação (fresca, `cd mobile`, sobre `c5612af`):
```
yarn lint                       -> exit 0
yarn tsc                        -> exit 0
yarn test                       -> Test Suites: 24 passed; Tests: 139 passed (sem "failed to exit gracefully")
yarn test --detectOpenHandles   -> exit 0
yarn format:check               -> All matched files use Prettier code style!
```
Nada nativo, nenhuma env e nenhuma dependência nova.

## Revisão final — correções

- Trilha: api · worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/api` · branch `feat/api` · base `650b5fe` · 14 commits, de `613c5de` a `cd07f3f`. Não há remote, então o push falha e os commits ficam só locais.
- Os e2e existentes de auth, me, students e auth-throttle **não foram alterados**: `git diff --stat 650b5fe..HEAD -- api/test/{auth,me,students,auth-throttle}.e2e-spec.ts` sai vazio. Os casos novos estão em arquivos novos.

| # | Achado | Situação | Commit |
|---|---|---|---|
| 1 | [IMP] HttpException nos use cases (D18) | resolvido | `613c5de` |
| 2 | [SUG] deps sem uso | resolvido | `2de06df` |
| 3 | [SUG] padrão do fake e nome do repositório | resolvido | `8c474a1` |
| 4 | [SUG] 401 em inglês | resolvido | `613c5de` |
| 5 | [SUG] compose no CI | resolvido | `cd07f3f` |
| 6 | [adiado] `JWT_EXPIRES_IN` zero | resolvido | `82a5709` |
| 7 | [IMP] `JWT_SECRET` | resolvido (ver decisão) | `d162b9a` |
| 8 | [IMP] throttler por CPF | resolvido | `55ee93c` |
| 9 | [SUG] CORS em produção | resolvido | `e2e1c68` |
| 10 | [SUG] helmet e `x-powered-by` | resolvido (CSP sem prova em navegador) | `0e6263d` |
| 11 | [SUG] Swagger em produção | resolvido | `e2e1c68` |
| 12 | [SUG] JWT `exp`, `iss`/`aud` e `maxAge` | resolvido | `bcd4fba` |
| 13 | [SUG] `TRUST_PROXY=true` | resolvido (recusado) | `638703d` |
| 14 | [SUG] query no log | resolvido | `a0b3aaa` |
| 15 | [SUG] imagem só com dependências de produção | resolvido (Docker não executado) | `2de06df`, `dc0d1bc` |
| 16 | [SUG] audit do `multer`/`js-yaml` | resolvido | `2de06df` |
| 17 | teste de cobertura do ownership | resolvido | `75660be` |

### Detalhe por item
1. **Erros de domínio.**
   - Código:
     - `src/shared/errors/domain-error.ts`: `DomainError` com `kind` (`unauthenticated`, `forbidden`, `not-found`).
     - `src/shared/errors/domain-error.filter.ts`: `DomainErrorFilter`, registrado como `APP_FILTER`. Monta a `HttpException` correspondente e devolve `getResponse()`, ou seja, o mesmo `{statusCode, message, error}` de antes.
     - Erros por módulo: `auth/errors/invalid-credentials.error.ts` (carrega `INVALID_CREDENTIALS_MESSAGE`), `guardians/errors/guardian-not-found.error.ts` e `students/errors/report-card-not-found.error.ts` (carrega `REPORT_CARD_NOT_FOUND_MESSAGE`).
     - Os três use cases não importam mais nada de HTTP. Os guards continuam com `HttpException`, porque são camada HTTP.
   - Testes:
     - Os specs dos use cases passaram a esperar os erros de domínio. RED: `Cannot find module '../errors/...'` nos 3 specs.
     - `domain-error.filter.spec.ts`: RED `Cannot find module './domain-error'`, GREEN com 4 casos.
     - Os e2e intocados de auth, me e students seguiram verdes, então o contrato não mudou.
2. **Dependências sem uso.** Antes de remover, conferi cada uma com grep em `src`, `test`, `prisma`, `scripts`, `*.json`, `*.mjs` e `*.ts`: só aparecem no `package.json`. No `@nestjs/cli`, ts-node e ts-loader são devDependencies dele, não peer. Removi `ts-node`, `ts-loader`, `tsconfig-paths`, `source-map-support` e `@eslint/eslintrc`. Build, lint e `start:dev` funcionam.
3. **Repositórios.**
   - `GuardiansRepository` do auth virou `GuardianCredentialsRepository` / `GUARDIAN_CREDENTIALS_REPOSITORY` em `modules/guardians/repositories/`. O `GuardiansModule` provê e exporta o token, e o `AuthModule` importa o `GuardiansModule`.
   - Os fakes ficam todos em `modules/<m>/testing/`: `students/testing/in-memory-students.repository.ts`, `guardians/testing/in-memory-guardian-credentials.repository.ts` e `guardians/testing/in-memory-guardian-profiles.repository.ts`, fora do build.
   - O `auth` ficou sem repositório próprio, então não tem `testing/`.
   - É só refatoração, coberta pelos specs e e2e que já existiam (verdes).
4. **401 em português.**
   - `SESSION_INVALID_MESSAGE = 'Sessão inválida ou expirada.'` (`src/shared/errors/session-invalid.ts`). É usada no `JwtAuthGuard.handleRequest` (qualquer falha do passport), no `StudentOwnershipGuard`, no `@CurrentGuardian()`, na strategy e no `GuardianNotFoundError`.
   - e2e novo `test/errors.e2e-spec.ts` confere o corpo exato `{statusCode: 401, message: 'Sessão inválida ou expirada.', error: 'Unauthorized'}` sem token, com token inválido e com o token de um responsável apagado, assinado pelo próprio `JwtService` da API, no `/me` e numa rota de aluno.
   - RED: `5 failed` (vinha `"Unauthorized"`). GREEN: `5 passed`.
5. **Compose no CI.** O `docker-compose.yml` entrou nos dois `paths` do `api.yml`. O job `docker` ganhou o passo `docker compose -f ../docker-compose.yml config --quiet` antes do build. O actionlint saiu sem erros e o dclint deu 0 erros (1 aviso de aspas, falso).
6. **`JWT_EXPIRES_IN` sem zero.** Regex `^[1-9]\d*(s|m|h|d|w|y)$`. `env.validation.spec` ganhou `0s`, `0m`, `00d` e `07d` na lista de recusados. RED: `4 failed`. GREEN.
7. **`JWT_SECRET`.**
   - Código:
     - `@MinLength(32)` no `JWT_SECRET`.
     - `src/config/public-secrets.ts` define `EXAMPLE_JWT_SECRET` (o do `.env.example`) e `COMPOSE_JWT_SECRET` (o padrão do compose), os dois com 32+ caracteres.
     - Com `NODE_ENV=production`, o `validateEnv` recusa o `EXAMPLE_JWT_SECRET` ("JWT_SECRET: com NODE_ENV=production não use o valor do .env.example (gere um com `openssl rand -base64 48`)").
     - `publicSecretWarning` faz o boot logar `warn` quando o segredo é qualquer um dos dois públicos.
     - O compose usa `JWT_SECRET: "${JWT_SECRET:-docker-compose-local-so-para-avaliacao-troque-em-deploy}"`, com o comentário `JWT_SECRET="$(openssl rand -base64 48)" docker compose up`.
     - O `.env.example` explica o tamanho e o `openssl`.
     - Também mudaram o `test-env.ts` (segredo de 32+), o `.env` local e o segredo do `docker-smoke.sh`.
   - **Decisão:** a imagem roda com `NODE_ENV=production`. Se o padrão do compose também fosse recusado, o `docker compose up` de um comando (D27) quebraria. Por isso ele é aceito com aviso no boot, e o recusado é o do `.env.example`.
   - Testes: segredo de 31 caracteres recusado, 32 aceito, os dois públicos sobem fora de produção, produção recusa o de exemplo e aceita um próprio, e o `publicSecretWarning` avisa nos dois públicos e não num próprio. RED: `Cannot find module './public-secrets'`.
   - Conferido na mão no `dist`: com `NODE_ENV=production` e o `.env` de exemplo o boot falha com a mensagem acima. Com o segredo do compose, sobe com `{"level":40,"context":"Config","msg":"JWT_SECRET é o valor de exemplo do repositório..."}`.
8. **Throttler por CPF.**
   - Código:
     - `src/modules/auth/throttling/login-throttle.ts`: `cpfThrottleTracker(body)` normaliza com o mesmo `normalizeCpf`/`isCpf` do DTO e devolve `cpf:<11 dígitos>`, ou `null` quando o CPF falta, não é texto ou é inválido.
     - No `ThrottlerModule` agora há dois throttlers: `ip` (o de antes) e `cpf`, com `getTracker` e `skipIf` quando não há chave.
     - Envs novas: `LOGIN_THROTTLE_CPF_LIMIT` (10) e `LOGIN_THROTTLE_CPF_TTL_MS` (900000). O `test-env.ts` sobe o limite por CPF para 1000.
   - Testes:
     - Unit `login-throttle.spec.ts`: RED `Cannot find module`.
     - e2e novo `test/auth-throttle-cpf.e2e-spec.ts`, com `TRUST_PROXY=1`, limite por IP de 1000 e por CPF de 3, e um `X-Forwarded-For` diferente a cada tentativa. As 3 tentativas com e sem máscara dão 401, a 4ª dá 429 com a mensagem padrão, e nem a senha certa entra. Outro CPF continua em 401, e CPF inválido dá 400 cinco vezes sem 429.
     - RED: `1 failed` (sem 429). GREEN.
   - Custo aceito, registrado no comentário e no `.env.example`: quem sabe um CPF trava o login dele por 15 min.
9. **CORS em produção.** O `CORS_ORIGINS` não tem mais padrão na classe. O `applyDefaults` põe `*` só fora de produção. Com `NODE_ENV=production` sem a env, o boot falha com `CORS_ORIGINS`. Um `*` explícito (o do compose) continua valendo. O `docker-smoke.sh` passou a passar `-e CORS_ORIGINS="*"`. Testes no `env.validation.spec`; RED: `em produção exige CORS_ORIGINS` falhou.
10. **helmet.**
    - `helmet` 8.3.0 com a CSP padrão menos `upgrade-insecure-requests`, que quebraria o `/docs` por http no IP da rede local. `http.disable('x-powered-by')`.
    - O HTML do Swagger UI só usa `<script src>` do próprio `/docs` (nenhum `<script>` inline) e `<style>` inline. A CSP padrão permite os dois (`script-src 'self'`, `style-src 'self' https: 'unsafe-inline'`).
    - e2e novo `test/security-headers.e2e-spec.ts`: sem `x-powered-by`, `nosniff`, `SAMEORIGIN`, `default-src 'self'`, e no `/docs` a CSP com `script-src 'self'`, sem upgrade e o HTML sem script inline. RED: `3 failed`. GREEN.
    - **Não verificado num navegador real:** tentei abrir o `/docs` no Chrome, mas o navegador não alcança o servidor que sobe no sandbox (página de erro). Fica para o qa abrir `/docs` e conferir o console.
11. **Swagger em produção.** O `SWAGGER_ENABLED` sem env vale `NODE_ENV !== 'production'`. O `true` explícito (compose e smoke) continua ligando. Na simulação de produção, o `/docs` deu 404. Testes no `env.validation.spec`; RED: `em produção o Swagger fica desligado por padrão` falhou.
12. **JWT.**
    - O login emite `iss: fiap-school-api` e `aud: fiap-school-app` (`src/modules/auth/jwt.constants.ts`). A strategy confere `issuer`, `audience` e `jsonWebTokenOptions.maxAge = JWT_EXPIRES_IN`, que exige `iat` e recusa token mais velho que a validade. O `validate` recusa payload sem `exp` numérico.
    - Testes:
      - `jwt.strategy.spec.ts`: RED `2 failed` nos casos sem `exp`.
      - e2e novo `test/jwt.e2e-spec.ts`: o token do login tem `exp`/`iss`/`aud`, o token correto fora do login é aceito (controle), e são recusados o token sem `exp`, o de outro `iss`, o de outro `aud` e o de `iat` com 8 dias e `exp` de 30d. RED: `5 failed, 1 passed`. GREEN.
13. **`TRUST_PROXY=true` recusado** pelo `parseTrustProxy`, com mensagem explicando que anula o rate limit. Os textos de erro e o `.env.example` foram ajustados. Testes no `trust-proxy.spec` e no `env.validation.spec`; RED: `4 failed`.
14. **Query fora do log.** O `serializeRequest` (o `serializers.req` do pino-http) grava a `url` sem `?...` e tira o `query`. Unit em `logger.config.spec`, e um caso novo em `logging.e2e-spec` (`/api/health?access_token=eyJ.segredo-na-url&cpf=96929456004` sai no log com `url: '/api/health'`, sem `query` e sem os valores). RED: `2 failed` (unit) e `1 failed` (e2e).
15. **Imagem de produção.**
    - `prisma`, `tsx` e `dotenv` foram para `dependencies`, porque o boot roda migrate e seed e o seed importa `dotenv/config`.
    - O Dockerfile ganhou os estágios `toolchain` (python/make/g++ e os manifests), `deps` (instalação completa, só para o build), `prod-deps` (`yarn install --production --frozen-lockfile`, cujo postinstall gera o client) e `runtime`, que copia o `node_modules` e o `src/generated` do `prod-deps`.
    - **Validação sem Docker:** numa pasta temporária com `package.json`, `yarn.lock`, `prisma` e `prisma.config.ts`, rodei `yarn install --production --frozen-lockfile` e copiei o `dist`. Com `NODE_ENV=production`, o `yarn prisma:setup` populou o banco, o `node dist/main` respondeu ao login do Gustavo com 200 e o `/docs` deu 404 (o padrão de produção). O segundo `prisma:setup` registrou "Seed ignorado". O `node_modules` dessa instalação tem 486 MB.
    - Consequência: o `pino-pretty` (devDependency) não está na imagem, então `NODE_ENV=development` dentro do container falharia no transport. A imagem é sempre `production`.
16. **Audit.** O `@nestjs/platform-express` 11 ainda fixa `multer` 2.4.0, e não há versão 11 corrigida (o 12 pede Nest 12). Usei `resolutions`: `"multer": "^2.5.0"` e `"@nestjs/swagger/js-yaml": "^5.4.1"` (resolvido para 2.5.0 e 5.5.0). `yarn audit --groups dependencies` → `0 vulnerabilities found - Packages audited: 352`. O `install --frozen-lockfile` passa.
17. **Cobertura do ownership.**
    - e2e novo `test/ownership-coverage.e2e-spec.ts`. Ele lê as rotas registradas no express (`router.stack`, de qualquer controller), filtra as que têm `:id`, monta cada uma com o id do Rafael (`:year` vira 2025) e exige 403 para a Adelaide e status diferente de 403 para o Gustavo. Também confere que a lista contém as 3 rotas conhecidas, para não passar vazia.
    - Ele passou de primeira, como esperado, porque o guard já existe. Prova de mutação: sem o `@StudentOwnership()` no controller, `1 failed` com `"status": 200` no lugar de 403. Com o guard de volta, `3 passed`.

### Verificação final (`cd api`, `YARN_IGNORE_PATH=1`)
```
yarn install --frozen-lockfile -> ok
yarn format:check -> All matched files use Prettier code style!
yarn lint         -> exit 0
yarn tsc          -> exit 0
yarn test         -> Test Suites: 20 passed; Tests: 282 passed, 282 total
yarn test:e2e     -> Test Suites: 16 passed; Tests: 117 passed, 117 total
yarn build        -> exit 0
./scripts/smoke.sh -> SMOKE OK
yarn audit --groups dependencies -> 0 vulnerabilities
actionlint .github/workflows/api.yml -> ok · shellcheck api/scripts/*.sh -> ok
```

### Envs novas e mudanças de comportamento
- `LOGIN_THROTTLE_CPF_LIMIT` (padrão 10) e `LOGIN_THROTTLE_CPF_TTL_MS` (padrão 900000).
- `JWT_SECRET`: agora exige 32+ caracteres, e com `NODE_ENV=production` recusa o valor do `.env.example`. Um `.env` antigo com `troque-este-segredo-local` derruba o boot e precisa ser trocado.
- `CORS_ORIGINS`: obrigatório com `NODE_ENV=production`.
- `SWAGGER_ENABLED`: o padrão passa a ser desligado com `NODE_ENV=production`.
- `TRUST_PROXY=true`: recusado no boot.
- O token ganhou `iss`/`aud`, então tokens emitidos antes desta versão dão 401. O app limpa a sessão e pede login de novo.
- A mensagem do 401 de sessão agora é "Sessão inválida ou expirada.".
- O header `x-ratelimit-*` passa a vir com o nome de cada throttler (`-ip`, `-cpf`).
- Não há migration nem mudança nativa.

### Ressalvas
1. O Docker continua sem nenhuma execução real: o build multi-stage novo e o `docker compose config` só rodam no CI. O runtime de produção foi validado fora do Docker, como descrito no item 15.
2. A CSP do `/docs` não foi verificada num navegador (item 10).
3. Item 7: o segredo padrão do compose é aceito em produção, com aviso no boot. Se o chief preferir recusar também esse, o `docker compose up` passa a exigir `JWT_SECRET=...` na frente do comando.
4. Não há README da API nesta branch. A explicação do `JWT_SECRET` e do `openssl` está no `.env.example` e no compose. O README é da Tarefa 17.

**Status: PRONTO COM RESSALVAS** (1 a 4 acima).

## Mensagens
→ chief:
- Envs novas: `LOGIN_THROTTLE_CPF_LIMIT` e `LOGIN_THROTTLE_CPF_TTL_MS`.
- `JWT_SECRET`, `CORS_ORIGINS` e `SWAGGER_ENABLED` mudaram de regra em produção.
- Decisão pendente: o segredo do compose é aceito com aviso (ressalva 3).
- Para a Tarefa 17 (README): explicar `openssl rand -base64 48` e o bloqueio de 15 min por CPF. Para a Tarefa 14 (Maestro): subir também `LOGIN_THROTTLE_CPF_LIMIT`, porque os flows logam muitas vezes com o mesmo CPF.
→ code-reviewer: vale olhar o `DomainErrorFilter` (corpo via `getResponse()`), o `applyDefaults` no `env.validation`, o `skipIf`/`getTracker` do throttler `cpf` e o e2e que lê o `router.stack` do express 5.
→ cyber-security: os IMPs 1 e 2 estão feitos (veja a ressalva 3 sobre o segredo do compose), e as sugestões 3 a 10 também.

### Rodada 2

Commits `130e273`, `9d60e25` e `7d16ad0`, na branch `feat/api`. O push falha porque não há remote. Nenhum e2e existente foi alterado nesta rodada (`git diff --stat cd07f3f..HEAD` de auth, me, students e auth-throttle-cpf sai vazio).

1. **[IMP] O limite por CPF contava os logins certos:** corrigido em `130e273`.
   - **Onde ficou.** O throttler `cpf` saiu do `ThrottlerModule`, onde ficou só o `ip`, sem mudança. No lugar dele há um `LoginFailureLimitInterceptor` na rota de login (`@UseInterceptors`), que usa um `LoginFailureLimiter` em memória (provider `LOGIN_FAILURE_LIMITER`, configurado por `LOGIN_THROTTLE_CPF_LIMIT`/`_TTL_MS`).
     - Escolhi um interceptor porque é a única peça que vê a requisição antes e o resultado depois. Antes do handler ele consulta o bloqueio; depois, com `tap`/`catchError`, conta a falha ou zera o contador. Nem o controller nem o use case mudam: o use case continua só lançando `InvalidCredentialsError`, e o interceptor reage a esse tipo.
     - Guard não serve, porque não vê o resultado. Exception filter não serve, porque não vê o sucesso.
   - **Ordem:** ThrottlerGuard (IP) → interceptor → ValidationPipe → handler. O interceptor roda antes do pipe, então normaliza o CPF do corpo cru com o mesmo `cpfThrottleTracker` da rodada 1. CPF ausente ou inválido não cria chave.
   - **Regra:** a janela de `TTL` conta da primeira falha. Com `limit` falhas, o CPF fica bloqueado até o fim da janela. O bloqueio responde 429 **antes** de conferir a senha, com a mesma `ThrottlerException` e a mesma mensagem do limite por IP (`LOGIN_THROTTLE_MESSAGE`, agora uma constante só) e o header `Retry-After` com os segundos que faltam. Só `InvalidCredentialsError` conta como falha (um erro de banco não conta). O sucesso zera o contador. Chaves vencidas são varridas no máximo uma vez por janela.
   - Testes:
     - e2e novo `test/auth-throttle-cpf-success.e2e-spec.ts` (limite por CPF 3): 11 logins certos seguidos do Gustavo dão todos 200. Na Adelaide, falha, falha, sucesso, depois 3 falhas dão 401 e a senha certa em seguida dá 429. RED, antes da correção: `2 failed` (`Expected: 200, Received: 429` e `Expected: 401, Received: 429`). GREEN.
     - `auth-throttle-cpf.e2e-spec.ts` (rodízio de IP, 429 depois de 3 falhas, senha certa também 429, outro CPF livre, CPF inválido só 400) continua verde sem alteração. `auth-throttle.e2e-spec.ts` (limite por IP) também.
     - Unit `login-failure-limiter.spec.ts` (relógio injetado: abaixo do limite, bloqueio e tempo restante, janela vencida recomeça, reset, chave por CPF, varredura). RED: `Cannot find module`. GREEN: 7.
     - Unit `login-failure-limit.interceptor.spec.ts` (conta só `InvalidCredentialsError`, sucesso zera, bloqueado dá `ThrottlerException` com `Retry-After` 60 sem chamar o handler, CPF inválido só repassa). RED: `Cannot find module`. GREEN: 5.
   - Limitação: o contador fica em memória por processo (como o throttler) e zera num restart. Requisições paralelas do mesmo CPF podem passar algumas falhas do limite antes de a primeira terminar, e quem segura isso é o limite por IP.
   - O `.env.example` e a descrição do Swagger agora dizem "falhas" e que o login certo não conta.
2. **Limites do login no compose:** corrigido em `9d60e25`. `LOGIN_THROTTLE_LIMIT`, `LOGIN_THROTTLE_TTL_MS`, `LOGIN_THROTTLE_CPF_LIMIT` e `LOGIN_THROTTLE_CPF_TTL_MS` viraram `${VAR:-padrão}` (5, 60000, 10 e 900000). Exemplo: `LOGIN_THROTTLE_LIMIT=1000 docker compose up`.
3. **[R1-1] O segredo padrão do compose saiu:** corrigido em `7d16ad0`.
   - `api/docker-entrypoint.sh` (novo, `CMD ["./docker-entrypoint.sh"]`, copiado com `--chmod=755`). Sem `JWT_SECRET`, ou com ele vazio, a primeira subida gera 48 bytes aleatórios com `crypto.randomBytes` em base64 (64 caracteres), com `umask 077`, `.tmp` + `mv` e `chmod 600`, em `/app/data/jwt-secret`. O dono é `node`, porque o container roda como `USER node`. Nos boots seguintes, reaproveita o arquivo. Um `JWT_SECRET` na env vence. Depois o script roda `yarn -s prisma:setup` e `exec node dist/main`. O segredo não vai para o log, só o aviso de que foi gerado.
   - O compose passou a ter `JWT_SECRET: "${JWT_SECRET:-}"`, com o comentário do `openssl rand -base64 48` para quem quiser passar o próprio.
   - Fora do container nada muda: o `ConfigModule` continua exigindo `JWT_SECRET` (32+) no `.env`, e o do `.env.example` continua recusado em produção.
   - Saiu o `COMPOSE_JWT_SECRET` e o aviso dele. O `publicSecretWarning` só avisa pelo segredo do `.env.example` (fora de produção). Specs ajustados, e um caso novo confirma que o antigo valor do compose não gera mais aviso.
   - `docker-smoke.sh`: sobe **sem** `JWT_SECRET` e, depois do restart, confere quatro coisas: `/app/data/jwt-secret` com `600 node` (`docker exec stat`), o segredo fora do log, o "segredo aleatório gerado" uma vez só nos logs dos dois boots, e o mesmo token valendo (200).
   - Validação local, sem Docker: rodei o `docker-entrypoint.sh` com o `dist`, `NODE_ENV=production`, `JWT_SECRET_FILE` numa pasta temporária e sem `JWT_SECRET` na env nem no `.env`. Ele gerou o arquivo com permissão `600` e 64 caracteres, e o login deu `/me` 200. Depois de matar e subir de novo: nenhuma nova geração (0 linhas "gerado" no segundo log), o mesmo token deu `/me` 200, e o segredo aparece 0 vezes nos dois logs.
   - `JWT_SECRET_FILE` é opcional, com padrão `/app/data/jwt-secret`, e só é lido pelo entrypoint. Existe para mudar o caminho (eu usei no teste local). A API não lê.

Verificação (`cd api`, `YARN_IGNORE_PATH=1`): format:check ok, lint e tsc exit 0, `yarn test` `Tests: 294 passed` (22 suítes), `yarn test:e2e` `Tests: 119 passed` (17 suítes), build ok e `./scripts/smoke.sh` `SMOKE OK`. `actionlint` ok, `shellcheck` dos scripts e do entrypoint ok, dclint com 0 erros.

Envs: nenhuma env nova da API. O entrypoint aceita `JWT_SECRET_FILE` (opcional, interno do container). No compose, `JWT_SECRET` passou a ser opcional (vazio = gerado no volume) e os quatro limites do login passaram a ser sobrescrevíveis.

Ressalvas: o Docker continua sem nenhuma execução real (o entrypoint, o `--chmod` do COPY, que exige BuildKit, e o `docker-smoke.sh` só rodam no CI), e a CSP do `/docs` continua sem prova em navegador. `docker compose down -v` apaga o volume e, com ele, o segredo, e todos os tokens passam a dar 401.

## Tarefa 8b — Mobile: splash animada com o logo FIAP

Worktree `.claude/worktrees/mobile`, branch `feat/mobile`, base `c5612af`, último commit `36b80bb`.
Commits: `f8e0e5f` (tokens + `/me` da abertura), `7c53a20` (splash animada, ViewModel, stack, placeholders), `36b80bb` (splash nativa só com fundo preto).
Push não feito: o repositório não tem remote.

### O que mudou (tudo em `mobile/`)
- `src/theme/sizes.ts`: `logoBadge`, `scanLine` (do design), mais `logoBadgeBleed: 1` e `splashTrack: 1` (ver Decisões 4 e 5).
- `src/theme/motion.ts`: `motion.splash` com os valores das seções 3.1.3 a 3.1.6 (mínimos, loop, trava, timeout do `/me`, wipe, spring do selo, saídas, curvas bezier).
- `src/features/auth/services/auth.service.ts`: `getMe(signal, { timeoutMs })`.
- `src/features/auth/api/loadMeOnBoot.ts`: `/me` da abertura, sem retry, cancelável, com timeout próprio; o resultado vai para o cache `['me']` do `useMeQuery`.
- `src/features/splash/useSplashViewModel.ts`: espera o bootstrap do keychain e, com token, o `/me` (8 s). Decide `login | app | noStudent | bootError` depois do mínimo (1200 ms, ou 600 ms com reduzir movimento). Trava de 10 s: com token vai para `bootError`, sem token para `login`. `canceled` devolve `null` (não é erro de tela). `showLoader` fica true a partir de 1500 ms enquanto não há destino. `onExitFinished` faz o `reset` e marca a splash como concluída.
- `src/features/splash/useSplashAnimation.ts`: a timeline em shared values (`.get()/.set()`), com `start`, `startLoop` e `exit`. O fim da saída volta ao JS por `scheduleOnRN` (react-native-worklets).
- `src/features/splash/SplashScreen.tsx`: as camadas da 3.1.2 (PNG, BadgeCover, BadgeCopy recortada, WipeMask, ScanLine, trilho `splash-loading`). No 1º `onLayout`: `BootSplash.hide({ fade: false })` + `start()`. Saída para o Login: `translateY = insets.top + hero − (altura da raiz − 49)/2`.
- `src/features/splash/BootErrorScreen.tsx` e `src/features/students/NoStudentScreen.tsx`: placeholders com os textos da seção 5, testIDs `boot-error-screen` / `no-student-screen` e SAIR (`header-logout-button`).
- `src/stores/boot.store.ts`: zustand `splashDone` / `finishSplash` (não persistido).
- `src/navigation/types.ts`: rotas `Splash`, `NoStudent` e `BootError`; `fromSplash?` em Login, App, NoStudent e BootError.
- `src/navigation/RootStack.tsx`: `Splash` é a 1ª rota enquanto `!splashDone`. Destino vindo da splash entra com `animation: 'none'` (`fromSplashOptions`). O padrão de auth da Tarefa 8 continua: o logout ou um 401 trocam para o Login sozinhos.
- `src/app/Navigation.tsx`: não devolve mais `null` durante o `loading` e não esconde a nativa no `onReady` (quem esconde é a splash JS).
- `src/features/auth/LoginScreen.tsx`: o placeholder ganhou o logo 306×49 em `insets.top + hero`, centralizado (`login-logo`). Com `fromSplash` o logo não anima (ou faz `FadeIn(150)` com reduzir movimento); sem `fromSplash` (logout) faz `FadeIn(base)`.
- Nativo: `react-native-bootsplash generate assets/bootsplash-blank.png` (PNG transparente de 4×4, `--logo-width=4`, fundo `000000`) para iOS e Android. Com isso saíram o imageset/colorset `-0730a4`, entraram os `-068042`, e os `drawable-*/bootsplash_logo.png` ficaram transparentes. O gerador apagou o comentário do `styles.xml`, e eu restaurei o arquivo (o conteúdo era igual). Atualizei o comentário no `AppDelegate.swift` e no `MainActivity.kt`.

### Decisões
1. **A splash sai do stack por um store** (`boot.store`). Com o `reset`, a rota sai do estado, mas se `Splash` continuasse declarada, um logout depois esvaziaria as rotas do grupo autenticado, e o React Navigation voltaria à 1ª tela declarada, a splash. `onExitFinished` faz o `reset` primeiro e o `finishSplash()` depois, no mesmo evento. O teste "volta ao Login, sem passar pela splash" cobre isso (mutação: com a splash sempre declarada, 2 testes do App falham).
2. **`animation: 'none'` só para quem vem da splash**, pela opção por rota (`route.params.fromSplash`). O `fade` do stack continua para Login ↔ App (4.1). Para o App, o param vai junto do nested: `{ screen: 'Agenda', fromSplash: true }`.
3. **`/me` da abertura sem retry e fora do `useQuery`.** `loadMeOnBoot` chama o service com o `AbortController` do ViewModel (cancelado na trava e no unmount) e grava o cache. A query padrão tem 1 retry e timeout de 15 s, e isso estouraria o tempo da 3.1.5. O 401 continua passando pelo interceptor, que limpa a sessão (`signOutReason: 'expired'`).
4. **`logoBadgeBleed` (1 pt), fora do design.** No vídeo, a capa exatamente do tamanho do selo deixava o antialias rosa da borda aparecer como um contorno durante o wipe. A capa sangra 1 pt para fora. Fora do selo o PNG é transparente, então a sobra preta não aparece, e a cópia continua cobrindo o selo pixel a pixel.
5. **`splashTrack: 1`** é o "trilho de 1 px" da 3.1.2, em token, para não deixar número solto.
6. **O loop começa por um timer do ViewModel em 1500 ms (`showLoader`)**, e não por `withDelay` no UI thread. É um `setState` só, depois do fim da entrada (1200), e ele também liga a acessibilidade do trilho (3.1.8: só acessível quando visível). A animação do loop roda inteira no UI thread.
7. **O trilho fica em posição absoluta abaixo do logo**, para o logo ficar no centro exato e o cálculo do `translateY` bater com o Login. A altura usada é a da raiz da splash (`onLayout`, que é a janela), não `useWindowDimensions`.
8. **10 shared values, não 5** (3.1.8 diz "5"). Separei a opacidade da linha teal, a respiração do selo (multiplica a escala do pop) e o segmento do trilho, para cada animação ser um `withTiming`/`withSpring` simples. Todas são `transform`/`opacity`.
9. A splash só usa as cores do tema (`background`, `primary`, `inputLine`). A capa e a máscara usam `background`.

### Testes (TDD)
- `loadMeOnBoot.test.ts` (3: cache preenchido, timeout → `network`, signal abortado → `canceled`). RED: `Cannot find module '../loadMeOnBoot'`. GREEN: 3 passam.
- `useSplashViewModel.test.tsx` (23, com fake timers): sem token → Login só em 1200 (1199 ainda `null`); espera o bootstrap; token + aluno → App com `timeoutMs: 8000`; 0 aluno → NoStudent; `network`/`server`/`invalidResponse`/`forbidden` → BootError; 401 → Login; `/me` lento decide em 3000; `canceled` não decide; trava de 10 s com token → BootError e aborta o `/me`; trava sem token (keychain pendurado) → Login; reduzir movimento → 600 ms; unmount aborta e não navega; loop (aparece em 1500, não aparece se decidiu em 1200, some quando resolve); `onExitFinished` → `reset` certo para os 4 destinos e `splashDone`.
  RED: `Cannot find module '../../../stores/boot.store'` (nem store nem ViewModel existiam). Na 1ª execução depois da implementação, 19 falharam por um `act` sem `await` no próprio teste (RNTL 14), corrigido no teste. Os 3 do loop foram escritos depois, com RED `Expected: false, Received: undefined` (sem `showLoader`).
  Mutações (todas revertidas): mínimo `wait(0)` → `✕ sem token… 1200 ms` e `✕ reduzir movimento 600 ms`; trava sem `decide` → os 2 testes da trava falham; sem o `if canceled return null` → `✕ canceled não é erro de tela`.
- `SplashScreen.test.tsx` (4): testIDs e a11y (`splash-screen` com label, `splash-logo` `accessible` + `image` + "FIAP School", `splash-loading` `progressbar` + "Carregando"); o trilho só fica acessível a partir de 1500 ms; `BootSplash.hide({fade:false})` uma vez só em dois layouts; depois do mínimo faz `reset` para o Login. RED: `Cannot find module '../SplashScreen'`. Mutações: `onFinished` vazio → `✕ …troca para o Login`; sem a guarda `started` → `✕ …uma vez só`.
- `LoginScreen.test.tsx` (1): `login-logo` 306×49 e raiz com `paddingTop = hero` (insets do mock = 0). RED: `Unable to find an element with testID: login-logo`.
- `App.test.tsx` (7, reescrito antes da fiação, timers reais por causa do MSW): splash JS + `hide({fade:false})` + Login; token + aluno → abas + modal; sem aluno → `no-student-screen`; API fora → `boot-error-screen`; `/me` 401 → Login, sessão `signedOut`/`expired` e keychain vazio; logout depois da splash → Login sem splash; SAIR → Login. RED: 4/7 (`splash-screen`, NoStudent, BootError e 401 não existiam).

### Verificação (fresca, `cd mobile`, sobre `36b80bb`)
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 28 passed; Tests: 173 passed
cd ios && pod install -> Pod installation complete! 109 dependencies, 109 pods
xcodebuild ... -destination 'id=1E7DEFC7-963D-47CD-82A7-224BC5EAD850' build -> ** BUILD SUCCEEDED **
```
- Numa das execuções da suíte inteira apareceu um aviso `An update to HookContainer ... not wrapped in act(...)` em `src/features/report-card/api/__tests__/useReportCardQueries.test.tsx`. É intermitente: rodei a suíte 3 vezes e ele saiu em 1. O arquivo não é desta tarefa, e os testes passam.
- Os `console.warn`/`error` do logger nos testes (`GET /me 500`, `sem resposta`, `resposta fora do contrato`) vêm dos casos de erro, e isso é o esperado.
- **Vídeos** (iOS 18.1, iPhone 16, Debug com Metro; a faixa branca "Downloading 100%" no topo é o banner de dev do Metro):
  - `evidencias/tarefa-8b-splash-login.mp4`: keychain do simulador zerado (`simctl keychain reset`). Mostra preto nativo → wipe com a linha teal → pop do selo → o logo sobe até o lugar do logo do Login → Login sem salto.
  - `evidencias/tarefa-8b-splash-app.mp4`: API do worktree `api` (`node dist/main`, porta 3333, `dev.db` sem reset). O token entrou no keychain do simulador por um auto-login **temporário** no placeholder do Login (`useLoginMutation` com o CPF do seed), que foi revertido antes de gravar (`git status` limpo; nada commitado). Mostra entrada → fade + escala → Agenda. O log da API registra o `GET /api/me` da abertura. A API foi parada no fim.
- **Não gravado:** o loop de espera (precisa de uma API lenta), as saídas para NoStudent/BootError e o reduzir movimento. Eles estão cobertos só pelos testes de ViewModel e de App.

### Como o qa sobe e testa
```
cd mobile && yarn install && (cd ios && pod install)
yarn start                                              # Metro 8081
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850    # build nativo novo (asset da splash mudou)
```
- Sem sessão: `xcrun simctl keychain <udid> reset` e abrir o app. Splash → Login.
- Com sessão: subir a API (`cd api && YARN_IGNORE_PATH=1 yarn build && YARN_IGNORE_PATH=1 node dist/main`). Até a Tarefa 9 não há tela de login, então o token tem de ser posto no keychain (veja o auto-login temporário acima). Com a API no ar: Agenda. Com a API parada: BootError na hora (rede recusada) ou em 8 s (timeout). Com o responsável sem aluno do seed: NoStudent.
- Loop: com a API atrasando o `/me` além de 1,5 s, aparece o trilho com o segmento correndo e o selo respirando.
- Reduzir movimento (Ajustes → Acessibilidade → Movimento): só fades, mínimo de 600 ms, trilho parado.
- Conferir que o logo do Login fica no mesmo lugar onde a splash termina (critério da 3.1.5).

### Pendências de deploy / nativo / ambiente
- **Mudança nativa:** os assets do bootsplash (storyboard, imageset e colorset no iOS, `drawable-*` no Android). Isso exige build nativo novo, não é OTA. Nenhuma dependência nova, nenhuma env, nenhuma migration.
- Android sem build local (sem JDK). Os drawables novos são transparentes e o `styles.xml` está igual. A prova vem do CI (Tarefa 13).

### Ressalvas
1. O vídeo com sessão dependeu de um auto-login temporário (não commitado). A Tarefa 9 deixa isso desnecessário.
2. NoStudent e BootError são placeholders. O TENTAR DE NOVO (`boot-error-retry`) e a barra real são das Tarefas 10/13.
3. Testid novo fora da tabela 7 do design: `login-logo`.
4. Aviso de `act` intermitente em `useReportCardQueries.test.tsx` (anterior a esta tarefa).

### Mensagens
→ chief: mudança nativa (assets do bootsplash), que exige build e não vai por OTA. Dois tokens novos fora do design: `logoBadgeBleed` (correção visual vista no vídeo) e `splashTrack`.
→ developer da Tarefa 9: o Login recebe `route.params.fromSplash`. Com ele, o logo não pode se mexer no 1º frame: nada de `KeyboardAvoidingView` ativo empurrando o logo, e ele fica em `insets.top + spacing.hero`, centralizado, com 306×49. Os campos e o botão fazem a entrada da 4.1. Com reduzir movimento, tudo com `FadeIn(150)`. Quando a sessão expira no `/me` da abertura, o Login abre com `signOutReason === 'expired'` ("Sua sessão expirou").
→ developer da Tarefa 10/13: as rotas `NoStudent` e `BootError` já existem no grupo autenticado. O `/me` da abertura já está no cache `['me']` (o `useMeQuery` não refaz). O TENTAR DE NOVO do BootError pode usar `loadMeOnBoot` ou o `refetch` do `useMeQuery` e depois `reset` para App/NoStudent.
→ developer da Tarefa 14 (Maestro): a splash dura no mínimo 1,2 s + a saída. Espere `login-screen`/`agenda-screen` com timeout de 12 s (já está no ledger).
→ code-reviewer: vale olhar o `RootStack` (Splash condicional + `fromSplashOptions`), a ordem `reset` → `finishSplash` no `onExitFinished` e o `useSplashAnimation` (callbacks `'worklet'` com `scheduleOnRN`).

### Rodada 1 (Tarefa 8b)

Commit `7ce664d` (`fix(mobile): fades da splash com reduzir movimento e trava do keychain`), em cima de `36b80bb`.

- **[IMPORTANTE] fades anulados pelo `ReduceMotion.System`**: corrigido em `7ce664d`.
  - `useSplashAnimation.ts` ganhou a constante `keepWithReducedMotion = { reduceMotion: ReduceMotion.Never }`. Ela entra nos fades:
    - de entrada do ramo reduzido (200 ms);
    - do trilho (aparecer e sumir);
    - da saída reduzida (150 ms);
    - no reset do selo na saída.
  - Os de movimento (wipe, escala, `translateY`, loop) continuam fora do ramo reduzido.
  - `LoginScreen.tsx`: com `fromSplash` e reduzir movimento, usa `FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never)`.
  - Testes (RED antes da correção, pelo motivo certo):
    - `useSplashAnimation.test.tsx` (novo, 4 testes), com `withTiming` espiado: `start`, `startLoop` e `exit` (login e app) só passam config com `reduceMotion: 'never'`. RED: `- "reduceMotion": "never" / + "duration": 150` (e similares nos 4).
    - `LoginScreen.test.tsx` › `vindo da splash com reduzir movimento, o logo faz fade que o sistema não pula`, com o builder do `FadeIn` espiado. RED: `Expected: "never"`, o `reduceMotion` não era chamado. Mutação (tirar o `.reduceMotion(Never)`): o mesmo teste falha.
  - Evidência: `evidencias/tarefa-8b-splash-reduce-motion.mp4`. Liguei o reduzir movimento no simulador com `simctl spawn … defaults write com.apple.Accessibility ReduceMotionEnabled -bool true`. No vídeo:
    - o logo inteiro aparece com fade, sem wipe, linha ou pop;
    - o logo some com fade;
    - o Login monta com o logo em fade no mesmo lugar, sem deslocamento.
  - Depois **desliguei** (`ReduceMotionEnabled` = 0, conferido).
  - O balão amarelo "Open debugger to view warnings" que aparece no vídeo é o aviso do próprio reanimated em `__DEV__` quando o sistema está com reduzir movimento ligado (`utilCommon.ts:74`, emitido ao carregar o módulo). Não é erro do app e não aparece em release.
- **[SUGESTÃO] keychain atrasado depois da trava**: corrigido em `7ce664d`.
  - `session.store.ts`: nova ação `bootstrapTimedOut()`, que vira `signedOut` só se o status ainda for `loading`. O `bootstrap` ignora o resultado do keychain se o status já saiu de `loading`.
  - Na trava sem sessão, o ViewModel chama `bootstrapTimedOut()` antes de decidir `login`.
  - Testes:
    - `session.store.test` › `bootstrapTimedOut fixa signedOut só se o keychain ainda não respondeu`. RED: `bootstrapTimedOut is not a function`.
    - `session.store.test` › `bootstrap atrasado não muda uma sessão que já foi decidida`. RED: o mesmo erro, porque o teste chama a ação.
    - `useSplashViewModel.test` › `trava sem token fixa a sessão como signedOut`. RED: `Expected "signedOut", Received "loading"`.
    - `useSplashViewModel.test` › `keychain que responde com token depois da trava não troca o Login pelas abas`, com fake timers e o keychain respondendo com token em 11 s. RED: `Expected "signedOut", Received "signedIn"`.
  - Mutação (tirar a guarda do `bootstrap`): 2 testes falham.

Verificação (fresca, `cd mobile`, sobre `7ce664d`):
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 29 passed; Tests: 182 passed
```
Nada nativo, nenhuma env e nenhuma dependência nova nesta rodada. Não refiz o build iOS: a rodada só mexe em JS, e o vídeo foi gravado com o Metro deste worktree.

→ developer da Tarefa 9 e seguintes: todo fade que o design manda manter com reduzir movimento precisa de `ReduceMotion.Never` (no `withTiming` ou com `.reduceMotion(ReduceMotion.Never)` no builder). O padrão do reanimated 4 pula a animação.

### Rodada 3

Commits `7e80e60` e `b821797`, na branch `feat/api`. O push falha porque não há remote. Nesta rodada mudaram só 6 arquivos (`git diff --stat 7d16ad0..HEAD`): o limiter, o interceptor, os dois specs deles, o e2e novo de concorrência e o `.gitattributes`. Nenhum e2e existente foi tocado.

1. **[IMP, R2-1] Corrida no limite por CPF:** corrigido em `7e80e60`.
   - `LoginFailureLimiter.tryAcquire(key)`: a checagem e a reserva acontecem no mesmo tick, sem `await`. Ela devolve 0 quando reservou, e a reserva já conta como falha provisória. Quando a chave está bloqueada, devolve os ms restantes e não conta nada.
   - O `release(key)` devolve a vaga sem deixar o contador negativo. O `reset(key)` continua zerando. O `registerFailure` saiu.
   - O interceptor chama `tryAcquire` antes do handler (429 + `Retry-After` quando bloqueado). Depois: sucesso → `reset`; `InvalidCredentialsError` → nada, porque a vaga já é a falha contada; qualquer outro erro → `release`.
   - Usei `catchError` no lugar do `finalize` porque ele já separa sucesso e erro sem precisar de flag. O handler do login sempre emite um valor ou um erro.
   - **Critério do e2e (b):** o servidor recebe as 20 requisições bem antes de o primeiro bcrypt (~70 ms, custo 10) terminar. Por isso exatamente 10 reservam vaga e 10 recebem 429, seja qual for a ordem de chegada. As asserções:
     - `429 == 10`;
     - `401 + 200 == 10`;
     - `200 ≤ 1`.
     - A senha certa só pode dar 200 se chegar entre as 10 primeiras, e aí ocupa uma das 10 vagas. Que a senha certa **além** do limite dá 429 com as outras ainda em curso está provado de forma determinística no spec do interceptor, com handlers pendentes (`Subject`). O e2e não consegue fixar a ordem de chegada das requisições paralelas.
   - Testes:
     - e2e novo `test/auth-throttle-cpf-concurrency.e2e-spec.ts` (`TRUST_PROXY=1` e um IP diferente por tentativa):
       - (a) limite 3, 6 senhas erradas em `Promise.all`: exatamente 3 dão 401 e 3 dão 429.
       - (b) o critério acima.
       - RED, com o código da rodada 2: `2 failed`. Em (a) vieram 4× 401, porque um lote furou o limite. Em (b) vieram 9× 429, quando o esperado era 10.
       - GREEN: `2 passed`, e rodei o arquivo 3 vezes seguidas, verde em todas.
     - `login-failure-limiter.spec.ts` reescrito, com 10 casos: reserva imediata (a 4ª é recusada sem nenhuma ter terminado), tempo restante, tentativa recusada que não conta, `release` devolvendo a vaga, `release` sem reserva que não fica negativo, `reset`, janela vencida, chave por CPF e varredura. RED: `10 failed` (`tryAcquire` não existia).
     - `login-failure-limit.interceptor.spec.ts` reescrito, com 6 casos e handlers pendentes: lote de 3 em curso faz a 4ª dar `ThrottlerException` com `Retry-After` 60 sem chamar o handler; a senha certa depois das vagas ocupadas dá 429; falha de credencial mantém a vaga; erro de banco devolve as vagas; sucesso zera; CPF inválido não reserva nada. RED: `5 failed`.
     - Continuam verdes sem alteração: `auth-throttle-cpf.e2e-spec.ts` (rodízio de IP, 3 falhas → 429, senha certa → 429, outro CPF livre), `auth-throttle-cpf-success.e2e-spec.ts` (11 logins certos → 200, sucesso zera) e `auth-throttle.e2e-spec.ts`.
2. **[IMP] `.gitattributes`:** corrigido em `b821797`, na raiz do repositório.
   - Regras: `*.sh text eol=lf`, `api/docker-entrypoint.sh text eol=lf`, `gradlew text eol=lf` e `*.bat text eol=crlf`.
   - `git check-attr eol`: `api/docker-entrypoint.sh: eol: lf`, `api/scripts/smoke.sh: eol: lf`, `mobile/android/gradlew: eol: lf` e `mobile/android/gradlew.bat: eol: crlf`.
   - `git add --renormalize .` não mudou nenhum arquivo, porque todos os `.sh` desta branch já estavam com LF (`file` confirma: sem CRLF).
   - Atenção: o `mobile/` não existe nesta branch. Quando as trilhas se juntarem, o `gradlew.bat` da branch mobile pode aparecer como modificado se estiver salvo com LF. Basta um `git add --renormalize mobile/android/gradlew.bat` lá.

Verificação (`cd api`, `YARN_IGNORE_PATH=1`): format:check ok, lint e tsc exit 0, `yarn test` `Tests: 298 passed` (22 suítes), `yarn test:e2e` `Tests: 121 passed` (18 suítes), build ok e `./scripts/smoke.sh` `SMOKE OK`. `actionlint` ok, e `shellcheck` dos dois scripts e do entrypoint ok.

**Ficou de fora** (última rodada do protocolo):
- O Docker nunca foi executado nesta máquina: o build multi-stage, o `docker-entrypoint.sh` no container, o `COPY --chmod` (que exige BuildKit) e o `docker-smoke.sh` só rodam no primeiro CI.
- A CSP do `/docs` não foi vista num navegador real.
- O limite por CPF continua em memória por processo e zera num restart.
- O e2e (b) não fixa a ordem de chegada; o caso "senha certa além do limite" é provado no spec unitário.

Não há env nova nem migration.

## Tarefa 9 — Mobile: Login

Worktree `.claude/worktrees/mobile`, branch `feat/mobile`, base `7ce664d`, último commit `b451016`.
Commits: `7f69878` (componentes Screen, UnderlineInput, CpfInput, PrimaryButton + tokens), `b451016` (tela de Login, ViewModel, textos, dependências).
Push não feito: o repositório não tem remote (`git remote -v` vazio).

### Dependências novas (JS puro, sem nativo)
| Pacote | Versão | Por quê esta |
|---|---|---|
| react-hook-form | 7.90.0 | a 7.91.0 saiu há 4 dias; fiquei na anterior, de 11/10 |
| @hookform/resolvers | 5.9.1 | a 6.0.x saiu em 19 e 27/10; a 5.9.1 (08/2026) aceita zod `^3.25 \|\| ^4` e RHF `^7.55` |

### O que mudou (tudo em `mobile/`)
- `src/components/Screen.tsx`: fundo `background`, área segura por `edges`, `scroll` (ScrollView com `keyboardShouldPersistTaps`), `keyboard` (KAV `padding` no iOS) e `footer` fixo fora da rolagem; coluna `contentMaxWidth` no tablet.
- `src/components/UnderlineInput.tsx`: rótulo `label`/`labelFocused` no foco, `TextInput` com a variante `inputValue` (restyle `createVariant` + `spacing`), linha de 1 pt com cor animada `inputLine → text`, testID da linha `<testID>-line`.
- `src/components/CpfInput.tsx`: `UnderlineInput` com `number-pad`, `maxLength 14`, `username`, hint "Somente números" e `formatCpf` em cada mudança.
- `src/components/PrimaryButton.tsx`: `ButtonContainer variant="primary"`, texto `textDisabled`/`textOnPrimary` com cor animada, spinner com `loadingTestID`, `accessibilityState {disabled, busy}`, rótulo de carregando, escala 0,98 com spring `press`, `bottomInset` pintado de `primary`.
- `src/constants/strings.ts`: textos do login da seção 5 do design.
- `src/hooks/useShakeStyle.ts`: shake `withSequence(-10, 10, -8, 8, -4, 0)` de 50 ms, disparado quando o gatilho muda; sem shake com reduzir movimento.
- `src/features/auth/useLoginViewModel.ts`: RHF + `zodResolver(loginFormSchema)` (`mode: 'onChange'`), `useController` para CPF e senha, `useLoginMutation` para o envio, mensagens por `kind`, `shakeKey`, `passwordRef`/`focusPassword`.
- `src/features/auth/components/LoginErrorMessage.tsx`: texto `error` com `FadeInDown(base)` de 8 pt e `FadeOut(fast)`, `accessibilityLabel` sem `\n`, `accessibilityLiveRegion="polite"` e `announceForAccessibility` no iOS.
- `src/features/auth/LoginScreen.tsx`: o placeholder saiu. Tela da 3.2: logo em `insets.top + hero`, CPF, senha, erro e botão no rodapé; entradas da 4.1 (`fromSplash`, reduzir movimento e logout).
- `src/theme/components.ts`/`index.ts`: `ButtonContainer` (as `buttonVariants`, que existiam no tema mas não tinham componente).
- `src/theme/motion.ts`: `instant 100`, `pressScale 0.98`, `enterOffset 12`, `enterOffsetSmall 8`, `shake`. `src/theme/sizes.ts`: `inputLine 1`, `fixedHeightFontScale 1.3`.
- `src/test/renderWithTheme.tsx`: `render` com o `ThemeProvider`.
- Testes: `components/__tests__/{PrimaryButton,CpfInput}.test.tsx`, `features/auth/__tests__/{useLoginViewModel,LoginScreen}.test.tsx`, e um caso novo em `app/__tests__/App.test.tsx`.

### Decisões
1. **Sucesso não navega do ViewModel.** O `useLoginMutation` já grava o token e chama `signIn`. Com `status: 'signedIn'` o RootStack troca o Login pelo grupo autenticado (padrão de auth da Tarefa 8), com o `animation: 'fade'` padrão do stack, porque o Login não leva `fromSplash` para o App. O teste do App prova login → `agenda-screen`, e o vídeo mostra o fade.
2. **Texto por `kind`:** `unauthorized` → `login.error.invalid` (Figma, não a string da API); `rateLimited` → `login.error.tooMany` (o design já tinha o texto, não precisei propor); `network` → `login.error.network`; `storage` → `error.message` (texto pronto da Tarefa 8); `canceled` → nada; o resto (5xx, 400, `invalidResponse`, `unknown`) → `login.error.server`. O chief escreveu "rede/5xx → mensagem de conexão", mas a seção 5 do design tem um texto próprio para servidor, e usei os dois.
3. **Shake em todo envio que falha** (não só 401 e rede, como na tabela 4.2): é o mesmo gesto de "não deu", e o texto diz o motivo. `canceled` e o aviso de sessão expirada não tremem.
4. **`shakeKey` derivado de `mutation.submittedAt`** (0 sem erro). A 1ª versão usava um contador incrementado no `onError` do `mutate`, e o `setState` dentro do callback do TanStack (num `setTimeout`) dava aviso de `act` intermitente. Derivado no render, cada `mutate` que falha tem um `submittedAt` novo, então errar de novo sem editar treme de novo (teste próprio).
5. **"Confira o CPF digitado."** usa o próprio `loginFormSchema.shape.cpf` no blur, só com 11 dígitos; some no próximo `onChangeText`. O botão continua dependendo do `formState.isValid` do RHF.
6. **Máscara em dois lugares (idempotente):** o `CpfInput` mascara (componente reutilizável, design 2.6) e o ViewModel também (`formatCpf` no valor do formulário), para o valor ficar certo mesmo se outro componente chamar o handler.
7. **Cor animada com `withTiming` de cor dentro do `useAnimatedStyle`**, não `interpolateColor`: o reanimated interpola cor no UI thread do mesmo jeito, o estado inicial nasce certo, e no mock do Jest o `withTiming` devolve a cor final (o `interpolateColor` do mock devolve `undefined`).
8. **Escala de pressionar no conteúdo do botão, não no botão.** O botão é largura total colado na base; escalar o fundo abriria uma borda preta em volta.
9. **Teclado:** o KAV usa `keyboardVerticalOffset = -insets.bottom` quando há rodapé, para a faixa do inset do botão ficar atrás do teclado e o texto ficar logo acima dele. No Android, `behavior` indefinido (`adjustResize`, como o design manda).
10. **Botão com fade também nos ramos de fade** (logout e `fromSplash` com reduzir movimento). A 4.1 cita só logo e campos; sem isso, o botão apareceria seco.
11. O rótulo visual do input fica fora do leitor de tela (`importantForAccessibility="no"`): quem lê "CPF"/"Senha" é o próprio campo, para não ler duas vezes.

### Testes (TDD) — RED antes de cada implementação
- `PrimaryButton.test.tsx` (4) e `CpfInput.test.tsx` (6). RED: `Cannot find module '../PrimaryButton'` e `Cannot find module '../CpfInput'`. GREEN: 10. Uma falha depois do GREEN era do teste: o rótulo está escondido do leitor e o `getByText` padrão não o acha; o teste passou a usar `includeHiddenElements`.
- `useLoginViewModel.test.tsx` (21): máscara, botão (inicial, só CPF, DV errado, senha vazia), "go" com formulário inválido não chama a API, erro de CPF no blur e incompleto sem erro, sucesso abre a sessão e grava o token, carregando sem envio duplo, 401 com texto e shake mantendo os valores, mensagem some ao editar, 429, rede, 5xx, keychain (`storage`), `canceled` sem mensagem nem shake, sessão expirada (aparece, some ao digitar, `manual` não mostra), "next" foca a senha, errar de novo dispara outro shake.
  RED: `Cannot find module '../useLoginViewModel'`. GREEN: 20 (o 21º veio com a Decisão 4, ver abaixo).
  Mutações (todas revertidas, `diff` conferido): sem a guarda de `isPending` → `✕ fica carregando… e não envia duas vezes`; shake em `canceled` → `✕ request cancelado…`; sem `mutation.reset()` → `✕ a mensagem de erro some…`; sem `setShowCpfError(true)` → `✕ ao sair do campo mostra "Confira o CPF digitado."…`; `shakeKey` constante → `✕ errar de novo sem editar dispara outro shake`.
  Uma mutação **passou** na 1ª rodada (shake também em `canceled`): o teste lia o estado antes de a mutation terminar. Reescrevi o teste para segurar o `login` numa promessa e rejeitar com `canceled` dentro de `act`; com isso a mutação falha (`Expected: 0, Received: 1793149517357`) e o código certo passa.
- `LoginScreen.test.tsx` (8, os 2 da 8b mantidos): logo 306×49 em `hero`, fade `Never` vindo da splash com reduzir movimento, campos e botão desabilitado (`next`, `go`, `secureTextEntry`, `password`, rótulo "Senha"), máscara + habilita, senha errada → `login-error-message` com o texto, rótulo sem `\n`, live region e `withSequence` chamado, reduzir movimento sem `withSequence`, carregando com `login-submit-loading` e campos `editable=false`, sessão expirada com o aviso.
  RED: 7 de 8 falharam (`Unable to find an element with testID: login-content` / `login-cpf-input` / `login-error-message`); o 1 que passou é o da 8b (fade da splash), que o placeholder já atendia. GREEN: 8.
- `App.test.tsx` › `login com CPF e senha certos entra nas abas e guarda o token`: escrito depois da tela pronta, **passou de primeira**. É caracterização da integração (o comportamento já vinha dos testes de ViewModel e de tela), não RED.

### Verificação (fresca, `cd mobile`, sobre `b451016`)
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 32 passed; Tests: 220 passed (antes: 29 / 182)
xcodebuild -workspace FiapSchool.xcworkspace -scheme FiapSchool -configuration Debug -sdk iphonesimulator \
  -destination 'id=1E7DEFC7-963D-47CD-82A7-224BC5EAD850' -derivedDataPath build/DerivedData build -> ** BUILD SUCCEEDED **
```
- Aviso de `act` **intermitente e anterior a esta tarefa** em `src/features/lessons/api/__tests__/useAgendaQuery.test.tsx` (`An update to HookContainer…`): apareceu em 3 de 7 rodadas da suíte inteira; os testes passam. O aviso intermitente que era meu (`LoginScreen` no teste do spinner: a mutation avisa o fim num tick seguinte) foi corrigido esperando o spinner sair; 3 rodadas seguidas sem ele.
- Os `console.info/warn/error` nos testes são do logger nos casos de erro (401, 429, rede, 500), como nas tarefas anteriores.

### Evidências no simulador (iOS 18.1, iPhone 16, Debug com o Metro deste worktree)
API real do worktree `api` (`YARN_IGNORE_PATH=1 yarn build` + `node dist/main`, porta 3333, `.env` e `dev.db` existentes, sem reset). A API foi parada no fim.

**Como dirigi o app:** o simulador roda sem o Simulator.app (não há `Simulator.app` no Xcode desta máquina), então não há toque nem teclado de verdade, e não há idb nem Maestro. Dirigi pelo inspector do Metro (CDP, `Runtime.evaluate` com `Origin: http://localhost:8081`): um script acha a fibra pelo `testID` e chama os handlers reais do componente (`onChangeText` letra a letra, `onSubmitEditing`, `onPress`) e o `blur()` nativo do campo. Isso passa pelo `CpfInput`, pelo ViewModel e pelo mutation, como um toque faria, mas **não** exercita o teclado nativo. Nada foi mudado no código do app para isso.
- `evidencias/tarefa-9-login.mp4` (19 s): keychain zerado → splash → logo sobe para o lugar do Login, sem salto (conferi quadro a quadro: a posição final da splash é a do logo do Login) → campos e botão entram → CPF digitado com máscara progressiva (`96` → `969.29` → `969.294.56` → `969.294.560-04`) → "next" foca a senha (SENHA em negrito, cursor teal) → senha errada → mensagem teal em 2 linhas + shake (visto a 20 fps) → editar a senha apaga a mensagem → senha `123456` → fade para as abas.
- `evidencias/tarefa-9-sessao-persistida.mp4` (12 s): app nas abas → `simctl terminate` (home) → reabre → splash → Agenda direto, sem Login (o log da API registra o `GET /api/me` da abertura) → toca BOLETIM para mostrar que o app está vivo.
- `evidencias/tarefa-9-estados/`: `1-inicial.png`, `2-cpf-mascara-senha-focada.png`, `3-pronto.png`, `4-carregando.png`, `5-erro.png`. Para o carregando, troquei a API por um servidor que segura a resposta 6 s na mesma porta (só para o print) e depois voltei; no print o `login-submit-loading` está visível e os campos `editable=false`. Lado a lado com `docs/figma/screens/01-login.png`, os 5 batem (o "Carregando" do Figma não desenha o spinner; o design 2.7 pede o spinner, e ele está lá).

### Como o qa sobe e testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && YARN_IGNORE_PATH=1 node dist/main   # 3333
cd mobile && yarn install && (cd ios && pod install)                           # dependências JS novas, pod igual
yarn start                                                                     # Metro 8081
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
xcrun simctl keychain 1E7DEFC7-963D-47CD-82A7-224BC5EAD850 reset               # começar sem sessão
```
- Gustavo `969.294.560-04` / `123456` → abas. Senha errada → mensagem + shake. CPF `969.294.560-05` e sair do campo → "Confira o CPF digitado.", botão desabilitado.
- 429: errar a senha do mesmo CPF além do limite da API (`LOGIN_THROTTLE_CPF_LIMIT`) → "Muitas tentativas seguidas…".
- Rede: parar a API e enviar → "Não conseguimos falar com o servidor…".
- Sessão expirada: entrar, trocar o `JWT_SECRET` da API (ou apagar o responsável) e reabrir o app → Login com "Sua sessão expirou. Entre de novo.".
- Com teclado de software: conferir que o botão sobe junto e fica logo acima do teclado (ver Ressalva 1).
- Reduzir movimento: sem shake; vindo da splash, logo, campos e botão só com fade.

### Pendências de deploy / nativo / ambiente
- Nenhuma mudança nativa, env ou migration. As duas dependências novas são JS puro, então vão por OTA quando houver (Tarefa 15).

### Ressalvas
1. **Teclado não visto na tela.** O simulador headless não mostra teclado de software, então o `KeyboardAvoidingView` (botão acima do teclado, `keyboardVerticalOffset = -insets.bottom`) não foi visto rodando. O qa deve conferir num simulador com o Simulator.app ou num aparelho.
2. **iOS `number-pad` não tem tecla de retorno:** o "next" do CPF só existe no Android. No iOS o usuário toca no campo da senha. Uma barra com "Próximo" (`InputAccessoryView`) não está no design e ficou de fora.
3. **Depois de um erro a senha perde o foco** (o campo fica `editable=false` durante o envio, e o iOS tira o foco). Isso bate com o design ("não abrir o teclado sozinho"), mas o usuário precisa tocar de novo para corrigir.
4. **Responsável sem aluno (Carlos) vai para a Agenda depois do login**, porque o login não chama o `/me` e o RootStack abre `App`. Na abertura com token a splash já decide NoStudent. O destino depois do login com 0 aluno é do M7, e o M7 é da Tarefa 10.
5. Android não buildado (sem JDK); nada nativo mudou.
6. `testID` novo fora da tabela 7: `login-content` (o container do conteúdo, usado no teste do `paddingTop`) e `<testID>-line` nos inputs.

### Mensagens
→ chief: duas dependências JS novas (`react-hook-form` 7.90.0, `@hookform/resolvers` 5.9.1), versões fixas e com mais de duas semanas; nada nativo.
→ chief: Decisão 2 (5xx com o texto `login.error.server` do design, não o de conexão) e Decisão 3 (shake em todo erro de envio, não só 401/rede). Se preferir o texto literal da instrução, é uma linha no `messageFor`.
→ developer da Tarefa 10: depois do login o app vai para `App` mesmo com 0 aluno (Ressalva 4). Dá para resolver no ViewModel das abas/Header (com o `/me` em mãos, `reset` para `NoStudent`) ou no RootStack. Os componentes `Screen`, `PrimaryButton`, `UnderlineInput` e `ButtonContainer` (variantes `primary`/`secondary`) estão em `src/components` e `src/theme`; o `strings.ts` está pronto para receber as chaves do Header.
→ developer da Tarefa 14 (Maestro): o `login-cpf-input` aceita o CPF só com dígitos (a máscara entra sozinha); `login-error-message` tem o texto com `\n`, então use regex (`"Usuário ou senha inválida.*"`).
→ qa: conferir o teclado de software (Ressalva 1) e o 429 com a API real.
→ code-reviewer: vale olhar o `shakeKey` derivado de `submittedAt` (Decisão 4), o `keyboardVerticalOffset` negativo do `Screen` e o `ThemedTextInput` do `UnderlineInput` (variante de texto + `spacing` do Restyle num `TextInput`).

### Rodada 1 (Tarefa 9)

Commit `473626f` (`fix(mobile): teclado no Android, anúncio do erro e login fora do cache`), em cima de `b451016`.

- **[IMPORTANTE] teclado cobre o FAZER LOGIN no Android (edge-to-edge)**: corrigido em `473626f`.
  - `Screen.tsx`: `behavior="padding"` nas duas plataformas (saiu o `Platform`). O `keyboardVerticalOffset = -insets.bottom` com rodapé ficou igual: no Android o inset de baixo é a barra de navegação, que o teclado cobre. O comentário agora explica o edge-to-edge (`gradle.properties:44`).
  - Teste novo `src/components/__tests__/Screen.test.tsx` (3). O `KeyboardAvoidingView` não repassa `behavior` à View nativa, então o teste troca o módulo por uma View que expõe as props recebidas, e usa `jest.replaceProperty(Platform, 'OS', …)`. Os casos: iOS com `padding`; Android com `padding`; offset `-34` com rodapé e insets `{bottom: 34}`.
    RED: `✕ no Android (edge-to-edge, sem adjustResize) também usa padding` com `Expected: "padding" / Received: undefined`. Os outros 2 já passavam e ficam como caracterização. GREEN: 3.
  - **Prova visual pendente:** sem JDK não há build Android aqui. Fica com o qa num emulador Android 11+ (tocar no CPF: o botão deve ficar logo acima do teclado) ou com o CI da T13/Maestro.
- **[SUGESTÃO] erro não anunciado pelo TalkBack**: corrigido em `473626f`.
  - `LoginErrorMessage.tsx`: `announceForAccessibility(spoken)` nas duas plataformas, uma vez por mensagem (efeito em `spoken`; o `key={message}` do Login remonta a cada erro novo).
  - **Tirei o `accessibilityLiveRegion`.** A view nasce a cada erro, e nesse caso a live region não anuncia. Se em algum aparelho ela anunciar, junto com o `announce` o erro seria lido duas vezes. O teste da tela que conferia a live region perdeu essa linha.
  - Teste novo `src/features/auth/components/__tests__/LoginErrorMessage.test.tsx` (3): anúncio uma vez, sem `\n`, no iOS e no Android, mais o texto em 2 linhas com o rótulo sem quebra.
    RED: `✕ anuncia a mensagem… no android`. Na 1ª versão o caso Android passava por engano. O `announceForAccessibility` do preset do RN já é um `jest.fn`, então o `spyOn` reaproveitava o mock com a chamada do teste do iOS. Achei isso logando a plataforma no spy, e o `mockClear()` no `beforeEach` corrigiu o teste. Depois disso, o RED veio pelo motivo certo. GREEN: 3.
- **[SUGESTÃO] CPF e senha no cache de mutations**: corrigido em `473626f`. `useLoginMutation` com `gcTime: 0`.
  - Teste `useLoginMutation.test` › `não guarda CPF e senha no cache de mutations depois que o Login sai`: faz login, confere 1 mutation no cache, desmonta e espera o cache vazio. O `gcTime: 0` da mutation vence o `Infinity` que o `jest.setup` põe como padrão.
    RED: `Expected length: 0 / Received length: 1`, com `"variables": {"cpf": "969.294.560-04", "password": "123456"}` no cache, o mesmo cenário do review. GREEN.
  - O plugin do Reactotron da T13 continua precisando não serializar `variables` (pedido ao chief pelo reviewer).

Verificação (fresca, `cd mobile`, sobre `473626f`):
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 34 passed; Tests: 227 passed (sem aviso de act nesta rodada)
```
Nada nativo, nenhuma env e nenhuma dependência nova. Não refiz o build iOS nem os vídeos: a rodada só mexe em JS. No iOS o `behavior` já era `padding`.

→ qa: Android com emulador: botão acima do teclado no Login. Com o TalkBack: o erro é lido uma vez.

## Tarefa 10 — Mobile: cabeçalho, tab bar, seleção de aluno, sem aluno e logout

Worktree `.claude/worktrees/mobile`, branch `feat/mobile`, base `473626f`, último commit `d5b5c66`.
Commits: `4334db2` (componentes + react-native-svg), `38a6aef` (telas, ViewModels, pós-login e destino), `d5b5c66` (FECHAR abaixo da área segura, achado no simulador).
Push não feito: o repositório não tem remote (`git remote -v` vazio).

### Dependência nova (nativa)
| Pacote | Versão | Por quê |
|---|---|---|
| react-native-svg | 15.16.0 | É a versão que o `expo/bundledNativeModules.json` do Expo 58 fixa para o RN 0.88. Saiu há 12 dias (15/10): mais de 24 h, mas menos que as "duas semanas" que as tarefas anteriores preferiram. A 15.15.5 (maio) não é a testada com o RN 0.88. `pod install`: 110 pods (RNSVG novo). |

### O que mudou (tudo em `mobile/`)
- `src/components/icons/{AgendaIcon,BoletimIcon,LogoutIcon,CloseIcon}.tsx`: um componente por ícone, com `color` e `size`, paths de `docs/figma/assets/*.svg`.
- `src/components/ActionBar.tsx`: logo 100×16, TROCAR PERFIL (só com `canSwitchStudent`) e SAIR com ícone; cada ação ocupa a altura da barra (48) com `paddingHorizontal: s`; opacidade 0,6 ao pressionar; `FadeIn(base)`.
- `src/components/Header.tsx`: barra fixa + `ScrollView` com saudação (`greeting` + `greetingName`), o bloco do aluno (um só elemento acessível) e `children`. Entrada da 4.3. A troca de aluno faz crossfade (`key` = id, `FadeOut(fast)`/`FadeIn(base)`).
- `src/components/TabBar.tsx`: tab bar custom (`tablist`/`tab`, `selected`), altura `tabBar + insets.bottom`. Duas camadas `text`/`primary` com crossfade de opacidade (`base`, `easeOut`), e o ícone que fica ativo faz 1 → 1,12 → 1. Ícone e rótulo vêm das options da aba (`tabBarIcon`, `title`).
- `src/components/StudentCard.tsx`: `Card variant="student"` com `borderColor` animado (`transparent → primary`, `fast`), escala 0,98, `selected` para o leitor.
- `src/components/{SecondaryButton,ErrorState,EmptyState}.tsx`: botão com contorno e spinner que mantém a largura; erro com TENTAR DE NOVO (`<testID>-retry`), entradas da 4.8 e shake curto; vazio com a ilustração cortada em 328×208 (decorativa).
- `src/hooks/useShakeStyle.ts`: padrão `short` (4.8) além do `form` do login.
- `src/theme/motion.ts`: `shakeShort`, `selectStudentBackDelay 120`, `cardStagger 60`, `tabIconPop 1.12`.
- `src/constants/strings.ts`: chaves `header`, `tabs`, `selectStudent`, `noStudent`, `boot`, `common` da seção 5 e da tabela de acessibilidade.
- `assets/no-classroom.png`: cópia de `docs/figma/assets/`.
- `src/features/students/selectedStudent.ts` (`resolveSelectedStudent`) e `useSessionStudent.ts`: o aluno em uso vem do `/me` e do `selectedStudentId`. Se não houver aluno salvo, ou se o salvo não estiver no `/me`, usa o primeiro e grava no store.
- `src/features/header/useHeaderViewModel.ts` + `AppHeader.tsx`: Header das abas ligado ao ViewModel (TROCAR PERFIL só com mais de 1 aluno; SAIR).
- `src/features/auth/useLogout.ts`: `signOut('manual')` (keychain, store, cache), com o botão desabilitado e sem envio duplo.
- `src/features/students/useSelectStudentViewModel.ts` + `SelectStudentScreen.tsx`: modal real, ver as decisões.
- `src/features/students/useNoStudentViewModel.ts` + `NoStudentScreen.tsx`: barra só com SAIR, saudação e EmptyState.
- `src/features/splash/useBootErrorViewModel.ts` + `BootErrorScreen.tsx`: barra só com SAIR + ErrorState.
- `src/features/{lessons/LessonsScreen,report-card/ReportCardScreen}.tsx`: `Screen` + `AppHeader` + texto provisório do conteúdo (T11/T12). O SAIR do placeholder do Boletim, que lia o store direto, saiu. `src/components/PlaceholderScreen.tsx` foi apagado (sem uso).
- `src/navigation/AppTabs.tsx`: `tabBar={TabBar}`, ícones e rótulos das abas.
- `src/navigation/RootStack.tsx`: `useAuthenticatedLanding()`; com `/me` sem aluno no cache, `NoStudent` é declarada antes de `App`.
- `src/features/auth/api/useLoginMutation.ts` + `services/auth.service.ts`: o login busca o `/me` com o token novo (`getMe(…, { token })`) e grava o cache **antes** do `signIn`. Se o keychain falhar, o `/me` sai do cache.
- `src/services/http/interceptors.ts`: um `Authorization` explícito no request não é trocado pelo token da memória, e o 401 dele não encerra a sessão.

### Decisões
1. **Destino depois do login pela ordem das rotas, não por `initialRouteName`.** Tentei primeiro o `initialRouteName` dinâmico, e o teste continuou vermelho. O `useNavigationBuilder` cria o router uma vez só (`useLazyValue`), então o `initialRouteName` fica com o valor do 1º render (`Splash`). Na troca Login → autenticado, o `StackRouter.getStateForRouteNamesChange` não acha a splash e cai em `routeNames[0]`. Por isso o RootStack declara `NoStudent` antes de `App` quando o `/me` do cache não tem aluno. Vindo da splash, quem decide continua sendo o `reset` dela.
2. **O `/me` faz parte do login.** Se ele falhar depois do 200 do login, o login falha junto, com a mensagem pelo `kind` (rede → "Não conseguimos falar com o servidor…"), e nada é gravado. A alternativa (abrir a sessão e cair no BootError) deixaria um token salvo sem saber o destino.
3. **Token explícito no interceptor:** sem isso, um token antigo na memória (o keychain que responde depois da trava da 8b) seria mandado no lugar do novo, e o `/me` viria de outra sessão.
4. **Seleção (4.7):** o card escolhido acende na hora (`chosenId` local). Depois de `fast + 120 ms`, o ViewModel chama `selectStudent(id)` e `goBack()`, então o crossfade do bloco do aluno acontece com o modal descendo. Escolher o aluno atual só fecha. Um 2º toque durante o atraso é ignorado. Se o modal sai antes (voltar do Android), nada é trocado.
5. **Header com `children`:** a barra fica fixa e a saudação rola junto com o conteúdo (2.2). Por isso o Header recebe o conteúdo da tela. O BootError usa só a `ActionBar` (sem saudação, 3.7).
6. **Crossfade só a partir da 2ª troca de aluno:** o 1º aluno entra com a entrada da tela (`FadeInDown` com `stagger`); os seguintes, com `FadeIn(base)`. As animações usam `ReduceMotion.System`, porque o design não manda manter nenhum desses fades com reduzir movimento.
7. **BootError:** TENTAR DE NOVO usa o `loadMeOnBoot` (sem retry, timeout de 8 s, como a splash) e faz `reset` para `App` ou `NoStudent`. Com 401, o interceptor encerra a sessão e o RootStack leva ao Login. Com `canceled`, nada acontece. Qualquer outro erro: o botão para de carregar e o bloco treme (`shakeKey`).
8. O nome do aluno no header usa o `firstName` do `/me` como vem (já é o 1º nome no contrato), em caixa normal, com `textTransform: 'uppercase'`.

### Testes (TDD) — RED antes de cada implementação
- `useSessionStudent.test.tsx` (10, com `resolveSelectedStudent`). RED: `Cannot find module '../selectedStudent'`. GREEN: 10.
- `useLogout.test.tsx` (2) e `useHeaderViewModel.test.tsx` (4). RED: `Cannot find module '../useLogout'` / `'../useHeaderViewModel'`. GREEN: 6.
- `useSelectStudentViewModel.test.tsx` (6, com fake timers: atraso de 270 ms, aluno atual, 2º toque, FECHAR, unmount). RED: `Cannot find module`. GREEN: 6. Um aviso de `act` vinha do próprio teste, que restaurava a ação do store fora do `act`; corrigi o teste.
- `useBootErrorViewModel.test.tsx` (7). RED: `Cannot find module`. Na 1ª execução, 1 caso (401) falhou por erro de montagem do teste: o token tinha sido gravado por outra instância do `secureStorage`, e o request saía sem token. O teste passou a usar o `secureStorage` do app. GREEN: 7.
- `useLoginMutation.test.tsx` (+2: `/me` com `Bearer jwt-gustavo` no cache antes do `signedIn`; `/me` que falha → `network`, sem sessão e sem token). RED: `Expected "Bearer jwt-gustavo" / Received null` e `isError false`. GREEN. Mais 1 asserção (cache sem o `/me` quando o keychain falha). RED: o `/me` do Gustavo estava no cache. GREEN.
- `client.test.ts` (+2: Authorization explícito vence o da memória; 401 dele não derruba a sessão). RED: `Received "Bearer jwt-antigo"` / `Received "signedOut"`. GREEN.
- `useNoStudentViewModel.test.tsx` (2). RED: `Cannot find module`. GREEN.
- Componentes: `Header` (6: 2 alunos, maiúsculas pela variante, 1 aluno sem TROCAR PERFIL, sem aluno + conteúdo, SAIR desabilitado, altura da barra), `StudentCard` (4: selecionado com borda `primary`, não selecionado com borda transparente de 1, rótulo, toque), `TabBar` (4: `tablist`/`tab`/`selected`, camada ativa, navegação só da inativa, altura + inset), `ErrorState` (3), `EmptyState` (2). RED: `Cannot find module` nos 5. GREEN: 19.
- `SelectStudentScreen.test.tsx` (2, insets falsos com `top: 47`). O 1º RED foi pelo motivo errado (faltava o testID `select-student-close`). Com o testID adicionado, veio o RED certo, `- top: 63 / + top: 16`. GREEN depois do `insets.top + m`.
- `App.test.tsx` (+5): o login do Carlos leva ao `no-student-screen`, e não às abas (RED: `Unable to find … no-student-screen`). Os outros quatro, com RED `Unable to find … header-greeting` / `boot-error-retry`: Header nas abas, troca no Boletim que volta ao Boletim com Marina e `selectedStudentId = s2`, 1 aluno sem TROCAR PERFIL, NoStudent real com SAIR → Login, e BootError → TENTAR DE NOVO → abas.
- Mutações (todas revertidas): sem o `selectStudent` do fallback → 2 falham em `useSessionStudent`; `students.length > 0` → `✕ com um aluno só, não pode trocar`; sem `NoStudent` antes de `App` → `✕ login de responsável sem aluno abre o NoStudent`.
  - Na 1ª tentativa, o meu script de mutação usou `git checkout` como "restaurar" e reverteu o `RootStack.tsx` ao commit anterior. Ele também deixou 2 mutações em arquivos ainda não versionados. Percebi pelo `git status`, restaurei os 3 arquivos e rodei os testes de novo (43/43) antes de commitar.

### Verificação (fresca, `cd mobile`, sobre `d5b5c66`)
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 46 passed; Tests: 288 passed (antes: 34 / 227)
cd ios && pod install -> Pod installation complete! 110 dependencies, 110 pods
xcodebuild … -destination 'id=1E7DEFC7-963D-47CD-82A7-224BC5EAD850' build -> binário de 22:55 com 11351 símbolos RNSVG, instalado e rodando
```
- O aviso de `act` intermitente continua vindo de `src/features/lessons/api/__tests__/useAgendaQuery.test.tsx` (anterior a esta tarefa; apareceu em 3 de 4 rodadas, atribuído pelo bloco de console da suíte). Os testes passam.
- O `xcodebuild` rodou com `| tail`, que escondeu o "BUILD SUCCEEDED". Conferi pelo binário novo (22:55, com RNSVG) e pelo app rodando os ícones SVG.

### Evidências (iOS 18.1, iPhone 16, Debug, Metro deste worktree, API real do worktree `api` na 3333, `dev.db` sem reset; a API foi parada no fim)
O app foi dirigido pelo inspector do Metro (CDP), como na Tarefa 9: os handlers reais (`onChangeText`, `onPress`) foram chamados pela fibra, sem toque nativo. O toast amarelo do LogBox foi dispensado pelo próprio `onPressDismiss` (ver Ressalva 3).
- `evidencias/tarefa-10.mp4` (25 s): login do Gustavo → Agenda com "Olá, GUSTAVO", **JOANA** e TROCAR PERFIL → aba Boletim → TROCAR PERFIL → modal sobe → Rafael (a borda acende) → volta ao Boletim com RAFAEL (crossfade) → TROCAR PERFIL → Joana → volta ao Boletim com JOANA → aba Agenda → aba Boletim → SAIR → fade para o Login.
- `evidencias/tarefa-10-header-2-alunos.png` (Gustavo), `tarefa-10-header-1-aluno.png` (Adelaide, 508.795.670-07: "Olá, ADELAIDE", BIANCA, `1EF - RM 13752 - Tarde`, só SAIR), `tarefa-10-selecao.png` (FECHAR teal abaixo da status bar, aluno atual com borda teal), `tarefa-10-sem-aluno.png` (Carlos, 314.159.265-90, que **entrou pelo login**: "Olá, CARLOS", ilustração, "Nenhum aluno vinculado", só SAIR, sem tab bar).
- Na 1ª gravação, o FECHAR aparecia sobre a status bar: daí o commit `d5b5c66` e a gravação nova.

### Como o qa sobe e testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && YARN_IGNORE_PATH=1 node dist/main   # 3333
cd mobile && yarn install && (cd ios && pod install)                           # pod novo: RNSVG
yarn start                                                                     # Metro 8081
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850                           # build nativo novo
xcrun simctl keychain 1E7DEFC7-963D-47CD-82A7-224BC5EAD850 reset
```
- Gustavo `969.294.560-04` / `123456`: TROCAR PERFIL + SAIR. Trocar de aluno a partir do Boletim deve voltar ao Boletim (M6). FECHAR, gesto de voltar do Android e o aluno atual voltam sem trocar.
- Adelaide `508.795.670-07` / `987654`: só SAIR.
- Carlos `314.159.265-90` / `111111`: pelo login **e** reabrindo o app → NoStudent; SAIR → Login.
- BootError: entrar, parar a API e reabrir o app → BootError; subir a API e tocar TENTAR DE NOVO → Agenda. Com a API parada, TENTAR DE NOVO → spinner, depois o bloco treme. SAIR funciona offline.
- Tab bar: crossfade de cor e pop do ícone; com reduzir movimento, a troca é seca.
- VoiceOver: a barra lê "Trocar aluno" / "Sair da conta"; o bloco do aluno é um elemento só ("Aluno Joana, turma 2EM, RM 12568, período Matutino"); as abas são `tab` com "selecionado".

### Pendências de deploy / nativo / ambiente
- **Mudança nativa:** `react-native-svg` (pod RNSVG; no Android, autolinking). Exige build de loja, não vai por OTA.
- Nenhuma env, nenhuma migration. Android não buildado (sem JDK).

### Ressalvas
1. **Ordem dos alunos no `/me` (API):** a API real devolve Joana antes de Rafael. O `PrismaGuardianProfilesRepository.findProfileById` não tem `orderBy` nos alunos, então a ordem é a da tabela de junção, não a do JSON (Rafael, Joana). Com isso, o aluno padrão do Gustavo é Joana, e não Rafael como no Figma. O app segue a ordem do `/me` (decisão do chief). A correção é na trilha da API (ver Mensagens). Por isso o vídeo começa em Joana e troca para Rafael e de volta.
2. **iOS: o `fullScreenModal` do native-stack não fecha com o gesto de descer** (o design 3.5 cita o gesto). O FECHAR e o voltar do Android funcionam. Para ter o gesto, seria preciso `presentation: 'modal'` (sheet, deixa a tela de trás visível no topo, diferente do Figma de tela cheia). Não troquei sem decisão.
3. **Toast do LogBox "Open debugger to view warnings"**: o aviso é `Sending onAnimatedValueUpdate with no listeners registered`, do `Animated` nativo usado pelas libs de navegação (o app usa reanimated). Já aparece no Login, antes das telas desta tarefa. Só em dev; cobre a tab bar nos vídeos se não for dispensado.
4. **Foco do leitor no título ao abrir a seleção (6.4)** não foi implementado. O título é `header`, mas o foco inicial fica com o sistema.
5. **testIDs novos fora da tabela 7:** `header-action-bar`, `select-student-close` (o container do FECHAR), `select-student-card-<rm>-box`, `tab-<aba>-active-layer`, `no-student-empty` e `boot-error` (raiz do ErrorState; o `boot-error-retry` é o da tabela).
6. O conteúdo das abas ainda é provisório ("As aulas do dia entram aqui." / "Notas e faltas…", texto literal fora do `strings.ts`) até T11/T12.
7. O shake do BootError e o spinner do TENTAR DE NOVO estão cobertos por testes, mas não gravados.

### Mensagens
→ chief: mudança nativa (`react-native-svg` 15.16.0, a versão do Expo 58 para o RN 0.88, com 12 dias de publicação). Exige `pod install` e build; não vai por OTA.
→ chief / developer da trilha API: `GET /me` sem ordem definida para os alunos (`prisma-guardian-profiles.repository.ts`, `students` sem `orderBy`). Hoje vem Joana antes de Rafael. Sugestão: ordenar pela ordem do seed (um campo `position` no `GuardianStudent`, ou `orderBy: { student: { rm: 'asc' } }`, que dá Rafael 12567 antes de Joana 12568) e um e2e que fixe a ordem. O app usa o primeiro aluno do `/me` como padrão.
→ chief (usuário): gesto de descer no iOS na seleção de aluno (Ressalva 2). Manter `fullScreenModal` (fiel ao Figma, sem gesto) ou trocar para `modal` (com gesto, visual de sheet)?
→ developer da Tarefa 11/12: use `<Screen testID="…"><AppHeader>{conteúdo}</AppHeader></Screen>`, e o aluno via `useSessionStudent().student?.id` (as queries já têm o id na key; trocar de aluno troca de query). `ErrorState` (`retrying`, `shakeKey`) e `EmptyState` estão em `src/components`; `strings.common.retry`/`error.description` estão prontos.
→ developer da Tarefa 14 (Maestro): o aluno padrão do Gustavo depende da Ressalva 1. O nome do aluno está em `header-student-name` (use regex sem caixa). Os cards são `select-student-card-<rm>`. O texto das abas aparece duas vezes na hierarquia (camadas do crossfade).
→ code-reviewer: vale olhar o `RootStack` (ordem das rotas no lugar do `initialRouteName`, Decisão 1), o interceptor com `Authorization` explícito e o atraso + unmount do `useSelectStudentViewModel`.

### Rodada 1 (Tarefa 10)

Commit `1092f58` (`fix(mobile): alvo de toque das ações do header na altura da barra`), em cima de `d5b5c66`.

- **[IMPORTANTE] alvo de toque de TROCAR PERFIL e SAIR com a altura do texto**: corrigido.
  - `ActionBar.tsx`: a altura `sizes.actionBar` (48) foi para o `style` do próprio `Pressable`, que é a área de toque. O `Box` interno passou de `height="100%"` para `flex={1}`, e o `height="100%"` da linha das ações saiu.
  - Teste novo `Header.test` › `TROCAR PERFIL e SAIR tocáveis na altura toda da barra (alvo ≥ 44)`: confere `height: 48` no estilo dos dois botões e que `actionBar ≥ touchTarget`.
    - RED: `- height: 48` ausente no estilo recebido.
    - GREEN depois da correção.
    - Mutação (tirar o `height` do `Pressable`): o teste falha de novo. Revertida.
  - No simulador (API real, Gustavo), a barra continua igual ao print da rodada anterior e o SAIR leva ao Login.
- **[SUGESTÃO] opacidade de pressionado literal**: corrigido. Criei o token `motion.pressedOpacity: 0.6`, usado nas duas ações da barra e no `SecondaryButton`.
  - É uma refatoração sem mudança de comportamento, sem teste próprio.
  - Tentei um teste com `fireEvent(…, 'pressIn')`, mas ele não liga o estado `pressed` do `Pressable` no Jest (o estado vem do responder nativo). O teste não media o que prometia, e eu o tirei.
- **[SUGESTÃO] foco inicial do leitor na seleção**: não corrigido, porque o chief adiou para a Tarefa 13.

Verificação (fresca, `cd mobile`):
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 46 passed; Tests: 289 passed
```
Nada nativo, nenhuma env e nenhuma dependência nova nesta rodada. A API foi parada no fim.

## Tarefa 11 — Mobile: Agenda

Worktree `.claude/worktrees/mobile`, branch `feat/mobile`, base `1092f58`, último commit `3b4b697`.
Commits: `f43a919` (componentes), `3e849fb` (tela + ViewModel), `3b4b697` (pulso do skeleton fora da view com `exiting`, achado no console do simulador).
Push não feito: o repositório não tem remote (`git remote -v` vazio).
Nenhuma dependência nova, nada nativo, nenhuma env.

### O que mudou (tudo em `mobile/`)
- `src/features/lessons/agendaDays.ts`: `initialAgendaDate(datas, hoje)` (D35): o dia com o mesmo dia da semana de hoje; sem correspondência, o primeiro; agenda vazia, `null`.
- `src/features/lessons/useAgendaViewModel.ts`: `status` (`loading`/`error`/`ready`), `dayOptions` (`{key: data, label: "17 de março, segunda-feira"}`), `selectedDate`, `selectedDayLabel`, `lessons`, `isEmpty`, `contentKey` (`aluno:data`), `onSelectDay`, `onRetry`, `retrying`, `shakeKey`. "Hoje" injetável (`now`).
- `src/features/lessons/LessonsScreen.tsx`: `Screen` + `AppHeader` + título + skeleton/erro/dropdown + lista ou vazio, com as entradas da 4.3/4.5.
- `src/components/Dropdown.tsx`: genérico (Agenda e Boletim), API da 2.5. Testids derivados: `X`, `X-label`, `X-options`, `X-option-<key>`, `X-backdrop`, `X-modal`.
- `src/components/LessonItem.tsx`: bolinha vazada + horário + disciplina, um elemento só para o leitor.
- `src/components/SectionTitle.tsx` (2.3), `Skeleton.tsx` (bloco `surface`), `AgendaSkeleton.tsx` (2.13), `icons/ChevronDownIcon.tsx`.
- `src/hooks/useSkeletonPulse.ts`: um shared value por tela, 0,5 ↔ 1 em 800 ms, parado em 0,7 com reduzir movimento, cancelado ao desmontar.
- `src/theme/sizes.ts`: `skeletonLessonTime`, `skeletonLessonSubject`, `skeletonLessonRows`. `src/theme/motion.ts`: `exitFast` (120), `maxStaggered` (6), `chevronOpenDeg`, `skeleton`.
- `src/constants/strings.ts`: chave `agenda` (seção 5 e tabela de acessibilidade) e `common.closeListAccessibilityLabel` ("Fechar lista").
- `src/test/measureInWindow.ts`: mock tipado do `measureInWindow` (no Jest ele é um `jest.fn()` que nunca responde).
- `src/app/__tests__/App.test.tsx`: `afterEach` que espera `queryClient.isFetching() === 0` (ver Decisão 7).

### Decisões
1. **Dia escolhido é estado do ViewModel, preso ao aluno.** Guardo a data escolhida e o aluno em que ela foi escolhida. Quando o aluno muda, a escolha é zerada no render (padrão "ajustar estado quando a prop muda", sem `useEffect`), e o dia volta ao inicial do D35 com a agenda do novo aluno. Voltar ao aluno anterior também volta ao dia inicial, não ao último escolhido (teste cobre ida e volta). Data escolhida que não está na agenda é ignorada.
2. **"Hoje" é avaliado a cada render** (`now()`), sem congelar na montagem. Se o app fica aberto de um dia para o outro e o usuário não escolheu dia, o dia inicial acompanha a data do aparelho.
3. **Erro durante o TENTAR DE NOVO.** No TanStack v5, o refetch de uma query **sem dados** volta o `status` para `pending` (o reducer `fetch` zera o erro quando `data === undefined`). Só com `isFetching`, a tela trocaria o erro pelo skeleton, e não haveria o spinner no botão da 3.8. Por isso `retrying` é estado do ViewModel e mantém `status: 'error'` até a resposta. Retry que falha de novo incrementa `shakeKey` (shake curto do `ErrorState`); ao sair do erro, volta a 0, para o `ErrorState` não tremer ao reaparecer.
4. **`map`, não `FlatList`.** O `Header` já é a `ScrollView` da aba (a saudação rola com o conteúdo, Decisão 5 da T10). Uma `FlatList` dentro dela seria uma lista virtualizada aninhada (aviso do RN e virtualização desligada de qualquer jeito). Um dia tem no máximo 6 aulas no seed.
5. **Dropdown.** A lista abre num `Modal` transparente (`animationType="none"`, `statusBarTranslucent`, `navigationBarTranslucent`), posicionada pelo `measureInWindow` do gatilho, `s` abaixo; se a altura estimada (`opções × 44 + 2 × xs`) não couber até o fim da janela, abre `s` acima. A altura de 44 está no `style` do próprio `Pressable` da opção (alvo de toque). Abrir: lista `FadeIn` + `translateY -8 → 0` em `fast`; chevron 0 → 180° em `base`. Fechar: chevron volta, lista some em 120 ms e o `Modal` desmonta no fim da animação (`scheduleOnRN`); reaberta no meio da saída, a animação é interrompida e a lista fica. Com reduzir movimento, as durações viram 0. Ao fechar, o foco do leitor volta ao gatilho (`AccessibilityInfo.sendAccessibilityEvent(ref, 'focus')`, a API não depreciada do 0.88). O `accessibilityViewIsModal` fica num container com o fundo e a lista: na 1ª versão ele estava só na lista, e o teste mostrou que o fundo "Fechar lista" sumia para o leitor.
6. **Entrada da lista.** A 1ª lista que aparece espera a entrada do header (`4 × stagger`, 4.3); trocas de dia ou de aluno entram sem esse atraso. O container da lista tem `key={contentKey}` (`aluno:data`) com `FadeOut(120, easeIn)`; cada `LessonItem` entra com `FadeInDown(base)` e atraso `min(i, 5) × stagger` (teto de 420 ms da 4.5). Interpretei o "no máximo 6 itens animados" (1.8) como teto do **atraso**: com 7+ aulas, as excedentes entram junto com a 6ª, e não aparecem antes da 1ª sem animação.
7. **`App.test` espera as queries.** Com a Agenda real, as abas buscam a agenda ao montar, e em 2 testes do App a resposta chegava depois do fim do teste (aviso "update to LessonsScreen … not wrapped in act"). O `afterEach` espera `isFetching() === 0`. A suíte inteira roda sem esse aviso (`grep -c "not wrapped in act"` = 0).
8. **Skeleton e leitor de tela.** O container é `accessible`, `progressbar`, "Carregando agenda". O `importantForAccessibility="no-hide-descendants"` fica num wrapper interno: no Android ele esconde a própria view, e no container o rótulo sumiria para o TalkBack (o RNTL acusou isso no RED). O pulso fica num filho do `Animated.View` que tem o `exiting` (o Reanimated avisava, no console do simulador, que a opacidade do pulso seria sobrescrita pela saída).
9. Testes de tela do Agenda usam MSW (API falsa) e o `measureInWindow` mockado; o `useNavigation` do `AppHeader` é mockado no `LessonsScreen.test`. Nos testes de erro, `queryClient.setQueryDefaults(['agenda'], { retryDelay: 0 })`: o retry continua acontecendo, só sem a espera de 1 s.

### Testes (TDD) — RED antes de cada implementação
- `agendaDays.test.ts` (9: os 7 dias da semana, sem correspondência → primeiro, vazia → `null`). RED: `Cannot find module '../agendaDays'`. GREEN: 9.
- `useAgendaViewModel.test.tsx` (18). RED: `Cannot find module '../useAgendaViewModel'`. GREEN na 1ª implementação: 15 de 17; os 2 de retry falharam:
  - `TENTAR DE NOVO busca de novo…`: `Expected: true / Received: false` no `retrying`. A 1ª versão do teste tinha uma corrida (a resposta chegava antes do `waitFor`). Segurei a resposta com uma promessa, e o RED continuou: o `status` voltava a `pending` (Decisão 3). Corrigi o ViewModel, e o teste passou.
  - `…falha de novo…`: `Cannot read properties of null` em cascata do teste anterior; passou junto.
  - `contentKey muda com o dia e com o aluno` (escrito depois, antes da tela): RED `Expected: "s1:2025-03-18" / Received: undefined`; GREEN: 18.
- `Dropdown.test.tsx` (9: fechado com rótulo/`Dia: …`/hint/recolhido; abre expandido com a atual `selected`; posição `s` abaixo com o mesmo x e a mesma largura; abre acima sem espaço; opção com `minHeight` 44; escolher chama `onSelect`, fecha e devolve o foco; fundo fecha sem mudar; voltar do Android fecha sem mudar; 1 opção). RED: `Cannot find module '../Dropdown'`. 1ª execução: 8/9; `tocar fora…` falhou com `Unable to find … agenda-day-dropdown-backdrop` (Decisão 5); GREEN: 9.
- `LessonItem.test.tsx` (4: horário e disciplina; um elemento "Das 07:15 às 08:00, Matemática I"; bolinha 6 com borda `bulletBorder` na coluna de 16; `numberOfLines` 2). RED: `Cannot find module '../LessonItem'`. GREEN: 4.
- `AgendaSkeleton.test.tsx` (2). RED: `Cannot find module '../AgendaSkeleton'`. 1ª execução: `Unable to find … agenda-skeleton` com o `no-hide-descendants` no container; corrigi o teste e o componente (Decisão 8). GREEN: 2.
- `SectionTitle.test.tsx` (1). RED: `Cannot find module '../SectionTitle'`. GREEN.
- `LessonsScreen.test.tsx` (4: título + skeleton enquanto carrega e dropdown quando chega; segunda com as aulas na ordem; domingo com ilustração e "Sem aulas neste dia"; erro sem dropdown e TENTAR DE NOVO trazendo a agenda). RED: `Unable to find … agenda-title` / `agenda-day-dropdown` / `agenda-error`. GREEN: 4.
- Mutações (todas revertidas com `git checkout` do arquivo já commitado):
  - sem zerar a escolha na troca de aluno → `✕ trocar de aluno volta ao dia inicial…` e `✕ contentKey…`;
  - dia inicial = primeiro da agenda → 12 falham;
  - sem desmontar a lista no fim da saída → `✕ escolher…`, `✕ tocar fora…`, `✕ voltar do Android…`;
  - lista sempre abaixo → `✕ sem espaço abaixo do gatilho, a lista abre acima`.

### Verificação (fresca, `cd mobile`, sobre `3b4b697`)
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 53 passed; Tests: 336 passed (antes: 46 / 289); 0 avisos de act
```
Sem build nativo: a tarefa não muda nada nativo. O app instalado da T10 rodou com o Metro deste worktree (8081, cwd conferido).

### Evidências (iOS 18.1, iPhone 16, Debug, API real do worktree `api` na 3333 com o `dev.db` existente, sem reset; a API foi parada no fim)
Dirigido pelo inspector do Metro (CDP), como nas T9/T10: um script acha a fibra pelo `testID` e chama o handler real (`onChangeText`, `onPress`). O `onPress` do gatilho chama o `measureInWindow` nativo de verdade. Hoje é terça (27/10/2026).
- `evidencias/tarefa-11-agenda.mp4` (22 s): login do Gustavo → Agenda do Rafael abrindo em **18 de março, terça-feira** → abre o dropdown → **17 de março, segunda-feira** (Matemática I, 07:15 - 08:00, primeiro) → abre o dropdown → **16 de março, domingo** (ilustração + "Sem aulas neste dia") → TROCAR PERFIL → Joana → Agenda da Joana de novo em **terça** (Educação Física). O gravador do simulador corta o fim: o último quadro mostra a lista da Joana com a última aula ainda entrando.
- `tarefa-11-lista.png` (Rafael, 17/03), `tarefa-11-dropdown-aberto.png` (16/03 com a lista aberta, igual ao frame `2:48`), `tarefa-11-sem-aulas.png` (16/03): os 3 estados do Figma.
- `tarefa-11-carregando.png`: skeleton (API pausada com `SIGSTOP`, troca para um aluno sem cache).
- `tarefa-11-erro.png`: "Não foi possível carregar a agenda." + TENTAR DE NOVO (API parada, aluno sem cache). Com a API de volta, TENTAR DE NOVO trouxe a agenda (conferido pelo CDP: sem `agenda-error`, "18 de março, terça-feira", "Produção e Interpretação de Textos"). O toast amarelo do LogBox nesse print é o `warn` do logger do app para a falha de rede (`http GET … sem resposta`), só em dev.
- Console do app (CDP) depois da correção `3b4b697`: nenhum warning nem erro nas trocas de dia e de aluno.

### Como o qa sobe e testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && YARN_IGNORE_PATH=1 node dist/main   # 3333
cd mobile && yarn start                                                        # Metro 8081
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850                           # sem pod novo
```
- Gustavo `969.294.560-04` / `123456`. A Agenda abre no dia da semana de hoje (D35). Segunda do Rafael: Matemática I às 07:15 primeiro. Domingo e sábado: ilustração + "Sem aulas neste dia".
- Dropdown: tocar fora e o voltar do Android fecham sem trocar; o chevron gira; com reduzir movimento, abre e fecha sem animar.
- Trocar de aluno volta ao dia inicial, com a agenda do outro aluno. Se o aluno novo já tem agenda em cache, a lista troca sem skeleton.
- Erro: com a API parada, trocar para um aluno ainda não carregado na sessão (ou abrir o app e parar a API antes da 1ª busca da agenda). TENTAR DE NOVO mostra o spinner no botão; falhando de novo, o bloco treme.
- VoiceOver: "Dia: 18 de março, terça-feira", botão, recolhido/expandido, hint "Toque para escolher outro dia"; aula "Das 07:15 às 08:00, Matemática I"; skeleton "Carregando agenda".

### Pendências de deploy / nativo / ambiente
Nenhuma: sem dependência, sem nativo, sem env, sem migration. Android não buildado (sem JDK), como antes; o `navigationBarTranslucent` do `Modal` é para o edge-to-edge do Android e só foi visto no iOS.

### Ressalvas
1. **`EmptyState` da T10 sem o `scale 0.96 → 1` da ilustração e com o título sem o `delay(stagger)`** pedidos na 4.5 para o "sem aulas". O componente é compartilhado com o NoStudent; não mexi nele nesta tarefa. É uma linha no `entering` dele, se o chief quiser.
2. **Anúncio do erro pelo leitor de tela** (3.8: "se falhar de novo, o leitor anuncia de novo"): o `ErrorState` da T10 não anuncia. Fica para a T13 (estados).
3. **Posição da lista do dropdown no Android** (`measureInWindow` com `statusBarTranslucent`/`navigationBarTranslucent` e edge-to-edge): não verificada, sem Android na máquina.
4. **Altura da lista estimada** (`opções × 44 + 2 × xs`) para decidir entre abrir abaixo ou acima. Com a fonte do sistema no máximo, as linhas crescem e a estimativa fica menor que a lista real. Com 7 opções e o gatilho na posição da Agenda, cabe abaixo no iPhone 16.
5. **testIDs fora da tabela 7:** `agenda-title`, `agenda-day-dropdown-options`, `-backdrop`, `-modal`, `agenda-lesson-<i>-bullet(-slot)`, `agenda-skeleton-dropdown`, `-blocks`, `-row-<i>`, `agenda-empty-illustration`.
6. Ordem dos alunos no `/me` (Ressalva 1 da T10) continua: o vídeo começa no Rafael porque ele era o aluno salvo no aparelho antes do login.
7. Pull-to-refresh não entrou (opcional na decisão do chief): o `Header` é dono da `ScrollView`, e o `RefreshControl` teria de entrar nele.

### Mensagens
→ chief: nada nativo nesta tarefa; vai por OTA quando houver.
→ chief: Ressalvas 1 e 2 (`EmptyState` sem o `scale` da 4.5 e `ErrorState` sem anúncio) são dos componentes da T10. Corrijo aqui ou fica para a T13?
→ developer da Tarefa 12: use `<Dropdown testID="boletim-year-dropdown" label="7EF - 2025" options={[{key: '2025', label: '7EF - 2025'}, …]} selectedKey="2025" onSelect={…} accessibilityLabelPrefix="Turma e ano" accessibilityHint="Toque para ver outros anos" marginHorizontal="m" />`, e `SectionTitle`. Para o skeleton, `Skeleton` + `useSkeletonPulse()` (um por tela, no wrapper, separado da view que tem `exiting`). Nos testes de tela, `mockMeasureInWindow` de `src/test/measureInWindow.ts`. Se o refetch do erro precisar manter o erro na tela, veja a Decisão 3 (o `status` volta para `pending` sem dados).
→ code-reviewer: vale olhar o fechamento do `Dropdown` (desmontar no fim da animação, reabrir no meio), a escolha presa ao aluno no `useAgendaViewModel` e o `retrying` como estado próprio.

### Rodada 1 (Tarefa 11)

Commit `4b64914` (`fix(mobile): lista do dropdown na área segura, foco depois do modal e agenda vazia`), em cima de `3b4b697`. Sem dependência nova, nada nativo, nenhuma env.

- **[IMPORTANTE] Lista do dropdown sai da tela em aparelho baixo ou com fonte grande**: corrigido em `4b64914`.
  - `placeList` recebe os insets (`useSafeAreaInsets`) e calcula o espaço real dos dois lados: abaixo `janela − insets.bottom − (y + h + s)` e acima `y − s − insets.top`. Abre abaixo se a altura estimada couber ali; senão, no lado com mais espaço. O `maxHeight` da lista é o espaço desse lado, e as opções ficam numa `ScrollView` (`<testID>-scroll`), com `maxHeight` menos o padding do card.
  - O texto da opção ganhou `maxFontSizeMultiplier={sizes.fixedHeightFontScale}`.
  - Testes novos (`Dropdown.test`): janela 360×640, insets 24/16 e gatilho em y = 290. A lista abre abaixo com `top` 343 (≥ inset de cima) e `maxHeight` 281, e as 7 opções ficam dentro da `ScrollView`. Com o gatilho em y = 560, abre acima com `bottom` 88 e `maxHeight` 528. O texto da opção tem o teto de fonte.
    - RED: `- Expected + Received` no estilo (sem `maxHeight`) nos dois casos, e `Expected instance to have prop` (`maxFontSizeMultiplier`).
    - GREEN depois da correção.
  - Simulador (iPhone 16, API real): `evidencias/tarefa-11-r1-dropdown.png` (fonte padrão: `top` 390, `maxHeight` 428, todas as opções visíveis).
    - Com a fonte do sistema no máximo (`content_size accessibility-extra-extra-extra-large`), o app foi relançado, rolei até o gatilho e abri: `evidencias/tarefa-11-r1-dropdown-fonte-maxima.png`. Medi por `measureInWindow`: lista de 459 a 775, última opção (22/03) de 727 a 771, dentro de 818 (janela − home indicator). O card e a tab bar têm a mesma cor `surface`, por isso o fim do card parece encostar nela.
    - Um 1º print com a fonte trocada **com o app aberto** mostrou a lista na posição antiga: o simulador só aplicou a fonte nova no render do próprio toque, depois da medição. Relançando o app não acontece. Usuário que muda a fonte nos Ajustes volta ao app já com o layout novo.
    - Depois a fonte voltou para `large`.
- **[IMPORTANTE] Foco do leitor volta ao gatilho com o Modal ainda na tela**: corrigido em `4b64914`.
  - `unmountList` só marca `focusPending` e tira a âncora.
  - O foco é mandado pelo `onDismiss` do `Modal` (iOS) ou por um efeito depois do commit que tirou o Modal (Android). O `focusPending` garante um envio só.
  - Testes:
    - iOS: depois de escolher, `sendAccessibilityEvent` **não** foi chamado. Chamando o `onDismiss` capturado do Modal, ele sai com `'focus'`. RED: `Expected number of calls: 0 / Received: 1`.
    - Android (`jest.replaceProperty(Platform, 'OS', 'android')`): o evento sai depois que a lista some. Já passava antes (o envio era imediato), então é caracterização.
    - Mutações: sem o `onDismiss` → `✕ iOS…`; sem o efeito → `✕ Android…`.
  - Simulador: troquei o `sendAccessibilityEvent` do próprio `AccessibilityInfo` (pelo registro de módulos do Metro em dev) por um que registra a chamada. Ao escolher "16 de março", o `focus` saiu **147 ms** depois do toque (120 ms da saída mais a saída do Modal), já com a lista desmontada. No iOS, o único caminho até o envio é o `onDismiss` nativo.
    - **Não** conferi com o VoiceOver ligado: não há Accessibility Inspector automatizável aqui. Fica para o qa (a mensagem do revisor já pede).
- **[SUGESTÃO] Opções tocáveis durante a saída; comentário de um caminho impossível**: corrigido em `4b64914`.
  - `pointerEvents={expanded ? 'auto' : 'none'}` no container da lista, mais um `if (!expanded) return` no `choose`.
  - O comentário agora fala em "fechada de novo no meio da saída (2º toque no fundo)".
  - Teste: com o `withTiming` sem callback (a saída não termina), escolher o 17 e depois tocar o 16 chama `onSelect` uma vez só, e a lista tem `pointerEvents: 'none'`. RED: `Expected number of calls: 1 / Received: 2`. GREEN.
  - Mutação (sem as duas guardas): o teste falha.
- **[SUGESTÃO] `retrying` sobrevive à troca de aluno**: corrigido em `4b64914`, mas o cenário **não reproduziu**.
  - `retrying` e `failedRetries` agora são zerados no mesmo bloco da escolha do dia, quando o aluno muda.
  - Teste novo: erro no s1, TENTAR DE NOVO segurado, troca para s2; confere `retrying` falso, `status` `loading` e `shakeKey` 0 depois que a resposta do s1 chega. **Passou antes da correção.**
  - Motivo: ao trocar de aluno, a query do s1 fica sem observador. Como o `queryFn` usa o `signal`, o TanStack cancela o fetch, e o `refetch()` resolve na hora com o resultado do observador, que já é o s2 e sem erro.
  - Mantive o teste como regressão e o zeramento como defesa (não depende desse detalhe do TanStack). Não pus a guarda por aluno dentro do `onRetry`, porque o cancelamento já cobre.
- **[SUGESTÃO] Agenda `[]` deixa a tela em branco**: corrigido em `4b64914`.
  - `isEmpty = lessons.length === 0`, e a tela só mostra o dropdown com `dayOptions.length > 0`.
  - Testes: ViewModel (`[]` → sem dias, `selectedDate` nulo, `isEmpty`) e tela (`agenda-empty` e nenhum `agenda-day-dropdown`).
    - RED: `Expected: true / Received: false` no `isEmpty`; na tela, o `agenda-day-dropdown` com "Dia: " vazio.
    - GREEN.
- **[SUGESTÃO] Voltar ao dia inicial repete o atraso de entrada**: corrigido em `4b64914`.
  - O ViewModel expõe `contentEnterDelay`: `4 × stagger` só enquanto a 1ª lista exibida não mudou, e 0 para sempre depois da 1ª troca (de dia ou de aluno).
  - A View só repassa o valor ao `LessonItem`; o `useState` da View saiu.
  - Teste: 160 na abertura, 0 ao ir para 17/03, e 0 ao voltar para 18/03. RED: `Expected: 160 / Received: undefined`. GREEN.

Ajuste de teste: o `Dimensions.set` do teste de 360×640 gerou 30 avisos de `act` (todo `useWindowDimensions` montado reagia). Agora o `set` acontece antes do render e a restauração usa `await act(...)`.

Verificação (fresca, `cd mobile`, sobre `4b64914`):
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 53 passed; Tests: 346 passed (antes: 336); 0 avisos de act
```
A API (worktree `api`, 3333, `dev.db` sem reset) foi parada no fim. O app foi relançado sem o patch de diagnóstico, com a fonte em `large`.

Ressalva desta rodada: a altura usada para escolher o lado continua **estimada** (`opções × 44 + 2 × xs`). Com fonte grande, as linhas passam de 44 e a lista pode abrir abaixo num espaço menor que ela. Agora ela rola e não sai da tela, então nenhuma opção fica inalcançável.

#### Mensagens
→ chief: rodada 1 da T11 em `4b64914`. Todos os 6 achados foram tratados. O do `retrying` não reproduzia (o TanStack cancela o fetch do aluno anterior), e o teste ficou como regressão.
→ qa: o foco de volta ao gatilho só foi provado pela ordem dos eventos no simulador, não com o VoiceOver ligado. Vale conferir com VoiceOver/TalkBack. Conferir também o dropdown num Android 360×640.
→ developer da Tarefa 12: o `Dropdown` agora usa `useSafeAreaInsets`. Nos testes de tela, a lista já sai com o mock padrão do `react-native-safe-area-context` (insets 0).

## Tarefa 12 — Mobile: Boletim

Worktree `.claude/worktrees/mobile`, branch `feat/mobile`, base `4b64914`, último commit `db80724`.
Commits: `e091687` (componentes `Accordion` e `BoletimSkeleton`, textos e tokens), `db80724` (ViewModel, tela, `TermAccordion`/`SubjectAccordion`).
Push não feito: o repositório não tem remote (`git remote -v` vazio).
Nenhuma dependência nova, nada nativo, nenhuma env.

### O que mudou (tudo em `mobile/`)
- `src/components/Accordion.tsx`: acordeão genérico. O cabeçalho é desenhado por quem usa (`renderHeader(chevron)`). Tem `expanded` no estado de acessibilidade e `minHeight` 44 no próprio `Pressable`. O corpo (`X-content`) é montado na 1ª abertura; fechado, continua montado e fica escondido do leitor. Altura e chevron animam no mesmo `progress`, e `fadeContent` é opcional.
- `src/components/BoletimSkeleton.tsx`: dropdown + 3 cards de 90 (`withDropdown={false}` na troca de ano), "Carregando boletim", um `useSkeletonPulse()` num filho da view que tem o `exiting`.
- `src/features/report-card/useReportCardViewModel.ts`: `status` (lista de anos) e `termsStatus` (boletim do ano), `yearOptions` ("7EF - 2025"), `selectedYearKey/Label`, `terms` já formatados (título, rótulo do leitor, `expanded`, disciplinas com nota/faltas formatadas e o rótulo "Nota 9,5, 0 faltas"), `onSelectYear`, `onToggleTerm`, `onToggleSubject`, `onRetry`, `retrying`, `shakeKey`, `errorDescription`, `contentKey`, `contentEnterDelay` e `isEmpty`.
- `src/features/report-card/ReportCardScreen.tsx`: título BOLETIM, depois o skeleton, o erro ou o vazio, o dropdown e os trimestres, com as entradas da 4.3/4.6.
- `src/features/report-card/components/TermAccordion.tsx` e `SubjectAccordion.tsx`: os dois acordeões da 2.11 sobre o `Accordion`.
- `src/constants/strings.ts`: chave `boletim` (seção 5 e tabela de acessibilidade), mais `empty` e `error.notFound` (ver Decisões 5 e 6).
- `src/theme/motion.ts`: `subjectStagger` (20). `src/theme/sizes.ts`: `accordionOpenMaxHeight`.
- `src/test/fixtures.ts`: `reportCard2024`, `marinaReportCards`, `marinaReportCard2025`.

### Decisões
1. **Estado dos acordeões no ViewModel**, não num hook de UI. São listas de chaves abertas (`term` e `term-index`), presas ao `contentKey` (`aluno:ano`). Quando o aluno ou o ano mudam, elas são zeradas no render (mesmo padrão "ajustar estado quando muda" da T11, sem `useEffect`). Assim, "trocar de ano ou de aluno fecha tudo" é regra do ViewModel, e há teste para ela. O trimestre e a disciplina abrem de forma independente. Fechar o trimestre não fecha a disciplina de dentro: ao reabrir, ela continua aberta, como um acordeão aninhado costuma fazer.
2. **Ano inicial = o maior ano da lista** (não `lista[0]`). Não depende da ordem da API. O ano escolhido fica preso ao aluno (como o dia na Agenda), e um ano fora da lista é ignorado.
3. **Animação da altura por `maxHeight`, não `height`.** O corpo fica no fluxo com a altura natural (`flexShrink` 0, `onLayout` mede). O container anima `maxHeight = medida × progresso`, com `overflow: hidden`. Quando a abertura termina (callback do `withTiming`, na UI thread), o limite passa para `sizes.accordionOpenMaxHeight` (sem limite na prática). Assim, um acordeão de disciplina abrindo dentro de um trimestre aberto empurra o resto na mesma frame, sem esperar outra medida pelo JS. Com `height` fixo, o trimestre cortaria a disciplina até o próximo `onLayout`. Ao fechar, o limite volta à medida atual e anima até 0. Abrir leva `base` 220 `easeOut`, fechar `fast` 150 `easeIn`. Com reduzir movimento, a duração é 0 (troca seca, chevron sem girar), como no Dropdown.
4. **Erros.** Erro na lista de anos: `ErrorState` sem dropdown (2.14). Erro no boletim do ano: o dropdown **fica**, e o `ErrorState` aparece no lugar dos cards, para que o usuário possa voltar a outro ano. O "dropdown some porque depende do dado" da 2.14 vale para o dado da lista, que aqui já existe. `retrying` mantém o erro com o spinner durante o TENTAR DE NOVO (Decisão 3 da T11); ele refaz a query que falhou, a da lista ou a do ano.
5. **404 de ano**: título "Não foi possível carregar o boletim." e descrição **"Boletim não encontrado."** (texto fixo do app, igual ao da API), no lugar de "Confira sua conexão…", que seria falso nesse caso.
6. **Aluno sem nenhum boletim (`[]`)**: não acontece no seed, mas a T11 mostrou que uma lista vazia deixava a tela em branco. Mostro o `EmptyState` sem ilustração com "Nenhum boletim disponível". Esse texto **não está no design**; ver Mensagens.
7. **Trimestre não avaliado**: a disciplina continua na lista, com "Nota: -" e "Faltas: -". Para o leitor, "Nota e faltas ainda não lançadas"; "1 falta" no singular.
8. **Entradas (4.6)**: os cards entram com `FadeInDown(base)` e atraso `contentEnterDelay + i × 60`, e a 1ª exibição espera o header (`4 × stagger`), como a lista da Agenda. O container tem `key={contentKey}`, com `FadeOut(120)` na troca de ano ou de aluno. As disciplinas entram em `FadeIn(fast)`, com atraso `min(i, 6) × 20`, na 1ª abertura do trimestre (que é quando o corpo monta). Nota e Faltas fazem fade no `progress` do acordeão. Não há contagem animada (decisão do ledger).
9. **`TermAccordion`/`SubjectAccordion` ficam em `features/report-card/components`**, porque recebem os tipos do ViewModel. O `Accordion` genérico fica em `src/components`, como o chief pediu.
10. Na troca de ano, os cards viram skeleton e o dropdown fica (3.4). Com o ano já em cache, a troca é direta.

### Testes (TDD) — RED antes de cada implementação
- `useReportCardViewModel.test.tsx` (20): ano inicial (e com a lista fora de ordem), mapeamento com nota formatada/`-`/rótulos do leitor, singular de falta, abrir e fechar de forma independente, troca de ano (busca o ano, fecha tudo, só os cards carregam), volta de ano, ano fora da lista, `contentKey`, troca de aluno (ano mais recente do novo aluno, tudo fechado, ida e volta), atraso da 1ª exibição, lista `[]`, erro da lista, erro do ano com a lista na tela, 404, TENTAR DE NOVO na lista e no ano (o erro fica com spinner até a resposta), retry que falha (`shakeKey`), troca de aluno no erro. RED: `Cannot find module '../useReportCardViewModel'`. GREEN: 20/20.
- `Accordion.test.tsx` (6): cabeçalho como botão recolhido sem corpo montado, alvo 44 no `Pressable`, `onToggle`, aberto e expandido com o corpo, corpo montado na 1ª abertura e escondido do leitor ao fechar, `overflow: hidden`. RED: `Cannot find module '../Accordion'`. 1ª execução: 5/6. O teste de `rerender` perdia o `ThemeProvider` (`renderWithTheme` embrulha o elemento, não o `wrapper`), e corrigi o **teste** com `wrapper`. GREEN: 6/6.
- `TermAccordion.test.tsx` (9: Subject fechado/aberto com "Nota:" 9,5 e "Faltas:" 0 num elemento só, `-` no não avaliado, `numberOfLines` 2, toque; Term com "1º TRIMESTRE"/"1º trimestre", recolhido sem disciplinas, aberto com as disciplinas e os testIDs na ordem, `onToggleSubject(índice)`) e `BoletimSkeleton.test.tsx` (3). RED: `Cannot find module '../SubjectAccordion'` / `'../BoletimSkeleton'`. GREEN: 12/12.
- `ReportCardScreen.test.tsx` (8, MSW + `mockMeasureInWindow`): skeleton → "7EF - 2025" e 3 trimestres fechados; rótulo e dica do dropdown; T1 → Língua Portuguesa 9,5/0; T2 com `-`; troca para 6EF - 2024 com tudo fechado e a nota de 2024; erro da lista sem dropdown e o retry; 404 com dropdown; lista vazia. RED: `Unable to find an element with testID: boletim-title` (e os demais). GREEN: 8/8.
- Mutações (cada uma revertida com `git checkout` depois de commitar):
  - sem fechar os acordeões na troca → 4 falham;
  - sem zerar o ano na troca de aluno → 1 falha;
  - ano inicial = último da lista → 16 falham;
  - sem manter o erro durante o retry → 2 falham;
  - corpo sempre montado → 3 falham;
  - corpo fechado visível ao leitor → 1 falha.

### Verificação (fresca, `cd mobile`, sobre `db80724`)
```
yarn lint          -> exit 0
yarn tsc           -> exit 0
yarn format:check  -> All matched files use Prettier code style!
yarn test          -> Test Suites: 58 passed; Tests: 392 passed (antes: 53 / 346); 0 avisos de act
```
Sem build nativo: nada nativo mudou. O app instalado rodou com o Metro deste worktree (8081, cwd conferido).

### Evidências (iOS, iPhone 16 `1E7DEFC7…`, Debug, API real do worktree `api` na 3333 com o `dev.db` existente, sem reset; a API foi parada no fim)
Dirigido pelo inspector do Metro (CDP), como nas T9–T11: um script acha a fibra pelo `testID` e chama o `onPress` real; a rolagem usa o `scrollTo` da `ScrollView` do header.
- `evidencias/tarefa-12-boletim.mp4` (35 s, uma tomada só). Gustavo já logado no Rafael. Aba Boletim (entrada) → "7EF - 2025" → abre e fecha o dropdown → abre o 1º trimestre → Língua Portuguesa (Nota 9,5, Faltas 0) e Produção e Interpretação de Textos (8,0 / 1) → 2º trimestre → Língua Portuguesa com "-" e "-" → 6EF - 2024 (tudo fechado; T1 Língua Portuguesa 8,0 / 1) → TROCAR PERFIL → Joana → "2EM - 2025", com o dropdown listando só 2025.
  - Valores lidos pelo CDP durante a tomada: `boletim-term-1-subject-0-grade` "9,5", `-absences` "0"; `boletim-term-2-subject-0-grade/-absences` "-"/"-"; em 2024, "8,0"/"1"; Joana com a opção única `boletim-year-dropdown-option-2025`.
- Os 4 estados do Figma:
  - `tarefa-12-ano-fechado.png`;
  - `tarefa-12-ano-aberto.png` (lista "7EF - 2025 / 6EF - 2024" sobre o 1º card, igual ao `3:1054`);
  - `tarefa-12-trimestre-aberto.png`;
  - `tarefa-12-disciplinas-abertas.png` (9,5/0 e 8,0/1).
- Extras: `tarefa-12-nao-avaliado.png` (T2 com `-`), `tarefa-12-2024.png` e `tarefa-12-joana.png`.
- `tarefa-12-carregando.png`: skeleton, com a API pausada (`SIGSTOP`) e o Boletim ainda sem cache.
- `tarefa-12-erro.png`: "Não foi possível carregar o boletim." + TENTAR DE NOVO, com a API derrubada. Com a API de volta, o TENTAR DE NOVO trouxe "7EF - 2025" e os trimestres (conferido pelo CDP). O toast do LogBox (o `warn` de rede do logger em dev) foi dispensado antes do print.

### Como o qa sobe e testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && YARN_IGNORE_PATH=1 node dist/main   # 3333
cd mobile && yarn start                                                        # Metro 8081
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850                           # sem pod novo
```
- Gustavo `969.294.560-04` / `123456`, aba BOLETIM. Rafael: "7EF - 2025", T1 com notas (Língua Portuguesa 9,5 / 0), T2 e T3 com `-`; "6EF - 2024" com notas nos 3 trimestres. Joana: só "2EM - 2025".
- Acordeões: altura e chevron juntos; disciplina aberta dentro do trimestre empurra o resto sem cortar; trocar de ano ou de aluno fecha tudo. Com reduzir movimento, abre e fecha sem animar.
- Erro: API parada antes da 1ª abertura do Boletim (ou um aluno sem cache). TENTAR DE NOVO mostra o spinner; se falhar de novo, o bloco treme.
- VoiceOver: "Turma e ano: 7EF - 2025" com a dica "Toque para ver outros anos"; trimestre "1º trimestre", botão, expandido/recolhido; disciplina pelo nome; resultado "Nota 9,5, 0 faltas" / "Nota e faltas ainda não lançadas"; skeleton "Carregando boletim".

### Pendências de deploy / nativo / ambiente
Nenhuma: sem dependência, sem nativo, sem env, sem migration. Vai por OTA quando houver. Android não buildado (sem JDK na máquina).

### Ressalvas
1. **Texto fora do design**: "Nenhum boletim disponível" (lista `[]`, Decisão 6). Não ocorre com o seed.
2. **A animação de altura não tem teste unitário**: o mock do Reanimated resolve o `withTiming` na hora. Ela só foi vista no vídeo do simulador, sem medir quadro a quadro. Também não testei, no Android release, o empurrão do trimestre quando uma disciplina abre dentro dele (M9 é visual, do qa).
3. **O `ErrorState` da T10 continua sem anunciar o erro ao leitor** (adiado para a T13 pelo ledger). A animação de entrada do `EmptyState` também continua sem o `scale`.
4. **testIDs fora da tabela 7**: `boletim-title`, `boletim-empty`, `boletim-term-<t>-subject-<i>-result` (o grupo Nota/Faltas), `boletim-term-<t>-subject-<i>-content`, `boletim-skeleton-blocks/-dropdown/-term-<n>`.
5. **Disciplina aberta dentro de trimestre fechado** continua aberta ao reabrir o trimestre (Decisão 1). O chief pediu "independentes"; se preferir fechar as disciplinas junto, é uma linha no `onToggleTerm`.
6. Dirigido por CDP, sem toque nativo nem VoiceOver real, como nas tarefas anteriores.

### Mensagens
→ chief: nada nativo; vai por OTA.
→ chief: o texto "Nenhum boletim disponível" para aluno sem boletim (`[]`) não está no design. Mantenho ou prefere outro? O 404 usa "Boletim não encontrado." como descrição do `ErrorState`.
→ chief: com erro só no boletim do ano, o dropdown fica na tela (Decisão 4), um desvio pequeno da 2.14, para o usuário poder trocar de ano.
→ code-reviewer: vale olhar o `Accordion` (`maxHeight` com o limite liberado no fim da abertura, Decisão 3), o reset dos acordeões e do ano por `contentKey`/aluno no ViewModel, e o `onRetry`, que escolhe qual query refazer.
→ qa: conferir no Android release o acordeão aninhado (abrir uma disciplina com o T1 aberto) e o VoiceOver/TalkBack nos rótulos do boletim.

## Tarefa 13

**Repo/worktree/branch:** `/Users/fael_st/workspace/fiap/.claude/worktrees/mobile`, branch `feat/mobile`, BASE `db80724`, commits `7fc41fc..2da2623` (7 commits, 18 arquivos). O push falha porque não há remote (ledger).

```
7fc41fc feat(mobile): entrada do EmptyState com escala da ilustração e atraso do título
475eed6 feat(mobile): ErrorState anuncia o erro ao leitor de tela ao aparecer e a cada retry que falha
fcea10b feat(mobile): foco do leitor de tela no título da seleção de aluno
e8c635d fix(mobile): descrição do 404 do boletim não troca para conexão durante o retry
b6b260f feat(mobile): estado do React Query e do zustand no Reactotron, sem variáveis de mutation nem token
c057a01 test(mobile): avisos de act intermitentes na agenda e no App
2da2623 ci: workflow do mobile com lint, tsc, jest com cobertura e build Android
```

### O que mudou
- `mobile/src/components/EmptyState.tsx`: a ilustração entra com `Keyframe` (opacidade 0→1 e `scale` 0,96→1, `base`, `easeOut`). O título vem um stagger depois quando há ilustração, e a descrição e a ação vêm depois dele. Sem ilustração, os atrasos continuam 0/1/2 × stagger (4.8). Com reduzir movimento, tudo vira `FadeIn` com `ReduceMotion.Never`, com os mesmos atrasos.
- `mobile/src/theme/motion.ts`: token `illustrationScaleFrom: 0.96`.
- `mobile/src/components/ErrorState.tsx`: `announceForAccessibility("<título> <descrição>")` num efeito com deps `[spoken, shakeKey]`. Ele roda uma vez ao aparecer e uma vez a cada retry que falha. O spinner (`retrying`) não repete o anúncio. Não há live region, para o texto não ser lido duas vezes (mesmo padrão do `LoginErrorMessage`).
- `mobile/src/features/students/SelectStudentScreen.tsx`: `ref` no título. No `transitionEnd` do native-stack (sem `closing`), chama `sendAccessibilityEvent(ref, 'focus')`. O listener sai ao desmontar.
- `mobile/src/features/report-card/useReportCardViewModel.ts`: a descrição do erro vem do erro atual e, durante o retry, do último erro que terminou (`lastError` em estado ajustado no render). O 404 não pisca mais para "Confira sua conexão…".
- `mobile/src/app/stateInspector.ts` (novo): monta à mão o retrato do estado para o Reactotron.
  - Queries: chave, status, fetchStatus, dados e erro, tudo passado pelo `redact`.
  - Mutations: só chave e status. **Não** inclui `variables` nem `data`.
  - Stores do zustand: o estado sem as ações, redigido.
  - `watchAppState` agrupa as mudanças em 300 ms e devolve o `stop`.
- `mobile/src/services/logger/reactotron.ts`: `connectReactotron()` agora devolve `{ transport, show }`. Os plugins de rede, log e asyncStorage continuam desligados.
- `mobile/src/app/devtools.ts`: em `__DEV__`, liga o transporte do logger e o `watchAppState` (stores `session` e `boot`, mais o `queryClient`). Manda um `display` "ESTADO" por rajada.
- `mobile/src/test/recordingAnimations.ts` (novo, só teste): builders `FadeIn`, `FadeInDown` e `Keyframe` que anotam a configuração. Com eles dá para conferir duração, atraso e `reduceMotion` do `entering`, o que o mock do Reanimated não permite.
- `mobile/src/test/renderWithTheme.tsx`: o tema virou o `wrapper`, então o `rerender` continua com o tema.
- `mobile/src/features/lessons/api/__tests__/useAgendaQuery.test.tsx` e `mobile/src/app/__tests__/App.test.tsx`: correção dos avisos de `act` (ver item 8).
- `.github/workflows/mobile.yml` (novo, raiz do worktree): ver item 7.

### Decisões
1. **Reactotron sem plugin pronto.** O `reactotron-react-query` manda o estado inteiro das mutations (com `variables`, ou seja, CPF e senha do login, e o resultado com o token) e não tem opção de filtro. Por isso não entrou. Também não adicionei `reactotron-plugin-zustand`. Escrevi o `stateInspector`, que não adiciona dependência e manda só o que foi escolhido, redigido. Tem teste de que a senha, o CPF e o token não aparecem no JSON serializado. Os plugins de rede e headers continuam desligados.
2. **Foco da seleção no `transitionEnd`**, não na montagem. Na montagem, o modal ainda está subindo e o VoiceOver pode jogar o foco na tela de baixo. O native-stack emite `transitionEnd` nas duas plataformas.
3. **Anúncio do ErrorState com deps `[texto, shakeKey]`.** Se o retry falha com um texto diferente, as duas coisas mudam no mesmo commit e o anúncio sai uma vez só. O item 4 garante que o texto não muda durante o retry.
4. **Reduzir movimento no EmptyState:** fade com `Never` (pedido do chief), escolhido por `useReducedMotion()`, no mesmo padrão do Login (T8b).
5. **CI, job ios só em `workflow_dispatch` com `ios=true`.** O runner macOS custa cerca de 10 vezes o Linux, e `pod install` + `xcodebuild` leva uns 20 a 30 min. O iOS já é buildado e testado no simulador local a cada tarefa. O job android roda em todo push/PR do `mobile/**`, porque é a única prova do Android.

### Item 6 — M9 conferido tela a tela
| Tela | Entrada | Observação |
|---|---|---|
| Splash | timeline 3.1 (T8b) | ok |
| Login | campos/botão (fromSplash) ou fade (logout) | ok |
| Agenda / Boletim | Header 4.3 + conteúdo a partir de 4×stagger; troca de dia/ano com `key` | ok |
| Agenda sem aulas | ilustração com escala + texto atrasado (nova) | ok |
| Seleção de aluno | título, cards e FECHAR (4.7) | ok |
| NoStudent | ActionBar `FadeIn` + Header + EmptyState | ok; o EmptyState entra junto da saudação (sem o 4×stagger da 4.3). Diferença pequena, não mexi |
| BootError | ActionBar `FadeIn` + ErrorState 4.8 | ok |

Só transform/opacity: conferi os `useAnimatedStyle` de todos os arquivos. As exceções são as previstas no design: `maxHeight` do Accordion (1.8), a cor da linha do `UnderlineInput` (1.8), a cor do texto do `PrimaryButton` (4.2) e a borda do `StudentCard` (4.7). O resto é `opacity`/`translate`/`scale`/`rotate`. Não achei lacuna que pedisse código.

### Item 7 — `.github/workflows/mobile.yml`
- Gatilhos: push na `main` e PR, com `paths: mobile/**` e o próprio workflow, mais `workflow_dispatch` (input `ios`). `permissions: contents: read`, `concurrency` por ref, `working-directory: mobile`.
- Job `test`: Node 24, `corepack enable` (o yarn 4.18.1 vem do `packageManager` + `.yarn/releases`), cache da pasta do yarn (`yarn config get cacheFolder`, chave no `mobile/yarn.lock`), `yarn install --immutable`, `yarn lint`, `yarn tsc`, `yarn test --coverage --ci`. A cobertura sobe como artefato `mobile-coverage`.
- Job `android`: mesmo setup do Node/yarn, JDK 17 temurin, `gradle/actions/setup-gradle@v4` (cache do Gradle), `cp .env.example .env` (o react-native-config lê no build), `./gradlew assembleDebug --no-daemon --stacktrace` em `mobile/android`. O APK de debug sobe como artefato.
- Job `ios` (opcional): `macos-15`, `ruby/setup-ruby` com bundler-cache, `bundle exec pod install` e `xcodebuild` Debug para `generic/platform=iOS Simulator` com `CODE_SIGNING_ALLOWED=NO`.
- `actionlint .github/workflows/mobile.yml` → exit 0.
- ⚠️ Nenhum job rodou de verdade (não há remote). O `assembleDebug` é a **primeira** tentativa de compilar o Android: se o Gradle 9.4 recusar o `settings.gradle` (achado da T7) ou faltar algo nativo, é aqui que aparece. Não há `Gemfile.lock` no repo, então o setup-ruby resolve as gems na hora.

### Item 8 — avisos de `act`
Causas achadas (systematic-debugging, pelo stack de cada aviso):
1. `useAgendaQuery.test.tsx`: depois do `rerender` para `s2`, o teste esperava só o request sair (`requested`). A resposta chegava depois do último `waitFor` e atualizava o hook fora do act. Agora o teste espera `result.current.isSuccess` do `s2`.
2. `App.test.tsx`, último teste (BootError → abas): o `afterEach` esperava `queryClient.isFetching() === 0`, que zera no cache **antes** de o TanStack avisar a tela (o aviso vai num `setTimeout(0)`). Ele chegava ao `LessonsScreen` fora do act.
3. `App.test.tsx`, login → abas: o `BottomTabView` termina o fade (150 ms) e faz `setLastUpdate` 32 ms depois (`BottomTabView.tsx:191`), às vezes fora do act.

Para os itens 2 e 3: depois do `waitFor`, o `afterEach` espera 250 ms (150 + 32 + folga) **dentro** do act, antes do unmount. O teste do App fica cerca de 3 s mais longo.

O `useReportCardQueries.test.tsx` não reproduziu em 15 execuções isoladas nem em 9 da suíte inteira. Os avisos que vi vinham sempre de 1 e 3.

Medição (contagem de execuções com aviso):
```
antes:  useAgendaQuery isolado 2/20 · App.test isolado 2/10 · suíte inteira 1/4
depois: useAgendaQuery isolado 0/30 · App.test isolado 0/15 · suíte inteira 0/5 (+ 0 no run com --coverage)
```

### Testes (TDD) — RED e GREEN
- `EmptyState.test.tsx` (4 novos). RED: `3 failed, 3 passed` ("Expected: Keyframe / Received: FadeIn"; "Expected: 40 / Received: 0"; "Expected: never / Received: system"). O "sem ilustração, atraso 0" passou no RED: é caracterização da 4.8. GREEN: 6/6.
- `ErrorState.test.tsx` (3 novos). RED: `3 failed` ("Expected number of calls: 1 / Received: 0", nos três). GREEN: 6/6.
- `useReportCardViewModel.test.tsx` (1 novo, segura a resposta do retry). RED: `Expected: "Boletim não encontrado." / Received: "Confira sua conexão e tente de novo."`. GREEN: 21/21.
- `SelectStudentScreen.test.tsx` (3 novos). RED: `2 failed` (foco e unsubscribe com 0 chamadas). O "não mexe no foco ao sair" passou no RED: é caracterização. GREEN: 5/5.
- `stateInspector.test.ts` (5 novos). RED: `Cannot find module '../stateInspector'`. GREEN: 5/5.

### Verificação (no worktree, `cd mobile`)
```
yarn lint                     -> exit 0
yarn tsc                      -> exit 0
yarn test --coverage --ci     -> exit 0 · Test Suites: 59 passed · Tests: 408 passed · All files 98.43% stmts / 92.02% branch
yarn test (5×)                -> 408 passed nas 5, 0 avisos de act
actionlint .github/workflows/mobile.yml -> exit 0
```
O build nativo do iOS não foi refeito porque não há mudança nativa. Usei o app já instalado no simulador 1E7DEFC7, com o Metro deste worktree e a API do worktree api (`YARN_IGNORE_PATH=1 yarn build` + `node dist/main`, porta 3333, sem reset). A API foi parada no fim. O app foi dirigido por CDP (o mesmo método da T9: acha a fibra pelo `testID` e chama o `onPress`).

Evidências em `evidencias/`:
- `tarefa-13-sem-aulas.mp4`, `-sem-aulas-frames.png` (quadros de 66 ms) e `-sem-aulas.png`: a ilustração cresce enquanto aparece, e o texto entra depois.
- `tarefa-13-erro-retry.mp4`, `-erro.png` e `-erro-recuperado.png`: BootError com a API parada, TENTAR DE NOVO que falha (shake), e a API de volta abrindo as abas.
- `tarefa-13-selecao.mp4` e `-selecao.png`: o modal de seleção abrindo.

O banner amarelo "Open debugger to view warnings" que aparece com a API parada é o `warn` "http GET /me sem resposta" do interceptor (T8). Conferi por CDP que com a API no ar não sai nenhum warning.

### Para o qa
- **VoiceOver/TalkBack** (não há Simulator.app nesta máquina, então não dá para ligar o VoiceOver aqui):
  - ao abrir TROCAR PERFIL, o foco deve começar em "Escolha o perfil…", não no FECHAR;
  - com a API parada, o erro é lido ao aparecer e de novo, uma vez, a cada TENTAR DE NOVO que falha.
- **Reduzir movimento ligado:** o "sem aulas" (sábado) aparece em fade, sem escala nem deslocamento.
- **Boletim com 404 + retry:** o texto não pisca. Isso não ocorre no seed; o teste unitário cobre.
- **Reactotron:** com o app desktop aberto (no Android, `adb reverse tcp:9090 tcp:9090`), a timeline mostra "ESTADO" com queries e stores. Depois de um login, conferir que não aparece senha, CPF nem token.
- Contas: Gustavo `969.294.560-04` / `123456`.

### Pendências de deploy
- Nada nativo, nenhuma env nova. Continua OTA-compatível.
- O CI do Android só vai provar o build quando houver remote. Se o `assembleDebug` falhar, a correção é uma tarefa à parte.

### Ressalvas
1. Workflow validado só pelo actionlint. Nenhum job foi executado (sem remote), e o Android continua sem prova de build.
2. Foco e anúncio do leitor de tela provados por teste unitário, não por VoiceOver de verdade.
3. O NoStudent mostra o EmptyState junto com a saudação, sem o atraso de 4×stagger da 4.3. É detalhe e ficou como está.
4. A suíte imprime muito log `console.info/warn` do logger (cerca de 200 linhas por execução). Não são erros, mas poluem o log do CI. Silenciar o `consoleTransport` no Jest seria uma mudança fora do escopo; deixo a decisão para o chief.

**Status: PRONTO COM RESSALVAS** (ressalvas 1–4 acima). Commits `7fc41fc..2da2623`. Testes: 59 suítes, 408 testes passando, lint e tsc limpos, actionlint ok, 0 avisos de act em 5 execuções.

### Rodada 1

Commits `1f1df3b..176ab84`, sobre `2da2623`, na branch `feat/mobile`. O push falha porque não há remote.

| Achado | Resposta |
|---|---|
| [IMPORTANTE] as duas abas anunciam o erro | **corrigido em `1f1df3b`**. O `ErrorState` ganhou a prop obrigatória `announce`, que entra nas deps do efeito (`[texto, shakeKey, announce]`). `LessonsScreen` e `ReportCardScreen` passam `useIsFocused()`, e o `BootErrorScreen` passa `true`. A aba escondida não anuncia. Quando ganha foco já com o erro na tela, anuncia uma vez. Perder o foco não anuncia. |
| [SUGESTÃO] Reactotron no bundle de release | **corrigido em `05c1da0`**. `devtools.ts` usa `if (__DEV__) { require(...) … }` no lugar do `return` antecipado. |
| [SUGESTÃO] 4 ABIs no `assembleDebug` do CI | **corrigido em `68bfc20`**. `./gradlew assembleDebug -PreactNativeArchitectures=x86_64 --no-daemon --stacktrace`, com um comentário explicando. Não mexi no heap do Gradle; fica para quando a primeira execução real mostrar a necessidade. |
| Ressalva 4 (logger no Jest), pedido do chief | **corrigido em `176ab84`**. No `jest.setup.ts`, `jest.mock` do `services/logger/transports` com um `consoleTransport` mudo. O nível, a redação e as chamadas do logger continuam valendo, e os testes que olham o log usam `jest.spyOn(logger, …)`. |

O que mais mudou para o item 4: o `consoleTransport` guardava `console.warn` (e os outros métodos) quando o módulo carregava, e por isso um spy no console não via nada. Agora ele lê `console[level]` na hora da chamada. Isso também vale para quem troca o console depois. Esse transporte tem teste próprio com `jest.requireActual`.

**Testes (RED → GREEN):**
- `ErrorState.test.tsx`, 2 testes novos. RED: `fora de foco (aba escondida) não anuncia` falhou com `Expected number of calls: 0 / Received: 1`. O teste "anuncia ao ganhar foco" passou no RED, porque antes o componente anunciava na montagem; ele só passou a provar alguma coisa depois da correção, e eu registro isso. GREEN: 8/8.
- `LessonsScreen.test.tsx` e `ReportCardScreen.test.tsx`, 2 testes novos cada, com `useIsFocused` mockado. RED, depois da prop `announce` e antes de as telas a passarem: `aba em foco anuncia o erro uma vez` falhou com `Expected number of calls: 1 / Received: 0` nas duas telas. A "aba escondida" passou no RED, como caracterização. GREEN: 17/17.
- `services/logger/__tests__/transports.test.ts`, 3 testes novos.
  - 1º RED: os testes "não escreve no console" e "transporte escreve no nível certo" estavam errados pelo motivo do console guardado na carga. O 1º passava sem provar nada, e o 3º falhava (`Expected: "[warn] sem resposta", {"url": "/me"}`).
  - Depois da leitura na hora da chamada, RED válido: `o logger do app não escreve no console` falhou com `Expected number of calls: 0 / Received: 1`.
  - Com o mock no `jest.setup`: GREEN, 3/3.
- Bundle de release (prova do item 2, sem teste unitário possível): `npx react-native bundle --platform android --dev false --minify true --entry-file index.js --bundle-output /tmp/...`.
  - Antes: `grep -c reactotron` → **4**.
  - Depois: **0**.
  - O bundle ficou 37 KB menor (3.410.833 → 3.373.372 bytes).
  - Os arquivos ficaram em `/tmp`; a árvore do worktree continua limpa.

**Verificação (`cd mobile`):**
```
yarn lint                   -> exit 0
yarn tsc                    -> exit 0
yarn test --coverage --ci   -> exit 0 · 60 suítes · 417 testes · 98.35% stmts / 91.89% branch
yarn test (3×)              -> 417 passed nas 3, 0 avisos de act
saída do jest: 3294 → 204 linhas (204 = resumo + tabela de cobertura; 0 linhas de console)
actionlint .github/workflows/mobile.yml -> exit 0
```

**Para o qa:** o roteiro do reviewer.
1. Com o VoiceOver ligado, visitar as duas abas.
2. Derrubar a API e trocar de aluno.
3. Conferir que só a aba visível anuncia o erro.
4. Ir para a outra aba: o erro dela deve ser lido uma vez.

**Status da rodada: PRONTO.** Commits `1f1df3b..176ab84`. Ressalvas 3 e 4 da entrega: a 4 foi resolvida; a 3 (NoStudent sem o 4×stagger) continua como detalhe aceito. A ressalva 1 continua: o workflow não rodou de verdade, por falta de remote.

## Mensagens
→ chief: Tarefa 13 entregue. Os 8 itens estão feitos.
- Reactotron: não usei plugin pronto, porque o de React Query não filtra `variables`. Escrevi um inspector próprio, com teste de que senha, CPF e token não saem.
- CI: o `mobile.yml` passa no actionlint, mas a primeira prova do Android só vem quando houver remote.
- Decisão para você: silenciar o log do logger no Jest (ressalva 4)?

→ code-reviewer: ao revisar o `stateInspector.ts`, confira o filtro das mutations (só chave e status).
- No `useReportCardViewModel.ts`, o `lastError` é estado ajustado no render.
- No `App.test.tsx`, a espera de 250 ms dentro do act no `afterEach` tem a justificativa no comentário.

→ qa: roteiro na seção "Para o qa" acima: VoiceOver na seleção e no erro, reduzir movimento no "sem aulas" e Reactotron sem dados sensíveis.

## Tarefa 17 — parte 1

- Worktree `.claude/worktrees/tooling`, branch `chore/tooling`, BASE 414cb6b, último commit **592eec9** `docs: README com instalação, arquitetura e SDD`. Push não feito: o repositório não tem remote (decisão do ledger).

### O que mudou

- `README.md` (raiz): reescrito. Seções: visão geral (telas, API no lugar do JSON, rotas), Demonstração (placeholders `docs/media/*.gif`), stack e dependências (mobile, api, raiz, com versão e porquê), pré-requisitos (Node 24, yarn 1/yarn 4, Xcode/CocoaPods, JDK 17 + SDK, Docker e Maestro opcionais), como rodar a API (yarn local e Docker, tabela de envs do `api/.env.example`, reset), como rodar o app (`API_URL` por alvo, iOS, Android, Metro sem watchman), credenciais (Gustavo, Adelaide, Carlos) e a regra da agenda (D35), testes e qualidade (comandos de cada pasta, hooks, workflows), arquitetura (API e app, mermaid `erDiagram` do modelo), SDD (`/squad`, artefatos, config da IA), decisões e limitações, próximos passos, troubleshooting (yarn 3 na pasta-mãe reaproveitado, conexão, 429, cache do Metro).

### Decisões

- Fontes conferidas nos worktrees (só leitura): `api/package.json`, `api/.env.example`, `docker-compose.yml`, `api/Dockerfile`, `api/docker-entrypoint.sh`, `api/prisma/schema.prisma`, `.github/workflows/api.yml` (branch `feat/api`, b821797); `mobile/package.json`, `mobile/.env.example`, `mobile/.yarnrc.yml`, `mobile/metro.config.js`, `.github/workflows/mobile.yml`, `src/services/http/apiUrl.ts` (branch `feat/mobile`, 2da2623); `commitlint.yml`, `.husky/*`, `.lintstagedrc.js`, `commitlint.config.js` (tooling).
- `expo` ~58 está instalado; `expo-notifications` não. O README diz "Expo Modules, base para o push (previsto)". **OTA removido** de todo o README depois da mensagem do chief (Tarefa 15 cancelada): não há `expo-updates`, EAS nem OTA em nenhuma seção.
- `Device` fica fora do diagrama do modelo (é da Tarefa 16, ainda não existe no schema). Rotas `/devices` e `/demo/grades` também ficam fora da tabela.
- `maestro.yml`, flows do Maestro e APK em tag aparecem como "previsto" nas tabelas.
- Pod install documentado como `bundle install` + `bundle exec pod install` (há `Gemfile` no mobile), com `pod install` como alternativa.
- Não citei números de testes (mudam a cada tarefa).

### Verificação

- Todos os comandos citados existem nos scripts: api (`prisma:setup`, `start:dev`, `start:prod`, `build`, `prisma:reset`, `prisma:seed`, `test`, `test:cov`, `test:e2e`, `lint`, `tsc`, `format`, `format:check`, `prisma:validate`, `scripts/smoke.sh`) e mobile (`ios`, `android`, `start`, `test`, `lint`, `tsc`, `format`, `format:check`). `SEED_RESET=true yarn prisma:seed` funciona porque o `seed.ts` lê `process.env.SEED_RESET` e o dotenv não sobrescreve env já definida.
- Links relativos: todos existem no tooling, exceto `api/.env.example` (existe após o merge da `feat/api`). A pasta da tarefa está linkada; `01-design.md` em diante, `revisao/` e `evidencias/` ainda não estão commitados (o README avisa que entram no fechamento).
- `npx --yes markdownlint-cli2 README.md` (padrão): 150 avisos, todos MD060 (estilo `|---|` das tabelas, o mesmo do resto do repo) e MD013 dentro de tabelas. Com MD060 desligado e MD013 sem tabelas/code blocks: **0 issues**. Não adicionei config de markdownlint ao repo (fora do escopo).
- Comandos não executados nesta tarefa (só documentados): subir a API, Docker, build do app. Eles foram provados nas tarefas de origem (ledger).

### Para o qa

- Seguir o README do zero numa cópia limpa (G3) depois do merge das três trilhas: API pela opção A e pela B, app no simulador iOS.

### Rodada 1

Commit **5c2d363** (`chore/tooling`). `npx --yes markdownlint-cli2 --config <MD060 off, MD013 sem tabelas/código> README.md` → `Summary: 0 issues in 0 files`.

1. [IMP] CORS: corrigido em 5c2d363. A linha diz: origens separadas por vírgula, ou `*`; sem a variável vale `*` fora de produção; com `NODE_ENV=production` a variável é obrigatória (o compose define `*` de propósito).
2. [IMP] Android: corrigido em 5c2d363. A tabela de pré-requisitos e o novo parágrafo trazem SDK Platform 37, Build-Tools 37.0.0, NDK 27.1.12297006 e minSdk 24, conferidos em `mobile/android/build.gradle` do worktree mobile, mais `JAVA_HOME`/`ANDROID_HOME`/`PATH`. A limitação virou "Android ainda não buildado: o build está configurado no CI (`mobile.yml`), mas ainda não foi executado".
3. [IMP] Docker: corrigido em 5c2d363. A Opção B abre com o aviso "Ainda não executado", que aponta o job `docker` do `api.yml` como a primeira execução real e manda usar a Opção A se falhar. A introdução diz que a Opção A é a verificada, e as limitações ganharam o item "Docker ainda não executado".
4. [SUG] `openssl`: corrigido em 5c2d363. O comando saiu do bloco executável, e uma frase explica onde colar o valor (linha `JWT_SECRET=` do `api/.env`, entre aspas).
5. [SUG] Início rápido: corrigido em 5c2d363. A seção nova fica antes do Sumário (API com yarn + app iOS + login do Gustavo, com links). Repetições cortadas: o parágrafo de `JWT_SECRET` depois do curl, a decisão "Segredo do JWT" e o rate limit nas credenciais, que virou link para o Troubleshooting. Ficaram a tabela de envs, o bullet do Docker e o Troubleshooting.
6. [SUG] Aparelho físico: corrigido em 5c2d363. A tabela do `API_URL` separa iPhone físico (IP da máquina) de Android USB (`localhost` + `adb reverse tcp:3333 tcp:3333`). Há uma nota de assinatura no Xcode (Team em Signing & Capabilities) com `yarn ios --device` e uma nota do `adb reverse` na seção Android.
7. [SUG] Árvore da API: corrigido em 5c2d363. Pelo `ls` real, `health/` é só controller e DTO. As subpastas viraram "Padrão de auth/, guardians/ e students/", com a nota de que o auth usa o repositório de credenciais de guardians (conferido no import do `login.use-case.ts`). O auth não tem pasta `repositories/`.
8. [SUG] Marcadores provisórios para o grep da parte 2: `grep -n "previst\|a gravar\|a confirmar\|no fechamento\|ainda não" README.md`. Ocorrências hoje:
   - Demonstração: 5 linhas de GIF "(a gravar)" (`docs/media/{login,agenda,boletim,trocar-aluno,estados}.gif`)
   - Stack: `expo` "previsto" (2 lugares: parágrafo do RN CLI e tabela)
   - Pré-requisitos: Maestro "(previsto)"
   - Testes: "Flows do Maestro (previstos, Tarefa 14)", linhas `maestro.yml` e "APK de release" "previsto"
   - SDD: "entram no repositório no fechamento da entrega"
   - Opção B: aviso "Ainda não executado" + "a Opção B ainda não foi executada" na introdução da seção
   - Limitações: "Android ainda não buildado" e "Docker ainda não executado"
   - Próximos passos: Push "a confirmar"

### Rodada 2

Commit **a49030a** (`chore/tooling`). Markdownlint (mesma config da rodada 1) → `Summary: 0 issues in 0 files`. `grep -n adb README.md` → nenhuma ocorrência.

1. [IMP] Android físico com `localhost` + `adb reverse`: corrigido em a49030a. Conferi `mobile/src/services/http/apiUrl.ts` (worktree mobile): no Android, `resolveApiUrl` troca `//localhost` e `//127.0.0.1` por `//10.0.2.2`, então `localhost` com `adb reverse` nunca chegaria na máquina. A tabela do `API_URL` voltou a ter uma linha só, "Aparelho físico (iPhone ou Android)", com o IP da máquina na rede. A nota do `adb reverse` saiu e foi trocada por esta: num Android use o IP da máquina, não `localhost`, que o app troca por `10.0.2.2` (só existe no emulador). A frase "sem depender de IP nem de firewall" foi removida.

## Tarefa 14 — Mobile: flows do Maestro

**Worktree:** `/Users/fael_st/workspace/fiap/.claude/worktrees/mobile`, branch `feat/mobile`.
**Commits:** `32e5e94` (flows + checagem) e `db515e3` (CI), em cima de `176ab84`. Não há remote, então a branch fica só local (sem push).

**Os flows NÃO foram executados.** Esta máquina não tem Maestro, Java nem Android SDK. Validei só de forma estática: o YAML faz parse, o `appId` está certo, os subflows existem e todos os ids existem como `testID` em `src/`. Também rodei o actionlint.

### O que mudou
- `mobile/.maestro/config.yaml`: workspace que roda `"*"` (só a raiz), então os subflows não rodam sozinhos.
- `mobile/.maestro/subflows/launch-clean.yaml`: `launchApp` com `clearState` + `clearKeychain` e espera `login-screen` por 12 s.
- `mobile/.maestro/subflows/login.yaml`: CPF e senha por `env` (`CPF` só com dígitos, `PASSWORD`) e o toque em FAZER LOGIN.
- `mobile/.maestro/subflows/select-student.yaml`: TROCAR PERFIL, toque em `select-student-card-${RM}` e espera a seleção fechar.
- `mobile/.maestro/subflows/logout.yaml`: SAIR e espera `login-screen`.
- `01-login-invalido.yaml`: Gustavo com a senha `000000`. Espera `login-error-message` com a regex `(?s)Usuário ou senha inválida\..*`, continua em `login-screen` e não mostra a Agenda.
- `02-login-sucesso.yaml`: Gustavo. Confere `agenda-screen`, `header-greeting` `(?i)olá, gustavo`, o aluno `(?i)aluno (rafael|joana),.*`, TROCAR PERFIL, SAIR, o título, o dropdown e as duas abas.
- `03-sessao-persistida.yaml`: login, `stopApp`, `launchApp` sem limpar estado, e espera `agenda-screen` por 12 s, sem `login-screen`.
- `04-aulas-navegar-dias.yaml`: escolhe o Rafael e abre o dropdown pelas opções `agenda-day-dropdown-option-2025-03-17/18/16`.
  - 17: rótulo `17 de março, segunda-feira` e `agenda-lesson-0` com `07:15 … Matemática I`.
  - 18: `Produção e Interpretação de Textos`.
  - 16: `agenda-empty` com "Sem aulas neste dia", sem `agenda-lesson-list`.
- `05-boletim-2025.yaml`: Rafael, aba Boletim com `7EF - 2025`.
  - T1 > disciplina 0 (Língua Portuguesa): resultado `Nota 9,5, 0 faltas`.
  - T2 > disciplina 0: `Nota e faltas ainda não lançadas`.
  - Só no Android, confere também os textos `9,5`/`0` e `-`/`-`.
- `06-boletim-anos-anteriores.yaml`: Rafael, opção `boletim-year-dropdown-option-2024`. Confere `6EF - 2024` e, em T1 > disciplina 0, `Nota 8,0, 1 falta`.
- `07-trocar-aluno.yaml`: Gustavo na aba Boletim. Escolhe o Rafael (`7EF - 2025`, header Rafael) e depois a Joana (`2EM - 2025`, header Joana). Continua em `boletim-screen`, sem o dropdown da Agenda.
- `08-um-aluno-sem-botao.yaml`: Adelaide. Saudação, Bianca no header, SAIR, sem `header-switch-student-button` na Agenda e no Boletim (`1EF - 2025`).
- `09-sem-aluno.yaml`: Carlos. `no-student-screen`, `no-student-empty`, "Nenhum aluno vinculado" e SAIR, sem TROCAR PERFIL e sem `tab-bar`.
- `10-logout.yaml`: login, SAIR, Login, `stopApp`/`launchApp` e de novo `login-screen` por 12 s, sem a Agenda.
- `mobile/.maestro/scripts/testids.js`: funções puras `collectSourcePatterns`, `createTestIdMatcher`, `extractFlowIds` e `checkFlows`.
- `mobile/.maestro/scripts/check-testids.js`: CLI (`yarn maestro:check`).
- `mobile/.maestro/scripts/__tests__/testids.test.js`: 13 testes (jest, `@jest-environment node`).
- `mobile/.maestro/README.md`: tabela dos flows, contas, pré-requisitos, como rodar e observações.
- `mobile/package.json` / `yarn.lock`: script `maestro:check` e `yaml@2.9.1` em devDependencies. É a mesma versão que já estava no lockfile, via `@react-native-community/cli-doctor`; o lockfile só ganhou o alias.
- `.github/workflows/maestro.yml` (novo) e `.github/workflows/mobile.yml` (passo `yarn maestro:check` depois do tsc).

### Decisões
1. **Subflows em `subflows/`, sem prefixo `_`.** O `config.yaml` com `"*"` pega só a raiz. Um `_login.yaml` na raiz rodaria como flow e falharia sem `env`.
2. **Textos dentro de elementos `accessible` são conferidos pelo rótulo, não pelo testID de dentro.** No iOS, o XCUITest não expõe os filhos de um elemento acessível. Isso vale para `header-student-name`, `agenda-lesson-<i>-subject` e `boletim-term-*-subject-*-grade`, que ficariam invisíveis para o Maestro. Por isso:
   - aluno do header: `(?i)aluno rafael,.*`, o rótulo `Aluno Rafael, turma 7EF, …`;
   - aula: `id: agenda-lesson-0` + regex sobre `Das 07:15 às 08:00, Matemática I`;
   - nota: `id: …-result` + `Nota 9,5, 0 faltas`;
   - os textos internos (`9,5`, `-`) num `runFlow when: platform: Android`.
   
   É inferência sobre o XCUITest. Não pude provar sem o Maestro.
3. **Aluno e dia escolhidos de forma explícita** (aluno pelo `select-student.yaml`, dia pelo testID da opção). Os flows não dependem da ordem do `/me` (Tarefa 16) nem do dia de hoje (D35). Os flows 02 e 03 aceitam qualquer um dos dois alunos.
4. **CI: APK debug com o bundle JS de produção dentro**, no lugar do `assembleDebug` puro que você pediu. Motivos:
   - o APK debug sem Metro não tem JS;
   - o release não fala HTTP com `10.0.2.2`, porque o `usesCleartextTraffic` é `false` fora do debug;
   - subir o Metro no job traria o LogBox, cujo toast cobre a tab bar (ressalva 3 da T10).
   
   O passo roda `react-native bundle --dev false` para `android/app/src/main/assets` antes do `assembleDebug`. Sem Metro, o app carrega o bundle do APK. Rodei esse comando aqui (saída em `/tmp`): gerou o bundle e copiou 21 assets, e não tem `reactotron`.
5. **`maestro.yml` assume o monorepo final** (`api/` e `mobile/` juntos no `main`). Nesta branch não existe `api/`. A API sobe pelo `.env.example` com:
   - `JWT_SECRET` de `openssl rand -base64 48`, mascarado no log;
   - `LOGIN_THROTTLE_LIMIT=1000` e `LOGIN_THROTTLE_CPF_LIMIT=1000`;
   - `yarn prisma:setup`, `yarn build` e `node dist/main &`, com espera em `/api/health`.
   
   Outros detalhes do job:
   - emulador `reactivecircus/android-emulator-runner@v2`, API 34, x86_64, `google_apis`, `disable-animations: true`;
   - publica `maestro-report/` (JUnit + `--debug-output`) e, se falhar, o log da API.
6. **A checagem de ids recusa erro de digitação no meio de um id derivado.** A parte variável de um template (`${term.term}`, `${option.key}`) casa só `palavra(-número)*`. Com `.+`, `boletim-term-2-subjct-0-result` passava (ver RED abaixo).

### Testes (RED → GREEN), `cd mobile`
- `yarn jest .maestro`, antes do módulo existir: `Cannot find module '../testids'`. Depois do módulo: 9/9.
- `checkFlows`, 3 testes novos. RED: `TypeError: checkFlows is not a function` (3 falhas). GREEN: 12/12.
- Prova negativa com o código real: troquei um id do flow 05 por `boletim-term-2-subjct-0-result` e o `yarn maestro:check` **passou** (exit 0), o que era um bug do matcher. Escrevi o teste `recusa erro de digitação no meio de um id derivado`. RED: `Expected: false / Received: true`. Com a variável restrita, GREEN 13/13. Repeti a prova negativa: `exit=1` com `05-boletim-2025.yaml: id "boletim-term-2-subjct-0-result" não existe em src/`. Depois desfiz a troca: exit 0.

### Verificação (fresca, `cd mobile`, sobre `db515e3`)
```
yarn lint            -> exit 0
yarn tsc             -> exit 0
yarn test            -> Test Suites: 61 passed; Tests: 430 passed (antes 417; +13)
yarn maestro:check   -> Flows do Maestro ok: 14 arquivos, 90 ids conferidos.
actionlint .github/workflows/maestro.yml .github/workflows/mobile.yml -> exit 0
yarn format:check    -> exit 1, só por src/services/logger/__tests__/transports.test.ts
                        (arquivo do commit 176ab84 da T13, que não toquei; o mobile.yml não roda format:check)
```

### Como o qa roda (quando houver Maestro)
1. API (`cd api`): em `.env`, `LOGIN_THROTTLE_LIMIT=1000` e `LOGIN_THROTTLE_CPF_LIMIT=1000`. Depois `yarn prisma:reset` (seed limpo) e `yarn start:dev` (porta 3333).
2. App: `mobile/.env` com o `API_URL` do alvo e build (`yarn ios` ou `yarn android`).
3. `cd mobile && maestro test .maestro` (todos) ou `maestro test .maestro/05-boletim-2025.yaml`.
4. Contas: Gustavo `96929456004`/`123456`, Adelaide `50879567007`/`987654`, Carlos `31415926590`/`111111`.
5. No CI: Actions > maestro > Run workflow (depois do merge das trilhas e com remote).

### Pendências de deploy
- Nada nativo, sem migration e sem env nova do app. O CI depende de `api/` estar no mesmo repo e de um remote no GitHub.

### Ressalvas
1. Os flows **nunca rodaram**, nem no iOS nem no Android. O M11 ("flows passam no emulador e no simulador") continua aberto até alguém com Maestro rodar.
2. A decisão 2 (filhos de elemento acessível no iOS) e o fallback do APK debug para o bundle embutido (decisão 4) são inferências minhas. Se o 1º run do `maestro.yml` falhar no boot do app, a alternativa é subir o Metro no job (`yarn start &`) e aceitar o LogBox.
3. O CLI do Maestro é instalado sem versão fixa (`curl … | bash`). Se quiser fixar, é só pôr `MAESTRO_VERSION` no passo.
4. `yarn format:check` falha por um arquivo da T13 (ver Verificação). É uma linha de prettier, fora desta tarefa.

### Mensagens
→ chief: Tarefa 14 entregue em `32e5e94..db515e3`, só estática. Duas decisões para você confirmar:
- o APK debug com bundle embutido no lugar do `assembleDebug` puro (decisão 4);
- a nova devDependency `yaml@2.9.1`.

O `format:check` vermelho é da T13 (`transports.test.ts`).

→ developer da Tarefa 17 (README): o README precisa dizer sobre o Maestro:
- **Pré-requisitos**: Maestro CLI (`curl -fsSL "https://get.maestro.mobile.dev" | bash`), Java 17 e simulador/emulador com o app buildado.
- **API para os flows**: `LOGIN_THROTTLE_LIMIT` e `LOGIN_THROTTLE_CPF_LIMIT` altos (ex.: 1000) e o seed limpo; o `API_URL` do app aponta para ela (Android: `http://10.0.2.2:3333/api`).
- **Comandos**, em `mobile/`:
  - `maestro test .maestro` (todos);
  - `maestro test .maestro/<flow>.yaml` (um);
  - `--include-tags login|agenda|boletim|alunos`;
  - `yarn maestro:check` (estático, sem emulador).
- **CI**: `maestro.yml` roda no `workflow_dispatch` ou em PR para `main` com a label `e2e`. O relatório JUnit e os prints de falha saem no artefato `maestro-report`. O `mobile.yml` roda o `maestro:check` em todo PR.
- Trocar o "previsto" das tabelas pelo estado real e linkar `mobile/.maestro/README.md`.

→ qa: rode a tabela de `mobile/.maestro/README.md` assim que houver Maestro. Os pontos mais prováveis de quebrar são o rótulo do aluno no header no iOS (`(?i)aluno rafael,.*`) e o `scrollUntilVisible` do T2 em tela pequena.

→ code-reviewer: vale olhar o matcher de `testids.js` (`VARIABLE_VALUE` e a divisão base + sufixo, recursiva com cache) e o passo do bundle no `maestro.yml`.

**Status: PRONTO COM RESSALVAS** (ressalvas 1 a 4 acima).

### Rodada 1 (Tarefa 14)

Commits `38e7049`, `e8f4d71` e `8ffd107`, em cima de `db515e3` (branch `feat/mobile`, só local).

- **`yarn format:check` vermelho**: corrigido em `38e7049`. Só rodei o prettier em `src/services/logger/__tests__/transports.test.ts` (2 linhas). `yarn format:check` agora sai com exit 0.
- **[SUG] o matcher aceitava o sufixo de um componente colado em qualquer base**: corrigido em `e8f4d71`. Eu já tinha visto o problema: `agenda-lesson-0-result` e `login-screen-retry` davam true. Decidi ligar cada sufixo ao componente que o declara, em vez de só registrar o limite. Saiu barato, com o `@babel/core`, que já é devDependency.
  - O `testids.js` agora lê o JSX com `parseSync` (plugins `typescript` e `jsx`). Ele anota, por componente, os elementos que recebem `testID` e o que é passado: literal, template, `testID`, `{...props}` ou props `*TestID`.
  - Depois expande a partir de cada componente. Um id que chega a um componente do projeto é repassado a ele como base. Um id que chega a um elemento nativo vira terminal.
  - Assim `${testID}-content` só vale para o que chega ao `Accordion`. A ligação vale também por `{...props}` (o `CpfInput`) e por props `*TestID`, seguidas pelo nome: `loadingTestID`, `tabBarButtonTestID` → `tab-agenda-active-layer`.
  - A API mudou: `collectSourcePatterns` e `createTestIdMatcher` saíram, e entrou `buildTestIdMatcher(sources)`. O `extractFlowIds` e o `checkFlows` ficaram iguais.
  - **Testes (RED → GREEN)** em `.maestro/scripts/__tests__/testids.test.js`. Os fixtures imitam `Accordion` → `SubjectAccordion` → `TermAccordion`, o `ErrorState` (`retryTestID ?? \`${testID}-retry\``), o `TabBar` (`options.tabBarButtonTestID`) e o `PrimaryButton` (`loadingTestID`).
    - RED: `TypeError: buildTestIdMatcher is not a function`.
    - GREEN do matcher: 7/7. Um teste do `checkFlows` caiu porque o fixture tinha JSX fora de função. Passei a tratar o escopo do módulo como um componente sem prop `testID`, e ficou 12/12.
    - Rodando contra o código real, o `maestro:check` acusou `subflows/login.yaml: id "login-cpf-input" não existe`. O id existe: o `CpfInput` repassa o testID por `{...props}`. Escrevi o teste `segue o testID repassado por spread de props`. RED: `Expected: true / Received: false`. Implementei o repasse por spread e ficou GREEN, 13/13.
  - **Conferência contra o `src/` real:**
    - false: `agenda-lesson-0-result`, `login-screen-retry`, `boletim-term-2-subjct-0-result`;
    - true: `boletim-term-2-subject-0-result`, `boletim-error-retry`, `tab-agenda-active-layer`, `login-submit-loading`, `agenda-day-dropdown-option-2025-03-17`, `select-student-card-12567`, `boot-error-retry`, `agenda-skeleton-row-1`, `login-cpf-input-line`.
  - **Limite que ficou**, registrado no `.maestro/README.md`: um testID montado numa variável fora do JSX não é visto. Nesse caso o check acusa o id (falha para o lado seguro), e a correção é usar o id direto no JSX. Hoje não há nenhum caso assim no `src/`.
- **[SUG] Maestro sem versão fixa**: corrigido em `8ffd107`. O passo de instalação agora tem `MAESTRO_VERSION: 2.11.0`.
  - Conferi na API de releases do GitHub (`mobile-dev-inc/maestro`). A `cli-2.11.0` é estável, de 2026-09-29. A `cli-2.12.0` é de 2026-10-26, com menos de 2 semanas, por isso não usei.
  - O instalador (`get.maestro.mobile.dev`) lê `MAESTRO_VERSION` e baixa `releases/download/cli-$MAESTRO_VERSION/maestro.zip`.
  - No `TestCommand.kt` da tag `cli-2.11.0` existem as opções usadas no workflow: `--format` (JUNIT), `--output`, `--debug-output` e `--include-tags`.
  - O `.maestro/README.md` cita a versão e o comando com `MAESTRO_VERSION=2.11.0`.

**Verificação (fresca, `cd mobile`, sobre `8ffd107`):**
```
yarn lint           -> exit 0
yarn tsc            -> exit 0
yarn test           -> Test Suites: 61 passed; Tests: 430 passed
yarn format:check   -> exit 0
yarn maestro:check  -> Flows do Maestro ok: 14 arquivos, 90 ids conferidos.
actionlint .github/workflows/maestro.yml .github/workflows/mobile.yml -> exit 0
```
Os flows continuam **sem execução real**, porque não há Maestro nem Java nesta máquina.

**Status da rodada: PRONTO COM RESSALVAS.** As ressalvas 1 e 2 da entrega continuam: os flows nunca rodaram, e as inferências sobre o iOS e sobre o bundle embutido não foram provadas. A 3 (versão do Maestro) e a 4 (`format:check`) foram resolvidas.

#### Mensagens
→ chief: rodada 1 da T14 em `38e7049..8ffd107`. Os 3 itens foram tratados. O matcher agora segue o JSX (decisão: ligar o sufixo ao componente, com teste) e o Maestro está fixo na 2.11.0.
→ developer da Tarefa 17 (README): a versão do Maestro é a 2.11.0. Para instalar: `curl -fsSL "https://get.maestro.mobile.dev" | MAESTRO_VERSION=2.11.0 bash`.


## Tarefa 16a — API: ordem dos alunos e e2e estável

- Repo/worktree: `api/` em `/Users/fael_st/workspace/fiap/.claude/worktrees/api`, branch `feat/api`.
- Commits: **fc18502** `feat(api): alunos do /me na ordem do JSON oficial` e **00ae8cc** `test(api): e2e de concorrência do limite por CPF sem depender de tempo`.
- Push: não feito. `git push` → `fatal: 'origin' does not appear to be a git repository` (sem remote, como o ledger registra; o fim da trilha é a branch local).

### O que mudou

- `prisma/schema.prisma`: `GuardianStudent.position Int @default(0)`, a posição do aluno na lista do responsável.
- `prisma/migrations/20261028043754_guardian_student_position/migration.sql` (nova; a `init` não foi tocada): redefine a tabela (padrão do Prisma no SQLite) e faz um backfill que numera por `rm`, dentro de cada responsável, os vínculos que já existem.
- `prisma/seed.ts`: grava `position` com o índice do aluno no `alunos[]` do JSON.
- `src/modules/guardians/repositories/prisma-guardian-profiles.repository.ts`: `orderBy: [{ position: 'asc' }, { student: { rm: 'asc' } }]` na relação.
- `src/modules/guardians/repositories/guardian-profiles.repository.ts`: JSDoc de `students` com o contrato da ordem.
- `src/modules/guardians/use-cases/get-me.use-case.ts`: tira o `byFirstName`/`toSorted`; devolve na ordem do repositório.
- `src/modules/guardians/dto/me.response.ts`: descrição do Swagger ("Ordenados pelo nome" → "Na ordem do cadastro do responsável (a do JSON oficial)").
- `src/modules/guardians/use-cases/get-me.use-case.spec.ts`: espera `[rafael, joana]`; o caso "ordena pelo primeiro nome" virou "mantém os alunos na ordem do repositório, sem reordenar por nome".
- `test/me.e2e-spec.ts`: o Gustavo recebe `students[0].firstName === 'Rafael'` e a lista Rafael, Joana; caso novo que inverte `position` no banco e espera Joana, Rafael (restaura no `finally`).
- `test/auth-throttle-cpf-concurrency.e2e-spec.ts`: o caso (b) com limite 10 manda 20 senhas erradas e espera exatamente 10 × 401 e 10 × 429.

### Decisões

- **`position` em vez de critério derivado.** A ordem é dado do vínculo (vem da lista `alunos` do JSON), então fica gravada no vínculo. Ordenar por `rm` ou pela ordem de inserção reproduziria o JSON de hoje só por coincidência: os RMs do Gustavo estão em ordem crescente e os cuids crescem no tempo.
- **Backfill na migration.** O `dev.db` e o volume do Docker já têm dados, e o seed não roda de novo (`decideSeed` → `skip`). Sem backfill, todos os vínculos ficariam com `position = 0`. A numeração por `rm` é a única ordem que se pode derivar do banco, e no JSON oficial ela é igual à da lista. O UPDATE é determinístico. Num banco novo a tabela está vazia na hora da migration e o UPDATE não faz nada.
- **`rm` como desempate no `orderBy`.** Garante uma ordem total mesmo se surgirem posições empatadas, sem depender do plano do SQLite.
- **O use case não ordena mais.** A ordem é responsabilidade do repositório (documentada na interface). O use case não tem mais o que ordenar, porque `position` não sai no contrato da resposta.
- **Concorrência: só senhas erradas** (a primeira opção do pedido). Sem senha certa no lote não existe `reset` no meio, então a contagem não depende de tempo: o `tryAcquire` reserva no mesmo tick, 10 reservam e 10 recebem 429. A senha certa além do limite segue coberta pelo spec do interceptor (`a senha certa depois das vagas ocupadas recebe 429, mesmo com as outras em curso`).

### TDD (falha → sucesso)

1. `me.e2e`, ordem do Gustavo. RED com o use case ainda ordenando por nome:
   ```
   ● GET /api/me (e2e) › 200 para o Gustavo: CPF mascarado e Rafael e Joana, na ordem do JSON
     Expected: "Rafael"
     Received: "Joana"
   Tests: 1 failed, 5 passed, 6 total
   ```
2. `get-me.use-case.spec`. RED: `Tests: 2 failed, 4 passed, 6 total` (o use case devolvia Joana, Rafael). Depois de tirar o `toSorted`: `Tests: 6 passed, 6 total`.
3. Com o use case sem ordenar, o `me.e2e` passou (6/6), **mas por acaso**: a ordem implícita do SQLite coincidiu com a do JSON. Por isso escrevi o caso que inverte `position`:
   - RED 1 (a coluna não existe): `PrismaClientValidationError ... Unknown argument 'position'`.
   - RED 2 (schema, migration e seed feitos, repositório ainda sem `orderBy`): `● segue GuardianStudent.position, e não a ordem de inserção` → `Tests: 1 failed, 6 passed, 7 total`.
   - GREEN com o `orderBy`: `Tests: 7 passed, 7 total`.
4. Concorrência: a versão antiga, rodada 10× seguidas antes da mudança, deu `2 passed` nas 10. A corrida não se reproduziu nesta máquina; ela é analítica e foi apontada na revisão final. Depois da mudança, 10× seguidas:
   ```
   for i in $(seq 1 10); do yarn -s test:e2e test/auth-throttle-cpf-concurrency.e2e-spec.ts | grep '^Tests:'; done
   Tests:       2 passed, 2 total   (×10)
   ```

### Migration e seed

- Banco novo: `DATABASE_URL=file:./t16a.db yarn prisma:setup` → `Seed concluído: 3 responsáveis e 3 alunos.`; posições `Adelaide|Bianca|0`, `Gustavo|Rafael|0`, `Gustavo|Joana|1`. O `t16a.db` foi apagado.
- Banco já populado (cópia do `dev.db` antigo): `prisma migrate deploy` → backfill `Rafael|0`, `Joana|1`, `Bianca|0`. A cópia foi apagada.
- `dev.db` do worktree: `yarn prisma:setup` aplicou a migration (o seed foi ignorado porque já há dados) e o backfill deixou Rafael 0, Joana 1, Bianca 0. Não precisou de `SEED_RESET`.

### Verificação (em `api/`, `YARN_IGNORE_PATH=1`)

- `yarn lint` → ok
- `yarn tsc` → ok
- `yarn test` → `Test Suites: 22 passed`, `Tests: 298 passed`
- `yarn test:e2e` → `Test Suites: 18 passed`, `Tests: 122 passed`
- `yarn build` → ok
- `yarn prisma:validate` → `The schema at prisma/schema.prisma is valid`
- `./scripts/smoke.sh` → `SMOKE OK`

### Para o qa

- `cd api && yarn prisma:setup && yarn start:dev`, login do Gustavo (`96929456004` / `123456`), `GET /api/me` → `students` com Rafael (12567) e depois Joana (12568). No app, o aluno inicial do Gustavo passa a ser o Rafael, como no Figma.
- Os flows do Maestro não dependem da ordem: o `07-trocar-aluno` escolhe os dois alunos pelo RM.

### Pendências de deploy

- Migration nova `20261028043754_guardian_student_position`. O `migrate deploy` do entrypoint do Docker a aplica, e o backfill corrige volumes que já existem. Sem env nova e sem mudança nativa.

## Mensagens

- Ao chief: Tarefa 16a pronta em `feat/api` (fc18502, 00ae8cc). Sem push porque não há remote. A ordem do `/me` agora vem de `GuardianStudent.position`, e há uma migration nova com backfill para bancos já populados.

## Tarefa 16b — Mobile: remover Expo Modules

- Repo `mobile/`, worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/mobile`, branch `feat/mobile`, base `8ffd107`, último commit `730a052` (`refactor(mobile): remove Expo Modules e volta ao template do RN 0.88`). Sem push: o repositório não tem remote `origin`, como nas tarefas anteriores.
- Referência: `npx @react-native-community/cli@latest init FiapSchool --version 0.88.0 --package-name br.com.fiap.school --skip-install` em `/tmp/rn088tpl`, apagado no fim. Comparei cada arquivo nativo com essa cópia.

### O que mudou, arquivo por arquivo
- `package.json` / `yarn.lock`: saem `expo` e `babel-preset-expo`. Entra `@babel/plugin-transform-export-namespace-from@7.29.7` (dev), explicado abaixo.
- `babel.config.js`: preset `module:@react-native/babel-preset` (o do template), com os plugins `@babel/plugin-transform-export-namespace-from` e `react-native-worklets/plugin` (o último da lista, como pede o reanimated 4).
- `metro.config.js`: `getDefaultConfig` vem de `@react-native/metro-config` (template). `useWatchman: false` continua.
- `jest.config.js`: tirei `expo`, `@expo` e `expo-modules-core` do `transformIgnorePatterns`.
- `.gitignore`: sai o bloco `# Expo` (`.expo`, `dist/`, `web-build/`).
- `src/services/logger/redact.ts` + teste: sai a chave `expopushtoken`, porque o push foi removido. O caso do teste virou "token genérico e refresh token".
- `ios/Podfile`: igual ao template (sem `require` do autolinking do Expo, sem `use_expo_modules!` e sem o `config_command` do Expo). Com isso, `platform :ios, min_ios_version_supported`.
- `ios/FiapSchool/AppDelegate.swift`: igual ao template (`UIResponder, UIApplicationDelegate`).
- `ios/FiapSchool/SceneDelegate.swift`: o do template (`RCTDefaultReactNativeFactoryDelegate, UIWindowSceneDelegate`, módulo `FiapSchool`) mais `override func customize(_ rootView: RCTRootView)`, que chama `RNBootSplash.initWithStoryboard("BootSplash", …)`.
- `ios/FiapSchool.xcodeproj/project.pbxproj`: saem a fase `[Expo] Configure project`, o `ExpoModulesProvider.swift` (arquivo, grupo e Sources) e os `OTHER_SWIFT_FLAGS -D EXPO_CONFIGURATION_*`. A fase "Bundle React Native code and images" volta ao script do template, que não usa `@expo/cli`/`export:embed`. `IPHONEOS_DEPLOYMENT_TARGET` vai de 16.4 (exigência do Expo 58) para 15.1, como no template.
- `ios/Podfile.lock`: novo `pod install` limpo, com 98 pods e nenhum Expo (`grep -ic expo` = 0).
- `ios/FiapSchool/PrivacyInfo.xcprivacy`: o `pod install` só mudou a ordem das mesmas entradas.
- `android/settings.gradle`: igual ao template (sem `expo-autolinking-settings`, `useExpoModules`, `useExpoVersionCatalog` e o plugin do Expo).
- `android/build.gradle`: sai `apply plugin: "expo-root-project"`, e o arquivo fica igual ao template.
- `android/app/build.gradle`: saem `entryFile`/`cliFile`/`bundleCommand "export:embed"`. Fica o `dotenv.gradle` do react-native-config.
- `MainApplication.kt`: `getDefaultReactHost` do template (sem `ExpoReactHostFactory` e sem `ApplicationLifecycleDispatcher`/`onConfigurationChanged`). `AppCompatDelegate.MODE_NIGHT_YES` continua.
- `MainActivity.kt`: `DefaultReactActivityDelegate` direto (sem `ReactActivityDelegateWrapper`). `RNScreensFragmentFactory` e `RNBootSplash.init(this, R.style.BootTheme)` continuam antes do `super.onCreate`.

### O que foi preservado (e conferido pelo diff contra o template)
Nome do módulo `FiapSchool`, bundle/applicationId `br.com.fiap.school`, bootsplash (iOS no `customize` do SceneDelegate, Android no `onCreate`; `BootSplash.storyboard`, `BootTheme`), Montserrat (pbxproj + `UIAppFonts` + assets Android), modo escuro forçado (`UIUserInterfaceStyle Dark`, `MODE_NIGHT_YES`, `styles.xml`), `UIStatusBarStyleLightContent`, `react-native-config` (`dotenv.gradle`), `RNScreensFragmentFactory`, edge-to-edge (o `gradle.properties` é igual ao template), região `pt-BR` (Info.plist e `developmentRegion`), `useWatchman: false`, `AndroidManifest.xml` sem mudança (INTERNET e `BootTheme`).

### Decisões
- **`@babel/plugin-transform-export-namespace-from`**: o `babel-preset-expo` transformava `export * as`, e o preset do RN não transforma. Sem esse plugin, o bundle de release quebrou em `node_modules/zod/v4/classic/external.js` ("Export namespace should be first transformed by `@babel/plugin-transform-export-namespace-from`"). O Jest não pegou isso porque roda o zod sem transformar. Fixei a versão já resolvida no lock (7.29.7, a mesma do `@babel/preset-env`).
- **iOS mínimo 15.1** (template) em vez de 16.4: o 16.4 era exigência do Expo 58. O `pod install` passou e o build também.
- **React Compiler**: não estava ativo antes (o `babel-preset-expo` só o liga pelo caller do Expo CLI, e usamos o Metro do RN CLI). Então nada muda nisso.

### Testes e verificação (rodados depois da última mudança)
- Não há teste novo: a tarefa é de configuração. A "falha antes" registrada é a do bundle de release (acima), que o plugin corrigiu.
- `yarn lint` → exit 0. `yarn tsc` → sem erros. `yarn format:check` → "All matched files use Prettier code style!". `yarn maestro:check` → "Flows do Maestro ok: 14 arquivos, 90 ids conferidos."
- `yarn test` (com `jest --clearCache` antes) → `Test Suites: 61 passed, 61 total` / `Tests: 430 passed, 430 total`.
- `cd ios && rm -rf Pods build && pod install` → "98 dependencies from the Podfile and 98 total pods installed". `xcodebuild … -destination id=1E7DEFC7-… build` → `** BUILD SUCCEEDED **`.
- Bundle de release Android: `npx react-native bundle --platform android --dev false --minify true --reset-cache --entry-file index.js --bundle-output /tmp/…` → "Done writing bundle output" (3,28 MB).
  - O `grep -ci expo` desse bundle **não dá 0, dá 85**, mas nenhuma linha é do Expo. Quase tudo é `exports`/`exponent`, porque a busca é por substring e ignora maiúsculas. O que sobra são mensagens de erro de duas libs que detectam o Expo Go: `react-native-reanimated` (`JSReanimated`: "npx expo start --web --https") e `react-native-nitro-modules` (`ModuleNotFoundError`: "appOwnership… expo-go", "ExponentConstants").
  - Prova de que não entra código do Expo: `expo-modules-core`, `ExpoModulesCore`, `requireNativeModule`, `globalThis.expo`, `EXDevLauncher`, `expo-asset`, `expo-constants` e `@expo/` dão **0** no bundle.
- Grep do item 1 (json/js/ts/tsx/swift/m/mm/h/kt/java/gradle/rb/pbxproj/plist/xml/Podfile, fora de node_modules/Pods/build/.yarn/coverage) → vazio. `yarn why expo` → vazio.
- **Simulador** (iPhone 16 `1E7DEFC7-…`, Debug): API real do worktree `api` (`yarn build` + `node dist/main`, porta 3333, sem reset). A API e o Metro foram parados no fim. O Metro rodou na **8082**, porque havia um Metro antigo deste worktree na 8081, que eu não tinha subido e não pude parar. O app foi apontado para lá com `defaults write br.com.fiap.school RCT_jsLocation localhost:8082`, e removi a chave no fim. Dirigi o app pelo inspector do Metro (CDP, handlers reais por `testID`), como na Tarefa 9.
  - `evidencias/tarefa-16b-sem-expo.mp4` (35 s): keychain zerado → splash animada (logo no centro sobe para o lugar do Login) → login do Gustavo → Agenda com **Rafael** (7EF - RM 12567) → Boletim 7EF - 2025, 1º trimestre, Língua Portuguesa "Nota 9,5 / Faltas 0" → trocar perfil → **Joana** (2EM - 2025, continua no Boletim) → Agenda → Sair → Login.
  - `evidencias/tarefa-16b-quadros.png`: quadros do vídeo. Fontes Montserrat e tema escuro iguais aos de antes.
- **Android**: não há JDK nesta máquina, então não houve build Android. Cada arquivo Android foi comparado com o template do RN 0.88: `settings.gradle` e `build.gradle` ficaram idênticos, e `app/build.gradle`, `MainApplication.kt`, `MainActivity.kt`, `styles.xml` e `AndroidManifest.xml` diferem só no que é nosso (listado acima). A prova do build é o `mobile.yml` (CI).

### Como o qa sobe e testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && YARN_IGNORE_PATH=1 node dist/main      # 3333
cd mobile && yarn install && (cd ios && pod install)                              # pods mudaram (sem Expo)
yarn start --reset-cache                                                          # o babel mudou: cache do Metro precisa zerar
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
```
Gustavo `969.294.560-04` / `123456` → abre com Rafael. Conferir a splash, a Agenda, o Boletim, a troca para Joana e o Sair. No Android, `yarn android` (com JDK) ou o CI.

### Pendências de deploy / nativo
- **Mudança nativa** nas duas plataformas: é preciso refazer `pod install` e o build nativo. Sem migration e sem env nova.
- O iOS mínimo cai de 16.4 para 15.1.

### Ressalvas
1. O `yarn.lock` ainda tem `@expo/config-plugins` (e 5 pacotes `@expo/*` que vêm com ele), trazido pelo `react-native-bootsplash@7.3.4`, que o declara em `dependencies` para o config plugin e o gerador de assets. Isso não vai para o app (0 no bundle e 0 no Podfile.lock) e só sai se trocarmos o bootsplash. O `yarn why expo` está vazio.
2. O `grep -ci expo` do bundle não é 0, pelos motivos acima (são strings de outras libs, não código do Expo).
3. Android sem build local.


### Rodada 1
- IMPORTANTE (`mobile/README.md:3` dizia "com Expo Modules (SDK 58)"): corrigido em `b6bdc22`. A linha agora diz "React Native CLI 0.88 + TypeScript + Restyle." e entrou uma nota de atualização: depois de puxar a mudança, `cd ios && pod install` e `yarn start --reset-cache` (os pods e o babel mudaram). A nota não usa a palavra Expo, para que o grep continue vazio.
- Conferência: `grep -c -iE "expo([^rn]|$)"` deu 0 em `mobile/README.md` e 0 em `.maestro/README.md`. Também não sobrou nenhuma menção a OTA ou push nos dois arquivos (o que o grep por `ota` acha é "nota").
- `yarn format:check` → "All matched files use Prettier code style!". Sem push, porque não há remote.

## Mensagens

- Ao chief: Tarefa 16b em `feat/mobile` (`730a052`), sem push porque não há remote. Expo removido do `package.json`, do nativo e do babel/metro/jest. 430 testes passam, o build iOS e o fluxo completo no simulador funcionam, e o bundle Android de release não tem código do Expo.
  - Três pontos para decidir ou registrar no ledger: (1) o bootsplash ainda traz `@expo/config-plugins` como dependência transitiva de ferramenta; (2) o iOS mínimo caiu para 15.1; (3) entrou um plugin de babel (`export-namespace-from`) para o zod 4.
  - Há um Metro antigo deste worktree escutando na 8081 (PID 35131) com a config velha do Expo. Pare-o antes do qa, senão ele serve o bundle com o cache antigo.
- Para o README (Tarefa 17): `mobile/README.md` linha 3 diz "com Expo Modules (SDK 58)". Trocar por "React Native CLI 0.88 + TypeScript + Restyle" e tirar qualquer menção a Expo, OTA, push, `expo-*` e `npx expo`. Também vale anotar que, depois de puxar esta mudança, é preciso refazer `pod install` e rodar `yarn start --reset-cache`.

## Revisão final mobile — correções

Worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/mobile`, branch `feat/mobile`, de `b6bdc22` a `537a032`. Sem push: não há remote.

### Item a item
1. **[IMP review] gesture-handler e react-refresh:** corrigido em `565fa1f`.
   - Saem `react-native-gesture-handler`, `react-refresh` e `@types/react-refresh`. O `SafeAreaProvider` passa a ser a raiz do `App.tsx`, e o `setupFiles` sai do `jest.config.js`.
   - Nenhuma lib instalada declara o gesture-handler como peer (navigation native-stack, bottom-tabs, elements, reanimated) e nenhum `lib/module` do `@react-navigation` o importa.
   - `pod install`: 97 pods (eram 98), sem `RNGestureHandler`.
   - No bundle de release, 0 módulos de `react-native-gesture-handler` no source map. Os 2 `onGestureHandler*` que aparecem são o `ViewConfig` do próprio RN.
2. **[IMP segurança] token sobrevive à desinstalação (iOS):** corrigido em `f9758e4`.
   - O `secureStorage` grava a marca `secureStorage.installed` no mmkv (que some com o app) no primeiro `loadToken` e em todo `setToken`.
   - Se a marca falta na abertura, o keychain é apagado antes de ler, e o retorno é `null`. Se o apagar falha, a marca não é gravada e a próxima abertura tenta de novo.
   - Testes, com a falha antes da correção:
     - `session.store`: "bootstrap sem a marca de instalação + token no keychain → signedOut e keychain limpo". Falhou com `Expected: "signedOut" / Received: "signedIn"`.
     - `session.store`: "com a marca + token → signedIn".
     - `secureStorage`: 3 casos, cobrindo apagar, gravar a marca e falha no reset. Falharam com `Received: "jwt-da-instalacao-anterior"`.
   - Na tela, passo 7 do vídeo: app logado → desinstala e reinstala sem sair → abre no Login (`[login-screen=4, agenda-screen=0]`).
3. **[SUG segurança 3] falha ao apagar o token:** corrigido em `f9758e4`.
   - A falha é registrada com `logger.error` (antes era `warn`), e o log leva só o erro, sem o token.
   - O logout grava `secureStorage.pendingClear`. Na próxima abertura, o token é ignorado e apagado (a marca sai só se apagar der certo), e um novo login também limpa a marca.
   - Testes:
     - "registra como erro, sem o token": falhou antes com `Expected: "secureStorage: falha ao apagar o token"`.
     - "a sessão não volta na próxima abertura": falhou antes com `Received: "jwt-1"`.
     - "um novo login vale normalmente".
   - O teste antigo "devolve null se o keychain falhar na leitura" agora passa pela primeira abertura antes do mock, senão o mock vazava para o teste seguinte.
4. **[SUG] código morto:** corrigido em `4ae048e`, depois de conferir com grep que nada usava. Os testes que só cobriam essas props saíram (Card `studentSelected`, ErrorState `retryTestID`), e o EmptyState perdeu a parte da ação.
   - Saíram `cardVariants.studentSelected`, `EmptyState.action`, `ErrorState.retryTestID` e `Screen.edges`. A tela aplica só o inset de cima, e o rodapé cuida do de baixo, como já era na prática.
   - Saiu `session.guardian`: `signIn(token)` em todos os chamadores, e os imports de `loginResponse` sem uso foram removidos.
5. **[SUG] textos:** corrigido em `a874ef3`.
   - O `CpfInput` usa `strings.login.cpfHint`.
   - A splash usa `strings.common.logoLabel` e `strings.splash.loadingAccessibilityLabel`. O `useLoginMutation` usa `strings.login.error.storage`.
   - `studentInfo` e `logoLabel` agora existem só em `strings.common`; as cópias em `header`, `login` e `selectStudent` saíram.
6. **[SUG] `FadeInDown` repetido:** corrigido em `7055d96`.
   - `enterDown(motion, delay = 0)` em `theme/motion.ts`, exportado pelo `theme`, com a mesma duração, easing, `enterOffsetSmall` e `ReduceMotion.System`.
   - Usado nos 8 arquivos: Lessons, ReportCard, SelectStudent, Header, ErrorState, EmptyState (texto), LessonItem e LoginErrorMessage. O LoginErrorMessage ganha `delay(0)`, que não muda nada.
   - O `LoginScreen` (offset 12) e o fade com reduzir movimento do EmptyState ficaram como estavam, porque têm outro comportamento.
   - Teste `theme/__tests__/enterDown.test.ts`, que falhou antes com `TypeError: enterDown is not a function`. Os testes de entrada das telas seguem verdes.
7. **[SUG] `focusManager` × `AppState`:** corrigido em `d4bb83e`.
   - `connectFocusToAppState(AppState)` em `src/app/appFocus.ts`, chamado no carregamento do `App.tsx`.
   - Teste `app/__tests__/appFocus.test.ts`: o foco segue o AppState, e voltar do background refaz a query vencida que tem observer.
   - Vermelho conferido trocando a função por no-op: `Expected: false / Received: true` e `Expected number of calls: 2 / Received: 1`.
8. **[SUG] locales do zod:** corrigido em `537a032`.
   - Um `resolver.resolveRequest` no `metro.config.js` troca `zod/v4/locales/index.(c)js` por `metro/zod-locales.js`, que exporta só o `en`.
   - É seguro porque o `classic/schemas.js` importa `../locales/en.js` direto como padrão, e o app não usa `z.locales`.
   - No source map, os únicos módulos de locale que sobram são `metro/zod-locales.js` e `zod/v4/locales/en.js`. O Jest não passa pelo Metro, então não muda.

Adiados, como pedido: máquina de retry duplicada, ícone, app switcher e actions por SHA. O logo e a ilustração em 1× continuam dependendo do export do Figma.

### Verificação (depois do último commit)
- `yarn lint` → 0. `yarn tsc` → 0. `yarn format:check` → ok. `yarn maestro:check` → 14 arquivos, 90 ids.
- `yarn test --coverage` → 63 suites, **440 testes** passando. All files: 98,34% statements e 92,42% branches.
- `actionlint .github/workflows/mobile.yml .github/workflows/maestro.yml` → 0.
- Bundle Android de release (`--dev false --minify true --reset-cache`):

  | Momento | Bytes |
  |---|---|
  | 730a052 (com gesture-handler) | 3.280.206 |
  | depois do item 1 | 3.066.908 |
  | depois do item 8 | **2.770.300** |

  Total: −510 KB (−15,5%).
- iOS: `pod install` (97 pods) + `xcodebuild … Debug … build` → `** BUILD SUCCEEDED **`.
- **Simulador** (`1E7DEFC7-…`, API real do worktree `api` na 3333, sem reset, Metro na 8082 por causa do Metro antigo na 8081; API e Metro parados no fim, `RCT_jsLocation` removido). O vídeo é `evidencias/revisao-final-mobile.mp4` (72 s), com quadros em `evidencias/revisao-final-mobile-quadros.png`. Passos, todos conferidos pelo inspector:
  1. Instalação limpa → splash → Login.
  2. Senha errada → "Usuário ou senha inválida.\nPode tentar novamente?".
  3. Login → abre com Rafael.
  4. Agenda: dropdown → 16/03 (sem aulas) → 17/03 ("07:15 - 08:00 Matemática I").
  5. Boletim: 1º trimestre, Português "Nota 9,5 / Faltas 0" → ano 6EF - 2024.
  6. Troca para Joana (2EM - 2025) → Agenda.
  7. Desinstala e reinstala sem sair → Login, não Agenda.
  8. Login → Sair → Login.
  9. Reabre depois do Sair → Login.
- Não foi visto na tela: o refetch ao voltar do background, porque o `staleTime` é de 5 min. Está coberto pelo teste do item 7.

### Mudanças nativas / deploy
- iOS e Android perderam um módulo nativo (`react-native-gesture-handler`): é preciso refazer `pod install` e o build nativo. Android sem JDK aqui, então a prova é o `mobile.yml`.
- A config do Metro mudou: rodar `yarn start --reset-cache` uma vez.
- Sem env, migration nem permissão nova.

### Ressalvas
- No item 7 do vídeo, eu não confirmei de forma independente que o simulador guardou o item do keychain depois do uninstall (não há leitura de keychain pelo `simctl`). A garantia do comportamento está nos testes unitários.
- Continua rodando o Metro antigo deste worktree na porta 8081 (PID 35131), que eu não pude parar.

## Mensagens
- Ao chief: revisão final do mobile corrigida em 7 commits (`565fa1f`, `f9758e4`, `d4bb83e`, `4ae048e`, `a874ef3`, `7055d96`, `537a032`). Há mudança nativa: saiu o gesture-handler, então é preciso refazer `pod install` e o build nativo. O bundle de release caiu de 3,28 MB para 2,77 MB. O PID 35131 (Metro antigo na 8081) segue de pé.

## Tarefa 17 — parte 2

- Worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/release`, branch `release/v1`, base `44f6184`. Commits: **77fa800** `chore(mobile): prettier ignora vendor/ das gems do bundle install`, **bb62ac2** `docs: GIFs da demonstração a partir dos vídeos do QA`, **e32fe3b** `docs: README final com caminhos do CocoaPods, Maestro e GIFs`. Push não feito: não há remote `origin`.

### O que mudou

- `README.md`:
  - Início rápido: aviso do Ruby do sistema, com o caminho A (Ruby 3 do Homebrew + bundler) e o B (CocoaPods do Homebrew + Xcode).
  - iOS: os dois caminhos completos. Inclui o `xcodebuild` por UDID, o `simctl install`/`launch`, a diferença do `Podfile.lock`/`Gemfile.lock` no caminho A e o Metro em outra porta (`RCT_jsLocation`).
  - Demonstração: 5 GIFs em duas tabelas lado a lado.
  - Stack: saem `expo` e `gesture-handler`. Entram versões de screens/safe-area e as devDependencies `@babel/plugin-transform-export-namespace-from`, `yaml` e `react-native-asset`.
  - Pré-requisitos: Ruby 3 e Maestro 2.11.0 + Java 17.
  - Testes: `yarn maestro:check` na tabela e uma seção "Flows do Maestro" (instalação com `MAESTRO_VERSION=2.11.0`, limites de login altos, comandos e o aviso "ainda não executados").
  - Workflows: `maestro.yml` real, `mobile.yml` com `maestro:check` e o nome do artefato, aviso de que nenhum workflow rodou ainda e um parágrafo sobre o APK debug (x86_64, precisa de Metro + `adb reverse`, API em `10.0.2.2`, sem APK de release).
  - Modelo: `GuardianStudent.position` e a ordem do `/me`.
  - SDD: tirei "no fechamento" e acrescentei a linha do `05-qa.md`.
  - Limitações: Maestro não executado e sem push/OTA/APK de release. Os avisos de Android e Docker continuam.
  - Próximos passos: primeiro CI real, v2 de UI (`2026-10-28-app-v2/`), APK de release e logo em SVG.
  - Troubleshooting: o yarn 3 com os dois sintomas e como reverter (`git checkout -- yarn.lock && rm -rf .yarn`, com o aviso de não fazer isso em `mobile/`), a falha do Ruby e o `vendor/` no `format:check`.
- `mobile/README.md`: nota do Ruby 3/CocoaPods e do `yarn ios`, e `maestro:check` nos scripts.
- `mobile/.maestro/README.md`: aviso "flows ainda não executados". Também corrigi 2 achados de markdownlint que já existiam (linha longa e bloco sem linguagem).
- `mobile/.prettierignore`: `vendor`.
- `docs/media/{login,agenda,boletim,trocar-aluno,estados}.gif`: novos.

### Início rápido executado (G3)

Clone limpo da `release/v1` em `/tmp/fiap-g3`, simulador iPhone 16 `1E7DEFC7-…`, iOS 18.1. Apaguei tudo no fim.

1. API: `cp .env.example .env`, `YARN_IGNORE_PATH=1 yarn install` (yarn 1.22.22), `yarn prisma:setup` → "Seed concluído: 3 responsáveis e 3 alunos." (banco novo, sem `migrate reset`). `yarn start:dev` → `/api/health` `{"status":"ok"}`.
2. App: `yarn install` (yarn 4.18.1), `cp .env.example .env`.
3. Ruby do sistema (2.6.10): `bundle install` falhou em `json 2.7.6` (o mesmo do QA).
4. **Caminho A**:
   - Com `PATH="/opt/homebrew/opt/ruby/bin:$PATH"` (Ruby 3.4.8): `bundle install` ok, `bundle exec pod install` ok (1 min 17 s).
   - Efeitos colaterais: `Podfile.lock` passou de `COCOAPODS: 1.16.2` para `1.15.2`, e apareceu o `mobile/Gemfile.lock` não versionado.
   - `yarn ios --udid … --port 8090 --no-packager`: "✔ Installing Ruby Gems", "✔ Installing CocoaPods", "Successfully built the app", "Successfully launched the app".
5. **Metro** na **8090** (`yarn start --port 8090`), porque a 8081 é do Metro antigo (PID 35131), que não toquei.
   - O app abriu com a tela vermelha "Unable to resolve module expo/internal/async-require-module from …/worktrees/mobile/…". Ele foi para a 8081, apesar do `--port 8090`: o domínio `br.com.fiap.school` nem existia no `defaults` do simulador.
   - Com `simctl spawn … defaults write br.com.fiap.school RCT_jsLocation localhost:8090` + relaunch → Login. Isso foi para o README como "Metro em outra porta".
   - Login do Gustavo (handlers reais pelo inspector do Metro, como nas tarefas anteriores) → `agenda-screen`, "Olá, GUSTAVO", RAFAEL 7EF, 19 de março, quarta-feira. A API registrou POST login + GET me + GET agenda.
6. **Caminho B**:
   - `git checkout` do lock, `rm -rf Pods Gemfile.lock vendor`, `pod install` do Homebrew (1.16.2, Ruby do sistema). `git status` ficou limpo.
   - `xcodebuild … -destination 'platform=iOS Simulator,name=iPhone 16'` **falhou**: "Unable to find a device matching…", porque ele procura `OS:latest` (há runtime 27.0 sem iPhone 16).
   - Com `-destination 'platform=iOS Simulator,id=<UDID>' -derivedDataPath build/cli` → `** BUILD SUCCEEDED **` (5 min 43 s, build do zero).
   - `simctl uninstall` + `install …/Debug-iphonesimulator/FiapSchool.app` + `launch` → Login → login do Gustavo → Agenda com Rafael.
   - O README usa o UDID por causa disso.
7. Limpeza: Metro da 8090 e API parados, `RCT_jsLocation` apagado (o `defaults read` confirma que não existe), `/tmp/fiap-g3` e os scripts apagados. 8090 e 3333 livres. A 8081 segue com o PID 35131.

Não testado: rbenv/asdf (o README só diz "um Ruby 3 ativo na pasta"), Xcode pela interface (sem Simulator.app nesta sessão; o caminho por linha de comando é o mesmo build), Android, Docker e Maestro.

### GIFs

ffmpeg 8 com palette (`palettegen max_colors=128 stats_mode=diff` + `paletteuse` bayer, `diff_mode=rectangle`), 12 fps e 320 px de largura. Cortei só as pausas longas (detectadas com `mpdecimate`) e mantive as de ~2 s, para dar tempo de ler:

| GIF | Cortes | Duração | Tamanho |
|---|---|---|---|
| `login.gif` | login vazio 3,0–5,0 s; agenda parada 17,5–18,8 s | 17,6 s | 342 KB |
| `agenda.gif` | início parado 0–2 s | 17,5 s | 442 KB |
| `boletim.gif` | início parado 0–2 s | 19,2 s | 198 KB |
| `trocar-aluno.gif` | nenhum | 11,3 s | 432 KB |
| `estados.gif` | 0–1 s e erro parado 16,0–21,5 s | 18,2 s | 369 KB |

Total: **1,7 MB**, todos abaixo de 0,5 MB. Conferi a legibilidade num quadro extraído: o header, o "Nenhum aluno vinculado" e os trimestres são legíveis a 320 px.

### Verificação

- `npx --yes markdownlint-cli2 --config <MD060 off, MD013 sem tabelas/código> README.md mobile/README.md mobile/.maestro/README.md` → `Summary: 0 issues in 0 files`.
- `cd mobile && yarn format:check` → "All matched files use Prettier code style!".
- Prova do `.prettierignore`: com `mobile/vendor/bundle/x.js` mal formatado, o check passa com a linha `vendor` e falha sem ela (`[warn] vendor/bundle/x.js`). Arquivo apagado em seguida.
- `grep -n "previst\|a gravar\|a confirmar\|no fechamento\|ainda não\|expo\|Expo\|push\|gesture" README.md mobile/README.md mobile/.maestro/README.md`: sobram só (a) os avisos honestos ("ainda não" de Opção B, Android, Docker, Maestro e workflows), (b) "sem Expo" e "Sem push e sem atualização OTA" nas limitações, (c) `export`/`push na main` (falsos positivos).
- Dependências conferidas contra `mobile/package.json` e `api/package.json` (TypeScript da API instalado: 5.9.3). Os gatilhos do `maestro.yml`/`mobile.yml` e o nome do artefato foram conferidos nos YAMLs.
- Não há código de produção nem teste novo (só docs, mídia e config de prettier), então não rodei suítes.

### Decisões

- **APK**: o `mobile.yml` builda `-PreactNativeArchitectures=x86_64` e não embute o bundle JS. O APK só roda num emulador x86_64 (não num emulador arm64 de Mac Apple Silicon) e precisa do Metro + `adb reverse tcp:8081 tcp:8081`. O README diz isso, em vez de "instala e roda".
- **Destino do `xcodebuild` por UDID**: pelo nome falhou nesta máquina (ver o passo 6).
- **`yarn ios` não é plano B**: o CLI (`cli-config-apple/tools/pods.js`) roda `bundle install` sempre que o cache de hash do Podfile está vazio, então sem Ruby 3 ele falha mesmo com os pods instalados. O caminho B usa Xcode ou `xcodebuild`.

### Ressalvas

1. O README linka `05-qa.md` e `evidencias/qa/`, que **ainda não estão commitados** (estão como não versionados no checkout principal, na `spec/fiap-school`). Até o chief commitá-los e integrá-los na `release/v1`, esses dois links ficam quebrados. Os GIFs em `docs/media/` não dependem disso.
2. O link para `.claude/team/tarefas/2026-10-28-app-v2/` existe na `release/v1` (`00-pedido.md`).
3. Os avisos de Docker, Android, Maestro e workflows continuam no README, porque nada disso rodou. Tirar quando o primeiro CI passar.

**Status: PRONTO COM RESSALVAS** (ressalva 1). Commits 77fa800, bb62ac2, e32fe3b. Testes: só docs; markdownlint 0 issues, `format:check` ok, Início rápido executado nos dois caminhos até a Agenda.

## Mensagens

- Ao chief: T17 parte 2 em `release/v1` (77fa800..e32fe3b). G3 resolvido no texto e provado num clone limpo nos dois caminhos (Ruby 3 + `yarn ios`; CocoaPods do Homebrew + `xcodebuild` por UDID). Três coisas para você:
  - (a) commitar `05-qa.md` e `evidencias/qa/` e trazer para a `release/v1`, porque o README linka os dois;
  - (b) o APK do `mobile.yml` é x86_64 e precisa de Metro, e o README diz isso; se quiser um APK que "instala e roda", seria embutir o bundle como no `maestro.yml` (fora desta tarefa);
  - (c) o `yarn ios --port N` não muda a porta que o app procura (vai na 8081); o README documenta o `RCT_jsLocation`. O PID 35131 segue de pé.
- Ao qa (re-teste do G3): seguir o Início rápido com o aviso do Ruby, caminho A ou B. Num Mac com a 8081 livre não precisa do `RCT_jsLocation`.
