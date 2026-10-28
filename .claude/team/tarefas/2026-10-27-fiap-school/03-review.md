# Review — fiap-school

## Tarefa 1

Diff: `revisao/tarefa-1.diff` (commit `8d61283`, base `40c8577`, branch `chore/tooling`).

O que conferi fora do diff, e por quê:
- Rodei o grep do plano no worktree e ele não achou nada (exit 1). Ampliei com `expo-router|chrome|buyer|seller`: só aparece "não expo-router" em `developer.md:85`, e ali é uma proibição, o que está certo.
- Frontmatter dos 6 agents passou num parser YAML estrito (Ruby `YAML.safe_load`), e o `name` de cada um bate com o arquivo. Todas as skills dos frontmatters existem em `.claude/skills/`. `builder-check-prompt.md`, `requesting-code-review/code-reviewer.md`, `test-driven-development/writing-good-tests.md` e `docs/teste-tecnico-mobile.md` também existem.
- Comparei as branches para ver se o `main...HEAD` dos agents bate com a base do plano. Não bate: `main` = `9c64fc1`, e `spec/fiap-school` = `40c8577` está 3 commits à frente (23 arquivos, +1822 linhas de spec, Figma e JSON). Detalhe no primeiro achado.
- `CLAUDE.md` e a skill `squad`: nenhuma menção ao SS na skill. O parágrafo velho do `CLAUDE.md` já está no ledger para a Tarefa 2.

Contra o brief e o plano, bateram: comandos de verificação (api `yarn lint && yarn tsc --noEmit && yarn test && yarn test:e2e`, mobile `yarn lint && yarn tsc && yarn test`), credenciais do seed, simulador iPhone 16, bundle id `br.com.fiap.school`, Expo Modules só para `expo-updates`/`expo-notifications` (D12/D34), OTA só a pedido (D34), restrições do ambiente (R-Ambiente), `file:./test.db` (D25) e o fim sem remote (ledger).

As regras invioláveis continuam lá: teto de 3 rodadas (PROTOCOLO, chief §4.7), nunca mergear e nunca dar push na `main` (chief §5 e regras, developer, PROTOCOLO), TDD em `api/` e `mobile/`, formato de achados do code-reviewer e do cyber-security sem mudança, e as seções `## Mensagens` e `### Rodada R`.

### [IMPORTANTE] O diff da revisão final e a base do PR usam `main`, mas as trilhas saem de `spec/fiap-school`
- Arquivo: `.claude/agents/chief.md:197`, `:220`, `:239`; `.claude/agents/code-reviewer.md:44`, `:67`; `.claude/agents/cyber-security.md:26`
- Problema: o developer tratou a base certa na criação do worktree (`PROTOCOLO.md:112`, "a base que o `00-plano.md` indicar"). Já o diff da revisão final, o `diff --stat` antes do PR e o `gh pr create --base main` ficaram presos em `main`. O plano diz que as três trilhas saem de `spec/fiap-school`, e esse ponto não está em `main`.
- Cenário: no fim da trilha `api`, o chief gera `revisao/branch-api.diff` com `main...HEAD`. O diff traz junto os 3 commits de spec (`docs/figma/**`, `docs/data/responsaveis.json`, brief, plano: +1822 linhas). Code-reviewer e cyber-security revisam documentação e JSON como se fossem entrega da trilha. O mesmo vale para `mobile` e `tooling`, e os três PRs para `main` repetem os mesmos 3 commits.
- Correção sugerida: nos três agents, trocar `main...HEAD` por `<base do plano>...HEAD` (a base registrada no ledger, aqui `spec/fiap-school`, ou `main` quando for ela). No `PROTOCOLO.md` (Git e PRs), dizer o que fazer quando a base do plano não é `main`: a `spec/*` entra primeiro, ou o PR da trilha aponta para ela.

### [IMPORTANTE] Caminho absoluto da máquina do usuário em arquivos que vão para o repositório público
- Arquivo: `.claude/agents/developer.md:46`; `.claude/team/PROTOCOLO.md:20`
- Problema: `git -C /Users/fael_st/workspace/fiap worktree add ...` e "aberto na raiz do repositório (`/Users/fael_st/workspace/fiap`)". O `CLAUDE.md` diz que "os caminhos dos agents são relativos" à raiz. O R11 manda versionar esses arquivos para o avaliador.
- Cenário: o avaliador, ou o usuário em outra máquina, clona o repositório e roda `/squad`. O developer copia o comando de `developer.md:46` e o `git -C` falha com "cannot change to '/Users/fael_st/workspace/fiap'". De quebra, o nome de usuário local fica público.
- Correção sugerida: usar caminho relativo à raiz (`git worktree add .claude/worktrees/<trilha> ...`, rodado da raiz, ou `git -C "$(git rev-parse --show-toplevel)"`). No PROTOCOLO, escrever só "aberto na raiz do repositório".

### [SUGESTÃO] O `chief.md` aponta para a pasta desta tarefa como fonte fixa de contexto
- Arquivo: `.claude/agents/chief.md:24-28`
- Problema: "o brief, o plano e o ledger da tarefa em andamento (`.claude/team/tarefas/2026-10-27-fiap-school/`) ... decisões (D1–D36)". Isso é um agent reutilizável apontando para uma tarefa específica, com a contagem de decisões fixa no texto.
- Cenário: um `/squad` novo (por exemplo, uma correção depois da entrega) cria a pasta `2026-11-xx-<slug>`. O chief ainda lê a pasta de 2026-10-27 como "tarefa em andamento", e "D1–D36" fica desatualizado assim que surgir a D37.
- Correção sugerida: "o `CLAUDE.md` aponta a spec do projeto; leia também o brief/plano/ledger da tarefa em andamento, se houver". O caminho concreto fica só no `CLAUDE.md`.

### [SUGESTÃO] `/demo/grades` aparece como "rota com `:id` de aluno", mas o aluno vem no corpo
- Arquivo: `.claude/agents/cyber-security.md:45-47`
- Problema: pelo brief (seção 4), `POST /demo/grades` recebe `{studentId, ...}` no **corpo**. O texto põe essa rota na lista de rotas com `:id` na URL.
- Cenário: o guard de ownership (D21) lê `params`. No `/demo/grades`, o `params.id` vem `undefined`. O cyber-security segue o checklist ("rota com `:id` passa pelo guard"), vê o decorator aplicado e marca como seguro. Ele não confere se o guard lê o `studentId` do corpo, e aí a Adelaide lança nota no aluno do Gustavo.
- Correção sugerida: separar o caso: "`/demo/grades`: o `studentId` vem do corpo; confira que o ownership valida esse campo, e não só `params`".

### [SUGESTÃO] Lista "Leia antes" desigual entre os agents
- Arquivo: `.claude/agents/designer.md:14`, `.claude/agents/cyber-security.md:17`, `.claude/agents/qa.md:13`
- Problema: chief, developer e code-reviewer leem o `CLAUDE.md` primeiro, e o `PROTOCOLO.md:5-6` diz que ele vale acima do protocolo. Designer, cyber-security e qa não o leem.
- Cenário: uma regra permanente registrada só no `CLAUDE.md` (chief §2, "decisão que vale além desta tarefa vai também para o `CLAUDE.md`") nunca chega a esses três agents.
- Correção sugerida: pôr o `CLAUDE.md` (raiz) no início do "Leia antes" dos três.

### Deixei de julgar
- O parágrafo velho do `CLAUDE.md` ("ainda citam Safety Swap"): fora dos arquivos da Tarefa 1, e o ledger já o passou para a Tarefa 2.
- `.claude/skills/expo-native-ui`, `expo-router`, `vercel-react-best-practices` e `supabase-postgres-best-practices` continuam instaladas sem nenhum agent que as use: a Tarefa 1 só cobre agents e PROTOCOLO, e o brief (D3) fala em "22 skills" copiadas. Remover é decisão do chief.
- O brief, D3, ainda diz "sem Heroku/EAS/OTA", e a D34 trouxe OTA. Os agents seguem a D34, que é a mais recente. A incoerência está no brief, não no diff.
- O D21 diz que o guard usa `:studentId`, e o contrato do plano usa `/students/:id`. A divergência é entre brief e plano, não da Tarefa 1.
- A linha do fluxo no `PROTOCOLO.md:72` ("push, PR") não menciona o caso sem remote. A seção Git e PRs e o chief §5 cobrem esse caso, então não há conflito real.

### Veredito
- **Spec ✅**: o grep do plano não acha nada; o qa testa a API com curl/supertest e o app no iOS simulator/Maestro, sem Chrome; fluxo, papéis e formato de achados foram mantidos; só os arquivos previstos foram tocados.
- **Qualidade: APROVADO** (0 bloqueantes, 2 importantes, 3 sugestões).

### Rodada 1

Diff da correção: `8d61283..ff99716` (1 commit). Conferências: o grep do plano continua sem achar nada (exit 1); não sobrou `fael_st`, `main...HEAD` nem `diff main` em agents e PROTOCOLO; o frontmatter dos 6 agents passa no YAML estrito (a `description` do code-reviewer mudou).

- **[IMPORTANTE] Diff final e base do PR com `main` fixo: RESOLVIDO.** O diff da revisão final agora usa `BASE..HEAD` com a BASE do ledger em `chief.md:197-198` e `:221-222`, `code-reviewer.md:44-45` e `:68-69` e `cyber-security.md:26-27`. A regra está no `PROTOCOLO.md:114-119`: a BASE vem do ledger e o PR da branch de spec entra primeiro. O `chief.md:240-243` segue a mesma regra.
- **[IMPORTANTE] Caminho absoluto público: RESOLVIDO.** O `developer.md:46-47` agora usa `git worktree add` relativo, com o comentário "na raiz do repositório", e o `PROTOCOLO.md:20` não traz mais o caminho.
- **[SUGESTÃO] `/demo/grades` como rota com `:id`: RESOLVIDO.** O caso tem um item próprio em `cyber-security.md:50-53` (corpo, `params.id` `undefined`, use case confere o vínculo, teste Adelaide → aluno do Gustavo). Isso bate com a decisão que o plano registrou (`00-plano.md:42`).
- **[SUGESTÃO] "Leia antes" sem `CLAUDE.md`: RESOLVIDO.** Designer, cyber-security e qa agora citam o `CLAUDE.md`.
- **[SUGESTÃO] Pasta da tarefa fixa no `chief.md`:** adiada pelo chief, e não reavaliei.

Quebra nova no diff da correção: nenhuma.

#### SUGESTÃO (fora do escopo, não reabre a rodada)
### [SUGESTÃO] Squash ou rebase do PR da spec faz os PRs das trilhas repetirem os commits da spec
- Arquivo: `.claude/team/PROTOCOLO.md:116-119`; `.claude/agents/chief.md:240-243`
- Problema: a regra "spec primeiro, trilhas depois" só evita a repetição se o PR da spec entrar por merge commit.
- Cenário: o usuário mergeia o PR `spec/fiap-school` com "Squash and merge" (ou com "Rebase and merge"). A `main` recebe um commit com outro SHA. `feat/api` ainda tem `3243dc1`, `cd1965f` e `40c8577` na história, então o PR `feat/api → main` mostra de novo os 3 commits da spec e pode dar conflito nos mesmos arquivos.
- Correção sugerida: uma linha dizendo que o PR da spec entra por merge commit, ou que, depois do merge, as trilhas são rebaseadas na `main` (`git rebase --onto main <BASE> <branch>`) antes de abrir os PRs.

### Veredito da Rodada 1
- **Spec ✅**
- **Qualidade: APROVADO** (0 bloqueantes; 4 achados resolvidos, 1 adiado pelo chief, 1 sugestão nova fora do escopo).

## Tarefa 2

Verifiquei por execução: `commitlint` direto (ok), `yarn` do PATH dentro do worktree (cai no yarn 3 de `~/workspace`), lint-staged contra a `api/` real do worktree `api` num git temporário fora de `~/workspace`.

### Achados

### [BLOQUEANTE] Os hooks chamam `yarn`, que nesta máquina é o yarn 3 do projeto-pai: todo commit local é recusado
- Arquivo: `.husky/commit-msg:1` (`yarn commitlint --edit "$1"`); também `.lintstagedrc.js:19-20` (`yarn --cwd ${dir} eslint|prettier`)
- Problema: o hook depende do `yarn` do PATH. A `packageManager: yarn@1.22.22` do `package.json` não ajuda, porque o yarn 3 do PATH obedece o `.yarnrc.yml`/`yarnPath` de `/Users/fael_st/workspace`.
- Cenário: no worktree `tooling`, `echo "feat(api): x" | yarn commitlint` sai com `Internal Error: fiap-school@workspace:. doesn't seem to be present in your lockfile` (exit 1). Como o hook propaga o código, `git commit` com mensagem válida falha com "husky - commit-msg script failed". O mesmo erro acontece com `yarn --cwd api eslint --version` (testado no worktree `api`): o pre-commit também quebraria assim que `api/` existir. O developer só passou porque usou shim com `YARN_IGNORE_PATH=1` e `SKIP_YARN_COREPACK_CHECK=1`. O contorno do README (`YARN_IGNORE_PATH=1 yarn ...`) é por comando e não alcança os hooks do `git commit`, a menos que o usuário faça `export` no shell. Na máquina do usuário e na de quem avalia com um yarn 3 acima do repo, o fluxo de commits trava ou vira `--no-verify`.
- Correção sugerida: hooks sem `yarn`. O husky já põe `node_modules/.bin` no PATH, então `.husky/commit-msg` pode ser `commitlint --edit "$1"` (testei o binário direto: `bad` sai 1, `feat(api): x` sai 0). No `.lintstagedrc.js`, chamar o binário da pasta sem passar pelo yarn, com cwd da pasta, por exemplo `npm --prefix api exec -- eslint --fix ...` (testado: resolve o eslint 9.39.5 da `api/`) ou configs aninhadas do lint-staged (`api/.lintstagedrc`, `mobile/.lintstagedrc`), que rodam as tarefas com cwd da pasta. Atualizar a linha do `CLAUDE.md` e o Troubleshooting se mudar.

### [IMPORTANTE] O caminho do lint-staged com `api/` e `mobile/` reais nunca rodou na branch e o plano pede `yarn lint`/`yarn format`
- Arquivo: `.lintstagedrc.js:11-23`
- Problema: o plano (Conferência) diz que o lint-staged consome os scripts `yarn lint`/`yarn format` de cada pasta; o código chama `eslint`/`prettier` direto. O desvio é razoável (`lint` e `format` da `api/` miram a árvore toda, e o `mobile/` não tem script `format`: só `lint: eslint .`), mas o plano e o `02-dev.md` não registram a mudança de contrato.
- Cenário: com a `api/` real e yarn 1 (simulado fora de `~/workspace`), o eslint roda e reporta erro de `no-unused-vars` em `main.ts` (comportamento correto, exit 1). Porém o eslint emite um `warning File ignored because of a matching ignore pattern` por arquivo ignorado staged, o que polui o commit, e o `prettier --write` só roda se o eslint passar. Na `api`, o `eslint-plugin-prettier` já formata, então o segundo passo é redundante. Mobile (eslint 8 + prettier 2.8.8, configs `.eslintrc.js`/`.prettierrc.js`) não foi executado.
- Correção sugerida: registrar o desvio no ledger/plano. Opcional: `--no-warn-ignored` no eslint da `api` e validar o caminho do mobile quando as trilhas mergearem (o dev já deixou isso anotado).

### [IMPORTANTE] Em clone limpo, o lint-staged pula o lint em silêncio se só a raiz foi instalada
- Arquivo: `.lintstagedrc.js:15-18`
- Problema: sem `api/node_modules`, só `console.warn` e `return []` (exit 0). O commit passa sem eslint/prettier.
- Cenário: clone novo, `yarn install` só na raiz (é o que o `CLAUDE.md` manda: "Rode `yarn install` na raiz para ativá-los"), commit em `api/src/x.ts` malformatado: passa sem checagem, e o erro só aparece no CI. Em `.husky/pre-commit`, `npx lint-staged` sem `--no-install` baixaria o pacote se a raiz não tivesse sido instalada.
- Correção sugerida: mencionar no `CLAUDE.md`/README que `yarn install` em `api/` e `mobile/` também é necessário para o pre-commit valer; manter o skip, que serve às pastas ainda inexistentes.

### [IMPORTANTE] Troubleshooting do README promete um contorno que não cobre os hooks
- Arquivo: `README.md` (seção Troubleshooting, últimas linhas)
- Problema: orienta `YARN_IGNORE_PATH=1 yarn install` "e o mesmo prefixo nos demais comandos". O `git commit` dispara os hooks sem esse prefixo; também diz que o yarn "captura" o repo, mas o erro real é um `Internal Error ... not present in your lockfile`, não uma mensagem de `packageManager`. (Confirmei que `YARN_IGNORE_PATH=1 yarn --version` dá 1.22.22 nesta máquina, sem precisar de `SKIP_YARN_COREPACK_CHECK`, que o developer citou.)
- Correção sugerida: depois de corrigir o bloqueante, deixar a nota só como diagnóstico, sem prometer o contorno por prefixo, ou orientar `export YARN_IGNORE_PATH=1`.

### [SUGESTÃO] Workflow sem `permissions` e com `npx commitlint`
- Arquivo: `.github/workflows/commitlint.yml:1-19`
- Problema: sem bloco `permissions: contents: read` (privilégio mínimo); o `yarn install --frozen-lockfile` executa `prepare: husky` no runner (inofensivo). O `npx commitlint` serve, mas `yarn commitlint` seria coerente com o script. Merges automáticos ("Merge branch ...") são ignorados pelo default do commitlint, então o intervalo `base..head` não gera falso positivo. D32 pede filtro de path para cada workflow; aqui o workflow roda em todo PR, o que é correto para commitlint (vale checar se o brief quis exceção). `yarn.lock` está presente, então `cache: yarn` funciona.
- Correção sugerida: acrescentar `permissions: contents: read`.

### [SUGESTÃO] Edição do `CLAUDE.md` removendo o parágrafo do Safety Swap é escopo da Tarefa 1
- Arquivo: `CLAUDE.md:25-28` (diff)
- Problema: o plano da Tarefa 2 não lista `CLAUDE.md`, e o parágrafo removido era o aviso da Tarefa 1. Se a Tarefa 1 já adaptou os agents na mesma branch, a remoção é coerente; se não, apaga o aviso sem a adaptação. Só confirmar no ledger.

### Deixei de julgar
- Versões `@commitlint/* ^21.2.4` e `lint-staged ^17.6.0`: instalam e rodam aqui (commitlint e lint-staged executaram); não avaliei a escolha de versão.
- `yarn.lock` (excluído do diff): confiei no relato de que `--frozen-lockfile` passa; não rodei o install de novo.
- Mobile real no lint-staged: não executei eslint 8/prettier 2 do `mobile/` (fora de cheque rápido, depende da Tarefa 7 e do `format`).
- `.nvmrc` 24 e `.editorconfig`: sem regra no brief que os contradiga; não julguei.
- Credenciais do README: conteúdo vem do enunciado, não do tooling.

### Veredito da Tarefa 2
- **Spec ❌**: o comportamento "commit fora do padrão é recusado" funciona, mas o commit válido também é recusado na máquina do usuário (yarn 3 no PATH), e o lint-staged consome eslint/prettier em vez dos scripts `lint`/`format` do plano sem registrar a mudança.
- **Qualidade: REPROVADO (1 bloqueante)**; 3 importantes, 2 sugestões.

## Mensagens
→ chief: BLOQUEANTE é a dependência de `yarn` nos hooks (`.husky/commit-msg`, `.lintstagedrc.js`); trocar por `commitlint --edit "$1"` e por `npm --prefix <pasta> exec -- eslint/prettier` (ou configs aninhadas) resolve sem depender de remover o yarn 3 de `~/workspace`. Rodar re-review restrito depois.
→ chief (usuário): registrar a mudança de contrato do lint-staged (eslint/prettier direto, não `yarn lint`/`format`) no plano/ledger.

## Tarefa 3

Diff: `revisao/tarefa-3.diff` (commit `e1cf9b7`, base `40c8577`, branch `feat/api`, sem o `yarn.lock`).

O que rodei e conferi fora do diff, e por quê:
- `YARN_IGNORE_PATH=1` em `api/`: `yarn lint` (0 erros), `yarn tsc` (ok), `yarn test` (2 suítes, 33 testes), `yarn test:e2e` (2 suítes, 8 testes). Bate com o `02-dev.md`.
- Seed num banco novo (`DATABASE_URL=file:./review.db yarn prisma:setup`), depois `yarn prisma:seed` de novo no mesmo arquivo. As duas vezes deram Guardian 3, Student 3, GuardianStudent 3, AgendaDay 21, Lesson 90, ReportCard 4 e TermResult 143, sem `AgendaDay` órfão. Isso mostra que o cascade do `deleteMany` funciona com o adapter better-sqlite3 (FK ligada). Apaguei o `review.db` depois e o worktree ficou limpo.
- Fidelidade ao JSON: um script comparou cada dia da agenda (início, fim e disciplina, na ordem de `order`) e cada trimestre do boletim (nome, nota e falta, na ordem de `order`) dos 3 alunos contra `docs/data/responsaveis.json`, com **0 diferenças**. Também conferi: a cópia `prisma/seed-data/responsaveis.json` é idêntica byte a byte (`cmp`); o ano está como inteiro; o CPF está só com dígitos; os 3 hashes são `$2b$10$` com 60 caracteres; Rafael/Joana têm 12 disciplinas em cada trimestre e Bianca tem 11 no T1, como no JSON; sábado e domingo existem com 0 aulas; o CPF `31415926590` tem dígitos verificadores válidos (cálculo meu, independente do spec).
- Risco "install de um clone novo": rodei `prisma generate` numa cópia do `prisma.config.ts` + `prisma/` (no scratchpad, sem `.env`). Resultado no primeiro achado.
- Schema para as Tarefas 4–5: `cpf` único (login), PK composta `GuardianStudent(guardianId, studentId)` (ownership por `findUnique`), `@@index([studentId])`, `ReportCard @@unique([studentId, year])` (lista desc e busca por ano) e `AgendaDay @@unique([studentId, date])`, tudo com cascade nas filhas. Está pronto.

### [BLOQUEANTE] `yarn install` num clone novo falha: o `postinstall` roda `prisma generate`, que exige `DATABASE_URL`
- Arquivo: `api/prisma.config.ts:11` (`url: env('DATABASE_URL')`), `api/package.json:29` (`"postinstall": "prisma generate"`)
- Problema: o `env()` de `prisma/config` lança erro quando a variável não existe, e o `prisma.config.ts` é avaliado também no `prisma generate`, que não precisa de banco. Antes do `cp .env.example .env`, não existe `.env`.
- Cenário: clone novo → `cd api && yarn install`. O postinstall roda `prisma generate`, que sai com `Failed to load config file ... PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL.` e **exit 1** (reproduzi numa cópia sem `.env`; com `DATABASE_URL` definida dá exit 0), e o yarn 1 aborta o install. É exatamente a ordem do roteiro "Como o qa sobe e testa" do `02-dev.md` (`yarn install` antes de `cp .env.example .env`), e vai ser a ordem do avaliador seguindo o README e do CI da Tarefa 6 (`yarn install --frozen-lockfile` sem `.env`). Isso quebra o A6 ("passam do zero"). No worktree passou só porque já havia um `api/.env`.
- Correção sugerida: no `prisma.config.ts`, trocar por `url: process.env.DATABASE_URL ?? 'file:./dev.db'` (ou outro valor padrão; o Prisma documenta `process.env` justamente para os comandos que não conectam). Depois disso, `migrate`/`seed` continuam lendo a env real. Teste: rodar `env -u DATABASE_URL yarn prisma generate` sem `.env` e ver exit 0. Na mesma correção, vale pôr o `cp .env.example .env` antes do `yarn install` no roteiro.

### [SUGESTÃO] Sem unicidade por disciplina em `TermResult`, que a Tarefa 16 vai buscar por nome
- Arquivo: `api/prisma/schema.prisma:103` (`@@unique([reportCardId, term, order])`)
- Problema: o contrato do `/demo/grades` é `{studentId, subject, term, grade}`, então a Tarefa 16 vai localizar a linha por `(reportCardId, term, subject)`. Nada no banco garante que essa tupla é única.
- Cenário: um JSON (ou um seed futuro) com a mesma disciplina repetida num trimestre → `updateMany`/`findFirst` na Tarefa 16 atualiza duas linhas ou uma arbitrária, e o boletim mostra a nota duplicada. Hoje não há esse dado: conferi que o JSON não repete disciplina.
- Correção sugerida: acrescentar `@@unique([reportCardId, term, subject])` agora, na migration `init` que ainda não saiu da branch. Assim a Tarefa 16 usa `update` com `where` composto.

### [SUGESTÃO] O RED do `env.validation.spec.ts` foi registrado depois da implementação
- Arquivo: `api/src/config/env.validation.spec.ts` (relato no `02-dev.md`, "TDD: falhas e sucessos")
- Problema: o próprio developer diz que rodou o spec pela primeira vez com a implementação já pronta e depois tirou o arquivo para obter um `Cannot find module`. Essa falha não prova que algum dos 10 casos testa o comportamento certo (o teste de "recusa porta 0/70000/abc" nunca foi visto falhando por causa da regra). Como a falha está registrada e não é correção de bug, não chega a IMPORTANTE pela regra.
- Cenário: se o `@Min(1)`/`@Max(65535)` sumisse, o spec pegaria (o `toThrow('PORT')` depende da mensagem montada em `validateEnv`). Conferi isso lendo o código, não pelo RED.
- Correção sugerida: nada a refazer nesta tarefa. Nas próximas, rodar o spec antes de escrever a classe.

### ⚠️ Não dá para verificar pelo diff
- `yarn prisma:reset` (`migrate reset --force && db seed`) não foi executado por ninguém: o Prisma 7 bloqueia o reset sem consentimento do usuário, e eu não rodei por instrução do chief. O caminho equivalente (migrations do zero + seed) passou no `prisma:setup` e no global setup do e2e. O A6 cita o `migrate reset` literalmente, então quem fecha isso é o usuário.
- ValidationPipe (`whitelist`/`forbidNonWhitelisted`/`transform`): a configuração em `src/app.setup.ts:15-21` está certa, mas nenhum teste a exercita porque ainda não existe rota com DTO. Fica para o e2e de login da Tarefa 4 (por exemplo, um campo extra no corpo → 400).
- A4 pede as aulas "ordenadas por `startTime`". O seed guarda a ordem do JSON (o spec usa de propósito uma fixture fora de ordem, `10:00` antes de `07:15`), e no JSON oficial as aulas de todos os dias já estão em ordem de horário (conferi). A Tarefa 5 precisa escolher `orderBy: startTime` ou `order`. Hoje os dois dão o mesmo resultado.
- `/api/health` público: quando a Tarefa 4 ligar o `JwtAuthGuard` global, o `HealthController` precisa de `@Public()`. Hoje o e2e de health pega a regressão, porque espera 200 sem token.

### Deixei de julgar
- Força do `JWT_SECRET` (aceita qualquer string não vazia, inclusive o `troque-este-segredo-local` do `.env.example`): é uso da Tarefa 4 e assunto do cyber-security.
- Formato do `JWT_EXPIRES_IN` (não é validado como `7d`/segundos): só é consumido na Tarefa 4.
- `DATABASE_URL` relativa (`file:./dev.db`, `file:./test.db`) resolvida pelo cwd do processo: funciona com os scripts em `api/`. Rodar `node api/dist/main` da raiz abriria outro arquivo. O Docker da Tarefa 6 define o WORKDIR.
- `mapSeed` deduplica aluno por RM e fica com o primeiro, sem comparar os dados do segundo responsável: o JSON não tem aluno compartilhado, e esse caso está fora do brief.
- `Device` fora do schema: a Tarefa 16 dá a própria migration, como o dev registrou.
- `grade Float` (REAL) no lugar de "decimal" do brief: as notas do JSON (inteiros e .5) são exatas em ponto flutuante; não é dinheiro.
- Versões de dependência (Nest 11.2.8, Prisma 7.10.1, TS 5.9, Jest 30 com ts-jest 29) e o `yarn.lock`: não avaliei a escolha. Install, testes e build rodam.

### Veredito da Tarefa 3
- **Spec ❌**: scaffold, schema, seed, prefixo, pipe, CORS, env validada e testes estão como o plano pede, e o seed é fiel ao JSON. Mas o critério "do zero" do A6 falha no primeiro passo (o `yarn install` sem `.env` aborta no postinstall).
- **Qualidade: REPROVADO (1 bloqueante)**; 0 importantes, 2 sugestões.

## Mensagens
→ chief: único BLOQUEANTE é o `env('DATABASE_URL')` em `api/prisma.config.ts:11`, que derruba o `postinstall` num clone sem `.env` (reproduzido, exit 1). A correção é de uma linha (`process.env.DATABASE_URL ?? 'file:./dev.db'`) e o re-review é restrito a isso. Vale também acrescentar `@@unique([reportCardId, term, subject])` agora, enquanto a migration `init` ainda é só da branch.
→ developer: no roteiro do qa, colocar `cp .env.example .env` antes do `yarn install`.
→ chief (usuário): o `yarn prisma:reset` do A6 só roda com o seu consentimento explícito ao Prisma (`PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`). O equivalente sem destruir nada passou.

### Rodada 1 (Tarefa 2, re-review restrito de `b3c9dc0..414cb6b`)

Verificado com o yarn 3 do PATH ativo (`yarn --version` = 3.6.4, sem `YARN_IGNORE_PATH`).

- BLOQUEANTE (hooks dependem do `yarn`): **resolvido.** `.husky/commit-msg:1` agora é `commitlint --edit "$1"`; rodei `sh -e .husky/commit-msg` com PATH do husky dentro do worktree: `feat(api): x` sai 0, `bad` falha com `subject-empty`/`type-empty`. `.lintstagedrc.js:25-27` não usa mais yarn.
- IMPORTANTE (lint-staged real / contrato `yarn lint`): **resolvido no código, contrato ainda sem registro.** Lint-staged exercitado em git temporário: mobile real (eslint 8 + prettier 2.8.8, incluindo arquivo com espaço no nome) formata e sai 0; api real: erro de eslint barra com exit 1 e arquivo formatado passa com exit 0, sem os warnings de arquivo ignorado (`--no-warn-ignored`). O desvio do plano (eslint/prettier direto, não `yarn lint`/`format`) continua só no código e no `CLAUDE.md`; falta uma linha no ledger (chief).
- IMPORTANTE (skip silencioso sem `node_modules`): **resolvido.** Aviso destacado `!! lint-staged: ... LINT PULADO` (`.lintstagedrc.js:17-21`), `npx --no-install` no pre-commit, e `CLAUDE.md`/README mandam instalar em `api/` e `mobile/`. O skip ainda não falha o commit, mas agora é explícito.
- IMPORTANTE (README Troubleshooting): **resolvido.** Mensagem de erro real citada, afirma que os hooks não usam yarn e orienta `export YARN_IGNORE_PATH=1`.
- SUGESTÃO `permissions`: **resolvido** (`commitlint.yml:6-7`).
- SUGESTÃO `CLAUDE.md`/escopo da Tarefa 1: sem mudança, segue para o chief confirmar no ledger.

Quebra nova no diff da correção: nenhuma. Observação (SUGESTÃO, não reabre): o `api/` roda só `eslint`, e `prettier` só vale porque a config da api tem `eslint-plugin-prettier`; se a Tarefa 3 trocar isso, ajustar o rc.

### Veredito da Rodada 1
- **Spec ✅** (o ponto do contrato só precisa de registro no ledger).
- **Qualidade: APROVADO** (0 bloqueantes).

### Rodada 1

Diff da correção: `e1cf9b7..c8df872` (`fix(api): generate sem .env e disciplina única por trimestre`), com 4 arquivos.

Verificação que eu mesmo rodei (`YARN_IGNORE_PATH=1`):
- Fiz uma cópia de `prisma/`, `prisma.config.ts`, `package.json` e `tsconfig.json` no scratchpad, sem `.env` e com `env -u DATABASE_URL`. Nela, `prisma generate` saiu com **exit 0** e o script `postinstall` também saiu com **exit 0**.
- `prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code` devolveu "No difference detected." (exit 0). A migration editada bate com o schema.
- `yarn lint` ok, `yarn tsc` ok, `yarn test` com 33 testes passando, `yarn test:e2e` com 9 testes passando (um novo). O worktree ficou limpo.

Achados anteriores:
- **[BLOQUEANTE] `env('DATABASE_URL')` derruba o postinstall: RESOLVIDO.** Em `api/prisma.config.ts:13` agora está `url: process.env.DATABASE_URL ?? 'file:./dev.db'`, e o `generate` sem env sai 0. Quando a env existe, `migrate` e `seed` continuam usando ela (o global setup do e2e passa `file:./test.db` e a suíte usou o banco certo).
- **[SUGESTÃO] `@@unique([reportCardId, term, subject])`: RESOLVIDO.** Entrou em `api/prisma/schema.prisma:104` e no `migration.sql:98` da `init`. O teste novo em `api/test/seed.e2e-spec.ts:79-96` falharia sem o índice: o `create` com `order: 99` passaria, porque não colide com o unique de `order`.
- **[SUGESTÃO] RED tardio do `env.validation.spec.ts`:** ficou só registrado, como combinado, e não pede ação.

Quebra nova no diff da correção: nenhuma.

### [SUGESTÃO] O `dev.db` local criado antes da correção ficou sem o índice novo
- Arquivo: `api/prisma/migrations/20261027224531_init/migration.sql:98`
- Problema: a correção editou a migration `init`, que já tinha sido aplicada. O `prisma migrate deploy` não reaplica uma migration que já está registrada como aplicada.
- Cenário: o `api/dev.db` do worktree (de 19:51) só tem `TermResult_reportCardId_term_order_key`; conferi no sqlite3. Quem rodar `yarn prisma:setup` em cima dele continua sem o unique por disciplina. Já o `migrate dev` acusaria checksum alterado e pediria reset. Num clone novo e no `test.db` (recriado a cada execução) não há problema.
- Correção sugerida: nada no código. Recriar o banco local com `DATABASE_URL=file:./dev.db` apagando o arquivo antes, ou com `prisma:reset` se o usuário consentir. Vale avisar o qa.

### Veredito da Tarefa 3, Rodada 1
- **Spec ✅**
- **Qualidade: APROVADO**; 0 bloqueantes, 1 sugestão nova (banco local defasado, sem impacto no repositório).

## Mensagens
→ chief: Tarefa 3 aprovada na rodada 1. Os dois achados estão resolvidos e foram verificados sem `.env` (generate e postinstall com exit 0, migrations e schema sem diferença, 33 unit e 9 e2e verdes).
→ qa: o `api/dev.db` do worktree é anterior à correção e não tem o unique `TermResult(reportCardId, term, subject)`. Recrie o banco (apague o `dev.db` e rode `yarn prisma:setup`) antes de testar.

