# 01 — Design: FIAP School v2 (UI moderna, foco em UX)

Designer · 2026-10-28 · requisitos: `00-brief.md` (V1–V11, N1–N8) e `00-pedido.md`.
Base: spec da v1 (`../2026-10-27-fiap-school/01-design.md`, citada como **v1 §x**)
e o código em `.claude/worktrees/v2/mobile/src`. Dados: `docs/data/responsaveis.json`.

Não há Figma para a v2: este documento **é** a direção visual. O frame de referência
continua sendo **414 × 736** (insets 20 em cima e 0 embaixo). Os cálculos de tela
pequena usam 320 × 568 e 375 × 667, e os de tela com home indicator usam 393 × 852
(inset de baixo 34).

Convenções (iguais às da v1):
- `spacing.m` é o token `m` (prop Restyle `padding="m"`).
- `sizes.*`, `motion.*`, `shadows.*` e `opacities.*` são chaves extras do tema, lidas
  com `useTheme()`.
- Os hexadecimais aparecem **só** na tabela da paleta (1.1), que vira `palette.ts`.
  Nenhum componente usa número solto.

**Decisões de design da v2** (todas trocáveis; ver Mensagens):

| # | Decisão | Por quê |
|---|---|---|
| DV1 | O fundo continua `#000000` puro. As camadas ficam nas superfícies (`#0B0B0B` / `#141414` / `#1E1E1E` / `#2A2A2A`). | Identidade, emenda sem costura com a splash nativa (preta) e OLED. |
| DV2 | Textos em caixa normal (sentence case). Maiúsculas só no `overline` (rótulos pequenos). | Leitura mais rápida, visual atual. O leitor de tela já lia o dado em caixa normal (v1 §1.6). |
| DV3 | Botão do login: **"Entrar"** (era "FAZER LOGIN"). | É o texto original do M1 e cabe no botão de pílula. |
| DV4 | A Agenda é um **pager horizontal** (uma página por dia) sincronizado com a faixa semanal. O swipe usa a rolagem nativa (`FlatList` horizontal paginada). | Atende o V4 sem gesture-handler e sem lib nova. O conteúdo acompanha o dedo, e o indicador da faixa segue a rolagem na UI thread. |
| DV5 | O Boletim mostra **um trimestre por vez** (segmento) e as disciplinas em cards abertos (sem acordeão). Abre no último trimestre avaliado. | V8 ("nada de acordeão"). O dado mais útil aparece com 0 toques. |
| DV6 | Faixas de nota: **≥ 7 "Bom"** (teal), **5–6,9 "Atenção"** (âmbar), **< 5 "Baixo"** (rosa claro). O rótulo aparece sempre, e há uma legenda no topo. | V8: a cor nunca é a única pista (WCAG 1.4.1). |
| DV7 | Sair tem **confirmação leve inline**: o botão vira "Cancelar / Sair" no mesmo lugar, sem modal. No NoStudent e no BootError, sair é imediato. | Sair é a única ação destrutiva da aba Perfil, e um toque sem querer custa um novo login. Inline mantém testID e não depende de `Alert` (Maestro sem texto). No NoStudent e no BootError, sair é a única saída, então não precisa de confirmação. |
| DV8 | Trocar de aluno no Perfil **não navega**: o destaque troca de linha, o chip do header atualiza e o leitor anuncia. | A pessoa pode conferir a troca. As abas já leem o aluno novo do store. |
| DV9 | Os estados vazio e de erro trocam a ilustração PNG (1×, borrada em 3×, v1 Mensagem 1) por um **ícone em SVG dentro de um círculo**. | Nítido em qualquer densidade e coerente com os ícones novos. |
| DV10 | Sem blur e sem gradiente nativo: a tab bar é sólida, com borda sutil. Um degradê em `react-native-svg` esmaece o conteúdo atrás dela. | V10: sem dependência nativa nova (`react-native-svg` já existe). |
| DV11 | As sombras e o brilho usam a prop `boxShadow` do RN (≥ 0.76, nova arquitetura, iOS e Android). `elevation` não é usada. | No preto, a sombra cinza da `elevation` não aparece. O brilho teal é o que dá profundidade, e há sempre uma borda como pista garantida (1.6). |

---

## 1. Tema v2 (`mobile/src/theme/`)

Arquivos: `palette.ts`, `theme.ts`, `components.ts` (Box, Text, Card, ButtonContainer),
`motion.ts`, `sizes.ts`, `fonts.ts` (igual), e dois novos, `shadows.ts` e `opacities.ts`.

### 1.1 Paleta (`palette.ts`: os únicos hexadecimais do app)

A paleta da v1 é **substituída** (as chaves `gray*` antigas mudam de valor e de nome).

| palette | valor | nota |
|---|---|---|
| `black` | `#000000` | igual à v1 |
| `white` | `#FFFFFF` | igual |
| `teal` | `#29F4D5` | igual (identidade) |
| `gray1000` | `#0B0B0B` | superfície afundada (campos, calha do timetable) |
| `gray950` | `#141414` | superfície 1 (cards) |
| `gray900` | `#1E1E1E` | superfície 2 (tab bar, blocos de aula, chips) |
| `gray850` | `#2A2A2A` | superfície 3 (indicador de segmento, trilho de barra, skeleton) |
| `gray800` | `#3A3A3A` | borda forte (decorativa) |
| `gray750` | `#262626` | borda sutil (decorativa) |
| `gray600` | `#6E6E6E` | borda de campo (≥ 3 : 1, ver 1.3) |
| `gray500` | `#808080` | texto desabilitado |
| `gray400` | `#8C8C8C` | texto terciário |
| `gray300` | `#B3B3B3` | texto secundário |
| `pink` | `#ED145B` | rosa do selo SCHOOL (só decorativo, 4,3 : 1 com branco) |
| `pinkLight` | `#FF5C8D` | rosa para texto, barra e borda de erro (AA em todas as superfícies) |
| `amber` | `#FFB547` | faixa "Atenção" |
| `tealMuted` | `#17332F` | teal a 14 % sobre `gray950`, pré-misturado |
| `pinkMuted` | `#37141F` | rosa a 16 % sobre `gray950` |
| `amberMuted` | `#352B1B` | âmbar a 14 % sobre `gray950` |
| `glowTeal` | `rgba(41, 244, 213, 0.35)` | brilho (boxShadow) |
| `shadowBlack` | `rgba(0, 0, 0, 0.6)` | sombra da tab bar |
| `shimmer` | `rgba(255, 255, 255, 0.07)` | faixa do shimmer |
| `backgroundClear` | `rgba(0, 0, 0, 0)` | ponta transparente do degradê da tab bar |

### 1.2 Cores semânticas (`theme.colors`)

| cor | palette | uso na v2 | v1 → v2 |
|---|---|---|---|
| `background` | `black` | fundo de toda tela, status bar, navigation bar | igual |
| `surfaceSunken` | `gray1000` | fundo dos campos de texto, calha de horas do timetable | nova |
| `surface` | `gray950` | cards (login, resumo, disciplina, perfil, banner) e o trilho do segmento | `#262626` → `#141414` |
| `surfaceRaised` | `gray900` | tab bar, blocos de aula, chips de dia, chip do aluno, linhas de aluno | `#4D4D4D` → `#1E1E1E` |
| `surfaceHigh` | `gray850` | indicador do segmento, trilho da barra de nota, skeleton, botão desabilitado | nova |
| `borderSubtle` | `gray750` | contorno de card, divisórias, linhas de hora | nova |
| `borderStrong` | `gray800` | contorno do indicador do segmento e da tab bar | nova |
| `borderInput` | `gray600` | contorno do campo de texto em repouso | substitui `inputLine` |
| `primary` | `teal` | ação principal, aba ativa, linha de agora, faixa "Bom", foco | igual |
| `primaryMuted` | `tealMuted` | fundo do indicador da tab bar, selo "Atual", avatar do aluno | nova |
| `accent` | `pink` | anel do avatar do responsável (decorativo) | nova (o rosa entra no tema) |
| `accentMuted` | `pinkMuted` | fundo do avatar do responsável, do banner de erro e do ícone de erro | nova |
| `danger` | `pinkLight` | texto e borda de erro, "Sair", faixa "Baixo" | nova |
| `warning` | `amber` | faixa "Atenção" | nova |
| `warningMuted` | `amberMuted` | fundo do selo "Atenção" | nova |
| `text` | `white` | texto principal | igual |
| `textSecondary` | `gray300` | texto de apoio, aba inativa | nova |
| `textTertiary` | `gray400` | rótulos de hora, legendas | nova |
| `textDisabled` | `gray500` | texto em botão desabilitado | `#777` → `#808080` |
| `textOnPrimary` | `black` | texto sobre teal, âmbar ou rosa claro | igual |
| `transparent` | `'transparent'` | bordas "desligadas" sem pulo de layout | igual |

As cores com alfa (`glowTeal`, `shadowBlack`, `shimmer`, `backgroundClear`) **não** entram
em `colors`: ficam em `shadows.ts` (1.6) e em `sizes`/componentes via import de `palette`
**só** dentro de `src/theme/` (o shimmer e o degradê leem `theme.gradients`, ver 1.6).

Faixas de nota (helper `gradeBand(grade: number | null)` em `utils/grades.ts`, com teste):

| faixa | regra | cor | fundo do selo | rótulo |
|---|---|---|---|---|
| `good` | `grade >= 7` | `primary` | `primaryMuted` | `Bom` |
| `warning` | `5 <= grade < 7` | `warning` | `warningMuted` | `Atenção` |
| `low` | `grade < 5` | `danger` | `accentMuted` | `Baixo` |
| `none` | `grade === null` | `textTertiary` | `surfaceHigh` | `Sem nota` |

A comparação usa o número da API, não o texto formatado (`6.95` é "Atenção").

### 1.3 Contraste (WCAG 2.2, calculado)

| par | razão | resultado |
|---|---|---|
| `text` sobre `background` / `surfaceRaised` | 21,0 / 16,7 | AAA |
| `textSecondary` sobre `background` / `surface` / `surfaceRaised` / `surfaceHigh` | 10,0 / 8,8 / 8,0 / 6,9 | AAA |
| `textTertiary` sobre `background` / `surface` / `surfaceRaised` | 6,3 / 5,5 / 5,0 | AA (texto pequeno) |
| `primary` sobre `surface` / `surfaceRaised` / `primaryMuted` | 13,2 / 11,9 / 9,7 | AAA |
| `textOnPrimary` sobre `primary` | 15,0 | AAA |
| `warning` sobre `surface` / `warningMuted` | 10,5 / 7,9 | AAA |
| `danger` sobre `surface` / `surfaceRaised` / `accentMuted` | 6,3 / 5,7 / 5,6 | AA |
| `textOnPrimary` sobre `danger` / `warning` | 7,2 / 12,0 | AAA |
| barra (`primary` / `warning` / `danger`) sobre o trilho `surfaceHigh` | 10,3 / 8,2 / 4,9 | ≥ 3 : 1 (1.4.11) |
| `borderInput` sobre `surface` (card) / `surfaceSunken` | 3,6 / 3,4 | ≥ 3 : 1 (1.4.11, contorno do campo) |
| `textDisabled` sobre `surfaceHigh` (botão desabilitado) | 3,6 | Controle inativo, isento no 1.4.3 (o mesmo critério da v1 §6.1) |
| aula passada (grupo a `opacities.past` 0,72 sobre `background`): `text` / `textSecondary` | 9,1 / 4,65 | AA. **Não baixe de 0,72**: com 0,6 o horário cai para 3,6. |
| `pink` (selo) com `white` | 4,3 | Reprova para texto pequeno: o `pink` **nunca** recebe texto. Para texto, use `danger`. |
| `borderSubtle` / `borderStrong` sobre o fundo | 1,4 / 1,9 | Decorativas. Nenhum componente depende só delas para ser achado (cards têm conteúdo; o campo usa `borderInput`). |

### 1.4 Espaçamento

A escala da v1 fica **igual** (`none 0, xs 4, s 8, sm 12, m 16, l 24, xl 28, xxl 32,
xxxl 40, huge 48, section 64, hero 80`) e ganha `xxs: 2` (entre a disciplina e o horário
dentro do bloco de aula). Os usos mudam por componente (seção 2).

### 1.5 Raios (`borderRadii`)

| token | valor | uso | v1 |
|---|---|---|---|
| `none` | 0 | | igual |
| `xs` | 6 | barras do skeleton e marca da hora agora | nova |
| `s` | 10 | blocos de aula, selos pequenos | nova |
| `m` | 14 | campo de texto, card de disciplina, banner, linhas do perfil | 8 → 14 |
| `l` | 20 | cards grandes (login, resumo, responsável) e chips de dia | nova |
| `xl` | 28 | card do login em tablet | nova |
| `pill` | 999 | botões, tab bar, segmentos, chip do aluno, avatar, ponto de "tem aula" | nova |
| `round` | 999 | alias de `pill`, para os componentes da v1 até a limpeza (fatia 9) | igual |

### 1.6 Sombras, brilho e degradês (`shadows.ts`, exportado em `theme.shadows`)

Todos são objetos `BoxShadowValue` do RN, aplicados por `style={{ boxShadow: [theme.shadows.x] }}`
(o Restyle não tem prop de sombra).

| token | valor | uso | pista garantida (se a sombra não renderizar) |
|---|---|---|---|
| `glowPrimary` | `{ offsetX: 0, offsetY: 0, blurRadius: 16, spreadDistance: 0, color: palette.glowTeal }` | aula "Agora", botão primário habilitado, campo focado, aluno atual | borda `primary` de 1 px |
| `glowPrimarySoft` | igual, com `blurRadius: 8` | linha de agora, indicador da tab bar | a própria cor `primary` |
| `floating` | `{ offsetX: 0, offsetY: 8, blurRadius: 24, spreadDistance: 0, color: palette.shadowBlack }` | tab bar | borda `borderStrong` de 1 px |

**Android:** `boxShadow` funciona na nova arquitetura (a única no RN 0.88) a partir
do Android 9. Abaixo disso, a pista é a borda. O qa confere no APK do CI. **Não use
`elevation`.**

Degradês (`theme.gradients`, consumidos por `react-native-svg` `LinearGradient`):
- `tabBarFade`: `[palette.backgroundClear, palette.black]`, de cima para baixo.
- `shimmer`: `[palette.backgroundClear, palette.shimmer, palette.backgroundClear]`, horizontal.
- `loginHalo`: teal com `stopOpacity` 0,10 no centro e 0 na borda (`RadialGradient`),
  decorativo atrás do logo do login.

### 1.7 Opacidades (`opacities.ts`, em `theme.opacities`)

| token | valor | uso |
|---|---|---|
| `past` | 0.72 | bloco de aula que já terminou (mínimo para AA, 1.3) |
| `pressed` | 0.6 | ações de texto pressionadas (ghost, "Hoje") |
| `busy` | 0.6 | campos do login durante o envio |
| `hidden` | 0 | |

### 1.8 Tipografia (`textVariants`)

Montserrat (os mesmos 4 arquivos). O peso vem **só** do `fontFamily`. Números de
horário, nota, faltas e média usam `fontVariant: ['tabular-nums']`, para os dígitos não
"dançarem" (a Montserrat tem `tnum`). No Android, o developer confere no CI se o
`fontVariant` pegou com a fonte embutida. Se não pegar, não há fallback a fazer: os
dígitos só ficam proporcionais.

