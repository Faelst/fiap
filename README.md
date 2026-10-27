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

## Instalação

Instale as dependências na raiz (hooks do husky), em `api/` e em `mobile/`
(`yarn install` em cada uma). Sem o `node_modules` de `api/` ou `mobile/`, o
pre-commit avisa e pula o lint daquela pasta.

## Troubleshooting

**`yarn` falha com `Internal Error: fiap-school@workspace:. doesn't seem to be present in your lockfile`.**
O yarn sobe a árvore de pastas e obedece o primeiro `.yarnrc.yml` que achar. Se
existir um projeto yarn 3 acima deste repositório (ex.: `~/workspace/.yarnrc.yml`
com `yarnPath`), ele roda no lugar do yarn 1.22 deste repo. Os hooks do git não
usam `yarn`, então o `git commit` funciona mesmo assim. Para rodar comandos yarn
dentro do repo nessa situação, use `export YARN_IGNORE_PATH=1` na sessão do
terminal (ou o prefixo `YARN_IGNORE_PATH=1` em cada comando).
