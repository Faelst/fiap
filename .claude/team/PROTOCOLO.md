# Protocolo do time de desenvolvimento do FIAP School

Seis agents, cada um com uma responsabilidade, trabalhando sobre o monorepo do
teste técnico FIAP School (`api/` + `mobile/` + raiz). Este arquivo é a regra
comum: todo agent lê antes de começar. Acima dele só valem o `CLAUDE.md` da
raiz e o `00-brief.md` da tarefa.

| Agent | Arquivo | Responsabilidade |
|---|---|---|
| chief | `.claude/agents/chief.md` | Recebe o pedido do usuário, decide, orquestra, abre os PRs e relata |
| designer | `.claude/agents/designer.md` | Especifica a tela a partir do Figma e do tema Restyle |
| developer | `.claude/agents/developer.md` | Escreve o código, os testes unitários e o teste de regressão |
| qa | `.claude/agents/qa.md` | Testes de integração da API (curl/supertest) e de tela no iOS simulator (e no Maestro, quando instalado) |
| code-reviewer | `.claude/agents/code-reviewer.md` | Review crítico: padrão do projeto, correção, testes |
| cyber-security | `.claude/agents/cyber-security.md` | Review de segurança da implementação |

## Como os agents conversam

Subagents não abrem outros subagents. Quem orquestra é o **chief rodando como
sessão principal**, aberto na raiz do repositório:

- `claude --agent chief`, ou
- numa sessão comum, `/squad <pedido>`.

A conversa entre os agents acontece por dois canais, sempre os dois:

1. **Pasta da tarefa** (canal durável). Cada tarefa tem
   `.claude/team/tarefas/AAAA-MM-DD-<slug>/` e cada agent escreve o próprio
   arquivo nela. Todo agent pode e deve ler os arquivos dos outros. A pasta é
   versionada: é a prova do SDD para o avaliador.

   | Arquivo | Quem escreve |
   |---|---|
   | `00-brief.md` | chief: pedido, decisões, escopo, critérios de aceite; é o documento de design aprovado pelo usuário |
   | `00-plano.md` | chief: as tarefas de implementação, na ordem, com trilha e worktree |
   | `00-ledger.md` | chief: andamento de cada tarefa e as decisões tomadas no caminho |
   | `01-design.md` | designer: especificação de tela |
   | `02-dev.md` | developer: o que mudou, branches, testes, como rodar (uma seção por tarefa) |
   | `03-review.md` | code-reviewer (uma seção por tarefa e uma da branch inteira) |
   | `revisao/` | chief: os diffs entregues ao code-reviewer (`tarefa-N.diff`, `branch-<trilha>.diff`) |
   | `04-security.md` | cyber-security |
   | `05-qa.md` | qa: roteiro executado, evidências, resultado |
   | `99-relatorio.md` | chief: relatório final ao usuário |

   Rodadas seguintes acrescentam uma seção `## Rodada N` no mesmo arquivo (no
   `02-dev.md` e no `03-review.md`, `### Rodada R` dentro da seção da tarefa);
   não apagam a anterior.

   Os arquivos da pasta da tarefa ficam no **checkout principal** (a raiz), não
   nos worktrees: assim todos leem a mesma versão.

2. **Mensagens pelo chief** (canal rápido). Todo agent termina a resposta com a
   seção `## Mensagens` (ex.: `→ developer: o botão usa a variant "primary" do
   tema, não cor literal`). O chief repassa com `SendMessage` ao agent
   destinatário, que continua com o contexto que já tinha. Dúvida que só o
   usuário responde vai como `→ chief (usuário): ...`.

## Fluxo