| variante | família | size / lineHeight | cor padrão | extra | substitui (v1) |
|---|---|---|---|---|---|
| `display` | Bold | 40 / 44 | `text` | tabular | — |
| `headline` | Bold | `{compact: 24, phone: 28}` / `{compact: 30, phone: 34}` | `text` | título da aba | `sectionTitle`, `title` |
| `title` | SemiBold | 20 / 26 | `text` | | `greeting`, `emptyState` |
| `subtitle` | SemiBold | 17 / 22 | `text` | | `lessonSubject`, `termTitle` |
| `body` | Regular | 15 / 22 | `text` | | `body` |
| `bodyStrong` | SemiBold | 15 / 22 | `text` | | `bodyMedium`, `bodyBold` |
| `label` | Medium | 13 / 18 | `textSecondary` | | `caption` (ação), `detail` |
| `caption` | Medium | 12 / 16 | `textSecondary` | | `captionPlain` |
| `overline` | SemiBold | 11 / 14 | `textTertiary` | `textTransform: 'uppercase'`, `letterSpacing: 0.8` | `subject` |
| `tabLabel` | SemiBold | 11 / 14 | `textSecondary` | center | `tabLabel` (sem uppercase) |
| `button` | SemiBold | 16 / 20 | `textOnPrimary` | center | `button` (sem uppercase) |
| `buttonSmall` | SemiBold | 14 / 18 | `textOnPrimary` | center | — |
| `input` | Medium | 17 / 22 | `text` | | `inputValue` |
| `inputLabel` | Medium | 15 / 20 | `textSecondary` | rótulo em repouso; flutuando = `scale 0.8` (2.5) | `label`, `labelFocused` |
| `grade` | Bold | 24 / 28 | `text` | tabular, nota do card | — |
| `stat` | Bold | 20 / 26 | `text` | tabular, números do resumo | — |
| `time` | SemiBold | 11 / 14 | `textTertiary` | tabular, horas da grade e marca de agora | — |
| `dayNumber` | Bold | 18 / 22 | `text` | tabular, número do chip de dia | — |
| `error` | Medium | 13 / 18 | `danger` | erro inline de campo e banner | `error` |

**Fonte grande do sistema:** `allowFontScaling` fica ligado. Os elementos de altura fixa
(tab bar, chip de dia, segmento, botão, chip do aluno, campo de texto, selo "Agora")
usam `maxFontSizeMultiplier={sizes.fixedHeightFontScale}` (1,3, igual à v1). O
timetable cresce com a fonte (2.10). Os cards crescem sem limite.

### 1.9 Tamanhos (`theme.sizes`): novos e alterados

| chave | valor | uso |
|---|---|---|
| `touchTarget` | 44 | igual |
| `icon` | 24 | igual; ícones de UI em 20 (`iconSmall`) |
| `iconSmall` | 20 | ícone do campo, do botão e do chip |
| `iconStroke` | 1.9 | espessura do traço dos ícones novos (casa com o contorno de 1,91 do `AgendaIcon`) |
| `headerBar` | 56 | linha do logo + chip |
| `logoHeader` | `{ width: 80, height: 13 }` | era 100 × 16 (V7: "barra de logo menor") |
| `logoLogin` | `{ width: 306, height: 49 }` | igual: tamanho da **splash** (não muda) |
| `logoLoginV2` | `{ width: 245, height: 39 }` | logo no login (escala 0,8 do da splash) |
| `loginStackHeight` | 460 | altura de referência do bloco do login (logo + card + ajuda) para centralizar (3.2) |
| `formMaxWidth` | 400 | card do login (era 318, a largura da linha) |
| `contentMaxWidth` | 600 | igual |
| `studentChip` | `{ height: 40, avatar: 28, maxWidth: 200 }` | chip do header |
| `avatar` | `{ s: 28, m: 44, l: 56 }` | iniciais |
| `textField` | 60 | campo de texto |
| `pill` | `{ md: 56, sm: 44, xs: 32 }` | alturas do `PillButton` |
| `floatingTabBar` | `{ height: 64, maxWidth: 420, indicatorHeight: 48, indicatorInset: 6 }` | tab bar |
| `tabBarFade` | 96 | altura do degradê atrás da tab bar |
| `weekChip` | `{ height: 64, dot: 5, gap: 4 }` | faixa semanal |
| `segmented` | `{ md: 44, sm: 36, padding: 4 }` | segmentos |
| `timetable` | `{ hour: 80, hourCompact: 64, gutter: 48, minGap: 15, maxFontScale: 1.6, nowDot: 10, nowLine: 2, nowLabel: 20, autoScrollAnchor: 0.33 }` | grade (2.10) |
| `gradeBar` | `{ card: 6, summary: 8, tick: 1 }` | barra 0–10 e marca do 7 |
| `banner` | 48 | `NowBanner` e banner de erro do login (altura mínima) |
| `emptyIcon` | `{ circle: 64, glyph: 28 }` | ícone dos estados vazio e de erro |
| `skeleton` | `{ blockHeights: [60, 60, 60, 60], subjectCards: 4, shimmerWidth: 120 }` | |
| `fixedHeightFontScale` | 1.3 | igual |

As chaves da v1 que só servem a componentes que saem (`actionBar`, `dropdown`, `termCard`,
`studentCard`, `primaryButton`, `secondaryButton`, `tabBar`, `chevron`, `logoutIcon`,
`bullet`, `bulletSlot`, `illustration`, `skeletonLesson*`, `inputLine`,
`accordionOpenMaxHeight`) ficam até a fatia 9 e então saem. As da splash (`logoBadge`,
`logoBadgeBleed`, `scanLine`, `splashTrack`) ficam.

### 1.10 Movimento (`theme.motion`): adições e mudanças

O que já existe fica: `instant 100`, `fast 150`, `base 220`, `slow 320`, `stagger 40`,
`easeOut`, `easeIn`, `press`, `shake`, `shakeShort`, `tabIconPop` e o bloco `splash`.

| chave | valor | uso |
|---|---|---|
| `slower` | 450 | barras de nota enchendo, halo do login |
| `emphasized` | `Easing.bezier(0.2, 0, 0, 1)` | entradas de card, troca de trimestre e saída da splash para o login (já existe como `splash.exitToLoginEasing`: reaproveite) |
| `standard` | `Easing.bezier(0.4, 0, 0.2, 1)` | linha de agora andando |
| `spring.snappy` | `{ damping: 22, stiffness: 320, mass: 1 }` | indicadores (tab bar, segmento) |
| `spring.gentle` | `{ damping: 20, stiffness: 170, mass: 1 }` | tab bar entrando, card do login |
| `spring.pop` | `{ damping: 12, stiffness: 220, mass: 0.8 }` | selo "Agora", selo "Atual", ponto do rádio |
| `pressScale` | 0.97 | era 0.98: pílulas, cards e linhas |
| `pressScaleSmall` | 0.94 | chips de dia e chip do aluno |
| `enterOffset` / `enterOffsetSmall` | 12 / 8 | iguais |
| `enterOffsetCard` | 16 | card do login e tab bar |
| `slideOffset` | 16 | troca de trimestre ou de ano (direção) |
| `cardStagger` | 50 | era 60 |
| `stripStagger` | 20 | 7 chips em 120 ms |
| `maxStaggered` | 6 | igual |
| `shimmer` | `{ duration: 1200, reducedOpacity: 0.7 }` | substitui `skeleton` |
| `nowTick` | 60_000 | relógio da linha de agora |
| `nowPulse` | `{ duration: 2000, scaleTo: 2.2 }` | anel do ponto de agora |
| `popFrom` | 0.9 | escala inicial dos selos |
| `loginLogoScale` | `sizes.logoLoginV2.width / sizes.logoLogin.width` (0,8) | saída da splash |

**Regras (iguais às da v1 §1.8, reforçadas):**
1. Anime só `opacity` e `transform`. A cor muda por **crossfade de duas camadas**, nunca
   por `interpolateColor`. A borda de foco ou de erro é uma camada sobreposta com
   `opacity`.
2. Tudo em shared value, worklet ou layout animation. Nada de `setState` por frame. O
   relógio de agora atualiza um shared value a cada minuto (2.10).
3. O stagger tem teto de 6 itens.
4. **Reduzir movimento:** as layout animations usam `.reduceMotion(ReduceMotion.System)`.
   Os `withSpring`/`withTiming` manuais consultam `useReducedMotion()` e trocam por
   `set` direto (posição) ou por um `withTiming` de opacidade de `fast` 150, porque
   opacidade não é movimento. Os loops (shimmer, pulso do ponto) param. O pager troca
   de página com `animated: false`. O leitor de tela recebe os mesmos anúncios.

### 1.11 Variantes (`cardVariants` e `buttonVariants`)

`cardVariants` (todas com `borderWidth: 1`, para os estados trocarem só a cor da camada
sobreposta e não haver pulo de layout):

| variante | fundo | borda | raio | padding |
|---|---|---|---|---|
| `surface` | `surface` | `borderSubtle` | `l` | `l` |
| `surfaceCompact` | `surface` | `borderSubtle` | `m` | `m` |
| `raised` | `surfaceRaised` | `borderSubtle` | `m` | `sm` |
| `lesson` | `surfaceRaised` | `borderSubtle` | `s` | `paddingHorizontal: sm`, `paddingVertical: s` |
| `banner` | `surface` | `borderSubtle` | `m` | `paddingHorizontal: m` |
| `floating` | `surfaceRaised` | `borderStrong` | `pill` | — |

`buttonVariants` (o `PillButton`, 2.3): `primary` (fundo `primary`), `secondary`
(fundo `surfaceRaised`, borda `borderStrong`), `ghost` (sem fundo), `danger` (fundo
`danger`) e `disabled` (fundo `surfaceHigh`), todas com `borderRadius: 'pill'` e
conteúdo centralizado em linha.

### 1.12 O que muda e o que se reaproveita

| Reaproveita (sem mudança) | Muda | Sai (na fatia 9) |
|---|---|---|
| Fontes, `fonts.ts`, `createBox`/`createText`, `Card`/`ButtonContainer`; splash inteira (exceto a saída para o Login); `useShakeStyle`; `Screen` (ganha `edges` e `contentInsetBottom`); ícones `AgendaIcon`, `BoletimIcon`, `LogoutIcon`; utils `cpf`, `dates`, `grades`, `names`; todos os ViewModels (com campos novos); camada de dados, stores, logger | Paleta, cores, raios, tipografia, `TabBar` → `FloatingTabBar`, `Header` → `CompactHeader`, `PrimaryButton`/`SecondaryButton` → `PillButton`, `UnderlineInput`/`CpfInput` → `TextField`, `Skeleton` (pulso → shimmer), `EmptyState`/`ErrorState` (ícone no lugar da ilustração), navegação (aba Perfil, sem o modal) | `Dropdown`, `Accordion`, `TermAccordion`, `SubjectAccordion`, `LessonItem`, `StudentCard`, `ActionBar`, `SectionTitle`, `SelectStudentScreen` + o VM dela, `ChevronDownIcon`, `CloseIcon`, a PNG `no-classroom` (fica no repositório, sai do bundle) |

**Migração:** a fatia 1 troca os tokens **com os mesmos nomes** onde o sentido é o mesmo
(`background`, `primary`, `surface`, `text`, `body`, `button`, `caption`, `tabLabel`,
`round`). Nas fatias 1 a 8, a v1 pode ficar com o visual "misturado" na branch. Isso é
esperado, e cada fatia troca uma área inteira. Os nomes da v1 que não existem na v2 ficam
num bloco `// legado v1: sai na fatia 9` no `theme.ts`.

---

## 2. Componentes

Todos aceitam `testID` e derivam os ids dos filhos dele (padrão da v1 §7). Pressionáveis
usam `Pressable` com escala por shared value (`motion.press`, `pressScale`). O alvo
mínimo é 44 × 44 (`hitSlop` quando o desenho é menor).

### 2.1 Ícones (`components/icons/`, `react-native-svg`)

Um componente por ícone, props `{ color: string; size?: number }` (padrão
`sizes.iconSmall`), `viewBox="0 0 24 24"`, traço `strokeWidth={sizes.iconStroke}`,
`strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"` (salvo onde se diz o
contrário). Os desenhos são próprios (geometria simples), sem copiar set de ícones.

| ícone | uso | desenho (coordenadas no viewBox 24) |
|---|---|---|
| `ProfileIcon` | aba Perfil (24) | círculo `cx 12 cy 8 r 4`; ombros `M4.5 21c.7-3.9 3.7-6.5 7.5-6.5s6.8 2.6 7.5 6.5` |
| `AgendaIcon`, `BoletimIcon` | abas | **os da v1** (preenchidos) |
| `LockIcon` | campo Senha | `rect x 5 y 10.5 w 14 h 10 rx 2.5`; arco `M8 10.5V8a4 4 0 0 1 8 0v2.5` |
| `IdCardIcon` | campo CPF | `rect x 3 y 5 w 18 h 14 rx 2.5`; círculo `cx 9 cy 11 r 2`; `M6 16c.5-1.4 1.6-2.1 3-2.1s2.5.7 3 2.1`; `M14.5 10h4`; `M14.5 13.5h3` |
| `EyeIcon` / `EyeOffIcon` | mostrar/ocultar senha | olho `M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z` + círculo `r 3`; o "off" acrescenta `M4 4l16 16` |
| `AlertIcon` | erros | círculo `r 9`; `M12 7.5v5.5`; ponto `cx 12 cy 16.5 r 1` preenchido |
| `WifiOffIcon` | BootError | `M2 9a14.5 14.5 0 0 1 20 0`; `M5 12.5a10 10 0 0 1 14 0`; `M8.5 16a5 5 0 0 1 7 0`; ponto `cx 12 cy 19.5 r 1.2` preenchido; barra `M3.5 3.5l17 17` |
| `ClockIcon` | "Ainda não avaliado" | círculo `r 9`; `M12 7v5l3.5 2` |
| `CalendarOffIcon` | dia sem aulas | `rect x 3.5 y 5 w 17 h 15.5 rx 2.5`; `M3.5 9.5h17`; `M8 3v4`; `M16 3v4`; `M9.5 13.5l5 5`; `M14.5 13.5l-5 5` |
| `UsersIcon` | sem aluno | círculo `cx 9 cy 8 r 3.5`; `M2.5 20c.5-3.6 3.2-6 6.5-6s6 2.4 6.5 6`; `M16 4.8a3.5 3.5 0 0 1 0 6.4`; `M18 14.3c2 .8 3.2 2.9 3.5 5.7` |
| `RefreshIcon` | "Tentar de novo" | `M20 12a8 8 0 1 1-2.6-5.9`; `M20 4.5V9h-4.5` |
| `CheckIcon` | selo "Atual" | `M5 12.5l4.5 4.5L19 7.5` |
| `ChevronRightIcon` | chip do aluno | `M9.5 6l6 6-6 6` |
| `LogoutIcon` | Sair | **o da v1** |

### 2.2 `Avatar` (`components/Avatar.tsx`) + util `initials`

- Props: `firstName`, `lastName`, `size: 's' | 'm' | 'l'`, `tone: 'student' | 'guardian'`.
- Círculo `sizes.avatar[size]`, raio `pill`. O tom `student` usa fundo `primaryMuted` e
  texto `primary`. O tom `guardian` usa fundo `accentMuted`, texto `danger` e um anel
  `accent` de 1,5 (borda). É o rosa do selo aparecendo como identidade, só em decoração.
- Texto: `s` com `overline` (sem `letterSpacing`), `m` com `bodyStrong` e `l` com `title`.
- `initials(first, last)` em `utils/names.ts`, com teste: 1ª letra do primeiro nome + 1ª
  letra da **última** palavra do sobrenome, em maiúsculas, com acento preservado.
  "Rafael" + "da Silva" → `RS`, "Bianca" + "Silveira da Costa" → `BC`, "Gustavo" +
  "da Silva" → `GS`, sobrenome vazio → só a 1ª letra.
- `accessible={false}`: quem tem rótulo é o pai.

### 2.3 `PillButton` (substitui `PrimaryButton` e `SecondaryButton`)

```
┌────────────────────────────────────────┐  md 56 · sm 44 · xs 32, raio pill
│   [ícone 20]  Entrar                   │  gap s, paddingHorizontal l (sm: m, xs: sm)
└────────────────────────────────────────┘
```
- Props: `label`, `onPress`, `variant: 'primary' | 'secondary' | 'ghost' | 'danger'`,
  `size: 'md' | 'sm' | 'xs'` (padrão `md`), `icon?: (color) => ReactNode`,
  `iconPosition?: 'start' | 'end'`, `disabled`, `loading`, `fullWidth`, `testID`,
  `accessibilityLabel?`, `loadingAccessibilityLabel?`, `accessibilityHint?`.
- Variantes:

