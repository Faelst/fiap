# 01 — Design: FIAP School (mobile)

Designer · 2026-10-27 · fonte: `docs/figma/README.md`, prints em
`docs/figma/screens/`, assets em `docs/figma/assets/`, dados em
`docs/data/responsaveis.json`.

> **Atualização 2026-10-27 (Tarefa 8b):** a splash animada foi especificada
> em 3.1 (inteira) e entrou nas tabelas 1.4, 1.8, 4.1, 5 e 7.

O app não tem design system em código. Este documento **cria** o design system
(brief, seção 7) e especifica as telas para as Tarefas 7 a 13. As medidas vêm do
frame de referência **414 × 736**. Medi nos prints com 1 px = 1 pt. Onde o Figma
não é consistente (o mesmo elemento com 2 a 3 px de diferença entre frames),
arredondei para o token mais próximo e registrei.

Convenções deste documento:
- `spacing.m` significa o token `m` da escala de espaçamento. No código, a prop
  Restyle é `padding="m"` e o valor é `theme.spacing.m`.
- `sizes.*` e `motion.*` são chaves extras do tema (o Restyle aceita chaves
  livres no objeto do tema). Lê-se com `useTheme()`. Assim nenhum número solto
  fica em componente (restrição global do brief, seção 9).

---

## 1. Tema Restyle (`mobile/src/theme/`)

Arquivos sugeridos: `palette.ts`, `theme.ts` (o `createTheme`),
`components.ts` (Box, Text e os `createRestyleComponent` com variantes) e
`motion.ts`.

### 1.1 Paleta e cores semânticas

`palette` (são os únicos hexadecimais do app inteiro, todos aqui):

| palette | valor |
|---|---|
| `black` | `#000000` |
| `white` | `#FFFFFF` |
| `teal` | `#29F4D5` |
| `gray900` | `#262626` |
| `gray700` | `#4D4D4D` |
| `gray600` | `#5C5C5C` (era `#525252` no Figma, ver 6.2) |
| `gray500` | `#777777` |
| `gray200` | `#CCCCCC` |

`colors` (é isso que os componentes usam):

| cor | palette | uso |
|---|---|---|
| `background` | `black` | fundo de todas as telas, barra de ações, status bar |
| `primary` | `teal` | botão de login, AGENDA/BOLETIM, aba ativa, trimestre, chevrons, FECHAR, erro, borda do aluno atual, botão "Tentar de novo" |
| `surface` | `gray900` | dropdown, lista de opções, tab bar, skeleton |
| `surfaceRaised` | `gray700` | card de trimestre, card de aluno |
| `text` | `white` | texto padrão, aba inativa, linha do input preenchido |
| `textOnPrimary` | `black` | texto e spinner do botão ativo |
| `textDisabled` | `gray500` | texto do botão desabilitado |
| `inputLine` | `gray600` | linha do input vazio |
| `bulletBorder` | `gray200` | borda da bolinha da aula |
| `transparent` | `'transparent'` | borda do card de aluno não selecionado (evita pulo de layout) |

A cor rosa do selo "SCHOOL" existe só dentro do logo. Não entra no tema.
**Não existe modo claro**: o tema é único e o app força a status bar
`light-content` com fundo `background`, e a navigation bar do Android em
`background`.

### 1.2 Espaçamento

| token | valor | onde aparece |
|---|---|---|
| `none` | 0 | |
| `xs` | 4 | gap ícone/texto no SAIR, padding vertical da lista de opções |
| `s` | 8 | horário → disciplina, nome → info do aluno, gap do FECHAR, abaixo do valor do input |
| `sm` | 12 | padding horizontal do card de trimestre, gap Nota:/valor, padding superior da tab bar |
| `m` | 16 | margem lateral do Boletim e da Seleção, padding interno de dropdown e card de aluno, gap entre cards |
| `l` | 24 | margem lateral do dropdown da Agenda, label → valor do input, dropdown → lista de aulas, gap TROCAR PERFIL ↔ SAIR |
| `xl` | 28 | conteúdo do acordeão aberto (alinha com o texto do card: 16 + 12) |
| `xxl` | 32 | saudação → nome do aluno, senha → mensagem de erro |
| `xxxl` | 40 | margem da lista de aulas, entre os dois campos do login |
| `huge` | 48 | margem lateral dos inputs do login |
| `section` | 64 | info do aluno → título da seção; título da seleção → cards |
| `hero` | 80 | topo → logo do login; logo → campo CPF |

### 1.3 Raios

| token | valor | uso |
|---|---|---|
| `none` | 0 | botão de login (borda reta, colado na base) |
| `m` | 8 | dropdown, lista de opções, cards, skeleton, botão secundário |
| `round` | 999 | bolinha da aula |

### 1.4 Tamanhos (`theme.sizes`)

| chave | valor |
|---|---|
| `actionBar` | 48 |
| `dropdown` | 45 |
| `termCard` | 90 |
| `studentCard` | 90 |
| `primaryButton` | 60 |
| `secondaryButton` | 45 |
| `tabBar` | 64 (+ `insets.bottom`) |
| `touchTarget` | 44 |
| `icon` | 24 (tabs, fechar) |
| `chevron` | 14 |
| `logoutIcon` | 10 |
| `bullet` | 6 |
| `bulletSlot` | 16 (bolinha 6 + 10 até o texto) |
| `logoHeader` | `{ width: 100, height: 16 }` |
| `logoLogin` | `{ width: 306, height: 49 }` |
| `illustration` | `{ width: 328, height: 208 }` |
| `logoBadge` | `{ x: 0.672, y: 0.35, width: 0.328, height: 0.40 }` (proporção do selo SCHOOL no PNG do logo) |
| `scanLine` | `{ width: 2, overhang: 8 }` (linha teal da splash) |
| `contentMaxWidth` | 600 (tablet) |
| `formMaxWidth` | 318 (largura dos inputs no frame de 414) |

### 1.5 Breakpoints

| chave | a partir de | uso |
|---|---|---|
| `compact` | 0 | telas abaixo de 375 de largura (ex.: Android 360) |
| `phone` | 375 | referência |
| `tablet` | 768 | conteúdo centralizado com `contentMaxWidth` |

### 1.6 Tipografia (`textVariants`)

Fonte **Montserrat**, embutida com `react-native-asset` nos arquivos
`Montserrat-Regular.ttf`, `Montserrat-Medium.ttf`, `Montserrat-SemiBold.ttf` e
`Montserrat-Bold.ttf` (os estáticos do Google Fonts). O peso vem **só do
`fontFamily`**. Não use `fontWeight` junto com fonte customizada, porque no
Android a fonte cai na do sistema. O "normal" do Figma vira `lineHeight`
explícito (≈ 1,22 × o tamanho) para ficar igual em iOS e Android.

| variante | fontFamily | size | lineHeight | cor padrão | extra |
|---|---|---|---|---|---|
| `defaults` / `body` | Regular | 16 | 20 | `text` | |
| `bodyMedium` | Medium | 16 | 20 | `text` | |
| `bodyBold` | Bold | 16 | 20 | `text` | |
| `greeting` | Regular | 24 | 29 | `text` | center |
| `greetingName` | Bold | 24 | 29 | `text` | `textTransform: 'uppercase'`, usado aninhado dentro de `greeting` |
| `title` | Regular | 24 | 29 | `text` | center |
| `inputValue` | Regular | `{compact: 28, phone: 32}` | `{compact: 34, phone: 39}` | `text` | center |
| `label` | Regular | 20 | 24 | `text` | center, `uppercase` |
| `labelFocused` | SemiBold | 20 | 24 | `text` | center, `uppercase` (o frame 2 do login mostra SENHA em negrito com o campo focado) |
| `button` | Medium | 20 | 24 | `textOnPrimary` | center, `uppercase` |
| `sectionTitle` | Bold | 20 | 24 | `primary` | center, `uppercase` |
| `emptyState` | Regular | 20 | 24 | `text` | center |
| `lessonSubject` | SemiBold | 16 | 20 | `text` | |
| `termTitle` | Bold | 16 | 20 | `primary` | `uppercase` (é o `bodyBold` em `primary`) |
| `error` | Medium | 16 | 20 | `primary` | center |
| `caption` | Regular | 12 | 15 | `text` | `uppercase` quando for ação (TROCAR PERFIL, SAIR) |
| `captionPlain` | Regular | 12 | 15 | `text` | horário da aula (sem uppercase) |
| `subject` | Medium | 12 | 15 | `text` | `uppercase` (disciplina no boletim) |
| `detail` | Medium | 12 | 15 | `text` | "Nota: 9,5" e "Faltas: 0" (sem uppercase, como no print) |
| `tabLabel` | Bold | 10 | 12 | `text` | center, `uppercase` |

**Maiúsculas por `textTransform`, não na string.** O dado fica em caixa normal
("Rafael da Silva") e a variante deixa em maiúsculas. Assim o leitor de tela lê
"Rafael", e não "R-A-F-A-E-L". A exceção são os textos fixos curtos, que estão
na tabela de textos (seção 5).

**Fonte grande do sistema:** `allowFontScaling` fica ligado. Em elementos de
altura fixa (barra de ações, dropdown, tab bar, botão, card de trimestre), use
`maxFontSizeMultiplier={1.3}`. Nos demais (saudação, aula, disciplina, erro),
o texto cresce sem limite e o layout acompanha, porque não há altura fixa.

### 1.7 Variantes de componente

