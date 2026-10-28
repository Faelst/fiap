# Plano — app-v2

Brief: `00-brief.md`. Design: `01-design.md` (aprovado pelo usuário em 2026-10-28, com DV2/DV3/DV5/DV7/DV8/DV9 como propostos).
Branch/worktree: `v2` em `.claude/worktrees/v2` (a partir de `release/v1`). Só `mobile/` muda.
Fechamento: criar a branch `release/v2` a partir da `v2` — sem PR, sem merge (pedido do usuário).

Cada fatia: developer novo, TDD onde houver lógica, `yarn lint && yarn tsc && yarn test && yarn format:check && yarn maestro:check` verdes, flows afetados atualizados na própria fatia, build iOS + evidência no simulador quando houver tela; review por fatia (até 3 rodadas).

| Fatia | Conteúdo (detalhes em 01-design.md §10 e seções citadas) |
|---|---|
| 1 | Tema v2 (§1) + bloco legado v1 |
| 2 | Primitivos (§2.1, 2.2/Avatar, PillButton, useSlidingIndicator 2.17, Skeleton shimmer, EmptyState/ErrorState v2 2.16) |
| 3 | FloatingTabBar + aba Perfil (2.4, 3.5) + subflows logout/select-student |
| 4 | CompactHeader + StudentChip (2.6), remove ActionBar/Header/SelectStudent, NoStudent/BootError novos (3.6, 3.7) |
| 5 | Login (TextField 2.5, banner de erro, loginLayout, 3.2) + saída da splash (3.1) |
| 6 | Agenda: WeekStrip + pager + Timetable sem a linha de agora (2.7–2.9) |
| 7 | Agenda: agora (useMinuteClock, NowLine, NowBanner, estados) — N3 com relógio injetado |
| 8 | Boletim (SegmentedControl, GradeBar, TermSummaryCard, SubjectGradeCard, gradeBand) |
| 9 | Polimento + limpeza (pull-to-refresh, entrada encadeada, reduzir movimento, fonte grande, remoção do legado, README "v2" com GIFs) |

Depois da fatia 9: revisão final da branch (code-reviewer + cyber-security), QA, e criar `release/v2`.