| variante | fundo | texto / ícone | extra |
|---|---|---|---|
| `primary` | `primary` | `textOnPrimary` | `shadows.glowPrimary` quando habilitado |
| `secondary` | `surfaceRaised` + borda `borderStrong` | `text` (ícone `primary`) | |
| `ghost` | nenhum | `primary` | pressionado: `opacity` `opacities.pressed` |
| `danger` | `danger` | `textOnPrimary` | |
| desabilitado (qualquer) | `surfaceHigh` | `textDisabled` | sem brilho, `accessibilityState.disabled` |

- Variante de texto: `button` (`md`) ou `buttonSmall` (`sm`, `xs`).
  `maxFontSizeMultiplier` 1,3.
- **Carregando:** o rótulo sai (`opacity` 1 → 0, `instant` 100) e um `ActivityIndicator`
  `size="small"` na cor do texto entra (`fast`). A largura não muda, porque o rótulo
  continua no layout com opacidade 0. O botão ignora toques e expõe
  `accessibilityState.busy` e o `loadingAccessibilityLabel`.
- `xs` e `sm` têm `hitSlop` até 44 de altura.
- testIDs: `X` e `X-loading` (spinner).

### 2.4 `FloatingTabBar` (`components/FloatingTabBar.tsx`, `tabBar` do bottom-tabs)

```
                 ← m →                                        ← m →
   ┌───────────────────────────────────────────────────────────────┐ 64, raio pill
   │ ╭─────────────╮                                               │ fundo surfaceRaised
   │ │  [📅]       │      [📄]                    [👤]             │ borda borderStrong
   │ │  Agenda     │      Boletim                 Perfil           │ sombra floating
   │ ╰─────────────╯                                               │
   └───────────────────────────────────────────────────────────────┘
     indicador: 48 de altura, inset 6, raio pill, primaryMuted + glowPrimarySoft
   ↕ bottom = max(insets.bottom − s, m)
```
- Posição: `position: 'absolute'`, `left/right: m` (em `compact`: `s`),
  `bottom: max(insets.bottom − spacing.s, spacing.m)`, `maxWidth:
  sizes.floatingTabBar.maxWidth`, centralizada (`alignSelf: 'center'`). No 414 × 736
  ela ocupa y 656–720. No 393 × 852 com home indicator, o fundo fica a 26 da borda.
- Atrás dela, um `Svg` absoluto na largura toda com `sizes.tabBarFade` de altura e
  `gradients.tabBarFade`, `pointerEvents="none"`. O conteúdo que rola por baixo esmaece
  em vez de ser cortado em seco.
- 3 itens `flex: 1`. Cada um tem a altura toda (64): ícone 24 em cima, `xxs` de gap e o
  `tabLabel` embaixo.
- **Indicador:** uma `Animated.View` absoluta com a largura de 1 item − 2 ×
  `indicatorInset` e altura `indicatorHeight`. O `translateX = índice × larguraDoItem` vai
  com `withSpring(spring.snappy)`. A largura do item vem do `onLayout` da barra.
- **Cor por proximidade:** cada item tem duas camadas (ícone e rótulo em
  `textSecondary` e em `primary`). A opacidade da camada ativa é
  `clamp(1 − |posIndicador − posItem| / larguraDoItem, 0, 1)`, num `useAnimatedStyle`
  que lê o mesmo shared value do indicador. A cor acompanha o indicador no meio do
  caminho, sem `setState`. O hook `useSlidingIndicator` (2.17) é o mesmo da faixa
  semanal e do segmento.
- O ícone que ficou ativo faz o pop da v1 (`1 → tabIconPop → 1`).
- `useFloatingTabBarInset()` devolve `sizes.floatingTabBar.height + bottom +
  spacing.m`, o padding de baixo de toda rolagem das abas (V6/N1). Use também em
  `scrollIndicatorInsets.bottom`.
- a11y: container `accessibilityRole="tablist"`, item `tab` com `{selected}` e o rótulo
  `Agenda`/`Boletim`/`Perfil`.
- testIDs: `tab-bar`, `tab-agenda`, `tab-boletim`, `tab-perfil` (via
  `tabBarButtonTestID`) e `tab-bar-indicator`.

### 2.5 `TextField` (substitui `UnderlineInput` e `CpfInput`)

```
repouso (vazio)                         focado / com valor
┌────────────────────────────────────┐  ┌────────────────────────────────────┐ 60, raio m
│ [🪪]  CPF                          │  │ [🪪]  CPF            ← overline-ish │ fundo surfaceSunken
│                                    │  │       969.294.560-04               │ borda borderInput
└────────────────────────────────────┘  └────────────────────────────────────┘ foco: camada primary + glow
 erro: camada danger + texto abaixo ↓
  ⓘ Confira o CPF digitado.               error, mt xs, gap xs com AlertIcon 16
```
- Props: `label`, `icon: (color) => ReactNode`, `value`, `onChangeText`, `onBlur`,
  `onFocus`, `error?: string`, `secureToggle?: boolean`, `mask?: 'cpf'`,
  `placeholderWhenFocused?`, `inputRef`, `editable`, `returnKeyType`,
  `onSubmitEditing`, `testID` e as props de `TextInput` repassadas (`textContentType`,
  `autoComplete`, `keyboardType`).
- Layout: linha com `paddingHorizontal: m` e o ícone 20 em `textSecondary`, à esquerda,
  com `sm` de gap. A coluna do texto tem `flex: 1`. O `TextInput` (variante `input`)
  fica embaixo, com `paddingTop: m + xs` e `paddingBottom: s`.
  `selectionColor`/`cursorColor` em `primary`.
- **Rótulo flutuante:** o `Text` `inputLabel` fica absoluto, centralizado na vertical em
  repouso. Com foco ou com valor, sobe para `translateY: −(m − xxs)` com `scale: 0.8` e
  `transformOrigin: 'left center'`. Usa `withTiming(base, easeOut)` (com reduzir
  movimento, só `set`). A cor do rótulo (`textSecondary` em repouso, `primary` com foco)
  é crossfade de duas camadas.
- **Camadas de borda:** a base tem `borderWidth: 1` em `borderInput`. Por cima, uma View
  absoluta do mesmo raio, com borda `primary` de 1,5 e `shadows.glowPrimary`, tem
  `opacity` 0 → 1 no foco (`fast`). Outra, em `danger`, tem `opacity` 1 quando há `error`.
  O erro vence o foco.
- **CPF** (`mask="cpf"`): `keyboardType="number-pad"`, `maxLength 14`,
  `textContentType="username"`, `autoComplete="username"`, máscara do util `cpf.mask` (a
  da v1). Com foco e vazio, aparece o placeholder `000.000.000-00` em `textTertiary`. A
  máscara aparece enquanto digita.
- **Senha** (`secureToggle`): um botão de ícone 44 × 44 à direita (`EyeIcon` quando
  oculta, `EyeOffIcon` quando visível, em `textSecondary`), com crossfade dos dois ícones
  (`fast`) e escala `0.85 → 1` no que entra. a11y: role `button`, rótulo `Mostrar senha`
  / `Ocultar senha`. Trocar o modo **não** tira o foco do campo. No iOS, ao voltar para
  oculto, o sistema apaga o campo no próximo caractere: é comportamento nativo do
  `secureTextEntry` e fica assim (registrado para o qa não abrir bug).
- Erro: `Text` `error` com `AlertIcon` 16 em `danger`, `marginTop: xs`, que entra com
  `FadeInDown(base)` de 8. O campo recebe `accessibilityHint` com o texto do erro.
- Desabilitado (envio): o container vai a `opacities.busy` (`fast`) e `editable={false}`.
- testIDs: `X` (o `TextInput`), `X-error` e `X-toggle` (só senha).
- `maxFontSizeMultiplier` 1,3 no rótulo e no valor (altura fixa de 60).

### 2.6 `CompactHeader` + `StudentChip` (substitui `Header` + `ActionBar`)

```
y 20 ┌──────────────────────────────────────────────────────────┐
     │ [FIAP SCHOOL 80×13]                 ╭──────────────────╮ │ headerBar 56, px m
     │                                     │(RS) Rafael · 7EF ›│ │ chip 40, raio pill
     │                                     ╰──────────────────╯ │
y 76 │ Olá, Gustavo                                             │ label (textSecondary), pt xs
     │ Agenda                                                   │ headline
y132 └──────────────────────────────────────────────────────────┘ hairline borderSubtle (opacidade por rolagem)
```
- Props: `title`, `titleTestID`, `guardianFirstName?`, `student?: { firstName, lastName,
  className, rm, period }`, `onPressStudent?`, `scrollY?: SharedValue<number>`,
  `showChip?: boolean`.
- O header é **fixo** nas 3 abas (o conteúdo rola embaixo dele). A divisória de 1 px
  `borderSubtle` embaixo tem `opacity = clamp(scrollY / spacing.m, 0, 1)` (UI thread),
  então só aparece quando há conteúdo por baixo.
- Logo: o PNG atual em `sizes.logoHeader`, `accessibilityRole="image"`, rótulo
  `FIAP School`.
- **StudentChip:** `Pressable` com altura 40 (`hitSlop` 2), raio `pill`, fundo
  `surfaceRaised`, borda `borderSubtle`, `paddingLeft: xs`, `paddingRight: s`, `gap: s`.
  Dentro: `Avatar s`, depois `"{primeiro nome} · {turma}"` (`bodyStrong` +
  `textSecondary` na turma, `numberOfLines={1}`, `maxWidth` do chip 200) e
  `ChevronRightIcon` 16 em `textTertiary`. Pressionado: `pressScaleSmall`. O toque leva à
  aba **Perfil** (`navigation.navigate('Perfil')`), mesmo com 1 aluno só (o Perfil é
  mais que troca).
- Na aba Perfil o chip não aparece (`showChip={false}`): a lista de alunos já está
  embaixo.
- Troca de aluno: o conteúdo do chip tem `key={student.id}`, com
  `exiting={FadeOut.duration(fast)}` e `entering={FadeIn.duration(base)}`.
- No NoStudent e no BootError: só a linha do logo, sem chip, e o título conforme a tela
  (3.6, 3.7).
- a11y: a saudação tem role `header` e rótulo `Olá, Gustavo`; o título, role `header`.
  O chip tem role `button`, rótulo `Aluno Rafael, turma 7EF, RM 12567, período Matutino`
  (a string da v1, que os flows já usam) e hint `Abre o perfil`.
- testIDs: `header`, `header-greeting`, `header-student-chip`, `header-student-name`
  (`Text` "Rafael"), `header-student-class` (`Text` "7EF") e o título com o id da tela
  (`agenda-title`, `boletim-title`, `profile-title`).

### 2.7 `WeekStrip` (faixa semanal)

```
 Março 2025                                         ╭ Hoje ╮   linha 32: subtitle + PillButton ghost xs
 ┌─────┐┌─────┐╭━━━━━╮┌─────┐┌─────┐┌─────┐┌─────┐
 │ DOM ││ SEG │┃ TER ┃│ QUA ││ QUI ││ SEX ││ SÁB │   overline
 │ 16  ││ 17  │┃ 18  ┃│ 19  ││ 20  ││ 21  ││ 22  │   dayNumber
 │     ││  •  │┃  •  ┃│  •  ││  •  ││  •  ││     │   ponto 5 = "tem aula"
 └─────┘└─────┘╰━━━━━╯└─────┘└─────┘└─────┘└─────┘   64 de altura, raio l, gap 4
                 ↑ indicador teal (fundo primary) desliza; texto do chip sob ele = textOnPrimary
```
- Props: `days: { date, weekdayShort, dayNumber, hasLessons, isToday, accessibilityLabel
  }[]`, `selectedIndex`, `progress: SharedValue<number>` (posição do pager em páginas,
  2.9), `onSelect(index)`, `monthLabel`, `showTodayButton`, `onPressToday`, `testID`.
- Chips: `flex: 1`, gap `weekChip.gap`, altura 64, raio `l`, fundo `surfaceRaised`, borda
  `borderSubtle`. Dentro, centralizados: o `overline` (`DOM`…`SÁB`), depois o
  `dayNumber`, depois um slot de 5 para o ponto, com `xs` entre eles.
- **Ponto "tem aula":** círculo 5 em `primary`. No chip selecionado, a camada de cima
  tem o ponto em `textOnPrimary`. Sem aulas, o slot fica vazio (sem pulo de layout).
- **Dia de hoje** (o da regra D35): quando **não** está selecionado, tem a borda em
  `primary` em vez de `borderSubtle` e o `overline` em `primary`. É a pista de "hoje" na
  semana do JSON.
- **Indicador:** View absoluta com a largura de 1 chip, fundo `primary`, raio `l` e
  `shadows.glowPrimarySoft`. O `translateX = progress × (larguraDoChip + gap)` é lido do
  shared value do pager, então acompanha o dedo durante o swipe. Nada de spring próprio:
  quem anima é a rolagem nativa. Antes do 1º layout, fica em `selectedIndex`.
- Cor por proximidade (como em 2.4): cada chip tem a camada normal (`text` /
  `textSecondary`) e a camada "sobre teal" (`textOnPrimary`). A opacidade vem da
  distância do indicador.
- Tocar num chip chama `onSelect(i)`. A tela rola o pager (2.9), com escala
  `pressScaleSmall` no toque.
- **"Hoje":** `PillButton ghost xs` com o rótulo `Hoje`, que só aparece quando o dia
  selecionado não é o de hoje. Entra com `FadeIn` + `scale 0.9 → 1` (`fast`) e sai com
  `FadeOut(fast)`. Leva ao dia de hoje.
- Larguras: no 414, (414 − 32 − 24) / 7 = **51,1**; no 375, 45,6; no 320 (`compact`,
  `paddingHorizontal: s`), (320 − 16 − 24) / 7 = **40**. Nesse caso a altura de 64 mantém
  a área ≥ 40 × 64, acima do mínimo WCAG de 24 (2.5.8). Registrado em 6.3.
- a11y: container `tablist`, chip com role `tab`, `{selected}` e rótulo
  `Segunda-feira, 17 de março, 6 aulas` (com `, hoje` no fim quando for o dia de hoje;
  `sem aulas` quando vazio). O mês tem role `header`.
- testIDs: `agenda-week-strip`, `agenda-day-<data ISO>` (ex.: `agenda-day-2025-03-17`),
  `agenda-month-label` e `agenda-today-button`.

### 2.8 `NowBanner` (linha de status do dia, em cima da grade)

`cardVariants.banner`, `minHeight: sizes.banner`, linha com `gap: s`, à esquerda um ponto
ou ícone de 8 e o texto em `bodyStrong` (com o trecho de apoio em `textSecondary`):

| situação | marcador | texto |
|---|---|---|
| hoje, durante uma aula | ponto `primary` pulsando (anel, `nowPulse`) | `Agora: Ciências` + ` · até 10:45` |
| hoje, no intervalo entre aulas | ponto `warning` | `Intervalo` + ` · próxima aula às 09:15` |
| hoje, antes da 1ª aula | `ClockIcon` 16 `textSecondary` | `Próxima aula às 07:15` |
| hoje, depois da última | `CheckIcon` 16 `textSecondary` | `Aulas encerradas` |
| outro dia, com aulas | nenhum | `6 aulas` + ` · das 07:15 às 12:15` (`1 aula` no singular) |
| dia sem aulas | o banner não aparece (vem o estado vazio) | |

- O texto muda só quando a fase muda (2.10). A troca é um crossfade (`key` = texto,
  `FadeIn(base)` / `FadeOut(fast)`).
- a11y: `accessibilityLiveRegion="polite"` (Android) e, no iOS,
  `announceForAccessibility` quando a fase muda **e** a página de hoje está visível.
- testID: `agenda-page-<data>-banner`.

### 2.9 Pager de dias (dentro da `LessonsScreen`)

- `Animated.FlatList` horizontal, com `pagingEnabled`, uma página por dia da agenda
  (`data = days`), `getItemLayout` com a largura da coluna de conteúdo (medida por
  `onLayout`), `initialScrollIndex = selectedIndex`, `windowSize={3}`,
  `showsHorizontalScrollIndicator={false}`, `decelerationRate="fast"` e
  `keyExtractor = date`. Os itens são memoizados por `date + lessons + isToday`.