## Tarefa 4

Diff: `revisao/tarefa-4.diff` (commit `a5d38ab`, base `c8df872`, branch `feat/api`).

O que rodei e conferi fora do diff, e por quê:
- `YARN_IGNORE_PATH=1` em `api/`: `yarn lint` ok, `yarn tsc` ok, `yarn test` com 6 suítes e 92 testes, `yarn test:e2e` com 4 suítes e 32 testes. Bate com o `02-dev.md`. O worktree ficou limpo.
- Risco "validade do token configurável": o `env.validation` passou a aceitar `JWT_EXPIRES_IN` só com dígitos, e o `.env.example` diz que isso é "segundos". Assinei tokens com o `JwtService` do próprio `node_modules`: `"3600"` deu `exp - iat = 3 s`, `"7d"` deu 604800 s e `"900s"` deu 900 s. O README do `jsonwebtoken` confirma: string sem unidade é lida em milissegundos. Detalhe no primeiro achado.
- Rota de teste `test/setup/protected-probe.controller.ts` (pedido do developer): ela fica em `test/`, e o `tsconfig.build.json` compila só `src/`, então não vai para o `dist`. Só entra pelo `createTestApp({controllers})`. O `APP_GUARD` do `AuthModule` é global e vale também para os controllers do módulo raiz de teste. Isso está provado pelos 401 do `/ping`, que não usa o `@CurrentGuardian()`. Está certo e serve ao que promete: separar o 401 do guard do 401 do decorator.
- Import dinâmico em `test/auth-throttle.e2e-spec.ts` (pedido do developer): cada arquivo de teste tem o próprio registro de módulos no Jest, e o `setupFiles` (`test-env.ts`) roda de novo antes de cada arquivo. Por isso o limite 3 não vaza para o `auth.e2e-spec.ts`, mesmo com `--runInBand`. O `.js` resolve pelo `moduleNameMapper`. Se alguém trocar por import estático, o teste do 429 falha de forma visível (com limite 1000 viria 401), em vez de passar em silêncio. Está aceitável.
- Restrições globais: o controller só repassa; um use case com `execute()` e `.spec.ts`; o use case depende das interfaces `GuardiansRepository`/`PasswordHasher` por token, não do Prisma; o DTO usa class-validator; nenhum `Logger`/`console` novo, então nada de token, senha ou CPF em log.
- A1: 200 com CPF mascarado e só com dígitos; 401 com o mesmo corpo para senha errada e CPF inexistente; 400 "CPF inválido." para CPF malformado ou ausente. A2 (parte do 401): sem token, token não JWT, outro segredo, expirado e sem "Bearer". O 403 é da Tarefa 5. O ValidationPipe agora é exercitado (campo extra → 400).
- `checkDigit` em `is-cpf.ts:8-15`: conferi a fórmula `(soma*10) % 11`, com 10 virando 0. É equivalente ao cálculo independente que usei na Tarefa 3, e os CPFs do seed passam.

### [IMPORTANTE] `JWT_EXPIRES_IN` só com dígitos é aceito e documentado como segundos, mas vale milissegundos
- Arquivo: `api/src/config/env.validation.ts:30-32` (`@Matches(/^\d+(ms|s|m|h|d|w|y)?$/)` e o comentário "Segundos ("3600")"), `api/.env.example:6`, `api/src/config/env.validation.spec.ts:44` (aceita `'3600'`)
- Problema: o valor chega como string ao `jsonwebtoken`, que lê string sem unidade em milissegundos. O cast em `auth.module.ts:31` (`expiresIn as JwtSignOptions['expiresIn']`) esconde a diferença.
- Cenário: quem segue o `.env.example` e põe `JWT_EXPIRES_IN=3600` para ter 1 hora recebe um token que vence em 3 segundos (medi: `exp - iat = 3`). O login responde 200, e logo em seguida o `/me` e todas as rotas protegidas dão 401. No app, o interceptor de 401 (Tarefa 8) derruba a sessão em loop. O R4 (sessão persistente) quebra sem nenhum erro de boot. O padrão `7d` funciona, por isso não chega a BLOQUEANTE, mas a regex nova aceita e documenta justamente o valor quebrado.
- Correção sugerida: exigir unidade (`/^\d+(s|m|h|d|w|y)$/`, sem `ms` e sem número puro) e trocar o comentário e o `.env.example` para "30m, 12h, 7d". A outra saída é converter o número puro para `Number` antes de passar ao `JwtModule`. Teste: um caso no `env.validation.spec` que recusa `'3600'`, ou um teste do `JwtModule` que mede `exp - iat`.

### [SUGESTÃO] O spec do `JwtAuthGuard` mocka o `canActivate` do passport
- Arquivo: `api/src/shared/guards/jwt-auth.guard.spec.ts:41-48`
- Problema: o terceiro caso (`'exige o token ... nas outras rotas'`) só confere que o mock foi chamado. Os dois primeiros testam a decisão de verdade (rota `@Public()` não chama o passport). O comportamento real do 401 está no e2e (`auth.e2e-spec.ts`, bloco "rota protegida"), então não falta cobertura.
- Cenário: nenhum bug hoje. O único risco é alguém tomar o spec unitário como prova do 401.
- Correção sugerida: nada obrigatório. Se quiser, pode trocar o terceiro caso por uma asserção de que a rota sem `@Public()` não devolve `true` direto.

### ⚠️ Não dá para verificar pelo diff
- 403 de aluno não vinculado (A2) e o guard de ownership: são da Tarefa 5.
- Throttler atrás de proxy (`trust proxy`): o developer registrou para a Tarefa 6 (Docker). Hoje não há proxy.
- Token de um responsável apagado continua válido (a estratégia não consulta o banco): os use cases da Tarefa 5 precisam devolver 401 ou 404 quando o `sub` não existe mais.

### Deixei de julgar
- Força mínima do `JWT_SECRET` e rate limit só por IP (sem limite por CPF): ficam com o cyber-security, como o developer pediu.
- Logins com sucesso também contam no limite de 5/min: o brief não diz se devem contar. Com 5 por minuto, o uso normal não esbarra.
- `@CurrentGuardian()` sem spec unitário: o D25 pede unitário em "decorator de validação" (o `@IsCpf`, que tem), e o `@CurrentGuardian()` é coberto pelo e2e (200 com `{id}`).
- CPF com espaços nas pontas (`" 969.294.560-04 "`) → 400: o app manda o valor mascarado sem espaço, e o formato estrito foi decisão registrada.
- Versões novas (`@nestjs/jwt` 11.0.2, `passport-jwt` 4.0.1, `@nestjs/throttler` 6.7.1) e o `yarn.lock`: não avaliei.

### Veredito da Tarefa 4
- **Spec ✅**: login, guard global com `@Public()`, `@CurrentGuardian()`, `@IsCpf()`, throttler no login, use case por interface e os testes pedidos (`is-cpf.spec`, `login.use-case.spec`, e2e 200/401/400), todos com RED registrado. Nada além do plano, fora as duas envs do throttler, que estão justificadas.
- **Qualidade: APROVADO** (0 bloqueantes); 1 importante, 1 sugestão.


### Rodada 1

Diff da correção: `a5d38ab..c36ace5` (`fix(api): exige unidade no JWT_EXPIRES_IN`), com 4 arquivos.

Verificação que eu mesmo rodei (`YARN_IGNORE_PATH=1`): `yarn lint` ok, `yarn tsc` ok, `yarn test` com 6 suítes e 94 testes (2 casos novos de recusa), `yarn test:e2e` com 4 suítes e 32 testes. O worktree ficou limpo. Com o `JwtService` real, `"3600s"` deu `exp - iat = 3600`, `"30m"` deu 1800, `"1w"` deu 604800 e `"1y"` deu 31557600, todos como o comentário promete.

Achados anteriores:
- **[IMPORTANTE] `JWT_EXPIRES_IN` sem unidade vale milissegundos: RESOLVIDO.** Em `api/src/config/env.validation.ts:33` a regex agora é `/^\d+(s|m|h|d|w|y)$/`: a unidade é obrigatória e não aceita `ms`. O comentário (`:28-31`), o `.env.example:6` e o `auth.module.ts:27` foram alinhados. O spec (`env.validation.spec.ts:54`) agora recusa `'3600'` e `'500ms'`; esses dois casos falhariam com a regex antiga, que aceitava ambos.
- **[SUGESTÃO] Spec do guard mocka o passport:** sem ação, como combinado.

Quebra nova no diff da correção: nenhuma. Observação fora do escopo, só como SUGESTÃO: `"0s"` continua aceito e geraria um token já vencido. É erro de operador, e nenhum exemplo do repo leva a esse valor.

### Veredito da Tarefa 4, Rodada 1
- **Spec ✅**
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes abertos).

## Mensagens
→ chief: Tarefa 4 aprovada. O IMPORTANTE (`JWT_EXPIRES_IN="3600"` vira 3 segundos, medido) é correção de uma linha na regex mais o comentário e o `.env.example`. Vale fazer agora, antes que o README da Tarefa 17 copie o exemplo.
→ developer: a rota de teste e o import dinâmico estão corretos (detalhe na seção). Na correção do `JWT_EXPIRES_IN`, exija unidade e acrescente no spec um caso que recusa `'3600'`.
→ cyber-security: o `expiresIn` sem unidade é lido em milissegundos pelo `jsonwebtoken`. O caminho inverso (um token que dura demais) não acontece com a regex atual, porque não há unidade maior que `y`.
→ chief (Rodada 1): Tarefa 4 aprovada na rodada 1. O IMPORTANTE do `JWT_EXPIRES_IN` está resolvido e medido (3600s = 3600 s), com 94 unit e 32 e2e verdes.

## Tarefa 7

Diff: `revisao/tarefa-7.diff` (52649c8..bd67851, BASE 40c8577). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint && yarn tsc && yarn test` deu exit 0, com 3 suítes e 5 testes passando. Não refiz o build iOS. A evidência `tarefa-7-ios.png` mostra fundo `#000`, `sectionTitle` teal em Montserrat Bold, corpo em Montserrat Regular e status bar clara.

Riscos que conferi fora do diff, e o que vi:
- **AppDelegate/SceneDelegate**: comparei com o `node_modules/expo/template.tgz` (SDK 58). São iguais ao template, com três diferenças intencionais: o `reactNativeFactoryModuleName` (requisito do protocolo `ExpoReactNativeFactoryProvider`, lido pelo `ExpoAppSceneDelegate.swift:67`, então não é código morto), o `customize` com `RNBootSplash.initWithStoryboard` e o bundle root `index` em vez de `.expo/.virtual-metro-entry`. O `index` é o correto com `react-native start`, e no release o script do Xcode usa `export:embed` + `resolveAppEntry` → `index.js`.
- **MainApplication/MainActivity**: batem com o template do Expo (`ExpoReactHostFactory`, `ApplicationLifecycleDispatcher`, `ReactActivityDelegateWrapper`). `RNBootSplash.init` e `RNScreensFragmentFactory` estão antes do `super.onCreate`, como as libs pedem.
- **`jest/resolver.js`**: o encadeamento está certo. O resolver do reanimated chama `options.defaultResolver` (com as extensões `.native` filtradas) ou o do worklets, e esse `defaultResolver` é o do preset do RN, que por sua vez chama o default do Jest com o `packageFilter`. O `react-native-worklets/src/mock.ts` existe.
- **Babel**: o `babel-preset-expo` 58 já injeta `react-native-worklets/plugin` quando o pacote está instalado (`configs/expo.js:104-110`). Não falta plugin do reanimated 4.
- **`metro.config.js`**: `resolver.useWatchman` é opção válida do Metro. O `mergeConfig` sobre o `getDefaultConfig` do Expo está ok.
- **Variante responsiva** (`inputValue`): o `createVariant` do Restyle passa a variante pelo `allRestyleFunctions.buildStyle`, que resolve valor responsivo por propriedade. Funciona.
- **Tema vs `01-design.md` seção 1**: paleta, cores semânticas, spacing, radii, sizes, breakpoints, as 21 textVariants, buttonVariants, cardVariants e motion conferem valor a valor. Não há hexadecimal fora de `palette.ts` em `src/` (fora os testes). Os dois `StyleSheet.create` têm só `flex: 1`.
- **Prontidão para expo-updates (Tarefa 15)**: Expo Modules ligados nos dois lados, entry por `resolveAppEntry` e `export:embed` no iOS e no Android, e o AppDelegate é o do template do Expo, por onde o expo-updates troca o bundleURL. A Tarefa 15 só acrescenta config (chave `expo` no `app.json`, `Expo.plist`/meta-data, `runtimeVersion`). Não vi retrabalho.

### [IMPORTANTE] O app não força o modo escuro: barra de navegação do Android e UI do sistema seguem o tema claro do aparelho
- Arquivo: `mobile/android/app/src/main/res/values/styles.xml:2` (`Theme.AppCompat.DayNight.NoActionBar`), `mobile/ios/FiapSchool/Info.plist` (sem `UIUserInterfaceStyle`)
- Problema: o `01-design.md` 1.1 diz que "não existe modo claro" e que a navigation bar do Android fica em `background`. O critério 1 da seção 9 pede "fundo preto ... inclusive atrás da navigation bar do Android". Com `edgeToEdgeEnabled=true`, o RN 0.88 decide a aparência da barra pelo `uiMode` do aparelho (`WindowUtil.kt:170-191`: `isAppearanceLightNavigationBars = !isDarkMode`, com `enforceNavigationBarContrast` ligado por padrão). O tema `DayNight` não força nada.
- Cenário: Android 10+ em modo claro. Com navegação por gestos, a alça sai escura sobre o fundo preto e quase some. Com 3 botões, o sistema põe um véu branco translúcido sobre a tab bar `surface`. As duas coisas reprovam o critério 1 do qa. No iOS em modo claro, o teclado do Login (Tarefa 9), os alerts e os componentes nativos saem claros sobre a tela preta.
- Correção sugerida: no iOS, `UIUserInterfaceStyle = Dark` no Info.plist. No Android, forçar a noite (`AppCompatDelegate.setDefaultNightMode(MODE_NIGHT_YES)` no `MainApplication.onCreate`, ou o tema `Theme.AppCompat.NoActionBar` + `uiMode` forçado) e `<item name="android:enforceNavigationBarContrast">false</item>` no `AppTheme`. Assim o `isDarkMode` do RN fica `true` e a barra fica transparente sobre o preto. Como o Android não builda aqui, a prova vem com o CI ou o qa. Se o chief preferir, isso pode ir para a Tarefa 10 (tab bar), mas precisa estar registrado.

### [SUGESTÃO] `settings.gradle` inclui o gradle-plugin do RN duas vezes fora do `pluginManagement`
- Arquivo: `mobile/android/settings.gradle:17` e `:20`
- Problema: há `includeBuild('../node_modules/@react-native/gradle-plugin')` (do template do RN) e também `includeBuild(expoAutolinking.reactNativeGradlePlugin)` (do Expo), que resolvem para a mesma pasta. O template do Expo 58 tem só o segundo. O primeiro `includeBuild` do `pluginManagement` também usa caminho fixo, quando o template resolve pelo `require.resolve`.
- Cenário: ⚠️ não dá para verificar sem JDK. Se o Gradle 9.4 recusar o build incluído em duplicidade, o primeiro `./gradlew` do CI (Tarefa 13) falha na configuração. Se aceitar, fica só a divergência do template.
- Correção sugerida: alinhar o `settings.gradle` ao `template.tgz` do Expo 58 (é o arquivo que o `install-expo-modules` deveria ter produzido) e tirar a linha 17.

### [SUGESTÃO] Restos do template nativo
- Arquivos: `mobile/ios/FiapSchool/Info.plist` (`NSLocationWhenInUseUsageDescription` vazio, `CFBundleDevelopmentRegion` `en`), `mobile/ios/FiapSchool/LaunchScreen.storyboard` (ainda em Resources, sem uso), `mobile/README.md` (texto do template em inglês: manda abrir o `App.tsx` que foi removido, usa `npm` e `bundle exec pod install`, e não fala do yarn 4 fixado nem do watchman)
- Problema: o app não usa localização. Uma chave de permissão vazia é motivo de rejeição na App Store se algum dia algum SDK linkar o CoreLocation. Com `en` como região, os textos nativos de acessibilidade do sistema saem em inglês num app pt-BR. O README induz o avaliador a seguir passos errados até a Tarefa 17.
- Cenário: o avaliador abre `mobile/README.md` e procura `App.tsx` na raiz, ou roda `npm start`.
- Correção sugerida: remover a chave de localização, usar `pt-BR` como região, apagar o `LaunchScreen.storyboard` e trocar o README por 5 linhas certas (corepack/yarn, `pod install`, `yarn start`, `yarn ios --udid`). Isso também pode ficar para a Tarefa 17.

### [SUGESTÃO] `palette` exportada no barrel do tema
- Arquivo: `mobile/src/theme/index.ts:5`
- Problema: o comentário de `palette.ts` diz que os componentes não usam a paleta direto, mas o `index.ts` a expõe ao lado de `Box`/`Text`. Hoje ninguém a importa.
- Cenário: numa tarefa futura, `palette.teal` num `style` passa por lint e tsc e escapa das cores semânticas.
- Correção sugerida: tirar `palette` do `index.ts`. O `theme.ts` importa direto de `./palette`.

### [SUGESTÃO] `hitSlop={8}` literal no placeholder
- Arquivo: `mobile/src/components/PlaceholderScreen.tsx:59`
- Problema: é espaçamento literal fora do tema (a restrição global fala em espaçamento), embora numa tela que vai sumir.
- Correção sugerida: `hitSlop={spacing.s}` via `useTheme()`. Melhor ainda, não copiar esse padrão para o `Button` da Tarefa 9.

### ⚠️ Não dá para verificar pelo diff
- Build Android (fontes em `assets/fonts`, `BootTheme`, `RNBootSplash.init`, Expo gradle): sem JDK aqui. A configuração bate com as docs das libs e com o template do Expo, exceto o `settings.gradle` acima. A prova é o CI da Tarefa 13.
- Peso real das fontes no Android (critério 2 do qa): o nome do arquivo bate com o `fontFamily`, mas só um aparelho confirma.

### Deixei de julgar
- Logo da splash borrado (PNG 1× ampliado): já está no ledger, aguardando o SVG do usuário.
- `App.test.tsx` escrito depois da navegação: o plano pedia RED só no teste do `Text` (que está registrado), e o developer registrou a falha por mutação (sem `onReady`). Aceitei.
- Tab bar padrão com `minHeight: sizes.tabBar` (não soma `insets.bottom` como o design pede): é placeholder, e a tab bar real é da Tarefa 10.
- Saída animada da splash (D11) e a `SplashScreen` JS (`testID="splash-screen"` do design): o plano da Tarefa 7 pede só a splash nativa.
- `Button` fora do tema: fica para a Tarefa 9, com as `buttonVariants` já no tema. É coerente com o plano.
- `yarn.lock`, `Podfile.lock` e as versões exatas dos pacotes: não avaliei, além da compatibilidade RN 0.88 / Expo 58 / reanimated 4 já aceita no ledger.

### Veredito da Tarefa 7
- **Spec ✅**: scaffold RN CLI com bundle `br.com.fiap.school`, Expo Modules (SDK 58), tema Restyle fiel ao `01-design.md`, Montserrat nos dois sistemas, reanimated, native-stack + tabs com placeholders, bootsplash, Jest + RNTL, metro sem watchman e o teste do `Text` com RED registrado. O `Card` e os botões de navegação dos placeholders estão dentro do D4 e do objetivo da tarefa.
- **Qualidade: APROVADO** (0 bloqueantes); 1 importante, 4 sugestões.

### Rodada 1

Diff: `bd67851..6df8b24` (1 commit, `fix(mobile): força o tema escuro e limpa restos do template nativo`). Rodei `yarn lint && yarn tsc && yarn test` no `mobile/`: exit 0, com 3 suítes e 5 testes passando. A evidência `tarefa-7-ios-r1.png` é igual à anterior (fundo preto, status bar clara, Montserrat).

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| IMPORTANTE: o modo escuro não é forçado | **RESOLVIDO** | iOS: `Info.plist` com `UIUserInterfaceStyle=Dark`. Android: `MainApplication.kt:31` chama `AppCompatDelegate.setDefaultNightMode(MODE_NIGHT_YES)` antes de qualquer activity. A `ReactActivity` é `AppCompatActivity`, e o `UiModeUtils.isDarkMode` lê o `uiMode` da configuração da activity, então o RN passa a ver o modo escuro. O `androidx.appcompat` chega como `api` do `react-android` (`ReactAndroid/build.gradle.kts:716`), então o import compila sem dependência nova. O `styles.xml` ganhou `enforceNavigationBarContrast=false` e `enforceStatusBarContrast=false` (`tools:targetApi="29"`, minSdk 24 ok) e o `windowBackground` preto. Com o contraste desligado, o `WindowUtil.kt:189-191` não mexe na aparência dos ícones. Eles seguem o tema `DayNight`, que resolve para escuro (ícones claros), e a barra fica transparente sobre o preto. Não compilei: a prova no aparelho fica com o CI e o qa. |
| SUGESTÃO: `settings.gradle` em duplicidade | **RESOLVIDO** | `mobile/android/settings.gradle` agora é idêntico ao `template.tgz` do Expo 58 (`diff` vazio, trocando só `HelloWorld` → `br.com.fiap.school`). O `includeBuild` com caminho fixo saiu. |
| SUGESTÃO: restos do template | **RESOLVIDO** | `NSLocationWhenInUseUsageDescription` removido. `CFBundleDevelopmentRegion` e `developmentRegion` agora em `pt-BR`, e `pt-BR` está em `knownRegions`. `LaunchScreen.storyboard` apagado, sem nenhuma referência restante no `project.pbxproj` (o grep não acha nada). O `mobile/README.md` foi reescrito em pt-BR com yarn 4, `pod install`, Metro sem watchman e `--udid`. |
| SUGESTÃO: `palette` no barrel | **RESOLVIDO** | `mobile/src/theme/index.ts` não exporta mais a `palette`, e nada fora de `src/theme/` a importa. |
| SUGESTÃO: `hitSlop={8}` | **RESOLVIDO** | `mobile/src/components/PlaceholderScreen.tsx:58` agora usa `hitSlop={spacing.s}`, vindo do `useTheme()`. |

Nenhuma quebra nova no diff da correção. Observação, sem achado: o `windowBackground` reaproveita `@color/bootsplash_background`. Se a cor da splash mudar um dia, o fundo da janela muda junto, o que hoje é o desejado (os dois são `background`).

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 pendentes).

## Mensagens
→ chief: Tarefa 7 aprovada. O IMPORTANTE (o modo escuro não é forçado) faz a barra de navegação do Android reprovar o critério 1 do qa num aparelho em modo claro. A correção é pequena (Info.plist + `MainApplication`/`styles.xml`). Decida se entra agora ou na Tarefa 10 e registre no ledger.
→ developer: AppDelegate/SceneDelegate e o `jest/resolver.js` estão corretos (comparei com o `template.tgz` do Expo 58). No Android, alinhe o `settings.gradle` ao template do Expo antes do CI.
→ chief (rodada 1): os 5 achados da Tarefa 7 estão resolvidos e não há quebra nova. Pode fechar a tarefa. O Android segue sem compilar aqui (prova no CI da Tarefa 13).

## Tarefa 5

Diff: `revisao/tarefa-5.diff` (commit `ea1473b`, base `c36ace5`, branch `feat/api`).

O que rodei e conferi fora do diff, e por quê:
- `YARN_IGNORE_PATH=1` em `api/`: `yarn lint` ok, `yarn tsc` ok, `yarn test` com 12 suítes e 128 testes, `yarn test:e2e` com 6 suítes e 57 testes. Bate com o `02-dev.md`. O worktree ficou limpo.
- Ressalva do `20e3` (pedido do developer): subi o `dist` contra o `test.db` (só leitura, porque o login não grava) e testei o parâmetro `:year` do Rafael com o token do Gustavo: `2025`, `0x7E9`, `2025.0`, `%202025` e `0b11111101001` deram **200** (todos viram o boletim de 2025), `1e3` deu 404 e `abc` deu 400. Detalhe na sugestão abaixo.
- `useExisting` com dois tokens (pedido do developer): `PrismaStudentsRepository` é provider de classe, e os tokens `STUDENTS_REPOSITORY` e `STUDENT_ACCESS_CHECKER` são aliases da mesma instância singleton. Está correto e é o uso documentado do Nest. O guard é injetado no `StudentsModule` (que provê o checker), e por isso o `@StudentOwnership()` só funciona em controllers desse módulo. Fica registrado em "Não dá para verificar" para a Tarefa 16.
- `**/testing/**` no `tsconfig.build.json` (pedido do developer): o `nest build` usa o `tsconfig.build.json` por padrão, e o `dist/modules/students` do worktree não tem `testing/`. O `tsc --noEmit` e o lint continuam cobrindo o fake. Está correto.
- Contrato, campo a campo (o app está sendo escrito contra ele). Conferi pelos e2e e pelos tipos de saída dos use cases:
  - `GET /api/me`: `{id, firstName, lastName, cpf: "***.294.560-**", students: [{id, rm, firstName, lastName, className, period}]}`. O e2e trava as chaves do topo (`Object.keys(...).sort()`) e o objeto inteiro de cada aluno (`toEqual`). ✓
  - `GET /api/students/:id/agenda`: `[{date, lessons: [{startTime, endTime, subject}]}]`, 7 dias em ordem, sem `order` na saída (spec). ✓
  - `GET /api/students/:id/report-cards`: `[{year, className}]` desc, e o e2e usa `toEqual` exato. ✓
  - `GET /api/students/:id/report-cards/:year`: `{year, className, terms: [{term, subjects: [{name, grade, absences}]}]}`, com 3 termos e nota/falta `null` preservados. ✓
  - 404 `{statusCode, message: "Boletim não encontrado.", error}`, 403 `{statusCode, message: "Você não tem acesso a este aluno.", error}` e 401: todos no formato padrão do Nest, como o contrato pede. ✓
- Ordem das guards: o `JwtAuthGuard` é `APP_GUARD` (global) e roda antes do `@UseGuards` da classe. Então o `request.user` existe quando o ownership roda, e o ownership roda antes dos pipes (provado pelo 403 com `/report-cards/abc`).
- Restrições globais: os controllers só repassam; um use case por rota, cada um com `execute()` e `.spec.ts` (3 de aluno mais o `GetMe`); os use cases dependem das interfaces por token; todas as rotas `students/:id` passam pelo guard (no nível da classe); não há `Logger`/`console` novo.
- Consultas: `/me`, agenda e boletim fazem um `findUnique`/`findMany` com `select` aninhado cada (o Prisma resolve as relações em lote), sem N+1. O ownership faz uma consulta só.
- Ledger: aulas por `startTime` com desempate por `order` (use case e `orderBy` do Prisma) ✓; 401 para responsável apagado em `/me` e nas rotas de aluno ✓; `:id` no lugar de `:studentId` ✓.

### [SUGESTÃO] O `:year` aceita grafias não canônicas e devolve o boletim
- Arquivo: `api/src/modules/students/controllers/students.controller.ts:37` (`@Param('year', ParseIntPipe) year: number`), em conjunto com o `ValidationPipe` global `transform: true` (`src/app.setup.ts:15-21`)
- Problema: o `ValidationPipe` global roda antes do `ParseIntPipe` e, como o metatipo é `number`, faz `Number(valor)`. Assim `0x7E9`, `0b11111101001`, `2025.0` e `" 2025"` chegam ao `ParseIntPipe` já como `2025` e passam. Era o que o developer suspeitava, e eu medi.
- Cenário: `GET /api/students/<rafael>/report-cards/0x7E9` → 200 com o boletim de 2025, quando o contrato e o `it.each(['abc', '2025.5', '-'])` dão a entender que só um inteiro decimal é aceito. Não vaza nada, porque o ownership roda antes e o dado é do próprio responsável. Também não afeta o app, que manda o ano que recebeu do `report-cards`. Por isso fica como SUGESTÃO.
- Correção sugerida: tipar o parâmetro como `string` (o `ValidationPipe` não converte) e deixar o `ParseIntPipe` decidir, ou trocar por `new ParseIntPipe()` com um `@Matches(/^\d{1,4}$/)` num DTO de params. Um e2e com `0x7E9` → 400 trava o comportamento. Se o chief preferir manter, basta registrar no ledger.

### ⚠️ Não dá para verificar pelo diff
- `@StudentOwnership()` fora do `StudentsModule`: o guard precisa do provider `STUDENT_ACCESS_CHECKER` no módulo do controller. Se a Tarefa 16 aplicar o decorator num controller de outro módulo, o boot falha com "Nest can't resolve dependencies". O plano diz que o `/demo/grades` confere o vínculo no use case, então hoje não se aplica.
- Tokens antigos depois de um `prisma:setup`: os ids são cuid e mudam a cada setup, então um token emitido antes vira "responsável apagado" (401). É o comportamento certo, mas o qa e o app em desenvolvimento vão ver 401 depois de recriar o banco. Vale avisar o qa.

### Deixei de julgar
- Alunos do `/me` ordenados por `firstName`: o contrato não define a ordem e a escolha é razoável. Não é desvio.
- 403 (e não 404) para aluno inexistente: segue o A2 e a decisão do developer de não revelar ids. O contrato não pede 404 nesse caso.
- Repositórios Prisma sem unit: estão cobertos pelos e2e com o seed real, mesmo padrão da Tarefa 4.
- O fake `testing/in-memory-students.repository.ts` entra no `collectCoverageFrom` (`src/**/*.ts`) e infla um pouco a cobertura: não há meta de cobertura na API.
- Bianca com 11 disciplinas no T1 e 12 no T2/T3: fiel ao JSON (conferido na Tarefa 3). O app tem que lidar com isso.

### Veredito da Tarefa 5
- **Spec ✅**: A2 (401/403), A3, A4 e A5 implementados e com e2e; um use case por rota com `.spec.ts`; guard de ownership lendo `params.id`; formatos idênticos ao contrato. Nada além do plano.
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 1 sugestão).


### Rodada 1

Diff da correção: `ea1473b..94e69d7` (`fix(api): ano do boletim só com 4 dígitos no parâmetro da rota`), com 6 arquivos.

Verificação que eu mesmo rodei (`YARN_IGNORE_PATH=1`):
- `yarn lint` ok, `yarn tsc` ok, `yarn test` com 14 suítes e 151 testes, `yarn test:e2e` com 6 suítes e 67 testes, `yarn build` ok (`dist/modules/students` sem `testing/`).
- Smoke no build, num banco novo (`DATABASE_URL=file:./review5.db yarn prisma:setup` → exit 0, depois `node dist/main`, login do Gustavo e o id do Rafael pelo `/me`):
  - `2025` e `2024` dão 200 com o boletim certo.
  - `2023` e `0000` dão 404 "Boletim não encontrado.".
  - `0x7E9`, `2025.0`, `%202025`, `0b11111101001`, `20e3`, `abc` e `9223372036854775808` dão 400 "Ano inválido: use 4 dígitos, ex.: 2025.".
  - Apaguei o banco e o log depois, e o worktree ficou limpo.
- Afirmação do developer ("com `@Param` o ts-jest emite metadado diferente do build"): **não se confirmou** no código atual. Pelo próprio Jest do projeto (ts-jest + `tsconfig.jest.json`), o `design:paramtypes` de `StudentsController.reportCard` é `["String","Number"]`. O `dist` compilado tem `[String, Number]`, e o `ts.transpileModule` com `isolatedModules` emite `Number` para `year: number`. Para tipo primitivo, os dois caminhos emitem o mesmo metadado. A causa mais provável do 400 que ele viu no build é um `dist` antigo, ou a variante `@Param(..., ParseYearPipe) year: number`, que dá 400 nos **dois** ambientes (o `ValidationPipe` converte para número e o `ParseYearPipe` recusa o que não é texto). De todo jeito, a solução escolhida não depende de metadado: parâmetro de decorator próprio é `type: 'custom'`, e o `ValidationPipe` não converte (`validateCustomDecorators` é `false` por padrão; o `raw-param.spec.ts:39-56` prova isso com o pipe real). Os e2e continuam representando o build.

Achados anteriores:
- **[SUGESTÃO] `:year` aceita grafias não canônicas: RESOLVIDO.**
  - `api/src/modules/students/controllers/students.controller.ts:40` usa `@RawParam('year', ParseYearPipe)`, e `api/src/shared/pipes/parse-year.pipe.ts:6` aceita só `/^\d{4}$/` sobre o texto cru.
  - O e2e (`test/students.e2e-spec.ts:198-224`) cobre as 13 grafias com o corpo exato do 400, e falharia com o código antigo (`0x7E9` dava 200).
  - O ownership continua antes da validação (`abc` e `0x7E9` da Adelaide → 403, `:236-247`).

Quebra nova no diff da correção: nenhuma. Observações, sem gravidade:
- O 404 de `0000` agora vem da checagem de faixa do use case (`MIN_YEAR = 1`), que continua necessária só para esse caso, porque o pipe já barra o que passaria de 64 bits. Está coerente.
- O 400 do ano tem `message` em string, e o 400 do login (ValidationPipe) tem `message` em array. Os dois são o formato padrão do Nest, e com o `ParseIntPipe` antigo já era assim. O schema de erro do app precisa aceitar `string | string[]`.

### Veredito da Tarefa 5, Rodada 1
- **Spec ✅**
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 0 sugestões abertas).

## Mensagens
→ chief: Tarefa 5 aprovada. O contrato confere campo a campo com o que o app consome (`/me`, agenda, `report-cards`, boletim e os corpos de 401/403/404). A única sugestão é o `:year` aceitar `0x7E9`/`2025.0` (medido, 200), sem impacto de segurança. Decida se corrige ou registra no ledger.
→ qa: depois de recriar o banco (`prisma:setup`), os ids mudam e o token antigo dá 401. Faça login de novo e pegue os ids no `/me`.
→ developer: `useExisting` e a exclusão de `testing/` no build estão corretos. A ressalva do `20e3` vale também para `0x7E9`, `0b…`, `2025.0` e `" 2025"`, que devolvem o boletim de 2025.
→ chief (Rodada 1): Tarefa 5 aprovada na rodada 1. Smoke no build num banco novo: 2025=200, 0x7E9=400, 0000/2023=404. A diferença de metadado entre ts-jest e build que o developer relatou não se reproduz (os dois emitem `[String, Number]`), e a solução com `@RawParam` não depende disso.
→ developer (Rodada 1): metadado conferido. Para `year: number`, ts-jest e `nest build` emitem `Number`. O 400 que você viu no build vinha de um `dist` antigo ou de `@Param(..., ParseYearPipe)`, que dá 400 nos dois ambientes.
→ chief (mobile): o `message` do 400 pode ser `string` (pipe da rota) ou `string[]` (ValidationPipe do login). O schema zod de erro da Tarefa 8 tem que aceitar os dois.