```
usuário ⇄ chief (brainstorming → 00-brief aprovado)
        → chief (00-plano + 00-ledger)
        → designer (01-design)                       só se houver tela
        → para cada tarefa do plano, uma por vez em cada trilha:
             developer novo (TDD, commit)  → 02-dev ## Tarefa N
             code-reviewer da tarefa       → 03-review ## Tarefa N
             correção + re-review restrito, até 3 rodadas
        → code-reviewer da branch inteira (03) + cyber-security (04)   em paralelo
        → developer corrige numa leva só      → re-review restrito
        → qa (05)                                    API e tela
        → developer corrige falha de QA       → re-review restrito → qa
        → chief fecha a branch: suíte verde, push, PR (nunca merge)
        → chief escreve 99-relatorio e notifica o usuário
```

- Achado **BLOQUEANTE** de review, segurança ou QA volta ao developer.
  **IMPORTANTE** e **SUGESTÃO** vão para o relatório; o chief decide se corrige
  agora e registra a decisão no ledger.
- No máximo **3 rodadas** de correção por tarefa e 3 na revisão final. Na
  quarta, o chief para e pergunta ao usuário.
- Plano com uma tarefa só: a revisão da tarefa e a da branch inteira são a
  mesma; roda uma vez, junto com o cyber-security.
- **Trilhas.** O monorepo é dividido em trilhas (`tooling` na raiz, `api`,
  `mobile`), cada uma com branch e worktree próprios. Trilhas diferentes podem
  rodar em paralelo porque não tocam as mesmas pastas; dentro de uma trilha,
  nunca dois developers ao mesmo tempo.
- Todo comportamento novo ou alterado começa por um **teste que falha** (TDD):
  a API e o app têm Jest. Correção de bug sempre começa por um **teste de
  regressão que falha** antes da correção e passa depois.

## Skills do superpowers no time

O time usa cinco skills do `obra/superpowers` (instaladas em `.claude/skills/`).
Elas foram escritas para um agente sozinho com o usuário; aqui valem com estas
adaptações, que vencem o texto da skill:

| Skill | Quem usa | O que muda no time |
|---|---|---|
| `brainstorming` | chief | A spec é o `00-brief.md`, não `docs/superpowers/specs/`. Depois da aprovação o próximo passo é o `00-plano.md` escrito pelo chief; **não** se usa `writing-plans`. |
| `subagent-driven-development` | chief | Implementador = `developer`, revisor da tarefa = `code-reviewer`. Ledger, briefs e diffs ficam na pasta da tarefa, não em `.superpowers/sdd/` (os scripts da skill não são usados). Teto de 3 rodadas por tarefa (não 5); na quarta, pergunta ao usuário. |
| `test-driven-development` | developer (e o code-reviewer cobra) | Obrigatório em `api/` e `mobile/` (os dois têm Jest). Arquivo de configuração e tooling da raiz seguem com a verificação que o plano indicar. |
| `requesting-code-review` | chief | O revisor é o agent `code-reviewer` (não `general-purpose`), com o formato de achados do `code-reviewer.md` do time. |
| `finishing-a-development-branch` | chief | Sem menu: o caminho é sempre push + PR. Merge local não existe no time; descartar só a pedido explícito do usuário. O worktree fica para o feedback do PR. |

Se a sessão também tiver o plugin `superpowers` ativo, as skills `superpowers:*`
dele seguem estas mesmas adaptações dentro do time.

## Git e PRs

- Branch padrão: **`master`**. Um worktree por trilha, em
  `.claude/worktrees/<trilha>` na raiz, branch `feat/<slug>`, `fix/<slug>` ou
  `chore/<slug>`, a partir da base que o `00-plano.md` indicar (padrão `master`;
  `origin/master` depois de `git fetch origin`, quando houver remote).
- **BASE e branch de spec.** O chief registra no ledger a BASE de cada
  tarefa (`Tarefa N: BASE <sha7> (<trilha>)`). Todo diff de revisão (tarefa
  ou branch inteira) usa essa BASE, nunca `master` fixo. Quando as trilhas
  partem de uma branch de spec (ex.: `spec/fiap-school`), essa branch é o
  primeiro PR para `master`; os PRs das trilhas abrem para `master` só depois que
  ele for mergeado, para não repetirem os commits da spec.