- `useAnimatedScrollHandler` escreve `progress = contentOffset.x / largura` (UI thread),
  lido pela `WeekStrip`.
- Swipe terminado: no `onMomentumScrollEnd`, `onSelectDay(days[round(x / largura)].date)`
  e o anúncio do dia (6.4).
- Toque no chip ou no "Hoje": `onSelectDay` primeiro (o estado já fica certo) e depois
  `scrollToIndex({ index, animated: !reducedMotion })`.
- Trocar de aluno remonta o pager (`key={studentId}`) no dia de hoje, com a entrada de
  4.4.
- Cada página é uma `ScrollView` vertical com `RefreshControl` (2.15) e
  `contentContainerStyle` com `paddingHorizontal: m`, `paddingTop: m` e `paddingBottom:
  useFloatingTabBarInset()`. Dentro: `NowBanner` → `m` → `Timetable`, ou o estado vazio.
- testIDs: `agenda-pager`, `agenda-page-<data>`.

### 2.10 `Timetable` + `NowLine`

```
        ┌ gutter 48 ┐┌──────────────── blocos (largura − 48 − m) ────────────────┐
 07:00  ─────────────┼─────────────────────────────────────────────────────────────  linha de hora 1 px borderSubtle
                     │ ┌─────────────────────────────────────────────────────────┐
                     │ │ Matemática I                                            │ 07:15–08:00 → 60 pt
 08:00  ─────────────┼─│ 07:15 – 08:00 · 45 min                                  │
                     │ └─────────────────────────────────────────────────────────┘
                     │ ┌─────────────────────────────────────────────────────────┐ (passada: opacity 0,72)
                     │ │ Língua Inglesa                                          │
                     │ │ 08:00 – 08:45 · 45 min                                  │
 09:00  ─────────────┼─└─────────────────────────────────────────────────────────┘
                     │              Intervalo · 30 min                            caption textTertiary, centro do vão
 ╭10:23╮●━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  NowLine: ponto 10 + linha 2 primary + glow
                     │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                     │ ┃ Ciências                                       ╭AGORA╮ ┃ aula atual: camada primary + glow
                     │ ┃ 10:00 – 10:45 · 45 min                         ╰─────╯ ┃ selo: pill 20, primary, overline textOnPrimary
 11:00  ─────────────┼─┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```
- Props: `date`, `lessons: { startMinutes, endMinutes, startTime, endTime, subject }[]`
  (minutos do dia, calculados no VM), `isToday`, `clock: { minutes: SharedValue<number>;
  phase: Phase }` (só na página de hoje), `testID`.
- **Escala:** `pxPorMinuto = horaPx / 60`, com `horaPx = (altura da janela < 700 ?
  timetable.hourCompact : timetable.hour) × clamp(fontScale, 1,
  timetable.maxFontScale)`. Assim a grade cresce com a fonte grande e a duração continua
  proporcional (N3).
- **Faixa:** `inicio = floor(primeiro início, hora cheia)` e `fim = ceil(último fim, hora
  cheia)`, o que dá 07:00–13:00 (Rafael e Joana) e 13:00–19:00 (Bianca, à tarde). A
  altura é `(fim − início) × pxPorMinuto`: 480 no frame de referência.
- **Linhas de hora:** 1 px `borderSubtle` a cada hora cheia, da calha até a borda. O
  rótulo `HH:00` (`time`, `textTertiary`) fica alinhado à direita na calha
  (`paddingRight: s`), centralizado na linha (`translateY: −7`). Escondido do leitor.
- **Bloco** (`cardVariants.lesson`): `top = (início − faixa) × px + 1`, `height = duração
  × px − 2` (2 de respiro entre aulas coladas), `left = gutter`, `right = 0`. Dentro: a
  disciplina em `subtitle` com `numberOfLines={1}`, depois `xxs`, depois
  `"{início} – {fim} · {n} min"` (`caption`, tabular). Com a altura da janela < 700,
  `paddingVertical: xs`. Se o bloco tiver menos de 40 pt (aula curta), só a disciplina
  aparece, e o horário fica no rótulo de acessibilidade.
- **Estados do bloco** (só na página de hoje; nos outros dias, todos "normais"):

| estado | visual | animação ao entrar no estado |
|---|---|---|
| normal / próxima | `lesson` | — |
| **agora** | camada absoluta com borda `primary` de 1,5 + `shadows.glowPrimary` e o selo `Agora` no canto superior direito (pill 20, fundo `primary`, `overline` em `textOnPrimary`, `paddingHorizontal: s`) | camada `opacity 0 → 1` (`base`); selo `scale popFrom → 1` com `spring.pop` + `FadeIn` |
| passada | o bloco inteiro com `opacity: opacities.past` | `withTiming(past, slow)` |

- **Intervalo:** um vão ≥ `timetable.minGap` (15 min) entre duas aulas mostra
  `Intervalo · 30 min` (`caption`, `textTertiary`), centralizado no vão. Se o vão tiver
  menos de 20 pt, nada aparece. O seed tem 08:45–09:15.
- **NowLine** (só se `isToday` e `início ≤ agora ≤ fim`; fora disso some, e o
  `NowBanner` dá o texto):
  - Uma `Animated.View` absoluta com a largura toda e `translateY = (agora − início) ×
    px`. Contém o ponto (10, `primary`, raio `pill`, centrado na borda da calha) com um
    anel de pulso (`scale 1 → nowPulse.scaleTo` e `opacity 0.6 → 0` em loop,
    `nowPulse.duration`), a linha de 2 px `primary` com `shadows.glowPrimarySoft` da
    calha até a borda e, na calha, a marca da hora (pill 20, fundo `primary`, `time` em
    `textOnPrimary`, `HH:MM`).
  - Fica **acima** dos blocos (`zIndex`), com `pointerEvents="none"`.
  - Os rótulos de hora a menos de 14 pt da linha têm `opacity → 0` (`fast`), num
    `useAnimatedStyle` por rótulo que lê o mesmo shared value, para não ficarem embaixo
    da marca.
- **Relógio** (`useMinuteClock(now = () => new Date())`, hook novo e testável com fake
  timers):
  - Um `setTimeout` até a próxima virada de minuto e depois um `setInterval(nowTick)`.
    Também recalcula no `AppState` `active` (volta do background).
  - Escreve `minutes` (shared value) com `withTiming(novo, { duration: slow, easing:
    standard })`, ou `set` com reduzir movimento.
  - Calcula a **fase** (`{ kind: 'before' | 'lesson' | 'break' | 'after', index }`) e só
    faz `setState` quando ela muda (no máximo poucas vezes por dia).
  - A marca `HH:MM` é um componente pequeno com estado próprio de 1 linha (re-renderiza
    a cada minuto **sozinho**; a lista e os blocos não).
  - Resultado: a lista não re-renderiza a cada minuto (V5).
- **Rolagem automática:** na 1ª exibição da página de hoje, se a linha estiver fora da
  área visível, a `ScrollView` rola até `y = posição da linha − altura visível ×
  autoScrollAnchor`, com `animated: !reducedMotion`, depois da entrada (4.4). Só uma
  vez por montagem.
- a11y: cada bloco é um elemento com role `text` e rótulo `Das 07:15 às 08:00,
  Matemática I`, mais `, agora` ou `, encerrada` no fim. Linhas, rótulos de hora, linha
  de agora e intervalo ficam escondidos (`importantForAccessibility="no-hide-descendants"`
  no fundo da grade). A ordem é a das aulas.
- testIDs: `agenda-page-<data>-timetable`, `agenda-page-<data>-lesson-<i>` (com
  `-subject` e `-time` nos `Text`), `agenda-page-<data>-lesson-<i>-now-badge`,
  `agenda-page-<data>-now-line`.

### 2.11 `SegmentedControl`

```
md 44:  ┌────────────────────────────────────────────────────────┐  fundo surface, borda borderSubtle, raio pill, padding 4
        │ ╭────────────────╮                                      │
        │ │   1º tri       │     2º tri            3º tri         │  label 13: ativo text, inativo textSecondary
        │ ╰────────────────╯                                      │  indicador surfaceHigh + borda borderStrong, raio pill
        └────────────────────────────────────────────────────────┘
sm 36:  ( 2025 · 7EF )( 2024 · 6EF )                                 ano
```
- Props: `options: { key, label, accessibilityLabel }[]`, `selectedKey`,
  `onChange(key)`, `size: 'md' | 'sm'`, `testID`.
- Indicador com `useSlidingIndicator` + `spring.snappy` e cor do texto por proximidade
  (2.4). Texto em `label` (`md`) ou `caption` (`sm`), `maxFontSizeMultiplier` 1,3.
- **1 opção só** (Joana, Bianca: só 2025): vira uma pílula estática do mesmo tamanho
  (fundo `surface`, texto `textSecondary`, prefixo `Ano letivo `). Não tem indicador nem
  toque, tem role `text` e o mesmo id do item (`X-<key>`), para o flow ler o texto.
- `sm`: `hitSlop` vertical 4, o que dá 44.
- a11y: container `tablist`; item `tab` com `{selected}`.
- testIDs: `X` e `X-<key>`.

### 2.12 `GradeBar` (barra 0–10)

- Trilho `surfaceHigh`, raio `pill`, altura `gradeBar.card` (6) ou `gradeBar.summary`
  (8), largura toda.
- Preenchimento: View absoluta com a largura toda, na cor da faixa, com
  `transform: [{ scaleX: nota / 10 }]` e `transformOrigin: 'left center'`. Na montagem,
  anima de `scaleX 0` até o valor (`slower` 450, `emphasized`), com atraso igual ao
  stagger do card + `fast`. Com reduzir movimento, já nasce no valor.
- Marca do 7: 1 × (altura + 4) em `textTertiary`, em `left: 70%`, por cima. A legenda
  (2.13) explica.
- `null`: só o trilho.
- `accessible={false}` (o card tem o rótulo completo).

### 2.13 `TermSummaryCard` + `GradeLegend`

```
┌ cardVariants.surface ──────────────────────────────────────┐
│ 1º TRIMESTRE · 2025                          ╭● Bom╮        │ overline + selo da faixa (pill 24)
│ 8,2                                                          │ display (cor text), mt s
│ Média geral                                                  │ caption
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓┆▓▓▓▓▓▓░░░░░░░    │ GradeBar summary, mt sm
│ ─────────────────────────────────────────────────────────── │ hairline borderSubtle, my m
│ 14              12               1                           │ stat
│ faltas          disciplinas      abaixo de 7                 │ caption; 3 colunas flex 1
└──────────────────────────────────────────────────────────────┘
  ● 7 ou mais   ● 5 a 6,9   ● abaixo de 5                         GradeLegend: caption, pontos 8 nas 3 cores, mt sm
```
- Props: `term`, `year`, `average: number | null`, `absences: number`, `subjects: number`,
  `belowTarget: number`, `partial: boolean`, `testID`.
- Média: a média simples das notas não nulas, formatada com `formatGrade` (`8,2`). O
  total de faltas soma as não nulas. "Abaixo de 7" conta as notas < 7.
- `partial` (algumas notas nulas): a legenda da média vira `Média de 10 disciplinas
  avaliadas`.
- O selo da faixa (`GradeChip`, também usado em 2.14) é uma pill de 24 de altura com
  `paddingHorizontal: s`, fundo `*Muted` da faixa, ponto 6 e `caption` na cor da faixa.
- a11y: um elemento só, com o rótulo `1º trimestre de 2025. Média 8,2, Bom. 14 faltas em
  12 disciplinas. 1 abaixo de 7.` A legenda tem role `text`, com o rótulo `Faixas de nota:
  7 ou mais, bom; 5 a 6,9, atenção; abaixo de 5, baixo.`
- testIDs: `boletim-summary`, `boletim-summary-average`, `boletim-summary-absences`,
  `boletim-legend`.

### 2.14 `SubjectGradeCard`

```
┌ cardVariants.surfaceCompact ─────────────────────────────────┐
│ Língua Portuguesa                                       9,5  │ subtitle (2 linhas, flex 1) | grade na cor da faixa
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓┆▓▓▓▓▓▓▓▓▓▓░░   │ GradeBar card, mt s
│ ╭● Bom╮                                            0 faltas  │ GradeChip | caption textSecondary, mt s
└──────────────────────────────────────────────────────────────┘  gap entre cards: s
```
- Props: `name`, `grade: number | null`, `gradeText`, `absences: number | null`, `index`,
  `enterDelay`, `testID`.
- Faltas: `0 faltas`, `1 falta`, `4 faltas`. `null` → `Faltas não lançadas`.
- **Sem nota** (dentro de um trimestre parcialmente avaliado): a nota vira `–` em
  `textTertiary`, só o trilho aparece, e o selo fica `Sem nota` (faixa `none`).
- Não é pressionável (não há detalhe a abrir): sem escala, sem role `button`.
- a11y: um elemento com role `text` e o rótulo `Língua Portuguesa. Nota 9,5, Bom. 0
  faltas.` (sem nota: `Língua Portuguesa. Nota e faltas ainda não lançadas.`).
- testIDs: `boletim-term-<t>-subject-<i>` (o card, que carrega o rótulo) e, nos `Text`,
  `-grade`, `-band` e `-absences`.

### 2.15 Pull-to-refresh (`RefreshControl`, nativo)

- Na Agenda (cada página), no Boletim e no Perfil. Props: `tintColor` em `primary` (iOS),
  `colors={[primary]}` e `progressBackgroundColor` em `surfaceRaised` (Android),
  `progressViewOffset` = altura do header no Android.
- `refreshing` só fica `true` quando o **usuário** puxou: o VM expõe `refreshing` e
  `onRefresh`, com `refetch` das queries da tela (Agenda: a agenda; Boletim: os anos e o
  ano atual; Perfil: o `/me`). Refetch em segundo plano não mostra o spinner.
- Sem cascata de entrada depois do refresh: o conteúdo atualiza no lugar.
- Erro no refresh com dados em tela: os dados ficam e aparece um aviso inline no topo do
  conteúdo (banner `accentMuted` com `AlertIcon`, `Não foi possível atualizar. Puxe para
  tentar de novo.`, que some no próximo refresh bem-sucedido). testID `X-refresh-error`.

### 2.16 `Skeleton` com shimmer, `EmptyState`, `ErrorState`

**Skeleton:**
- O primitivo recebe `width`, `height` e `radius` (`xs`, `s`, `m`, `l` ou `pill`), com
  fundo `surfaceHigh` e `overflow: hidden`.
- **Shimmer:** dentro de cada bloco, uma faixa de `sizes.skeleton.shimmerWidth` com
  `gradients.shimmer` (svg). Ela faz `translateX` de `−faixa` a `largura do bloco`,
  lendo **um** shared value `progress` 0 → 1 por tela (`withRepeat(withTiming(1, {
  duration: shimmer.duration, easing: Easing.linear }), −1)`).
- Com reduzir movimento, a faixa não aparece e o bloco fica com `opacity` 0,7, parado.
  O loop é cancelado ao desmontar.
- `AgendaSkeleton`: 7 chips de 64 com raio `l` e gap 4, o banner (48, raio `m`) e 4 blocos
  de 60 com raio `s` empilhados a partir de y = 1 hora. Fica embaixo do header real (o
  header não tem skeleton).
- `BoletimSkeleton`: o segmento `sm` (36, largura 60 %), o segmento `md` (44), o card de
  resumo (240, raio `l`) e 4 cards de 98 com raio `m`.
- a11y igual à v1: role `progressbar` com o rótulo `Carregando agenda…` /
  `Carregando boletim…` e os filhos escondidos.
- testIDs: `agenda-skeleton` e `boletim-skeleton`.

**EmptyState** (substitui a ilustração):
```
            ╭──────╮
            │ [ic] │       círculo emptyIcon 64, fundo surfaceRaised, ícone 28 textSecondary
            ╰──────╯
               ↕ m
       Sem aulas neste dia          title, center
               ↕ s
     Aproveite o fim de semana.     body textSecondary, center, px l
               ↕ l
          [ação opcional]           PillButton
```
- Props: `icon`, `title`, `description?`, `action?`, `tone?: 'neutral' | 'danger'`,
  `testID`. Com `tone="danger"`, o círculo fica em `accentMuted` e o ícone em `danger`.
  Centralizado em `paddingVertical: xxxl`.