## Tarefa 8

Diff: `revisao/tarefa-8.diff` (`6a35cae..a86adcd`, BASE `6df8b24`). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 23 suítes e 129 testes. Em 3 de 3 execuções a saída trouxe também `A worker process has failed to exit gracefully` (ver SUGESTÃO abaixo).

Fora do diff, conferi só os riscos que consigo nomear:
- **Schemas zod contra a API real** (`worktrees/api`, commit `94e69d7`): `me.response.ts` (id, firstName, lastName, cpf mascarado, students com `rm: number` e `period`), `login.response.ts`, `agenda.response.ts` e `report-card.response.ts` batem campo a campo com `features/*/schemas.ts`. `grade` é `Float?` no Prisma, então chega como número e não como string de Decimal. No seed, as notas vão de 6 a 10, com passo de 0,5, e as faltas de 0 a 4: cabem no `min(0).max(10)` e no `int().min(0)`. A porta padrão da API é 3333, igual ao `resolveApiUrl`. A API expõe o `x-request-id` no CORS (`app.setup.ts:36`).
- **Token**: o token só vive no keychain (`secureStorage.ts`, `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`) e numa variável em closure. Ele não entra no zustand: o `partialize` grava só `selectedStudentId`, e há teste que procura `jwt-1` no mmkv. O login não leva o Bearer (`PUBLIC_PATHS`).
- **Logger**: a redação é por chave, sem diferenciar maiúsculas (`authorization`, `password`, `cpf`, `accesstoken`). Um `Error` vira `{name, message}`, o que corta `config.headers` e `config.data` do AxiosError. O interceptor loga método, URL relativa, status, duração e request-id, nunca o corpo. O `parseResponse` loga só o caminho e o código do campo. Os testes procuram o token, o CPF e a senha na saída do log.
- **MVVM**: nenhum arquivo de tela importa `services/` ou axios. Telas só usam hooks de `api/` e o store.
- **Trava do 401** (`client.ts:22-37`): enquanto o `signOut` não termina, o status ainda é `signedIn`, então um segundo 401 concorrente reaproveita o mesmo `expiringSession`. Depois que o status vira `signedOut`, os 401 seguintes não fazem nada. Está correta para o caso pedido.
- **`jest.config.js`**: o Jest mescla o `transform` do projeto com o do preset (o do preset continua cuidando dos assets), e `.mjs` passa pelo babel-jest. As libs ESM do MSW foram liberadas no `transformIgnorePatterns`.
- **RootStack condicional**: segue o padrão de auth do React Navigation. Com `signOut`, o modal `SelectStudent` e as abas saem da árvore. O `Navigation` devolve `null` só enquanto o status é `loading`, e o `bootstrap` não lança, porque o `loadToken` captura o erro do keychain. Então a splash não fica presa.

### [SUGESTÃO] Um 401 atrasado da sessão anterior derruba a sessão nova
- Arquivo: `mobile/src/services/http/client.ts:22-31`, `mobile/src/services/http/interceptors.ts:72-74`
- Problema: o `expireSession` decide só pelo `status` atual. Ele não confere se o 401 veio de um request feito com o token que está em uso agora. O `queryClient.clear()` do `signOut` não aborta os requests em voo, porque o `queryFn` não repassa o `signal` ao axios.
- Cenário: o token venceu e o app abre na Agenda. `/me` volta 401 rápido e a sessão cai. O `/agenda` do mesmo token está lento (timeout de 15 s). O usuário entra de novo antes disso, e o 401 atrasado do `/agenda` chega com o status `signedIn` da sessão nova: `signOut('expired')` e volta ao Login. É raro com a API local, mas a janela existe.
- Correção sugerida: anotar no config do request o token usado (ou um "epoch" da sessão) e só chamar `onUnauthorized` se ele ainda for o atual. Outra saída, que também vale sozinha, é repassar o `signal` do React Query para o `http.get` nos services. Teste: dois requests, `signOut` + `signIn` no meio, o 401 do primeiro não muda o status.

### [SUGESTÃO] Erro esperado da API vira `console.warn` e abre o LogBox em dev
- Arquivo: `mobile/src/services/http/interceptors.ts:67`, `mobile/src/services/logger/transports.ts:6-7`
- Problema: todo erro HTTP (401 de senha errada, 404 de ano, rede) sai como `logger.warn`, e o transporte do console manda para `console.warn`. Em build de debug, o RN mostra cada `console.warn`/`console.error` como toast do LogBox na base da tela.
- Cenário: no simulador, um CPF ou senha errada faz o toast amarelo aparecer em cima do botão FAZER LOGIN, que o design cola na base (`01-design.md` seção 9, item 3). Isso atrapalha o qa e um flow do Maestro rodando em debug, que toca no botão de novo.
- Correção sugerida: logar resposta 4xx esperada como `info` (deixar `warn` para 5xx, rede e `invalidResponse`) ou usar `LogBox.ignoreLogs(['[warn] http'])` no `devtools.ts`. Em produção nada muda (o `minLevel` já é `warn`).

### [SUGESTÃO] Jest termina com "worker failed to exit gracefully"
- Arquivo: `mobile/jest.setup.ts` / os testes de hook (singleton `queryClient`)
- Problema: nas 3 rodadas de `yarn test`, o Jest avisou `A worker process has failed to exit gracefully ... tests leaking due to improper teardown`. Com `--runInBand --detectOpenHandles` o processo não termina, o que confirma um handle aberto. O `02-dev.md` não menciona o aviso.
- Cenário: no CI da Tarefa 13 (jest com cobertura), um vazamento de verdade, como um timer de retry ou uma query que segue viva, fica escondido atrás desse aviso que todos já ignoram. O run com `--runInBand` trava.
- Correção sugerida: achar o handle (provável: timer de `gcTime`/retry do `queryClient` singleton, ou o `setTimeout` do timeout do axios). Depois, `afterAll(() => queryClient.clear())` e `queryClient.unmount()`, ou um `QueryClient` novo por teste com `gcTime: Infinity` e `retry` desligado no `QueryWrapper`.

### [SUGESTÃO] `signIn` que falha no keychain sai da mutation como erro que não é `ApiError`
- Arquivo: `mobile/src/features/auth/api/useLoginMutation.ts:12`, `mobile/src/app/queryClient.ts:17` (`Register.defaultError = ApiError`)
- Problema: se o `Keychain.setGenericPassword` rejeitar, o `onSuccess` rejeita e o React Query 5 marca a mutation como erro com esse `Error` cru. O tipo promete `ApiError`, mas `error.kind` vem `undefined`.
- Cenário: em aparelho Android com Keystore corrompido ou bloqueado, o login dá 200 e a tela da Tarefa 9 recebe um erro sem `kind`. O ViewModel não escolhe texto, e a tela fica sem mensagem ou com texto indefinido.
- Correção sugerida: no `signIn` (ou no `onSuccess`), capturar e lançar `new ApiError('unknown', { cause })`, e cobrir com um teste que faz o `setGenericPassword` rejeitar.

### [SUGESTÃO] `ApiError` aceita `cause` e o descarta
- Arquivo: `mobile/src/services/http/errors.ts:18`, `:30-36`
- Problema: `ApiErrorOptions.cause` é passado em quatro lugares (`:71`, `:75`, `:83` e `parseResponse.ts`), mas o construtor não o guarda nem o repassa ao `super`. É parâmetro morto, e quem depura acha que a causa está lá.
- Correção sugerida: `super(message, { cause: options.cause })`. O redact já reduz `Error` a nome e mensagem, então guardar a causa não vaza o header. Se a ideia for não guardar de propósito, tire a opção.

### [SUGESTÃO] Redação sem a chave genérica `token`
- Arquivo: `mobile/src/services/logger/redact.ts:4-9`
- Problema: só `accessToken` é redigido. Um `logger.info('...', { token })` ou `{ expoPushToken }` (Tarefa 16, `POST /devices`) sai em claro.
- Cenário: na Tarefa 16, um log de diagnóstico do registro do push com `{ token }` grava o push token no console e no Reactotron.
- Correção sugerida: comparar por "termina com `token`" (`/token$/i`) em vez de lista fechada, ou acrescentar `token`, `refreshtoken` e `expopushtoken`. Um caso no `redact.test.ts`.

### [SUGESTÃO] `upper()` contraria a regra de maiúsculas do design
- Arquivo: `mobile/src/utils/names.ts:14`
- Problema: o `01-design.md` 1.6 pede "Maiúsculas por `textTransform`, não na string" (por causa do leitor de tela). O `upper()` não tem uso e convida a fazer o contrário. Ele também depende de `toLocaleUpperCase('pt-BR')`, que é Intl, quando o resto dos utils evita Intl de propósito.
- Correção sugerida: remover o `upper` e o teste dele. Se surgir um uso real, ele volta junto.

### ⚠️ Não dá para verificar pelo diff
- Android: `dotenv.gradle` aplicado e `namespace == applicationId` (o react-native-config acha o `BuildConfig` sem `build_config_package`), mas sem build aqui.
- `react-native-config` em runtime (o próprio developer registrou): a primeira leitura real do `Config.API_URL` acontece no Login da Tarefa 9.
- O D9 diz "com token → valida com `/me` → Aulas". Hoje as abas aparecem antes do `/me` responder e caem para o Login se vier 401. A validação durante a splash é da Tarefa 8b (`01-design.md` 3.1, timeout de 8 s).

### Deixei de julgar
- Plugins de zustand e React Query no Reactotron (D15): adiados para a T13 no ledger.
- Cleartext no APK de release: adiado para a T17 no ledger.
- `ReportCardScreen` placeholder chamando `signOut` do store direto, sem ViewModel: é provisório e o developer registrou. O SAIR real é da Tarefa 10.
- Utils de CPF, datas, notas e nomes entraram na Tarefa 8 sem estar no plano dela. São dependência das Tarefas 9 a 12, têm teste com RED e não mudam comportamento visível. Não tratei como escopo extra.
- Os dois casos novos do `apiErrorBodySchema` sem RED (caracterização de refatoração): o caso string/array já tinha teste que falhava antes.
- `reactotron-react-native` entra no bundle de release (o `require` estático fica, só não roda): impacto de tamanho, não medi.
- Versões das libs e o `yarn.lock`: não avaliei.

### Veredito da Tarefa 8
- **Spec ✅**: `services/{http,storage,logger}`, session store com zustand + mmkv (só o aluno persistido), `queryClient` com keys por aluno e ano, schemas zod do contrato (conferidos contra a API real), `react-native-config` (`API_URL`), MSW nos testes, interceptor de 401 que limpa a sessão uma vez só, logger sem token, senha nem CPF e o `message` string ou `string[]`. Os testes pedidos (store, interceptor de 401 e schemas) têm RED registrado. A única parte faltando do D15 é a inspeção no Reactotron, adiada no ledger.
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 7 sugestões).

### Rodada 1

Diff: `a86adcd..d158e0f` (`1ac93aa`, `2d13f7b`, `d158e0f`). Rodei no worktree (`mobile/`, árvore limpa):
- `yarn lint`: 0.
- `yarn tsc`: 0.
- `yarn test`: 24 suítes e 138 testes passando, sem o aviso de "failed to exit".
- `yarn test --detectOpenHandles`: exit 0, terminou sozinho em 4,8 s e não listou nenhum handle aberto. Só aparece o stack do `console.warn` do teste de falha do keychain, que é esperado.

O `02-dev.md` registra o RED de cada teste novo, e para o 401 atrasado também registra duas mutações que o quebram.

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| SUG 1: 401 atrasado derruba a sessão nova | **RESOLVIDO** | `interceptors.ts` guarda `{startedAt, token}` por config (o mesmo objeto chega ao `error.config`, como já provava o log de duração) e repassa o token do request ao `onUnauthorized`. O `client.ts:26-35` só encerra a sessão se o token do request for o atual. Dois 401 juntos continuam com um `signOut` só: se o segundo chega com o `signOut` em andamento, o `clearToken` já zerou a memória, os tokens divergem e ele devolve o `expiringSession` pendente. Os quatro services repassam o `signal`, e o `queryClient.clear()` do `signOut` aborta a query em voo (teste no `session.store.test`). O teste do 401 atrasado espera o request chegar com `Bearer jwt-antigo` antes de trocar a sessão, então não tem corrida. |
| SUG 2: erro esperado como `console.warn` (LogBox) | **RESOLVIDO** | `ERROR_LOG_LEVEL` em `interceptors.ts`: 4xx vai para `info`, `canceled` para `debug`, e 5xx, rede, `invalidResponse`, `storage` e `unknown` ficam em `warn`. Efeito colateral aceitável: em produção (`minLevel: warn`) o 4xx deixa de ser logado. Resta um `warn` esperado (ver SUGESTÃO nova abaixo). |
| SUG 3: aviso de vazamento no Jest | **RESOLVIDO** | `jest.setup.ts:53-65`: `gcTime: Infinity` só no `queryClient` dos testes, mais `clear()` no `afterAll`. O `gcTime` de produção continua o padrão. Medido acima: sem aviso e sem handle aberto. |
| SUG 4: falha do keychain sem `kind` | **RESOLVIDO** | `useLoginMutation.ts`: o `signIn` foi para dentro do `mutationFn`, e uma falha vira `ApiError('storage')` com mensagem própria. O teste confere `kind`, mensagem e status `signedOut`. `storage` e `canceled` entraram em `FINAL_KINDS`. |
| SUG 5: `cause` descartado | **RESOLVIDO** | `errors.ts:38-45` passa `cause` ao `super` e atribui à mão se o motor ignorar. Os erros HTTP também guardam o `AxiosError`. Ver o efeito colateral abaixo. |
| SUG 6: redação sem `token` | **RESOLVIDO** | `redact.ts`: entraram `token`, `refreshtoken` e `expopushtoken`. A comparação é por chave exata, e o teste mostra que `tokenType` continua em claro. |
| SUG 7: `upper()` | **RESOLVIDO** | Removido de `utils/names.ts`, junto com o teste. Nenhum uso restante. |

#### Quebras novas no diff da correção

### [SUGESTÃO] O `ApiError` agora carrega o corpo do login (CPF e senha) na `cause`
- Arquivo: `mobile/src/services/http/errors.ts:94-98` (`cause: error` nas respostas HTTP), `:43-44`
- Problema: o `AxiosError` guardado como causa tem `config.data = '{"cpf":"96929456004","password":"..."}'` (e `config.headers.Authorization` nas rotas protegidas). O logger continua seguro, porque o redact reduz `Error` a `{name, message}`. Mas agora o erro da mutation de login, que fica no estado do React Query, carrega a senha. No Hermes, se o 2º argumento do `Error` for ignorado, a atribuição manual de `:44` deixa `cause` enumerável. Quando eu sugeri guardar a causa, só considerei o logger.
- Cenário: na Tarefa 13 (plugin do React Query no Reactotron, adiado no ledger "sempre sem rede/headers"), o plugin serializa o estado da mutation de login com erro e manda para o Reactotron a senha e o CPF em claro, mais o Bearer nos erros das rotas protegidas.
- Correção sugerida: nas respostas HTTP, não guardar o `AxiosError` inteiro como causa. Guarde só `{ code, method, url }`, ou guarde a causa só nos erros sem resposta (rede/cancelamento) depois de apagar `config.data` e `config.headers`. Teste: `JSON.stringify` (e as chaves enumeráveis) de um `toApiError` de um 401 do login não contém o CPF nem a senha.

### [SUGESTÃO] `sessão expirada` ainda sai como `warn`
- Arquivo: `mobile/src/services/http/client.ts:37`
- Problema: é um evento esperado (o token venceu) que ainda vai para `console.warn`.
- Cenário: em dev, um 401 de token vencido leva ao Login com "Sua sessão expirou", e o toast amarelo do LogBox aparece por cima do botão colado na base. É o mesmo efeito da SUG 2, num caminho que ficou de fora.
- Correção sugerida: `logger.info`.

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes). As 7 sugestões anteriores estão resolvidas. Há 2 sugestões novas, sendo a da `cause` a que vale fazer antes da T13.

### Rodada 2

Diff: `d158e0f..c5612af` (1 commit). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 24 suítes e 139 testes, sem aviso de "failed to exit".

| Achado (rodada 1) | Estado | Onde / o que conferi |
|---|---|---|
| SUG: `cause` do `ApiError` com o corpo do login e o Bearer | **RESOLVIDO** | `errors.ts:79-106`: `httpCause` guarda só `{name, code, status, method, url}`, com a query string cortada, e é usado nos três ramos do axios (cancelado, sem resposta e com resposta, `:116-127`). O teste novo monta um AxiosError com CPF e senha no `config.data`, Bearer no header, CPF na query e CPF no `response.data`, e procura os três segredos no `JSON.stringify` do erro, nas propriedades próprias e na causa. Nada aparece. Ficam com causa crua só o `invalidResponse` (ZodError: os issues do zod 4 não levam o valor recebido) e o `unknown` (erro que não é do axios, sem config de request). |
| SUG: `sessão expirada` como `warn` | **RESOLVIDO** | `client.ts:37` agora usa `logger.info`. |

Nenhuma quebra nova no diff. A `url` da causa mantém o id do aluno no caminho (`/students/<cuid>/...`). É id interno, não dado pessoal, e já aparecia no log do interceptor.

**Veredito da Rodada 2:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes, 0 pendentes).

## Mensagens
→ chief: Tarefa 8 aprovada, sem bloqueante nem importante. Das 7 sugestões, as que mais valem agora são o 401 atrasado derrubando a sessão nova e o aviso de vazamento no Jest, que vai virar ruído no CI da T13. A do LogBox afeta o qa e o Maestro em debug.
→ developer: na correção do 401 atrasado, o caminho mais barato é passar o `signal` do React Query aos `http.get` dos services e conferir no interceptor se o token do request ainda é o atual. O `cause` do `ApiError` está sendo descartado no construtor.
→ developer da Tarefa 16: incluir a chave `token`/`expoPushToken` na redação antes de logar qualquer coisa do registro do push.
→ chief (rodada 1): Tarefa 8 fechável. As 7 sugestões estão resolvidas e o jest sai limpo, inclusive com `--detectOpenHandles`. Há 2 sugestões novas: a `cause` do `ApiError` agora carrega o corpo do login (CPF e senha) e o Bearer, o que pesa quando o plugin do React Query no Reactotron entrar na T13; e `sessão expirada` ainda sai como `warn`.
→ chief (rodada 2): Tarefa 8 sem pendências. A `cause` do `ApiError` ficou saneada (o teste procura CPF, senha e Bearer e não acha nenhum), e `sessão expirada` virou `info`.

## Tarefa 6

Diff: `revisao/tarefa-6.diff` (commits `ffa4059..e0aa371`, base `94e69d7`, branch `feat/api`).

O que rodei e conferi fora do diff, e por quê:
- `YARN_IGNORE_PATH=1` em `api/`: `yarn lint` ok, `yarn tsc` ok, `yarn test` com 17 suítes e 230 testes, `yarn test:e2e` com 10 suítes e 94 testes, `yarn build` ok e `./scripts/smoke.sh` deu **SMOKE OK**. `actionlint .github/workflows/api.yml` não achou erros. Bate com o `02-dev.md`. O worktree ficou limpo, e o `smoke.db` foi apagado pelo `trap`.
- Docker e hadolint não existem na máquina, então revisei o Dockerfile linha a linha e chequei no `node_modules` os dois pontos de maior risco:
  - **Engines do Prisma 7:** o `migrate deploy` precisa do binário `schema-engine`, que o `@prisma/engines` baixa no `yarn install` para a plataforma do host (aqui `schema-engine-darwin-arm64`). No Dockerfile, o install roda no estágio `deps` sobre `bookworm-slim` com `openssl` e `ca-certificates` (`Dockerfile:13-14`). Assim a detecção escolhe `debian-openssl-3.0.x`, e o runtime sai da mesma `base`, com a mesma libc e o mesmo openssl. O cliente (`prisma-client` + adapter) não usa query engine nativo.
  - **better-sqlite3:** o `install` é `prebuild-install || node-gyp rebuild` (`package.json` do pacote). O estágio `deps` tem `python3 make g++` como fallback (`:24-26`), e o `.node` gerado vai para o runtime junto com o `node_modules`, na mesma base. Está correto.
  - **Usuário `node` e volume:** `/app/data` é criado e passado para `node` antes do `VOLUME` (`:51-53`), então o volume nomeado do compose nasce com o dono certo. O resto de `/app` é de root, e nada escreve ali no boot: o tsx usa `os.tmpdir()`, o `migrate deploy` só escreve no banco e o `node_modules` é `--chown=node`.
  - **CMD:** `sh -c "yarn -s prisma:setup && exec node dist/main"`. O `exec` deixa o node como PID 1, e o `enableShutdownHooks` trata o SIGTERM. O seed acha tudo de que precisa no runtime: `prisma/seed.ts`, `seed-mapper.ts`, `seed-data/`, `src/generated` (`:48`), `prisma.config.ts` com `dotenv` e o `tsx`, que estão no `node_modules` completo. O `DATABASE_URL` com caminho absoluto foi validado pelo developer fora do Docker.
  - **HEALTHCHECK:** o `fetch` global existe no Node 24, e o `start-period` de 30 s cobre o migrate + seed (3 hashes bcrypt).
- Pontos que o developer pediu para olhar:
  - **Override de `LOG_DESTINATION` em `create-test-app.ts:23-25`:** o token é provider do `LoggerModule.forRootAsync` (`logger.module.ts:18`), e o `overrideProvider` do `TestingModule` troca o provider em qualquer módulo do grafo. O `logging.e2e-spec` prova isso capturando as linhas. Sem `logDestination`, o valor `null` faz o log ir para o stdout, que fica mudo nos e2e por causa do `LOG_LEVEL=silent`. Está correto.
  - **`toBoolean` lendo `obj[key]` (`env.validation.ts:31-45`):** está certo e é necessário. Com `enableImplicitConversion`, o `value` que chega ao `@Transform` já seria `Boolean("false") === true`, e o valor cru evita isso. Com a chave ausente, o `@Transform` não roda e fica o padrão `true`, coberto em "aplica os padrões". Valores fora de `true`/`false` caem no `@IsBoolean` e derrubam o boot (spec com `sim`, `0` e `''`).
  - **`test-env.ts:11-15`:** como o `setupFiles` roda antes de cada arquivo, os arquivos que mudam `LOG_LEVEL`, `TRUST_PROXY`, `SWAGGER_ENABLED` ou `LOGIN_THROTTLE_LIMIT` (sempre antes do `import()` dinâmico) não vazam para o arquivo seguinte no `--runInBand`. Está correto.
- A8 (logs sem senha, token ou CPF completo): o redact usa `remove`, o corpo não entra no log do pino-http, e o e2e e o smoke procuram a senha, o CPF com e sem máscara, o token, o payload do JWT, `Bearer` e o cookie. A prova de mutação está registrada no `02-dev.md`. A7 (Swagger): o e2e trava as 6 rotas exatas, o Bearer, os códigos de erro e os DTOs. O `/docs` fica fora do roteador do Nest, então o `JwtAuthGuard` não o bloqueia.
- O `api.yml` segue o D32 (filtro de path, install → lint → tsc → unit → e2e) e acrescenta build e smoke, que são extras com motivo. O `smoke.sh` está como `100755` no git, e `jq`/`curl` existem no `ubuntu-latest`.

### [SUGESTÃO] O container apaga e recria os dados a cada boot, inclusive em restart automático
- Arquivo: `api/Dockerfile:59` (`CMD ... yarn -s prisma:setup ...`), `docker-compose.yml:33` (`restart: unless-stopped`), `api/prisma/seed.ts` (`deleteMany` e recriação)
- Problema: o seed é destrutivo e roda em todo start do container, e não só no primeiro. O D27 pede "sobe com migrate + seed", o que também se cumpre semeando só quando o banco está vazio.
- Cenário: o avaliador está logado no app, a máquina dorme ou o Docker reinicia, e o `unless-stopped` sobe o container de novo. O seed recria os responsáveis com cuids novos, o token salvo vira "responsável apagado", o `/me` dá 401 e o app desloga. Na Tarefa 16 o efeito piora: o `Device` (cascade do `Guardian`) e as notas lançadas pelo `/demo/grades` somem a cada restart, e o push deixa de chegar até o app registrar de novo.
- Correção sugerida: no `seed.ts`, sair cedo quando `guardian.count() > 0`, a não ser que venha um `SEED_RESET=true`. O `yarn prisma:seed` manual continua podendo recriar tudo. Ou então rodar o seed no CMD só se o arquivo do banco não existia antes do `migrate deploy`. O ledger já registra que foi pedido do chief. Vale reavaliar antes da Tarefa 16.

### [SUGESTÃO] Sem `docker build` no CI, o caminho de um comando do D27 só tem prova por revisão
- Arquivo: `.github/workflows/api.yml:25-63`
- Problema: não há Docker na máquina, e o workflow não constrói a imagem. Não achei erro na revisão (detalhe acima), mas o primeiro `docker compose up --build` vai ser o do avaliador.
- Cenário: uma mudança futura em `package.json` (por exemplo, um script de seed que usa outro arquivo fora do `COPY`) ou no `.dockerignore` quebra a imagem, e nenhum check pega.
- Correção sugerida: um job `docker` com `docker/build-push-action` (`push: false`, `context: api`), seguido de `docker run -d` e de um `curl` em `/api/health` até o healthcheck ficar `healthy`. Custa cerca de 2 a 3 minutos por PR com o filtro de path.

### [SUGESTÃO] Sem `NODE_ENV`, o log usa o transport `pino-pretty`, que é devDependency
- Arquivo: `api/src/infra/logger/logger.config.ts:35-37` (`shouldUsePrettyLogs`), `api/package.json` (`pino-pretty` em devDependencies)
- Problema: o pretty é o padrão para qualquer `NODE_ENV` que não seja `production`/`test`, inclusive quando ele não está definido. O `.env.example` não define `NODE_ENV`.
- Cenário: hoje nenhum caminho do repo dispara isso, porque o Docker e o smoke fixam `production` e o `node_modules` é completo. Mas quem fizer `yarn install --production` e `yarn start:prod` sem `NODE_ENV` derruba o boot com "unable to determine transport target for pino-pretty".
- Correção sugerida: pretty só com `NODE_ENV=development` (e pôr `NODE_ENV=development` no `.env.example`), ou passar o `pino-pretty` para dependencies. Também serve só registrar.

### ⚠️ Não dá para verificar pelo diff
- O build da imagem e o `docker compose up` de verdade (não há Docker na máquina). Ficam para o qa ou para o job sugerido acima.
- O `api.yml` só roda quando houver remote. O actionlint passou, mas o cache de yarn do `setup-node` e o `cp .env.example .env` só se provam no primeiro PR.

### Deixei de julgar
- Imagem com `node_modules` completo (prisma, tsx e devDependencies): é maior que o necessário, mas não é requisito. A decisão está registrada.
- `JWT_SECRET` fixo no `docker-compose.yml`, porta em `0.0.0.0` e Swagger público em `/docs`: são escolhas documentadas para uso local (D26/D27). A avaliação é do cyber-security.
- `req.headers` inteiros no log (user-agent, `x-forwarded-for`): o A8 cobre senha, token e CPF, e todos estão fora.
- Node 24 fixo no `api.yml`, em vez de `node-version-file`: justificado, porque o `.nvmrc` só existe na `chore/tooling`. Vale trocar no fechamento, depois do merge.
- Versões novas (`nestjs-pino` 5, `pino` 10, `@nestjs/swagger` 11.4.7, `pino-pretty` 13) e o `yarn.lock`: não avaliei.

### Veredito da Tarefa 6
- **Spec ✅**: nestjs-pino com request-id e redact (D24, A8), Swagger em `/docs` com Bearer e DTOs (D26, A7), Dockerfile e compose com migrate + seed (D27) e `api.yml` com lint, tsc, unit e e2e (D32), além do `TRUST_PROXY` do ledger. Build e smoke no CI são extras com motivo, não escopo novo.
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 3 sugestões).


### Rodada 1

Diff da correção: `e0aa371..7a7b58c` (3 commits: `aeb7983` seed, `079a947` pino-pretty, `7a7b58c` job docker), com 13 arquivos.

Verificação que eu mesmo rodei (`YARN_IGNORE_PATH=1`): `yarn lint` ok, `yarn tsc` ok, `yarn test` com 18 suítes e 242 testes, `yarn test:e2e` com 11 suítes e 96 testes, `yarn build` ok, `./scripts/smoke.sh` deu SMOKE OK, `actionlint` não achou erros e `shellcheck` não achou nada em `smoke.sh` e `docker-smoke.sh`. O `docker-smoke.sh` está como `100755` no git. O worktree ficou limpo, sem `seed-policy.db` nem `smoke.db` sobrando.

Pontos que o developer pediu para olhar:
- **`prisma/seed-policy.ts`:** é uma função pura de três saídas. Banco vazio dá `seed` (mesmo com `SEED_RESET=true`); banco com dados dá `skip`, a não ser que `SEED_RESET` seja exatamente `true` (com trim e sem diferenciar maiúsculas). Falha fechada: `1`, `sim` e `''` não apagam nada. O spec cobre as três saídas.
- **Ordem count → hash no `seed.ts:58-73`:** o `count()` vem antes do bcrypt, então o boot com banco populado não paga os 3 hashes. O `deleteMany` só roda em `reset`, dentro da mesma transação da recriação, então uma falha no meio não deixa o banco vazio. O `.env.example` traz `SEED_RESET=false`. O `dotenv` não sobrescreve uma env que já existe, nem vazia (o e2e passa `SEED_RESET: ''` de propósito).
- **`test/seed-policy.e2e-spec.ts`:** usa o banco próprio `seed-policy.db` (coberto pelo `*.db` do gitignore e apagado no `afterAll`) e a CLI real (`migrate deploy` + `db seed`), com `--runInBand`, então não mexe nos ids do `test.db` das outras suítes. Os dois casos falhariam com o seed antigo (`ids continuam os mesmos`) e com um seed que só pulasse (`SEED_RESET=true` → ids novos).
- **`scripts/docker-smoke.sh`:**
  - `wait_healthy` só retorna quando o status é `healthy` **e** o `curl /api/health` responde `ok`. Isso cobre o status antigo que o `inspect` possa mostrar logo depois do `docker restart`. A falha do `curl | jq` dentro de `&&` não dispara o `errexit`.
  - Os 90 s de espera cobrem o `start-period` (30 s) e o `interval` (10 s). O container parado é detectado por `State.Running`.
  - Depois do restart, o script confere o "Seed ignorado" no log e o **mesmo token** com 200 no `/me`. Isso prova a correção de ponta a ponta: o `JWT_SECRET` se mantém no `docker restart`, e só o id do responsável poderia mudar.
  - O job usa `working-directory: api` (o `defaults.run` do workflow), então o `docker build .` usa o contexto certo.

Achados anteriores:
- **[SUGESTÃO] Seed destrutivo a cada boot: RESOLVIDO.** `api/prisma/seed-policy.ts:16-22` + `api/prisma/seed.ts:58-77`. Restart do container mantém ids e tokens, e o recriar fica opt-in com `SEED_RESET=true` (compose `:28`, `.env.example:23`).
- **[SUGESTÃO] Sem `docker build` no CI: RESOLVIDO** (`.github/workflows/api.yml:65-80` + `api/scripts/docker-smoke.sh`). O job ainda não rodou (sem remote, sem Docker aqui), então a prova real fica para o primeiro PR.
- **[SUGESTÃO] `pino-pretty` sem `NODE_ENV`: RESOLVIDO.** `api/src/infra/logger/logger.config.ts:35` agora usa pretty só com `NODE_ENV === 'development'`, e o spec cobre `undefined`, `''`, `staging` e `Development`.

Quebra nova no diff da correção:

### [SUGESTÃO] `start:dev` com `NODE_ENV=development` inline não roda no Windows
- Arquivo: `api/package.json:13-14` (`"start:dev": "NODE_ENV=development nest start --watch"`, idem `start:debug`)
- Problema: no Windows, o yarn 1 executa os scripts pelo `cmd.exe`, que não entende a atribuição `VAR=valor comando`.
- Cenário: um avaliador no Windows segue o README, roda `yarn start:dev` e recebe `'NODE_ENV' não é reconhecido como um comando interno ou externo`, sem a API subir. Antes desta correção, o `start:dev` funcionava em qualquer SO. O caminho do Docker não é afetado.
- Correção sugerida: tirar a env do script e pôr `NODE_ENV=development` no `.env.example`. O `ConfigModule` já lê o `.env`, e o `shouldUsePrettyLogs` usa `config.get('NODE_ENV')`. A outra opção é usar `cross-env`. Se o projeto só mira macOS/Linux (o brief não fala em Windows), basta registrar no ledger.

### Veredito da Tarefa 6, Rodada 1
- **Spec ✅**
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes; 1 sugestão nova, o `start:dev` no Windows).


### Rodada 2

Diff da correção: `7a7b58c..650b5fe`, só `api/package.json` e `api/.env.example`.

Verificação que eu mesmo rodei (`YARN_IGNORE_PATH=1`): `yarn test` com 242 testes e `yarn test:e2e` com 96 testes, os dois verdes. O worktree ficou limpo.

- **De onde o logger lê o `NODE_ENV`:** `src/infra/logger/logger.module.ts:27` usa `config.get('NODE_ENV', { infer: true })` do `ConfigService`, e não há nenhum `process.env.NODE_ENV` em `src/`. O `ConfigModule.forRoot` carrega o `.env` da pasta onde o processo roda, e o `NODE_ENV` está declarado em `EnvironmentVariables` (`env.validation.ts:123`).
- **Prova no build:** rodei `node dist/main` a partir de uma pasta temporária com o próprio `.env` e sem `NODE_ENV` no processo, nas três situações:
  - `.env` com `NODE_ENV=development`: log no pino-pretty (`[hh:mm:ss] INFO: request completed ...`);
  - o mesmo `.env`, mas com `NODE_ENV=production` no processo: JSON, porque a env do processo vence o `.env`, que é o caso do Docker e do smoke;
  - `.env` sem `NODE_ENV`: JSON.

Achado anterior:
- **[SUGESTÃO] `start:dev` com env inline não roda no Windows: RESOLVIDO.** `api/package.json:13-14` voltou a ser `nest start --watch` / `nest start --debug --watch`, sem nada específico de shell. `api/.env.example:15` traz `NODE_ENV=development`, com o comentário explicando o efeito.

Quebra nova no diff: nenhuma. Conferi os caminhos que copiam o `.env.example`:
- **CI** (`cp .env.example .env`): no e2e, o Jest define `NODE_ENV=test` no processo, que vence o `.env`, e o `logging.e2e` usa destino próprio de qualquer forma. O smoke exporta `production`.
- **Docker:** o `.env` fica fora do contexto (`.dockerignore`), e o Dockerfile fixa `production`.

