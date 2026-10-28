# FIAP School — teste técnico de Mobile

App para os responsáveis dos alunos da FIAP School acompanharem as aulas do dia
e o boletim anual (notas e faltas), mais uma API própria em NestJS no lugar do
JSON do enunciado. Projeto desenvolvido com IA por SDD (Spec-Driven Development).

## Onde está o contexto

- **Enunciado do teste:** `.docs/teste-tecnico-mobile.md` (transcrição) e
  `.docs/teste-tecnico-mobile.docx` (original). Inclui os links do Figma e do JSON.
- **Design (Figma):** `.docs/figma/README.md` (tokens, componentes, telas), com prints e assets.
- **Spec aprovada / em aprovação:** `.claude/team/tarefas/2026-10-27-fiap-school/00-brief.md`.
  Decisões, escopo, critérios de aceite, riscos e perguntas em aberto estão lá:
  leia antes de qualquer trabalho.
- **Andamento:** `00-plano.md` e `00-ledger.md` na mesma pasta (quando existirem).
  Depois de uma compactação de contexto, confie no ledger e no `git log`.

## Como o time trabalha (`/squad`)

- `/squad <pedido>` coloca a sessão no papel de **chief**, que orquestra os agents
  `designer`, `developer`, `code-reviewer`, `cyber-security` e `qa`
  (`.claude/agents/`).
- Regra comum de todos: `.claude/team/PROTOCOLO.md`.
- As skills usadas pelos agents ficam em `.claude/skills/` e são versionadas
  aqui, então não é preciso instalar plugin em outra máquina.
- Abra o Claude Code **na raiz deste repositório**: os caminhos dos agents são
  relativos a ela.

## Stack (resumo do brief)

- `mobile/`: React Native CLI, TypeScript, Restyle, MVVM, React Navigation,
  TanStack Query, zustand (estado global), zod (validação), react-hook-form,
  reanimated, Jest + Testing Library, Maestro.
- `api/`: NestJS, Prisma + SQLite (migrations + seed), JWT, class-validator,
  controllers → use cases (um `.spec.ts` por use case), testes unitários e e2e,
  Swagger.
- Raiz: yarn, husky + commitlint (conventional commits), GitHub Actions.

## Regras

- Commits conventional, em português (`feat(mobile): ...`, `fix(api): ...`).
- Nunca commitar na `master` direto depois do commit inicial: branch + PR, e o
  merge é do usuário.
- Nunca logar token, senha ou CPF completo.
- Hooks do husky na raiz: `commit-msg` valida a mensagem (commitlint) e `pre-commit` roda
  lint-staged (eslint em `api/`; eslint + prettier em `mobile/`). Rode `yarn install` na raiz,
  em `api/` e em `mobile/`: sem o `node_modules` da pasta o lint dela é pulado com aviso.