**ErrorState** = `EmptyState tone="danger"` com o `AlertIcon` (ou o `WifiOffIcon` no
BootError) e a ação `PillButton secondary sm` `Tentar de novo`, com `RefreshIcon` em
`primary`.
- Props: os da v1 (`title`, `description`, `onRetry`, `retrying`, `testID`,
  `retryTestID`, `shakeKey`).
- Tentar de novo e falhar de novo: shake curto no bloco (`shakeShort`, igual à v1).

### 2.17 Hook `useSlidingIndicator` (`hooks/`)

Fonte única do indicador da tab bar, do segmento e da faixa (esta com o `progress`
externo do pager):
- Entrada: `count`, `index` (ou `progress` externo), `itemWidth` (do `onLayout`) e `gap`.
- Saída: `indicatorStyle` (`translateX`, que com spring `snappy` no modo `index` e direto
  no modo `progress`) e `activeLayerStyle(i)`, que dá a opacidade por proximidade (2.4).
- Com reduzir movimento, `set` direto no modo `index`.
- Teste com o `recordingAnimations` que já existe em `src/test/`.

---

## 3. Telas e fluxos

### 3.0 Navegação

```
RootStack (native-stack, headerShown false, animation 'fade', fundo background)
├─ Splash                         (igual; sai da lista após o reset)
├─ Login                          (sem sessão)
├─ App = AppTabs (bottom-tabs, tabBar = FloatingTabBar, animation 'shift' | 'fade' com reduzir movimento)
│   ├─ Agenda   → LessonsScreen
│   ├─ Boletim  → ReportCardScreen
│   └─ Perfil   → ProfileScreen          ← NOVA
├─ NoStudent                      (sessão sem aluno)
└─ BootError                      (falha do /me na abertura)
   SelectStudent                  ← SAI (o modal some; a troca fica no Perfil)
```
- `AppTabsParamList` ganha `Perfil: undefined`. `RootStackParamList` perde
  `SelectStudent`.
- O chip do header chama `navigation.navigate('Perfil')` (o header vive dentro das
  abas). O voltar do Android numa aba que não é a Agenda volta para a Agenda (padrão do
  bottom-tabs com `backBehavior="firstRoute"`).
- O logout no Perfil fecha a sessão. O RootStack troca para o Login sozinho (igual à
  v1).
- `animation: 'shift'` do bottom-tabs v7 é o "fade com slide sutil" do V10. Com reduzir
  movimento, troque para `'fade'`, porque opacidade não é movimento.

### 3.1 Splash (mantida)

Tudo igual à v1 §3.1 (timeline, loop, reduzir movimento, testIDs). Muda **só a saída para
o Login**:
- Destino: o centro do logo no Login, com `centroY = insets.top + loginLogoTop + 39 / 2`
  (o `loginLogoTop` vem do util de 3.2, compartilhado pelas duas telas).
- Animação: `translateY = centroY − alturaDaJanela / 2` **e** `scale 1 → loginLogoScale`
  (0,8), juntos, em `slow` 320, `emphasized`. Os dois são transform, no mesmo grupo.
- No fim, o `reset` para o Login com `fromSplash: true` e `animation: 'none'`. O Login
  desenha o logo de 245 × 39 exatamente ali, sem animação no logo, e anima o resto (4.2).
- Com reduzir movimento, fica igual à v1 (o grupo some em 150 e o Login entra com fade).
- A saída para App, NoStudent e BootError não muda. A entrada do App é a de 4.3.

### 3.2 Login

Referência visual: nenhuma (a v1 é `docs/figma/screens/01-login.png`). Rota `Login`,
arquivo `features/auth/LoginScreen.tsx`.

```
414 × 736                                       y
┌──────────────────────────────────────────────┐ 0
│ status                                       │ 20
│                                              │
│          ·  halo teal (svg radial, 0,10)  ·   │
│            [ FIAP  SCHOOL  245×39 ]          │ 20 + loginLogoTop (= 128) → 148–187
│                    ↕ xxxl                    │
│ ┌──────────────────────────────────────────┐ │ 227  card surface, raio l (tablet xl), p l, mx m
│ │ Bem-vindo                                │ │      title
│ │ Acompanhe as aulas e o boletim do seu    │ │      body textSecondary, mt xs
│ │ filho.                                   │ │
│ │               ↕ l                        │ │
│ │ ┌──────────────────────────────────────┐ │ │      TextField CPF (60)
│ │ │ [🪪] CPF                              │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ │               ↕ sm                       │ │
│ │ ┌──────────────────────────────────────┐ │ │      TextField Senha (60) + olho 44
│ │ │ [🔒] Senha                       [👁] │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ │  ↕ sm  [ⓘ Usuário ou senha inválida.  ]  │ │      banner de erro (só em erro)
│ │               ↕ l                        │ │
│ │ (           Entrar                     ) │ │      PillButton primary md, largura toda
│ └──────────────────────────────────────────┘ │ ≈ 595
│                    ↕ l                       │
│  Problemas para entrar? Fale com a secretaria│ caption textTertiary, center
│  da FIAP School.                             │ ≈ 651
└──────────────────────────────────────────────┘ 736
```
- **Posição do logo** (`utils/loginLayout.ts`, com teste, usado pelo Login e pela
  Splash): `loginLogoTop = max(spacing.section, (alturaDaJanela − insets.top −
  insets.bottom − sizes.loginStackHeight) / 2)`. No 414 × 736 dá 128. No 375 × 667, 93.
  No 320 × 568, 64. O logo não depende da fonte nem do teclado, e por isso a emenda com a
  splash fica exata.
- **Halo:** um `Svg` absoluto de 360 × 360 centrado no logo, com `gradients.loginHalo`,
  decorativo (`pointerEvents="none"`, escondido do leitor).
- Card: `cardVariants.surface`, `maxWidth: sizes.formMaxWidth` (400), centralizado. No
  `tablet`, raio `xl` e padding `xxl`.
- O botão fica **dentro do card**, logo abaixo dos campos (não mais colado na base):
  campo e ação ficam juntos, e o polegar alcança no meio da tela.
- **Rolagem e teclado:** a `ScrollView` usa `keyboardShouldPersistTaps="handled"` e, no
  iOS, `automaticallyAdjustKeyboardInsets`. O Android segue com `adjustResize` (igual à
  v1). Sem `KeyboardAvoidingView`, para o logo não se mexer no 1º frame. Quando a Senha
  ganha foco, a tela rola até o botão ficar visível
  (`scrollRef.scrollTo({ y: fimDoCard − alturaVisível + spacing.m })`, medido pelo
  `onLayout` do card).
- **Foco:** nenhum campo ganha foco sozinho (a splash termina e o teclado não salta). O
  `next` do CPF foca a Senha, e o `go` da Senha envia se o botão estiver habilitado.
- **Regras (iguais à v1 §3.2):** o botão só habilita com um CPF válido (DV) e a senha não
  vazia. CPF com DV inválido mostra o erro **no campo CPF** no blur e o tira quando o CPF
  muda. Os erros de envio vão para o **banner** acima do botão (`login-error-message`). O
  banner some quando algum campo muda. Sessão expirada abre com o banner `Sua sessão
  expirou. Entre de novo.`.
- **Banner de erro:** `minHeight` 48, raio `m`, fundo `accentMuted`, borda `danger` de 1,
  `AlertIcon` 20 em `danger`, texto `error` com a cor `text` (contraste 16 : 1 sobre
  `accentMuted`), `paddingHorizontal: sm`. Em erro, a borda dos dois campos **não** fica
  vermelha (o erro é da combinação, não de um campo).

| Estado | O que se vê |
|---|---|
| Inicial | campos em repouso, rótulos no meio, botão desabilitado (`surfaceHigh` + `textDisabled`) |
| Digitando | o campo focado com borda teal e brilho, rótulo em cima, máscara no CPF |
| Pronto | botão `primary` com brilho |
| CPF inválido | borda `danger` e `Confira o CPF digitado.` embaixo do CPF; botão desabilitado |
| Enviando | spinner no botão, campos a 0,6 e não editáveis |
| Erro de envio | banner, shake do card, botão habilitado de novo, valores mantidos, foco não muda |

### 3.3 Agenda

Rota `App > Agenda`, `features/lessons/LessonsScreen.tsx`.

```
414 × 736                                                            y
┌────────────────────────────────────────────────────────────────┐   0
│ status                                                         │  20
│ [FIAP SCHOOL]                          ((RS) Rafael · 7EF ›)   │  20–76   CompactHeader
│ Olá, Gustavo                                                   │  80–98
│ Agenda                                                         │  98–132
│                       ↕ sm                                     │
│ Março 2025                                          ( Hoje )   │ 144–176  só quando não é hoje
│                       ↕ s                                      │
│ [DOM][SEG][TER][QUA][QUI][SEX][SÁB]                            │ 184–248  WeekStrip
│ ═══════════════ pager (página = dia) ═════════════════════════ │ 248 → 736
│   ↕ m                                                          │
│ ┌ ● Agora: Ciências · até 10:45 ───────────────────────────┐   │ 264–312  NowBanner
│   ↕ m                                                          │
│ 07:00 ──────────────────────────────────────────────────────   │ 328      Timetable (480)
│        [Matemática I            ] (passada)                    │
│ 08:00 ─[Língua Inglesa          ]                              │
│ 09:00 ─        Intervalo · 30 min                              │
│        [Língua Inglesa          ]                              │
│ 10:00 ─●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  (10:23)       │
│        ┃Ciências          AGORA┃                               │
│ ...  (rola)                                                    │
│      ┌──────────────────────────────────────────────────┐      │ 656–720  FloatingTabBar
│      │ (Agenda)      Boletim        Perfil               │      │
│      └──────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────┘ 736
```
- VM (`useAgendaViewModel`, a lógica de D35 continua):
  - campos novos: `days` (com `weekdayShort`, `dayNumber`, `hasLessons`, `lessonCount`,
    `isToday`, `accessibilityLabel`), `selectedIndex`, `todayIndex`, `monthLabel`
    (`Março 2025`; se a semana cruzar meses, `Março – Abril 2025`), `lessonsByDate` (com
    `startMinutes`/`endMinutes`), `refreshing`, `onRefresh` e `onSelectToday`;
  - continuam: `status`, `onSelectDay`, `onRetry`, `retrying` e `shakeKey`;
  - `now` segue injetável, e `useMinuteClock` recebe o mesmo `now`.
- **Hoje** = o índice da regra D35 (`initialAgendaDate`). A Agenda abre nele (N2).
- Estados:

| estado | o que aparece |
|---|---|
| carregando (1ª carga) | header real + `AgendaSkeleton` |
| pronto, dia com aulas | `NowBanner` + `Timetable` |
| pronto, dia sem aulas | `EmptyState` com `CalendarOffIcon`, `Sem aulas neste dia` e `Aproveite o fim de semana.` (sábado/domingo) ou `Nenhuma aula marcada para este dia.` (outros) |
| pronto, semana vazia (`days = []`) | `EmptyState` `Nenhuma aula nesta semana` sem faixa (`agenda-week-empty`) |
| erro | `ErrorState` `Não foi possível carregar a agenda.` + `Confira sua conexão e tente de novo.` no lugar da faixa e do pager |
| refetch em segundo plano / troca de aluno com cache | o conteúdo antigo fica, sem skeleton (igual à v1) |
| atualizando (puxou) | spinner nativo teal no topo da página |

### 3.4 Boletim

Rota `App > Boletim`, `features/report-card/ReportCardScreen.tsx`.

```
414 × 736                                                           y
│ CompactHeader (Olá, Gustavo / Boletim)                        │  20–132
│ ── rola ───────────────────────────────────────────────────── │
│   ↕ sm                                                        │
│ ( 2025 · 7EF )( 2024 · 6EF )                                  │ 144–180  segmento sm (largura do conteúdo)
│   ↕ sm                                                        │
│ ( 1º tri          |  2º tri          |  3º tri            )   │ 192–236  segmento md
│   ↕ m                                                         │
│ ┌ TermSummaryCard ────────────────────────────────────────┐   │ 252–492
│ └─────────────────────────────────────────────────────────┘   │
│ ● 7 ou mais  ● 5 a 6,9  ● abaixo de 5                         │ 504–520  legenda
│   ↕ l                                                         │
│ DISCIPLINAS · 12                                              │ 544–558  overline
│   ↕ s                                                         │
│ [SubjectGradeCard Língua Portuguesa 9,5]                      │ 566–664
│ [SubjectGradeCard Produção e Interpretação de Textos 8,0]     │ ...
│ ... (12 cards, gap s) ...  paddingBottom = inset da tab bar   │
│      [ FloatingTabBar ]                                       │
```
- Rolagem: `ScrollView` com `paddingHorizontal: m`. São 12 cards: não precisa de
  `FlatList` (cabe no teto de 12 da v1 §1.8, e o stagger tem teto de 6).
- VM (`useReportCardViewModel`): o acordeão (`openTerms`, `openSubjects`,
  `onToggleTerm`, `onToggleSubject`) **sai**. Entram:
  - `selectedTerm` e `onSelectTerm`;
  - `termOptions` (`1º tri`… com o a11y `1º trimestre`);
  - `summary` (`average`, `absences`, `subjects`, `belowTarget`, `partial`,
    `evaluated`);
  - `subjects` do trimestre (com `grade` numérico para a faixa, `gradeText`, `band`,
    `absencesText` e `accessibilityLabel`);
  - `yearOptions` no formato `{ key: '2025', label: '2025 · 7EF' }`;
  - `refreshing` e `onRefresh`.
- **Trimestre inicial** (DV5): o **maior** trimestre com pelo menos uma nota não nula. Se
  nenhum tiver, o 1º. Isso dá T1 em 2025 e T3 em 2024. Trocar de ano recalcula. Trocar
  de aluno volta ao ano mais recente.
- Estados:

| estado | o que aparece |
|---|---|
| carregando anos | header + `BoletimSkeleton` |
| carregando o ano (troca de ano) | os segmentos ficam; resumo e cards viram skeleton |
| trimestre avaliado | resumo + legenda + cards |
| trimestre **não avaliado** (todas as notas nulas) | segmentos ficam; no lugar do resumo e dos cards, `EmptyState` com `ClockIcon`, `Ainda não avaliado` e `As notas do 2º trimestre aparecem aqui assim que forem lançadas.` (`boletim-term-<t>-not-evaluated`) |
| trimestre parcial | resumo com `partial`; os cards sem nota mostram `Sem nota` |
| sem boletins | `EmptyState` `Nenhum boletim disponível` (`boletim-empty`) |
| erro | `ErrorState` `Não foi possível carregar o boletim.` (ou `Boletim não encontrado.`) |

### 3.5 Perfil (nova)

Rota `App > Perfil`, `features/profile/ProfileScreen.tsx` + `useProfileViewModel.ts`.

```
414 × 736
│ [FIAP SCHOOL]                                   (sem chip)    │  20–76
│ Olá, Gustavo                                                  │
│ Perfil                                                        │  –132
│ ── rola ──────────────────────────────────────────────────────│
│   ↕ sm                                                        │
│ ┌ cardVariants.surface ──────────────────────────────────────┐│
│ │ ((GS))  Gustavo da Silva                                    ││ Avatar l (guardian) + title
│ │         Responsável                                         ││ caption
│ │ ─────────────────────────────────────────────────────────── ││ hairline, my m
│ │ CPF                                       ***.294.560-**    ││ label | body tabular
│ └─────────────────────────────────────────────────────────────┘│
│   ↕ l                                                         │
│ ALUNOS                                                        │ overline
│ Toque em um aluno para ver as aulas e o boletim dele.         │ caption (só com 2+ alunos), mt xxs
│   ↕ sm                                                        │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ StudentRow (72) atual:
│ ┃ (RS) Rafael da Silva                          ╭✓ Atual╮    ┃ │ camada primary + glow
│ ┃      7EF · RM 12567 · Matutino                ╰───────╯    ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│   ↕ s                                                         │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ (JS) Joana da Silva                                    ( )   ││ rádio 22, borda borderInput
│ │      2EM · RM 12568 · Matutino                              ││
│ └─────────────────────────────────────────────────────────────┘│
│   ↕ l                                                         │
│ CONTA                                                         │
│   ↕ sm                                                        │
│ ┌─────────────────────────────────────────────────────────────┐│ LogoutRow 56, cardVariants.surfaceCompact
│ │ [⎋]  Sair da conta                                          ││ ícone + bodyStrong em danger
│ └─────────────────────────────────────────────────────────────┘│
│      confirmando (mesma altura, crossfade):                   │
│ │ Sair deste aparelho?     ( Cancelar )  ( Sair )            ││ bodyStrong | PillButton secondary xs | danger xs
```
- Dados (V3, sem rota nova):
  - o nome completo do responsável (`fullName(me.firstName, me.lastName)`);
  - o CPF exatamente como a API manda (`***.294.560-**`: já vem mascarado, e o app não
    tem o CPF inteiro para mostrar);
  - os alunos do `/me`.