Observação local, sem gravidade: o `api/.env` que já existe no worktree foi copiado antes dessa linha. O `yarn start:dev` aqui vai logar em JSON até alguém acrescentar `NODE_ENV=development` nele.

### Veredito da Tarefa 6, Rodada 2
- **Spec ✅**
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 0 sugestões abertas).

## Mensagens
→ chief: Tarefa 6 aprovada. Suíte, build, smoke e actionlint passaram aqui. O Dockerfile está coerente nos pontos de risco (engines do Prisma e better-sqlite3 na mesma base, volume com dono `node`, `exec` no CMD), mas segue sem build real. A sugestão do seed destrutivo a cada boot vale reavaliar antes da Tarefa 16 (Device e notas de demo somem em restart). Registre no ledger.
→ qa: no `docker compose up`, confirme que o healthcheck fica `healthy`. Depois de um `docker compose restart`, o app deve deslogar (401 esperado, porque o seed recria os ids).
→ developer: os três pontos pedidos (override de `LOG_DESTINATION`, `toBoolean` com o valor cru, reset no `test-env.ts`) estão corretos. O detalhe está na seção.
→ cyber-security: `JWT_SECRET` fixo no compose, porta `0.0.0.0` e `/docs` público ficam com você. O redact e o A8 foram conferidos aqui (e2e + smoke).
→ chief (Rodada 1): Tarefa 6 aprovada na rodada 1. As três sugestões estão resolvidas (suíte 242/96, smoke, actionlint e shellcheck limpos). O job docker só se prova no primeiro PR. Há uma sugestão nova: `start:dev` com env inline quebra no Windows. Decida entre mover o `NODE_ENV` para o `.env.example` ou registrar no ledger.
→ chief (Rodada 2): Tarefa 6 aprovada sem pendências. O `start:dev` voltou a ser portável e o `NODE_ENV` vem do `.env` pelo `ConfigService` (comprovado no build: development dá pretty, production no processo vence o `.env`, sem a variável dá JSON).
→ qa (Rodada 2): o `api/.env` antigo do worktree não tem `NODE_ENV=development`. Acrescente essa linha para ter o log legível no `start:dev`.

## Revisão final — branch api

Escopo: `40c8577..650b5fe` (`feat/api`, Tarefas 3–6), lido pelo `revisao/branch-api.diff` e pelos arquivos completos no worktree `.claude/worktrees/api`. Também conferi o contrato contra os schemas zod do mobile (`.claude/worktrees/mobile/mobile/src/features/*/schemas.ts`).

Verificação que eu mesmo rodei (em `api/`, `YARN_IGNORE_PATH=1`):
- `yarn lint`: ok, sem warnings.
- `yarn tsc`: ok.
- `yarn test`: 18 suítes, 242 testes, todos verdes.
- `yarn test:e2e`: 11 suítes, 96 testes, todos verdes.
- `yarn build`: ok.
- `./scripts/smoke.sh`: `SMOKE OK` (banco novo, login, /me, boletim, 401, /docs-json, log em JSON sem segredo).
- O worktree ficou limpo depois de tudo (`git status` vazio).
- Spec por use case: os 5 arquivos de `src/**/use-cases/` (login, get-me, get-student-agenda, list-report-cards, get-report-card) têm `.spec.ts`. A6 ok.

Critérios A1–A8: cada um tem e2e verde (auth, me, students, logging, swagger, seed). A6 tem também o `prisma:reset` que o chief executou com consentimento (ledger). O contrato do plano bate campo a campo com os schemas zod do mobile, inclusive `grade` 0–10 e `null`, que os dados do JSON respeitam.

### [IMPORTANTE] Os use cases lançam exceção HTTP do Nest, e o D18 diz "use case sem conhecer HTTP"
- Arquivos:
  - `api/src/modules/auth/use-cases/login.use-case.ts:1,53`: `UnauthorizedException`;
  - `api/src/modules/guardians/use-cases/get-me.use-case.ts:1,36`: `UnauthorizedException`;
  - `api/src/modules/students/use-cases/get-report-card.use-case.ts:1,53,58`: `NotFoundException`.
- Problema: o D18 do brief define `use-cases/` como "uma classe com `execute()` por caso de uso, sem conhecer HTTP". As três classes decidem o status HTTP (401/404) e dependem de `HttpException`. Os specs também importam essas exceções. Nas revisões por tarefa isso passou porque cada caso parecia isolado. No conjunto, virou o padrão dos três módulos.
- Cenário: o avaliador lê a arquitetura declarada no README/brief (controllers → use cases → repositórios) e encontra `NotFoundException` dentro do use case. Reaproveitar o `GetReportCardUseCase` fora do HTTP (por exemplo, no seed de demo ou numa fila da Tarefa 16) traria junto a semântica de 404.
- Correção sugerida: criar erros de domínio por módulo (`modules/<m>/errors/`: `InvalidCredentialsError`, `GuardianNotFoundError`, `ReportCardNotFoundError`). Os use cases e os specs passam a usá-los. Um único exception filter global (ou um mapa erro → `HttpException`) devolve exatamente o corpo atual `{statusCode, message, error}`. Os e2e atuais, que fixam mensagem e status, garantem que o contrato não muda. Se o chief preferir manter assim, o desvio do D18 precisa ser registrado no ledger.

### [SUGESTÃO] Rate limit por IP de 5 logins/min conta logins certos, e no Docker/Maestro todos os clientes saem do mesmo IP
- Arquivos: `api/src/modules/auth/auth.module.ts:39-48`, `docker-compose.yml:21-22`, `api/.env.example:9-10`.
- Problema: o `ThrottlerGuard` conta toda requisição ao login, com sucesso ou sem. Com o Docker Desktop (port forwarding) ou com a API e o emulador na mesma máquina, todos os clientes chegam com o mesmo `req.ip`.
- Cenário: os flows do Maestro (Tarefa 14) fazem login em quase todo flow e têm um flow de senha errada. Somados ao avaliador testando no Swagger, passam de 5 logins em 60 s e recebem 429 "Muitas tentativas…". Um flow falha sem bug no app.
- Correção sugerida: no `maestro.yml` e no README, subir `LOGIN_THROTTLE_LIMIT` para o job de e2e (os e2e da API já fazem isso em `test/setup/test-env.ts:8`). Opcional: `skipIf` para não contar respostas 200. Não exige mudança de código nesta branch.

### [SUGESTÃO] Dependências do template do Nest sem uso
- Arquivo: `api/package.json:84-90` (`ts-node`, `ts-loader`, `tsconfig-paths`, `source-map-support`, `@eslint/eslintrc`).
- Problema: nenhuma das cinco é importada ou referenciada em config (grep em `src`, `test`, `prisma`, `*.json` e `*.mjs`). O seed usa `tsx`, o build usa `tsc` via `nest build`, e o eslint usa flat config sem `FlatCompat`.
- Cenário: o enunciado pede "utilizar apenas as necessárias". O avaliador abre o `package.json` e vê dependência morta. Elas também entram na imagem Docker, que copia o `node_modules` completo.
- Correção sugerida: remover as cinco e rodar a suíte. `@nestjs/schematics` fica, porque o `nest-cli.json` a referencia.

### [SUGESTÃO] Repositório falso em lugar diferente em cada módulo
- Arquivos:
  - `api/src/modules/students/testing/in-memory-students.repository.ts`: arquivo próprio, excluído do build por `tsconfig.build.json:4`;
  - `api/src/modules/auth/use-cases/login.use-case.spec.ts:14-22`: classe dentro do spec;
  - `api/src/modules/guardians/use-cases/get-me.use-case.spec.ts:8-16`: classe dentro do spec.
- Problema: três módulos, dois padrões para a mesma peça. O nome também confunde: `GuardiansRepository` (`GUARDIANS_REPOSITORY`) mora em `modules/auth`, e o módulo `guardians` usa outro, o `GuardianProfilesRepository`.
- Cenário: quem mantém o código procura o fake do auth em `auth/testing/` e não acha. Quem procura o repositório de responsáveis em `modules/guardians` acha o outro.
- Correção sugerida: escolher um padrão. O mais barato é mover o fake de students para dentro dos specs, ou criar `testing/` nos três. Renomear o do auth para `GuardianCredentialsRepository` / `GUARDIAN_CREDENTIALS_REPOSITORY`, que é o que ele devolve.

### [SUGESTÃO] O 401 do guard sai em inglês e os demais erros em português
- Arquivos: `api/src/shared/guards/jwt-auth.guard.ts` (passport), `api/src/modules/guardians/use-cases/get-me.use-case.ts:36`, `api/src/shared/guards/student-ownership.guard.ts:49,55`.
- Problema: sem token, com token inválido ou com responsável removido, a resposta é `{"statusCode":401,"message":"Unauthorized"}`. Os erros 400, 403, 404 e 429 e o 401 do login vêm com mensagem em português.
- Cenário: o Swagger mostra os erros em português e, ao testar uma rota sem token, devolve "Unauthorized". O app não exibe esse texto (o interceptor limpa a sessão), então o impacto é só de consistência para quem avalia a API.
- Correção sugerida: uma constante `SESSION_INVALID_MESSAGE` usada no `handleRequest` do `JwtAuthGuard`, no `GetMeUseCase` e no guard de ownership. Se o IMPORTANTE acima for corrigido, o filtro global resolve isso no mesmo lugar.

### [SUGESTÃO] `docker-compose.yml` fora do filtro de path e nunca validado no CI
- Arquivo: `.github/workflows/api.yml:5-13`.
- Problema: o filtro cobre só `api/**` e o próprio workflow. O compose da raiz não dispara o workflow, e o job `docker` usa `docker run`, não o compose.
- Cenário: um PR que muda só o `docker-compose.yml` (por exemplo, renomeia uma env) passa sem CI e quebra o "um comando" do D27.
- Correção sugerida: incluir `docker-compose.yml` nos dois `paths` e um passo `docker compose -f ../docker-compose.yml config -q` no job docker.

### Adiados do ledger
- **SUG "0s" aceito no `JWT_EXPIRES_IN`** (`api/src/config/env.validation.ts:88`, regex `^\d+(s|m|h|d|w|y)$`): **não precisa ser corrigido antes do PR.** Só se manifesta com configuração explicitamente errada (nenhum exemplo, compose ou script usa zero), e o efeito é visível na hora: todo token sai expirado e o primeiro `/me` dá 401. Se quiser fechar, a correção é de uma linha: `^[1-9]\d*(s|m|h|d|w|y)$` mais um caso no `env.validation.spec.ts`.

### Deixei de julgar
- README da API (como subir, contas do seed, Swagger): não existe na branch `feat/api`; é escopo da Tarefa 17 (G3). O avaliador vai precisar dele.
- `JWT_SECRET` sem tamanho mínimo, segredo fixo no compose, `0.0.0.0:3333` e `/docs` público em produção: com o cyber-security (decisão do ledger).
- Ordenação feita duas vezes (`orderBy` no repositório Prisma e `toSorted` no use case): é redundante, mas é a regra testada no use case com o repositório falso; deixei como está.
- Rota `/api/demo/grades` e `Device` (Tarefa 16): fora destas tarefas.
- Build real do Dockerfile e execução do job `docker`: sem Docker na máquina; prova só no primeiro PR (ledger).
- Ordem dos alunos no `/me` (por primeiro nome) e qual aluno o app seleciona primeiro: comportamento do mobile, fora desta trilha.

### Veredito da revisão final — branch api
**APROVADO** (0 bloqueantes, 1 importante, 5 sugestões). Suíte, build e smoke verdes; A1–A8 cobertos; contrato idêntico ao consumido pelo mobile.

### Rodada 1 (re-review restrito de `650b5fe..cd07f3f`, 14 commits)

Verificação que eu mesmo rodei (em `api/`, `YARN_IGNORE_PATH=1`):
- `yarn lint` e `yarn tsc`: ok.
- `yarn test`: 20 suítes, 282 testes, todos verdes.
- `yarn test:e2e`: 16 suítes, 117 testes, todos verdes.
- `yarn build`, `./scripts/smoke.sh` (`SMOKE OK`) e `actionlint .github/workflows/api.yml`: ok.
- O worktree ficou limpo.
- `git diff --stat 650b5fe..cd07f3f` dos quatro e2e protegidos (auth, me, students, auth-throttle) saiu **vazio**. O contrato está preservado pelos testes originais. O texto novo do 401 ("Sessão inválida ou expirada.") não quebra nada: os e2e antigos não fixavam a mensagem, e no mobile `"Unauthorized"` só aparece em fixture de teste. O interceptor decide pelo status.

Achados anteriores:
- **[IMPORTANTE] HttpException nos use cases (D18): RESOLVIDO.**
  - Os três use cases não importam mais nada de HTTP:
    - `login.use-case.ts:50` lança `InvalidCredentialsError`;
    - `get-me.use-case.ts:37` lança `GuardianNotFoundError`;
    - `get-report-card.use-case.ts:48,53` lança `ReportCardNotFoundError`.
  - `DomainErrorFilter` (`src/shared/errors/domain-error.filter.ts:23-32`, como `APP_FILTER` em `app.module.ts:27`): `@Catch(DomainError)` só pega erro de domínio, e o resto segue para o filtro padrão do Nest. Ele monta a `HttpException` do mesmo tipo e responde `getResponse()`, que é exatamente `{statusCode, message, error}`. O status vem do `res`, então o pino-http continua logando 4xx como `warn`.
  - Os guards e o `@CurrentGuardian()` seguem com `HttpException`, o que é correto porque são camada HTTP.
- **[SUGESTÃO] Rate limit por IP com Docker/Maestro: ENCAMINHADO, não exigia código nesta branch.** O developer repassou para a Tarefa 14. Ficou mais urgente por causa do achado novo abaixo.
- **[SUGESTÃO] Dependências sem uso: RESOLVIDO.** `api/package.json` não tem mais `ts-node`, `ts-loader`, `tsconfig-paths`, `source-map-support` nem `@eslint/eslintrc`. As que foram para `dependencies` (`prisma`, `tsx`, `dotenv`) têm uso real no boot da imagem (`prisma:setup` + seed). As `resolutions` de `multer` 2.5.0 e `js-yaml` 5.5.0 estão no `yarn.lock` e o CI usa `--frozen-lockfile`.
- **[SUGESTÃO] Padrão do fake e nome do repositório: RESOLVIDO.**
  - `GuardianCredentialsRepository` / `GUARDIAN_CREDENTIALS_REPOSITORY` agora mora em `modules/guardians/repositories/`, exportado por `guardians.module.ts:23`. O `AuthModule` importa o `GuardiansModule` (`auth.module.ts:28`).
  - Os fakes ficam todos em `modules/<m>/testing/`, fora do build pelo `tsconfig.build.json`.
- **[SUGESTÃO] 401 em inglês: RESOLVIDO.** `SESSION_INVALID_MESSAGE` é usada em `jwt-auth.guard.ts:33` (`handleRequest`), no guard de ownership (`:50,60`), no `@CurrentGuardian()`, na strategy e no `GuardianNotFoundError`. O `test/errors.e2e-spec.ts` fixa o corpo exato.
- **[SUGESTÃO] Compose no CI: RESOLVIDO.** O `docker-compose.yml` está nos dois `paths` (`api.yml:8,14`) e o passo `docker compose -f ../docker-compose.yml config --quiet` roda no job docker. O actionlint passou.
- **Adiado "0s" no `JWT_EXPIRES_IN`: RESOLVIDO.** A regex `^[1-9]\d*(s|m|h|d|w|y)$` em `env.validation.ts` recusa `0s`, `0m`, `00d` e `07d`, todos no spec.

Pontos que o developer pediu para olhar:
- **`DomainErrorFilter`:** correto, ver acima. O `kind: 'forbidden'` ainda não tem erro que o use, mas custa uma linha no mapa e não vale achado.
- **`applyDefaults`** (`env.validation.ts:149-157`): só preenche o que está `undefined` depois do `plainToInstance`.
  - Fora de produção, sem a env: `CORS_ORIGINS='*'` e `SWAGGER_ENABLED=true`. O `validEnv` do spec não traz essas envs, então o caso "ausente" está de fato testado.
  - Em produção sem `CORS_ORIGINS`: fica `undefined` e o `@IsString/@IsNotEmpty` recusa, com mensagem que cita a env.
  - `SWAGGER_ENABLED=""` não é `undefined`, então chega ao `@IsBoolean` e é recusado.
  - Compose e `docker-smoke.sh` passam `CORS_ORIGINS="*"` explícito, então a imagem `production` sobe.
- **`skipIf`/`getTracker` do throttler `cpf`** (`auth.module.ts:52-64`, `throttling/login-throttle.ts`):
  - O guard roda antes do `ValidationPipe`, mas o body já foi parseado pelo express.
  - A normalização usa o mesmo `normalizeCpf`/`isCpf` do DTO, então com e sem máscara contam juntos.
  - Corpo sem CPF válido pula o throttler e fica só o limite por IP, o que evita uma chave por string arbitrária.
  - O e2e `auth-throttle-cpf` prova os quatro casos com IP rotativo.
  - Funciona como descrito. O problema é de política, no achado abaixo.
- **e2e do `router.stack`** (`test/ownership-coverage.e2e-spec.ts`): no express 5, `app.router` é o router da aplicação, e `layer.route.path` vem com o prefixo `/api`.
  - O `arrayContaining` das três rotas conhecidas impede que o teste passe com a lista vazia (por exemplo, se o Nest passar a montar sub-routers).
  - A prova de mutação registrada (tirar o `@StudentOwnership()` dá 200) mostra que o teste pega a regressão.
  - Limite conhecido: não cobre `studentId` no corpo, o caso do `/demo/grades` da Tarefa 16, que no ledger já fica com o use case.

Quebra nova no diff da correção:

#### [IMPORTANTE] O limite por CPF conta logins com sucesso: o próprio responsável fica bloqueado 15 min depois de 10 logins certos
- Arquivos: `api/src/modules/auth/auth.module.ts:52-64`, `api/src/config/env.validation.ts` (`LOGIN_THROTTLE_CPF_LIMIT = 10`, `LOGIN_THROTTLE_CPF_TTL_MS = 900000`), `docker-compose.yml` (mesmos valores).
- Problema: o `ThrottlerGuard` incrementa o contador antes do handler, em toda requisição com CPF válido. Não distingue 200 de 401. O limite "anti força bruta" vira um limite de logins por conta: 10 por 15 min, valendo para qualquer IP.
- Cenário: o seed tem só três contas, e quase todo teste usa o Gustavo.
  - Pessoas: o avaliador (ou o qa) faz login/logout no simulador, reinstala o app e testa a senha errada uma ou duas vezes. Em ~15 min passa de 10 requisições com o CPF do Gustavo, e a próxima resposta, até com a senha certa, é 429 "Muitas tentativas…" por até 15 min. É o mesmo efeito de bloqueio que o e2e `auth-throttle-cpf` comprova ("Nem a senha certa entra"), atingindo uso legítimo.
  - Maestro: os 10 flows (Tarefa 14), quase todos começando por login do Gustavo, estouram o limite numa única execução, a menos que o job suba a env.
  - Fora do Maestro, `LOGIN_THROTTLE_CPF_LIMIT` não aparece no compose de forma sobrescrevível (o valor está fixo, sem `${...:-}`). Quem já foi bloqueado tem que editar o arquivo ou esperar.
- Correção sugerida (o chief escolhe):
  - (a) Contar só falhas. Um limitador próprio por CPF (porta `LoginAttemptLimiter` com implementação em memória) é consultado antes do compare e incrementado quando o use case lança `InvalidCredentialsError`, e zera no sucesso. O throttler por IP continua como está.
  - (b) Manter o throttler e relaxar a política. Limite bem maior (por exemplo, 30) e janela menor, mais `${LOGIN_THROTTLE_CPF_LIMIT:-...}` no compose. Precisa também da linha no README/Tarefa 14.
  - Para (a) vale TDD: um e2e com 10 logins certos seguidos e o 11º em 200 falha hoje.

Sem outras quebras no diff da correção. Pontos que conferi e deixei de lado:
- Helmet com CSP sem `upgrade-insecure-requests`: o e2e dos headers passa. Verificar a UI do `/docs` em navegador é ressalva do developer e fica com o qa.
- `iss`/`aud`/`maxAge` no JWT invalidam tokens emitidos antes da troca. É esperado e o app desloga pelo 401.
- `serializers.req` sem query: o pino-http entrega ao serializer o req já serializado. O e2e de logging e o smoke confirmam o redact.
- Dockerfile `prod-deps`: o estágio copia manifests e o `prisma/` antes do `install --production`, e o postinstall tem o `prisma` em `dependencies`. Segue sem build real (CI).

#### Deixei de julgar
- Segredo padrão do compose aceito em produção com aviso: decisão do chief já registrada.
- Política de segurança do helmet, `iss`/`aud`, `TRUST_PROXY=true` recusado: são itens do cyber-security. Só conferi que não quebram contrato nem testes.
- Execução real do `docker build` e do `docker compose config`: sem Docker aqui.

### Veredito da revisão final, Rodada 1
**APROVADO.** 0 bloqueantes. Todos os achados anteriores estão resolvidos ou encaminhados. Há 1 IMPORTANTE novo, no diff da correção: o limite por CPF bloqueia logins legítimos. O chief decide se corrige antes do PR ou registra a política no ledger e no README.

### Rodada 2 (re-review restrito de `cd07f3f..7d16ad0`, 3 commits)

Verificação que eu mesmo rodei (em `api/`, `YARN_IGNORE_PATH=1`):
- `yarn lint` e `yarn tsc`: ok.
- `yarn test`: 22 suítes, 294 testes, todos verdes.
- `yarn test:e2e`: 17 suítes, 119 testes, todos verdes.
- `yarn build`, `./scripts/smoke.sh` (`SMOKE OK`), `actionlint` e `shellcheck scripts/*.sh docker-entrypoint.sh`: ok.
- O worktree ficou limpo.
- `git diff --stat cd07f3f..7d16ad0 -- 'api/test/*.e2e-spec.ts'` mostra só o arquivo novo `auth-throttle-cpf-success.e2e-spec.ts`. Nenhum e2e existente mudou, e o `auth-throttle-cpf.e2e-spec.ts` (força bruta com IP rotativo dá 429) segue verde.

Achados anteriores:
- **[IMPORTANTE] Limite por CPF contava logins certos: RESOLVIDO.**
  - O throttler `cpf` saiu do `ThrottlerModule` e virou o `LoginFailureLimitInterceptor` (`auth/throttling/login-failure-limit.interceptor.ts`) com o `LoginFailureLimiter` em memória.
  - O interceptor só incrementa quando o handler lança `InvalidCredentialsError` (`:49-53`) e zera no sucesso (`:48`). Outros erros, como banco fora, não contam.
  - O e2e novo prova os dois lados com limite 3: 11 logins certos seguidos dão 200, e o login certo zera as falhas anteriores. A 3ª falha seguida bloqueia, inclusive a senha certa.
  - Os limites ficaram sobrescrevíveis no compose (`${LOGIN_THROTTLE_*:-…}`).
- **Use case continua sem HTTP: SIM.** O `login.use-case.ts` não mudou nesta rodada. A contagem fica toda no interceptor (camada HTTP), que só reconhece o erro de domínio. O `ThrottlerException` nasce no interceptor, não no use case.
- **Segredo do compose:** o padrão público saiu. O `docker-entrypoint.sh` gera 48 bytes aleatórios no volume (`umask 077` + `chmod 600`, escrita em `.tmp` + `mv`) e reaproveita nos próximos boots. O `docker-smoke.sh` confere a permissão `600 node`, que o segredo não aparece no log e que é gerado uma vez só. Isso supera a decisão anterior (padrão aceito com aviso). Vale atualizar o ledger.

Quebras novas no diff da correção:

#### [IMPORTANTE] Requisições em paralelo com o mesmo CPF passam todas pelo limite de falhas
- Arquivo: `api/src/modules/auth/throttling/login-failure-limit.interceptor.ts:38-54`.
- Problema: o bloqueio é conferido de forma síncrona antes do handler (`blockedForMs`, `:38`). A falha só é registrada depois que o `bcrypt.compare` termina, no `catchError` (`:51`). Entre uma coisa e outra não há reserva da tentativa. O throttler anterior incrementava o contador antes do handler, então cada requisição contava na hora.
- Cenário: o limite por CPF existe contra força bruta com vários IPs.
  - Com K IPs, o limite por IP permite 5 requisições por minuto em cada um. Um atacante dispara 5·K tentativas simultâneas contra o CPF do Gustavo.
  - Todas leem `blockedForMs = 0`, porque nenhuma falha foi registrada ainda (o compare leva dezenas de ms), e todas são avaliadas.
  - O bloqueio só vale depois da rajada. A cada janela de 15 min são 5·K senhas testadas, em vez de `LOGIN_THROTTLE_CPF_LIMIT` (10). Com K = 100, são 500.
  - Não há teste de concorrência. O e2e `auth-throttle-cpf` manda as requisições em sequência (`await` a cada uma).
- Correção sugerida: reservar a tentativa antes do handler.
  - No limiter, criar `tryAcquire(key)`, que bloqueia se `failures + pendentes >= limit` e senão incrementa `pendentes`.
  - No `InvalidCredentialsError`, a reserva vira falha. No sucesso, `reset`. Em outro erro, libera a reserva (`finalize`).
  - Teste que falha hoje: com limite 3, disparar 6 logins errados em `Promise.all` e esperar pelo menos três 429. Também vale um unit do limiter com duas reservas antes de qualquer `registerFailure`.

#### [IMPORTANTE] `docker-entrypoint.sh` sem `.gitattributes`: no Windows o container não sobe
- Arquivos: `api/docker-entrypoint.sh` (novo, `CMD ["./docker-entrypoint.sh"]` em `api/Dockerfile:67`) e a falta de `.gitattributes` no repo. `git check-attr eol text -- api/docker-entrypoint.sh` dá `unspecified`, e nenhuma branch (`feat/api`, `chore/tooling`, `feat/mobile`, `spec/fiap-school`) tem o arquivo.
- Problema: até a rodada anterior, o CMD era inline no Dockerfile e nenhum script do repo entrava na imagem. Agora o boot depende de um shell script vindo do checkout.
- Cenário:
  - O avaliador clona no Windows com o padrão do Git for Windows (`core.autocrlf=true`). O arquivo sai com CRLF.
  - O `docker compose up --build` copia o script assim para a imagem, e o container morre no boot: o kernel procura `/bin/sh\r` ("no such file or directory"). Mesmo forçando `sh`, o `set -eu\r` falha.
  - O "um comando" do D27 quebra justamente para quem não usa macOS/Linux. O ledger já tratou o Windows como alvo (`start:dev` da Tarefa 6).
- Correção sugerida: `.gitattributes` na raiz com `*.sh text eol=lf` (pode incluir `gradlew` do mobile, que tem o mesmo problema). Opcional como defesa extra: um `RUN sed -i 's/\r$//' docker-entrypoint.sh` no estágio runtime. Não há runner que pegue isso no CI Linux, então basta conferir o `git check-attr` depois da mudança.

Conferido e sem achado:
- `ThrottlerException` lançado de forma síncrona no `intercept`: o Nest leva ao filtro padrão (429 com o corpo e a mensagem de antes). O `Retry-After` é posto antes, e o e2e confirma.
- Os specs do limiter e do interceptor testam comportamento real (relógio injetado, sem mock do limiter). A varredura de chaves vencidas limita a memória.
- O getter `size` existe "para teste e diagnóstico". É pouco código, não vale achado.
- `COPY --chmod=755` exige BuildKit: o Dockerfile declara `# syntax=docker/dockerfile:1`, e o `docker build` do runner e o Docker Desktop usam BuildKit por padrão.
- O `.dockerignore` não exclui o `docker-entrypoint.sh`.
- Um volume antigo sem `jwt-secret` gera um segredo novo no primeiro boot, e os tokens anteriores dão 401 uma vez. É esperado.
- O `umask 077` vale também para o SQLite criado depois. Os arquivos ficam com dono `node`, que é o processo, então não há efeito.

#### Deixei de julgar
- Limite em memória, que não é compartilhado entre instâncias: a API roda numa instância só (SQLite), igual ao throttler de antes.
- Build Docker real e o `docker-smoke.sh`: sem Docker aqui, a prova é o CI.

### Veredito da revisão final, Rodada 2
**APROVADO.** 0 bloqueantes. O IMPORTANTE da rodada 1 está resolvido e o use case continua sem HTTP. Há 2 IMPORTANTES novos, no diff desta rodada: a rajada paralela passa pelo limite por CPF, e o entrypoint quebra com CRLF no Windows. Os dois são correções pequenas. O chief decide se entram antes do PR.

### Rodada 3 (re-review restrito de `7d16ad0..b821797`, 2 commits, última rodada do protocolo)

Verificação que eu mesmo rodei (em `api/`, `YARN_IGNORE_PATH=1`):
- `yarn lint` e `yarn tsc`: ok.
- `yarn test`: 22 suítes, 298 testes, todos verdes.
- `yarn test:e2e`: 18 suítes, 121 testes, todos verdes.
- `test/auth-throttle-cpf-concurrency.e2e-spec.ts` rodado 3 vezes seguidas, isolado: `2 passed` nas três.
- `yarn build`, `./scripts/smoke.sh` (`SMOKE OK`), `actionlint` e `shellcheck scripts/*.sh docker-entrypoint.sh`: ok.
- `git check-attr eol text -- api/docker-entrypoint.sh` dá `eol: lf` e `text: set` (o mesmo vale para `api/scripts/smoke.sh`).
- Worktree limpo.
- Nenhum e2e existente mudou: o diff só acrescenta `auth-throttle-cpf-concurrency.e2e-spec.ts`.

Achados da Rodada 2:
- **[IMPORTANTE] Rajada paralela passava pelo limite por CPF: RESOLVIDO.**
  - `LoginFailureLimiter.tryAcquire` (`login-failure-limiter.ts:39-55`) confere e reserva no mesmo tick, sem `await`. A reserva já conta como falha provisória, e a tentativa recusada não conta.
  - No interceptor (`login-failure-limit.interceptor.ts:39-56`), o `tryAcquire` roda antes do handler:
    - sucesso → `reset`;
    - `InvalidCredentialsError` → a vaga continua contada;
    - outro erro → `release`, que não fica negativo.
  - Login certo segue sem gastar tentativa: reserva e zera em seguida. O `auth-throttle-cpf-success` (11 logins certos dão 200) continua verde sem alteração.
  - Testes:
    - e2e (a): limite 3 e 6 erradas em paralelo, de IPs diferentes, dão exatamente 3×401 e 3×429. O RED registrado com o código da Rodada 2 deu 4×401.
    - Spec do interceptor: prova de forma determinística, com handlers pendentes (`Subject`), que a 4ª requisição é recusada sem chamar o handler e que a senha certa além do limite dá 429.
- **[IMPORTANTE] `docker-entrypoint.sh` sem `.gitattributes`: RESOLVIDO.**
  - O `.gitattributes` na raiz define `*.sh text eol=lf` (mais `gradlew` LF e `*.bat` CRLF). O `check-attr` confirma LF para o entrypoint.
  - O `--renormalize` não mudou nenhum arquivo, porque já estavam todos com LF.
  - A observação do developer sobre o `gradlew.bat` no merge com a trilha mobile está certa e é de baixo custo.
- **Use case continua sem HTTP:** o `login.use-case.ts` não mudou nesta rodada.

Quebra nova no diff da correção: nenhuma. Uma observação de teste:

#### [SUGESTÃO] O caso (b) do e2e de concorrência depende de as 20 requisições chegarem antes do primeiro bcrypt terminar
- Arquivo: `api/test/auth-throttle-cpf-concurrency.e2e-spec.ts:67-81`.
- Problema: se a requisição com a senha certa estiver entre as primeiras e o compare dela (~70 ms) terminar antes de chegarem as últimas, o `reset` apaga a chave. As que chegarem depois reservam numa janela nova, e `count(429) === 10` falha.
- Isso não é bug do produto: depois de um login certo, zerar é o comportamento pedido.
- Cenário: runner de CI lento ou carregado → falso vermelho esporádico no `api.yml`. Aqui passou nas 3 execuções.
- Correção sugerida:
  - Opção 1: deixar o (b) só com senhas erradas, porque o caso da senha certa já está provado no spec do interceptor.
  - Opção 2: trocar `toBe(10)` por `toBeGreaterThanOrEqual(10)` quando houver um 200.
  - Opcional, não exigido nesta rodada.

#### Deixei de julgar
- Execução real do Docker (build multi-stage, entrypoint, `COPY --chmod`, `docker-smoke.sh`) e a CSP do `/docs` num navegador: sem Docker e sem navegador aqui. Ficam para o primeiro CI e para o qa.
- Limite em memória que zera num restart: igual ao throttler e aceitável com uma instância só.

### Veredito da revisão final, Rodada 3
**APROVADO** (0 bloqueantes, 0 importantes abertos, 1 sugestão opcional). Os dois IMPORTANTES da Rodada 2 estão resolvidos, a suíte está verde e o e2e de concorrência passou estável em 3 execuções. A branch api está pronta para o PR do ponto de vista do code review.

## Mensagens
→ chief: branch api aprovada. Decida o IMPORTANTE: tirar `UnauthorizedException`/`NotFoundException` dos use cases (erros de domínio + filtro global, contrato inalterado e fixado pelos e2e), ou registrar no ledger o desvio do D18. As sugestões são baratas (deps mortas, padrão do fake, 401 em português, compose no CI) e podem ir numa leva só junto com o IMPORTANTE. O adiado "0s" não precisa entrar antes do PR.
→ chief (Tarefa 14): no `maestro.yml`, suba a API com `LOGIN_THROTTLE_LIMIT` alto. Do contrário, os flows somam mais de 5 logins por minuto do mesmo IP e recebem 429.
→ developer: se o chief aceitar o IMPORTANTE, os e2e de `auth`, `me` e `students` já fixam status e corpo dos erros. Eles são a rede de segurança para a troca: não mexa neles.
→ chief (Rodada 1): revisão final da api aprovada. Os 6 itens anteriores estão resolvidos (o rate limit por IP foi encaminhado à Tarefa 14), e os e2e protegidos estão intocados. Achado novo IMPORTANTE: `LOGIN_THROTTLE_CPF_LIMIT=10/15min` conta logins com sucesso. O avaliador ou o Maestro, logando várias vezes como Gustavo, recebem 429 até com a senha certa. Decida entre (a) contar só falhas, com limitador próprio acionado pelo `InvalidCredentialsError`, ou (b) relaxar o limite e torná-lo sobrescrevível no compose, documentando no README e no `maestro.yml`.
→ developer (Rodada 1): se o chief pedir (a), comece por um e2e com 10 logins certos seguidos do mesmo CPF e o 11º em 200 (hoje falha). Mantenha o `auth-throttle-cpf.e2e-spec.ts` verde, porque a força bruta com senha errada continua tendo que dar 429.
→ qa: abra `/docs` no navegador e confira o console (CSP do helmet). Ao testar login/logout várias vezes como Gustavo, espere 429 depois de 10 tentativas em 15 min (comportamento atual).

