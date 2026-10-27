# Protocolo do time de desenvolvimento da Safety Swap

Seis agents, cada um com uma responsabilidade, trabalhando sobre os projetos de
`/SS`. Este arquivo é a regra comum: todo agent lê antes de começar.

| Agent | Arquivo | Responsabilidade |
|---|---|---|
| chief | `.claude/agents/chief.md` | Recebe o pedido do usuário, decide, orquestra, abre os PRs e relata |
| designer | `.claude/agents/designer.md` | Especifica a tela usando o design system existente |
| developer | `.claude/agents/developer.md` | Escreve o código, os testes unitários e o teste de regressão |
| qa | `.claude/agents/qa.md` | Testes de integração e de tela no Chrome (skill `claude-in-chrome`) |
| code-reviewer | `.claude/agents/code-reviewer.md` | Review crítico: padrão do projeto, correção, testes |
| cyber-security | `.claude/agents/cyber-security.md` | Review de segurança da implementação |

## Como os agents conversam

Subagents não abrem outros subagents. Quem orquestra é o **chief rodando como
sessão principal**:

- `claude --agent chief` dentro de `/SS`, ou
- numa sessão comum em `/SS`, `/squad <pedido>`.

A conversa entre os agents acontece por dois canais, sempre os dois:

1. **Pasta da tarefa** (canal durável). Cada tarefa tem
   `.claude/team/tarefas/AAAA-MM-DD-<slug>/` e cada agent escreve o próprio
   arquivo nela. Todo agent pode e deve ler os arquivos dos outros.

   | Arquivo | Quem escreve |
   |---|---|
   | `00-brief.md` | chief: pedido, decisões, escopo, repos e critérios de aceite; é o documento de design aprovado pelo usuário |
   | `00-plano.md` | chief: as tarefas de implementação, na ordem |
   | `00-ledger.md` | chief: andamento de cada tarefa e as decisões tomadas no caminho |
   | `01-design.md` | designer: especificação de tela |
   | `02-dev.md` | developer: o que mudou, branches, testes, como rodar (uma seção por tarefa) |
   | `03-review.md` | code-reviewer (uma seção por tarefa e uma da branch inteira) |
   | `revisao/` | chief: os diffs entregues ao code-reviewer (`tarefa-N.diff`, `branch-<repo>.diff`) |
   | `04-security.md` | cyber-security |
   | `05-qa.md` | qa: roteiro executado, evidências, resultado |
   | `99-relatorio.md` | chief: relatório final ao usuário |

   Rodadas seguintes acrescentam uma seção `## Rodada N` no mesmo arquivo (no `02-dev.md` e no `03-review.md`, `### Rodada R` dentro da seção da tarefa); não
   apagam a anterior.

2. **Mensagens pelo chief** (canal rápido). Todo agent termina a resposta com a
   seção `## Mensagens` (ex.: `→ developer: o botão secundário usa variant
   "outline", não "ghost"`). O chief repassa com `SendMessage` ao agent
   destinatário, que continua com o contexto que já tinha. Dúvida que só o
   usuário responde vai como `→ chief (usuário): ...`.

## Fluxo

```
usuário ⇄ chief (brainstorming → 00-brief aprovado)
        → chief (00-plano + 00-ledger)
        → designer (01-design)                       só se houver tela
        → para cada tarefa do plano, uma por vez:
             developer novo (TDD, commit)  → 02-dev ## Tarefa N
             code-reviewer da tarefa       → 03-review ## Tarefa N
             correção + re-review restrito, até 3 rodadas
        → code-reviewer da branch inteira (03) + cyber-security (04)   em paralelo
        → developer corrige numa leva só      → re-review restrito
        → qa (05)                                    tela e integração
        → developer corrige falha de QA       → re-review restrito → qa
        → chief fecha a branch: suíte verde, push, PR (nunca merge)
        → chief escreve 99-relatorio e notifica o usuário
```

- Achado **BLOQUEANTE** de review, segurança ou QA volta ao developer.
  **IMPORTANTE** e **SUGESTÃO** vão para o relatório; o chief decide se corrige agora
  e registra a decisão no ledger.