- **StudentRow:** `Pressable` com `minHeight: 72`, raio `m`, fundo `surfaceRaised`, borda
  `borderSubtle` e `paddingHorizontal: m`. Dentro: `Avatar m` + `gap sm` + uma coluna com
  o nome (`subtitle`, `numberOfLines={1}`) e `{turma} · RM {rm} · {período}`
  (`caption`). À direita:
  - **atual:** o selo `Atual` (pill 28, fundo `primaryMuted`, `CheckIcon` 16 + `label`
    em `primary`) e a camada de borda `primary` com `glowPrimary`;
  - **outro:** um rádio vazio de 22 (borda `borderInput` de 1,5, raio `pill`).
- **Trocar** (DV8): tocar numa linha que não é a atual chama
  `useSessionStore.selectStudent(id)` na hora.
  - Animação: 4.6. O chip do header nas outras abas já mostra o aluno novo.
  - O leitor anuncia `Agora mostrando Joana da Silva.`.
  - Tocar no atual não faz nada (sem anúncio, sem animação).
  - Com 1 aluno: a linha única fica como atual, sem o rádio e sem a dica, e não é
    pressionável (role `text`).
- **Sair** (DV7):
  - O 1º toque troca a linha por `Sair deste aparelho?` + `Cancelar` + `Sair`, em
    crossfade e na mesma altura.
  - `Cancelar` volta ao normal.
  - `Sair` chama o `useLogout` (desabilita, spinner no `PillButton danger`), e o
    RootStack vai ao Login.
  - Sair da aba (blur) ou trocar de aluno desfaz a confirmação.
  - No `compact`, o texto `Sair deste aparelho?` some e os dois botões dividem a
    largura.
  - Sem timeout automático.
- Pull-to-refresh: refetch do `/me`.
- `useProfileViewModel` expõe `guardian` (`fullName`, `firstName`, `lastName`,
  `cpfMasked`), `students` (`id`, `fullName`, `firstName`, `lastName`, `rm`,
  `className`, `period`, `selected`), `canSwitch`, `onSelectStudent(id)`,
  `confirmingLogout`, `onAskLogout`, `onCancelLogout`, `onConfirmLogout`, `loggingOut`,
  `refreshing` e `onRefresh`.

### 3.6 Sem aluno (`NoStudent`)

Rota do stack, `features/students/NoStudentScreen.tsx`. Sem tab bar.
```
│ [FIAP SCHOOL]                                                 │ headerBar
│ Olá, Carlos                                                   │ header-greeting
│ Sua conta                                                     │ headline (no-student-title)
│                                                               │
│                  ╭──────╮                                     │
│                  │ 👥  │                                      │ EmptyState neutro, UsersIcon
│                  ╰──────╯                                     │
│            Nenhum aluno vinculado                             │
│  Não encontramos alunos ligados ao seu CPF. Fale com a        │
│  secretaria da FIAP School para fazer o vínculo.              │
│                    ↕ l                                        │
│              ( [⎋] Sair )                                     │ PillButton secondary sm, imediato
```
O bloco é centralizado na vertical do espaço que sobra.

### 3.7 Erro no início (`BootError`)

Igual ao NoStudent, sem saudação (o `/me` falhou). O título é `Sem conexão`. O
`ErrorState` usa o `WifiOffIcon`, o título `Não conseguimos conectar.`, a descrição
`Confira sua conexão e tente de novo.`, `PillButton primary md` `Tentar de novo`
(`boot-error-retry`, que refaz o `/me` como na v1) e, embaixo, `PillButton ghost sm` `Sair`
(`boot-error-logout-button`, funciona offline como na v1).

### 3.8 Erro dentro das abas

É o `ErrorState` de 3.3 e 3.4. O header, o chip e a tab bar continuam utilizáveis.

---

## 4. Animações por tela

Colunas: gatilho · o quê · tipo · duração/curva · com reduzir movimento. Só `transform` e
`opacity`, sem `setState` por frame.

### 4.1 Transições de stack e de aba

| gatilho | o quê | tipo | duração / curva | reduzir movimento |
|---|---|---|---|---|
| Login ↔ App, logout | stack | native-stack `fade` | nativo | igual |
| troca de aba | conteúdo | bottom-tabs `animation: 'shift'` | nativo do RN Navigation | `'fade'` |
| troca de aba | indicador da tab bar | `translateX` com `spring.snappy` | ~250 ms | `set` |
| troca de aba | cor dos itens | opacidade por proximidade (2.4) | segue o indicador | crossfade `fast` |
| troca de aba | ícone ativo | `scale 1 → 1.12 → 1` | `fast` + `fast` | nenhum |

### 4.2 Splash → Login e Login

| gatilho | o quê | tipo | duração / curva | reduzir movimento |
|---|---|---|---|---|
| destino = Login | logo da splash | `translateY` + `scale → 0.8` | `slow` 320, `emphasized` | o grupo some (150) |
| montagem `fromSplash` | halo | `opacity 0 → 1` | `slower` 450, `easeOut` | igual (opacidade) |
| montagem `fromSplash` | card | `FadeInDown` com 16 + `withInitialValues({ scale: 0.98 })` | `slow`, `emphasized` | `FadeIn(fast)` |
| montagem | itens do card (título, texto, CPF, Senha, botão) | `FadeInDown(base)` de 8, `delay = 60 + i × stagger` | até 220 + 220 | sem atraso, `FadeIn(fast)` |
| montagem | ajuda do rodapé | `FadeIn(base).delay(300)` | | `FadeIn(fast)` |
| montagem vinda do logout | logo + halo | `FadeIn(base)` | | igual |
| foco / blur | rótulo flutuante | `translateY` + `scale` | `base`, `easeOut` | `set` |
| foco / blur | camada de foco | `opacity` | `fast` | igual |
| habilitou | brilho do botão | `opacity` da camada de brilho 0 → 1 (camada absoluta com `boxShadow`) | `base` | igual |
| `loading` | rótulo → spinner | `opacity` | 100 / 150 | igual |
| erro de envio | card | shake `translateX` (`motion.shake`) | 300 | **sem shake**, só o banner |
| erro | banner | `FadeInDown(base)` de 8; saída `FadeOut(fast)` | | `FadeIn(fast)` |
| erro de CPF | texto do campo | `FadeInDown(base)` de 8 | | `FadeIn(fast)` |
| toque no olho | ícones | crossfade + `scale 0.85 → 1` | `fast` | crossfade |
| pressionar botão | botão | `scale 0.97` com `press` | spring | nenhum |

### 4.3 Entrada da área autenticada (1ª montagem do App)

Roda uma vez por montagem de `AppTabs` (login ou splash). As abas montam sob demanda (a
1ª visita a Boletim e Perfil faz a entrada de conteúdo delas, sem repetir a do header).

| ordem | elemento | tipo | atraso |
|---|---|---|---|
| 1 | linha do logo + chip | `FadeIn(base)` | 0 |
| 2 | saudação + título | `FadeInDown(base)` de 8 | `stagger` |
| 3 | tab bar | `translateY enterOffsetCard → 0` com `spring.gentle` + `opacity 0 → 1` (`base`) | `2 × stagger` |
| 4 | conteúdo da aba | 4.4 / 4.5 / 4.6 | a partir de `3 × stagger` |

Com reduzir movimento, tudo vira `FadeIn(fast)` sem atraso.

### 4.4 Agenda

| gatilho | o quê | tipo | duração / curva | reduzir movimento |
|---|---|---|---|---|
| montagem / troca de aluno | chips | `FadeInDown(base)` de 8, `delay i × stripStagger` | 220 + 120 | `FadeIn(fast)` |
| montagem | banner | `FadeIn(base)` | `delay 3 × stagger` | igual |
| montagem | blocos de aula | `FadeInDown(base)` de 8, `delay (4 + i) × stagger`, até 6 | ≤ 420 | `FadeIn(fast)` |
| montagem (hoje) | linha de agora | `opacity 0 → 1` + `scaleX 0 → 1` (origem à esquerda) | `slow`, `emphasized`, depois dos blocos | `FadeIn(fast)` |
| montagem (hoje) | rolagem até agora | `scrollTo` animado | nativo | `animated: false` |
| toque no chip / Hoje | pager | `scrollToIndex` animado; o indicador segue a rolagem | nativo (~300) | `animated: false` (o indicador pula) |
| swipe | pager + indicador | rolagem nativa; `progress` na UI thread | dedo | igual (o swipe é do usuário) |
| pressionar chip | chip | `scale 0.94` com `press` | spring | nenhum |
| "Hoje" aparece / some | botão | `FadeIn` + `scale 0.9 → 1` / `FadeOut` | `fast` | `FadeIn` / `FadeOut` |
| virada de minuto | linha de agora | `translateY` | `slow`, `standard` | `set` |
| contínuo (agora) | anel do ponto | `scale` + `opacity` em loop | 2000 por ciclo | parado (sem anel) |
| aula começou | bloco | camada de brilho `opacity 0 → 1`; selo `spring.pop` | `base` | `FadeIn(fast)` no selo |
| aula terminou | bloco | `opacity 1 → 0.72` | `slow` | `set` |
| fase mudou | texto do banner | crossfade com `key` | `base` / `fast` | igual |
| dados chegaram | skeleton → conteúdo | skeleton `FadeOut(fast)`; o conteúdo entra como na montagem | | `FadeIn(fast)` |
| dia sem aulas | estado vazio | ícone `FadeIn` + `scale 0.9 → 1` (`spring.gentle`); textos `FadeInDown` com `stagger` | | `FadeIn(fast)` |

### 4.5 Boletim

| gatilho | o quê | tipo | duração / curva | reduzir movimento |
|---|---|---|---|---|
| montagem | segmentos | `FadeInDown(base)` de 8 | `delay 3 × stagger` | `FadeIn(fast)` |
| montagem / troca de trimestre ou ano | resumo | `FadeIn(base)` + `translateX ±slideOffset → 0` (sinal = direção: trimestre maior entra da direita) | `base`, `emphasized` | `FadeIn(fast)` |
| idem | saída do conteúdo antigo | container com `key = ano-trimestre`, `FadeOut(120)` | `easeIn` | igual |
| idem | cards de disciplina | `FadeInDown(base)` de 8, `delay min(i, 6) × 30` | ≤ 400 | `FadeIn(fast)` |
| idem | barras (resumo e cards) | `scaleX 0 → nota/10` | `slower`, `emphasized`, depois do card | nasce cheia |
| troca de segmento | indicador | `spring.snappy` + cor por proximidade | ~250 | `set` + crossfade |
| trimestre não avaliado | estado vazio | igual ao dia sem aulas | | |

Sem contagem número a número na nota (o motivo é o da v1 §4.6): a nota entra com o card.

### 4.6 Perfil

| gatilho | o quê | tipo | duração / curva | reduzir movimento |
|---|---|---|---|---|
| 1ª visita | card do responsável | `FadeInDown(base)` de 12 | | `FadeIn(fast)` |
| 1ª visita | linhas de aluno e "Conta" | `FadeInDown(base)`, `delay (1 + i) × cardStagger` | | `FadeIn(fast)` |
| trocar aluno | linha antiga | camada de destaque `opacity 1 → 0` (`fast`); selo `Atual` `FadeOut(fast)`; o rádio entra com `FadeIn(fast)` | | igual |
| trocar aluno | linha nova | camada `opacity 0 → 1` (`base`); `scale 0.98 → 1` com `spring.pop`; selo `FadeIn` + `scale popFrom → 1` com `spring.pop` | | sem escala |
| trocar aluno | chip do header (outras abas) | crossfade com `key` (2.6) | | igual |
| pressionar linha | linha | `scale 0.97` com `press` | spring | nenhum |
| pedir para sair | linha → confirmação | crossfade das duas camadas (mesma altura) | `base` | igual |

### 4.7 Estados

- `EmptyState` / `ErrorState`: o ícone com `FadeIn` + `scale 0.9 → 1` (`spring.gentle`),
  o título com `FadeInDown(base)` atrasado `stagger`, a descrição com `2 × stagger` e a
  ação com `3 × stagger`.
- Tentar de novo e falhar de novo: `shakeShort` no bloco (v1).
- Skeleton: shimmer de 2.16.

### 4.8 Orçamento de performance (para o qa medir, N7)

- A Agenda tem, no máximo, 7 páginas montadas sob `windowSize 3` (3 de fato). Cada
  página tem ≤ 6 blocos, ≤ 7 rótulos de hora animados e uma linha.
- Shared values por tela: indicador (1), progresso do pager (1), relógio (1), shimmer
  (1), pulso (1).
- Sem `layout={LinearTransition}` em lugar nenhum da v2.
- Meta: o swipe da Agenda e a troca de trimestre sem engasgo visível no iPhone (simulator
  em release) e no APK do CI.

---

## 5. Textos (pt-BR, `constants/strings.ts`)

Novos e alterados (o que não está aqui fica como na v1):