## Tarefa 8b

Diff: `revisao/tarefa-8b.diff` (`f8e0e5f..36b80bb`, BASE `c5612af`). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 28 suítes e 173 testes, sem aviso de "failed to exit" e sem aviso de `act`. Olhei as tiras de frames.
- **Login**: preto, depois o wipe com a linha teal revelando F-I-A-P, o pop do selo e o logo subindo até o lugar do logo do Login, sem salto no último quadro.
- **App**: entrada, depois fade + escala, depois a Agenda.

O que conferi contra o `01-design.md` 3.1 e 4.1:
- **Timeline** (`motion.splash` + `useSplashAnimation.ts`): bate número a número.
  - Wipe com 80 de atraso, 600 ms de duração e destino em 308, na bezier pedida.
  - Linha teal com opacidade 80–160 / 560–680 (a conta `600 − 80 − 120` dá 560).
  - Escala do grupo de 0,96 a 1 em 800 ms; pop do selo em 620 com o spring pedido.
  - Loop com o segmento de −25% a 100% do trilho em 1000 ms (`withRepeat` sem reverso) e o selo respirando 1 → 1,04 em 1600 ms.
  - Saída para o Login em `slow` com bezier(0.2, 0, 0, 1); para os outros destinos, 250 ms `easeIn` com escala 0,92.
- **Só transform/opacity**: a máscara anda por `translateX`. Os 10 shared values (decisão registrada) não animam layout.
- **Worklet → JS**: o `done` é `'worklet'`, só chama `scheduleOnRN(onFinished)` com `finished === true`, e uma saída interrompida não navega.
- **setState durante a animação**: só dois. O `showLoader` em 1500 ms, depois do fim da entrada. O `destination`, que dispara a saída. Nenhum por frame.
- **Ordem `reset` → `finishSplash`** (`useSplashViewModel.ts`, `onExitFinished`): está certa. Com o `reset`, a rota atual vira o destino ainda com a Splash declarada. Só depois a Splash sai da lista. Na ordem inversa, tirar a rota atual faria o navigator escolher sozinho a primeira tela do grupo.
- **Logout não volta à splash**: o `splashDone` fica no `boot.store`, que não é persistido. Tem teste no `App.test`.
- **401 no `/me` de boot**: o interceptor espera o `signOut('expired')` antes de relançar (`onUnauthorized` recebe o token do request, que é o atual). O grupo do Login já está declarado quando o `reset` acontece. O teste confere `signedOut`/`expired` e o keychain vazio.
- **Splash nunca presa**: o `/me` tem 8 s de timeout e há uma trava de 10 s com `decide` idempotente. O `waitForSession` desinscreve no abort. A promessa não tem caminho de rejeição sem tratamento.
- **`fromSplashOptions`**: `animation: 'none'` só quando a rota tem `fromSplash`. Login ↔ App continuam com `fade`. O param `fromSplash` do App fica junto do `screen` aninhado.
- **Acessibilidade**: `splash-logo` com `image` e "FIAP School", camadas internas escondidas, `splash-loading` como `progressbar` "Carregando", acessível só com o trilho visível.
- **Nativo**: o storyboard e os drawables agora são só fundo preto com um PNG transparente de 4×4. No Android 12+, o ícone da splash do sistema também fica transparente pelo `Theme.BootSplash`.

### [IMPORTANTE] Com "reduzir movimento" ligado, os fades da splash e do Login não acontecem: viram cortes
- Arquivo: `mobile/src/features/splash/useSplashAnimation.ts:60`, `:119`, `:174`; `mobile/src/features/auth/LoginScreen.tsx:30`
- Problema: no reanimated 4, um `withTiming` sem `reduceMotion` e um layout animation sem `.reduceMotion(...)` usam `ReduceMotion.System`. Conferi em `node_modules/react-native-reanimated/src/animation/utilCommon.ts:121-126` e `:171-173`, e em `BaseAnimationBuilder.ts:14`: com o ajuste do sistema ligado, a animação pula direto para o valor final. O caminho de reduzir movimento foi escrito justamente para esse caso, então todos os fades dele somem.
  - `groupOpacity 0 → 1` em 200 ms (`fadeInReduced`).
  - Saída `opacity → 0` em 150 ms.
  - Trilho `opacity → 1` em `fast`.
  - `FadeIn.duration(motion.fast)` do Login com `fromSplash`.
- Cenário: iPhone com Ajustes → Acessibilidade → Movimento → Reduzir movimento.
  - O logo aparece de uma vez no primeiro frame, em vez do fade de 200 ms.
  - Em 600 ms o grupo some de uma vez, e o Login monta com o logo já à vista, sem o `FadeIn(150)`.
  - O `01-design.md` 3.1.6 pede esses fades e diz "Opacidade não é movimento".
  - Os testes do Jest não pegam, porque o reanimated é mock, e o developer registrou que o reduzir movimento não foi gravado.
- Correção sugerida: `reduceMotion: ReduceMotion.Never` nos `withTiming` de opacidade do ramo `reducedMotion` (e no do trilho), e `FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never)` no Login com `fromSplash`. Os de movimento (wipe, escala, `translateY`) já ficam fora desse ramo. Prova: gravar a splash no simulador com reduzir movimento ligado (`xcrun simctl ui <udid> ...` ou pelo Ajustes) e anexar como evidência.

### [SUGESTÃO] Trava de 10 s com o keychain pendurado manda ao Login, mas um `bootstrap` atrasado depois leva às abas sem `/me`
- Arquivo: `mobile/src/features/splash/useSplashViewModel.ts:112-115`
- Problema: na trava, o status `loading` (o keychain ainda não respondeu) é tratado como "sem token" e vai para o Login, que é o que o design pede. Mas a sessão continua em `loading`. Se o `bootstrap` resolver depois com token, o status vira `signedIn`, o grupo do Login sai da árvore e o navigator abre o `App` sozinho. Esse `App` não passou pelo `/me`, então NoStudent e BootError não são considerados.
- Cenário: keychain lento, mais de 10 s (Keystore travado no Android). O usuário vê o Login e, segundos depois, as abas aparecem sem ele fazer nada. Se o responsável não tiver aluno, cai na Agenda vazia em vez do NoStudent.
- Correção sugerida: na trava sem token, fixar a sessão como `signedOut` (ex.: `useSessionStore.setState({ status: 'signedOut' })`, ou um `signOut` sem motivo visível) e fazer o `bootstrap` ignorar o resultado se o status já não for `loading`. Teste com fake timers: keychain resolve com token em 11 s → continua no Login.

### Deixei de julgar
- 10 shared values em vez de 5 (decisão 8): a regra que importa (só transform/opacity, nada de JS) está cumprida.
- `logoBadgeBleed` e `splashTrack` fora do design: tokens no tema, justificados (antialias visto no vídeo e "1 px" do design).
- O mínimo de 1200 ms conta a partir da montagem do ViewModel, não do primeiro frame (o `onLayout`). A diferença é de poucos ms e o design não distingue.
- `BootError`/`NoStudent` como placeholders com SAIR lendo o store: são das Tarefas 10 e 13.
- Loop, NoStudent, BootError e reduzir movimento sem vídeo: cobertos por teste de ViewModel e de App. O reduzir movimento entra no IMPORTANTE acima.
- `testID` `login-logo` fora da tabela 7: registrado pelo developer, inofensivo.
- Android: drawables transparentes sem build local (prova no CI da T13).

### Veredito da Tarefa 8b
- **Spec ✅**: splash nativa só preta, sem piscar; splash JS com a timeline da 3.1.3 e o loop da 3.1.4. Mínimo 1200 (600 com reduzir movimento), `/me` com 8 s e trava de 10 s. Saídas para Login (logo até a posição do Login, conferido no frame), App, NoStudent e BootError. `scheduleOnRN` no fim. TestIDs e a11y da 3.1.8. Os testes pedidos (ViewModel decide o destino e respeita o mínimo; render com `splash-screen`) têm RED registrado.
- **Qualidade: APROVADO** (0 bloqueantes); 1 importante (fades do reduzir movimento anulados pelo `ReduceMotion.System` padrão) e 1 sugestão.

### Rodada 1

Diff: `36b80bb..7ce664d` (1 commit). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 29 suítes e 182 testes. Numa das 3 execuções apareceu o aviso intermitente de `act` (`HookContainer`), que o developer já registrou como anterior à tarefa (`useReportCardQueries`). Nas outras 2 ele não voltou, e o diff não toca nesse arquivo.

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| IMPORTANTE: fades do reduzir movimento viram cortes | **RESOLVIDO** | `useSplashAnimation.ts`: `keepWithReducedMotion = { reduceMotion: ReduceMotion.Never }` nos `withTiming` de opacidade (entrada reduzida, trilho e saída). O `FadeIn(150)` do Login com `fromSplash` agora usa `.reduceMotion(ReduceMotion.Never)`. Escala, wipe e `translateY` continuam com o padrão `System`, e fora do ramo reduzido, como manda a 3.1.6. O teste novo só confere a config passada ao `withTiming`, porque o reanimated é mock no Jest. A prova de comportamento é o vídeo: extraí os frames de `tarefa-8b-splash-reduce-motion.mp4` (10 fps) e o logo aparece num fade parcial, fica no centro sem wipe nem escala, some num fade (há um frame a meia opacidade) e o Login entra com o logo já no topo. |
| SUGESTÃO: keychain responde depois da trava | **RESOLVIDO** | `useSplashViewModel.ts`: na trava sem `signedIn`, chama `bootstrapTimedOut()` antes do `decide('login')`. `session.store.ts`: o `bootstrapTimedOut` só fixa `signedOut` a partir de `loading`, e o `bootstrap` ignora a resposta se o status já saiu de `loading`. Dois testes cobrem os dois lados (o `bootstrap` atrasado não muda uma sessão decidida; `bootstrapTimedOut` não derruba um `signedIn`). |

**Balão amarelo do vídeo:** é aviso de dev, não erro do app. O texto do LogBox é o genérico ("Open debugger to view warnings."). O reanimated 4 emite, só em `__DEV__`, `Reduced motion setting is enabled on this device. This warning is visible only in the development mode...` (`node_modules/react-native-reanimated/src/animation/utilCommon.ts:76`), e o balão aparece no momento em que a primeira animação roda com o ajuste ligado. Não abri o debugger para ler a mensagem, então a origem é dedução, mas é a única fonte de `warn` nesse caminho: o logger do app usa `info` para os eventos esperados desde a Tarefa 8.

Nenhuma quebra nova no diff. Observação, sem achado: com o `bootstrap` ignorado, o token lido do keychain fica na cópia em memória do `secureStorage` enquanto a sessão está `signedOut`. Só o login (rota pública, sem Bearer) roda nesse estado, e o `signIn` sobrescreve o token, então não há efeito.

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes, 0 pendentes).

## Mensagens
→ chief: Tarefa 8b aprovada. O IMPORTANTE é de acessibilidade: com "reduzir movimento" ligado, todos os fades que o design pede no lugar das animações viram cortes, porque o reanimated 4 pula até `withTiming` de opacidade quando a config não diz `ReduceMotion.Never`. A correção é de 4 linhas. Vale corrigir agora e gravar o vídeo com reduzir movimento.
→ developer: no ramo `reducedMotion` do `useSplashAnimation` (linhas 60, 119, 174) e no `FadeIn` do Login com `fromSplash` (linha 30), use `ReduceMotion.Never`. A sugestão do keychain lento é opcional: fixar `signedOut` na trava sem token.
→ developer da Tarefa 9: todo `entering`/`withTiming` que o design manda manter com reduzir movimento (fades) precisa de `ReduceMotion.Never`. O padrão do reanimated é pular.
→ chief (Rodada 2): o limite por CPF agora conta só falhas (resolvido, e2e de 11 logins certos), o use case segue sem HTTP e os e2e existentes estão intocados. Há 2 IMPORTANTES novos. (1) A rajada paralela passa pelo limite: a checagem é feita antes do handler e a falha só é registrada depois do bcrypt, então a correção é reservar a tentativa antes do handler. (2) O `docker-entrypoint.sh` não tem `.gitattributes`: clone no Windows com autocrlf gera CRLF e o container não sobe; a correção é `*.sh text eol=lf`. O segredo gerado no volume substitui a decisão anterior do segredo padrão: atualize o ledger.
→ developer (Rodada 2): para (1), comece por um e2e com limite 3 e 6 logins errados em `Promise.all`, esperando pelo menos três 429 (hoje falha). Use `tryAcquire`/reserva no limiter, liberada no `finalize` para erros que não são de credencial. Para (2), crie o `.gitattributes` na raiz e confira com `git check-attr eol -- api/docker-entrypoint.sh`.
→ cyber-security: a concorrência no `LoginFailureLimitInterceptor` está no seu escopo também. Confira se a reserva proposta fecha o caso.
→ chief (rodada 1): Tarefa 8b sem pendências. Os fades com reduzir movimento estão provados no vídeo, e o keychain atrasado não leva mais às abas. O balão amarelo é o aviso de dev do reanimated sobre reduzir movimento.
→ chief (Rodada 3): revisão final da api aprovada, sem pendências bloqueantes nem importantes. A reserva síncrona fecha a rajada paralela (e2e 3×401/3×429, estável em 3 execuções) e o `.gitattributes` garante LF no entrypoint. Fica 1 sugestão opcional: o caso (b) do e2e de concorrência depende de tempo e pode falhar esporadicamente num CI lento. Registre no ledger se não for corrigir. Ao juntar as trilhas, rode `git add --renormalize mobile/android/gradlew.bat`.

## Tarefa 9

Diff: `revisao/tarefa-9.diff` (`7f69878..b451016`, BASE `7ce664d`). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 32 suítes e 220 testes, sem aviso de `act` nem de "failed to exit". Comparei `evidencias/tarefa-9-estados/lado-a-lado.png` com `docs/figma/screens/01-login.png`. Os 5 estados batem: posição do logo, CPF/SENHA, linha cinza → branca, SENHA em negrito com foco, texto do botão cinza → preto, spinner no lugar do texto e o erro teal em 2 linhas. A única diferença é a máscara da senha, `•` no lugar de `*`, que é a do sistema.

O que conferi:
- **MVVM**: `LoginScreen` só importa componentes, `strings`, `useShakeStyle` e o `useLoginViewModel`, nada de `services/` ou axios. A mutation fica no ViewModel por `useLoginMutation`.
- **RHF + zod**: `useForm` com `zodResolver(loginFormSchema)` e `mode: 'onChange'`. O botão depende de `formState.isValid` (CPF com DV válido e senha não vazia, M1). O envio passa por `handleSubmit`, com guarda contra envio duplo.
- **`shakeKey` derivado de `submittedAt`**: está correto. A cada `mutate`, o erro some (vira 0) e volta com um `submittedAt` novo. Então errar duas vezes seguidas treme duas vezes. O `reset()` ao editar zera o valor. O shake fica de fora em `canceled` e com reduzir movimento.
- **`keyboardVerticalOffset = -insets.bottom`** (`Screen.tsx:82`): fiz a conta com o `KeyboardAvoidingView.js:108` do RN. `keyboardY = screenY − offset`, então o padding fica menor em `insets.bottom` e a faixa do inset do botão vai para trás do teclado. No iOS, o texto do botão encosta no teclado, como pretendido. O Android está no IMPORTANTE abaixo.
- **`ThemedTextInput`**: `createRestyleComponent` com `createVariant('textVariants')` + `spacing` sobre `TextInput`, tipado com `ref`. A variante responsiva `inputValue` já foi verificada na Tarefa 7, e não sobra cor nem espaço literal.
- **Reduzir movimento**: `ReduceMotion.Never` só no ramo `fromSplash` + reduzido (logo, campos e botão em fade, como na 3.1.6). Vindo do logout, o `System` segue o cabeçalho da seção 4. O erro aparece sem animação e é anunciado, e não há shake.
- **Acessibilidade**: o rótulo visual fica escondido e o campo é lido como "CPF" (hint "Somente números") ou "Senha". O botão lê "Fazer login" e "Entrando", com `{disabled, busy}`. O erro é lido sem `\n`, com `key={message}`: remonta e anuncia de novo quando o mesmo erro volta depois de um envio. Alvos: o botão tem 60 de altura.
- **Senha nunca logada**: o interceptor loga só método, URL, status e kind. O RHF não loga. Nenhum `logger` recebe os valores do formulário.
- **Componentes para as Tarefas 10–12**: `Screen` (edges, scroll, keyboard, footer, coluna de tablet), `PrimaryButton`, `UnderlineInput`/`CpfInput` e `ButtonContainer` (primary/secondary) com API enxuta e testIDs derivados.

### [IMPORTANTE] No Android com edge-to-edge, o teclado cobre o botão FAZER LOGIN
- Arquivo: `mobile/src/components/Screen.tsx:79` (`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`), `mobile/android/gradle.properties:44` (`edgeToEdgeEnabled=true`)
- Problema: a premissa "Android: `adjustResize` faz o trabalho" (comentário da linha 78 e design 3.2) não vale com o edge-to-edge ligado desde a Tarefa 7.
  - Com a janela desenhando por baixo das barras (`setDecorFitsSystemWindows(false)`, `WindowUtil.kt:167` do RN), o Android não redimensiona a janela pelo `adjustResize`. O app precisa tratar o inset `ime` sozinho.
  - O RN 0.88 só emite `keyboardDidShow` com `screenY` (`ReactRootView.java:934-965`). Ele não aplica padding.
  - Com `behavior` indefinido, o `KeyboardAvoidingView` não faz nada no Android.
- Cenário: Android 11+, tocar no CPF. O teclado sobe por cima do rodapé, e o botão (colado na base) e parte da senha ficam atrás dele. O design (3.2: "O botão nunca fica escondido") e o flow do Maestro que toca no `login-submit-button` com o teclado aberto falham.
- Correção sugerida: `behavior="padding"` também no Android. O `screenY` do RN já vem do topo do teclado. O `keyboardVerticalOffset = -insets.bottom` continua certo, porque no Android o inset de baixo é a barra de navegação, que o teclado cobre. Outra saída é o `react-native-keyboard-controller`. Atualize o comentário. ⚠️ Sem JDK aqui, a prova é o qa num emulador Android (ou o CI da T13 com um teste do Maestro).

### [SUGESTÃO] Erro do login pode não ser anunciado no Android
- Arquivo: `mobile/src/features/auth/components/LoginErrorMessage.tsx:23`, `:43`
- Problema: no Android, o anúncio depende só de `accessibilityLiveRegion="polite"` num `Text` que acabou de ser montado. O TalkBack anuncia mudança de conteúdo de uma região viva que já existe. A entrada de uma view nova com a região já marcada costuma não ser anunciada.
- Cenário: TalkBack ligado, senha errada. A mensagem aparece na tela sem ser lida, ao contrário do design 6.4 ("anunciados uma vez quando aparecem").
- Correção sugerida: chamar `AccessibilityInfo.announceForAccessibility(spoken)` nas duas plataformas, ou manter um contêiner com a live region sempre montado e trocar só o texto dentro dele. Conferir com TalkBack no qa.

### [SUGESTÃO] CPF e senha ficam no cache de mutations do React Query
- Arquivo: `mobile/src/features/auth/api/useLoginMutation.ts:18`
- Problema: o `useMutation` guarda as `variables` (`{cpf, password}`) no `MutationCache` enquanto há observador e depois por mais `gcTime` (5 min por padrão). Hoje isso só fica em memória.
- Cenário: na Tarefa 13 entra o plugin do React Query no Reactotron (adiado no ledger). Ele lista as mutations com as variáveis, então a senha aparece em claro na ferramenta. É o mesmo tipo de vazamento da `cause` corrigida na Tarefa 8.
- Correção sugerida: `gcTime: 0` na mutation de login (some assim que o Login desmonta), e na T13 configurar o plugin para não serializar `variables` de mutation. Registrar no ledger como requisito da T13.

### Deixei de julgar
- Responsável sem aluno indo para a Agenda depois do login: decidido no ledger para a Tarefa 10.
- 5xx com o texto de servidor e shake em todo erro de envio: decisões aceitas no ledger.
- iOS `number-pad` sem a tecla "próximo" e a senha perdendo o foco depois do erro: ressalvas do developer, coerentes com o design ("não abrir o teclado sozinho").
- Máscara aplicada duas vezes (`CpfInput` e ViewModel): é idempotente e foi justificada (componente reutilizável).
- Teclado do iOS não visto no vídeo (simulador headless): a conta do offset está conferida acima. A prova visual fica com o qa.
- `App.test` de integração do login sem RED (caracterização), e testIDs extras (`login-content`, `-line`).
- Logo em PNG 1× (borrado): já está no ledger.
- Versões do RHF e do resolver.

### Veredito da Tarefa 9
- **Spec ✅**: M1 (máscara progressiva limitada a 11 dígitos, botão só com CPF válido e senha), erro 401 com o texto do Figma, M2 (sessão persistida, vídeo de reabertura direto na Agenda), os 5 estados do Figma, as animações da 4.1/4.2 e os testes que falham primeiro (`useLoginViewModel` e `CpfInput`) com RED registrado.
- **Qualidade: APROVADO** (0 bloqueantes); 1 importante (teclado no Android com edge-to-edge) e 2 sugestões.

### Rodada 1

Diff: `b451016..473626f` (1 commit). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 34 suítes e 227 testes, sem aviso de `act` nem de "failed to exit".

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| IMPORTANTE: teclado cobre o botão no Android | **RESOLVIDO** (falta prova no aparelho) | `Screen.tsx`: `behavior="padding"` nas duas plataformas, e o comentário agora explica o edge-to-edge. No Android, o `screenY` que o RN manda no `keyboardDidShow` (modo `adjustResize`) é o fundo do `getWindowVisibleDisplayFrame`, ou seja, o topo do teclado. Então o `KeyboardAvoidingView` calcula o padding certo, e o `-insets.bottom` tira só a barra de navegação que o teclado já cobre. O `Screen.test` novo confere `padding` e o offset. ⚠️ Sem JDK aqui: o qa precisa ver num emulador Android que o botão fica logo acima do teclado e que não sobra espaço em dobro. |
| SUGESTÃO: erro não anunciado no Android | **RESOLVIDO** | `LoginErrorMessage.tsx`: `announceForAccessibility(spoken)` nas duas plataformas e sem a live region, então não há leitura dupla. O efeito depende de `spoken` e o componente remonta a cada erro (`key`), então cada erro novo é anunciado uma vez. No Android 13+ a API está marcada como obsoleta, mas continua funcionando. O teste novo cobre o anúncio e a ausência da live region. |
| SUGESTÃO: CPF e senha no cache de mutations | **RESOLVIDO** | `useLoginMutation.ts`: `gcTime: 0`. A mutation (com as `variables`) sai do `MutationCache` quando o Login desmonta. O teste novo confere o cache vazio depois do unmount. A regra do plugin do Reactotron já está no ledger para a T13. |

Nenhuma quebra nova no diff.

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes). Fica pendente só a confirmação do teclado e do TalkBack num emulador Android pelo qa.

## Mensagens
→ chief: Tarefa 9 aprovada. O IMPORTANTE é o teclado no Android: com `edgeToEdgeEnabled=true` (Tarefa 7), o `adjustResize` não redimensiona a janela e o `KeyboardAvoidingView` está desligado no Android, então o botão fica atrás do teclado. A correção é uma linha (`behavior="padding"` nas duas plataformas), mas só dá para provar num emulador Android.
→ chief: registrar no ledger, para a T13, que o plugin do React Query no Reactotron não pode mostrar `variables` de mutation (senha do login).
→ developer: `Screen.tsx:79` com `padding` também no Android (o offset negativo continua certo) e o comentário atualizado. Sugestões opcionais: `announceForAccessibility` também no Android e `gcTime: 0` na mutation de login.
→ qa: conferir o teclado no iOS (botão logo acima do teclado) e, se houver emulador Android, o mesmo lá. Com TalkBack, conferir se o erro do login é lido.
→ chief (rodada 1): Tarefa 9 sem pendências de código. O teclado do Android e o TalkBack só se provam num emulador Android (qa).

## Tarefa 10

Diff: `revisao/tarefa-10.diff` (`4334db2..d5b5c66`, BASE `473626f`). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 46 suítes e 288 testes. Saiu 1 aviso de `act`, o intermitente de `useAgendaQuery`, anterior a esta tarefa. Comparei `tarefa-10-lado-a-lado.png` com `02-aulas.png` e `04-mudanca-aluno.png`. Barra (logo, TROCAR PERFIL, SAIR com ícone), "Olá, **GUSTAVO**", bloco do aluno, tab bar com ícone e rótulo teal na ativa, seleção com FECHAR teal e card atual com borda teal: tudo bate. A ordem Joana/Rafael é a da API (decisão no ledger, T16).

O que conferi:
- **Ordem das rotas no `RootStack`** (Decisão 1): o raciocínio está certo. O router guarda o `initialRouteName` do 1º render, e numa troca de grupo o `getStateForRouteNamesChange` cai em `routeNames[0]`. Pôr `NoStudent` antes de `App` só quando o `/me` do cache não tem aluno resolve sem mexer na splash. O `useAuthenticatedLanding` lê o cache sem se inscrever, mas o `useLoginMutation` grava o `/me` **antes** do `signIn`, e o re-render do RootStack vem justamente do `signIn`. A ordem está garantida, e o `App.test` do Carlos cobre o caso.
- **`Authorization` explícito no interceptor**: o risco é baixo. Hoje só o `/me` do login usa header explícito. Com ele, o request não leva o token da memória e o meta guarda `token: null`, então um 401 desse `/me` chama `expireSession(null)`, que não faz nada (e não há sessão aberta ainda). O efeito colateral é um caso raro: um 401 nesse `/me` aparece como "Usuário ou senha inválida". Não abro achado.
- **`useSelectStudentViewModel`**: o timer é limpo no unmount. Se o modal fecha (voltar do Android) durante o atraso, nada é trocado. Um 2º toque é ignorado, e escolher o aluno atual só fecha. Está coberto com fake timers.
- **Logout limpa tudo**: `signOut('manual')` apaga keychain, `selectedStudentId`, `guardian` e o cache do React Query. O botão fica desabilitado enquanto sai, e funciona offline.
- **Aluno salvo inválido**: `resolveSelectedStudent` cai no primeiro aluno do `/me`, e o `useSessionStudent` grava a troca, de forma idempotente entre os vários consumidores. O caso "outro responsável no mesmo aparelho com um id antigo no mmkv" também cai no primeiro.
- **Cache por aluno**: as keys de agenda e boletim levam o `studentId` (Tarefa 8), e o Header e as telas leem o mesmo `student.id` do `useSessionStudent`. A troca não mistura cache.
- **Pós-login com `/me`**: se o `/me` falha, o login falha sem gravar nada. Se o keychain falha, o `/me` sai do cache.
- **BootError**: o TENTAR DE NOVO usa o `/me` da splash (8 s, sem retry) e faz `reset` para `App` ou `NoStudent`. Com 401, o interceptor encerra a sessão. Com `canceled`, nada acontece. Qualquer outro erro faz o bloco tremer.
- **SVG pelo tema**: todo `fill` é `{color}`, e as cores vêm de `colors.text`/`primary`. Não há hexadecimal fora de `palette.ts`. Na tab bar, a cor muda por crossfade de duas camadas (opacidade), não por animação da cor do SVG.
- **MVVM**: as telas usam ViewModels e componentes. Nenhum import de `services/`.

### [IMPORTANTE] TROCAR PERFIL e SAIR têm alvo de toque da altura do texto (~15 pt), não 48
- Arquivo: `mobile/src/components/ActionBar.tsx:51`, `:63`, `:83`
- Problema: os `Pressable` são itens de uma linha com `alignItems="center"` (`:51`), então não esticam e ficam da altura do conteúdo. O `Box` interno tem `height="100%"`, mas porcentagem de um pai sem altura definida vira `auto` no Yoga. O resultado é que a área tocável de cada ação tem a altura do texto `caption` (lineHeight 15), sem `hitSlop`. O comentário do componente ("cada ação ocupa a altura da barra (48)… o alvo passa de 44 × 44") e o design 6.3 ("`Pressable` com 48 de altura") não se cumprem. O teste do Header confere só a altura da barra, não a do botão.
- Cenário: toque no SAIR 10 pt acima ou abaixo do texto, ainda dentro da barra de 48: não acontece nada. Isso vale para todas as telas com a barra (abas, NoStudent, BootError) e reprova o critério de alvo ≥ 44 do pedido.
- Correção sugerida: esticar o `Pressable` até a altura da barra, com `style={{ height: '100%' }}` no próprio `Pressable` (o pai tem altura definida) ou `alignItems="stretch"` na linha. Outra saída é `minHeight={sizes.touchTarget}` no `Box` interno, sem o `height="100%"`. Teste: o `Pressable` de SAIR com altura `actionBar` (ou `minHeight ≥ touchTarget`) no estilo achatado.

### [SUGESTÃO] Foco do leitor de tela não vai para o título ao abrir a seleção de aluno
- Arquivo: `mobile/src/features/students/SelectStudentScreen.tsx` (título `accessibilityRole="header"`)
- Problema: o design 6.4 pede "o foco começa no título". Hoje o foco inicial fica com o sistema, que costuma ir para o FECHAR, o primeiro elemento na ordem visual do topo. O developer registrou isso como ressalva.
- Cenário: VoiceOver/TalkBack, TROCAR PERFIL. O leitor anuncia "Fechar, botão" em vez de "Escolha o perfil que você quer visualizar", e o usuário não sabe em que tela entrou.
- Correção sugerida: `ref` no título e, no `useEffect` de montagem (ou no `transitionEnd` da navegação), `AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref))`. Pode ficar para a T13 (acessibilidade), registrado no ledger.

### [SUGESTÃO] Opacidade de "pressionado" literal
- Arquivo: `mobile/src/components/ActionBar.tsx` (`opacity: pressed ? 0.6 : 1`, duas vezes)
- Problema: número mágico repetido fora do tema. As Tarefas 11 e 12 (dropdown, acordeão) vão precisar do mesmo feedback.
- Correção sugerida: um token (`motion.pressedOpacity` ou `sizes`) e reutilizar.

### Deixei de julgar
- Ordem dos alunos no `/me` (Joana antes de Rafael): decisão do ledger, corrigida na T16.
- `fullScreenModal` sem o gesto de descer no iOS: decisão do ledger.
- Toast do LogBox "Sending onAnimatedValueUpdate…": aviso de dev de lib, já presente antes desta tarefa.
- Conteúdo provisório das abas com texto literal fora do `strings.ts`: é da T11/T12.
- testIDs extras fora da tabela 7 (`header-action-bar`, `select-student-close`, `tab-*-active-layer`, `no-student-empty`, `boot-error`): inofensivos.
- `react-native-svg` 15.16.0 com 12 dias de publicação: é a versão do Expo 58, mudança nativa declarada.
- Shake do BootError e spinner do TENTAR DE NOVO sem vídeo: cobertos por teste de ViewModel.
- Android sem build.

### Veredito da Tarefa 10
- **Spec ✅**:
  - **M3/R5**: Header com o 1º nome do responsável, nome, turma, RM e período do aluno, TROCAR PERFIL só com mais de 1 aluno e SAIR.
  - **R6**: tab bar Agenda ⇄ Boletim.
  - **M6/R9**: seleção de aluno fora do rodapé, com nome completo, RM e turma, que volta à aba de origem.
  - **M7**: tela de sem aluno com SAIR, pelo login e pela abertura.
  - **Logout (M2)**, BootError real e o pós-login com `/me`.
  - **Testes**: com RED registrado e mutações.
- **Qualidade: APROVADO** (0 bloqueantes); 1 importante (alvo de toque da barra) e 2 sugestões.

### Rodada 1

Diff: `d5b5c66..1092f58` (1 commit). Rodei no worktree (`mobile/`, árvore limpa): `yarn lint` deu 0, `yarn tsc` deu 0 e `yarn test` passou com 46 suítes e 289 testes, sem aviso de `act` nem de "failed to exit".

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| IMPORTANTE: alvo de toque de TROCAR PERFIL/SAIR | **RESOLVIDO** | `ActionBar.tsx`: a altura agora é `sizes.actionBar` (48) no próprio `Pressable`, e o `Box` interno usa `flex={1}`, que preenche essa altura (coluna) e centraliza o texto. O `height="100%"` sem base sumiu também da linha. Largura: `paddingHorizontal: s` dos dois lados mais o texto. O SAIR, o menor, tem texto + `xs` + ícone de 10 + 16, acima de 44. O teste novo do `Header` confere a altura no estilo achatado de cada `Pressable`. |
| SUGESTÃO: opacidade de pressionado literal | **RESOLVIDO** | `motion.pressedOpacity: 0.6`, usado no `ActionBar` (2×) e no `SecondaryButton`. Não sobrou `0.6` literal. |
| SUGESTÃO: foco do leitor na seleção | adiado (ledger → T13) | — |

Nenhuma quebra nova no diff.

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes; o foco do leitor está adiado no ledger).

## Mensagens
→ chief: Tarefa 10 aprovada. O IMPORTANTE é de acessibilidade e afeta todas as telas com a barra: TROCAR PERFIL e SAIR só respondem na altura do texto (~15 pt), porque o `height="100%"` interno não resolve dentro de um `Pressable` sem altura. A correção é uma linha. O foco inicial da seleção pode ir para a T13 (registrar no ledger).
→ developer: em `ActionBar.tsx`, o `Pressable` precisa da altura da barra (`style={{height:'100%'}}` nele, ou `alignItems="stretch"` na linha da `:51`), com um teste que confira a altura do botão e não só a da barra. Opcional: token para a opacidade de pressionado.
→ developer da Tarefa 11/12: o feedback de pressionado e os alvos ≥ 44 do dropdown e do acordeão precisam de altura explícita no próprio `Pressable` (ou `minHeight`), não num filho com `height="100%"`.
→ chief (rodada 1): Tarefa 10 sem pendências. O alvo de toque da barra tem 48 de altura no próprio Pressable, coberto por teste, e o `pressedOpacity` virou token. O foco do leitor de tela fica para a T13.

## Tarefa 11

Diff: `revisao/tarefa-11.diff` (BASE `1092f58`, commits `f43a919..3b4b697`, 22 arquivos). Abri os arquivos inteiros no worktree e, fora do diff, só o que um risco pedia: `ErrorState`/`EmptyState` (contrato `retrying`/`shakeKey`), `useAgendaQuery` e `queryClient` (retry e `pending` no refetch), `utils/dates.ts` (data local), `theme.ts`/`sizes.ts` (altura do `Card` e tokens) e o seed da API (se algum aluno pode vir sem dias).