- Nunca commitar na `master`, nunca force-push, **nunca mergear**. Merge é do
  usuário. O chief só notifica.
- Commits **conventional**, em português, com escopo (`feat(api): ...`,
  `fix(mobile): ...`, `chore(ci): ...`, `docs(spec): ...`), no estilo do
  `git log --oneline -15`. Depois da Tarefa 2 o commitlint recusa o que fugir
  disso.
- Fim da mensagem de commit:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Fim da descrição do PR:
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
- Sem remote no GitHub, o fim de uma trilha é a branch local commitada; o push
  e os PRs acontecem quando o usuário criar o repositório. Com remote, um PR
  por trilha para `master`, citando os PRs irmãos e a ordem de merge (ex.: API
  antes do app quando o app consome rota nova).

## Projeto

| Pasta | Stack | Comandos de verificação |
|---|---|---|
| `api/` | NestJS 11, Prisma + SQLite (migrations + seed), JWT (passport-jwt), class-validator, Jest + supertest, Swagger em `/docs`; prefixo `/api` | `yarn lint && yarn tsc --noEmit && yarn test && yarn test:e2e` |
| `mobile/` | React Native CLI + TypeScript strict, Restyle (tokens em `mobile/src/theme`, spec em `docs/figma/README.md`), React Navigation (native-stack + bottom-tabs), TanStack Query, zustand + mmkv, zod, react-hook-form, reanimated, Expo Modules só para `expo-updates` e `expo-notifications`, Jest + Testing Library, Maestro | `yarn lint && yarn tsc && yarn test` (+ `yarn ios` quando a tarefa tem tela) |
| raiz | yarn, husky + commitlint + lint-staged, GitHub Actions, `.claude/`, `docs/` | os do plano para a tarefa (ex.: `yarn commitlint`) |

- Banco: SQLite em arquivo. Recriar do zero com
  `yarn prisma migrate reset --force` dentro de `api/` (migra e semeia). O e2e
  usa um banco próprio (`file:./test.db`). Se o Prisma bloquear o reset
  pedindo consentimento do usuário (checkpoint de agente de IA), não invente o
  consentimento: avise o chief.
- Credenciais do seed: Gustavo `969.294.560-04` / `123456` (2 alunos),
  Adelaide `508.795.670-07` / `987654` (1 aluna), mais o responsável sem aluno
  documentado no README da API.
- **Deploy:** não há deploy de loja nem de servidor. A API roda local (yarn ou
  Docker Compose). O "CD" é o APK de release gerado pela Action em tag `v*`.
  OTA (D34) só com `yarn ota:update <canal> "<msg>"` dentro de `mobile/`, e só
  com pedido explícito do usuário naquele momento. Mudança nativa (lib nativa,
  permissão, plugin, `Podfile`, `build.gradle`) muda o `runtimeVersion`
  (fingerprint) e não sai por OTA: precisa de build novo.

Instruções que valem acima deste arquivo: `CLAUDE.md` da raiz, o `00-brief.md`
(seção 9, restrições globais) e os `README.md` de `api/` e `mobile/` quando
existirem.

## Restrições do ambiente local

Máquina do usuário em 2026-10-27 (brief, risco R-Ambiente):

- **Sem JDK nem Android SDK:** Android não builda localmente; é verificado só
  no CI. Valide no iOS simulator (Xcode, iPhone 16).
- **Sem Docker:** `Dockerfile` e `docker-compose.yml` são validados por
  revisão, não por execução.
- **Sem Maestro:** os flows são escritos e rodam quando o usuário instalar
  (`curl -fsSL https://get.maestro.mobile.dev | bash`). Até lá o qa usa o
  simulator com `xcrun simctl` e screenshots.
- **Watchman quebrado** (falta a `libglog`): o Metro roda com
  `useWatchman: false`; se o Jest reclamar do watchman, rode com
  `--no-watchman`.
- Node 24 e yarn funcionam.