| chave | texto | nota |
|---|---|---|
| `login.title` | `Bem-vindo` | novo |
| `login.subtitle` | `Acompanhe as aulas e o boletim do seu filho.` | novo |
| `login.cpfLabel` | `CPF` | igual |
| `login.cpfPlaceholder` | `000.000.000-00` | novo (padrão de exemplo) |
| `login.passwordLabel` | `Senha` | era `SENHA` |
| `login.showPassword` / `login.hidePassword` | `Mostrar senha` / `Ocultar senha` | novos (a11y) |
| `login.submit` | `Entrar` | era `FAZER LOGIN` (DV3) |
| `login.submittingAccessibilityLabel` | `Entrando…` | era `Entrando` |
| `login.help` | `Problemas para entrar? Fale com a secretaria da FIAP School.` | novo |
| `login.error.invalid` | `Usuário ou senha inválida. Confira e tente de novo.` | uma linha só (o regex do flow 01 continua valendo) |
| `login.error.network` | `Não conseguimos falar com o servidor. Confira sua conexão.` | |
| `login.error.tooMany` | `Muitas tentativas seguidas. Aguarde um minuto e tente de novo.` | |
| `login.error.server` | `Algo deu errado do nosso lado. Tente de novo em instantes.` | |
| `login.error.cpf`, `sessionExpired`, `storage` | iguais à v1 | |
| `header.greeting` | `Olá, {primeiro nome}` | sem caixa alta |
| `header.studentChip` | `{primeiro nome} · {turma}` | novo |
| `header.studentHint` | `Abre o perfil` | novo |
| `tabs.agenda` / `tabs.boletim` / `tabs.perfil` | `Agenda` / `Boletim` / `Perfil` | sem caixa alta; `Perfil` novo |
| `agenda.title` | `Agenda` | |
| `agenda.monthLabel` | `{Mês} {ano}` (`Março 2025`) | novo, mês com inicial maiúscula |
| `agenda.today` | `Hoje` | novo |
| `agenda.weekdayShort` | `dom`, `seg`, `ter`, `qua`, `qui`, `sex`, `sáb` (maiúsculas pela variante) | novo |
| `agenda.dayAccessibilityLabel` | `{Dia da semana}, {d} de {mês}, {n} aulas` / `…, 1 aula` / `…, sem aulas` + `, hoje` | novo |
| `agenda.lessonTime` | `{início} – {fim} · {n} min` | en dash, com duração |
| `agenda.lessonAccessibilityLabel` | `Das {início} às {fim}, {disciplina}` + `, agora` / `, encerrada` | |
| `agenda.nowBadge` | `Agora` | novo |
| `agenda.banner.now` | `Agora: {disciplina}` + ` · até {fim}` | novo |
| `agenda.banner.break` | `Intervalo` + ` · próxima aula às {início}` | novo |
| `agenda.banner.before` | `Próxima aula às {início}` | novo (texto do brief) |
| `agenda.banner.after` | `Aulas encerradas` | novo (texto do brief) |
| `agenda.banner.summary` | `{n} aulas · das {início} às {fim}` / `1 aula · das …` | novo |
| `agenda.break` | `Intervalo · {n} min` | novo |
| `agenda.empty` | `Sem aulas neste dia` | igual |
| `agenda.emptyWeekend` | `Aproveite o fim de semana.` | novo |
| `agenda.emptyWeekday` | `Nenhuma aula marcada para este dia.` | novo |
| `agenda.weekEmpty` | `Nenhuma aula nesta semana` | novo |
| `agenda.dayChangedAnnouncement` | `{Dia da semana}, {d} de {mês}. {n} aulas.` | novo (swipe) |
| `agenda.loadingAccessibilityLabel` | `Carregando agenda…` | reticências |
| `boletim.title` | `Boletim` | |
| `boletim.yearOption` | `{ano} · {turma}` (`2025 · 7EF`) | era `7EF - 2025` |
| `boletim.yearSingle` | `Ano letivo {ano} · {turma}` | novo |
| `boletim.termShort` / `boletim.termAccessibilityLabel` | `{n}º tri` / `{n}º trimestre` | |
| `boletim.summaryTitle` | `{n}º trimestre · {ano}` (maiúsculas pela variante) | novo |
| `boletim.average` / `boletim.averagePartial` | `Média geral` / `Média de {n} disciplinas avaliadas` | novos |
| `boletim.statAbsences` / `statSubjects` / `statBelow` | `faltas` (`falta` com 1) / `disciplinas` / `abaixo de 7` | novos |
| `boletim.band.good` / `warning` / `low` / `none` | `Bom` / `Atenção` / `Baixo` / `Sem nota` | novos |
| `boletim.legend` | `7 ou mais` · `5 a 6,9` · `abaixo de 5` | novos |
| `boletim.subjectsHeader` | `Disciplinas · {n}` | novo |
| `boletim.absencesCount` | `{n} faltas` / `1 falta` / `Faltas não lançadas` | |
| `boletim.notEvaluatedTitle` | `Ainda não avaliado` | novo (texto do brief) |
| `boletim.notEvaluatedDescription` | `As notas do {n}º trimestre aparecem aqui assim que forem lançadas.` | novo |
| `boletim.subjectAccessibilityLabel` | `{disciplina}. Nota {nota}, {faixa}. {n} faltas.` / `{disciplina}. Nota e faltas ainda não lançadas.` | substitui o `-result` |
| `boletim.summaryAccessibilityLabel` | `{n}º trimestre de {ano}. Média {média}, {faixa}. {f} faltas em {d} disciplinas. {b} abaixo de 7.` | novo |
| `boletim.loadingAccessibilityLabel` | `Carregando boletim…` | |
| `profile.title` | `Perfil` | novo |
| `profile.guardianRole` | `Responsável` | novo |
| `profile.cpfLabel` | `CPF` | novo |
| `profile.studentsHeader` | `Alunos` (maiúsculas pela variante) | novo |
| `profile.studentsHint` | `Toque em um aluno para ver as aulas e o boletim dele.` | novo |
| `profile.studentInfo` | `{turma} · RM {rm} · {período}` | novo |
| `profile.current` | `Atual` | novo |
| `profile.studentAccessibilityLabel` | `{nome completo}, turma {turma}, RM {rm}, {período}` (+ estado `selected`) | o da v1 |
| `profile.studentHint` | `Mostra as aulas e o boletim deste aluno` | novo |
| `profile.switchedAnnouncement` | `Agora mostrando {nome completo}.` | novo |
| `profile.accountHeader` | `Conta` | novo |
| `profile.logout` | `Sair da conta` | novo |
| `profile.logoutConfirmQuestion` | `Sair deste aparelho?` | novo |
| `profile.logoutCancel` / `profile.logoutConfirm` | `Cancelar` / `Sair` | novos |
| `noStudent.screenTitle` | `Sua conta` | novo |
| `noStudent.title` / `description` | iguais à v1 | |
| `noStudent.logout` | `Sair` | |
| `boot.screenTitle` | `Sem conexão` | novo |
| `boot.error.title` | `Não conseguimos conectar.` | igual |
| `common.retry` | `Tentar de novo` | era `TENTAR DE NOVO` |
| `common.refreshError` | `Não foi possível atualizar. Puxe para tentar de novo.` | novo |
| `common.error.description` | `Confira sua conexão e tente de novo.` | igual |

Saem: `header.switchStudent*`, `header.logout*`, `selectStudent.*`,
`common.closeListAccessibilityLabel`, `agenda.dayHint`, `agenda.dayAccessibilityPrefix`,
`boletim.yearHint`, `boletim.yearAccessibilityPrefix`, `boletim.grade`, `boletim.absences`
e `boletim.resultAccessibilityLabel` (trocado pelo `subjectAccessibilityLabel`). Os
utils de mês e dia continuam sem `Intl`.

---

## 6. Acessibilidade

### 6.1 Contraste
A tabela 1.3 cobre todos os pares de texto e de componente. Pontos de atenção para o
review: `opacities.past` nunca abaixo de 0,72, e o `pink` nunca com texto.

### 6.2 A cor nunca sozinha
- Faixa de nota: cor + selo com texto + legenda.
- Aula agora: borda + brilho + selo `Agora` + `, agora` no rótulo.
- Aula passada: atenuada + `, encerrada` no rótulo.
- Dia com aula: o ponto é decorativo, e o rótulo diz `6 aulas` / `sem aulas`.
- Dia de hoje: borda teal + `, hoje` no rótulo.
- Aluno atual: borda + selo `Atual` com ícone + `selected`.
- Erro de campo: borda + ícone + texto.

### 6.3 Alvos de toque

| elemento | desenho | alvo |
|---|---|---|
| item da tab bar | ~127 × 64 | ok |
| chip de dia | 51 × 64 (414) · 45,6 × 64 (375) · **40 × 64 (320)** | ≥ 44 de 375 para cima. Em 320, a largura fica em 40, acima do mínimo AA de 24 (2.5.8). Ver Mensagens. |
| "Hoje" | pill 32 | `hitSlop` até 44 |
| segmento sm / md | 36 / 44 | `hitSlop` 4 no sm |
| chip do aluno | 40 | `hitSlop` 2 |
| olho da senha | 44 × 44 | ok |
| linha de aluno | 72 | ok |
| Sair / Cancelar (xs) | 32 | `hitSlop` até 44 |
| botões md | 56 | ok |

### 6.4 Leitor de tela e foco
- **Ordem nas abas:** logo → chip → saudação → título → conteúdo → tab bar. O
  conteúdo rola por baixo da tab bar, mas o padding (`useFloatingTabBarInset`) garante
  que o último item focado fique visível acima dela (VoiceOver e TalkBack rolam até o
  foco).
- **Agenda:** mês → "Hoje" → chips (tablist) → banner → blocos na ordem. O swipe do pager
  com um dedo não existe com leitor ligado (o gesto vira navegação), e os chips cumprem
  o papel. Na troca por swipe (sem leitor), o anúncio `dayChangedAnnouncement` só sai se
  `AccessibilityInfo.isScreenReaderEnabled()`.
- **Boletim:** ano → trimestres → resumo (1 elemento) → legenda → disciplinas (1 elemento
  cada).
- **Perfil:** card do responsável (nome, papel e CPF num elemento: `Gustavo da Silva,
  responsável. CPF ***.294.560-**`; o leitor soletra os asteriscos como "asterisco", e é
  isso mesmo, porque a máscara é a informação) → `Alunos` (header) → linhas (`button`,
  `{selected}`) → `Conta` (header) → Sair. Na confirmação, o foco vai para `Cancelar`
  (`setAccessibilityFocus`) e, ao cancelar, volta para `Sair da conta`.
- **Login:** logo → título → texto → CPF → Senha → olho → banner (quando há) → Entrar →
  ajuda. Os erros são anunciados uma vez (`accessibilityLiveRegion="polite"` no Android
  e `announceForAccessibility` no iOS, como na v1). Erro de CPF no blur: anunciado e
  ligado ao campo pelo hint.
- **Estados:** skeleton com role `progressbar`; vazio e erro com o título como `header`.
- Os ícones decorativos ficam `accessible={false}`. Os dos botões ficam dentro do
  rótulo do botão.

### 6.5 Fonte grande
Elementos de altura fixa com teto de 1,3 (1.8). O timetable cresce até 1,6 (2.10). Os
cards e textos longos (disciplina em 2 linhas no card, ajuda do login) crescem sem
limite. No máximo do iOS, o qa confere que nada sobrepõe (critério 13 da seção 9).

---

## 7. testIDs e impacto no Maestro

### 7.1 Novos ou alterados

| id | elemento | flows |
|---|---|---|
| `login-screen`, `login-cpf-input`, `login-password-input`, `login-submit-button`, `login-submit-loading`, `login-error-message`, `login-logo` | iguais (o `login-submit-loading` agora vem do `PillButton`: `${testID}-loading`) | 01, 02, 03, 10 |
| `login-cpf-input-error` | erro do CPF | — |
| `login-password-input-toggle` | mostrar/ocultar | — |
| `header` / `header-greeting` | iguais | 02, 08, 09 |
| `header-student-chip` | chip (role button, rótulo `Aluno …`) | 02, 07, 08 |
| `header-student-name` / `header-student-class` | `Text` "Rafael" / "7EF" | 07 |
| `agenda-title`, `boletim-title`, `profile-title` | títulos | 02 |
| `tab-bar`, `tab-agenda`, `tab-boletim`, **`tab-perfil`**, `tab-bar-indicator` | tab bar | 02, 05–10 |
| `agenda-screen` | igual | 02, 03, 04, 10 |
| `agenda-week-strip`, `agenda-month-label`, `agenda-today-button` | faixa | 02, 04 |
| `agenda-day-<data>` | chip (ex.: `agenda-day-2025-03-17`) | 04 |
| `agenda-pager`, `agenda-page-<data>` | pager / página | 04 |
| `agenda-page-<data>-banner` | banner | — |
| `agenda-page-<data>-timetable` | grade | 04 |
| `agenda-page-<data>-lesson-<i>` (+ `-subject`, `-time`, `-now-badge`) | bloco | 04 |
| `agenda-page-<data>-now-line` | linha de agora | — (teste de componente) |
| `agenda-page-<data>-empty` | dia sem aulas | 04 |
| `agenda-week-empty`, `agenda-skeleton`, `agenda-error`, `agenda-error-retry`, `agenda-refresh-error` | estados | — |
| `boletim-screen` | igual | 05, 06, 07 |
| `boletim-year`, `boletim-year-<ano>` | segmento de ano (ou pílula única com o mesmo id) | 05, 06, 07, 08 |
| `boletim-term`, `boletim-term-tab-<t>` | segmento de trimestre | 05, 06 |
| `boletim-summary`, `boletim-summary-average`, `boletim-summary-absences`, `boletim-legend` | resumo | 05 |
| `boletim-term-<t>-subject-<i>` (+ `-grade`, `-band`, `-absences`) | card de disciplina | 05, 06 |
| `boletim-term-<t>-not-evaluated` | trimestre não avaliado | 05 |
| `boletim-empty`, `boletim-skeleton`, `boletim-error`, `boletim-error-retry`, `boletim-refresh-error` | estados | — |
| **`profile-screen`** | raiz do Perfil | 07, 08, 10 |
| `profile-guardian-card`, `profile-guardian-name`, `profile-guardian-cpf` | responsável | 02b (novo, ver abaixo) |
| `profile-students-hint` | dica (só com 2+ alunos) | 08 (`assertNotVisible`) |
| `profile-student-<rm>` (ex.: `profile-student-12568`) | linha do aluno | 07, 08 |
| `profile-student-<rm>-current` | selo "Atual" | 07, 08 |
| `profile-logout-button`, `profile-logout-cancel`, `profile-logout-confirm` | sair | 10 |
| `no-student-screen`, `no-student-empty`, **`no-student-logout-button`**, `no-student-title` | sem aluno | 09 |
| `boot-error-screen`, `boot-error`, `boot-error-retry`, **`boot-error-logout-button`** | erro no início | — |
| `splash-*` | iguais | 03 |

**Saem:** `header-action-bar`, `header-switch-student-button`, `header-logout-button`,
`header-student-info`, `agenda-day-dropdown*`, `agenda-lesson-list`, `agenda-lesson-<i>*`,
`agenda-empty`, `boletim-year-dropdown*`, `boletim-term-<t>` (cabeçalho do acordeão),
`boletim-term-<t>-content`, `boletim-term-<t>-subject-<i>-result`, `select-student-*`.

O `maestro:check` já aceita ids com data e número na parte variável
(`agenda-page-2025-03-17-lesson-0` casa com `` `${testID}-lesson-${index}` ``). Os ids
com valor ficam **no `Text`** (regra da v1 §7).

### 7.2 Subflows

| subflow | v2 |
|---|---|
| `launch-clean` | igual |
| `login` | igual (os ids não mudam) |
| `select-student` (param `RM`) | `tapOn tab-perfil` → `extendedWaitUntil profile-student-${RM}` → `tapOn profile-student-${RM}` → `extendedWaitUntil visible profile-student-${RM}-current` (5 s). **Não volta** para a aba: quem chama toca na aba que quer. |
| `logout` | `tapOn tab-perfil` → `tapOn profile-logout-button` → `tapOn profile-logout-confirm` → `extendedWaitUntil login-screen` |

### 7.3 Impacto nos 10 flows

| flow | o que muda |
|---|---|
| 01 login inválido | nada nos passos; o regex `(?s)Usuário ou senha inválida\..*` continua casando |
| 02 login sucesso | troca `header-switch-student-button`/`header-logout-button` por `header-student-chip` (com `text: '(?i)aluno (rafael\|joana),.*'`) e `agenda-day-dropdown` por `agenda-week-strip`; acrescenta `assertVisible tab-perfil` |
| 03 sessão persistida | nada |
| 04 aulas navegar dias | **reescrito:** select-student 12567 → `tapOn tab-agenda` → `tapOn agenda-day-2025-03-17` → `extendedWaitUntil agenda-page-2025-03-17-lesson-0` com `text: '.*07:15.*Matemática I.*'` → **swipe** `swipe: {from: {id: agenda-pager}, direction: LEFT}` → assert `agenda-page-2025-03-18-lesson-0` `'.*07:15.*Produção e Interpretação de Textos.*'` (N2: swipe troca o dia) → `tapOn agenda-day-2025-03-16` → `extendedWaitUntil agenda-page-2025-03-16-empty` + `assertVisible text 'Sem aulas neste dia'` + `assertNotVisible agenda-page-2025-03-16-timetable` |
| 05 boletim 2025 | select-student 12567 → `tapOn tab-boletim` → `extendedWaitUntil boletim-year-2025` com `text: '.*2025 · 7EF'` → `tapOn boletim-term-tab-1` → `assertVisible boletim-term-1-subject-0` com `text: '(?s)Língua Portuguesa.*Nota 9,5.*0 faltas.*'` (Android: `-grade` `'9,5'`, `-absences` `'0 faltas'`) → `tapOn boletim-term-tab-2` → `extendedWaitUntil boletim-term-2-not-evaluated` + `assertVisible text 'Ainda não avaliado'` |
| 06 anos anteriores | `tapOn boletim-year-2024` → `extendedWaitUntil boletim-year-2024` (selecionado) e `boletim-term-tab-1` → `tapOn boletim-term-tab-1` (2024 abre no T3) → `assertVisible boletim-term-1-subject-0` com `'(?s).*Nota 8,0.*1 falta.*'` |
| 07 trocar aluno | **reescrito:** no Boletim → select-student 12567 → `tapOn tab-boletim` → `boletim-year-2025` `'.*7EF'` → **`tapOn header-student-chip`** (testa o chip → Perfil) → `extendedWaitUntil profile-screen` → `tapOn profile-student-12568` → `extendedWaitUntil profile-student-12568-current` → `tapOn tab-boletim` → `extendedWaitUntil boletim-year-2025` `'.*2EM'` → `assertVisible header-student-chip` `'(?i)aluno joana,.*'` |
| 08 um aluno | Adelaide: `header-student-chip` `'(?i)aluno bianca,.*'` → `tapOn tab-perfil` → `assertVisible profile-student-13752-current` → `assertNotVisible profile-students-hint` → `tapOn tab-boletim` → `boletim-year-2025` `'.*1EF'` (pílula única) |
| 09 sem aluno | troca `header-logout-button` por `no-student-logout-button`; o resto igual (`no-student-empty`, `header-greeting`, `assertNotVisible tab-bar`); remove o `assertNotVisible header-switch-student-button` (o id não existe mais; vira `assertNotVisible header-student-chip`) |
| 10 logout | o subflow `logout` novo (Perfil → Sair → Confirmar); o resto igual |