- No máximo **3 rodadas** de correção por tarefa e 3 na revisão final. Na quarta,
  o chief para e pergunta ao usuário.
- Plano com uma tarefa só: a revisão da tarefa e a da branch inteira são a mesma;
  roda uma vez, junto com o cyber-security.
- Nunca dois developers ao mesmo tempo no mesmo repo.
- Todo comportamento novo ou alterado, onde há runner de teste, começa por um
  **teste que falha** (TDD). Correção de bug sempre começa por um **teste de
  regressão que falha** antes da correção e passa depois.

## Skills do superpowers no time

O time usa cinco skills do `obra/superpowers` (instaladas em `.claude/skills/`).
Elas foram escritas para um agente sozinho com o usuário; aqui valem com estas
adaptações, que vencem o texto da skill:

| Skill | Quem usa | O que muda no time |
|---|---|---|
| `brainstorming` | chief | A spec é o `00-brief.md`, não `docs/superpowers/specs/`. Depois da aprovação o próximo passo é o `00-plano.md` escrito pelo chief; **não** se usa `writing-plans`. |
| `subagent-driven-development` | chief | Implementador = `developer`, revisor da tarefa = `code-reviewer`. Ledger, briefs e diffs ficam na pasta da tarefa, não em `.superpowers/sdd/` (os scripts da skill não são usados). Teto de 3 rodadas por tarefa (não 5); na quarta, pergunta ao usuário. |
| `test-driven-development` | developer (e o code-reviewer cobra) | Obrigatório onde há runner (API). Web, admin e mobile seguem sem runner até o chief decidir adicionar um. |
| `requesting-code-review` | chief | O revisor é o agent `code-reviewer` (não `general-purpose`), com o formato de achados do `code-reviewer.md` do time. |
| `finishing-a-development-branch` | chief | Sem menu: o caminho é sempre push + PR. Merge local não existe no time; descartar só a pedido explícito do usuário. O worktree fica para o feedback do PR. |

Se a sessão também tiver o plugin `superpowers` ativo, as skills `superpowers:*`
dele seguem estas mesmas adaptações dentro do time.

## Git e PRs

- Um worktree por repositório tocado, em `<repo>/.claude/worktrees/<slug>`,
  branch `feat/<slug>` ou `fix/<slug>` a partir de `origin/master` (todos os
  repos usam `master`). Antes de criar, `git fetch origin`.
- Nunca commitar na `master`, nunca force-push, **nunca mergear**. Merge é do
  usuário. O chief só notifica.
- Commit e PR em português, no estilo dos commits existentes do repo
  (`git log --oneline -15`).
- Fim da mensagem de commit:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Fim da descrição do PR:
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
- Mudança que cruza repos (ex.: API + app) gera um PR por repo, um citando o outro,
  com a ordem de deploy escrita nos dois.

## Repositórios

| Pasta | GitHub | Stack | Porta |
|---|---|---|---|
| `safety-swap` | Faelst/safetyswap-app | Next.js 16, React 19, Tailwind 4, TanStack Query, zustand, RHF+zod, i18n (4 dicionários) | 3000 |
| `safety-swap-api` | Faelst/safety-swap-api | NestJS 11, Prisma 7, Postgres, socket.io, jest; prefixo `/api`; deploy Heroku | 3001 |
| `safety-swap-admin` | Faelst/safety-swap-admin | Next.js, pt-BR direto (sem i18n) | 3002 |
| `safety-swap-lp` | Faelst/safety-swap-lp | Next.js, banco em SQLite | 3003 |
| `safety-swap-mobile` | Faelst/safety-swap-mobile | Expo SDK 57, expo-router 7, StyleSheet + tokens | 8081/8082 |

Instruções próprias de cada repo, que valem acima deste arquivo:
`safety-swap/AGENTS.md`, `safety-swap-mobile/AGENTS.md` e `README.md`,
`safety-swap-api/docs-*.md`, `safety-swap-admin/README.md`.