`buttonVariants`:
- `primary`: `backgroundColor: primary`, `height: sizes.primaryButton`,
  `borderRadius: none`, conteúdo centralizado.
- `secondary`: `borderWidth: 1`, `borderColor: primary`, `borderRadius: m`,
  `height: sizes.secondaryButton`, `paddingHorizontal: l`. Texto `bodyBold` em
  `primary`. Aparece só no "Tentar de novo".

`cardVariants`:
- `dropdown`: `surface`, raio `m`, `height: sizes.dropdown`, `paddingHorizontal: m`,
  linha (`flexDirection: row`, `alignItems: center`, `justifyContent: space-between`).
- `options`: `surface`, raio `m`, `paddingVertical: xs`.
- `term`: `surfaceRaised`, raio `m`, `height: sizes.termCard`, `paddingHorizontal: sm`, linha.
- `student`: `surfaceRaised`, raio `m`, `height: sizes.studentCard`, `padding: m`,
  `borderWidth: 1`, `borderColor: transparent`, `justifyContent: space-between`.
- `studentSelected`: o `student` com `borderColor: primary`.

### 1.8 Movimento (`theme.motion`)

| chave | valor |
|---|---|
| `fast` | 150 ms |
| `base` | 220 ms |
| `slow` | 320 ms |
| `stagger` | 40 ms |
| `easeOut` | `Easing.out(Easing.cubic)` (entradas) |
| `easeIn` | `Easing.in(Easing.cubic)` (saídas) |
| `press` | spring `{ damping: 18, stiffness: 260, mass: 1 }` |
| `splash` | os valores da seção 3.1.3 a 3.1.5: `minDuration 1200`, `minDurationReduced 600`, `loopStartAt 1500`, `hardTimeout 10000`, `meTimeout 8000`, `wipe {delay 80, duration 600}`, `badgeSpring {damping 12, stiffness 180, mass 0.8}`, `loopTrack 1000`, `badgeBreath 1600` |

Regras de performance:
1. Anime só `opacity` e `transform` (`translate`, `scale`, `rotate`). Há duas
   exceções, a altura do acordeão e a cor da linha do input, e as duas rodam na
   UI thread.
2. Tudo em worklet (`useSharedValue`, `useAnimatedStyle`, `withTiming`,
   `entering`/`exiting`). Nada de `setState` por frame. Nada de `Animated` do RN.
3. O stagger tem teto: no máximo 6 itens animados por lista (o resto entra sem
   atraso).
4. Sem `layout={LinearTransition}` em listas com mais de 12 itens.

**Reduzir movimento:** toda animação de entrada e saída usa
`.reduceMotion(ReduceMotion.System)`. Os `withTiming` e `withSpring` manuais
consultam `useReducedMotion()`. Com o "reduzir movimento" ligado, a animação
pula para o estado final, o shake do erro não acontece (o texto do erro só
aparece), o skeleton fica parado com opacidade 0,7 e o chevron troca sem
girar. O leitor de tela continua recebendo os mesmos anúncios.

---

## 2. Componentes (`mobile/src/components/` e `mobile/src/theme/`)

Todos aceitam `testID`. Os ids de cada tela estão na seção 7.

### 2.1 `Screen`
- Props: `children`, `testID`, `edges?: ('top'|'bottom')[]` (padrão `['top']`),
  `scroll?: boolean`, `keyboard?: boolean`.
- Fundo `background` cobrindo a tela inteira, inclusive a área segura. Insets
  vêm de `react-native-safe-area-context`.
- `scroll`: `ScrollView` com `contentContainerStyle` (padding e gap no
  container, não na ScrollView), `keyboardShouldPersistTaps="handled"` e
  `showsVerticalScrollIndicator={false}`.
- `keyboard`: envolve com `KeyboardAvoidingView` (`behavior="padding"` no iOS;
  Android com `windowSoftInputMode=adjustResize`).
- Tablet (`tablet`): o conteúdo fica numa coluna centralizada com
  `maxWidth: sizes.contentMaxWidth`. Barra de ações e tab bar continuam com a
  largura toda.

### 2.2 `Header` (barra de ações + saudação + aluno)
Referência: Aulas `3:908` (barra) e Boletim `3:317`.

```
┌──────────────────────────────────────────────┐ actionBar 48, bg background
│ [logo 100×16]          TROCAR PERFIL   SAIR ⎋│ px m · gap l entre as ações
└──────────────────────────────────────────────┘
                 ↕ m
            Olá, GUSTAVO                         greeting + greetingName
                 ↕ xxl
               RAFAEL                            body, uppercase
                 ↕ s
       7EF - RM 12567 - Matutino                 body
```
- Props: `guardianFirstName`, `student?: {firstName, rm, className, period}`,
  `canSwitchStudent: boolean`, `onSwitchStudent`, `onLogout`,
  `logoutDisabled?: boolean`.