Verificação no worktree (`mobile/`, árvore limpa sobre `3b4b697`): `yarn lint && yarn tsc && yarn test` terminou com exit 0, **53 suítes e 336 testes**. Bate com o `02-dev.md`.

Conferido e sem achado:
- **D35:** `initialAgendaDate` usa `getDay()` de hoje contra `weekdayOf` (data local, sem `new Date("AAAA-MM-DD")`). Os 7 dias da semana estão testados, no util e no ViewModel.
- **Dia preso ao aluno:** a escolha é zerada no render quando muda o `studentId`, e a ida e volta está coberta. Uma data fora da agenda é ignorada.
- **`retrying` como estado próprio:** o `status` fica em `error` enquanto o refetch volta a `pending`. O spinner sai do `SecondaryButton` do `ErrorState`, e o shake só acontece em retry que falha (zera ao sair do erro). Os dois testes seguram a resposta com uma promessa e falhariam sem o estado.
- **Fechamento do Dropdown:** desmonta no `finished` do `withTiming` de saída, e o `finished=false` de uma animação interrompida não desmonta. Com reduzir movimento a duração é 0 e o callback roda.
- **Animações:** só `opacity` e `transform` (lista, chevron, `FadeInDown`, pulso). O pulso fica num filho da view com `exiting`. As entradas e saídas usam `ReduceMotion.System`, e os `withTiming` manuais consultam `useReducedMotion`.
- **Alvos de toque:** a opção tem `minHeight: 44` no próprio `Pressable`. O gatilho mede 45 porque o `Card` tem `height`, e o `Pressable` acompanha o filho.
- **Tema e MVVM:** nenhuma cor nem espaço literal (o único é `borderWidth={1}`, como no tema e no design). A tela não importa `services/`.
- **Dropdown na Tarefa 12:** a API é a da 2.5 (`label`, `options`, `selectedKey`, `onSelect`, `testID`, prefixo, hint, `marginHorizontal`). O caso de uma opção só está testado. Serve ao boletim sem retrabalho.
- **TDD:** cada arquivo novo tem o RED registrado, e as mutações foram revertidas.

### [IMPORTANTE] Lista do dropdown sai da tela em aparelho baixo ou com fonte grande, sem rolagem
- Arquivo: mobile/src/components/Dropdown.tsx:126, :200, :218-230
- Problema: `placeList` decide entre abrir abaixo ou acima por uma altura **estimada** (`7 × 44 + 8 = 316`). Não limita `top`/`bottom` à janela, a lista não tem `maxHeight`/`ScrollView`, e o texto da opção (`:200`) não tem `maxFontSizeMultiplier`, ao contrário do gatilho (`:151`).
- Cenário 1, Android 360×640 dp: o gatilho fica em y ≈ 290 (barra 48, saudação, aluno, `section` 64, título, `m`). Abaixo sobram 640 − 343 = 297 < 316, então a lista abre **acima**, de y ≈ 290 − 8 − 316 = −34 até 282. A linha "16 de março, domingo" fica de −30 a 14, atrás da status bar e fora da tela. Não dá para escolher o domingo, que é justamente o caso do flow 04 e do M4.
- Cenário 2, iPhone com "Texto maior" no máximo: a linha passa de 44, a estimativa continua 316 e a lista abre abaixo. "21 de março" e "22 de março, sábado" ficam embaixo da borda, sem rolagem para alcançar.
- O developer registrou o cenário 2 como ressalva. O 1 não foi registrado: só se viu o iPhone 16, onde cabe.
- Correção sugerida: limitar a lista à área segura, com `top ≥ insets.top + s` e `maxHeight` = espaço disponível, e pôr as opções numa `ScrollView` (com 7 itens não precisa de `FlatList`). Também pôr `maxFontSizeMultiplier={sizes.fixedHeightFontScale}` no texto da opção, como no gatilho. Um teste com o gatilho no meio de uma janela baixa deve conferir que `top ≥ 0`, ou que a lista rola.

### [IMPORTANTE] Foco do leitor volta ao gatilho com o Modal ainda na tela
- Arquivo: mobile/src/components/Dropdown.tsx:83-89
- Problema: `unmountList` chama `setAnchor(null)` e, na mesma chamada, `AccessibilityInfo.sendAccessibilityEvent(trigger, 'focus')`. O `setState` só aplica no próximo commit, então o evento sai com o `Modal` (`accessibilityViewIsModal`) ainda apresentado. O gatilho está atrás do modal nesse momento.
- Cenário: VoiceOver ligado, o usuário escolhe "17 de março". O iOS recebe o foco para uma view encoberta pelo modal e, quando o modal some, o VoiceOver costuma cair no primeiro elemento da tela (logo/barra), não no gatilho. A 6.4 do design pede o foco de volta ao gatilho. O teste (`Dropdown.test.tsx`, "escolher uma opção…") só confere que o mock foi chamado, não a ordem em relação ao fechamento. A evidência de VoiceOver do `02-dev.md` lista os rótulos, não o foco ao fechar.
- Correção sugerida: mandar o foco **depois** que o Modal sai, pelo `onDismiss` do `Modal` (iOS) ou por um efeito disparado quando `anchor` vira `null` (Android). Conferir no simulador com VoiceOver (Accessibility Inspector) e registrar a prova.

### [SUGESTÃO] Voltar ao dia inicial repete o atraso de entrada do header
- Arquivo: mobile/src/features/lessons/LessonsScreen.tsx:31-36
- Problema: o atraso de `4 × stagger` vale sempre que `contentKey === firstContentKey`, não só na primeira exibição.
- Cenário: a Agenda abre em 18/03, o usuário escolhe 17/03 e depois volta a 18/03. Os itens de 18/03 entram 160 ms mais tarde que os de qualquer outro dia. O mesmo acontece ao trocar de aluno e voltar ao primeiro. A Decisão 6 do developer diz "trocas de dia ou de aluno entram sem esse atraso".
- Correção sugerida: guardar se a primeira lista já foi exibida, e não qual chave ela tinha. Por exemplo, `firstShown` vira `true` quando o `contentKey` muda pela primeira vez. Esse estado de tela pode morar no ViewModel (`enterDelay`), para a View só renderizar.

### [SUGESTÃO] `retrying` sobrevive à troca de aluno
- Arquivo: mobile/src/features/lessons/useAgendaViewModel.ts:50-56, :78-83
- Problema: `retrying` não é zerado quando o `studentId` muda, como o `chosenDate` é, e força `status: 'error'`.
- Cenário: com a API fora, o usuário toca TENTAR DE NOVO no aluno A (o refetch, com 1 retry, leva mais de 1 s) e troca para o aluno B, ainda sem cache. B aparece com o `ErrorState` e o spinner, não com o skeleton, até a busca de A terminar. Se a de A falhar, o `shakeKey` de B sobe.
- Correção sugerida: zerar `retrying`/`failedRetries` no mesmo bloco "ajustar estado quando a prop muda" (`chosenFor !== studentId`), e ignorar o resultado do `onRetry` se o aluno mudou.

### [SUGESTÃO] Agenda `[]` deixa a tela em branco
- Arquivo: mobile/src/features/lessons/useAgendaViewModel.ts:94
- Problema: com `data = []`, o `status` é `ready` (array vazio é truthy), `selectedDay` é `undefined` e `isEmpty` é `false`.
- Cenário: um aluno sem dias cadastrados (o zod aceita `[]`; o seed atual sempre traz 7). A tela mostra um dropdown com rótulo vazio que abre um card vazio, e nada embaixo.
- Correção sugerida: `isEmpty: lessons.length === 0` e esconder o dropdown quando `dayOptions` estiver vazio. Um teste no ViewModel.

### [SUGESTÃO] Durante os 120 ms de saída, as opções ainda recebem toque; comentário descreve um caminho impossível
- Arquivo: mobile/src/components/Dropdown.tsx:97, :192
- Problema: o comentário fala em "reaberta no meio da saída", mas enquanto `anchor !== null` o `Modal` e o fundo cobrem o gatilho, e não há como reabrir. O `finished` protege, na prática, de um segundo `close` (toque duplo no fundo). Enquanto a lista some, as opções continuam tocáveis.
- Cenário: o usuário toca "17 de março" e, ainda no fade, toca "19 de março". O `onSelect` dispara duas vezes, e o segundo dia vence sem que a lista tenha aparecido aberta.
- Correção sugerida: `pointerEvents={expanded ? 'auto' : 'none'}` no container da lista e o comentário ajustado ("fechada de novo no meio da saída…").

### Deixei de julgar
- Animação do `EmptyState` (scale e atraso do título, 4.5) e anúncio do `ErrorState` no retry que falha (3.8): adiados para a T13 no ledger.
- Posição da lista no Android com `statusBarTranslucent`/`navigationBarTranslucent` e edge-to-edge: sem Android para medir. Fica para o qa (o achado acima independe disso).
- Foco inicial do leitor ao abrir a lista (cai em "Fechar lista", o 1º filho do modal, antes das opções): a 6.4 não especifica a ordem ao abrir.
- `formatDayLabel`/`weekdayOf` lançam erro com data impossível (`2025-02-30`) que passa no regex do zod: o schema é da Tarefa 8, e a API é a fonte.
- testIDs fora da tabela 7 (Ressalva 5): são adições, nenhum id da tabela mudou.
- Pull-to-refresh: opcional, e ficou de fora como o developer registrou.

### Veredito da Tarefa 11
- **Spec ✅**: M4 + D35 implementados (7 dias no formato "17 de março, segunda-feira", dia inicial pelo dia da semana, abrir e fechar com animação, início/término/disciplina, fim de semana com ilustração + "Sem aulas neste dia"). M8 aparece na tela (erro + TENTAR DE NOVO) e M9 na entrada. Nada além do plano.
- **Qualidade: APROVADO** (0 bloqueantes), com 2 importantes (lista do dropdown sai da tela em aparelho baixo ou com fonte grande; foco do leitor enviado antes de o modal sair) e 4 sugestões.

## Mensagens
→ chief: Tarefa 11 aprovada, com 2 IMPORTANTES no `Dropdown`, que é compartilhado com o Boletim. Vale corrigir antes da T12:
  1. A lista não é limitada à janela e não rola. Num Android 360×640 ela abre acima e o domingo fica fora da tela, e o flow 04 precisa do domingo.
  2. O foco do leitor é mandado ao gatilho antes de o modal sair.

  As 4 sugestões são baratas. A do `retrying` na troca de aluno e a da agenda `[]` são uma linha cada.
→ developer: `Dropdown.tsx`:
  - limitar a lista à área segura (`maxHeight` + `ScrollView`, `top ≥ insets.top`);
  - `maxFontSizeMultiplier` no texto da opção;
  - foco de volta no `onDismiss` do Modal ou num efeito depois do commit, com prova no VoiceOver;
  - `pointerEvents="none"` na lista durante a saída.

  `useAgendaViewModel.ts`: zerar `retrying`/`failedRetries` na troca de aluno e trocar `isEmpty` por `lessons.length === 0`. `LessonsScreen.tsx`: o atraso de 4×stagger só na 1ª exibição, de preferência vindo do ViewModel.
→ qa: medir o dropdown aberto num emulador Android de 360×640 e no iPhone com "Texto maior" no máximo (todas as 7 opções alcançáveis). Com VoiceOver/TalkBack, conferir que, ao escolher um dia, o foco volta ao gatilho.

### Rodada 1

Diff `3b4b697..4b64914` (1 commit, 6 arquivos). No worktree (`mobile/`, HEAD `4b64914`, árvore limpa), `yarn lint && yarn tsc && yarn test` deu exit 0, com **53 suítes e 346 testes**, o que bate com o `02-dev.md`. Olhei as duas evidências novas (`tarefa-11-r1-dropdown*.png`).

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| IMPORTANTE: lista sai da tela, sem rolagem | **RESOLVIDO** | `Dropdown.tsx`, `placeList` (~:254-273). O espaço de cada lado agora desconta os insets. A lista abre abaixo se a estimativa couber ou se houver mais espaço abaixo, e `maxHeight` é o espaço do lado escolhido. As opções estão numa `ScrollView` com `maxHeight − 2·xs` (o padding do card), e o texto da opção tem `maxFontSizeMultiplier`. No 360×640 do achado, a lista abre abaixo com `maxHeight` 281 e rola, e a de cima nunca passa de `insets.top`. Os dois casos e o teto de fonte estão testados, com RED registrado. No print com fonte máxima, a lista vai de 459 a 775 dentro de 818. O card encostado na tab bar é só a mesma cor `surface`. A estimativa por linha continua (ressalva do developer), mas agora o pior caso é rolar, não sumir. |
| IMPORTANTE: foco volta com o Modal na tela | **RESOLVIDO** (falta prova com VoiceOver, já pedida ao qa) | `Dropdown.tsx`. `unmountList` só marca `focusPending` e tira a âncora. O foco sai no `onDismiss` do Modal (iOS) ou num efeito depois do commit (Android), e `focusPending` garante um envio só, mesmo se o Android também chamar `onDismiss`. O teste de iOS falharia com a versão anterior (RED `0 / 1` registrado). No simulador, o evento saiu 147 ms depois do toque, com a lista já desmontada. |
| SUGESTÃO: atraso repetido ao voltar ao dia inicial | **RESOLVIDO** | `useAgendaViewModel.ts` (~:77-92), `contentEnterDelay`: 160 só até a 1ª troca, e 0 para sempre depois. O `useState` saiu da View. O teste cobre 160 → 0 → 0 ao voltar a 18/03. |
| SUGESTÃO: `retrying` sobrevive à troca de aluno | **RESOLVIDO** | O mesmo bloco de "ajustar na troca" (~:47-53) zera `retrying` e `failedRetries`. Aceito a explicação de que o teste passou antes da correção: o `queryFn` usa o `signal`, e a query sem observador é cancelada. O zeramento fica como defesa barata, e o teste fica como caracterização, não como regressão. |
| SUGESTÃO: agenda `[]` em branco | **RESOLVIDO** | `isEmpty = lessons.length === 0`, e a tela só monta o dropdown com `dayOptions.length > 0`. Há testes no ViewModel e na tela, com RED. |
| SUGESTÃO: toque durante a saída e comentário | **RESOLVIDO** | `pointerEvents={expanded ? 'auto' : 'none'}` na lista mais a guarda `if (!expanded) return` no `choose`. O comentário foi corrigido. O teste segura a saída e confere 1 chamada. |

Nenhuma quebra nova no diff. Uma observação que não reabre a rodada:
- SUGESTÃO: o ViewModel agora importa `motion` do tema para calcular `4 × stagger`. Isso funciona, mas acopla o VM a um valor visual. Uma alternativa seria expor `isFirstContent: boolean` e deixar a View multiplicar. É opcional.

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes). O foco com VoiceOver/TalkBack e o dropdown no Android 360×640 ficam como roteiro do qa.

### Mensagens (Rodada 1)
→ chief: Tarefa 11 sem pendências. Os 6 achados estão resolvidos, a suíte passa com 346 testes e não há quebra nova. Duas coisas ficam para o qa, porque só aparelho prova: o foco do leitor com VoiceOver/TalkBack ligado e o dropdown num Android de 360×640.

## Tarefa 12

Diff: `revisao/tarefa-12.diff` (BASE `4b64914`, commits `e091687..db80724`, 15 arquivos). Abri os arquivos inteiros no worktree. Fora do diff, conferi só três coisas: `useReportCardQuery`/`useReportCardsQuery` (se usam `signal` e `skipToken`, para saber se o retry pode vazar entre ano e aluno), `utils/grades.ts` (formatação de `-`) e os tokens/strings novos.

Verificação no worktree (`mobile/`, HEAD `db80724`): `yarn lint && yarn tsc && yarn test` terminou com exit 0, **58 suítes e 392 testes**, como diz o `02-dev.md`. Olhei o `tarefa-12-lado-a-lado.png`: os 4 estados do Figma e o "não avaliado".

Conferido e sem achado:
- **`Accordion` (Decisão 3).**
  - O corpo monta na 1ª abertura (2.11) e mede a altura natural num `View` interno. O container anima `maxHeight = medida × progresso`, com `overflow: hidden`.
  - No `finished` da abertura (UI thread), `settled` libera o limite.
  - Ao fechar, `settled=false` volta o limite para a medida atual, e o `progress` desce de onde estava. Reabrir no meio da saída sobe do ponto atual, e `settled` só liga no fim.
  - Com reduzir movimento a duração é 0, e o callback roda.
  - Aninhado: o trimestre aberto e parado não tem limite, então a disciplina que abre dentro dele empurra o resto na mesma frame. A animação de altura é a exceção prevista na 1.8.
- **Acessibilidade do acordeão:** `expanded` no `accessibilityState`. O corpo fechado continua montado e escondido do leitor nas duas plataformas (`accessibilityElementsHidden` + `no-hide-descendants`). A disciplina tem `minHeight` 44 no próprio `Pressable`, e o trimestre usa o card de 90. Nota e Faltas são um elemento só ("Nota 9,5, 0 faltas"; "Nota e faltas ainda não lançadas").
- **Reset no ViewModel:**
  - Ano escolhido, `retrying` e `failedRetries` zeram na troca de aluno.
  - Os acordeões zeram por `contentKey` (aluno:ano), então trocar de ano ou de aluno fecha tudo (3.4).
  - O ano inicial é o maior da lista, sem depender da ordem da API, e um ano fora da lista é ignorado.
  - Cada regra tem teste, e há mutações registradas.
- **`onRetry`:** refaz a query que falhou (`status === 'error'` → lista; senão, o ano). O erro com spinner continua durante o refetch, que volta a `pending`. As duas queries passam o `signal`, então trocar de ano ou de aluno no meio cancela a busca antiga (o mesmo motivo da T11).
- **Textos e formatação:** "Nota:", "Faltas:", `-` no não avaliado, `toFixed(1)` com vírgula, "1º TRIMESTRE" com U+00BA, "7EF - 2025".
- **Animações:** os cards usam `FadeInDown(base)` com `i × 60`. As disciplinas usam `FadeIn(fast)` com `min(i,6) × 20` na 1ª abertura. Nota e Faltas fazem fade no mesmo `progress` (sem contagem, como decidido). O chevron gira no mesmo `progress`. A troca de ano tem `key` com `FadeOut(120)`. Tudo usa `ReduceMotion.System`.
- **Tema e MVVM:** nenhuma cor nem espaço literal (o `100_000` é token, `sizes.accordionOpenMaxHeight`). A tela não importa `services/`. O `Dropdown` da T11 foi usado sem mudança.
- **Skeleton:** dropdown + 3 cards de 90. Na troca de ano só os cards viram skeleton (3.4). O pulso fica num filho da view com `exiting`.
- **TDD:** RED registrado em todos os arquivos novos. A animação de altura não tem teste unitário (o mock do Reanimated resolve na hora); isso está declarado e é prova visual do qa.
- **Ressalva 5 do developer** (fechar o trimestre não fecha a disciplina de dentro): não é defeito. A 2.11 e a 3.4 só pedem que trocar de ano feche tudo e que um trimestre não feche os outros. Fechado, o corpo do trimestre esconde tudo, inclusive para o leitor, e reabrir mostrando a disciplina como estava é o comportamento comum de acordeão aninhado.

### [SUGESTÃO] A descrição do erro 404 troca para "Confira sua conexão…" durante o TENTAR DE NOVO
- Arquivo: mobile/src/features/report-card/useReportCardViewModel.ts:153-158
- Problema: `errorDescription` sai de `reportQuery.error`. No refetch de uma query sem dados, o TanStack v5 zera o `error` (a mesma causa do `retrying`). Durante o spinner, `failedError` vira `null` e a descrição cai no texto de rede.
- Cenário: o ano dá 404 e a tela mostra "Boletim não encontrado.". O usuário toca TENTAR DE NOVO, e enquanto o botão gira a descrição vira "Confira sua conexão e tente de novo.". Quando o 404 volta, ela volta a "Boletim não encontrado.". O texto pisca e, no meio, diz uma causa falsa. O caso é raro, porque o ano vem da lista.
- Correção sugerida: guardar o tipo do último erro num estado (ou `useRef`) que só muda quando uma busca termina, e derivar a descrição dele. Um teste segurando a resposta do retry, como o da T11, pega o caso.

### Deixei de julgar
- O `ErrorState` não anuncia o erro ao leitor, e a entrada do `EmptyState` não tem `scale`: adiados para a T13 no ledger.
- "Nenhum boletim disponível" e o dropdown visível com erro só no ano: decisões aceitas no ledger.
- A animação de altura (e o acordeão aninhado) no Android release, quadro a quadro: é verificação visual do M9, do qa. O mock do Reanimated não permite teste unitário.
- O ViewModel importa `motion` do tema para o `contentEnterDelay`: é o mesmo padrão da T11, e eu já registrei como opcional na Rodada 1 dela.
- testIDs fora da tabela 7 (Ressalva 4): são adições, e todos os ids da tabela (`boletim-year-dropdown*`, `boletim-term-<t>`, `-content`, `-subject-<i>`, `-grade`, `-absences`, `boletim-skeleton`, `boletim-error*`) existem.

### Veredito da Tarefa 12
- **Spec ✅**: M5/R8 completos.
  - Abre em "7EF - 2025" com os 3 trimestres fechados em acordeão.
  - T1 com Nota e Faltas por disciplina, T2/T3 com `-`.
  - O dropdown de turma/ano navega para 2024 (bônus), e trocar de ano fecha tudo.
  - M8: erro + TENTAR DE NOVO na lista e no ano.
  - M9: entradas e acordeões animados.
  - Nada além do plano. As adições ("Nenhum boletim disponível", 404) estão aceitas no ledger.
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 1 sugestão).

## Mensagens
→ chief: Tarefa 12 aprovada, sem bloqueante nem importante. O `Accordion`, os resets por aluno/ano e o `onRetry` estão corretos e testados. A Ressalva 5 (disciplina continua aberta ao reabrir o trimestre) não é defeito e pode ficar como está. Há 1 sugestão barata: a descrição do 404 pisca para o texto de rede durante o retry.
→ developer (se o chief aceitar a sugestão): em `useReportCardViewModel.ts:153`, a descrição do erro deve vir do último erro que terminou, não de `reportQuery.error`, que o TanStack zera no refetch sem dados. Faça com teste que segura a resposta.
→ qa: conferir no Android release, quadro a quadro, a abertura de uma disciplina dentro do 1º trimestre aberto (sem corte, empurrando o resto) e a troca de ano com reduzir movimento ligado.

## Tarefa 13

Diff: `revisao/tarefa-13.diff` (BASE `db80724`, commits `7fc41fc..2da2623`, 18 arquivos). Abri os arquivos inteiros no worktree. Fora do diff, só olhei o que cada risco pedia:
- `redact.ts` e `session.store.ts`: o que o inspector manda.
- `AppTabs.tsx`: se as duas abas ficam montadas, por causa dos anúncios.
- `android/` (wrapper, `settings.gradle`, `build.gradle`, `gradle.properties`) e `@react-native/gradle-plugin/gradle/libs.versions.toml`, para o CI.
- `Gemfile` e `.gitignore`.

Verificação no worktree (`mobile/`, HEAD `2da2623`):
- `yarn lint && yarn tsc && yarn test --coverage --ci` → exit 0, **59 suítes, 408 testes**, cobertura de 98,43% stmts / 92,02% branch, 0 avisos de `act`. Bate com o `02-dev.md`.
- `actionlint .github/workflows/mobile.yml` → exit 0.
- **Bundle de release:** gerei um em `/tmp` (`react-native bundle --platform android --dev false --minify true`; a árvore do worktree continuou limpa). Não aparecem `"ESTADO"`, o template `queries, …` nem "Reactotron não conectou". O corpo do `setupDevtools` e o `stateInspector` saem no release. A biblioteca `reactotron-react-native` entra (ver a SUGESTÃO 1).

Conferido e sem achado:
- **`stateInspector`:**
  - As mutations mandam só `mutationKey` e `status`, sem `variables`, `data` nem `error`.
  - As queries passam pelo `redact`: `cpf`, `token` e `accessToken` por chave, e o erro vira só nome + mensagem.
  - O `/me` traz o CPF já mascarado, e a chave `cpf` é redigida de novo.
  - A store `session` guarda só `guardian {id, firstName, lastName}`, `status` e o aluno selecionado. O token mora no keychain.
  - Funções são filtradas.
  - O teste serializa tudo e confere que senha, CPF e token não aparecem.
  - Roda só sob `__DEV__`, o que o bundle de release confirma.
- **`EmptyState` (4.5):** a ilustração entra com `Keyframe` (opacidade 0→1 e escala 0,96→1, `base`, `easeOut`), e o texto vem um stagger depois. Sem ilustração, o atraso é 0/1/2 (4.8). Com reduzir movimento, só fade, com `ReduceMotion.Never`, como pedido. O token é `illustrationScaleFrom`.
- **`ErrorState` sem anúncio duplicado na própria tela:** o efeito tem deps `[título + descrição, shakeKey]`. O spinner não muda nenhum dos dois, e o ViewModel mantém o `status` em erro durante o retry, então o componente não remonta. Um retry que falha com outro texto muda os dois no mesmo commit: o `refetch` resolve depois de o resultado do observer ser atualizado, e o `setFailedRetries` cai no mesmo render. Não há live region junto. A exceção é a das duas abas (IMPORTANTE abaixo).
- **Seleção (6.4):** o foco vai ao título no `transitionEnd` sem `closing`, e o listener é removido ao desmontar. Os testes de foco e de unsubscribe têm RED.
- **404 do boletim:** `lastError` é ajustado no render e só é usado durante o `retrying`, que zera na troca de aluno. O teste segura a resposta, e o RED mostra exatamente o texto que piscava.
- **Avisos de `act`:** as causas estão identificadas pelo stack, com medição antes e depois. Os 250 ms dentro do `act` no `afterEach` do App estão justificados (fade de 150 ms + `setTimeout` de 32 ms do BottomTabView).
- **`mobile.yml`:**
  - `permissions: contents: read`, `concurrency`, `paths`, `working-directory`.
  - Corepack + `yarnPath` (4.18.1) + `install --immutable`, com cache do yarn pelo `cacheFolder` e chave no `mobile/yarn.lock`.
  - Cobertura como artefato com `!cancelled()`.
  - O Android é coerente com o RN 0.88: wrapper Gradle 9.4.1 com `gradlew` 755 e jar versionados, AGP 9.2.1 (pede JDK 17, que é o `temurin 17` do job), NDK `27.1.12297006` igual ao do RN, e as flags `android.builtInKotlin`/`android.newDsl` do AGP 9 que o template do Expo usa. Também tem `setup-gradle@v4` e o `.env` copiado do exemplo.
  - O iOS só roda com `workflow_dispatch` (decisão do ledger), com o `Gemfile` presente (`bundler-cache` resolve sem lock).
- **TDD:** RED registrado em cada arquivo novo. Os 2 testes que passaram no RED estão declarados como caracterização.

### [IMPORTANTE] As duas abas anunciam o erro ao mesmo tempo, inclusive a que não está na tela
- Arquivo: mobile/src/components/ErrorState.tsx:43-45 (usado em LessonsScreen.tsx:56 e ReportCardScreen.tsx:39)
- Problema: o anúncio sai na montagem do `ErrorState`, sem olhar se a tela está em foco. As abas do bottom-tabs ficam montadas depois da 1ª visita (`lazy` padrão, sem `unmountOnBlur`), e as duas observam queries do aluno selecionado.
- Cenário: o usuário já abriu Agenda e Boletim. A API cai e ele troca de aluno pela seleção. As queries de agenda e de `report-cards` do novo aluno falham juntas (~1 s, com 1 retry), e os dois `ErrorState` montam. O VoiceOver lê "Não foi possível carregar a agenda…" e em seguida "Não foi possível carregar o boletim…". No iOS, o 2º anúncio interrompe o 1º, então o usuário na Agenda pode ouvir só o erro de uma tela que não vê. Isso é o "duplicar" que a 3.8 e o pedido do chief querem evitar.
- Correção sugerida: anunciar só com a tela em foco. Uma forma é uma prop `announce` no `ErrorState`, que as telas passam com `useIsFocused()`. Ela entra nas deps, para o erro ser lido quando o usuário chega à aba que já estava com erro. O `BootError`, fora do navigator, passa `true`. Um teste com o `ErrorState` montado e `announce={false}` deve dar 0 chamadas.

### [SUGESTÃO] A biblioteca do Reactotron vai no bundle de release, inerte
- Arquivo: mobile/src/app/devtools.ts:13-17
- Problema: com o padrão `if (!__DEV__) return;` seguido do `require`, o Metro coleta a dependência antes do minificador remover o código morto. No bundle de release que gerei aparecem `reactotron-react-native` e `reactotron-core-client`, mas nenhum código do inspector, e nada roda (o corpo foi removido). Isso já vinha da T8. O diff mexe nessa função, então dá para resolver agora.
- Cenário: o APK de release carrega o cliente WebSocket do Reactotron sem usar.
- Correção sugerida: `if (__DEV__) { const { connectReactotron } = require(...); … }`. O constant folding do Metro remove o bloco antes de coletar as dependências. Conferir com o mesmo `react-native bundle --dev false` (`grep -c reactotron` = 0).

### [SUGESTÃO] O `assembleDebug` compila 4 ABIs no CI
- Arquivo: .github/workflows/mobile.yml:120-122
- Problema: `gradle.properties` tem `reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64`. A primeira execução, sem cache, compila o C++ de reanimated, worklets, nitro/mmkv, screens, svg e gesture-handler para as 4 ABIs, com `-Xmx2048m`. O `timeout-minutes: 45` é a única folga, e esse é justamente o 1º build Android do projeto.
- Cenário: o job estoura o tempo ou a memória no runner, e o PR fica vermelho por tempo, não por erro de código.
- Correção sugerida: `./gradlew assembleDebug -PreactNativeArchitectures=x86_64` (o mesmo ABI do emulador da T14), o que reduz o C++ a 1/4. Se quiser, aumentar o heap do Gradle só no CI (`-Dorg.gradle.jvmargs=-Xmx4g`).

### Deixei de julgar
- A execução real do `mobile.yml`: não há remote. Os pontos que dependem da rede ou do runner ficam para a primeira execução: download do yarn pelo corepack, instalação automática do SDK 37/NDK e `pod install`.
- VoiceOver/TalkBack reais (foco da seleção, anúncio do erro): provados por teste e pela ordem dos eventos, e estão no roteiro do qa.
- O NoStudent mostrar o EmptyState junto com a saudação, sem o 4×stagger (Ressalva 3): é um detalhe declarado e não está no plano da tarefa.
- Silenciar o logger no Jest (Ressalva 4): já decidido no ledger (entra na rodada ou na T14).
- `mobile/coverage/` gerado pelo meu `yarn test --coverage`: está no `.gitignore` (`/coverage`), e a árvore versionada continua limpa.

### Veredito da Tarefa 13
- **Spec ✅:**
  - M8: o erro com TENTAR DE NOVO anuncia ao aparecer e a cada falha, e o 404 não pisca.
  - M9: entrada em todas as telas, com o EmptyState da 4.5 completo.
  - `mobile.yml` com lint, tsc e jest `--coverage` com artefato (D32), mais o build Android.
  - D15: estado do zustand e do React Query no Reactotron, sem dado sensível.
  - Os adiados da T10–T12 que o ledger mandou para cá: foco da seleção, anúncio do erro, EmptyState e 404.
  - Nada fora do plano: o build Android e o iOS sob demanda estão aceitos no ledger.
- **Qualidade: APROVADO** (0 bloqueantes), com 1 importante (anúncio da aba fora de foco) e 2 sugestões.

## Mensagens
→ chief: Tarefa 13 aprovada. O `stateInspector` está limpo: não manda senha, CPF nem token, e conferi no bundle de release que ele e o `setupDevtools` não existem lá. O IMPORTANTE é de acessibilidade, com correção pequena: com as duas abas montadas, um erro simultâneo é anunciado pelas duas, inclusive pela aba escondida. Das sugestões, a das ABIs no CI evita que o 1º build Android estoure o tempo, e a do `require` tira o Reactotron do APK de release. As duas são de uma linha.
→ developer:
- `ErrorState`: prop `announce` (as telas passam `useIsFocused()`, e o BootError passa `true`), nas deps do efeito, com teste de 0 anúncios fora de foco.
- `devtools.ts`: `if (__DEV__) { require… }` no lugar do early return, conferido com `react-native bundle --dev false | grep -c reactotron`.
- `mobile.yml`: `-PreactNativeArchitectures=x86_64` no `assembleDebug`.
- Silenciar o logger no Jest, se o chief colocar nesta rodada.

→ qa: com VoiceOver, depois de visitar as duas abas, derrubar a API e trocar de aluno. Só a aba visível deve anunciar o erro, e ao ir para a outra aba o erro dela deve ser lido.

### Rodada 1

Diff `2da2623..176ab84` (4 commits, 14 arquivos). No worktree (`mobile/`, HEAD `176ab84`, árvore limpa):
- `yarn lint && yarn tsc && yarn test --coverage --ci` deu exit 0, com **60 suítes e 417 testes**. A cobertura ficou em 98,35% stmts / 91,89% branch, sem aviso de `act` e sem linha `console.info/warn` do logger na saída.
- `actionlint .github/workflows/mobile.yml` deu exit 0.
- Gerei de novo o bundle de release em `/tmp` (`react-native bundle --platform android --dev false --minify true`): **`grep -ci reactotron` = 0** (antes era > 0).

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| IMPORTANTE: as duas abas anunciam o erro | **RESOLVIDO** | `ErrorState.tsx`: `announce` é obrigatória (o tsc obriga cada uso a decidir) e está nas deps do efeito. `LessonsScreen`/`ReportCardScreen` passam `useIsFocused()`, e o `BootErrorScreen` passa `announce`. A aba escondida não anuncia. Quem chega à aba com erro ouve uma vez. O retry que falha na aba visível continua anunciando, pelo `shakeKey`. Os testes do componente e das duas telas têm RED (`0/1` e `1/0`); os que passaram no RED estão declarados como caracterização. |
| SUGESTÃO: Reactotron no bundle de release | **RESOLVIDO** | `devtools.ts`: o `require` agora fica dentro de `if (__DEV__) { … }`. Medi no bundle novo: nenhuma ocorrência de `reactotron`. |
| SUGESTÃO: 4 ABIs no CI | **RESOLVIDO** | `mobile.yml:124`: `-PreactNativeArchitectures=x86_64`, com comentário. O actionlint passa. |
| Ressalva 4: logger silenciado no Jest (ledger) | **RESOLVIDO** | `jest.setup.ts` faz `jest.mock` do `transports` com um `consoleTransport` mudo. O logger continua com nível, redação e destinos, e os testes que olham o log usam `spyOn(logger)`. O transporte de verdade tem teste próprio com `requireActual`. |

