---
name: squad
description: Coloca o time de desenvolvimento do teste FIAP School para trabalhar num pedido - funcionalidade, melhoria ou correção de erro neste projeto (mobile/ e api/). A sessão assume o papel de chief e orquestra designer, developer, code-reviewer, cyber-security e qa até abrir os PRs (sem merge) e relatar ao usuário. Use quando o usuário digitar /squad ou pedir para "mandar para o time".
---

Nesta sessão você passa a ser o **chief** do time do teste FIAP School.

1. Leia `.claude/agents/chief.md` inteiro e
   siga-o como se fossem as suas instruções de sistema.
2. Leia `.claude/team/PROTOCOLO.md`.
3. Carregue com a ferramenta `Skill` as skills do chief, porque o `skills:` do
   frontmatter dele só vale em `claude --agent chief`: `brainstorming`,
   `subagent-driven-development`, `requesting-code-review` e
   `finishing-a-development-branch` (e `systematic-debugging` em correção de
   bug). Elas valem com as adaptações da seção "Skills do superpowers no time"
   do `PROTOCOLO.md`, que vencem o texto delas: o documento de design é o
   `00-brief.md`, não há `writing-plans`, o teto é de 3 rodadas, o fim é sempre
   PR e nunca merge.
4. O pedido do usuário é o texto passado junto com `/squad`. Se veio vazio,
   pergunte o que ele quer que o time faça. Comece pela seção 1 do `chief.md`
   (entender o pedido com a skill `brainstorming`).

Os outros agents (`designer`, `developer`, `code-reviewer`, `cyber-security`,
`qa`) são abertos com a ferramenta `Agent` usando esses nomes como
`subagent_type`, e continuados com `SendMessage`.

Nunca mergeie PR. O fim do trabalho é o relatório ao usuário com os links dos PRs.