Sugestão de flow novo (opcional, o chief decide se entra no N8): **11-perfil-dados**,
com Gustavo → `tab-perfil` → `profile-guardian-name` `'Gustavo da Silva'` →
`profile-guardian-cpf` `'\*\*\*\.294\.560-\*\*'` → `profile-logout-button` →
`profile-logout-cancel` → `assertVisible profile-logout-button`.

A **linha de agora** e os estados por horário não entram no Maestro (dependem do relógio
do emulador): ficam no teste de componente com relógio injetado (N3).

---

## 8. Tamanhos de tela

| largura / altura | regra |
|---|---|
| 320 (`compact`) | `headline` 24; tab bar com `left/right: s`; chips com 40 de largura e `paddingHorizontal: s` na faixa; `Sair deste aparelho?` some na confirmação; o chip do aluno corta o nome com reticências (`maxWidth` 200 menos o avatar); o card do login com `mx: s` e `p: m` |
| altura < 700 (SE 667, 568) | timetable com `hourCompact` 64 (45 min = 48 pt) e `paddingVertical: xs` nos blocos; logo do login em `section` (64) do topo (fórmula 3.2); o login rola com o teclado aberto |
| 375–767 | como especificado (frame 414 × 736) |
| ≥ 768 (`tablet`) | coluna de conteúdo de 600 centralizada (header, faixa, pager, boletim, perfil); tab bar com `maxWidth` 420 centralizada; card do login com 400 e raio `xl`; o pager usa a largura da coluna, não a da janela |
| home indicator (insets.bottom 34) | tab bar com o fundo a 26 da borda; o padding das rolagens soma esse valor |
| paisagem | celular: retrato (igual à v1); tablet: as mesmas regras do tablet |

---

## 9. Critérios visuais para o qa

Não há print de referência da v2: o qa compara com os wireframes deste arquivo e com os
prints da v1 (`docs/figma/screens/`, `../2026-10-27-fiap-school/evidencias/`) só para
conferir que a identidade se manteve.

1. Fundo preto puro em todas as telas. Os cards se distinguem do fundo em 3 níveis
   (`#141414` / `#1E1E1E` / `#2A2A2A`), com a borda sutil visível.
2. Montserrat em tudo, sem fonte do sistema escapando. Números de hora e nota alinhados
   (tabular) no iOS. No APK do CI, anote se o tabular pegou.
3. Splash: a mesma da v1. A saída para o Login leva o logo ao lugar exato do logo do
   Login, já menor (0,8), sem "pulo" no último frame.
4. Login: card centralizado com raio 20; campos de 60 com raio 14 e ícone; o rótulo
   sobe e encolhe ao focar; borda teal com brilho no foco; olho alterna a senha; o botão
   `Entrar` é uma pílula cinza desabilitada e teal com brilho quando habilitada; o
   spinner não muda a largura; o banner de erro rosa fica acima do botão e o card treme
   uma vez; com o teclado aberto, o botão fica visível ao focar a Senha.
5. Tab bar: cápsula flutuante de 64 com raio total, a 16 das laterais e acima da área
   segura. O indicador teal translúcido desliza entre Agenda, Boletim e Perfil, e a cor
   do ícone acompanha. O último item de toda lista fica acima da barra (N1). O
   conteúdo esmaece atrás dela.
6. Header: logo de 80 × 13; chip com avatar de iniciais, `Rafael · 7EF` e chevron; tocar
   no chip abre o Perfil; `Olá, Gustavo` + título grande; a divisória só aparece ao
   rolar.
7. Agenda: `Março 2025`; 7 chips do mesmo tamanho; ponto nos dias com aula (seg–sex),
   sem ponto no sábado e no domingo; o dia de hoje com borda teal; o indicador teal
   segue o dedo no swipe; `Hoje` aparece fora do dia de hoje.
8. Timetable: horas de 07:00 a 13:00 (Bianca: 13:00 a 19:00); blocos de 45 min com a
   mesma altura; o intervalo das 08:45 às 09:15 aparece como vão rotulado. **Num dia útil
   entre 07:00 e 13:00 (hora do Mac/simulador):** a linha teal fica na hora certa e
   anda 1 minuto depois; o bloco atual tem borda, brilho e o selo `Agora`; os
   anteriores ficam atenuados; o banner diz `Agora: … · até …`. Fora desse horário: sem
   linha, e o banner diz `Próxima aula às 07:15` ou `Aulas encerradas`. Para forçar,
   mude a hora do Mac (o simulator usa a do host).
9. Boletim: os segmentos de ano e trimestre deslizam; abre no 1º tri em 2025 e no 3º em
   2024; o resumo mostra a média `8,2`, `14 faltas`, `12 disciplinas` e `1 abaixo de 7`
   (Rafael 2025 T1: Arte 6,5); as barras enchem da esquerda; Arte em âmbar com
   `Atenção`, o resto em teal com `Bom`; a legenda aparece; o 2º tri mostra
   `Ainda não avaliado`; Joana e Bianca têm a pílula única `Ano letivo 2025 · …`.
10. Perfil: o avatar `GS` com anel rosa; o CPF `***.294.560-**`; Rafael com o selo
    `Atual` e a borda teal; tocar em Joana move o destaque, e o chip das outras abas vira
    `Joana · 2EM`; Sair pede confirmação na mesma linha e Cancelar desfaz.
11. Sem aluno e boot error: ícone em círculo, textos centralizados, botões em pílula.
12. Skeletons com o brilho passando (shimmer). Com "Reduzir movimento", parados.
13. Fonte do sistema no máximo: chips, tab bar, segmentos e botões sem corte (teto 1,3);
    o timetable fica mais alto e os blocos legíveis; os cards de disciplina quebram o
    nome em 2 linhas.
14. Reduzir movimento ligado: nenhum deslize nem mola; só fades curtos; o pager troca
    sem rolar animado; sem pulso no ponto de agora; tudo funciona.
15. VoiceOver: a ordem da seção 6.4; os chips anunciam `selecionado` e `, hoje`; os
    blocos anunciam `, agora`/`, encerrada`; trocar de aluno anuncia `Agora mostrando …`.
16. Performance (N7): no simulator em release, 10 swipes seguidos na Agenda e 10 trocas
    de trimestre sem engasgo visível (Perf Monitor: UI ≥ 55 fps).

---

## 10. Ordem de implementação sugerida (fatias pequenas)

Cada fatia passa sozinha em `lint`, `tsc`, `test` e `maestro:check`, com os flows
afetados atualizados nela mesma.

| # | fatia | entrega | flows tocados |
|---|---|---|---|
| 1 | **Tema v2** | `palette`, `colors`, `borderRadii`, `shadows`, `opacities`, `gradients`, `textVariants`, `sizes`, `motion` (1.1–1.11) e o bloco `legado v1`. Testes de `Text`/`Card` atualizados. | nenhum |
| 2 | **Primitivos** | ícones (2.1), `Avatar` + `initials`, `PillButton`, `useSlidingIndicator`, `Skeleton` com shimmer, `EmptyState`/`ErrorState` v2 (2.16), com teste de componente. Os `PrimaryButton`/`SecondaryButton` ainda existem. | nenhum |
| 3 | **Tab bar flutuante + aba Perfil** | `FloatingTabBar` (2.4), `useFloatingTabBarInset`, `ProfileScreen` + `useProfileViewModel` completos (3.5), `tab-perfil`. O header da v1 ainda existe. | 02 (`tab-perfil`), 08, 10 + subflows `logout` e `select-student` novos |
| 4 | **Header compacto + saída do modal** | `CompactHeader` + `StudentChip` (2.6) nas 3 abas; remove `ActionBar`, `Header`, `SelectStudentScreen` + VM e a rota; `NoStudent` e `BootError` no visual novo (3.6, 3.7). | 02, 07, 09 |
| 5 | **Login** | `TextField` (2.5), banner de erro, `utils/loginLayout`, Login novo (3.2) e a saída da splash ajustada (3.1). Remove `UnderlineInput`/`CpfInput`. | 01 (conferir) |
| 6 | **Agenda: faixa + pager + grade** | `WeekStrip`, pager, `Timetable` **sem** a linha de agora, estado vazio por dia, `AgendaSkeleton` novo, campos novos no VM. Remove `Dropdown` da Agenda e `LessonItem`. | 02, 04 |
| 7 | **Agenda: agora** | `useMinuteClock`, `NowLine`, estados dos blocos, `NowBanner`, rolagem automática; teste com relógio injetado e fake timers (N3). | nenhum |
| 8 | **Boletim** | `SegmentedControl`, `GradeBar`, `TermSummaryCard` + legenda, `SubjectGradeCard`, não avaliado, `gradeBand` + testes, VM sem acordeão. Remove `Dropdown`, `Accordion*`. | 05, 06, 07, 08 |
| 9 | **Polimento + limpeza** | pull-to-refresh nas 3 abas (2.15), a entrada encadeada do App (4.3), `animation: 'shift'`, auditoria de reduzir movimento e fonte grande, remoção do bloco legado, das chaves de `sizes` e das strings que saem, README "v2" com GIFs. | todos (rodada final) |

As fatias 3 e 4 podem trocar de ordem: a 3 primeiro deixa a troca de aluno funcionando
nos dois lugares por uma fatia, e a migração fica mais segura.

---

## Resumo para o usuário (direção visual da v2)

- **Mesma identidade, mais profundidade:** o fundo continua preto, o teal continua sendo
  a cor da ação, e o rosa do selo passa a aparecer (avatar do responsável e alertas).
  Os cards ficam em 3 tons de grafite, com bordas finas e cantos arredondados (14 a 20).
- **Tudo em pílula:** botões, tab bar, segmentos, selos e chips têm cantos totalmente
  redondos. O botão principal tem um brilho teal discreto.
- **Tab bar flutuante** com Agenda, Boletim e Perfil. Uma pílula teal translúcida desliza
  até a aba ativa, e o conteúdo esmaece por trás dela.
- **Header enxuto:** logo menor, "Olá, Gustavo" + título grande e um chip do aluno com
  avatar de iniciais, que leva ao Perfil.
- **Login em card:** campos com ícone, rótulo que flutua, olho para mostrar a senha,
  botão "Entrar" em pílula e erro num aviso rosa. O logo vem da splash direto para o
  lugar dele.
- **Agenda como calendário:** uma faixa com os 7 dias (ponto onde há aula). Um swipe ou
  um toque troca o dia, e o indicador segue o dedo. Embaixo, uma grade por hora com
  blocos proporcionais, intervalo marcado, **linha teal do "agora"** andando a cada
  minuto, a aula atual com brilho e selo "Agora", e as passadas atenuadas.
- **Boletim sem acordeão:** ano e trimestre em segmentos. Um card de resumo com média,
  faltas e "abaixo de 7". Cada disciplina tem nota grande, barra de 0 a 10 colorida
  (Bom / Atenção / Baixo, sempre com o rótulo) e as faltas. Trimestre sem nota mostra
  "Ainda não avaliado".
- **Perfil:** seus dados (nome e CPF mascarado), a lista de alunos com o atual
  destacado (troca com um toque) e Sair com uma confirmação leve na própria linha.
- **Movimento com propósito:** entradas em cascata, molas curtas nos indicadores,
  shimmer nos carregamentos e pull-to-refresh teal. Com "Reduzir movimento", vira fade.
- **Acessível:** contraste AA calculado em todos os pares, cor nunca sozinha, alvos de
  44 e rótulos para o leitor de tela. Sem nenhuma biblioteca nova.

---

## Mensagens

→ developer: o tema inteiro está na seção 1. Os hexadecimais ficam só em `palette.ts`
(inclusive os `rgba` de brilho, sombra e shimmer), e o resto lê `theme.colors`,
`theme.shadows`, `theme.gradients`, `theme.opacities`, `theme.sizes` e `theme.motion`.
Peso só por `fontFamily`. A cor muda por crossfade de duas camadas, nunca por
`interpolateColor` (1.10, regra 1).

→ developer: um hook só para os três indicadores (`useSlidingIndicator`, 2.17). Na
Agenda, o indicador da faixa **não** tem spring próprio: lê o `progress` do
`useAnimatedScrollHandler` do pager (2.7, 2.9). O toque no chip chama `onSelectDay`
**antes** do `scrollToIndex`.

→ developer: a linha de agora não pode re-renderizar a lista a cada minuto. O
`useMinuteClock` escreve um shared value e só faz `setState` quando a fase muda; a marca
`HH:MM` é o único componente que re-renderiza por minuto (2.10). O `now` é injetável no
VM e no hook, para o teste com fake timers (N3).

→ developer: o `boxShadow` é a sombra e o brilho nas duas plataformas (RN 0.88, nova
arquitetura). Não use `elevation`. Toda superfície com brilho tem também a borda como
pista (1.6).

→ developer: `utils/loginLayout.ts` (`loginLogoTop`) é a fonte única da posição do logo,
para o Login e para a saída da splash (3.1, 3.2). Sem `KeyboardAvoidingView` no Login:
`automaticallyAdjustKeyboardInsets` no iOS.

→ developer: utils novos com teste: `initials`, `gradeBand`, `monthYearLabel`,
`weekdayShort`, a média do trimestre (média simples das não nulas, `formatGrade`) e o
cálculo da faixa da grade e da fase do relógio.

→ qa: critérios na seção 9; para a linha de agora, mude a hora do Mac (o simulator usa a
do host) para um dia útil entre 07:00 e 13:00. Rafael 2025 T1 tem a média de referência
8,2 (Arte 6,5 é o único âmbar).

→ chief (usuário): 1. O botão do login passa de "FAZER LOGIN" para **"Entrar"** e os
textos saem da caixa alta (DV2, DV3). Se preferir manter o tom da v1, é só trocar as
strings.

→ chief (usuário): 2. **Sair com confirmação inline** no Perfil (DV7). No NoStudent e no
BootError, sair continua imediato. Se preferir sem confirmação em lugar nenhum, o flow 10
perde um passo.

→ chief (usuário): 3. Faixas de nota com os rótulos **"Bom" (≥ 7), "Atenção" (5 a 6,9) e
"Baixo" (< 5)**, e a marca do 7 na barra. Se a escola usar outra média de aprovação, o
corte é um só lugar (`gradeBand`).

→ chief (usuário): 4. No iPhone SE de 1ª geração (320 pt), os chips de dia ficam com 40 de
largura (o resto da área de toque é 64 de altura). Atende o mínimo do WCAG (24), mas não
os 44 do pedido. A alternativa é rolar a faixa na horizontal nessa largura. Eu preferi os
7 visíveis.

→ chief (usuário): 5. A ilustração PNG do "sem aulas" sai do app e dá lugar a um ícone
SVG num círculo (DV9), porque o PNG é 1× e fica borrado. Se quiser manter a ilustração,
ela volta só no dia sem aulas.

→ chief: o flow **11-perfil-dados** (7.3) é sugestão. Se entrar, o N8 conta 11 flows.