**Mudança fora do pedido** (`transports.ts`, `console[level]` lido na hora da chamada): aceito.
- **No app:** não muda o destino. O LogBox já envolve o `console` antes da carga do módulo, e o toast do `warn` já aparecia nas evidências da T11/T13. Ler na chamada só garante o mesmo comportamento se alguém trocar o console depois.
- **Em release:** nada substitui o `console`, então o resultado é idêntico.
- **O ganho:** um spy de teste passa a enxergar o transporte. Sem isso, o teste "escreve no nível certo" não provava nada, como mostra o 1º RED inválido registrado pelo developer.
- **Risco:** não achei. São 4 níveis fixos do tipo `LogLevel`, todos métodos do `console`.

Nenhuma quebra nova no diff. O `EmptyState.tsx` só mudou formatação (prettier).

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes). VoiceOver/TalkBack reais e a 1ª execução do `mobile.yml` continuam no roteiro do qa e dependem do remote.

### Mensagens (Rodada 1)
→ chief: Tarefa 13 sem pendências. Os 3 achados e a ressalva do logger estão resolvidos. Conferi que o Reactotron saiu do bundle de release (`grep -ci reactotron` = 0). A troca no `consoleTransport` é segura e necessária para o teste dele.

## Tarefa 17 — parte 1

Escopo: `README.md` da raiz (commit `592eec9`, branch `chore/tooling`). Conferido contra os worktrees `api`, `mobile` e `tooling` (só leitura). Não rodei nada: não há remote, Docker nem JDK/SDK nesta máquina, e o README é documento.

### O que conferi e bate
- API: `.env` antes do `yarn install` (o `prisma.config.ts` tem fallback para `DATABASE_URL`, então a ordem não quebra nem sem `.env`). Scripts `prisma:setup`, `prisma:reset`, `prisma:seed`, `start:dev`, `start:prod`, `build`, `test`, `test:cov`, `test:e2e`, `lint`, `tsc`, `format`, `format:check`, `prisma:validate` existem. `scripts/smoke.sh` existe.
- Mobile: `yarn ios/android/start/lint/tsc/test/format/format:check` existem. `packageManager yarn@4.18.1`, `.yarnrc.yml` com `yarnPath` e `.yarn/releases/yarn-4.18.1.cjs` existem. `Gemfile` com cocoapods existe. `useWatchman: false` está no `metro.config.js`. `.env.example` e a troca `localhost` → `10.0.2.2` (`apiUrl.ts`) batem. `NSAllowsLocalNetworking` cobre o IP da máquina no iOS. Node 24 (`.nvmrc`, `engines >=24` da API, Dockerfile, workflows).
- Tabela de envs: as 14 linhas batem com `api/.env.example` e com `env.validation.ts` (padrões, `JWT_SECRET` 32+, regex do `JWT_EXPIRES_IN`, `TRUST_PROXY=true` recusado, `SEED_RESET` fora da validação). Exceção: CORS (achado 1).
- Credenciais e dados: Gustavo `969.294.560-04`/`123456` (Rafael 7EF com 2025 e 2024, Joana 2EM), Adelaide `508.795.670-07`/`987654` (Bianca 1EF), Carlos `314.159.265-90`/`111111` (extra do `seed-mapper.ts`). Agenda de 16 a 22/03/2025. `docs/data/responsaveis.json` é idêntico à cópia do seed.
- Versões das dependências do app, da API e da raiz conferem com os `package.json` (RN 0.88, React 19.3, query 5.104, zustand 5.0, zod 4.6, mmkv 4.3, keychain 10.0, reanimated 4.7/worklets 0.13, jest 29/30, TS 6/5.9, Prisma 7.10.1 etc.).
- Workflows: `api.yml`, `mobile.yml` (com `workflow_dispatch` e `ios`) e `commitlint.yml` existem com os gatilhos descritos; `assembleDebug` e JDK 17 batem.
- OTA / expo-updates / EAS: nenhuma ocorrência (as buscas só acharam "ota"/"eas" dentro de outras palavras). O `expo` aparece só como Expo Modules, e o push está como "a confirmar".
- Links relativos: `docs/figma/README.md`, `docs/teste-tecnico-mobile.md`/`.docx`, `docs/data/responsaveis.json`, `CLAUDE.md`, `.claude/agents`, `.claude/skills`, `.claude/team/PROTOCOLO.md`, a pasta da tarefa e o `00-brief.md` existem. `api/.env.example` só existe depois do merge de `feat/api` (esperado).

### Achados

### [IMPORTANTE] Linha do `CORS_ORIGINS` na tabela contradiz o código e o compose
- Arquivo: README.md:250
- Problema: diz "`*` só fora de produção; com `NODE_ENV=production` é obrigatória". O `env.validation.ts` (`applyDefaults`, `productionProblems`) só usa `*` como **padrão** quando a variável falta fora de produção; um `*` explícito em produção é aceito. O `docker-compose.yml` faz exatamente isso (`NODE_ENV=production` da imagem + `CORS_ORIGINS: "*"`).
- Cenário: o avaliador lê que `*` é proibido em produção, abre o compose, vê `"*"` e conclui que o README ou o compose está errado (ou tenta "corrigir" e quebra o Docker).
- Correção sugerida: "Origens separadas por vírgula, ou `*`. Sem a variável: `*` fora de produção; com `NODE_ENV=production` a variável é obrigatória (o compose usa `*` de propósito)".

### [IMPORTANTE] Pré-requisitos do Android incompletos, e a prova do Android depende de um CI que ainda não rodou
- Arquivo: README.md:160, 307-314, 626-630
- Problema: para Android o README diz só "JDK 17 + Android SDK, com um emulador criado". O projeto usa `compileSdkVersion = 37`, `minSdk 24` e NDK/C++ (reanimated, worklets, mmkv). Não diz que é preciso o SDK Platform 37 e o NDK pelo SDK Manager, nem as variáveis `ANDROID_HOME` e `JAVA_HOME`. Além disso, "Android validado só no CI" afirma um build que o `mobile.yml` ainda não executou (não há remote; o ledger registra "sem execução real").
- Cenário: avaliador num Android Studio estável sem a plataforma 37 ou sem `ANDROID_HOME` roda `yarn android` e cai em erro de Gradle sem pista no README. E, se o primeiro `assembleDebug` do CI falhar, o README fica afirmando algo falso.
- Correção sugerida: acrescentar uma linha no pré-requisito ("SDK Platform 37, Build-Tools e NDK instalados pelo SDK Manager; `ANDROID_HOME` configurado — o guia oficial do RN cobre") e, na limitação, só afirmar o que for verdade quando o job rodar (ou dizer "o workflow compila, ainda sem execução registrada"). Rechecar na parte 2.

### [IMPORTANTE] O README declara que o caminho Docker funciona, e ele nunca foi executado
- Arquivo: README.md:215-237
- Problema: a Opção B é o caminho mais curto para o avaliador, mas o developer da Tarefa 6 registrou que Docker não foi executado em nenhuma máquina (o job `docker` do `api.yml` e o `docker-smoke.sh` são a única prova, e o CI ainda não rodou). O README não avisa.
- Cenário: se o `docker build` falhar (better-sqlite3, openssl/Prisma, permissão do volume para o usuário `node`), o avaliador perde o caminho "um comando" sem pista de que existe a Opção A.
- Correção sugerida: ⚠️ Não dá para verificar pelo diff. Antes do PR, exigir uma execução real (CI ou máquina com Docker) e, até lá, ordenar a Opção A como a verificada. Em caso de falha, o README não precisa mudar, mas a decisão tem que passar pelo chief.

### [SUGESTÃO] Bloco da Opção A mistura comando e instrução
- Arquivo: README.md:190-193
- Problema: dentro do bloco `sh`, o comentário "troque o JWT_SECRET do .env pelo resultado de" é seguido do `openssl rand -base64 48` como linha executável. Quem copia o bloco inteiro roda o `openssl`, vê a saída no terminal e não sabe o que fazer com ela; falta dizer que o valor vai entre aspas na linha `JWT_SECRET=` do `.env`. O rótulo "Opcional para uso local, obrigatório fora da sua máquina" também confunde (o avaliador roda local).
- Correção sugerida: tirar o passo do bloco e escrever uma frase: "Local, pode manter o `JWT_SECRET` do exemplo. Para trocar: `openssl rand -base64 48` e cole na linha `JWT_SECRET=` do `.env`".

### [SUGESTÃO] Sem caminho curto no topo, e o passo a passo só começa na linha 181
- Arquivo: README.md:1-181
- Problema: o README tem ~700 linhas (36 KB). O que o avaliador pediu primeiro (rodar) vem depois de visão geral, telas, rotas, GIFs placeholder, tabelas de dependências e pré-requisitos. Há repetição: o `JWT_SECRET` é explicado em quatro lugares (A, B, tabela de envs, decisões), o rate limit em três (credenciais, troubleshooting, tabela) e a estrutura de pastas da API aparece na visão geral e na arquitetura.
- Correção sugerida: um bloco "Início rápido" de 10 linhas logo após o título (API por Docker; app iOS/Android; login do Gustavo) com links para as seções. Cortar as repetições para uma frase com link. Arquitetura e SDD podem ficar como estão, já que o sumário permite pular.

### [SUGESTÃO] Instruções para iPhone/Android físico incompletas
- Arquivo: README.md:290
- Problema: "Aparelho físico (iOS ou Android)" só diz qual `API_URL` usar. No iOS físico faltam a assinatura (Team no Xcode) e `yarn ios --device`; no Android físico, o `adb reverse tcp:3333 tcp:3333` com `localhost` evita descobrir o IP e o firewall.
- Correção sugerida: duas linhas na tabela ou uma nota. É opcional, porque o simulador e o emulador cobrem o teste.

### [SUGESTÃO] Árvore da API mostra `health/` com subpastas que ele não tem
- Arquivo: README.md:408-412
- Problema: `controllers/`, `use-cases/`, `repositories/` e `errors/` aparecem indentadas sob `health/`, mas `health` só tem `controllers`, `dto` e o módulo. As subpastas descrevem o padrão dos módulos `auth`, `guardians` e `students`.
- Correção sugerida: mover as quatro linhas para um comentário sobre o padrão de módulo ou desindentar.

### [SUGESTÃO] Textos de "a gravar", "previsto" e o parágrafo provisório precisam sair na parte 2
- Arquivo: README.md:81-89, 162, 368-372, 391-392, 582-583, 637-644
- Problema: a seção Demonstração (cinco caminhos de GIF "a gravar"), o Maestro "previsto", `maestro.yml` e APK em tag "previstos", e o parágrafo "entram no repositório no fechamento da entrega" são provisórios. Se algum ficar para trás, o avaliador vê promessa não cumprida (os GIFs apontam para arquivos que não existem).
- Correção sugerida: gate no fechamento da parte 2: grep por "previst", "a gravar", "a confirmar" e "no fechamento" no README, e checar que `docs/media/*.gif` existe. A linha "Push: a confirmar" continua até o usuário decidir.

### Deixei de julgar
- Se o `better-sqlite3` instala sem compilador em Node 24 no macOS/Linux do avaliador (o Dockerfile instala `python3 make g++` no estágio de deps): depende de binário pré-compilado, que não conferi sem rodar.
- `docker compose up` e o `mobile.yml` de verdade: sem Docker, remote nem runner aqui (ver achados 2 e 3).
- Tamanho ideal do README e a seção SDD (R12): decisão editorial do chief; marquei só repetição e ordem.
- "Zod para estados compartilhados" e demais decisões da seção Decisões: texto fiel ao brief, não reavaliei a decisão.
- Conteúdo da árvore do app além do que listei no `ls` (por exemplo `constants/`, `hooks/`, `types/`, `test/` não aparecem no README): omissão sem prejuízo.
- Arquivos `01-design.md` a `04-security.md` linkados na tabela: só existem no commit de fechamento (decisão já registrada no ledger).

### Veredito da Tarefa 17 — parte 1
- **Spec ✅:** instalação, dependências com versões, passo a passo da API própria (yarn e Docker), envs, credenciais, SDD e configuração da IA estão presentes, e os links relativos existem. Sem OTA/expo-updates/EAS; push "a confirmar"; sem nada fora do escopo da parte 1 (GIFs e APK ficam para a parte 2).
- **Qualidade: APROVADO** (0 bloqueantes), com 3 importantes (linha do CORS errada, pré-requisitos do Android e Docker não verificado) e 5 sugestões.

### Rodada 1

Re-review restrito do diff `592eec9..5c2d363` (README), conferido contra `mobile/android/build.gradle`, `apiUrl.ts` e `api/src/modules/auth/`.

1. **CORS (IMPORTANTE): resolvido.** README.md, linha do `CORS_ORIGINS`: agora diz que o padrão `*` vale sem a variável fora de produção, que em produção ela é obrigatória e que o compose define `*` de propósito. Bate com `applyDefaults`.
2. **Pré-requisitos do Android (IMPORTANTE): resolvido.** Os números citados batem com o `build.gradle`: `buildToolsVersion 37.0.0`, `compileSdkVersion 37`, `ndkVersion 27.1.12297006`, `minSdk 24`. Entraram `JAVA_HOME`, `ANDROID_HOME` e o `PATH`. A limitação "Android ainda não buildado" agora diz a verdade (configurado no CI, não executado).
3. **Aviso do Docker (IMPORTANTE): resolvido.** Há um aviso no topo da seção da API e na Opção B, e as limitações repetem. A Opção A aparece como a verificada. A execução real do job `docker` continua pendente, e isso é gate do chief, não do texto.
4. **Bloco do openssl (SUGESTÃO): resolvido.** Saiu do bloco executável, e a frase diz para colar entre aspas na linha `JWT_SECRET=` do `api/.env`.
5. **Início rápido e repetição (SUGESTÃO): resolvido.** Há um bloco curto no topo e no sumário. Rate limit e `JWT_SECRET` perderam as repetições das credenciais e das decisões.
6. **Aparelho físico (SUGESTÃO): parcialmente resolvido, com erro novo (ver abaixo).** O iPhone (Team no Xcode, `yarn ios --device`) está correto.
7. **Árvore da API (SUGESTÃO): resolvido.** `health/` agora diz "só controller e DTO". A frase "auth usa a de guardians" é coerente com o `ls` de `auth/`, que não tem `repositories/`.
8. **Textos provisórios (SUGESTÃO): não se aplica ainda.** Fica o gate do grep na parte 2. "a gravar", "previsto" e "no fechamento" continuam no README, como esperado.

### [IMPORTANTE] Linha nova do Android físico por USB não funciona (problema novo do diff)
- Arquivo: README.md, tabela do `API_URL` ("Android físico (USB)") e a nota do `adb reverse` na seção Android
- Problema: manda usar `API_URL=http://localhost:3333/api` com `adb reverse tcp:3333 tcp:3333`. Só que `resolveApiUrl` (`mobile/src/services/http/apiUrl.ts`) troca `localhost` e `127.0.0.1` por `10.0.2.2` no Android. Num aparelho físico `10.0.2.2` não existe.
- Cenário: o avaliador segue a tabela com um celular Android, o app tenta `http://10.0.2.2:3333/api` e dá erro de rede, apesar do `adb reverse` certo.
- Correção sugerida: tirar o `adb reverse` da tabela e deixar só o IP da máquina na rede (como no iPhone); ou documentar que o `adb reverse` só serve se a troca for contornada, o que exigiria mudança no app (fora do escopo desta tarefa). Remover também a frase "sem depender de IP nem de firewall".

### Veredito da Rodada 1
- **Spec ✅.**
- **Qualidade: APROVADO** (0 bloqueantes). Os 3 importantes e as sugestões 4, 5 e 7 estão resolvidos; a 6 está parcial e a 8 fica para a parte 2. Há 1 IMPORTANTE novo (linha do Android físico), que é correção de uma célula e um parágrafo.

### Rodada 2

Re-review restrito do diff `5c2d363..a49030a` (README), conferido contra `mobile/src/services/http/apiUrl.ts`.

- **Android físico por USB (IMPORTANTE da rodada 1): resolvido.** A tabela do `API_URL` voltou a uma linha só ("Aparelho físico", IP da máquina na rede Wi-Fi) e o `adb reverse` saiu. A nota na seção Android diz para não usar `localhost` e que o app troca `localhost` e `127.0.0.1` por `10.0.2.2`, o que bate com o regex `LOCALHOST` de `resolveApiUrl`. Perdeu-se só a dica do `adb reverse`, que de fato não funciona com esse app.
- **Problema novo no diff:** nenhum. O diff só mexe em três trechos do `API_URL`.
- Continuam abertos, fora do escopo desta rodada: a sugestão 8 (grep dos textos provisórios na parte 2) e os gates externos (execução real do job `docker` e do `assembleDebug`).

### Veredito da Rodada 2
- **Spec ✅.**
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes abertos).

## Mensagens
→ chief: README da parte 1 aprovado, sem bloqueante. Corrigir antes do PR: a linha do `CORS_ORIGINS` (contradiz o compose, é uma frase) e os pré-requisitos do Android (SDK Platform 37, NDK, `ANDROID_HOME`). O Docker e o `mobile.yml` são as duas provas que ainda não existem: sem elas, o README afirma coisas que ninguém executou. Ordene a execução real do job `docker` do `api.yml` e do `assembleDebug` antes de o README ir para o avaliador.
→ developer: as 5 sugestões são pequenas (bloco do `openssl`, "Início rápido" no topo, nota de aparelho físico, árvore do `health/`, grep dos textos provisórios no fechamento da parte 2). Se T14 ou T16 mudarem comandos, refazer o grep de "previst" e "a confirmar".
→ chief (rodada 1): a linha do Android físico por USB precisa sair antes do PR, porque contradiz o `apiUrl.ts`. O resto está resolvido. Os dois gates externos continuam abertos: a execução real do job `docker` e do `assembleDebug`.
→ chief (rodada 2): README da parte 1 sem pendência de texto. Fica o gate da parte 2 (grep de "previst", "a gravar", "a confirmar", "no fechamento") e a execução real do `docker` e do `assembleDebug` no primeiro CI.

## Tarefa 16a

**Spec ✅ · Qualidade APROVADO**

Verificado em `/Users/fael_st/workspace/fiap/.claude/worktrees/api/api` (commits fc18502..00ae8cc): `yarn lint`, `yarn tsc`, `yarn test` (298), `yarn test:e2e` (122), `yarn build` e `./scripts/smoke.sh` (SMOKE OK) passam. O e2e de concorrência deu 2/2 em 5 execuções seguidas. `prisma migrate diff --from-migrations ... --to-schema ... --exit-code` retorna "No difference detected". A migration `init` não foi alterada. Os únicos e2e alterados são `me.e2e-spec.ts` e `auth-throttle-cpf-concurrency.e2e-spec.ts`.

Migration:
- Banco novo (`DATABASE_URL=file:./r16a.db yarn prisma:setup`, apagado depois): aplica limpa e o seed grava Gustavo/Rafael 0, Gustavo/Joana 1, Adelaide/Bianca 0.
- Banco populado: apliquei `init`, inseri vínculos fora de ordem de rm (g→c, a, b e h→b) e rodei o SQL da migration. A numeração saiu por rm dentro de cada responsável (a=0, b=1, c=2, e h/b=0). `foreign_key_check` vazio e o índice `GuardianStudent_studentId_idx` foi recriado.

### SUGESTÃO backfill por `rm` só reproduz o JSON porque, nos dados oficiais, rm cresce na ordem da lista
- Arquivo: api/prisma/migrations/20261028043754_guardian_student_position/migration.sql:21-29
- Problema: o JSON não está guardado no banco, então `rm` é a única ordem que dá para derivar. Num banco populado com outra ordem de lista, o backfill daria uma ordem diferente da do JSON.
- Cenário: só aparece com dados que não sejam os oficiais. Nos oficiais, Gustavo tem 12567 (Rafael) e 12568 (Joana), na mesma ordem do JSON. A decisão é aceitável, e o comentário da migration já diz que ela depende disso.
- Correção sugerida: nenhuma obrigatória. Se algum dia houver dados fora do JSON, rodar `SEED_RESET`.

### SUGESTÃO asserção redundante no e2e do /me
- Arquivo: api/test/me.e2e-spec.ts:~52-56
- Problema: o `expect(students[0].firstName).toBe('Rafael')` repete o que o `toEqual` da lista logo abaixo já garante.
- Cenário: nenhum de falha, só ruído.
- Correção sugerida: remover a asserção isolada.

### SUGESTÃO o teste de `position` muda dados compartilhados do banco do e2e
- Arquivo: api/test/me.e2e-spec.ts (caso "segue GuardianStudent.position")
- Problema: ele inverte as posições e restaura no `finally`. Se o processo morrer entre o `setPosition` e o `finally`, o banco fica trocado.
- Cenário: o Jest roda os arquivos e2e em workers; só haveria interferência se outro arquivo lesse a ordem do Gustavo no mesmo banco. A suíte passou em todas as execuções.
- Correção sugerida: nenhuma agora.

### Conferido
- **Ordem no repositório, não no use case:** `orderBy: [{ position }, { student: { rm } }]` dá uma ordem total, o use case só repassa e o spec cobre isso. A descrição do Swagger e o JSDoc da interface foram atualizados.
- **Seed:** grava o índice do JSON como `position`.
- **TDD:** o `02-dev.md` registra RED e GREEN do use case, do e2e de ordem e do caso que inverte `position` (que pega a ordem de inserção por acaso).
- **Concorrência:** com só senhas erradas não há reset no meio, então 10×401 e 10×429 não dependem de tempo. O caso "senha certa além do limite" fica coberto só pelo spec unitário do interceptor. Confirmei isso pelo texto do dev e do diff, sem reabrir o spec do interceptor.

## Deixei de julgar
- Perda da cobertura e2e da "senha certa além do limite 429": o plano autoriza a troca, e o spec do interceptor cobre o caso.
- Que a decisão do ledger (linha 122) revoga a ordenação por nome: o mobile consome a ordem da API, e isso é da Tarefa 16b/QA.
- Sem push (não há remote): o ledger já registra isso.

**Veredito: APROVADO (0 bloqueantes). Spec ✅.**

## Mensagens
- Ao chief: Tarefa 16a aprovada, com 3 sugestões opcionais e nenhum achado bloqueante ou importante.

## Tarefa 14

Diff: `revisao/tarefa-14.diff` (BASE `176ab84`, commits `32e5e94..db515e3`, `yarn.lock` excluído). Abri os 10 flows, os 4 subflows, o `config.yaml`, o matcher, a CLI e os dois workflows. Fora do diff, conferi:
- **o código real** que os flows usam: `Header.tsx` (rótulos da saudação e do aluno), `strings.ts`, `ActionBar`, `TabBar`, `LoginScreen`, `NoStudentScreen`, `SelectStudentScreen`;
- **o seed oficial** (`docs/data/responsaveis.json` e o Carlos no `seed-mapper.ts` da API);
- **o que o `maestro.yml` usa:** `api/.env.example` e o `packageManager` de cada pasta (raiz e api em `yarn@1.22.22`, mobile em `yarn@4.18.1`), e o `AndroidManifest` (`usesCleartextTraffic="${usesCleartextTraffic}"`).

Verificação no worktree (`mobile/`, HEAD `db515e3`):
- `yarn lint && yarn tsc && yarn test && yarn maestro:check` deu exit 0, com **61 suítes e 430 testes**, e "Flows do Maestro ok: 14 arquivos, 90 ids conferidos".
- `actionlint` nos dois workflows deu exit 0.
- Os flows não foram executados (sem Maestro), como declarado.

**Cada flow contra o caso de uso (seção 6) e contra o seed**, todos conferidos e sem divergência:
- **01:** Gustavo com `000000` → `login-error-message` com `(?s)` (o texto tem `\n`), continua no Login.
- **02:** "Olá, Gustavo" bate com o rótulo e com o texto (`(?i)`). O aluno é conferido pelo rótulo "Aluno X, turma …" do `Header`. TROCAR PERFIL, SAIR, título, dropdown e as abas.
- **03:** `stopApp`/`launchApp` sem `clearState`, com 12 s pela splash.
- **04:**
  - 17/03 → "Das 07:15 às 08:00, Matemática I" (1ª aula do JSON);
  - 18/03 → "Das 07:15 às 08:00, Produção e Interpretação de Textos" (1ª aula do JSON);
  - 16/03 → `agenda-empty` e "Sem aulas neste dia".
  - O dia é escolhido, sem supor o de hoje (D35). O rótulo do gatilho é "Dia: …", e o `.*` cobre o prefixo.
- **05:** "7EF - 2025". No T1, Língua Portuguesa 9,5/0 → "Nota 9,5, 0 faltas". No T2, `null`/`null` → "Nota e faltas ainda não lançadas". Os `-` só no Android. A 1ª disciplina é a do JSON.
- **06:** 2024 = 6EF, e o T1 de Língua Portuguesa é 8/1 → "Nota 8,0, 1 falta" (singular do `strings`).
- **07:** sai do Boletim e volta a ele. Rafael 7EF e Joana 12568 2EM, sem depender da ordem do `/me` (T16a).
- **08:** Adelaide `50879567007`/`987654`, Bianca 1EF. Sem TROCAR PERFIL nas duas abas.
- **09:** Carlos `31415926590`/`111111`. `no-student-screen`/`-empty`, "Nenhum aluno vinculado", saudação, SAIR, sem `tab-bar`.
- **10:** SAIR → Login. Ao reabrir, continua no Login.

**Também conferido e sem achado:**
- **Independência:** `clearState` + `clearKeychain` em todo flow, então a ordem de execução não importa. O único login errado é o do 01, e o limite por CPF só conta falhas e zera no sucesso.
- **Subflows:** fora da raiz, com o `config.yaml` em `'*'`. Os parâmetros vêm por `env`.
- **`maestro.yml`:**
  - A API sobe com `JWT_SECRET` novo e mascarado, e os limites de IP e de CPF vão para 1000. As 4 chaves existem no `.env.example` (sem a chave, o `sed` não faria nada).
  - `prisma:setup` + build + espera do health.
  - O app recebe `API_URL=http://10.0.2.2:3333/api`. O cleartext do debug vem do placeholder do RN, e o host 10.0.2.2 é o loopback do runner, que é onde a API escuta.
  - O bundle `--dev false` vai para `src/main/assets`. O RN debug sem Metro carrega o bundle do APK, e o Hermes executa JS fonte. Sem `__DEV__`, não há LogBox nem Reactotron.
  - `assembleDebug` x86_64, KVM, emulador API 34 x86_64 `google_apis` com animações desligadas.
  - JUnit + `--debug-output` como artefato, e o log da API quando falha.
  - Gatilho em `workflow_dispatch` ou label `e2e`. O `corepack` resolve yarn 1 e yarn 4 pelo `packageManager` de cada pasta.
  - Gerei o mesmo bundle na revisão da T13 (`/tmp`): o comando funciona com o metro config do Expo.
- **`mobile.yml`:** o `maestro:check` roda depois do tsc.
- **Matcher:** o `VARIABLE_VALUE` restrito recusa erro de digitação no meio de um id derivado. Provei com `boletim-year-dropdown-options-2024` e `header-logout-buton` (ambos `false`). A recursão com cache termina, porque marca `false` antes de descer.
- **TDD:** RED registrado, e a prova negativa com o flow real (exit 1 → 0) também.

### [SUGESTÃO] O matcher aceita um sufixo derivado de um componente colado em qualquer base
- Arquivo: mobile/.maestro/scripts/testids.js:60-74
- Problema: o sufixo `${testID}-x` de qualquer componente vale para qualquer id existente, não só para o `testID` passado àquele componente.
- Cenário: testei no matcher real e `agenda-lesson-0-result`, `agenda-screen-option-2025` e `login-screen-retry` dão `true`. Um flow que confunda o `-result` do boletim com a aula passa no `maestro:check` e só falha no emulador, o que vai contra o propósito da checagem.
- Correção sugerida (opcional; é uma heurística estática e o caso é raro): associar cada derivado ao componente que o declara. Um caminho é coletar, por arquivo, os sufixos de `${testID}` e os `testID="…"`/`` testID={`…`} `` passados a esse componente em JSX. Outro, mais barato, é registrar esse limite no README da pasta.

### [SUGESTÃO] CLI do Maestro sem versão fixa no CI
- Arquivo: .github/workflows/maestro.yml:145-148
- Problema: `curl … | bash` instala a última versão a cada execução (Ressalva 3 do developer).
- Cenário: uma versão nova do Maestro muda a semântica de `text` (regex sobre o rótulo acessível) ou do `scrollUntilVisible`, e o job fica vermelho sem mudança no repo. A culpa vai para o app.
- Correção sugerida: `env: MAESTRO_VERSION: <versão testada>` no passo, fixada na 1ª execução verde.

### Deixei de julgar
- Se o Maestro enxerga o texto pelo rótulo acessível do pai no iOS e os filhos de um elemento `accessible` no Android (Decisão 2 do developer, aceita no ledger): só a 1ª execução prova. Os flows usam o rótulo nas duas plataformas, e os textos internos ficam em `runFlow when: platform: Android`.
- Se o Maestro alcança a lista do dropdown dentro do `Modal` (janela própria no Android, com `statusBarTranslucent`): só a execução prova.
- Se o teclado cobre o campo de senha ou o botão no Android ao tocar pelo Maestro: o comportamento foi corrigido na T9, e a prova é a execução.
- O `maestro.yml` assume `api/` no mesmo repo: depende do merge das trilhas (decisão do ledger).
- `yarn format:check` vermelho em `transports.test.ts` (T13): o ledger já manda corrigir na rodada desta tarefa. O `mobile.yml` não roda `format:check`.

### Veredito da Tarefa 14
- **Spec ✅:** os 10 flows da seção 6 em `mobile/.maestro/`, usando os responsáveis do seed e `testID`s (D14). O `maestro.yml` tem `workflow_dispatch` (plano) e emulador Android (D32), e o `maestro:check` entra no `mobile.yml`. O M11 ("flows passam no emulador e no simulador") continua aberto até a 1ª execução, como o plano prevê ("rodam assim que o usuário instalar").
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 2 sugestões).

## Mensagens
→ chief: Tarefa 14 aprovada. Os 10 flows batem com o caso de uso, com o seed e com os rótulos e testIDs reais. O `maestro.yml` está coerente: limites altos com chaves que existem, `10.0.2.2` com cleartext do debug, bundle de produção embutido, x86_64/API 34. As 2 sugestões são opcionais: o matcher aceita sufixo derivado em qualquer base, e o Maestro não tem versão fixa. Junto com a rodada, vai o `format:check` do `transports.test.ts`, como já decidido.
→ developer (se o chief aceitar): fixar `MAESTRO_VERSION` no passo de instalação. Para o matcher, ou ligar cada sufixo `${testID}-…` ao componente que o declara, ou registrar o limite no `.maestro/README.md`.
→ qa: na 1ª execução com Maestro, os pontos de maior risco são:
- o rótulo do aluno no header no iOS (`(?i)aluno rafael,.*`);
- as opções do dropdown dentro do `Modal` no Android;
- os textos `9,5`/`-` dentro do elemento acessível no Android;
- o `scrollUntilVisible` do T2 em tela pequena.

### Rodada 1

Diff `db515e3..8ffd107` (3 commits, 5 arquivos). No worktree (`mobile/`, HEAD `8ffd107`, árvore limpa):
- `yarn lint && yarn tsc && yarn test && yarn format:check && yarn maestro:check` deu exit 0: 61 suítes, 430 testes, "All matched files use Prettier code style!" e "14 arquivos, 90 ids conferidos".
- `actionlint` nos dois workflows deu exit 0.

| Achado | Estado | Onde / o que conferi |
|---|---|---|
| `format:check` vermelho (`transports.test.ts`, T13) | **RESOLVIDO** | Só a formatação do `requireActual` mudou. O `format:check` agora passa. |
| SUGESTÃO: sufixo derivado aceito em qualquer base | **RESOLVIDO** | `testids.js` agora lê o JSX com `@babel/core` (já era devDependency) e segue a prop `testID` de componente em componente: template, `{...props}` e props `*TestID` pelo nome. O sufixo só vale para ids que chegam ao componente que o declara. Rodei o matcher novo contra o `src/` real. **Os 3 falsos positivos que achei agora dão `false`**: `agenda-lesson-0-result`, `agenda-screen-option-2025` e `login-screen-retry`. Os erros de digitação continuam recusados (`…-options-2024`, `header-logout-buton`). Os 19 ids legítimos que testei, de todos os flows, continuam `true` (`-time`, `-subject-0-grade`, `-option-2025-03-17`, `select-student-card-0`, `tab-*`, `*-error-retry`, `login-cpf-input` via spread, `agenda-empty-illustration`). A recursão tem `visited` por componente+base e `MAX_DEPTH`, então termina. O limite (testID montado numa variável antes do `return`) falha para o lado seguro, acusando o id, e está no README. O RED está registrado (`buildTestIdMatcher is not a function` e o spread do `CpfInput`, `false → true`). |
| SUGESTÃO: Maestro sem versão fixa | **RESOLVIDO** | `maestro.yml:148-149`: `MAESTRO_VERSION: 2.11.0` no `env` do passo, que é a variável que o instalador lê. O README da pasta usa a mesma versão. Não pude confirmar a release sem rede; se a 1ª execução falhar no download, é esse o lugar. |

Nenhuma quebra nova no diff. Observação que não reabre a rodada: componentes de arquivos diferentes com o mesmo nome local teriam os usos somados no matcher (chave = nome da função). Hoje não há colisão em `src/`, e o efeito seria só aceitar a mais, nunca recusar um id certo.

**Veredito da Rodada 1:** Spec ✅ · **APROVADO** (0 bloqueantes, 0 importantes). O M11 continua aberto até a 1ª execução real dos flows (qa ou CI com remote).

### Mensagens (Rodada 1)
→ chief: Tarefa 14 sem pendências e pode ser fechada no ledger. O matcher novo fecha os 3 falsos positivos que eu tinha medido e não recusa nenhum id legítimo dos flows. O Maestro está fixo na 2.11.0, e o `format:check` voltou a passar.

## Tarefa 16b

Diff: `revisao/tarefa-16b.diff` (BASE `8ffd107`, commit `730a052`; `yarn.lock` e `Podfile.lock` excluídos).

**Referência:** gerei o template com `npx @react-native-community/cli@latest init FiapSchool --version 0.88.0 --package-name br.com.fiap.school --skip-install` em `/tmp/rv16b`. Comparei com `diff -u` arquivo por arquivo e apaguei o diretório no fim.