- **Variantes da barra:** `canSwitchStudent=true` mostra TROCAR PERFIL + SAIR
  (Figma `3:908`). `false` mostra só SAIR (`17:14`). Sem `student` (tela "sem
  aluno"), não há bloco do aluno e só aparece a saudação.
- Ações: `caption` em `text`. SAIR tem o ícone `logout.svg` (10×10) à direita,
  com gap `xs`. Cada ação é um `Pressable` com a altura toda da barra (48) e
  `paddingHorizontal: s`, então o alvo fica ≥ 44 × 44. A margem visual de 16 é
  `m − s` no container (`paddingHorizontal: s`) mais `s` de padding no próprio
  botão.
- Pressionado: `opacity` 0,6 (`motion.fast`).
- A barra de ações é **fixa**. Saudação e aluno rolam junto com o conteúdo, como
  no frame alto do Boletim.

### 2.3 `SectionTitle`
`sectionTitle` centralizado, com `accessibilityRole="header"`. Fica a `section`
(64) abaixo da info do aluno e a `m` acima do dropdown.

### 2.4 `TabBar` (custom, para `@react-navigation/bottom-tabs`)
- Altura `sizes.tabBar` + `insets.bottom`, fundo `surface`, duas colunas iguais
  (`flex: 1`).
- Item: `paddingTop: sm`, ícone 24 (Agenda: calendário 21,4×24; Boletim:
  documento 24×24), gap `xs`, rótulo `tabLabel`. Ativo: ícone e rótulo em
  `primary`. Inativo: `text`.
- Ícones em `react-native-svg`: **um componente por ícone com prop `color`**,
  não as duas versões em SVG. O path é o de `tab-*-active.svg`.
- `accessibilityRole="tab"` em cada item e `"tablist"` no container.
- Não há indicador visual além da cor (o Figma não tem). Ver animação em 4.4.

### 2.5 `Dropdown`
Referência: Aulas `2:48` (aberto) e Boletim `3:1054`.

```
fechado                                   aberto
┌───────────────────────────────┐         ┌───────────────────────────────┐
│ 17 de março, segunda-feira   ⌄│         │ 16 de março, domingo         ⌃│
└───────────────────────────────┘         └───────────────────────────────┘
                                             ↕ s
                                          ┌───────────────────────────────┐
                                          │ 16 de março, domingo          │ cada linha 44
                                          │ 17 de março, segunda-feira    │
                                          │ …                             │
                                          └───────────────────────────────┘
```
- Props: `label: string`, `options: {key: string, label: string}[]`,
  `selectedKey`, `onSelect(key)`, `testID`, `accessibilityLabelPrefix`
  ("Dia" ou "Turma e ano"), `marginHorizontal` (`l` na Agenda, `m` no Boletim,
  como está no Figma).
- Gatilho: `cardVariants.dropdown`. Texto em `body`, `numberOfLines={1}`.
  Chevron 14 em `primary` à direita, que gira 180° aberto.
- Lista: `cardVariants.options`, com a mesma largura e o mesmo x do gatilho,
  **sobreposta** ao conteúdo (no Figma ela cobre a ilustração e o 1º trimestre)
  e `s` abaixo do gatilho. Linha de opção: `minHeight: sizes.touchTarget`,
  `paddingHorizontal: m`, texto `body`. A opção selecionada não tem marca
  visual (Figma). Fica só no estado de acessibilidade.
- **Implementação recomendada:** a lista abre num `Modal` transparente
  (`animationType="none"`, `statusBarTranslucent`), posicionado pelo
  `measureInWindow` do gatilho. Um backdrop `Pressable` transparente cobre a
  tela e fecha a lista. Isso evita briga de `zIndex` dentro de `ScrollView` no
  Android. Se não houver espaço abaixo do gatilho (altura da janela − y <
  altura da lista), a lista abre acima, com `s` de distância.
- Comportamento: tocar no gatilho abre ou fecha. Escolher uma opção fecha e
  chama `onSelect`. Tocar fora ou usar o voltar do Android fecha sem mudar
  nada. Com 1 opção só (ex.: Joana, Bianca: só 2025), o dropdown funciona igual
  e lista 1 item.

### 2.6 `UnderlineInput` e `CpfInput`
Referência: Login `2:6`, `3:1216` e `3:1246`.
- `UnderlineInput` props: `label`, `value`, `onChangeText`, `onBlur`,
  `secureTextEntry?`, `keyboardType?`, `textContentType?`,
  `returnKeyType?`, `onSubmitEditing?`, `editable?`, `testID`, `inputRef`.
- Layout: rótulo (`label`, ou `labelFocused` com foco) → `l` → `TextInput` com
  a variante `inputValue` (centralizada, `selectionColor: primary`,
  `cursorColor: primary`) → `s` → linha de 1 px, largura toda do campo.
- Linha: `inputLine` vazio, `text` com valor. A largura do campo é `100%` do
  container, que tem `marginHorizontal: huge` e `maxWidth: sizes.formMaxWidth`.
- Senha: `secureTextEntry`. O Figma desenha `*********`, mas os pontos nativos
  do sistema ficam como estão (não reimplementar a máscara).
- `CpfInput` = `UnderlineInput` com `keyboardType="number-pad"`,
  `maxLength={14}`, `textContentType="username"`, `autoComplete="username"` e a
  máscara `XXX.XXX.XXX-XX` aplicada no `onChangeText` (util `cpf.mask`, com
  teste). Colar "96929456004" vira "969.294.560-04".
- Senha: `textContentType="password"`, `autoComplete="password"`,
  `returnKeyType="go"`. O "go" envia se o botão estiver habilitado.
- Não há borda vermelha nem mudança na linha em caso de erro (o frame de erro
  do Figma mantém as linhas brancas).

### 2.7 `PrimaryButton`
Referência: Login `2:6` (desabilitado), `3:1246` (ativo), `3:1232` (carregando).
- Props: `label`, `onPress`, `disabled`, `loading`, `testID`.
- `buttonVariants.primary`, largura total, colado na base. A área segura de
  baixo também fica `primary`: `paddingBottom: insets.bottom` e o conteúdo
  centralizado nos 60 de cima.
- Desabilitado: o fundo continua `primary` e o texto fica em `textDisabled`.
- Ativo: texto em `textOnPrimary`.
- Carregando: sem texto, `ActivityIndicator` em `textOnPrimary`
  (`size="small"`) no centro. O botão ignora toques e os campos ficam
  `editable={false}`.
- Pressionado: escala 0,98 com `motion.press`.

### 2.8 `SecondaryButton`
`buttonVariants.secondary`. Props: `label`, `onPress`, `loading`, `testID`.
Carregando: spinner `primary` no lugar do texto, com a largura mantida.

### 2.9 `LessonItem`
Referência: Aulas `2:88`.
```
○  07:15 - 08:00              captionPlain
   ↕ s
   Matemática I               lessonSubject
   ↕ m (até o próximo item)
```
- Props: `startTime`, `endTime`, `subject`, `index`, `testID`.
- Coluna esquerda com largura `sizes.bulletSlot`. A bolinha 6×6, raio `round`,
  `borderWidth: 1`, `borderColor: bulletBorder`, sem preenchimento, fica
  centrada verticalmente na linha do horário.
- Horário: `${startTime} - ${endTime}`. Disciplina: `numberOfLines={2}`
  ("Produção e Interpretação de Textos" quebra em 360).
- Lista: `paddingHorizontal: xxxl`, `l` abaixo do dropdown. O Figma tem os
  itens deslocados 1 a 3 px para a direita a cada linha. É erro do arquivo:
  todos ficam alinhados em 40.

### 2.10 `EmptyState`
Referência: Aulas `2:24`.
- Props: `title`, `description?`, `illustration?: boolean` (padrão `true`),
  `action?: ReactNode`, `testID`.
- Ilustração `no-classroom.png` numa caixa `sizes.illustration` (328×208),
  `overflow: hidden`, imagem alinhada ao topo. O PNG tem 328×290, e os 82 px de
  baixo são o degradê transparente, que é cortado. `l` abaixo do dropdown.
  Ilustração decorativa: `accessible={false}`.
- Título: `emptyState`, `m` abaixo da ilustração. Descrição: `body`
  centralizada, `s` abaixo, `paddingHorizontal: huge`. Ação: `l` abaixo.
- Em `compact` (largura < 375), a ilustração escala para a largura
  disponível − 2 × `l`, mantendo a proporção.

### 2.11 `Accordion` (trimestre e disciplina)
Referência: Boletim `3:389` (trimestre aberto) e `3:549` (disciplinas abertas).

Base: `AccordionItem` com `header`, `children`, `expanded`, `onToggle` e
`testID`. Altura animada (ver 4.6). O corpo é montado na primeira abertura e
não antes, o que economiza 36 linhas por boletim.

**`TermAccordion`**
```
┌──────────────────────────────────────┐ term card 90, px sm, mx m
│ 1º TRIMESTRE                        ⌄│ termTitle + chevron 14 primary
└──────────────────────────────────────┘
  corpo (aberto), fundo background, px xl, pt xs, pb s:
  LÍNGUA PORTUGUESA                   ⌃   SubjectAccordion
     Nota:  9,5
     Faltas:  0
  PRODUÇÃO E INTERPRETAÇÃO DE TEXTOS  ⌄
  …
```
- Props: `term: 1|2|3`, `subjects`, `expanded`, `onToggle`, `testID`.
- Gap entre trimestres: `m`. O corpo aberto fica entre o card e o próximo
  card.
- Estado inicial: os 3 fechados (frame `3:317`). Abrir um não fecha os outros
  (o frame `3:549` mostra T1 e T2 abertos ao mesmo tempo).

**`SubjectAccordion`**
- Linha `minHeight: sizes.touchTarget` (44; o Figma tem 37, ver 6.3), nome em
  `subject` (`flex: 1`, `numberOfLines={2}`), `gap: m` e o chevron 14 `primary`
  à direita.
- Aberto: duas linhas `detail`, "Nota:" + `sm` + valor e "Faltas:" + `sm` +
  valor, com `xs` entre elas e `pb: s`.
- Valores: nota com 1 casa decimal e vírgula (`9.5 → "9,5"`, `8 → "8,0"`,
  `10 → "10,0"`). Faltas como inteiro. `null` → `-` nos dois. O formatador é um
  util com teste, que usa `toFixed(1).replace('.', ',')`, e não
  `toLocaleString`, que varia no Hermes.

### 2.12 `StudentCard`
Referência: Mudança de aluno `2:5`.
- Props: `fullName`, `rm`, `className`, `period`, `selected`, `onPress`,
  `testID`.
- `cardVariants.student` ou `studentSelected`. Nome em `bodyMedium`
  (uppercase), info em `body`: `${className} - RM ${rm} - ${period}`.
- Pressionado: escala 0,98 (`motion.press`).

### 2.13 `Skeleton`
- Primitivo `Skeleton` com `width`, `height` e `radius` (`m` ou `round`), fundo
  `surface`. Animação de pulso descrita em 4.8.
- `AgendaSkeleton`: um bloco do tamanho do dropdown (altura `sizes.dropdown`,
  mx `l`) e, abaixo, 4 linhas no formato do `LessonItem`: bolinha `round` 6, uma
  barra de 88×12 e, `s` abaixo, uma barra de 180×16, com `m` entre as linhas.
- `BoletimSkeleton`: dropdown (mx `m`) + 3 blocos de `sizes.termCard`, raio
  `m`, gap `m`.
- O `Header` não tem skeleton, porque `/me` já está em cache antes da área
  autenticada abrir (ver Splash).
- `accessibilityLabel` "Carregando agenda" ou "Carregando boletim" no
  container, com os filhos escondidos do leitor
  (`importantForAccessibility="no-hide-descendants"`).

### 2.14 `ErrorState`
Não existe no Figma. Fica na linguagem do estado vazio (texto central em 20)
com a ação em teal.
```
         Não foi possível carregar a agenda.     emptyState
                    ↕ s
       Confira sua conexão e tente de novo.     body, center
                    ↕ l
              ┌──────────────────┐
              │  TENTAR DE NOVO  │              SecondaryButton
              └──────────────────┘
```
- Props: `title`, `description`, `onRetry`, `retrying`, `testID`,
  `retryTestID`.
- Fica no lugar do conteúdo, abaixo do título da seção. O dropdown some, porque
  depende do dado. `paddingHorizontal: huge`, `marginTop: section`.
- Sem ilustração: a do "sem aulas" ficaria parecendo "não há aulas", e o
  sentido seria outro.

---

## 3. Telas e estados

Navegação (D10): native-stack `Splash` → `Login` → `App` (bottom-tabs
`Agenda` | `Boletim`) e `SelectStudent` em modal. `NoStudent` e `BootError` são
rotas do stack raiz. As transições do stack estão em 4.

### 3.1 Splash (animada, Tarefa 8b)
Fora do Figma. Base: a capa `4001:2` (logo sobre preto). A animação é escrita
para o **PNG atual** (`logo-login.png`, 250×40, exibido em 306×49). Ela não
depende de SVG nem de letras separadas: usa só máscara, opacidade, escala e
uma cópia recortada do próprio PNG. A evolução com SVG está em 3.1.6.

#### 3.1.1 Splash nativa → JS sem piscar
- **Nativa** (`react-native-bootsplash`): **só o fundo `background`, sem
  logo**. Se a splash nativa mostrasse o logo inteiro, a entrada animada
  pareceria o logo sumindo e voltando. O PNG passado ao `bootsplash generate`
  deve ser um quadrado transparente (ex.: 1×1). O preto aparece durante o
  carregamento do bundle (≈ 0,3 a 0,8 s em release) e emenda no preto da JS.
- **JS** (`SplashScreen`): fundo `background` em tela cheia. Ao primeiro
  `onLayout` da raiz, chama `BootSplash.hide({ fade: false })` e dispara a
  timeline no mesmo frame. A sessão (keychain + `GET /me`) começa a ser lida
  **em paralelo** desde a montagem, sem esperar a animação.

#### 3.1.2 Estrutura (camadas, de baixo para cima)
Tudo dentro de `splash-logo`, uma caixa de `sizes.logoLogin` (306×49)
centralizada na tela (`justifyContent/alignItems: center` na raiz).

```
splash-logo  (306×49, overflow: visible, recebe scale/translate/opacity do grupo)
├─ 1. Image logo-login.png (306×49)
├─ 2. BadgeCover   View `background` exatamente sobre o selo SCHOOL (esconde o selo do PNG até o "pop")
├─ 3. BadgeCopy    View com overflow hidden no retângulo do selo, contendo o MESMO PNG
│                  deslocado (-x, -y): mostra só o selo; é ele que faz o "pop"
├─ 4. WipeMask     View `background` 306×49 (+2 de sobra) que corre para a direita revelando o logo
│                  (fica dentro de um wrapper 306×49 com overflow: hidden, junto com 1 a 3)
└─ 5. ScanLine     View `primary` 2×(49+16), top −8, fora do wrapper com overflow (não é cortada),
                   anda junto com a borda esquerda da WipeMask
splash-loading     (abaixo do logo, l = 24 de distância) trilho de 1 px, largura 306, cor `inputLine`,
                   com um segmento `primary` de 25% da largura que corre dentro dele (overflow hidden)
```

Retângulo do selo, medido no PNG (pixels 168–249 × 14–29 de 250×40). Fica em
`theme.sizes.logoBadge` como **proporção**, para valer em qualquer tamanho de
logo: `{ x: 0.672, y: 0.35, width: 0.328, height: 0.40 }`. Em 306×49 isso dá
x 205,6 · y 17,2 · 100,4 × 19,6. As letras FIAP ocupam 0–0,59 da largura.

#### 3.1.3 Timeline (t = 0 no primeiro frame da JS)
Os valores ficam em `theme.motion.splash`. Tudo em shared values com
`withDelay`/`withTiming`/`withSpring`, iniciado de uma vez no UI thread. O JS
não participa durante a animação.

| t (ms) | camada | o que acontece | easing |
|---|---|---|---|
| 0 | grupo | `opacity 1`, `scale 0.96`; máscara cobrindo tudo (tela preta) | — |
| 80 → 680 | WipeMask | `translateX 0 → 308` (largura + 2): revela F-I-A-P da esquerda para a direita | `Easing.bezier(0.65, 0, 0.35, 1)`, 600 |
| 80 → 680 | ScanLine | `translateX` igual ao da máscara. `opacity 0 → 1` em 80–160 e `1 → 0` em 560–680 | mesma curva; opacidade linear |
| 80 → 880 | grupo | `scale 0.96 → 1` | `Easing.out(Easing.cubic)`, 800 |
| 620 → ~1000 | BadgeCopy | "pop" do selo: `opacity 0 → 1` (120, linear) e `scale 0.4 → 1` com spring `{damping: 12, stiffness: 180, mass: 0.8}` (passa de 1 por ~8% e assenta). Origem no centro do selo | spring |
| 1200 | — | **fim da entrada** (duração mínima). Se o destino já estiver decidido, a saída começa aqui | — |

A BadgeCover fica por baixo da cópia o tempo todo. Quando a cópia chega a
`scale 1`, ela cobre o selo original pixel a pixel, e a capa não precisa sair.
A máscara não passa por cima do selo visível, porque o pop começa (620) quando
ela já passou do x do selo (≈ 0,67 da largura, por volta de 430 ms com essa
curva).

#### 3.1.4 Loop de espera (só se a sessão demorar)
- Começa em **t = 1500** e só se o destino ainda não estiver decidido. Os 300 ms
  de folga depois do mínimo evitam que o loop pisque e suma quando a resposta
  chega em seguida.
- `splash-loading` com `opacity 0 → 1` (`motion.fast`). O segmento de 25% faz
  `translateX` de −25% a 100% da largura do trilho, 1000 ms,
  `Easing.inOut(Easing.cubic)`, com `withRepeat(-1)` sem reverso. Lembra a
  linha do input do login, então fica dentro da linguagem do Figma.
- Ao mesmo tempo, o selo "respira": a BadgeCopy faz `scale 1 → 1.04 → 1`,
  1600 ms por ciclo, `Easing.inOut(Easing.sin)`, em loop.
- **Para assim que a sessão resolve.** `cancelAnimation` nos loops, o trilho
  com `opacity → 0` (`motion.fast`) e o selo volta a `scale 1` com
  `withTiming(1, {duration: 150})`. A saída começa em seguida, sem esperar o
  ciclo terminar.

#### 3.1.5 Durações, destinos e saídas
- **Mínima:** 1200 ms da entrada. A saída começa em `max(1200, tempo da
  sessão)`. Num caso típico (sessão em < 1,2 s), o usuário vê a splash por
  ≈ 1,2 s + a saída (≈ 0,25 a 0,32 s), ou seja, 1,5 s no total.
- **Máxima:** o `GET /me` da inicialização tem `timeout` de **8000 ms** no axios
  e cai em `BootError`. Há também uma trava geral de **10 000 ms** na splash
  (keychain travado, promessa que não resolve):
  - com token, vai para `BootError`;
  - sem token, vai para Login.

  A trava é do ViewModel (testável com fake timers), não da animação.
- **Quem decide:** o `useSplashViewModel` expõe
  `destination: 'login' | 'app' | 'noStudent' | 'bootError' | null`. Ele só
  preenche o destino depois do mínimo, com
  `Promise.all([sessão, espera(1200)])` e a trava de 10 s. A View observa
  `destination`, dispara a saída no UI thread e, no callback de fim, navega com
  `scheduleOnRN(navigation.reset, …)` (`react-native-worklets`, porque no
  reanimated 4 o `runOnJS` é legado).

| destino | quando | saída |
|---|---|---|
| Login | sem token, 401 no `/me` ou trava de 10 s sem token | o logo sobe do centro até a posição do logo do login: `translateY` = (`insets.top + spacing.hero`) − (altura da janela − 49)/2, em `motion.slow` 320 com `Easing.bezier(0.2, 0, 0, 1)`. No fim, `reset` para Login com `animation: 'none'` e param `fromSplash: true`. O Login já desenha o logo no mesmo lugar e só anima campos e botão (4.1) |
| App (Agenda) | token + `/me` ok com ≥ 1 aluno | grupo com `opacity 1 → 0` e `scale 1 → 0.92`, 250 ms, `Easing.in(Easing.cubic)`. No fim, `reset` para App com `animation: 'none'`; o Header faz a entrada dele (4.3) |
| NoStudent | token + `/me` ok com 0 aluno | igual ao App |
| BootError | rede, 5xx ou timeout no `/me`, ou trava de 10 s com token | igual ao App |

Para a emenda com o Login ser exata, `Screen` do Login e `SplashScreen` usam
a mesma origem (janela inteira, com o inset de cima vindo de
`useSafeAreaInsets`). No Login com `fromSplash`, nada pode deslocar o logo no
primeiro frame (sem `KeyboardAvoidingView` ativo, sem animação de entrada no
logo).

#### 3.1.6 Reduzir movimento
Com `useReducedMotion() === true`:
- **Sem wipe, sem linha teal, sem pop, sem escala.** O logo inteiro (PNG, com
  BadgeCover e BadgeCopy já em opacidade 1 e escala 1) faz só
  `opacity 0 → 1` em 200 ms, linear. Opacidade não é movimento.
- **Mínima de 600 ms**, só para não piscar.
- **Loop:** o trilho `splash-loading` aparece **parado**, com o segmento fixo
  no centro, a partir de 1500 ms. O leitor de tela continua com o rótulo
  "Carregando".
- **Saídas:**
  - para Login, o grupo some (`opacity → 0`, 150 ms), e o Login, montado com
    `fromSplash`, aparece com `FadeIn.duration(150)` no logo e nos campos,
    sem deslocamento;
  - para os outros destinos, fade de 150 ms sem escala.

#### 3.1.7 Evolução opcional com o SVG do logo (não bloqueia)
Se chegar o SVG do nó `4001:4`:
- **Desenho por traço:** cada letra F, I, A, P é um `Path` com
  `strokeDasharray = comprimento` e `strokeDashoffset` animado de
  comprimento → 0 via `useAnimatedProps`. São 500 ms por letra, com 80 ms de
  defasagem e `Easing.inOut(Easing.cubic)`. O traço é `primary` com 1,5 de
  espessura, e depois o preenchimento teal faz `fillOpacity 0 → 1` em 200 ms.
  Isso substitui a WipeMask e a ScanLine; a timeline continua terminando em
  ≈ 1200.
- **Selo:** o retângulo rosa faz `scaleX 0 → 1` a partir da esquerda (250,
  `easeOut`) e o texto SCHOOL entra com `opacity` (150) logo depois. A
  BadgeCover e a BadgeCopy deixam de existir.
- **Loop:** um brilho diagonal (`LinearGradient` do `react-native-svg`, faixa
  branca a 35% de opacidade) atravessa só as letras, recortado por `ClipPath`
  com os mesmos paths. Não precisa de `MaskedView` nem de dependência nova. O
  trilho `splash-loading` pode continuar ou sair.
- Mesmas camadas externas (`splash-logo`, `splash-loading`), mesmos testIDs,
  mesmo ViewModel, mesmas saídas e mesmo reduzir movimento. A splash nativa
  continua só preta.

#### 3.1.8 Acessibilidade e testIDs da splash
- `splash-screen`: raiz, com `accessibilityLabel="FIAP School"`.
- `splash-logo`: `accessibilityRole="image"`, `accessibilityLabel="FIAP School"`.
  As camadas internas ficam escondidas do leitor
  (`importantForAccessibility="no-hide-descendants"`).
- `splash-loading`: `accessibilityRole="progressbar"`,
  `accessibilityLabel="Carregando"`. Só fica acessível quando está visível
  (`opacity` > 0, ou seja, a partir de 1500 ms).
- Nenhuma animação de piscar: a frequência fica abaixo de 3 Hz (critério 2.3.1).
- Performance: só `transform` e `opacity` em `View`/`Image`, 5 shared values,
  sem `setState` durante a animação. Os loops são cancelados no `unmount`.

### 3.2 Login
Referência: Login `0:1`. Estrutura (`Screen keyboard scroll`, sem `edges` de
baixo, porque o botão cuida do inset):
```
  ↕ hero (a partir do inset de cima)
  [logo 306×49, centralizado]
  ↕ hero
  CPF                         label / labelFocused
  ↕ l
  969.294.560-04              inputValue
  ↕ s
  ─────────────────           linha (inputLine | text)
  ↕ xxxl
  SENHA
  ↕ l
  ••••••
  ↕ s
  ─────────────────
  ↕ xxl
  Usuário ou senha inválida.  error (só no estado de erro)
  Pode tentar novamente?
  (flex)
[         FAZER LOGIN          ]   PrimaryButton, colado na base
```
Com o teclado aberto, o `KeyboardAvoidingView` sobe o botão para cima do
teclado e o formulário rola. O botão nunca fica escondido.

Estados (os 5 do Figma):

| Estado | Figma | O que se vê |
|---|---|---|
| Inicial | `2:6` | campos vazios, linhas `inputLine`, botão com texto `textDisabled` |
| CPF com máscara, senha focada | `3:1216` | linha do CPF `text`; rótulo SENHA em `labelFocused`; botão desabilitado |
| Pronto | `3:1246` | CPF válido + senha com 1+ caractere; linhas `text`; botão com texto `textOnPrimary` |
| Carregando | `3:1232` | botão sem texto + spinner; campos não editáveis |
| Erro | `3:1262` | mensagem `error` em 2 linhas abaixo da senha; botão ativo de novo; valores mantidos |

Regras:
- O botão só habilita com CPF de 11 dígitos **com dígito verificador válido** e
  senha não vazia (M1).
- CPF com 11 dígitos e DV inválido: ao sair do campo (blur), a área de erro
  mostra "Confira o CPF digitado.". Some quando o CPF muda.
- 401: o texto fixo do Figma (2 linhas). Não usamos a string crua da API,
  porque o Figma tem a frase com a segunda linha. O texto da API ("Usuário ou
  senha inválida.") é a primeira linha, então o M1 continua atendido.
- A mensagem de erro some quando o usuário edita qualquer um dos campos.
- Depois do erro, a senha fica como está e o foco não muda (não abrir o
  teclado sozinho).
- Sessão expirada (o interceptor de 401 trouxe de volta ao Login): a área de
  erro abre com "Sua sessão expirou. Entre de novo.".

### 3.3 Agenda
Referência: Aulas `2:88` (lista), `2:48` (dropdown aberto), `2:24` (sem aulas).
```
[Header]
  ↕ section
AGENDA                                  SectionTitle
  ↕ m
[Dropdown dia, mx l]
  ↕ l
[LessonItem × n, px xxxl]  |  [EmptyState]  |  [AgendaSkeleton]  |  [ErrorState]
  ↕ l (fim do scroll)
[TabBar]
```
- O dropdown lista os 7 dias da resposta, de domingo a sábado:
  "16 de março, domingo" … "22 de março, sábado". Formato
  `{dia} de {mês}, {dia da semana}`, tudo minúsculo. Use um util próprio com
  nomes de mês e de dia em pt-BR (não `Intl`, que varia no Hermes) e leia
  `"2025-03-17"` como data **local** (`new Date(2025, 2, 17)`), nunca
  `new Date("2025-03-17")`, que é UTC e no Brasil vira o dia 16.
- Dia inicial: o dia da agenda com o mesmo dia da semana de hoje (D35).
- Estados:
  - carregando (1ª carga, sem cache): `AgendaSkeleton`;
  - lista: os itens do dia;
  - sem aulas (`lessons: []`, domingo e sábado no seed): `EmptyState` "Sem
    aulas neste dia";
  - erro: `ErrorState` da agenda;
  - refetch em segundo plano (aluno trocado com cache): o conteúdo antigo fica
    na tela, sem skeleton.

### 3.4 Boletim
Referência: Boletim `3:317`, `3:1054`, `3:389`, `3:549`.
```
[Header]
  ↕ section
BOLETIM
  ↕ m
[Dropdown turma-ano, mx m]   "7EF - 2025"
  ↕ m
[TermAccordion 1] ↕ m [TermAccordion 2] ↕ m [TermAccordion 3]
  ↕ l
[TabBar]
```
- O dropdown lista `report-cards` (desc): "7EF - 2025", "6EF - 2024". Abre em
  2025.
- Estados:
  - fechado (`3:317`): 3 cards;
  - ano aberto (`3:1054`): a lista de opções sobre o 1º card;
  - trimestre aberto (`3:389`): 12 disciplinas fechadas;
  - disciplina aberta (`3:549`): Nota e Faltas;
  - não avaliado (T2, T3 em 2025): Nota `-` e Faltas `-`;
  - carregando: `BoletimSkeleton` (na troca de ano, só os 3 cards viram
    skeleton e o dropdown fica);
  - erro: `ErrorState` do boletim;
  - 404 de um ano: não deve acontecer, porque o ano vem da lista. Se
    acontecer, cai no `ErrorState`.
- Trocar de ano fecha todos os acordeões.

### 3.5 Seleção de aluno
Referência: Mudança de aluno `2:5`. Modal de tela cheia, sem Header nem
TabBar.
```
                               FECHAR ✕     bodyBold primary + ícone 24, gap s,
                                            pt m, pr m, alvo ≥ 44
 (bloco centralizado na vertical)
        Escolha o perfil                    title, 2 linhas
     que você quer visualizar
            ↕ section
 ┌──────────────────────────────────┐       StudentCard (selecionado), mx m
 │ RAFAEL DA SILVA                  │
 │ 7EF - RM 12567 - Matutino        │
 └──────────────────────────────────┘
            ↕ m
 ┌──────────────────────────────────┐
 │ JOANA DA SILVA                   │
 │ 2EM - RM 12568 - Matutino        │
 └──────────────────────────────────┘
```
- O título e os cards formam um bloco centralizado na vertical (no Figma o
  centro do bloco cai exatamente no centro do frame). Isso fica num
  `ScrollView` com `contentContainerStyle={{flexGrow: 1, justifyContent:
  'center'}}`, então com muitos alunos a lista rola.
- O FECHAR é absoluto no topo direito, abaixo do inset.
- Tocar num card: se é o aluno atual, só fecha. Senão, troca o aluno no store
  e chama `goBack()`, voltando para a aba de origem (M6).
- O voltar do Android e o gesto de descer do iOS fecham sem trocar.

### 3.6 Sem aluno vinculado (`NoStudent`)
Fora do Figma. Usa a barra de ações na variante só SAIR (`17:14`) e a saudação.
Sem tab bar.
```
[barra: logo ........................ SAIR ⎋]
  ↕ m
Olá, CARLOS
  ↕ section
[EmptyState com ilustração]
  Nenhum aluno vinculado
  Não encontramos alunos ligados ao seu CPF. Fale com a secretaria
  da FIAP School para fazer o vínculo.
```
O responsável sem aluno do seed tem o nome que o developer da API definir. A
saudação usa o `firstName` que vier do `/me`. O logout é o da barra (M7). Uso a
ilustração do "sem aulas" porque é a única do Figma e não sugere erro.

### 3.7 Erro de rede no início (`BootError`)
Fora do Figma. Barra só com SAIR, sem saudação (o `/me` falhou) e um
`ErrorState`:
- título "Não conseguimos conectar.";
- descrição "Confira sua conexão e tente de novo.";
- botão TENTAR DE NOVO, que refaz o `/me`. Com sucesso, segue para
  App ou NoStudent.

SAIR funciona mesmo offline: apaga a sessão local e tenta remover o device em
segundo plano.

### 3.8 Erro de rede dentro das abas
É o `ErrorState` das seções 3.3 e 3.4. O Header e a TabBar continuam
utilizáveis. "Tentar de novo" chama o `refetch` da query, e o botão mostra
spinner até a resposta. Se falhar de novo, o mesmo estado volta (e o leitor de
tela anuncia de novo).

### 3.9 Logout
Sem diálogo de confirmação: o Figma não tem, e entrar de novo custa pouco.
Tocar em SAIR desabilita o botão, limpa a sessão e faz `reset` para o Login
(animação 4.1, sem o logo vindo da splash).

---

## 4. Animações por tela (R10, M9)

Todas com `.reduceMotion(ReduceMotion.System)` ou checagem de
`useReducedMotion()`.

### 4.1 Splash → Login e transições do stack
| O quê | Tipo | Duração / easing | Gatilho |
|---|---|---|---|
| Entrada da splash (wipe + linha teal + pop do selo) | shared values, timeline da seção 3.1.3 | 1200 mínimo | primeiro frame da JS |
| Loop de espera (trilho + selo respirando) | `withRepeat`, seção 3.1.4 | 1000 / 1600 por ciclo | sessão pendente em t = 1500 |
| Logo sobe do centro para a posição do login | `translateY` calculado (seção 3.1.5) | `slow` 320, `Easing.bezier(0.2, 0, 0, 1)` | destino = Login, depois do mínimo |
| Campos CPF e SENHA (Login com `fromSplash`) | `FadeInDown.duration(base).delay(i*stagger)` com translate de 12, iniciados na montagem do Login (o logo já chegou) | 220, `easeOut` | montagem do Login |
| Botão de login | `SlideInDown.duration(base)` | 220, `easeOut` | junto com os campos |
| Splash → App / NoStudent / BootError | grupo: `opacity 1→0` + `scale 1→0.92`, depois `reset` com `animation: 'none'` | 250, `Easing.in(Easing.cubic)` | destino decidido, depois do mínimo |
| Login → App, App → Login (logout) | native-stack `animation: 'fade'` | padrão nativo | navegação |
| Login vindo do logout | logo + campos com `FadeIn.duration(base)` (sem o deslocamento da splash) | 220 | montagem |
| App → Seleção de aluno | `presentation: 'fullScreenModal'`, `animation: 'slide_from_bottom'` | padrão nativo | TROCAR PERFIL |

### 4.2 Login
| O quê | Tipo | Duração / easing | Gatilho |
|---|---|---|---|
| Rótulo com foco | troca `label` ↔ `labelFocused` (sem animar peso) | instantâneo | focus/blur |
| Linha do input | `interpolateColor` `inputLine → text` | `fast` 150 | valor vazio ↔ preenchido |
| Texto do botão | `interpolateColor` `textDisabled → textOnPrimary` | `fast` 150 | habilitou/desabilitou |
| Texto → spinner | texto `FadeOut.duration(100)`, spinner `FadeIn.duration(fast)` | 100 / 150 | `loading` |
| Erro: shake do formulário | `translateX` com `withSequence(-10, 10, -8, 8, -4, 0)`, 50 ms cada | 300 total | 401 / erro de rede |
| Erro: mensagem | `FadeInDown.duration(base)` (translate 8); saída `FadeOut.duration(fast)` | 220 / 150 | erro aparece/some |
| Pressionar botão | `scale 0.98` spring `press` | spring | pressIn/pressOut |

Com reduzir movimento, não há shake: a mensagem aparece e é anunciada.

### 4.3 Header (entrada da área autenticada)
Roda **uma vez**, na primeira montagem de cada aba (as abas ficam montadas
depois, então trocar de aba não repete a entrada).

| Elemento | Entrada |
|---|---|
| Barra de ações | `FadeIn.duration(base)` |
| Saudação | `FadeInDown.duration(base).delay(0)` |
| Nome + info do aluno | `FadeInDown.duration(base).delay(stagger)` |
| Título da seção | `FadeInDown.duration(base).delay(2*stagger)` |
| Dropdown | `FadeInDown.duration(base).delay(3*stagger)` |
| Conteúdo (lista/cards) | ver 4.5 e 4.6, a partir de `4*stagger` |

Troca de aluno (volta do modal): o bloco do aluno tem `key={studentId}`, com
`exiting={FadeOut.duration(fast)}` e `entering={FadeIn.duration(base)}`. O
conteúdo da aba segue a regra de troca (4.5 e 4.6).

### 4.4 TabBar e troca de aba
- Cor do item: duas camadas sobrepostas (ícone e rótulo em `text` e em
  `primary`), com crossfade de `opacity` em `base` 220 e `easeOut`. Assim não se
  anima a cor de SVG, que não roda na UI thread.
- Ícone do item que ficou ativo: `scale 1 → 1.12 → 1` (`withSequence`,
  `fast` cada etapa).
- Conteúdo: bottom-tabs com `animation: 'fade'` (React Navigation 7). Se a
  versão instalada não tiver a opção, o conteúdo da aba entra com
  `FadeIn.duration(fast)` quando ganha foco.

### 4.5 Agenda
| O quê | Tipo | Duração / easing | Gatilho |
|---|---|---|---|
| Chevron do dropdown | `rotate 0 → 180deg` | `base`, `easeOut` | abrir/fechar |
| Lista de opções | entrada `FadeIn` + `translateY -8 → 0`; saída `FadeOut` | `fast` 150 / 120 | abrir/fechar |
| Troca de dia: saída | o container da lista com `key={date}` e `exiting={FadeOut.duration(120)}` | 120, `easeIn` | `onSelect` |
| Troca de dia: entrada | cada `LessonItem` com `FadeInDown.duration(base).delay(i*stagger)` (translate 8), até 6 itens | 220 + 5×40 = 420 máx. | nova data |
| Sem aulas | ilustração `FadeIn` + `scale 0.96 → 1`; texto `FadeInDown.delay(stagger)` | `base` | dia vazio |
| Skeleton → conteúdo | skeleton `FadeOut.duration(fast)`; o conteúdo entra como acima | | dado chegou |

### 4.6 Boletim
| O quê | Tipo | Duração / easing | Gatilho |
|---|---|---|---|
| Cards de trimestre (entrada) | `FadeInDown.duration(base).delay(i*60)` | 220, `easeOut` | montagem / troca de ano |
| Abrir/fechar acordeão (trimestre e disciplina) | altura com shared value: o corpo mede a altura num `View` interno (`onLayout`) e o container anima `height` de 0 até a medida, com `overflow: hidden` | `base` 220, `easeOut` (fechar: `fast` 150, `easeIn`) | toque no cabeçalho |
| Chevron | `rotate 0 → 180deg`, no mesmo `progress` da altura | junto | junto |
| Disciplinas ao abrir o trimestre | `FadeIn.duration(fast).delay(min(i,6)*20)` | ≤ 270 | 1ª abertura |
| Nota e Faltas ao abrir a disciplina | `opacity` no mesmo `progress` da altura | junto | toque |
| Troca de ano | container dos cards com `key={year}`: `FadeOut.duration(120)` → cards entram como acima | | `onSelect` |

A "contagem nas notas" do D11 sai: animar texto número a número exige
`setState` por frame ou um `TextInput` animado, o que custa frame no Android em
lista. Fica o fade, no mesmo `progress` do acordeão.

### 4.7 Seleção de aluno
| O quê | Tipo | Duração |
|---|---|---|
| Título | `FadeInDown.duration(base)` | 220 |
| Cards | `FadeInDown.duration(base).delay(stagger + i*60)` | ≤ 6 cards |
| FECHAR | `FadeIn.duration(base).delay(stagger)` | 220 |
| Pressionar card | `scale 0.98` spring `press` | spring |
| Card escolhido | a borda vai `transparent → primary` (`interpolateColor`, `fast`) e o `goBack()` vem 120 ms depois, para o usuário ver a escolha | 150 + 120 |

### 4.8 Estados (vazio, erro, sem aluno, skeleton)
- `ErrorState` e `EmptyState` (inclusive NoStudent e BootError): o título com
  `FadeInDown.duration(base)`, a descrição com `.delay(stagger)` e o botão com
  `.delay(2*stagger)`.
- Retry com erro de novo: o bloco faz um shake curto
  (`withSequence(-6, 6, -3, 0)`, 50 ms cada), igual ao do login.
- Skeleton: `opacity` 0,5 ↔ 1 com `withRepeat(withTiming(…, {duration: 800,
  easing: Easing.inOut(Easing.ease)}), -1, true)`. Um único shared value por
  tela, compartilhado pelos blocos. Com reduzir movimento, fica parado em 0,7.
  O loop é cancelado ao desmontar.

---

## 5. Textos finais (pt-BR, exatamente como na tela)

O app não tem i18n (brief, fora de escopo). Sugiro um `src/constants/strings.ts`
com estas chaves, para o teste e o Maestro não duplicarem texto.

| chave | texto |
|---|---|
| `login.cpfLabel` | `CPF` |
| `login.passwordLabel` | `SENHA` |
| `login.submit` | `FAZER LOGIN` |
| `login.error.invalid` | `Usuário ou senha inválida.\nPode tentar novamente?` |
| `login.error.cpf` | `Confira o CPF digitado.` |
| `login.error.network` | `Não conseguimos falar com o servidor.\nConfira sua conexão e tente de novo.` |
| `login.error.tooMany` | `Muitas tentativas seguidas.\nAguarde um minuto e tente de novo.` |
| `login.error.server` | `Algo deu errado do nosso lado.\nTente de novo em instantes.` |
| `login.error.sessionExpired` | `Sua sessão expirou. Entre de novo.` |
| `header.greeting` | `Olá, ` + `{primeiro nome}` (o nome em `greetingName`, maiúsculo) |
| `header.studentInfo` | `{turma} - RM {rm} - {período}` (ex.: `7EF - RM 12567 - Matutino`) |
| `header.switchStudent` | `TROCAR PERFIL` |
| `header.logout` | `SAIR` |
| `tabs.agenda` | `AGENDA` |
| `tabs.boletim` | `BOLETIM` |
| `agenda.title` | `AGENDA` |
| `agenda.dayLabel` | `{d} de {mês}, {dia da semana}` (ex.: `17 de março, segunda-feira`) |
| `agenda.lessonTime` | `{início} - {fim}` (ex.: `07:15 - 08:00`) |
| `agenda.empty` | `Sem aulas neste dia` |
| `agenda.error.title` | `Não foi possível carregar a agenda.` |
| `boletim.title` | `BOLETIM` |
| `boletim.yearLabel` | `{turma} - {ano}` (ex.: `7EF - 2025`) |
| `boletim.term` | `{n}º TRIMESTRE` (ordinal `º`, U+00BA) |
| `boletim.grade` | `Nota:` |
| `boletim.absences` | `Faltas:` |
| `boletim.notEvaluated` | `-` |
| `boletim.error.title` | `Não foi possível carregar o boletim.` |
| `common.error.description` | `Confira sua conexão e tente de novo.` |
| `common.retry` | `TENTAR DE NOVO` |
| `selectStudent.close` | `FECHAR` |
| `selectStudent.title` | `Escolha o perfil\nque você quer visualizar` |
| `noStudent.title` | `Nenhum aluno vinculado` |
| `noStudent.description` | `Não encontramos alunos ligados ao seu CPF. Fale com a secretaria da FIAP School para fazer o vínculo.` |
| `boot.error.title` | `Não conseguimos conectar.` |

Meses: janeiro, fevereiro, março, abril, maio, junho, julho, agosto, setembro,
outubro, novembro, dezembro. Dias: domingo, segunda-feira, terça-feira,
quarta-feira, quinta-feira, sexta-feira, sábado.

### Textos de acessibilidade

| elemento | accessibilityLabel | role / state / hint |
|---|---|---|
| Logo (login, splash, barra) | `FIAP School` | `image` |
| Trilho de espera da splash | `Carregando` | `progressbar` |
| CPF | `CPF` | `TextInput`; hint `Somente números` |
| Senha | `Senha` | |
| Botão de login | `Fazer login` / carregando: `Entrando` | `button`, `{disabled, busy}` |
| Mensagem de erro | o próprio texto, sem `\n` | `accessibilityLiveRegion="polite"` (Android) + `AccessibilityInfo.announceForAccessibility` (iOS) |
| Saudação | `Olá, Gustavo` | `header` |
| Bloco do aluno (um só elemento) | `Aluno Rafael, turma 7EF, RM 12567, período Matutino` | `text` |
| TROCAR PERFIL | `Trocar aluno` | `button`, hint `Abre a lista de alunos` |
| SAIR | `Sair da conta` | `button` |
| AGENDA / BOLETIM (título) | `Agenda` / `Boletim` | `header` |
| Dropdown da agenda | `Dia: 17 de março, segunda-feira` | `button`, `{expanded}`, hint `Toque para escolher outro dia` |
| Dropdown do boletim | `Turma e ano: 7EF - 2025` | `button`, `{expanded}`, hint `Toque para ver outros anos` |
| Opção do dropdown | o texto da opção | `button`, `{selected}` |
| Item de aula (um elemento) | `Das 07:15 às 08:00, Matemática I` | `text` |
| Estado vazio da agenda | `Sem aulas neste dia` | `text` |
| Trimestre | `1º trimestre` | `button`, `{expanded}` |
| Disciplina | `Língua Portuguesa` | `button`, `{expanded}` |
| Nota e Faltas (um elemento) | `Nota 9,5, 0 faltas` / `Nota e faltas ainda não lançadas` | `text` |
| Aba | `Agenda` / `Boletim` | `tab`, `{selected}` |
| FECHAR | `Fechar` | `button` |
| Card de aluno | `Rafael da Silva, turma 7EF, RM 12567, Matutino` | `button`, `{selected}` no atual |
| Skeleton | `Carregando agenda` / `Carregando boletim` | `progressbar` |
| Tentar de novo | `Tentar de novo` | `button`, `{busy}` quando carregando |
| Ilustração | (nenhum) | `accessible={false}` |

---

## 6. Acessibilidade

### 6.1 Contraste (WCAG 2.2, calculado)

| par | razão | resultado |
|---|---|---|
| `primary` #29F4D5 sobre `background` #000 | **15,0 : 1** | AAA em qualquer tamanho. O teal sobre preto passa folgado. |
| `primary` sobre `surface` #262626 (chevron do dropdown, aba ativa) | 10,8 : 1 | AAA |
| `primary` sobre `surfaceRaised` #4D4D4D (TRIMESTRE) | 6,0 : 1 | AA (texto 16 Bold) |
| `text` sobre `surfaceRaised` | 8,4 : 1 | AAA |
| `text` sobre `surface` | 15,1 : 1 | AAA |
| `textOnPrimary` #000 sobre `primary` | 15,0 : 1 | AAA |
| `textDisabled` #777 sobre `primary` | **3,2 : 1** | Abaixo de 4,5 para texto de 20 Medium. **Mantido**: o critério 1.4.3 isenta controle inativo, e escurecer o cinza diminui a diferença visual entre desabilitado e ativo (preto), que é justamente a informação. O estado vai para o leitor por `accessibilityState.disabled`. Sem ajuste. |
| `inputLine` #525252 (Figma) sobre #000 | **2,7 : 1** | Reprova o 1.4.11 (borda de componente ≥ 3 : 1). É a única pista de onde fica o campo vazio. |
| `inputLine` **#5C5C5C** (proposto) sobre #000 | 3,1 : 1 | Passa. A diferença para #525252 é imperceptível no print lado a lado. |
| `bulletBorder` #CCC sobre #000 | 13,1 : 1 | ok (decorativo) |

### 6.2 Ajuste de cor feito
Só um: `inputLine` passa de `#525252` para `#5C5C5C` (`palette.gray600`). O
teal e o resto da identidade ficam como estão.

### 6.3 Alvos de toque (≥ 44)

| elemento | no Figma | especificado |
|---|---|---|
| TROCAR PERFIL / SAIR | texto de 12 | `Pressable` com 48 de altura (a barra) e `paddingHorizontal: s` |
| FECHAR ✕ | 24 | `Pressable` com `minHeight` 44 e `hitSlop` de `s` |
| Dropdown | 45 | ok |
| Opção do dropdown | linhas de 36 | **44** (+8 por linha) |
| Disciplina (acordeão) | linhas de 37 | **44** (+7 por linha) |
| Card de trimestre / aluno | 90 | ok |
| Aba | 64 × meia largura | ok |
| Botão de login | 60 × largura toda | ok |

As duas mudanças (opções e disciplinas) desviam do Figma em poucos pixels por
linha. Ver Mensagens: se o chief preferir o Figma exato, a alternativa é manter
36/37 de altura e aceitar o mínimo WCAG de 24 (2.5.8), mas aí o critério de
44 do pedido não fica atendido.

### 6.4 Ordem de foco e leitor de tela
- Login: logo → CPF → Senha → erro (quando há) → botão. O teclado CPF avança
  para a senha com `returnKeyType="next"` + `inputRef.focus()`.
- Abas: barra (logo, TROCAR PERFIL, SAIR) → saudação → aluno → título →
  dropdown → conteúdo → tab bar.
- Lista do dropdown aberta: o `Modal` prende o foco do leitor
  (`accessibilityViewIsModal`). Ao fechar, o foco volta ao gatilho
  (`AccessibilityInfo.setAccessibilityFocus` no `findNodeHandle` do gatilho).
- Erros: anunciados uma vez quando aparecem (tabela de textos de
  acessibilidade).
- Seleção de aluno: o foco começa no título. Ao voltar, o leitor anuncia o
  bloco do aluno novo (ele muda de `key`).

---

## 7. testIDs (estáveis, para os 10 flows)

Padrão: `kebab-case`, `<tela>-<elemento>`, com sufixos determinísticos (data,
ano, RM, índice). Os componentes genéricos derivam os ids dos filhos a partir
do `testID` recebido:
- Dropdown: `X`, `X-label`, `X-option-<key>`;
- Accordion: `X` (cabeçalho), `X-content`;
- ErrorState: `X`, `X-retry`.

| id | elemento | flows |
|---|---|---|
| `splash-screen` | splash JS | 03 |
| `splash-logo` | grupo animado do logo | — |
| `splash-loading` | trilho do loop de espera | — |
| `login-screen` | raiz do Login | 01, 02, 10 |
| `login-cpf-input` | CPF | 01, 02, 07–10 |
| `login-password-input` | senha | 01, 02, 07–10 |
| `login-submit-button` | botão | 01, 02, 07–10 |
| `login-submit-loading` | spinner do botão | — |
| `login-error-message` | texto de erro | 01 |
| `header` | raiz do Header | 02 |
| `header-greeting` | "Olá, GUSTAVO" | 02 |
| `header-student-name` | "RAFAEL" | 02, 07 |
| `header-student-info` | "7EF - RM 12567 - Matutino" | 02, 07 |
| `header-switch-student-button` | TROCAR PERFIL | 07, 08 (`assertNotVisible`) |
| `header-logout-button` | SAIR (Header, NoStudent e BootError) | 09, 10 |
| `tab-bar` | tab bar | — |
| `tab-agenda` / `tab-boletim` | abas | 05, 06, 07 |
| `agenda-screen` | raiz da Agenda | 02, 03, 04 |
| `agenda-day-dropdown` | gatilho | 04 |
| `agenda-day-dropdown-label` | texto do gatilho | 04 |
| `agenda-day-dropdown-option-2025-03-16` … `-2025-03-22` | opções (chave = data ISO) | 04 |
| `agenda-lesson-list` | container da lista | 04 |
| `agenda-lesson-<i>` | item (índice a partir de 0) | 04 |
| `agenda-lesson-<i>-time` / `agenda-lesson-<i>-subject` | horário / disciplina | 04 |
| `agenda-empty` | estado vazio | 04 |
| `agenda-skeleton` | skeleton | — |
| `agenda-error` / `agenda-error-retry` | erro / botão | M8 manual |
| `boletim-screen` | raiz do Boletim | 05, 06, 07 |
| `boletim-year-dropdown` | gatilho | 05, 06 |
| `boletim-year-dropdown-label` | "7EF - 2025" | 05, 06 |
| `boletim-year-dropdown-option-2025` / `-2024` | opções (chave = ano) | 06 |
| `boletim-term-1` … `boletim-term-3` | cabeçalho do trimestre | 05, 06 |
| `boletim-term-<t>-content` | corpo do trimestre | 05 |
| `boletim-term-<t>-subject-<i>` | cabeçalho da disciplina (índice na ordem do JSON, 0 = Língua Portuguesa) | 05 |
| `boletim-term-<t>-subject-<i>-grade` / `-absences` | valor da nota / faltas | 05 |
| `boletim-skeleton` | skeleton | — |
| `boletim-error` / `boletim-error-retry` | erro / botão | M8 manual |
| `select-student-screen` | raiz do modal | 07 |
| `select-student-close-button` | FECHAR | — |
| `select-student-card-<rm>` | card (ex.: `select-student-card-12568`) | 07 |
| `no-student-screen` | raiz do NoStudent | 09 |
| `boot-error-screen` / `boot-error-retry` | erro no início | — |

Observações para os flows:
- Os ids que mostram valor (`-grade`, `-label`, `header-student-name`) devem
  ficar **no `Text`**, para o Maestro ler o texto com
  `assertVisible: {id, text}`.
- Por causa do `textTransform`, o texto na hierarquia pode vir maiúsculo ou
  não, conforme a plataforma. Nos flows, compare nome com regex sem diferença
  de caixa (`text: "(?i)rafael"`).
- Flow 03 (e todo `launchApp`): a splash dura no mínimo 1,2 s e pode ir até 10 s. Use `extendedWaitUntil: {visible: {id: agenda-screen}, timeout: 12000}`, não `assertVisible` direto.
- Flow 04: hoje (terça) a Agenda abre em 18/03. O flow deve **selecionar** o
  dia, não supor o inicial.
- Flow 05: T2 sem nota → `boletim-term-2-subject-0-grade` com texto `-`.

---

## 8. Responsivo

| largura | regra |
|---|---|
| < 375 (`compact`, ex.: 360) | `inputValue` cai para 28. A ilustração escala para a largura − 2×`l`. Nomes longos de disciplina quebram em 2 linhas (`numberOfLines={2}`). O label do dropdown corta com reticências (é o maior caso: "18 de março, terça-feira"; cabe em 360). |
| 375–767 | o Figma como está |
| ≥ 768 (`tablet`) | coluna de conteúdo com `maxWidth` 600 centralizada. O formulário do login com `maxWidth` 318 + margens. A tab bar com largura toda, e os 2 itens em `flex: 1`. |
| altura < 700 | o login rola. O botão fica na base e acima do teclado. |

Orientação: retrato no celular. Tablet nas duas. Em paisagem, as mesmas
regras do tablet.

---

## 9. Critérios visuais para o qa (lado a lado com `docs/figma/screens/`)

1. Fundo preto puro em todas as telas, inclusive atrás da status bar e da
   navigation bar do Android.
2. Montserrat em todos os textos. Sem fonte do sistema escapando (atenção ao
   Android com peso: AGENDA/BOLETIM precisam sair em Bold de verdade).
3. Login: logo centralizado 306×49 sem serrilhado; CPF e SENHA centralizados;
   linhas de 318 no 414; o botão com a largura toda e colado na base, com o
   teal descendo até a borda da tela no iPhone com home indicator; o texto
   desabilitado cinza e o ativo preto; carregando só com spinner; o erro teal
   em 2 linhas centralizadas; o formulário treme uma vez no erro.
4. A máscara do CPF aparece enquanto digita, e o campo para em 14 caracteres.
5. Barra de ações: logo de 100×16 a 16 da esquerda; TROCAR PERFIL e SAIR a 16
   da direita e 24 entre si; com 1 aluno, só SAIR.
6. Header: "Olá, " regular + nome em negrito; nome do aluno em maiúsculas; info
   no formato `7EF - RM 12567 - Matutino`; distâncias da seção 2.2.
7. Agenda: o dropdown a 24 das bordas, chevron teal girando; a lista aberta
   sobreposta e sem marcar a selecionada; as aulas alinhadas em 40, bolinha
   vazada cinza-clara, horário 12 e disciplina 16 SemiBold, cerca de 59 entre
   aulas; domingo e sábado com ilustração + "Sem aulas neste dia".
8. Boletim: dropdown a 16 das bordas, "7EF - 2025"; 3 cards cinza de 90 com
   "1º TRIMESTRE" teal; disciplinas em maiúsculas 12, alinhadas a 28 da borda;
   Nota 9,5 / Faltas 0 no T1; `-` no T2/T3; "8,0" com a casa decimal.
9. Seleção: FECHAR ✕ teal no topo direito; título em 2 linhas; o aluno atual
   com borda teal de 1 px e o outro sem borda (sem pulo de 1 px entre eles).
10. Tab bar `surface` de 64 com ícone e rótulo teal na aba ativa.
11. Animações: toda tela tem entrada; a troca de dia faz fade + stagger; o
    acordeão abre com altura e chevron sincronizados; com "Reduzir movimento"
    ligado (iOS: Ajustes > Acessibilidade > Movimento; Android: Remover
    animações), nada se move e tudo continua funcionando.
12. M9: no Android release, abrir e fechar o T1 e trocar de dia 5 vezes
    seguidas sem engasgo visível (opcional: Perf Monitor do dev menu com
    UI/JS ≥ 55 fps).
13. Fonte do sistema no máximo: nenhum texto cortado na barra, no dropdown,
    nas abas ou no botão; saudação e disciplinas quebram linha sem sobrepor.
14. VoiceOver/TalkBack: a ordem da seção 6.4 e os rótulos da tabela de
    acessibilidade; o dropdown anuncia "expandido/recolhido"; o erro do login é
    anunciado.

---

## Mensagens

→ developer: o tema inteiro está na seção 1. Os únicos hexadecimais ficam em
`palette.ts`, e tamanhos e durações ficam em `theme.sizes` e `theme.motion`,
para nenhum componente ter número solto (restrição 9). Peso da fonte só por
`fontFamily`, nunca `fontWeight`. Maiúsculas por `textTransform` na variante,
com o dado em caixa normal.

→ developer: o dropdown abre num `Modal` transparente, posicionado por
`measureInWindow` (2.5). Não tente `zIndex` dentro da `ScrollView`. O
acordeão anima a altura medida com shared value e monta o corpo na 1ª abertura
(2.11, 4.6).

→ developer: datas da agenda. `"2025-03-17"` vira `new Date(2025, 2, 17)`
(local). O rótulo vem de util próprio, não de `Intl`. A nota é
`toFixed(1).replace('.', ',')` e `null` vira `-`. Os três utils precisam de
teste.

→ developer: ícones em `react-native-svg` com prop `color`, um componente por
ícone (os paths estão em `docs/figma/assets/*.svg`). Não mantenha as duas
versões ativo/inativo.

→ qa: critérios na seção 9. Compare com `docs/figma/screens/`. Tolerância de
±4 px em distância vertical, porque arredondei medidas inconsistentes do Figma
para a escala. As exceções intencionais estão nos itens 3 a 5 abaixo.

→ chief (usuário): 1. Os PNGs do logo (`logo-header.png` e `logo-login.png`)
são **o mesmo arquivo**, com 250×40 e só 1×. No login (306×49) e em telas 3×,
ele sai borrado. Peço exportar o logo do nó `4001:4` como **SVG** (o README
diz que é vetor), para usar em splash, login e barra com `react-native-svg`.
Pelo mesmo motivo, peço `no-classroom.png` em @2x e @3x. Sem isso, o
developer usa o PNG atual, e o qa vai ver serrilhado no M12.

→ chief (usuário): 2. O M1 do brief fala em botão "Entrar", mas o Figma diz
**"FAZER LOGIN"**. Especifiquei o do Figma (M12). Se o brief mandar, é só
trocar a string.

→ chief (usuário): 3. Para atender "alvo ≥ 44", as linhas das opções do
dropdown (36 → 44) e das disciplinas (37 → 44) ficaram mais altas que no Figma.
Se preferir o Figma exato, eu volto para 36/37 e registro o desvio de
acessibilidade.

→ chief (usuário): 4. A cor da linha do input vazio muda de `#525252` para
`#5C5C5C` (2,7 → 3,1 : 1, critério 1.4.11). O cinza do botão desabilitado
(`#777` sobre teal, 3,2 : 1) fica como está, porque controle inativo é isento
no WCAG e escurecer apagaria a diferença para o estado ativo.

→ chief (usuário): 5. Decisões minhas fora do Figma, que podem ser trocadas:
- a "contagem nas notas" do D11 virou fade, por custo de frame;
- o logout não tem confirmação;
- a barra de ações fica fixa e o resto da tela rola;
- o sem aluno reaproveita a ilustração do "sem aulas";
- o erro de rede é só texto + botão "TENTAR DE NOVO" com contorno teal (não há
  ilustração de erro no Figma).
