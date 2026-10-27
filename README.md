# FIAP School

Teste técnico de Mobile da FIAP School: app para os responsáveis dos alunos
acompanharem as aulas do dia e o boletim anual (notas e faltas), com uma API
própria em NestJS no lugar do JSON do enunciado.

## Stack

_A preencher._

## Como rodar a API

_A preencher._

## Como rodar o app

_A preencher._

## Testes

_A preencher._

## Como foi construído com IA (SDD)

O projeto foi desenvolvido com Spec-Driven Development: um time de agents
(chief, designer, developer, code-reviewer, cyber-security e qa) trabalhou a
partir de uma spec aprovada.

- Agents, protocolo e skills: [`.claude/`](.claude/)
- Spec, plano, ledger, reviews e relatórios de cada tarefa:
  [`.claude/team/tarefas/`](.claude/team/tarefas/)

## Credenciais de teste

| Responsável | CPF | Senha |
|---|---|---|
| Gustavo | 969.294.560-04 | 123456 |
| Adelaide | 508.795.670-07 | 987654 |
| Carlos (sem aluno) | _a definir_ | _a definir_ |

## Troubleshooting

**`yarn` roda o yarn 3 (ou reclama de `packageManager`/"part of the project").**
O yarn sobe a árvore de pastas e obedece o primeiro `.yarnrc.yml`/`package.json`
que achar. Se existir um projeto yarn 3 em uma pasta acima deste repositório
(ex.: `~/workspace/.yarnrc.yml` com `yarnPath`), ele captura o yarn. Este repo
usa yarn 1.22 (`packageManager` no `package.json`). Contorno, sem mexer fora do
repo: `YARN_IGNORE_PATH=1 yarn install` (e o mesmo prefixo nos demais comandos).
