# Design — Figma do teste FIAP School

Fonte: cópia do arquivo oficial em
`https://www.figma.com/design/Zo6DZy8rfXVVcrOBgfCWcU/` (o original da FIAP,
`lWgkJr0vc9ZiQQylY2J4Zt`, é só leitura e o MCP do Figma não lê arquivo sem
acesso de edição). Extraído em 2026-10-27 com o MCP oficial do Figma.

- `screens/`: print de cada página (todos os estados lado a lado).
- `assets/`: logos, ícones e ilustração exportados do Figma.

Frame de referência: **414 × 736** (iPhone 8 Plus). O tema é escuro, sem modo
claro no Figma.

## Páginas

| Página | Node | Frames (estados) |
|---|---|---|
| Capa | `4001:2` | logo FIAP em vetor, 1920×1080. Serve de base para a splash |
| Login | `0:1` | estado inicial `2:6` · CPF com máscara `3:1216` · senha preenchida e botão ativo `3:1246` · carregando `3:1232` · erro `3:1262` |
| Aulas | `1:2` | sem aulas `2:24` · dropdown de dias aberto `2:48` · lista de aulas `2:88` · variantes do topo `3:908` / `17:14` / `17:2` |
| Boletim | `1:3` | ano fechado `3:317` · ano aberto `3:1054` · trimestre aberto `3:389` · disciplinas abertas `3:549` |
| Mudança de Aluno | `1:4` | `2:5` |

## Tokens

O arquivo **não tem variáveis nem estilos publicados**. Os valores abaixo
saíram do design context de cada nó.

### Cores

| Token (Restyle) | Hex | Uso |
|---|---|---|
| `background` | `#000000` | fundo de todas as telas e da barra de ações do topo |
| `primary` | `#29F4D5` | botão de login, títulos de seção (AGENDA/BOLETIM), aba ativa, trimestre, ícones (chevron, fechar), mensagem de erro, borda do aluno selecionado |
| `surface` | `#262626` | dropdown (dias/ano), lista de opções, rodapé (tab bar) |
| `surfaceRaised` | `#4D4D4D` | cabeçalho dos trimestres, cards de aluno |
| `text` | `#FFFFFF` | texto padrão, aba inativa, linha do input preenchido |
| `textOnPrimary` | `#000000` | texto do botão ativo |
| `textDisabled` | `#777777` | texto do botão de login desabilitado |
| `inputLine` | `#525252` | linha do input vazio (vira `text` quando preenchido) |
| `bulletBorder` | `#CCCCCC` | bolinha (6px, borda) da lista de aulas |
| `accent` | rosa do selo "SCHOOL" | só dentro do logo (PNG), não é usado em UI |

A mensagem de erro do login é **teal (`primary`)**, não vermelha.

### Tipografia

Fonte única: **Montserrat** (Regular 400, Medium 500, SemiBold 600, Bold 700).
`lineHeight` normal.

| Variante | Tamanho / peso | Onde |
|---|---|---|
| `greeting` | 24 Regular + nome em 24 Bold | "Olá, **GUSTAVO**" |
| `title` | 24 Regular | "Escolha o perfil que você quer visualizar" |
| `inputValue` | 32 Regular | CPF e senha digitados |
| `label` | 20 Regular | rótulos CPF / SENHA |
| `button` | 20 Medium | FAZER LOGIN |
| `sectionTitle` | 20 Bold, `primary` | AGENDA / BOLETIM |
| `emptyState` | 20 Regular | "Sem aulas neste dia" |
| `body` | 16 Regular | dropdowns, info do aluno (turma - RM - período) |
| `bodyMedium` | 16 Medium | primeiro nome do aluno no header, nome no card |
| `bodyBold` | 16 Bold | "1º TRIMESTRE" (`primary`), FECHAR (`primary`) |
| `lessonSubject` | 16 SemiBold | disciplina na lista de aulas |
| `error` | 16 Medium, `primary` | erro do login (2 linhas, centralizado) |
| `caption` | 12 Regular | horário da aula, TROCAR PERFIL, SAIR |
| `subject` | 12 Medium | disciplina e "Nota: / Faltas:" no boletim (MAIÚSCULAS) |
| `tabLabel` | 10 Bold | AGENDA / BOLETIM no rodapé |

### Espaçamento, raios e tamanhos

- Margem lateral: 16 (dropdown do boletim, cards), 24 (dropdown de dias), 28 (conteúdo dentro dos cards), 40 (lista de aulas), 48 (inputs do login).
- Raio: 8 em dropdowns, cards e lista de opções. Bolinha da aula: 6×6 com raio total.
- Alturas: barra de ações 48 · dropdown 45 · card de trimestre e de aluno 90 · botão de login 60 (largura total, colado no rodapé) · tab bar 64.
- Ícones: 24 (tabs e fechar), 14 (chevron), 10 (logout).
- Distância entre aulas: 59 (≈ horário + 8 + disciplina + 16).

## Componentes