Verificação no worktree (`mobile/`, HEAD `730a052`, árvore limpa):
- `yarn lint && yarn tsc && yarn test && yarn format:check && yarn maestro:check` → exit 0: 61 suítes, 430 testes, prettier ok, 14 arquivos e 90 ids.
- Bundles de release Android e iOS (`react-native bundle --dev false --minify true --reset-cache`, saída em `/tmp`) gerados sem erro. Isso prova o `export * as` do zod 4 com o plugin novo nas duas plataformas.
- No bundle Android, `expo-modules-core`, `ExpoModulesCore`, `globalThis.expo`, `@expo/` e `reactotron` dão **0** cada.
- `Podfile.lock`: `grep -ci expo` = 0.

**Contra o template RN 0.88:**
- **Idênticos ao template:** `android/settings.gradle`, `android/build.gradle`, `android/gradle.properties` (edge-to-edge, newArch, hermes), `ios/Podfile` e `ios/FiapSchool/AppDelegate.swift`.
- **`android/app/build.gradle`:** difere só pelo `apply from … react-native-config … dotenv.gradle`. O bloco `react { autolinkLibrariesWithApp() }` e o resto ficaram como no template, sem `entryFile`/`cliFile`/`export:embed`.
- **`MainApplication.kt`:** é o do template (`ReactApplication`, `getDefaultReactHost(applicationContext, PackageList(this).packages)`, `loadReactNative(this)`). Só ganhou o `import androidx.appcompat.app.AppCompatDelegate` e `setDefaultNightMode(MODE_NIGHT_YES)` antes do `loadReactNative`. Os imports batem com os usos.
- **`MainActivity.kt`:** é o do template (`DefaultReactActivityDelegate`, `fabricEnabled`, `getMainComponentName` = `FiapSchool`). Ganhou `onCreate` com `RNScreensFragmentFactory` e `RNBootSplash.init(this, R.style.BootTheme)` antes do `super.onCreate`. Os imports `android.os.Bundle`, `com.swmansion.rnscreens…` e `com.zoontek.rnbootsplash…` estão presentes.
- **`styles.xml` e `AndroidManifest.xml`:** o que é nosso está lá: `BootTheme` com `Theme.BootSplash`, os `bootsplash_logo` nas 5 densidades, `windowBackground` e contraste das barras desligado, `BootTheme` na activity. O cleartext continua pelo placeholder do template.
- **`SceneDelegate.swift`:** é o do template, com módulo `FiapSchool`. Ganhou `import RNBootSplash` e `override func customize(_ rootView:)`, que chama `super` e depois `RNBootSplash.initWithStoryboard("BootSplash", rootView:)` (a forma da lib para o `RCTReactNativeFactory`).
- **`Info.plist`:** `pt-BR`, "FIAP School", `UIAppFonts` (4 Montserrat), `UILaunchStoryboardName` = `BootSplash`, `UIStatusBarStyleLightContent`, `UIUserInterfaceStyle` = `Dark`. O ATS continua igual ao do template.
- **`project.pbxproj`:** a fase "Bundle React Native code and images" é byte a byte a do template, e `IPHONEOS_DEPLOYMENT_TARGET` = 15.1 nos 4 blocos, como no template. As fontes estão em Resources, com `developmentRegion = "pt-BR"` e `br.com.fiap.school`. Não sobra `Expo`, `ExpoModulesProvider` nem `EXPO_CONFIGURATION`.
- **`babel.config.js`:** preset do template + `@babel/plugin-transform-export-namespace-from` e **`react-native-worklets/plugin` por último**. `metro.config.js` é do template, com `useWatchman: false`. `index.js` registra `FiapSchool` pelo `app.json`, sem `registerRootComponent`.
- **`package.json`, `jest.config.js`, `.gitignore`:** sem `expo`/`babel-preset-expo` e sem padrões do Expo. Fora de `node_modules`/`Pods`/`build`/`.yarn`/`yarn.lock`, o grep por "expo" (sem `export`/`exponent`) só acha o README (abaixo).
- **`redact`:** sai `expopushtoken`, porque o push foi removido. O teste foi adaptado.

### [IMPORTANTE] `mobile/README.md` ainda diz que o app usa Expo Modules
- Arquivo: mobile/README.md:3
- Problema: o texto diz "React Native CLI 0.88 + TypeScript + Restyle, com Expo Modules (SDK 58)." Desde este commit não há Expo no app. Também faltam os passos que esta mudança exige de quem já tinha o projeto: `pod install` de novo e `yarn start --reset-cache`, porque o babel mudou e o cache do Metro guarda a transformação do preset antigo.
- Cenário: o avaliador lê o README da pasta e conclui que o app depende do Expo, o oposto do que a tarefa fez e do que o enunciado pede (RN CLI e só as dependências necessárias). Quem atualiza a branch e roda `yarn start` sem `--reset-cache` pode receber o bundle transformado pelo `babel-preset-expo`, que já não está instalado.
- Correção sugerida: trocar a linha 3 por "React Native CLI 0.88 + TypeScript + Restyle." e acrescentar no bloco de comandos a nota "depois de atualizar: `cd ios && pod install` e `yarn start --reset-cache`". O developer já apontou isso para a T17. Como é uma linha e o texto está errado a partir deste commit, vale corrigir nesta tarefa.

### Deixei de julgar
- Build Android: não há JDK aqui, e a prova é o `mobile.yml`. A comparação com o template não acusa nada que impeça compilar: os imports estão completos, `loadReactNative`/`getDefaultReactHost` vêm do template e o `settings.gradle` é idêntico.
- `@expo/*` no `yarn.lock` via `react-native-bootsplash` (gerador de assets): decisão aceita no ledger. Não entra no bundle nem nos pods.
- iOS mínimo 15.1 e o plugin `export-namespace-from`: decisões aceitas no ledger. Os dois bundles de release confirmam o plugin.
- Metro antigo na 8081 (PID 35131): pendência de ambiente do ledger, não é código.

### Veredito da Tarefa 16b
- **Spec ✅**: `expo` e afins saíram do `package.json`. AppDelegate, SceneDelegate, MainApplication, MainActivity, Podfile, settings.gradle e babel voltaram ao template do RN 0.88, preservando bootsplash, fontes, modo escuro, nome do módulo, `react-native-config`, `RNScreensFragmentFactory`, edge-to-edge e pt-BR. O iOS foi provado em build e vídeo, e o Android está configurado. Nada além do plano.
- **Qualidade: APROVADO** (0 bloqueantes), com 1 importante: o README da pasta ainda cita Expo.

## Mensagens
→ chief: Tarefa 16b aprovada. A comparação com um template RN 0.88 gerado agora não acusa nada: settings/build.gradle, gradle.properties, Podfile e AppDelegate estão idênticos, e o resto só tem o que é nosso. Os bundles de release das duas plataformas saem sem Expo e sem Reactotron. O único achado é o `mobile/README.md:3`, que ainda diz "com Expo Modules (SDK 58)". É uma linha, e eu corrigiria nesta tarefa, junto com a nota de `pod install` + `yarn start --reset-cache`.
→ developer: `mobile/README.md:3` deve passar a dizer "React Native CLI 0.88 + TypeScript + Restyle." Acrescente a nota de atualização (`cd ios && pod install`, `yarn start --reset-cache`).
→ qa: depois de puxar a branch, rode `pod install` e `yarn start --reset-cache` (e pare o Metro antigo da 8081). Confira a splash, as fontes e o tema escuro no iOS. O Android só pelo APK do CI.

## Revisão final — branch mobile

BASE 40c8577..b6bdc22 (`feat/mobile`, Tarefas 7–16b). Li o `revisao/branch-mobile.diff` e todo o `mobile/src`, a configuração nativa, os workflows e os flows do Maestro no worktree. Conferi os schemas zod contra os DTOs de resposta do worktree da API (00ae8cc).

### Verificação (rodada por mim no worktree)
- `yarn lint`: 0. `yarn tsc`: 0. `yarn format:check`: ok. `yarn maestro:check`: 14 arquivos, 90 ids.
- `yarn test --coverage`: 61 suítes e 430 testes passando, sem aviso de `act` nem `console.error` na saída. Cobertura de 98,24% em statements e 92,29% em branches (o número inclui `src/test/**`, `jest/mocks` e `.maestro/scripts`).
- `actionlint` em `mobile.yml` e `maestro.yml`: limpo.
- Bundles de release em `/tmp/rv-bundle`: Android 3,28 MB, iOS 3,28 MB. Não há `reactotron`, `expo`, `msw` nem `@testing-library`. O source map dá 3006 KB, assim: react-native 670, reanimated 644, **zod 485 (281 só de `zod/v4/locales`)**, **react-native-gesture-handler 162**, svg 117, código do app 162.
- `npx depcheck`: aponta `@types/react-refresh` e `react-refresh` sem uso. Os outros itens são falso positivo (CLI, babel, `react-native-screens` usado como peer).
- Contrato: `meSchema`, `loginResponseSchema`, `agendaSchema`, `reportCardsSchema` e `reportCardSchema` batem campo a campo com `MeResponse`, `LoginResponse`, `AgendaDayResponse`, `ReportCardSummaryResponse` e `ReportCardResponse`. O MSW devolve 404 no formato do Nest.
- Restos de OTA, push e Expo: nada em código, native, workflows nem README do app.

### [IMPORTANTE] `react-native-gesture-handler` instalado sem uso (e dois devDeps sobrando)
- Arquivo: mobile/package.json:30; mobile/src/app/App.tsx:5 e :21–30; mobile/jest.config.js:7; mobile/package.json:59 e :65
- Problema: nenhum código usa gesto. O único uso é o `GestureHandlerRootView` em volta do app. Nenhuma lib instalada exige o pacote: os peers de `@react-navigation/native-stack` 7.21 e `bottom-tabs` 7.21 são só `safe-area-context` e `screens`. `react-refresh@0.19` e `@types/react-refresh` foram adicionados na cb16f21 sem justificativa no `02-dev.md`. Nada importa os dois, e o próprio `react-native` já traz o `react-refresh` dele (0.14).
- Cenário: o enunciado pede "apenas as dependências necessárias", e o avaliador abre o `package.json`. Ali está um módulo nativo que entra no APK e no IPA, é compilado nas 4 ABIs do Android e põe 162 KB no bundle de release sem ser usado. Os dois devDeps aparecem como sobra no `depcheck`.
- Correção sugerida: remover `react-native-gesture-handler` do `package.json`; trocar o `GestureHandlerRootView` por nada (o `SafeAreaProvider` vira a raiz) ou por um `View` com `flex: 1`; tirar o `setupFiles` do `jest.config.js`; remover `react-refresh` e `@types/react-refresh`; rodar `pod install`. Depois disso, `yarn test`, build iOS e o job `android` do CI.

### [IMPORTANTE] Logo e ilustração em 1×: borrados na splash, no login e no estado vazio
- Arquivo: mobile/assets/logo-fiap-school.png (250×40 px) exibido em `sizes.logoLogin` 306×49 pt (mobile/src/theme/sizes.ts:18); mobile/assets/no-classroom.png (328×290 px) exibido com 328 pt de largura (sizes.ts:19)
- Problema: o logo é ampliado até numa tela 1×. Num iPhone 3× cada pixel do PNG cobre quase 4 pixels físicos, e a ilustração fica em 1× nas telas 2× e 3×. O ledger (linha 27) registrou isso como pendente até o usuário exportar do Figma, e não houve export depois.
- Cenário: a splash animada e o Login são as duas primeiras telas que o avaliador vê, e as duas mostram o logo grande e borrado. A mesma ilustração aparece em "Sem aulas neste dia" e no "sem aluno". O M12 (visual fiel ao Figma) cai na primeira impressão.
- Correção sugerida: o usuário exporta o nó 4001:4 do Figma em SVG e o 2:66 em PNG @2x/@3x, como o ledger já diz. Com o SVG, o logo pode ser desenhado com o `react-native-svg`, que já está no app. Isso vale para os três usos, e o selo da splash continua cortado por proporção (`sizes.logoBadge`). A ilustração entra como `no-classroom@2x.png`/`@3x.png` ao lado da atual, sem mexer no código. Precisa ser resolvido antes do PR. Depende do usuário.

### [SUGESTÃO] Código morto que só aparece olhando o conjunto
- Arquivo: mobile/src/theme/theme.ts:249–257; mobile/src/components/EmptyState.tsx:19, :73, :112–119; mobile/src/components/ErrorState.tsx:17, :40, :79; mobile/src/components/Screen.tsx:13, :31, :40, :81; mobile/src/stores/session.store.ts:17, :30, :60
- Problema: `cardVariants.studentSelected` não é usado: o `StudentCard` anima a borda sobre a variante `student`. A prop `action` do `EmptyState` e a `retryTestID` do `ErrorState` só aparecem nos testes deles. A prop `edges` da `Screen` nunca é passada, então o ramo `bottom` (linhas 40 e 81) nunca roda. `guardian` é gravado no store pelo `signIn`, mas nenhuma tela lê: Header, NoStudent e Login usam o `/me`.
- Cenário: quem mantém o código (ou o avaliador lendo) segue `guardian` do store achando que é a fonte do nome no Header e encontra dois lugares com o responsável, um deles sem leitor. As props sem uso pedem teste e documentação de comportamento que o app não tem.
- Correção sugerida: apagar a variante, as duas props (com os testes delas) e o ramo `edges`. Tirar `guardian` do estado e do `signIn` (`signIn(token)`), ajustando os testes do store e do `useLoginMutation`.

### [SUGESTÃO] Textos fora do `strings.ts` e strings repetidas
- Arquivo: mobile/src/features/splash/SplashScreen.tsx:14–15; mobile/src/components/CpfInput.tsx:19 (e `strings.login.cpfHint` em strings.ts:9 sem uso); mobile/src/features/auth/api/useLoginMutation.ts:8–9; mobile/src/constants/strings.ts:7/27 e :31/:93
- Problema: o `strings.ts` diz que as telas leem dali "para não duplicar texto". Mesmo assim, a splash define `'FIAP School'` e `'Carregando'` no próprio arquivo, o `CpfInput` escreve "Somente números" à mão enquanto `strings.login.cpfHint` existe sem uso, e a mensagem de falha do keychain está no hook. `header.studentInfo` e `selectStudent.studentInfo` são a mesma função, e `login.logoLabel` e `header.logoLabel` são o mesmo texto.
- Cenário: alguém troca o hint do CPF no `strings.ts` (e no teste que lê de lá) e a tela não muda.
- Correção sugerida: usar `strings.login.cpfHint` no `CpfInput`; levar os rótulos da splash e a mensagem de storage para `strings`; unificar `studentInfo` e `logoLabel` em `strings.common`.

### [SUGESTÃO] Mesma lógica copiada entre telas e ViewModels
- Arquivo: o builder `FadeInDown.duration(motion.base).delay(…).easing(motion.easeOut).withInitialValues({translateY: motion.enterOffsetSmall}).reduceMotion(System)` aparece em LessonsScreen.tsx:32, ReportCardScreen.tsx:32, SelectStudentScreen.tsx:51, Header.tsx:56, ErrorState.tsx:53, EmptyState.tsx:54, LessonItem.tsx:34 e LoginErrorMessage.tsx:31. useAgendaViewModel.ts:40–92 e useReportCardViewModel.ts:67–133 repetem a mesma máquina de estado (`stateFor` que zera ao trocar de aluno, `retrying`, `failedRetries`, `firstContentKey`/`firstContentLeft`).
- Problema: são 8 cópias da entrada padrão e duas da máquina de "tentar de novo + 1ª entrada". Para mudar a curva da entrada é preciso editar 8 arquivos. Uma correção na máquina feita só num ViewModel deixa a outra aba com o bug: a Tarefa 13 já corrigiu o texto do retry só no Boletim, e aquilo era específico de lá.
- Cenário: ajuste de `enterOffsetSmall` ou do easing que o designer peça → 8 lugares; esquecer um deixa uma tela com entrada diferente das outras (R10/M9).
- Correção sugerida: criar um `enterDown(motion, delay)` em `theme/motion.ts` (ou `hooks/`) e dois hooks pequenos, `useRetry(query)` e `useFirstContentDelay(contentKey, ready)`, cada um com o teste que hoje está espalhado nos dois ViewModels.

### [SUGESTÃO] React Query sem `focusManager`/`onlineManager`: nada é recarregado ao voltar do background
- Arquivo: mobile/src/app/queryClient.ts:25–41
- Problema: no RN, o TanStack Query não sabe quando o app volta ao primeiro plano nem quando a rede volta, se ninguém ligar o `AppState` ao `focusManager`. As abas ficam montadas, então nenhum observer novo aparece, e o `staleTime` de 5 min nunca dispara refetch. O comentário "5 min sem refetch automático" sugere que depois disso há refetch, e não há.
- Cenário: o responsável abre a Agenda, deixa o app em background até o dia seguinte e volta. Agenda, boletim e `/me` são os da véspera até ele trocar de aluno ou reabrir o app. Se o token venceu nesse meio-tempo (7 dias), a tela continua com dado em cache até o primeiro request.
- Correção sugerida: em `App.tsx`, `focusManager.setEventListener` com `AppState.addEventListener('change', s => setFocused(s === 'active'))`, como manda a doc do TanStack para RN. Com isso, voltar ao app refaz as queries vencidas. O `onlineManager` pede NetInfo e pode ficar de fora.

### [SUGESTÃO] 281 KB de locales do zod no bundle
- Arquivo: mobile/src/features/*/schemas.ts e mobile/src/services/http/errors.ts (`import { z } from 'zod'`); mobile/babel.config.js:5
- Problema: `zod` e `zod/mini` reexportam `export * as locales` (v4/classic/external.js:13 e v4/mini/external.js:9). O Metro não faz tree-shaking, então as ~40 traduções entram inteiras: 281 KB dos 3006 KB do bundle, quase 10%. O app usa só mensagens próprias.
- Cenário: o bundle de release (e o bytecode Hermes) carrega 281 KB de texto que nunca é usado. O efeito na abertura é pequeno com Hermes, mas é peso que aparece em qualquer análise de bundle.
- Correção sugerida: um `resolver.resolveRequest` no `metro.config.js` que troque `zod/v4/locales/index.js` por um módulo com só o `en`. Conferir com o mesmo cálculo pelo source map. É opcional.

### [SUGESTÃO] Ícone do app ainda é o do template
- Arquivo: mobile/android/app/src/main/res/mipmap-*/ic_launcher*.png (md5 igual ao do template, commit 52649c8); mobile/ios/FiapSchool/Images.xcassets/AppIcon.appiconset/Contents.json (sem imagens)
- Problema: no Android aparece o ícone padrão do React Native, e no iOS o ícone fica em branco.
- Cenário: o avaliador instala o APK do CI e vê na tela inicial o ícone genérico do RN.
- Correção sugerida: gerar os ícones a partir do selo FIAP (nada no brief pede isso, então fica a critério do chief).

### Deixei de julgar
- APK de release sem cleartext (o `usesCleartextTraffic` do template é false em release): é da Tarefa 17 (network security config / CD), conforme o ledger.
- `maestro.yml` sobe a `api/`, que só existe depois de juntar as trilhas. Os flows e o job Android nunca rodaram (sem JDK/Maestro aqui), então o M11 segue aberto até o primeiro CI real.
- Boletim abre no ano mais recente, não num 2025 fixo. Com o seed, os dois dão 2025, e a restrição do brief é atendida.
- D5 previa `repositories/` (DTO → domínio). O mapeamento ficou nos ViewModels e os tipos saem dos schemas. Foi aceito tarefa a tarefa e não muda comportamento.
- A nota de atualização no `mobile/README.md:15–17` foi pedida por mim na revisão da 16b. A limpeza para o avaliador fica com o README final da Tarefa 17.
- Um `package.json` inteiro do nitro/mmkv dentro do bundle (lido para pegar a versão): trivial.
- Adiado do ledger da trilha mobile: "Tarefa 11 — ViewModel importando `motion` do tema (opcional)". **Não precisa ser corrigido antes do PR.** São constantes de tempo, sem estado nem dependência de UI, e a sugestão de duplicação acima já reduz esse uso. Os outros adiados do ledger são da API ou do tooling e estão fora desta branch.

### Veredito da revisão final — branch mobile
**APROVADO** (0 bloqueantes), com 2 importantes: remover o `react-native-gesture-handler` e os devDeps sem uso, e o logo/ilustração em resolução 1×. O segundo depende do export do Figma pelo usuário. As 6 sugestões são opcionais. O conjunto está coerente: o contrato com a API bate, a sessão e o 401 estão cobertos de ponta a ponta no `App.test.tsx`, todas as telas têm entrada animada, não há cor nem espaçamento literal fora do tema e não sobrou nada de Expo, OTA ou push.

## Mensagens
→ chief: revisão final do mobile APROVADA, com 0 bloqueantes e 2 importantes. (1) `react-native-gesture-handler` não tem uso: só o `GestureHandlerRootView`, e nenhuma lib pede o pacote. São 162 KB no bundle mais o módulo nativo, contra o "apenas as dependências necessárias" do enunciado. `react-refresh` e `@types/react-refresh` também sobram. A correção é pequena, mas mexe no nativo (pod install + CI Android). (2) Logo (250×40 px exibido a 306×49 pt) e ilustração em 1×: ficam borrados na splash e no Login. Depende do usuário exportar do Figma (nó 4001:4 SVG; 2:66 @2x/@3x), como já está no ledger. Das 6 sugestões, as baratas são código morto, `strings` e `focusManager`. A de duplicação (enterDown, retry) é refatoração sem mudança de comportamento. O adiado da T11 pode ficar.
→ developer: se o chief abrir rodada, comece por `package.json:30,59,65`, `App.tsx:5,21–30` e `jest.config.js:7`. Depois venha o código morto da seção acima (`theme.ts:249`, `EmptyState.action`, `ErrorState.retryTestID`, `Screen.edges`, `session.guardian`) e o `CpfInput` usando `strings.login.cpfHint`.
→ qa: na comparação com o Figma (M12), confira o logo no Login e na splash num iPhone 3× e a ilustração do "Sem aulas" (hoje estão em 1×). Confira também o ícone do app na tela inicial do Android.

### Rodada 1
Re-review restrito do diff b6bdc22..537a032 (7 commits).

**Verificação:** `yarn lint` 0 · `yarn tsc` 0 · `yarn format:check` ok · `yarn maestro:check` 14 arquivos e 90 ids · jest com 63 suítes e 440 testes passando, sem aviso de `act` nem `console.error`, cobertura de 98,34% em statements e 92,42% em branches · `actionlint` limpo (os workflows não mudaram). Bundles de release em `/tmp/r1-bundle`: Android 2,77 MB e iOS 2,77 MB, antes 3,28 MB. O source map já não tem o pacote `react-native-gesture-handler`. As 7 ocorrências de "GestureHandler" são da view config do próprio RN (`onGestureHandlerEvent`). O zod caiu de 485 para 207 KB, com 3 KB de locales (só o `en`). Não há Reactotron, Expo Modules nem MSW no bundle.

- **[IMPORTANTE] dependências sem uso: RESOLVIDO** (565fa1f). `react-native-gesture-handler`, `react-refresh` e `@types/react-refresh` saíram do `package.json:27–65` e do `yarn.lock`. O `GestureHandlerRootView` saiu do `App.tsx`, cuja raiz agora é o `SafeAreaProvider`. O `setupFiles` saiu do `jest.config.js`, e o `Podfile.lock` perdeu o `RNGestureHandler`. Nada no Android referenciava o pacote.
- **[IMPORTANTE] logo/ilustração em 1×: NÃO RESOLVIDO.** Depende do export do Figma pelo usuário, como o chief registrou. Segue pendente para o PR.
- **[SUGESTÃO] código morto: RESOLVIDO** (4ae048e). `studentSelected` saiu de `theme.ts`, `action` do `EmptyState`, `retryTestID` do `ErrorState` (agora sempre `${testID}-retry`, o id que o Maestro usa) e `edges` da `Screen` (`paddingTop: insets.top`; `keyboardVerticalOffset` = `footer ? -insets.bottom : 0`, o mesmo comportamento de antes). `guardian` saiu do store e `signIn(token)` ficou com um parâmetro. Os testes acompanharam.
- **[SUGESTÃO] textos fora do `strings.ts`: RESOLVIDO** (a874ef3). `CpfInput` usa `strings.login.cpfHint`. A splash usa `strings.common.logoLabel` e `strings.splash.loadingAccessibilityLabel`. A mensagem de storage virou `strings.login.error.storage`. `studentInfo` e `logoLabel` estão unificados em `strings.common`.
- **[SUGESTÃO] `FadeInDown` copiado: RESOLVIDO** (7055d96). `enterDown(motion, delay)` em `theme/motion.ts:75–86` tem teste próprio e substitui as cópias em Header, ErrorState, EmptyState, LessonItem, LoginErrorMessage, LessonsScreen, ReportCardScreen e SelectStudentScreen. O `LoginScreen` mantém o builder dele, e isso está certo: ele usa `enterOffset` (12) e não o `enterOffsetSmall` (8). A parte da máquina de retry foi adiada pelo chief.
- **[SUGESTÃO] `focusManager`/`AppState`: RESOLVIDO** (d4bb83e). `connectFocusToAppState(AppState)` (`app/appFocus.ts`) é chamado uma vez no carregamento do `App.tsx`. O teste prova as duas coisas: o foco vira false/true com background/active, e uma query vencida é refeita ao voltar. O comentário do `STALE_TIME_MS` está corrigido.
- **[SUGESTÃO] locales do zod: RESOLVIDO** (537a032). O `resolveRequest` do `metro.config.js` chama o resolver padrão (`context.resolveRequest`) e só troca o arquivo resolvido `zod/v4/locales/index.(c)js` pelo `metro/zod-locales.js`, que exporta só o `en`. Não há laço: o shim importa `locales/en.js`, que não bate no regex. **As mensagens de validação continuam certas:** o zod registra o `en` padrão por import direto em `classic/schemas.js:6–12` (`core.config(en())`), sem passar pelo índice. O app não usa `z.locales` nem `z.config` (grep vazio). A única mensagem de validação que aparece na tela é a própria (`CPF_INVALID_MESSAGE`); a senha vazia só desabilita o botão; e o `parseResponse` registra apenas `path` e `code`. O bundle mantém os textos em inglês ("Invalid input") e não tem outros idiomas. O Jest não passa pelo Metro e usa o zod inteiro, então os testes não exercitam o shim. A prova é o bundle.
- **Itens de segurança no mesmo diff (f9758e4), conferidos só quanto a quebra de código:** nada quebra. A marca `secureStorage.installed` no mmkv apaga o token que o keychain do iOS guarda de uma instalação anterior. A `pendingClear` impede que um logout cujo `resetGenericPassword` falhou reabra a sessão. `setToken` grava a marca e limpa a pendência. O log da falha virou `error`, sem o token (há teste). Efeito colateral esperado: quem já tem o app instalado antes desta versão (só aparelhos de dev e QA) cai no Login uma vez ao atualizar, porque a marca ainda não existe. Não afeta o avaliador, que instala do zero.

**Quebra nova no diff:** nenhuma.

**Veredito da rodada 1:** **APROVADO** (0 bloqueantes). Fica aberto 1 importante, o logo/ilustração em 1×, que depende do usuário. As outras 5 correções pedidas estão resolvidas.

## Mensagens
→ chief: rodada 1 da revisão final do mobile APROVADA. As 6 correções pedidas estão resolvidas, sem quebra nova. O bundle de release caiu de 3,28 para 2,77 MB e não tem mais o gesture-handler. A troca dos locales do zod não muda nenhuma mensagem que o usuário veja, porque o zod registra o `en` por import direto e o app só mostra mensagens próprias. Só o logo/ilustração em 1× continua aberto, dependendo do export do Figma. Para o QA: quem já tinha o app instalado cai no Login uma vez por causa da marca de instalação, e isso é esperado.
→ qa: depois de atualizar o app no simulador, faça login de novo (a marca de instalação é nova). Rode `pod install`, porque o RNGestureHandler saiu. Confira também que voltar do background depois de 5 min recarrega a Agenda.

## Tarefa 17 — parte 2

Escopo: diff `44f6184..e32fe3b` na `release/v1` (README final, 5 GIFs, `mobile/README.md`, `mobile/.maestro/README.md`, `mobile/.prettierignore`). Conferido contra o worktree `release`, `05-qa.md` e o `02-dev.md` da parte 2.

### O que conferi e bate
- Comandos: `yarn maestro:check` existe (`mobile/package.json`); as tags `login`, `agenda`, `boletim` e `alunos` existem nos flows; o `05-boletim-2025.yaml` e as 4 subflows existem; Maestro 2.11.0 é a versão do `maestro.yml`; o gatilho do workflow (manual e PR com label `e2e`) bate com a tabela. Bundle id `br.com.fiap.school` e o scheme `FiapSchool` batem com o `project.pbxproj`. `ios/build/` e `vendor/bundle/` estão no `.gitignore`. `GuardianStudent.position` existe no `schema.prisma`.
- Resto de Expo, push, OTA e gesture-handler: o grep do README só acha "sem Expo" e "Sem push e sem atualização OTA" (as duas frases honestas, nas limitações) e o `export * as` do zod. Nenhum "previsto", "a gravar", "a confirmar" ou "no fechamento".
- Avisos do que nunca rodou: Docker (Opção B), Android (limitação e pré-requisitos), Maestro (seção própria, limitação e `.maestro/README.md`) e CI ("Nenhum workflow rodou ainda") estão declarados, sem afirmar execução.
- Links relativos: todos existem na `release/v1`, inclusive `evidencias/qa/`, `2026-10-28-app-v2/`, `mobile/.maestro/README.md` e os 5 `docs/media/*.gif`. As âncoras `#ios-macos`, `#flows-do-maestro`, `#github-actions-githubworkflows` e `#opção-b-docker` batem com os títulos. `05-qa.md` existe (só citado em tabela, sem link).
- GIFs: 320x694 cada, de 198 a 442 KB (total 1,7 MB). Abri o `boletim.gif`: o texto do app está legível nessa largura.
- Início rápido, caminhos A e B: A segue a execução registrada no `02-dev.md` (Ruby 3 do Homebrew, `bundle install`, `yarn ios`); o aviso do Ruby 2.6 e do erro "Something went wrong while installing CocoaPods" é o mesmo que o QA reproduziu. B explica por que usar o UDID (`name=` falha com runtime mais novo sem iPhone 16), que é o ponto que derrubou o avaliador sem contexto. Um avaliador de macOS com Ruby do sistema chega a um app rodando por um dos dois.

### Achados

### [IMPORTANTE] Caminho B: `cd mobile/ios` parte do diretório errado
- Arquivo: README.md, bloco da linha de comando do Caminho B (`cd mobile/ios`)
- Problema: o bloco anterior termina em `cd ios && pod install && cd ..` (o terminal está em `mobile/`). O bloco seguinte, "em outro terminal", começa com `cd mobile/ios`, que só vale a partir da raiz, e o texto não diz de onde. Se o avaliador reaproveitar o terminal do `pod install` (ou o do Metro, que também está em `mobile/`), cai em `cd: no such file or directory: mobile/ios`.
- Cenário: avaliador do caminho B copia o bloco no terminal que já está em `mobile/`, o `cd` falha e o `xcodebuild` roda na pasta errada ("does not contain an Xcode project").
- Correção sugerida: usar `cd ios` (o mesmo ponto de partida dos blocos anteriores) ou dizer "a partir da raiz do repositório".

### [IMPORTANTE] Linha `revisao/` duplicada na tabela de artefatos
- Arquivo: README.md:740 e 742
- Problema: a edição inseriu a linha `revisao/` de novo, sem remover a antiga. A tabela mostra "`revisao/` | Os diffs entregues aos revisores" duas vezes.
- Cenário: o avaliador vê um erro de revisão logo no README da entrega, que é o documento que ele lê primeiro; o outro erro de tabela desse tipo faria o resto parecer descuidado.
- Correção sugerida: apagar uma das duas linhas.

### [SUGESTÃO] `mobile/Gemfile.lock` aparece no `git status` depois do Caminho A
- Arquivo: mobile/.gitignore (sem entrada), README.md (parágrafo do `Podfile.lock`)
- Problema: o README manda o avaliador desfazer na mão (`git checkout -- ios/Podfile.lock && rm Gemfile.lock`). O `vendor/bundle` está ignorado, o `Gemfile.lock` não.
- Correção sugerida: opcional, `Gemfile.lock` no `mobile/.gitignore`, ou manter a nota como está. Não afeta o build.

### [SUGESTÃO] README com 711 linhas, e o Início rápido ficou com um aviso maior que o bloco de comandos
- Arquivo: README.md:13-52
- Problema: o aviso do Ruby ocupa cerca de 15 linhas entre o bloco de comandos e a credencial de login, e repete o que a seção iOS (linhas 365-425) detalha de novo. Quem lê só o topo recebe as duas alternativas sem o Caminho B completo.
- Correção sugerida: encurtar o aviso a 3 linhas com o link para [iOS](#ios-macos). Opcional.

### Deixei de julgar
- Se `bundle install` + `yarn ios` do Caminho A e o `xcodebuild` do Caminho B funcionam em outra máquina: confio na execução do `02-dev.md` e do QA num clone limpo; não rodei (sem simulador aqui). rbenv e asdf, o Xcode pela interface e o iPhone físico não foram testados nem pelo developer, e o README não afirma que foram.
- Android, Docker, Maestro e os três workflows no GitHub: sem JDK, Docker, Maestro nem remote, só dá para conferir que o texto não afirma execução.
- O conteúdo do `05-qa.md` e das evidências (vídeos): são do QA, não da tarefa; só conferi que existem.
- `ReduceMotion` nos GIFs e se os GIFs mostram todos os fluxos prometidos nas legendas: as legendas vêm do roteiro do QA; vi só um GIF.
- "v2 de interface" nos próximos passos: a pasta `2026-10-28-app-v2/` existe, mas não li o conteúdo.

### Veredito da Tarefa 17 — parte 2
- **Spec ✅:** README final sem resto de Expo, push, OTA, gesture-handler nem "previsto"; avisos honestos de Docker, Android, Maestro e CI; links relativos todos válidos; GIFs legíveis e leves; `.prettierignore` com `vendor`; Maestro 2.11.0 e Java 17 corretos.
- **Qualidade: APROVADO** (0 bloqueantes), com 2 importantes de uma linha cada (`cd mobile/ios` e a linha `revisao/` duplicada) e 2 sugestões.

## Mensagens
→ chief: parte 2 aprovada, sem bloqueante. Antes do PR, corrija o `cd mobile/ios` do Caminho B (use `cd ios`) e apague a linha `revisao/` duplicada na tabela de artefatos (README.md:740-742). Ambos são de uma linha. Os gates externos seguem como estavam: a primeira execução real de Docker, `assembleDebug` e Maestro só acontece num CI com remote.
→ developer: depois dos dois ajustes não precisa de nova rodada de review, só de conferência do chief.