- **Barra de ações (topo):** logo pequeno (100×16) à esquerda; à direita
  `TROCAR PERFIL` (só com mais de 1 aluno) e `SAIR ⎋`. O Figma tem as três
  variantes: com os dois, só SAIR, e sem ação. As telas principais mostram só
  TROCAR PERFIL, mas o requisito pede logout, então vale a variante
  `3:908` (TROCAR PERFIL + SAIR).
- **Cabeçalho:** "Olá, {PRIMEIRO NOME DO RESPONSÁVEL}" em maiúsculas; abaixo, o
  primeiro nome do aluno em maiúsculas e `{turma} - RM {rm} - {período}`
  (ex.: `7EF - RM 12567 - Matutino`). Tudo centralizado, sem fundo próprio.
- **Título de seção:** AGENDA / BOLETIM, centralizado, em `primary`.
- **Tab bar:** 2 abas (AGENDA com ícone de calendário, BOLETIM com ícone de
  documento). A ativa fica em ícone e texto `primary`, a inativa em branco. Fundo `surface`.
- **Dropdown:** caixa `surface` com raio 8, texto à esquerda e chevron `primary` à
  direita (gira 180° quando aberto); as opções aparecem numa caixa `surface`
  logo abaixo, sem marcar a selecionada.
- **Input de login:** rótulo centralizado acima, valor centralizado em 32,
  linha inferior `inputLine` que fica branca quando há valor. Não há caixa.
- **Botão de login:** largura total, colado na base, `primary`. Desabilitado =
  texto `#777`. Carregando = sem texto (vai um spinner no lugar).
- **Acordeão de trimestre:** card `surfaceRaised` de 90 de altura com
  "Nº TRIMESTRE" em `primary` e chevron. Aberto, lista as disciplinas.
- **Acordeão de disciplina:** nome em maiúsculas (12 Medium) + chevron. Aberto,
  mostra `Nota: 9,5` e `Faltas: 0`. Trimestre não avaliado mostra `-` nos dois.
- **Item de aula:** bolinha + horário `HH:mm - HH:mm` (12) e, abaixo, a
  disciplina (16 SemiBold).
- **Estado vazio de aulas:** ilustração `no-classroom.png` (328×208) +
  "Sem aulas neste dia".
- **Card de aluno:** `surfaceRaised` com raio 8; nome completo em maiúsculas (16
  Medium) e `{turma} - RM {rm} - {período}`. O aluno atual tem borda `primary` de 1px.

## Telas

### Login (`0:1`)
Logo grande no topo (306×49). Campos CPF e SENHA, botão FAZER LOGIN na base.
O botão só fica ativo com CPF completo e senha preenchida. Erro em teal abaixo da
senha: "Usuário ou senha inválida. Pode tentar novamente?".

### Aulas / Agenda (`1:2`)
Cabeçalho + AGENDA + dropdown com **data e dia da semana** ("17 de março,
segunda-feira"). O dropdown lista os **7 dias da semana corrente, de domingo a
sábado**. Abaixo vem a lista de aulas do dia, ou o estado vazio (fim de semana ou
dia sem aula).

### Boletim (`1:3`)
Cabeçalho + BOLETIM + dropdown de **turma e ano** ("7EF - 2025", "6EF - 2024").
Abaixo, três acordeões de trimestre, cada um com 12 disciplinas em acordeão:
Língua Portuguesa, Produção e Interpretação de Textos, Matemática I,
Matemática II, Geografia, História, Ciências, Língua Inglesa, Arte, Projeto,
Coding e Educação Física.

### Mudança de aluno (`1:4`)
Tela cheia (modal) sem cabeçalho nem tab bar. "FECHAR ✕" em `primary` no
canto superior direito, título "Escolha o perfil que você quer visualizar" e
os cards dos alunos, com o atual destacado.

## Assets (`assets/`)

| Arquivo | Uso |
|---|---|
| `logo-login.png` | logo grande do login (306×49) |
| `logo-header.png` | logo pequeno da barra de ações (100×16) |
| `tab-agenda-active.svg` / `tab-agenda-inactive.svg` | ícone da aba Agenda |
| `tab-boletim-active.svg` / `tab-boletim-inactive.svg` | ícone da aba Boletim |
| `chevron-down.svg` | chevron `primary`; gira 180° quando aberto |
| `close.svg` | fechar da tela de mudança de aluno |
| `logout.svg` | ícone do SAIR |
| `input-underline.svg` / `input-underline-empty.svg` | linha do input (dá para trocar por `borderBottom` no código) |
| `no-classroom.png` | ilustração do dia sem aulas |

O logo da capa (`4001:4`) é vetor e pode ser exportado como SVG para a splash.
Os ícones vêm do svgrepo, segundo os nomes das camadas. No app, vale converter
os SVGs com `react-native-svg` para colorir pelo tema em vez de manter duas
versões.

## O que o Figma não cobre (decisão do time)

- Splash screen: logo da capa sobre fundo preto.
- Loading de Aulas e Boletim (skeleton no padrão `surface`).
- Erro de rede, com "Tentar de novo".
- Responsável sem aluno vinculado.
- Animações (o Figma é estático).
