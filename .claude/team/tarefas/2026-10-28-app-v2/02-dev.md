# 02 — Dev: app v2

## Fatias 1 e 2

- **Trilha:** v2. **Worktree:** `.claude/worktrees/v2`. **Branch:** `v2`, com push para `origin/v2`.
- **Commits:**
  - `daf17fe` feat(mobile): tema v2 com paleta, sombras, degradês e tipografia nova (fatia 1)
  - `b490cf7` fix(mobile): degradês do tema com opacidade por parada (achado no simulador durante a fatia 2)
  - `0af1bf5` feat(mobile): primitivos da v2 (ícones, Avatar, PillButton, shimmer e estados) (fatia 2). É o último commit.

### O que mudou

**Fatia 1: tema (`mobile/src/theme/`)**
- `palette.ts`: a paleta da v2 (§1.1). Os únicos hex e rgba do app. Os `gray*` da v1 mudaram de valor e de nome, como pede o design.
- `shadows.ts` (novo): `shadows` (`glowPrimary`, `glowPrimarySoft`, `floating`) como `BoxShadowValue` e `gradients` (`tabBarFade`, `shimmer`, `loginHalo`).
- `opacities.ts` (novo): `past 0.72`, `pressed`, `busy`, `hidden`.
- `theme.ts`:
  - cores semânticas da §1.2, `xxs: 2`, raios da §1.5 e as `textVariants` da §1.8 (com `fontVariant: ['tabular-nums']` nas numéricas);
  - `buttonVariants` e `cardVariants` da §1.11;
  - `shadows`, `gradients` e `opacities` expostos no tema;
  - blocos `// Legado v1: sai na fatia 9` para as cores, variantes de texto e variantes de card/botão que a v2 não tem.
- `sizes.ts`: as chaves novas e alteradas da §1.9 (`logoHeader` 80 × 13 e `formMaxWidth` 400). As da splash ficam, e as da v1 estão num bloco legado.
- `motion.ts`: as adições da §1.10:
  - `slower`, `emphasized`, `standard`, `spring.{snappy,gentle,pop}`, `pressScaleSmall`, `enterOffsetCard`, `slideOffset`, `stripStagger`, `shimmer`, `nowTick`, `nowPulse`, `popFrom` e `loginLogoScale`;
  - mudanças: `pressScale` passa a 0,97 e `cardStagger` a 50;
  - `splash.exitToLoginEasing` reaproveita o `emphasized`, e `skeleton` (o pulso da v1) foi para o bloco legado.
- Renomes para não quebrar a v1 (uma linha cada):
  - `variant="title"` → `titleV1` em `SelectStudentScreen.tsx`;
  - `label` → `labelV1` em `UnderlineInput.tsx`;
  - `error` → `errorV1` em `LoginErrorMessage.tsx`;
  - `ButtonContainer variant="primary"/"secondary"` → `primaryV1`/`secondaryV1` em `PrimaryButton.tsx`/`SecondaryButton.tsx`.
- Testes:
  - `theme/__tests__/Text.test.tsx` e `Card.test.tsx` reescritos para a v2, cada um com um caso do legado;
  - `theme/__tests__/theme.test.ts` (novo): cores, alfa fora de `colors`, raios, sombras, degradês, opacidades, tamanhos e movimento;
  - `theme/__tests__/palette-only.test.js` (novo, guarda): nenhum hex/rgba em `src/` fora de `palette.ts`;
  - `PrimaryButton.test.tsx` e `CpfInput.test.tsx` passaram a ler o token em vez do hex antigo.

**Fatia 2: primitivos**
- `components/icons/StrokeIcon.tsx` (novo): base dos ícones de traço. Tem viewBox 24, traço `sizes.iconStroke`, pontas redondas, `fill="none"`, tamanho padrão `sizes.iconSmall` e é decorativo.
- `components/icons/{Profile,Lock,IdCard,Eye,EyeOff,Alert,WifiOff,Clock,CalendarOff,Users,Refresh,Check,ChevronRight}Icon.tsx`: os 13 ícones da §2.1 com props `{ color, size? }`. Os pontos do `AlertIcon` e do `WifiOffIcon` são preenchidos na cor do ícone.
- `utils/names.ts`: `initials(first, last)`.
- `components/Avatar.tsx`:
  - círculo com as iniciais nos tamanhos `s`/`m`/`l` e nos tons `student`/`guardian` (anel `accent` de 1,5);
  - escondido do leitor de tela, com `maxFontSizeMultiplier` 1,3.
- `components/PillButton.tsx`:
  - variantes `primary` (com `glowPrimary`), `secondary`, `ghost` e `danger`, mais o desabilitado (`surfaceHigh`/`textDisabled`, sem brilho);
  - tamanhos `md`/`sm`/`xs`, com `hitSlop` até 44;
  - ícone por render function (`(color) => node`) no início ou no fim, e `fullWidth`;
  - carregando: o rótulo fica no layout com opacidade 0 (`instant`), o spinner entra (`fast`), o botão fica `busy` e ignora o toque;
  - toque: escala com mola (sem escala com reduzir movimento), e o ghost esmaece até `opacities.pressed`;
  - testIDs `X`, `X-surface`, `X-label` e `X-loading`.
- `hooks/useSlidingIndicator.ts`:
  - `useSlidingIndicator({ count, itemWidth, gap, index | progress })` devolve `position` e `indicatorStyle`. No modo `index` vai com `spring.snappy`, ou com `set` direto se reduzir movimento estiver ligado. No modo `progress` lê o shared value externo direto, limitado a `[0, count−1]` para o overscroll do pager não levar o indicador para fora;
  - `useActiveLayerStyle(indicator, i)` faz a opacidade por proximidade;
  - as contas ficam em worklets puros (`indicatorTranslateX` e `proximityOpacity`).
- `components/Skeleton.tsx`:
  - `SkeletonGroup` cria um `progress` por tela (`withRepeat(withTiming(1, linear 1200), -1)`) e cancela o loop ao desmontar;
  - `Skeleton` desenha o bloco `surfaceHigh` com `overflow: hidden` e os raios `xs`…`pill`/`round`;
  - dentro de um grupo, uma faixa de 120 com o degradê em SVG anda só em `translateX` (`shimmerTranslateX`);
  - com reduzir movimento não há faixa nem loop, e o bloco fica com opacidade 0,7;
  - fora de um grupo é só o bloco, por isso os `AgendaSkeleton`/`BoletimSkeleton` da v1 continuam pulsando como antes.
- `components/EmptyState.tsx` (v2):
  - props `icon`, `title`, `description?`, `action?`, `tone?` e `testID`;
  - círculo de 64 (`surfaceRaised`, ou `accentMuted` no tom `danger`) com o ícone de 28;
  - entrada em cascata: o ícone em Keyframe de 0,96 → 1 e o resto com `enterDown`. Com reduzir movimento, só fade com `ReduceMotion.Never`;
  - testIDs `X-icon` e `X-description`.
- `components/ErrorState.tsx` (v2):
  - é o `EmptyState tone="danger"` com o `AlertIcon` (o `icon` é opcional), e a ação é um `PillButton secondary sm` "Tentar de novo" com o `RefreshIcon`;
  - mantém as props da v1 (`announce`, `shakeKey`, `retrying` etc.), o anúncio ao leitor e o shake curto.
- Telas (só o necessário para não quebrar, porque a prop `illustration` saiu):
  - `LessonsScreen` usa `icon={CalendarOffIcon}`;
  - `ReportCardScreen` (boletim vazio) usa `icon={ClockIcon}`;
  - `NoStudentScreen` usa `icon={UsersIcon}`;
  - `BootErrorScreen` usa `icon={WifiOffIcon}`.
- `constants/strings.ts`: `common.retry` passa de `TENTAR DE NOVO` para `Tentar de novo` (§5).
- Testes:
  - novos: `icons/__tests__/strokeIcons.test.tsx`, `Avatar.test.tsx`, `PillButton.test.tsx`, `Skeleton.test.tsx` e `hooks/__tests__/useSlidingIndicator.test.tsx`;
  - reescritos: `EmptyState.test.tsx` e `ErrorState.test.tsx`;
  - ajustados: `names.test.ts` (com `initials`), a cor dos blocos (`surfaceHigh`) em `AgendaSkeleton`/`BoletimSkeleton` e `LessonsScreen.test.tsx` (`agenda-empty-icon` no lugar de `-illustration`).

### Decisões
1. **Nomes da v2 que a v1 usava com outro sentido** (`title`, `label`, `error` e `buttonVariants.primary/secondary`): a v2 fica com o nome e a v1 ganha o sufixo `V1` no bloco legado.
   - Com isso, as telas antigas mantêm o visual (o login não ganha rótulo de 13 px, por exemplo).
   - Custou uma linha em 5 arquivos.
   - `body`, `button`, `caption`, `tabLabel`, `surface`, `surfaceRaised` e `round` foram trocados no lugar, como manda a §1.12, e a v1 fica com o visual "misturado" até a fatia de cada tela.
2. **Degradês com opacidade por parada (desvio da §1.1/1.6).** No simulador, o shimmer saiu opaco (preto → branco → preto), porque o `Stop` do react-native-svg ignora o alfa do `rgba` em `stopColor`.
   - `gradients.*` agora é uma lista de `{ color, opacity }`, que vira `stopColor` + `stopOpacity`.
   - `palette.shimmer` e `palette.backgroundClear` saíram, porque ficaram sem uso.
   - O visual é o do design: branco a 7 % no meio e pontas transparentes.
   - O `tabBarFade` já está no mesmo formato para a fatia 3.
   - Há um teste de regressão que lê o alfa que chega ao svg.
3. **Skeleton compatível.** O shimmer vem de um `SkeletonGroup` (contexto com um `progress` só). Fora do grupo, o `Skeleton` é o bloco simples, então os skeletons da v1 não precisaram mudar. A faixa mede um contêiner absoluto interno (`X-track`), para não depender do `onLayout` de quem usa.
4. **`activeLayerStyle(i)` virou o hook `useActiveLayerStyle(indicator, i)`**, porque chamar `useAnimatedStyle` dentro de uma função por item quebra a regra dos hooks. Cada item chama o hook no próprio componente.
5. **Ícone do `EmptyState` é um componente (`ComponentType<IconProps>`)**, porque o círculo decide cor e tamanho. No `PillButton` ficou a render function `(color) => node` da §2.3.
6. **`count` no `useSlidingIndicator`** serve para limitar a posição (overscroll).
7. Os ícones do boletim vazio (`ClockIcon`) e dos estados das telas antigas são provisórios até as fatias 4, 6 e 8 trocarem as telas.

### TDD (falha → sucesso)
- **Tema (fatia 1).** Antes do código, `Text`/`Card`/`theme.test` falhavam: `14 failed, 6 passed` por falta dos tokens, por exemplo `Value 'overline' does not exist in theme['textVariants']` e `TypeError: Cannot read properties of undefined (reading 'glowPrimary')`. Depois do tema: `20 passed`, e com a guarda `21 passed`.
  - O `loginLogoScale` esperado era 0,8 exato e a razão é 0,8007. O teste passou a usar `toBeCloseTo(0.8, 2)`.
  - Guarda da paleta: passa desde o início (o código já estava limpo). Provei que ela pega a regressão acrescentando `'#123456'` ao `Screen.tsx`, o que deu `1 failed` com `components/Screen.tsx` listado. Revertido.
- **`initials`.** Falha: `5 failed`, `TypeError: (0 , _names.initials) is not a function`. Sucesso: `9 passed`.
- **`useSlidingIndicator`.** Falha: `Cannot find module '../useSlidingIndicator'`. Sucesso: `11 passed`. A 1ª versão chamava a mola na montagem, e o caso "começa no índice, sem animar" pegou isso antes de passar. Corrigi com um ref do alvo anterior.
- **Ícones.** Falha: `Cannot find module '../AlertIcon'`. Depois de implementar: `1 failed, 28 passed`. O erro era do teste: o filtro de "ponto preenchido" contava os círculos que herdam `fill`, e passou a olhar o `propList`. Sucesso: `29 passed`.
- **`Avatar`.** Falha: `Cannot find module '../Avatar'`. Depois de implementar, `4 failed` por "Unable to find testID avatar": o avatar é escondido do leitor, e as consultas passaram a usar `includeHiddenElements`. Sucesso: `4 passed`.
- **`PillButton`.** Falha: `Cannot find module '../PillButton'`. Sucesso: `12 passed`. Mutação: com o brilho invertido (`variant !== 'primary'`), deu `2 failed` (primário e secundário). Revertido: `12 passed`.
- **`Skeleton`.** Falha: `6 failed` (`Element type is invalid … undefined`, sem `SkeletonGroup`; e o bloco em `#141414`).
  - O caso do `translateX` depois do `layout` não dá para provar com o mock do Reanimated, porque o estilo é calculado só no render. A conta foi para `shimmerTranslateX`: falha `TypeError: … shimmerTranslateX is not a function`, depois passa. Sucesso: `7 passed`.
  - Regressão do degradê: `theme.test` falhou (`1 failed`) com o formato `{color, opacity}` antes da troca e passou depois.
  - No `Skeleton.test`, o caso "alfa chega ao svg" passa com o código atual. Com a mutação "sem `stopOpacity`" deu `1 failed` (alfas `[255,255,255]` em vez de `[0,18,0]`). Revertido: `8 passed`.
- **`EmptyState`.** Falha: `7 failed` (`Unable to find … vazio-icon`, `… text: Ação`). Sucesso: `7 passed`.
- **`ErrorState`.** Falha: `4 failed` (texto "Tentar de novo", `boot-error-icon`, ícone custom, pílula de 44). Sucesso: `10 passed`.
- **Testes de tela afetados.** `LessonsScreen.test` falhou em `agenda-empty-illustration`, e o caso foi atualizado para `agenda-empty-icon`. Os de `AgendaSkeleton`/`BoletimSkeleton` passaram a esperar `surfaceHigh`.

### Verificação final (`cd mobile`, depois do último commit de código)
```
yarn lint            → sem saída (0 erros, 0 avisos)
yarn tsc             → sem saída
yarn format:check    → All matched files use Prettier code style!
yarn maestro:check   → Flows do Maestro ok: 14 arquivos, 90 ids conferidos.
yarn test            → Test Suites: 70 passed, 70 total · Tests: 530 passed, 530 total
```
A base (release/v1) tinha 63 suítes e 440 testes, todos verdes.

### Simulador (evidência)
- iPhone 16 `1E7DEFC7-…`, com o app Debug que já estava instalado (não houve mudança nativa nem rebuild).
- Metro do worktree na **8092**, com `RCT_jsLocation localhost:8092`. O Metro antigo da 8081 (PID 35131) não foi tocado.
- Uma tela de demonstração temporária (`src/__demo__/Demo.tsx`, um `components/icons/index.ts` e o `index.js` trocado) **não foi commitada** e foi apagada. No fim, o Metro da 8092 foi parado e a chave `RCT_jsLocation` removida (`defaults read` → "does not exist").
- `evidencias/fatia-1-2-primitivos.png`: ícones, avatares (aluno s/m e responsável l com anel rosa), as pílulas (primária com brilho, carregando, desabilitada, secundária com ícone, perigo, ghost) e o segmento com `useSlidingIndicator`.
- `evidencias/fatia-1-2-estados.png`: skeleton com o shimmer (depois da correção do degradê), o `EmptyState` num card `surface` e o `ErrorState` em tom de perigo.

### Como o qa testa
- Nada novo para testar por fluxo: nesta fatia nenhuma tela foi redesenhada. O app roda como antes:
  ```
  cd api && YARN_IGNORE_PATH=1 yarn build && YARN_IGNORE_PATH=1 node dist/main   # porta 3333
  cd mobile && yarn install && yarn start
  yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
  ```
- Contas: Gustavo `969.294.560-04` / `123456`, Adelaide `508.795.670-07` / `987654` e o responsável sem aluno do seed.
- O que muda visualmente nas telas da v1, como esperado (§1.12 diz que o visual fica "misturado" até cada fatia):
  - superfícies mais escuras (`#141414`/`#1E1E1E`);
  - raio `m` 14;
  - `body` 15/22;
  - botão e rótulos de aba sem caixa alta;
  - logo do header 80 × 13;
  - card do login até 400 de largura;
  - skeleton em `surfaceHigh`;
  - estados vazio e de erro com ícone num círculo;
  - "Tentar de novo".
- Para conferir: domingo na Agenda (`agenda-empty` com o calendário cortado), o NoStudent e o BootError (sem API).

### Migrations, envs, mudanças nativas, o que não deu para verificar
- Sem migration, sem env nova, sem dependência nova e sem mudança nativa (`react-native-svg` e `reanimated` já existiam). O `runtimeVersion` não muda.
- Não verificado nesta máquina:
  - **Android**: sem JDK. Fica para o CI conferir o `boxShadow` (Android ≥ 9) e o `fontVariant: tabular-nums` com a fonte embutida;
  - **Maestro**: só o `maestro:check` estático rodou;
  - Docker não se aplica.
- Não coberto por teste de unidade (o mock do Reanimated não anima): a mola real do indicador e o andar do shimmer. Os dois foram vistos no simulador.
- Também sem teste específico: o esmaecimento do ghost pressionado e a ausência de escala com reduzir movimento no `PillButton`.

**Status: PRONTO COM RESSALVAS**
1. Desvio do design nos degradês: `{color, opacity}` por parada, e a paleta perde `shimmer`/`backgroundClear` em rgba (motivo e prova acima).
2. Arquivos de tela tocados além do zero do brief, para não quebrar: 5 renomes `V1` e 4 telas passando o ícone do `EmptyState`/`ErrorState`.
3. `common.retry` mudou de texto nesta fatia.
4. Android e Maestro não verificados localmente.

## Mensagens

→ chief: fatias 1 e 2 prontas na `v2` (`daf17fe`, `b490cf7`, `0af1bf5`, com push). Nenhuma dependência nem mudança nativa. Suíte com 530 testes verdes, e lint, tsc, format e maestro:check limpos.

→ chief / designer: o `Stop` do react-native-svg descarta o alfa de `rgba(...)` no `stopColor`; no simulador o shimmer saiu opaco. Os `gradients` do tema agora são paradas `{ color, opacity }`, e `palette.shimmer`/`palette.backgroundClear` saíram. Vale também para o `tabBarFade` da fatia 3 e para o `loginHalo` da fatia 5, que já usa opacidade separada. Se o designer quiser manter os rgba na paleta para documentar, eles teriam que ficar sem uso.

→ chief: para quem faz as próximas fatias:
- os nomes legados com sufixo são `titleV1`, `labelV1`, `errorV1`, `primaryV1` e `secondaryV1`;
- o skeleton novo exige envolver os blocos num `SkeletonGroup`;
- o indicador usa `useSlidingIndicator` + `useActiveLayerStyle(indicator, i)` dentro de cada item.

→ chief: o `no-classroom.png` não é mais importado por nenhum arquivo, então já saiu do bundle. O arquivo continua no repositório, como pede a §1.12.

## Fatia 3

- **Trilha:** v2. **Worktree:** `.claude/worktrees/v2`. **Branch:** `v2` (BASE `0af1bf5`). **Sem push.**
- **Commits:**
  - `3ccfd1c` refactor(mobile): entrada do ícone do EmptyState com mola e pressedOpacity no legado (sugestões do review 1–2)
  - `a71cbe6` feat(mobile): tab bar flutuante e aba Perfil com troca de aluno e sair
  - `dbecb4f` test(mobile): flows do Maestro com a aba Perfil. É o último commit.

### O que mudou
- `components/FloatingTabBar.tsx` (novo, 2.4): cápsula `Card floating` (64, raio pill, `borderStrong`, sombra `floating`) dentro de um contêiner absoluto com `paddingHorizontal` `m` (`s` no compact) e `marginBottom = max(inset − s, m)`; degradê `tabBarFade` em SVG atrás (`pointerEvents="none"`); indicador `primaryMuted` + `glowPrimarySoft` via `useSlidingIndicator` (largura do item − 2 × inset, largura do item pelo `onLayout`); camadas `textSecondary`/`primary` por proximidade (`useActiveLayerStyle` e o complemento); pop do ícone (sem pop com reduzir movimento); a11y `tablist`/`tab` + `selected`; testIDs `tab-bar-container`, `tab-bar`, `tab-bar-fade`, `tab-bar-items`, `tab-bar-indicator`, `tab-*-active-layer`/`-inactive-layer`.
- `components/TabBar.tsx` e o teste dele: removidos (substituídos).
- `hooks/useFloatingTabBarInset.ts` (novo): `floatingTabBarBottom(inset, spacing)` e `useFloatingTabBarInset()` = 64 + distância da borda + `m`.
- `components/Header.tsx`: prop `contentInsetBottom` (padding de baixo + `scrollIndicatorInsets`) e testID `header-scroll`. `features/header/AppHeader.tsx` passa o inset (Agenda e Boletim). O NoStudent não passa (não tem tab bar).
- `features/profile/useProfileViewModel.ts` (novo): `guardian`, `students` (com `selected`), `canSwitch`, `onSelectStudent` (troca no store na hora, anuncia `Agora mostrando …`, ignora o atual e id de fora, desfaz a confirmação), `confirmingLogout`/`onAskLogout`/`onCancelLogout`/`onConfirmLogout` (o `useLogout` existente), `loggingOut`, `refreshing`/`onRefresh` (refetch do `/me`). Recebe `{ focused }`: blur desfaz a confirmação.
- `features/profile/components/StudentRow.tsx` (novo): linha de 72 com `Avatar m`, nome, `turma · RM · período`; atual com selo `Atual` (`-current`) e camada de borda `primary` + `glowPrimary` (`-highlight`, crossfade `base`/`fast`); outro com rádio de 22 (`-radio`); troca com escala 0,98 → 1 na mola `pop` (sem escala com reduzir movimento); selo entra com `popFrom` + mola `pop` só depois de uma troca; 1 aluno: role `text`, sem rádio e sem dica.
- `features/profile/components/LogoutRow.tsx` (novo): linha de 56 "Sair da conta" ↔ "Sair deste aparelho?" + `Cancelar` (secondary xs) + `Sair` (danger xs, loading) em crossfade `base`; foco do leitor vai para Cancelar e volta para "Sair da conta"; no compact a pergunta some e os botões dividem a largura.
- `features/profile/ProfileScreen.tsx` (novo): título `Perfil` (`profile-title`), card do responsável (um elemento para o leitor: `Gustavo da Silva, responsável. CPF ***.294.560-**`), `Alunos` + dica (só com 2+), linhas, `Conta` + Sair; entrada em cascata (FadeInDown de 12, `cardStagger`, fade com reduzir movimento); `RefreshControl` teal; padding de baixo do inset.
- `navigation/AppTabs.tsx`: `FloatingTabBar`, aba `Perfil` (`ProfileIcon`, `tab-perfil`), `backBehavior="firstRoute"`. `navigation/types.ts`: `Perfil: undefined`.
- `components/PillButton.tsx`: aceita `ref` (vai para o `Pressable`).
- `components/EmptyState.tsx`: ícone entra com opacidade em `base` e escala `popFrom` → 1 na mola `spring.gentle` (função de layout animation, §4.7).
- `theme/motion.ts`: `pressedOpacity` no bloco legado; sai `illustrationScaleFrom` (sem uso); novo `rowSelectFrom: 0.98`. `theme/sizes.ts`: `profile { studentRow 72, logoutRow 56, radio 22, radioBorder 1.5, currentBadge 28, currentBadgeIcon 16 }`.
- `constants/strings.ts`: `tabs` em caixa normal + `perfil`; bloco `profile` da §5 (+ `guardianAccessibilityLabel` e `loggingOutAccessibilityLabel: 'Saindo…'`).
- Maestro: `subflows/select-student.yaml` e `subflows/logout.yaml` pelo Perfil; 02 (`tab-perfil`), 04 e 07 (tocam na aba depois do select-student), 08 (Bianca atual, sem dica), 10 (comentário); `README.md` dos flows.
- Testes novos: `FloatingTabBar.test`, `useFloatingTabBarInset.test`, `useProfileViewModel.test`, `StudentRow.test`, `LogoutRow.test`, `ProfileScreen.test`; casos novos em `Header.test`, `LessonsScreen.test`, `PillButton.test`, `theme.test`, `EmptyState.test` e 3 de integração no `App.test`.

### Decisões
1. **Perfil sem o CompactHeader nesta fatia.** A §3.5 desenha logo + saudação no topo, mas isso é o `CompactHeader` da fatia 4. Aqui o Perfil tem só o título `Perfil` (headline); o header da v1 continua nas outras abas, como pede a tarefa.
2. **Maestro confere a linha pelo estado `selected`, não pelo `-current`** (desvio da §7.2/7.3). A linha é um elemento acessível só; no iOS o XCUITest não expõe os filhos dele (mesmo motivo do `-result` do boletim na v1). `extendedWaitUntil: { id: profile-student-${RM}, selected: true }` vale nas duas plataformas. O testID `-current` existe e é usado nos testes de componente.
3. **`useProfileViewModel({ focused })`**: a tela passa `useIsFocused()`; assim o blur que desfaz a confirmação fica testável sem navegação.
4. **Animação do selo/rádio só depois de uma troca**, derivada no render (padrão do `Header` da v1). A 1ª versão usava um ref setado no efeito e não animava a 1ª troca; o teste "o selo anima já na 1ª troca" pegou (RED abaixo).
5. **Crossfade da linha de Sair por montagem** (`entering`/`exiting` com `ReduceMotion.Never`) em camadas absolutas numa caixa de 56: o leitor só vê a camada atual, sem esconder manualmente a outra.
6. **Compact por `useWindowDimensions().width < breakpoints.phone`**: o `useResponsiveProp` do Restyle não aceita booleanos.
7. **Rótulos das abas em caixa normal** (`Agenda`/`Boletim`/`Perfil`, §5), já que a tab bar é nova.

### TDD (falha → sucesso)
- **EmptyState** (sugestão do review): RED `Expected: "function" / Received: "object"` (ainda era `Keyframe`); GREEN `17 passed` (EmptyState + ErrorState).
- **useFloatingTabBarInset**: RED `Cannot find module '../useFloatingTabBarInset'`; GREEN `5 passed`.
- **FloatingTabBar**: RED `Cannot find module '../FloatingTabBar'`; GREEN `12 passed`. Mutação: camada inativa com `proximityOpacity` sem o `1 −` → `1 failed`; revertido.
- **Header inset**: RED `Unable to find an element with testID: header-scroll` (2 casos); GREEN `9 passed`. Ligação do `AppHeader`: caso no `LessonsScreen.test` falha sem a prop (`Received: [{"flexGrow": 1}, {"paddingBottom": 0}]`) e passa com ela (`8 passed`).
- **useProfileViewModel**: RED `Cannot find module '../useProfileViewModel'`; depois de implementar, `2 failed` com `Received number of calls: 2` no `announceForAccessibility`: era o teste (o preset do RN já mocka o `AccessibilityInfo`, o `spyOn` devolve o mesmo `jest.fn` e as chamadas vazavam entre testes; agora `mockClear` no `beforeEach` e as funções do store restauradas em `act`). GREEN `16 passed`. Mutação no efeito de blur → `1 failed` (`sair da aba (blur) desfaz a confirmação`); revertido.
- **PillButton `ref`**: RED `Received: null`; GREEN `13 passed`; sem o `ref={ref}` volta a falhar.
- **Tokens do Perfil** (`theme.test`): RED `1 failed`; GREEN `22 passed`.
- **StudentRow**: RED `Cannot find module '../components/StudentRow'`; GREEN `10 passed`. Regressão do selo na 1ª troca: RED `Expected: "function" / Received: "undefined"`; GREEN `12 passed`.
- **LogoutRow**: RED `Cannot find module '../components/LogoutRow'`; GREEN `6 passed`.
- **ProfileScreen**: RED `Cannot find module '../ProfileScreen'`; GREEN `8 passed`.
- **App (integração)**: RED `3 failed` (tab bar com Perfil, troca no Perfil atualiza a Agenda, Sair no Perfil volta ao Login); GREEN `16 passed`.
- **maestro:check**: com `profile-logout-confirmar` no subflow → `id "profile-logout-confirmar" não existe em src/`; corrigido → ok.

### Verificação final (`cd mobile`, HEAD `dbecb4f`, árvore limpa)
```
yarn lint            → sem saída (0 erros, 0 avisos)
yarn tsc             → sem saída
yarn format:check    → All matched files use Prettier code style!
yarn maestro:check   → Flows do Maestro ok: 14 arquivos, 100 ids conferidos.
yarn test            → Test Suites: 75 passed, 75 total · Tests: 593 passed, 593 total
```
(Base da fatia: 70 suítes, 530 testes. Saiu o `TabBar.test`; entraram 6 suítes.)

### Simulador (evidência)
- iPhone 16 `1E7DEFC7-…`, app Debug já instalado (sem mudança nativa, sem rebuild, sem `pod install`). Metro do worktree na **8093** com `RCT_jsLocation`; o Metro da 8081 (PID 35131) não foi tocado. API da raiz (`release/v1`) na 3333 com `DATABASE_URL=file:./v2dev.db` e `JWT_SECRET` gerado (o `api/.env` não existia; foi criado e é ignorado pelo git, assim como o `v2dev.db`), `prisma:setup` + `build` + `node dist/main`.
- **Toques:** esta máquina não deixa postar eventos de toque (`AXIsProcessTrusted() = false`, o `osascript` do System Events dá timeout) e não há idb/Maestro. O vídeo foi feito com um roteiro **temporário, não commitado** (`src/__demo__/autoplay.ts` + `ref` no `NavigationContainer` + `globalThis.__profileVm = vm` no Perfil + `require` no `index.js`): ele loga o Gustavo pela API real, navega entre as abas pelo ref de navegação e chama os handlers reais do ViewModel do Perfil (`onSelectStudent`, `onAskLogout`, `onCancelLogout`, `onConfirmLogout`). Ou seja, o vídeo mostra o código real reagindo, mas o feedback de toque (escala ao pressionar) não aparece. Tudo revertido (`git status` limpo).
- `evidencias/fatia-3.mp4` (39 s): Agenda → Boletim → Perfil → Agenda → Perfil com o indicador deslizando; troca para a Joana na linha (selo e destaque trocam de linha), Agenda já com a Joana no header; volta ao Rafael; Sair → confirmação → Cancelar → Sair → confirmação → Login.
- Prints: `fatia-3-tab-bar-agenda.png`, `fatia-3-tab-bar-boletim.png`, `fatia-3-perfil.png`, `fatia-3-perfil-troca-inline.png`, `fatia-3-agenda-aluno-novo.png`, `fatia-3-perfil-sair-confirmacao.png`.
- No fim: Metro da 8093 e API parados, `RCT_jsLocation` removida (`defaults read` → "does not exist").

### Como o qa testa
```
cd api && YARN_IGNORE_PATH=1 yarn prisma:setup && YARN_IGNORE_PATH=1 yarn build && node dist/main   # 3333
cd mobile && yarn start
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
```
- Gustavo `969.294.560-04` / `123456` (Rafael 12567 e Joana 12568): 3 abas na cápsula, o indicador desliza; no Perfil, nome, `***.294.560-**`, dica, Rafael "Atual"; tocar na Joana troca na hora, sem sair do Perfil; a Agenda e o Boletim mostram a Joana. Sair → "Sair deste aparelho?" → Cancelar volta; Sair → Login. Trocar de aba com a confirmação aberta desfaz a confirmação.
- Adelaide `508.795.670-07` / `987654` (Bianca 13752): linha única como "Atual", sem rádio, sem dica e sem toque.
- Responsável sem aluno (Carlos `314.159.265-90` / `111111`): NoStudent da v1, sem tab bar (igual).
- Conferir: último item da Agenda/Boletim/Perfil fica acima da barra; VoiceOver lê o card do responsável num elemento e move o foco para Cancelar; reduzir movimento: sem pop/escala, indicador vai direto.

### Migrations, envs, nativo, o que não deu para verificar
- Sem migration, env nova, dependência nova ou mudança nativa. `runtimeVersion` não muda.
- Não verificado aqui: **Android** (sem JDK; `boxShadow` da cápsula e do indicador no CI), **Maestro** real (só `maestro:check`; o uso de `selected: true` no seletor só se prova rodando), toque real no simulador (ver acima), layout compact (320) da linha de Sair (sem teste de unidade; a regra está no código), e o crossfade de cor dos itens com reduzir movimento (o indicador vai direto, então a cor troca na hora em vez do crossfade `fast` da §4.1).

**Status: PRONTO COM RESSALVAS**
1. Perfil sem logo/saudação no topo até o `CompactHeader` da fatia 4 (só o título).
2. Maestro usa `selected: true` na linha em vez do `-current` (motivo acima); falta rodar de verdade.
3. Com reduzir movimento, a cor dos itens da tab bar troca na hora (sem o crossfade `fast`).
4. Vídeo feito com roteiro temporário que chama os handlers reais (sem toque físico).
5. Android, Maestro e compact (320) não verificados localmente.

## Mensagens

→ chief: fatia 3 pronta na `v2` (`3ccfd1c`, `a71cbe6`, `dbecb4f`), sem push. 593 testes verdes; lint, tsc, format e maestro:check limpos. Nenhuma dependência nem mudança nativa. As duas sugestões do review das fatias 1–2 entraram no `3ccfd1c`.

→ chief / designer: (1) a §7.2 pede `profile-student-${RM}-current` no Maestro, mas o selo fica dentro de um elemento acessível e não aparece no XCUITest; usei `selected: true` na linha. Se preferirem o id do selo, ele teria de sair do elemento acessível (e o leitor leria "Atual" separado). (2) Com reduzir movimento, a cor dos itens da tab bar segue o indicador, que vai direto; o crossfade `fast` da §4.1 exigiria uma animação de opacidade separada do indicador. Digam se vale.

→ chief: esta máquina não permite postar toques (sem permissão de acessibilidade para o terminal); para o QA tocar de verdade no simulador, alguém precisa conceder Acessibilidade ao terminal ou instalar o Maestro.

→ developer da fatia 4: o Perfil está sem header (só `profile-title`); o `CompactHeader` entra nele sem chip (§3.5). `useFloatingTabBarInset` já está no Header da v1 via `AppHeader`; quando o Header sair, o padding precisa ir para a rolagem nova. O subflow `select-student` não volta à aba de antes.

→ chief: criei `api/.env` (não existia) com `JWT_SECRET` aleatório e `DATABASE_URL=file:./v2dev.db`, mais o `api/v2dev.db`; os dois são ignorados pelo git e ficaram no disco.

## Fatia 4

- **Trilha:** v2. **Worktree:** `.claude/worktrees/v2`. **Branch:** `v2` (BASE `dbecb4f`). **Sem push.**
- **Commits:**
  - `cfd135b` fix(mobile): aluno atual sem toque, fade do selo com reduzir movimento e contexto no Sair compacto (as 3 sugestões do review da fatia 3)
  - `d1ce86f` feat(mobile): header compacto com chip do aluno e fim do modal de troca
  - `0b9aa47` test(mobile): flows do Maestro com o chip do header e o NoStudent novo. É o último commit.

### O que mudou
- `components/StudentChip.tsx` (novo, 2.6): pílula de 40 (`surfaceRaised`, borda `borderSubtle`, `maxWidth` 200, `hitSlop` 2) com `Avatar s`, `Rafael · 7EF` (`header-student-name` / `header-student-class`, nome com reticências) e `ChevronRightIcon` 16 em `textTertiary`. Role `button`, rótulo da v1 (`Aluno Rafael, turma 7EF, RM 12567, período Matutino`), hint `Abre o perfil`. Toque com `pressScaleSmall` (sem escala com reduzir movimento). Trocar de aluno faz crossfade do conteúdo (`key` pelo id, `FadeIn(base)`/`FadeOut(fast)` com `ReduceMotion.Never`); o 1º aluno entra com o header.
- `components/CompactHeader.tsx` (novo, 2.6): linha do logo de 56 (logo 80 × 13, role `image`) + chip; saudação `Olá, Gustavo` (`label`, role `header`) e título `headline` (role `header`, testID por tela); divisória hairline `borderSubtle` com `opacity = clamp(scrollY / m, 0, 1)` na UI thread. Props `showChip` (Perfil) e sem `guardianFirstName` (BootError). Entrada 4.3: logo em `FadeIn(base)`, saudação + título `FadeInDown` 8 um `stagger` depois; com reduzir movimento, `FadeIn(fast)` sem atraso.
- `features/header/TabScreenLayout.tsx` (novo): header compacto ligado à sessão (`useHeaderViewModel(useNavigation())`) + `Animated.ScrollView` (padding de baixo e `scrollIndicatorInsets` do `useFloatingTabBarInset`, `onScroll` → `scrollY`, `scrollEventThrottle` 16, `refreshControl` opcional).
- `features/header/useHeaderViewModel.ts`: agora só `guardianFirstName`, `student` (com `lastName`, para as iniciais) e `onPressStudent` → `navigate('Perfil')` (também com 1 aluno). Saem `canSwitchStudent`, `onSwitchStudent`, `onLogout`, `logoutDisabled`.
- `LessonsScreen`, `ReportCardScreen`: `TabScreenLayout` no lugar de `AppHeader` + `SectionTitle`; títulos `Agenda`/`Boletim` em caixa normal; rolagens `agenda-scroll`/`boletim-scroll`. O conteúdo da v1 (dropdown, lista, acordeão) fica até as fatias 6–8.
- `ProfileScreen`: `TabScreenLayout` com `showChip={false}` (logo + `Olá, Gustavo` + `Perfil`), mesma rolagem `profile-scroll` com o `RefreshControl`; o conteúdo ganhou `paddingHorizontal m` num `Box`.
- `NoStudentScreen` (3.6): `CompactHeader` (sem chip, `Olá, Carlos`, `Sua conta` em `no-student-title`) + `EmptyState` neutro com `UsersIcon` centralizado na sobra (`no-student-body`) e `PillButton secondary sm` `Sair` com ícone (`no-student-logout-button`), imediato.
- `BootErrorScreen` (3.7): `CompactHeader` só com o logo e `Sem conexão` (`boot-error-title`); `ErrorState` com `WifiOffIcon`, `Tentar de novo` em `PillButton primary md` e `Sair` `ghost sm` embaixo (`boot-error-logout-button`), centralizados (`boot-error-body`).
- `components/ErrorState.tsx`: props `retryVariant` (`secondary` padrão → sm; `primary` → md) e `secondaryAction`; as ações ficam numa coluna `${testID}-actions`.
- **Removidos:** `ActionBar`, `Header` (+ teste), `features/header/AppHeader`, `SelectStudentScreen` + `useSelectStudentViewModel` (+ 2 testes), a rota `SelectStudent` (`RootStack`, `RootStackParamList`), e os que ficaram sem uso por isso: `StudentCard` (+ teste) e `SectionTitle` (+ teste). Não há config de `linking`/deep link no app; o único `navigate('SelectStudent')` era o do header.
- `constants/strings.ts`: `header.greeting(nome)`, `header.studentChipSeparator`, `header.studentHint`, `noStudent.screenTitle`/`logout`, `boot.screenTitle`/`logout`, `profile.logoutInContext`; `agenda.title`/`boletim.title` em caixa normal. Saem `header.greetingAccessibilityLabel`, `header.switchStudent*`, `header.logout*`, `selectStudent.*`, `common.studentInfo`, `agenda/boletim.titleAccessibilityLabel`.
- `theme/sizes.ts`: `studentChip.chevron: 16`. `theme/motion.ts`: sai `selectStudentBackDelay`.
- Sugestões do review da fatia 3: `StudentRow` com `disabled={!pressable || selected}` e role `button` só quando trocável (sem dica e sem escala no atual); `FadeIn` do selo e do rádio com `ReduceMotion.Never`; `LogoutRow` no compact com `Sair deste aparelho? Cancelar` / `Sair deste aparelho? Sair` como rótulo acessível dos botões.
- Maestro: 02 (chip com `(?i)aluno (rafael|joana),.*` no lugar de TROCAR PERFIL/SAIR; título `Agenda`), 07 (reescrito: Boletim → **toca no chip** → `profile-screen` → Joana → Boletim `2EM` e chip `aluno joana`), 08 (chip `aluno bianca`; saem os `header-switch-student-button`/`header-logout-button`), 09 (`no-student-title` `Sua conta`, `assertNotVisible header-student-chip`, e agora toca em `no-student-logout-button` e espera o Login); `README.md` dos flows.

### Decisões
1. **`TabScreenLayout` em `features/header/`** em vez de cada aba montar header + rolagem: as 3 abas repetiam o mesmo padding da tab bar e a ligação `scrollY` → divisória. Na Agenda das fatias 6/7 (pager), dá para usar o `CompactHeader` direto, sem o layout.
2. **Removi também `StudentCard` e `SectionTitle`**: só eram usados pelo modal e pelos títulos que saíram. Os tokens legados do tema (`sectionTitle`, `greeting`, `greetingName`, `sizes.actionBar`/`studentCard`/`logoutIcon`, `cardVariants.studentCard`) ficaram para a limpeza da fatia 9, como o plano pede (o `Text.test` ainda prende o `sectionTitle`).
3. **`ErrorState` com `retryVariant` + `secondaryAction`** em vez de o BootError remontar o estado à mão: o anúncio ao leitor e o shake do retry continuam num lugar só.
4. **A linha do aluno atual fica `disabled`** (pedido do review). Efeito colateral: o VoiceOver pode ler "esmaecido" junto de "selecionado", como já acontecia com 1 aluno. Se o designer preferir só sem papel de botão, basta tirar o `disabled` e manter o `onPress` ignorado.
5. **Contexto do Sair só no compact**, como pedido: na tela larga a pergunta é um elemento visível antes de Cancelar.
6. **Entrada do header a cada montagem de aba** (Boletim e Perfil montam sob demanda, então o header deles faz a entrada na 1ª visita). A §4.3 quer a do header só uma vez por `AppTabs`; isso é a "entrada encadeada" da fatia 9.

### TDD (falha → sucesso)
- **StudentRow (review)**: RED `2 failed` — `aluno atual com troca possível: sem papel de botão…` (`Expected instance to have prop` `accessibilityRole: text`) e `com reduzir movimento: o selo e o rádio ainda entram em fade` (`reduceMotion: 'never'` ausente). GREEN `profile: 44 passed`.
- **LogoutRow compact**: RED `Expected accessible name: Sair deste aparelho? Cancelar / Received: Cancelar`; GREEN `46 passed` (pasta `profile`).
- **StudentChip**: RED `Cannot find module '../StudentChip'`; GREEN `6 passed`.
- **CompactHeader**: RED `Cannot find module '../CompactHeader'`; GREEN `9 passed`.
- **useHeaderViewModel**: RED `3 failed` (sem `lastName` no aluno; `onPressStudent is not a function`); GREEN `4 passed`.
- **TabScreenLayout**: RED `Cannot find module '../TabScreenLayout'`; GREEN `5 passed`.
- **Lessons/ReportCard/Profile screens**: a 1ª rodada falhou pelo motivo errado (`greetingAccessibilityLabel is not a function`, a string que eu já tinha trocado, no `Header` velho). Com essa string reposta temporariamente, o RED certo: `Unable to find an element with testID: agenda-scroll` e `Expected text content: Agenda / Boletim` (`3 failed`); o Perfil falhou em `header-greeting` e no `contentContainerStyle` em array (`2 failed`). GREEN `27 passed`.
- **ErrorState**: RED `2 failed` (pílula `md` primária; `Unable to find … acao-secundaria`); GREEN `19 passed` (Empty + Error).
- **NoStudentScreen**: RED certo (com o mesmo ajuste temporário) `Unable to find … no-student-title / no-student-body / no-student-logout-button` (`3 failed`); GREEN `3 passed`.
- **BootErrorScreen**: RED `Unable to find … boot-error-title / boot-error-body / boot-error-logout-button` (`3 failed`); GREEN `3 passed`.
- **App.test (integração)**: reescritos depois da implementação (não houve RED próprio): chip → Perfil, chip no Boletim → Perfil → troca → Boletim com a Marina, 1 aluna com chip → Perfil, NoStudent com `no-student-logout-button`, e um novo "BootError: Sair funciona sem API". `16 passed`.

### Verificação final (`cd mobile`, HEAD `0b9aa47`, árvore limpa)
```
yarn lint            → sem erros nem avisos
yarn tsc             → sem saída
yarn format:check    → All matched files use Prettier code style!
yarn maestro:check   → Flows do Maestro ok: 14 arquivos, 102 ids conferidos.
yarn test            → Test Suites: 75 passed, 75 total · Tests: 601 passed, 601 total
```
(Base da fatia: 75 suítes, 593 testes. Saíram 5 suítes — Header, StudentCard, SectionTitle, SelectStudentScreen, useSelectStudentViewModel — e entraram 5: StudentChip, CompactHeader, TabScreenLayout, NoStudentScreen, BootErrorScreen.)

### Simulador (evidência)
- iPhone 16 `1E7DEFC7-…`, app Debug já instalado (sem mudança nativa, sem rebuild). Metro do worktree na **8094** com `RCT_jsLocation`; o Metro da 8081 (PID 35131) não foi tocado. API da raiz (`YARN_IGNORE_PATH=1 yarn build && node dist/main`, 3333, `v2dev.db`), sem reset.
- Sem toque físico (mesma limitação da fatia 3). Roteiro **temporário, não commitado** (`src/__demo__/autoplay.ts`, `ref` no `NavigationContainer`, `require` no `index.js` e `globalThis.__chipPress = onPress` no `StudentChip`): loga pela API real, navega para o Boletim pelo ref e chama o `onPress` real do chip do Boletim. Tudo revertido (`git status` limpo).
- `evidencias/fatia-4-agenda.png`: header compacto na Agenda (logo, chip `RS Rafael · 7EF ›`, `Olá, Gustavo`, `Agenda`).
- `evidencias/fatia-4-boletim.png`: o mesmo header no Boletim.
- `evidencias/fatia-4-chip-perfil.png`: o chip do Boletim levou à aba Perfil (Perfil com logo e saudação, sem chip; tab Perfil ativa).
- `evidencias/fatia-4-sem-aluno.png`: Carlos `314.159.265-90` — `Olá, Carlos`, `Sua conta`, estado vazio centralizado e a pílula `Sair`, sem tab bar.
- `evidencias/fatia-4-boot-error.png`: API parada com o token do Carlos salvo — `Sem conexão`, ícone de wifi cortado em rosa, `Tentar de novo` primário com brilho e `Sair` ghost embaixo. O aviso "Open debugger to view warnings" embaixo é o LogBox do Debug (aviso de rede esperado), não é da tela.
- No fim: Metro da 8094 e API parados, `RCT_jsLocation` removida (`defaults read` → "does not exist").
- Não registrei a divisória do header acesa com rolagem (precisaria de gesto); está coberta no teste de componente.

### Como o qa testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && node dist/main   # 3333
cd mobile && yarn start
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
```
- Gustavo `969.294.560-04` / `123456`: Agenda e Boletim com o chip `Rafael · 7EF`; tocar no chip abre o Perfil (sem chip lá). Trocar para a Joana no Perfil → o chip das abas vira `Joana · 2EM` com crossfade. Rolar a Agenda: a divisória embaixo do título aparece. Não existe mais TROCAR PERFIL, SAIR no header nem o modal de seleção.
- Adelaide `508.795.670-07` / `987654`: chip `Bianca · 1EF`, que também leva ao Perfil.
- Carlos `314.159.265-90` / `111111`: `Sua conta` + estado vazio; Sair volta ao Login na hora.
- BootError: logar, parar a API, reabrir o app → `Sem conexão`; `Tentar de novo` com a API de volta abre as abas; `Sair` funciona offline.
- VoiceOver: chip lido como `Aluno Rafael, turma 7EF, RM 12567, período Matutino, botão, Abre o perfil`; no Perfil a linha do aluno atual não é botão; no iPhone SE (320), na confirmação de Sair, o foco em Cancelar lê `Sair deste aparelho? Cancelar`.

### Migrations, envs, nativo, o que não deu para verificar
- Sem migration, env nova, dependência nova ou mudança nativa. `runtimeVersion` não muda.
- Não verificado aqui: **Android** (sem JDK), **Maestro** real (só `maestro:check`; no 07, a Agenda e o Boletim ficam montados e os dois têm `header-student-chip` — o Maestro deve tocar o visível, mas só a execução prova), toque real no simulador, layout compact (320) do chip, e a divisória acendendo com o dedo no aparelho.

**Status: PRONTO COM RESSALVAS**
1. A entrada do header repete na 1ª visita de cada aba (a "uma vez por AppTabs" da §4.3 fica para a fatia 9).
2. Tokens legados do tema que ficaram sem uso (`sectionTitle`, `greeting*`, `actionBar`, `studentCard`, `logoutIcon`) ficam para a limpeza da fatia 9.
3. Linha do aluno atual `disabled`: o VoiceOver pode dizer "esmaecido" (decisão 4).
4. Prints feitos com roteiro temporário (sem toque físico); Android, Maestro real e 320 não verificados.

## Mensagens

→ chief: fatia 4 pronta na `v2` (`cfd135b`, `d1ce86f`, `0b9aa47`), sem push. 601 testes verdes; lint, tsc, format e maestro:check limpos. Nenhuma dependência nem mudança nativa. As 3 sugestões do review da fatia 3 estão no `cfd135b`.

→ developer das fatias 6–8: as abas usam `features/header/TabScreenLayout` (header + `Animated.ScrollView` com o inset da tab bar e o `scrollY` da divisória). Para o pager da Agenda, use o `CompactHeader` direto e passe o `scrollY` da página visível, se quiser a divisória. Os títulos já estão em `agenda-title`/`boletim-title` dentro do header; os conteúdos da v1 começam com `marginTop="sm"`.

→ developer da fatia 9: sem uso agora no tema: `textVariants.sectionTitle`/`greeting`/`greetingName`, `cardVariants.studentCard`, `sizes.actionBar`/`studentCard`/`logoutIcon`. A entrada do header (`CompactHeader`, testIDs `header-bar-enter`/`header-titles-enter`) roda a cada montagem; a §4.3 quer uma vez por `AppTabs`.

→ designer (opcional): a linha do aluno atual ficou `disabled` (review); o VoiceOver pode ler "esmaecido". Se preferirem, tiro o `disabled` e deixo só sem papel de botão.

→ chief: a API e o Metro da 8094 estão parados; o simulador ficou sem `RCT_jsLocation` e com o token do Carlos no keychain (o app abre no BootError/NoStudent até alguém sair).

## Fatia 8 (equipe Boletim)

- Trilha: Boletim. Worktree `.claude/worktrees/v2-boletim`, branch `v2-boletim` (base `0b9aa47`). Commits `52961e1` (feat) e `86e4e18` (Maestro). Sem push.

### O que mudou
- `utils/grades.ts`: `gradeBand` (Bom ≥ 7, Atenção 5–6,9, Baixo < 5, Sem nota), `GRADE_TARGET` e `averageGrade` (média simples das notas não nulas, com uma casa).
- `components/SegmentedControl.tsx`: segmento `md`/`sm` com `useSlidingIndicator` e cor por proximidade. Com 1 opção, vira uma pílula estática com o id `X-<key>`.
- `components/Entrance.tsx`: entrada por shared value (fade + deslocamento), sem `entering`. Vem do aviso do Maestro Android (41cef33).
- `features/report-card/components/`: `GradeBar` (scaleX com a marca do 7), `GradeChip`, `GradeLegend`, `TermSummaryCard`, `SubjectGradeCard`, `bandColors` ("Sem nota" em `textSecondary`).
- `useReportCardViewModel.ts`: sem acordeão. Tem `yearOptions`/`termOptions`, trimestre inicial = último avaliado, `summary`, `subjects`, `slideDirection` e `contentKey` com o trimestre. Mantém a troca de aluno → ano mais recente, o retry, o 404 e o erro só do ano.
- `ReportCardScreen.tsx`: segmentos, resumo + legenda, "Disciplinas · N", cards e "Ainda não avaliado" (`boletim-term-<t>-not-evaluated`).
- `components/BoletimSkeleton.tsx`: shimmer (`SkeletonGroup`), com o segmento de ano, o de trimestre, o resumo e 4 cards. `withYear={false}` na troca de ano.
- Removidos: `Accordion`, `TermAccordion`, `SubjectAccordion` e os testes deles. O `Dropdown` ficou (a Agenda usa).
- `strings.ts` (bloco `boletim`): as strings v2 da §5 entraram e as do acordeão saíram. `sizes.reportCard` é novo. `motion.subjectStagger` passou de 20 para 30 (stagger dos cards, §4.5).
- Testes atualizados: `useReportCardViewModel.test`, `ReportCardScreen.test`, `BoletimSkeleton.test`. Por ordem do chief no meio da tarefa, não escrevi testes novos nem fiz TDD/RED.
- Maestro: 05, 06, 07 e 08 reescritos para os segmentos. No iOS, a conferência é pelo rótulo do pai (resumo e card).

### Decisões
- O container do segmento de trimestre é `boletim-term-tab` e os itens são `boletim-term-tab-<t>`, porque o componente deriva `X-<key>`. A §7.1 pede o container como `boletim-term`.
- O item do segmento de ano tem largura fixa (`sizes.reportCard.yearItem` 112): o indicador precisa de itens iguais.
- A faixa da média usa a média já arredondada, para bater com o número mostrado.
- Durante a troca de ano, o segmento de trimestre vira skeleton, porque as opções vêm do boletim do ano. O design diz que os segmentos ficam.
- Sem pull-to-refresh (`refreshing`/`onRefresh`): isso é da fatia 9.

### Verificação (`cd mobile`, HEAD `86e4e18`)
- `yarn lint` sem erros nem avisos, `yarn tsc` limpo e `yarn format:check` ok.
- `yarn test`: 73 suítes, 585 testes. Base: 75/601. Saíram as suítes de Accordion e TermAccordion.
- `yarn maestro:check`: 14 arquivos, 98 ids.

### Simulador
- **Não gravado.** API da raiz na 3335 e Metro na 8096 subiram e o bundle compilou. Mas a equipe Login (Metro 8095) estava usando o simulador e regravou o `RCT_jsLocation` para 8095 entre o meu `defaults write` e o `launch`. O app abriu o bundle deles. Esperei a liberação até o chief pedir a entrega.
- O vídeo parcial foi apagado. `fatia-8-boletim.mp4` e os prints **não existem**.
- Tudo foi revertido: roteiro de demo temporário, ref de navegação, `apiUrl` e `.env`. API 3335 e Metro 8096 parados, árvore limpa. Não mexi na chave `RCT_jsLocation` (é da outra equipe agora).

### Como o qa testa
- Gustavo `969.294.560-04` / `123456`, Rafael, aba Boletim:
  - `2025 · 7EF` selecionado e `1º tri` ativo;
  - resumo com média 8,2, Bom, 14 faltas, 12 disciplinas e 1 abaixo de 7;
  - Arte 6,5 em âmbar com "Atenção";
  - `2º tri` mostra "Ainda não avaliado";
  - `2024 · 6EF` abre no `3º tri`.
- Joana: pílula `Ano letivo 2025 · 2EM`; T2 e T3 "Ainda não avaliado".
- Adelaide/Bianca: pílula `Ano letivo 2025 · 1EF`.

### Não verificado
- Simulador e vídeo (ver acima), Android e Maestro real.
- Sem dependência nova nem mudança nativa.

**Status: PRONTO COM RESSALVAS**
1. Vídeo e prints não feitos (simulador ocupado pela equipe da 8095).
2. O "Ainda não avaliado" usa o `EmptyState` compartilhado, que ainda anima com `entering` (layout animation). Pelo aviso do Maestro Android, pode ficar invisível. A correção é no `EmptyState` (arquivo compartilhado), fora do meu escopo.
3. Sem testes novos para os componentes, `gradeBand` e `averageGrade`, por ordem do chief.

## Mensagens
→ chief: Boletim v2 na `v2-boletim` (`52961e1`, `86e4e18`). Lint, tsc, format, 585 testes e maestro:check verdes. Faltam o vídeo e os prints: a equipe Login regravou o `RCT_jsLocation` (8095) no meio da minha gravação. Precisa de uma janela exclusiva do simulador.
→ chief (merge): possíveis conflitos no `strings.ts` (só o bloco `boletim`), no `sizes.ts` (`reportCard` depois de `gradeBar`), no `motion.subjectStagger` e no flow 07 (tirei o `assertNotVisible agenda-day-dropdown`).
→ quem cuida do `EmptyState`/`ErrorState`: trocar o `entering` por valor animado (como o `components/Entrance.tsx` desta branch), para o Android do Maestro.

## Fatia 5

- **Trilha:** v2. **Worktree:** `.claude/worktrees/v2`. **Branch:** `v2` (BASE `0b9aa47`). **Sem push.**
- **Commits:**
  - `62e10c4` feat(mobile): login v2 com TextField, banner de erro e logo vindo da splash
  - `6710209` fix(mobile): aluno atual sem toque e sem "esmaecido" e fim do aviso de act do header (as 2 sugestões da revisão da fatia 4, pedidas pelo chief)
  - `0f07b7e` fix(mobile): escala do olho da senha calculada fora do worklet (achado no simulador)
  - `bbfb4e5` test(mobile): comentário do flow 01 com a mensagem de erro em uma linha. É o último commit.

### O que mudou
- `components/TextField.tsx` (novo, 2.5):
  - caixa de 60 (`surfaceSunken`, raio `m`, borda `borderInput`) com ícone em `textSecondary`;
  - rótulo flutuante: sobe `−(m − xxs)` e encolhe para 0,8 com foco ou valor (`base`, `easeOut`; direto com reduzir movimento), `transformOrigin: 'left center'`, cor por crossfade de duas camadas;
  - camadas absolutas de foco (`primary` 1,5 + `glowPrimary`) e de erro (`danger`) por opacidade, com o erro vencendo o foco;
  - `mask="cpf"` (number-pad, 14, autofill `username`, `formatCpf`) e `placeholderWhenFocused`;
  - `secureToggle`: olho 44 × 44 (`Mostrar senha`/`Ocultar senha`), crossfade dos dois ícones e escala 0,85 → 1 no que entra (sem escala com reduzir movimento);
  - erro embaixo (`AlertIcon` 16 + `error`, `FadeInDown` 8 / `FadeIn(fast)`), anunciado uma vez e repetido como `accessibilityHint` do campo;
  - desabilitado a `opacities.busy`; `maxFontSizeMultiplier` 1,3; testIDs `X`, `X-error`, `X-toggle` (+ `-box`, `-label`, `-focus-layer`, `-error-layer`).
- `features/auth/components/LoginErrorBanner.tsx` (novo, 3.2): `minHeight` 48, `accentMuted` + borda `danger`, `AlertIcon` 20, texto `error` em `text`, anúncio único, `FadeInDown`/`FadeOut`. Sai o `LoginErrorMessage` (+ teste).
- `utils/loginLayout.ts` (novo): `loginLogoTop`, `loginLogoCenterY` e `splashToLoginOffsetY`. Fonte única para o Login e para a splash. Dá 128 / 93 / 64 nos três tamanhos do design.
- `hooks/useKeyboardReveal.ts` (novo): mantém o fim do card (o botão) `spacing.m` acima do teclado enquanto a Senha tem foco. A conta usa `endCoordinates.screenY`, e `revealOffset` é puro. No Android também devolve `keyboardInset`.
- `features/auth/LoginScreen.tsx` (reescrito, 3.2/4.2):
  - logo 245 × 39 em `insets.top + loginLogoTop`, com o halo radial de 360 atrás (decorativo, escondido do leitor);
  - card `surface` (máx. 400; raio `xl` e padding `xxl` no tablet; padding `m` e margem `s` no compact) com `Bem-vindo`, o texto, CPF, Senha, o banner e o `PillButton` "Entrar" de largura toda;
  - a ajuda embaixo;
  - shake no card;
  - entradas: halo `FadeIn(slower)`; card em `Keyframe` (opacidade, `translateY` 16, escala 0,98 → 1, `slow`, `emphasized`); itens com `FadeInDown(base)` e atraso de 60 + i × 40; ajuda com `FadeIn` e atraso de 300; o logo fica parado vindo da splash e entra com `FadeIn(base)` vindo do logout; com reduzir movimento, tudo é `FadeIn(fast)` com `Never` e sem atraso.
- `features/auth/useLoginViewModel.ts`: a regra não mudou. Só a saída: o erro de DV do CPF agora vem em `cpf.error` (vai para o campo), e o `errorMessage` (banner) ficou com os erros de envio e a sessão expirada.
- `features/splash/useSplashAnimation.ts`: na saída para o Login, `translateY` e `scale → loginLogoScale` juntos, em `slow`/`emphasized`. `SplashScreen.tsx` calcula o destino com `splashToLoginOffsetY`.
- `components/Screen.tsx`: saem `scroll`, `keyboard` (o `KeyboardAvoidingView`) e `footer`, que ficaram sem uso. A tela continua com o fundo, o inset de cima e a coluna de 600.
- **Removidos:** `UnderlineInput`, `CpfInput` (+ teste) e `LoginErrorMessage` (+ teste).
- `constants/strings.ts`: textos do login da §5 (`Senha`, `Entrar`, `Entrando…`, título, subtítulo, ajuda, placeholder, olho e erros em uma linha). Saem `passwordAccessibilityLabel` e `submitAccessibilityLabel`.
- `theme/sizes.ts`: `textFieldFocusBorder` 1,5, `fieldErrorIcon` 16, `loginHalo` 360. `theme/motion.ts`: `fieldLabelScale` 0,8, `toggleIconFrom` 0,85, `loginItemsDelay` 60, `loginHelpDelay` 300, `loginCardScaleFrom` 0,98.
- Complemento da revisão da fatia 4:
  - `StudentRow`: a linha que não troca de aluno não recebe mais `disabled` (o VoiceOver lia "esmaecido"). Os handlers ficam `undefined`, com `pointerEvents="none"`, e o papel continua `text`. O teste foi ajustado para `not.toBeDisabled()` + `pointerEvents`.
  - `useHeaderViewModel.test`: um `afterEach` espera `queryClient.isFetching() === 0`.
- Maestro: os ids do Login não mudaram. O regex do 01 continua casando com a mensagem nova; só o comentário foi ajustado.

### Decisões
1. **Teclado sem `KeyboardAvoidingView` nas duas plataformas.**
   - **iOS:** `automaticallyAdjustKeyboardInsets` (o sistema abre o espaço) + `useKeyboardReveal` rola até o botão no `keyboardWillShow` ou ao focar a Senha com o teclado já aberto.
   - **Android** (edge-to-edge, o `adjustResize` não encolhe a janela):
     - conferi no `ReactRootView` do RN 0.88 que, com `adjustResize`, o `keyboardDidShow` manda `screenY` = fundo da área visível, ou seja, o topo do teclado em coordenadas da janela;
     - o hook soma `janela − screenY` ao padding de baixo da rolagem e usa a mesma conta para rolar;
     - o efeito é o mesmo da v1 (botão acima do teclado) sem mexer no logo no 1º frame;
     - **não verificado em aparelho** (sem JDK).
2. **Erro de DV no campo, erro de envio no banner** (3.2): para isso o ViewModel expõe `cpf.error` separado do `errorMessage`. As condições não mudaram (blur com 11 dígitos e DV errado; some ao editar).
3. **Spinner com `login-submit-button-loading`** (o `${testID}-loading` do `PillButton`). A §7.1 cita `login-submit-loading`, mas nenhum flow usa esse id, e manter o padrão do primitivo evita uma prop só para isso.
4. **Card com `Keyframe`, não `FadeInDown`:** o `FadeInDown` só anima o `translateY`. Uma escala nos valores iniciais não seria animada (e o tipo não aceita).
5. **Erro do campo anunciado pelo próprio `TextField`** (`announceForAccessibility` quando aparece), como a v1 fazia com o erro do CPF.
6. **`Screen` sem teclado/rodapé:** o Login era o único usuário dessas props. Tirar as props tira junto o `KeyboardAvoidingView` do app.

### Testes
- Até a mudança de processo pedida pelo usuário, TDD com RED registrado:
  - `loginLayout`: RED `Cannot find module '../loginLayout'` → GREEN 7;
  - tokens (`theme.test`): RED `1 failed` → GREEN 10;
  - `TextField`: RED `Cannot find module '../TextField'` → GREEN 19. Mutação "erro vence o foco" → `1 failed`; revertido. Anúncio do erro: RED `Expected number of calls: 1 / Received: 0` → GREEN 20;
  - `LoginErrorBanner`: RED `Cannot find module` → GREEN 5;
  - `useLoginViewModel`: RED `2 failed` (`cpf.error` undefined) → GREEN 21;
  - `useKeyboardReveal`: RED `Cannot find module` → GREEN 12. No meio, um RED pelo motivo certo: os 2 casos de Android falhavam porque os eventos eram escolhidos na carga do módulo;
  - `LoginScreen`: RED `11 failed` (5 já passavam: regras que vêm do ViewModel) → GREEN 16. O card em `Keyframe` teve RED próprio;
  - `useSplashAnimation`: RED (escala não chamada) → GREEN 5;
  - `SplashScreen`: RED `Expected loginOffsetY 88.5 / Received -263.5` → GREEN 5.
- Depois da mudança, só ajustei testes existentes: `StudentRow` e `useHeaderViewModel` (complemento) e o `Screen.test`, reescrito para o que ficou, porque os casos antigos eram só do `KeyboardAvoidingView` removido.
- `useHeaderViewModel.test`:
  - 1º lote de 8 rodadas, logo depois da mudança: 2 ainda com o aviso de `act`;
  - lotes seguintes: 12/12 e 10/10 limpos;
  - na suíte inteira final: 0 avisos.

### Verificação final (`cd mobile`, HEAD `bbfb4e5`, árvore limpa)
```
yarn lint            → sem saída
yarn tsc             → sem saída
yarn format:check    → All matched files use Prettier code style!
yarn maestro:check   → Flows do Maestro ok: 14 arquivos, 102 ids conferidos.
yarn test            → Test Suites: 77 passed, 77 total · Tests: 646 passed, 646 total (0 avisos de act)
```
(Base: 75 suítes / 601 testes. Saíram `CpfInput.test` e `LoginErrorMessage.test`. Entraram `TextField`, `LoginErrorBanner`, `useKeyboardReveal` e `loginLayout`.)

### Simulador (evidência)
- **Ambiente:**
  - iPhone 16 `1E7DEFC7-…`, app Debug já instalado (sem mudança nativa, sem rebuild);
  - Metro do worktree na **8095** com `RCT_jsLocation`; a 8081 (PID 35131) não foi tocada;
  - API da raiz (`YARN_IGNORE_PATH=1 yarn build && node dist/main`, 3333, `v2dev.db`), sem reset.
- **Logout do Carlos:** copiei o `.app`, desinstalei e reinstalei. Sem a marca de instalação, o app apaga o token do keychain (regra da v1), então abriu limpo no Login.
- **Sem toque físico** (mesma limitação das fatias 3 e 4). Usei um roteiro **temporário, não commitado** (`src/__demo__/autoplay.ts`, `require` no `index.js`, `globalThis.__login` na tela e `__togglePassword` no `TextField`). Ele:
  - foca os campos de verdade pelos refs;
  - digita pelos handlers do ViewModel, um caractere por vez;
  - aperta o olho;
  - envia com a senha errada e depois com a certa.

  Tudo revertido (`git status` limpo).
- **Bug achado aqui e corrigido em `0f07b7e`:** "Tried to synchronously call a Remote Function `iconScale`" no UI thread. O mock do Jest não roda worklets.
- `evidencias/fatia-5-login.mp4` (41 s): splash → logo descendo e encolhendo até o lugar → card entrando → CPF com máscara (DV errado → erro no campo) → CPF corrigido → senha → olho mostra/oculta → erro com banner e shake → senha certa → spinner → Agenda do Gustavo.
- **Emenda splash → Login medida no vídeo** (bbox dos pixels teal, 20 fps): o logo para em y 624–740 px e continua exatamente aí quando o Login monta e o card entra. No eixo x, a diferença é de até 2 px de 1179 (244,8 → 245 pt). Não há pulo.
- **Prints:**
  - `fatia-5-login-inicial.png`
  - `fatia-5-cpf-foco-mascara.png`
  - `fatia-5-cpf-erro.png` (borda rosa e erro no CPF, Senha focada com brilho)
  - `fatia-5-senha-visivel.png`
  - `fatia-5-erro-banner.png`
  - `fatia-5-enviando.png`
  - `fatia-5-agenda-gustavo.png`
- **Não deu para provar visualmente o botão acima do teclado:** o simulador está com teclado de hardware (só aparece a barra "Next"), e esta máquina não tem o app Simulator para desligar isso. A lógica está coberta pelo `useKeyboardReveal.test` (iOS e Android).
- **No fim:** Metro da 8095 e API parados, `RCT_jsLocation` removida (`defaults read` → "does not exist"). O app ficou **logado como Gustavo** (o roteiro terminou no login certo).

### Como o qa testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && node dist/main   # 3333
cd mobile && yarn start
yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
```
- **Sair primeiro:** o simulador ficou com a sessão do Gustavo; use Perfil → Sair → Sair.
- **Splash → Login:** o logo vai ao lugar e encolhe sem pulo, e o card sobe depois.
- **CPF:** com foco, mostra o placeholder `000.000.000-00` e aplica a máscara enquanto digita. `969.294.560-05` + sair do campo → `Confira o CPF digitado.` com borda rosa.
- **Senha:** o olho alterna a senha sem tirar o foco.
- **Gustavo** com senha `000000`: banner rosa + o card treme. Com `123456`: spinner e depois Agenda.
- **Teclado de software** (I/O → Keyboard → desligar Connect Hardware Keyboard): focar a Senha → o botão "Entrar" fica visível acima do teclado. Em telas de 667 e 568, a tela rola.
- **Reduzir movimento:** sem deslize, sem shake e sem escala no olho; só fades.
- **VoiceOver:** "Mostrar senha"/"Ocultar senha" como botão, e o erro do CPF anunciado e lido como dica do campo.
- **Perfil (complemento):** com 2 alunos, a linha do aluno atual não reage ao toque e não é lida como "esmaecido".
- Contas: Adelaide `508.795.670-07` / `987654`; Carlos (sem aluno) `314.159.265-90` / `111111`.

### Migrations, envs, nativo, o que não deu para verificar
- Sem migration, env nova, dependência nova ou mudança nativa (`react-native-svg` e `reanimated` já existiam). O `runtimeVersion` não muda.
- Não verificado aqui:
  - **Android** (sem JDK): o `keyboardInset` + a rolagem com edge-to-edge, o `boxShadow` da camada de foco e o `transformOrigin` do rótulo;
  - **Maestro** real (só `maestro:check`): com teclado de software no CI, o `tapOn login-submit-button` depende da rolagem do `useKeyboardReveal`;
  - teclado de software no iOS (ver acima);
  - layout compact (320) e tablet do card.

**Status: PRONTO COM RESSALVAS**
1. O botão acima do teclado não tem prova visual nesta máquina (teclado de hardware, sem o app Simulator). A cobertura é de teste e de leitura do código do RN.
2. Android não verificado: a solução do teclado é nova (sem `KeyboardAvoidingView`), e a premissa vem da leitura do `ReactRootView` 0.88.
3. Ficou de fora o "brilho do botão por camada com fade ao habilitar" (§4.2). Hoje o `PillButton` liga e desliga o `boxShadow` direto. É primitivo da fatia 2.
4. `PrimaryButton`/`SecondaryButton` e os tokens `labelV1`, `labelFocused`, `inputValue`, `errorV1`, `inputLine` e `primaryV1`/`secondaryV1` ficaram sem uso: vão para a limpeza da fatia 9.
5. Spinner com `login-submit-button-loading` em vez do `login-submit-loading` da §7.1 (nenhum flow usa).
6. Vídeo feito com um roteiro temporário que usa os handlers e os refs reais (sem toque físico).

## Mensagens

→ chief: fatia 5 pronta na `v2` (`62e10c4`, `6710209`, `0f07b7e`, `bbfb4e5`), sem push. 646 testes verdes, 0 avisos de `act`; lint, tsc, format e maestro:check limpos. Nenhuma dependência nem mudança nativa. As 2 sugestões da revisão da fatia 4 estão no `6710209`. Depois do seu aviso, não escrevi testes novos; só ajustei os existentes.

→ chief: o simulador sem o app Simulator não deixa desligar o teclado de hardware, então o qa (ou alguém com o Simulator aberto) precisa conferir o botão acima do teclado de software. No CI do Maestro isso também é o que garante o `tapOn login-submit-button` com o teclado aberto.

→ developer da fatia 9: sem uso agora: `PrimaryButton`, `SecondaryButton` (+ teste), `textVariants.labelV1`/`labelFocused`/`inputValue`/`errorV1`, `sizes.inputLine`/`primaryButton`/`secondaryButton`, `buttonVariants.primaryV1`/`secondaryV1`. O `fixture` do `testids.test.js` cita `PrimaryButton` só como texto.

→ designer (opcional): a §7.1 diz que o spinner continua `login-submit-loading`, mas o `PillButton` deriva `${testID}-loading` → `login-submit-button-loading`. Usei o derivado; nenhum flow depende dele.

→ chief: o app no simulador ficou logado como Gustavo, e a `RCT_jsLocation` foi removida. Reinstalei o mesmo `.app` Debug (a sessão do Carlos foi apagada assim).

### Rodada 1 (fatia 8)
- [IMPORTANTE] alvo de toque do `SegmentedControl` com 34 e não 44 → corrigido em `968ae9c`. O `hitSlop` vertical agora sai da altura real do item: `(touchTarget − (altura − 2×padding − 2)) / 2`, que dá 5 no `md` e 9 no `sm`. Sem teste novo, por regra do usuário.
- `yarn lint && yarn tsc && yarn test && yarn maestro:check` → lint e tsc limpos; 73 suítes, 585 testes; 14 arquivos e 98 ids. `format:check` ok.

## Fatias 6 e 7 (equipe Agenda)

- **Trilha:** v2-agenda. **Worktree:** `.claude/worktrees/v2-agenda`. **Branch:** `v2-agenda` (BASE `0b9aa47`). **Sem push.**
- **Commits:**
  - `74320e1` feat(mobile): agenda com faixa semanal, pager de dias, timetable e linha de agora
  - `f3350ca` test(mobile): flows do Maestro com a faixa semanal e o swipe da agenda. É o último commit.

### O que mudou
- `features/lessons/timetable.ts` (novo): utils puros: `timeToMinutes`, `formatMinutes`, `minutesOfDay`, `timetableRange` (hora cheia antes/depois), `hourMarks`, `lessonBreaks` (vão ≥ `minGap`), `clockPhase` (`before`/`lesson`/`break`/`after`/`none`), `samePhase`, `lessonState`, `hourHeight` (compacto < 700 e fonte até 1,6) e `autoScrollTarget`.
- `features/lessons/useMinuteClock.ts` (novo): `useMinuteTicker(now, onTick)` (`setTimeout` até a virada + `setInterval(nowTick)` + `AppState` ativo) e `useMinuteClock({ lessons, now })`: minutos num shared value (`withTiming slow/standard`, `set` com reduzir movimento) e `setState` só quando a fase muda.
- `useAgendaViewModel`: mantém D35, troca de aluno, retry e shake. Campos novos: `days` (`weekdayShort`, `dayNumber`, `hasLessons`, `lessonCount`, `isToday`, rótulo e anúncio), `pages` (aulas com minutos, rótulo do horário, estado, `range`, `breaks`, `banner`, descrição do vazio), `monthLabel`, `selectedIndex`, `todayIndex`, `showTodayButton`, `isWeekEmpty`, `clockMinutes`, `now`, `onSelectToday`, `refreshing`/`onRefresh` e `studentKey`. Saem `dayOptions`, `selectedDayLabel`, `lessons`, `isEmpty`, `contentKey` e `contentEnterDelay`. Só a página de hoje é recriada quando a fase muda; as outras mantêm a identidade (`useMemo`).
- `components/WeekStrip.tsx` (novo, 2.7): mês (`agenda-month-label`, header), botão `Hoje` (`PillButton ghost xs`, `agenda-today-button`), 7 chips (`agenda-day-<data>`, role `tab`, `selected`, rótulo "Segunda-feira, 17 de março, 6 aulas[, hoje]"). O indicador teal usa `useSlidingIndicator` no modo `progress`, lido do pager, sem mola própria. As camadas de cor seguem a proximidade. Hoje tem a borda e o `overline` em teal. A escala `pressScaleSmall` vale no toque, e não há escala com reduzir movimento.
- `components/DayPage.tsx` (novo, 2.9): `ScrollView` por dia (`agenda-page-<data>`) com `RefreshControl` teal, padding da tab bar, `NowBanner` + `Timetable` ou o `EmptyState` do dia (`-empty`, "Aproveite o fim de semana." / "Nenhuma aula marcada para este dia."), e a rolagem automática até a linha de agora, uma vez por montagem, depois da entrada.
- `components/Timetable.tsx` (novo, 2.10): linhas e rótulos de hora (os rótulos somem perto da linha), `Intervalo · 30 min`, blocos proporcionais (`-lesson-<i>`, `-subject`, `-time`, role `text`, rótulo com `, agora`/`, encerrada`), camada de brilho e selo `Agora` (`-now-badge`, mola `pop`) e passadas em `opacities.past`. A `NowLine` (`-now-line`) anda por `translateY` do shared value, tem o anel no ponto e some fora da faixa. A marca `HH:MM` (`NowTimeLabel`) é o único componente que re-renderiza por minuto.
- `components/NowBanner.tsx` (novo, 2.8): marcador (ponto pulsando / âmbar / relógio / check), texto com crossfade por `key`, `accessibilityLiveRegion` e anúncio no iOS quando a fase muda com a página de hoje visível.
- `components/AgendaEnter.tsx` (novo): entrada por shared value (`withDelay(withTiming)` em opacity/translateY), sem `entering` de layout, pelo aviso do CI da v1 (41cef33).
- `LessonsScreen`: `CompactHeader` direto (o `TabScreenLayout` rolaria o pager) + faixa + `Animated.FlatList` horizontal paginado (`agenda-pager`, `getItemLayout`, `initialScrollIndex`, `windowSize 3`, `key` por aluno). O `useAnimatedScrollHandler` escreve o `progress`. O toque no chip/Hoje chama `onSelectDay` antes do `scrollToIndex` (`animated: !reducedMotion`). `onMomentumScrollEnd` escolhe o dia e anuncia se o leitor de tela estiver ligado. Estados: skeleton, erro, semana vazia (`agenda-week-empty`).
- `components/AgendaSkeleton.tsx`: refeito (mês, 7 chips, banner, 4 blocos) com `SkeletonGroup` (shimmer).
- `utils/dates.ts`: `weekdayShort`, `monthName`, `dayParts`, `monthYearLabel` ("Março 2025", "Março – Abril 2025").
- `constants/strings.ts`: só o bloco `agenda` (textos da §5). Saem `dayAccessibilityPrefix` e `dayHint`.
- **Removidos:** `LessonItem` (+ teste). O `Dropdown` **fica**: o `ReportCardScreen` desta branch ainda usa.
- Maestro: 04 reescrito (chip segunda → swipe LEFT no `agenda-pager` → terça com `selected` → chip domingo → `-empty` e sem `-timetable`), 02 (`agenda-week-strip`), 07 (só a linha `assertNotVisible agenda-day-dropdown` → `agenda-week-strip`), README. `scripts/testids.js` passa a reconhecer `memo(function X…)` como componente, para seguir o `testID` até `DayPage`/`Timetable`.

### Decisões
1. **Sem testes novos e sem RED.** Foi pedido do usuário via chief no meio da tarefa. O `now` continua injetável no VM e nos hooks. Só atualizei os testes do que mudou: VM (dias, páginas e mês no lugar de `dayOptions`), `LessonsScreen` (chips e páginas; os casos que dependem do dia usam fake timers com `now` numa segunda) e `AgendaSkeleton`. Removi os testes de `contentKey`/`contentEnterDelay`, que eram de campos que saíram.
2. **Sem `entering` de layout no que monta depois dos dados.** A faixa, o banner, os blocos e o "Hoje" usam `AgendaEnter`, por shared value. Exceção: o `EmptyState` compartilhado do dia vazio ainda tem `entering` interno (ver Mensagens).
3. **Lógica de fase, banner e estado das aulas no VM.** A View só converte minutos em pontos. O relógio fica no VM (só a fase vira estado) e a marca `HH:MM` tem o próprio ticker.
4. **`useMinuteClock` em `features/lessons/`**, não em `hooks/`: ele depende dos utils da grade. Ele lê `motion` do tema direto, sem `useTheme`, para o VM continuar testável sem `ThemeProvider`.
5. **O pager remonta quando a largura medida muda** (`key` com a largura): o `getItemLayout` fica certo sem corrigir offset.
6. **Pressionar o chip escala o fundo e o conteúdo**, num shared value `pressed` da faixa. O indicador fica entre as duas camadas, então não escala.
7. **Sem cascata por chip (§4.4):** a faixa entra inteira (`AgendaEnter`). Fica mais simples e não usa layout animation.

### Verificação final (`cd mobile`, HEAD `f3350ca`, árvore limpa)
```
yarn lint            → sem erros nem avisos
yarn tsc             → sem saída
yarn format:check    → All matched files use Prettier code style!
yarn maestro:check   → Flows do Maestro ok: 14 arquivos, 99 ids conferidos.
yarn test            → Test Suites: 74 passed, 74 total · Tests: 595 passed, 595 total
```
(Base: 75 suítes, 601 testes. Saiu o `LessonItem.test` e os casos de `contentKey`/`contentEnterDelay`. O aviso de `act` intermitente do `useHeaderViewModel.test`, já apontado no review da fatia 4, apareceu de novo numa das execuções. Não é desta fatia.)

### Simulador (evidência)
- iPhone 16 `1E7DEFC7-…`, app Debug já instalado (sem mudança nativa). Metro do worktree na **8097** com `RCT_jsLocation`; o PID 35131 (8081) não foi tocado. API da raiz `node dist/main` com `PORT=3334` (`v2dev.db`, sem reset).
- O `API_URL` do `.env` é gravado no binário (react-native-config), então trocar a porta exigiria rebuild do app compartilhado. Usei uma troca **temporária, não commitada** da `baseURL` para 3334. O mesmo roteiro temporário (`src/__demo__/autoplay.ts` + `require` no `index.js`) logava o Gustavo pela API real e chamava os handlers reais da tela (chip, Hoje, `scrollToIndex` + `onSelectDay` no lugar do swipe com dedo, porque esta máquina não posta toques). O `now` foi injetado como "hoje às 10:23, andando com o relógio" (o Mac estava às 13:30). Tudo revertido: `git status` limpo.
- `evidencias/fatia-6-7-agenda.mp4`: login → quarta (hoje) com a linha às 10:23, Arte "Agora" com brilho e selo, Ciências e a Arte das 09:15 atenuadas, banner "Agora: Arte · até 10:45" → segunda pelo chip (o indicador desliza) → pager para terça → domingo vazio → "Hoje".
- Prints: `fatia-6-7-hoje-agora.png`, `fatia-6-7-segunda.png`, `fatia-6-7-terca.png`, `fatia-6-7-domingo-vazio.png`. Os três últimos são de uma rodada anterior e mostram o aviso do LogBox. O aviso era do Reanimated ("Dependencies should only be used on the web"), causado pelo array de deps no `useAnimatedScrollHandler`. Corrigi antes do commit, e a rodada final saiu sem aviso.
- Durante a gravação, outra equipe apagou o `RCT_jsLocation` do simulador compartilhado (uma das relaunch caiu no Metro da 8081 com erro de bundle de outro worktree). Regravei com a chave de volta. No fim: Metro 8097 e API 3334 parados, e a chave removida.

### Como o qa testa
```
cd api && YARN_IGNORE_PATH=1 yarn build && node dist/main   # 3333
cd mobile && yarn start && yarn ios --udid 1E7DEFC7-963D-47CD-82A7-224BC5EAD850
```
- Gustavo `969.294.560-04` / `123456`, aluno Rafael: a Agenda abre no dia da semana de hoje (D35), com borda teal em "hoje". Tocar num chip ou fazer swipe troca o dia, e o indicador acompanha o dedo. "Hoje" aparece fora do dia de hoje. Domingo e sábado mostram "Sem aulas neste dia · Aproveite o fim de semana.".
- Linha de agora: num dia útil, com o Mac entre 07:00 e 13:00. Às 08:50, o banner mostra "Intervalo · próxima aula às 09:15". Antes das 07:15, "Próxima aula às 07:15". Depois das 12:15, "Aulas encerradas", com todas as aulas atenuadas e sem linha.
- Adelaide `508.795.670-07` / `987654`: Bianca, conferir a faixa da tarde (13:00–19:00). Carlos (sem aluno): sem mudança.

### Migrations, envs, nativo, o que não deu para verificar
- Sem migration, env, dependência ou mudança nativa. `runtimeVersion` não muda.
- Não verificado: Android (sem JDK), Maestro real (só `maestro:check`; o `swipe from id agenda-pager` do flow 04 e o `selected: true` no chip só a execução prova), swipe com dedo de verdade, reduzir movimento e fonte grande no aparelho, 320 pt e tablet.

**Status: PRONTO COM RESSALVAS**
1. Sem testes novos nem RED (pedido do usuário). N3 sem teste com relógio injetado; o `now` segue injetável.
2. O `EmptyState` compartilhado do dia sem aulas ainda usa `entering` de layout (risco do Android/Maestro no flow 04).
3. Android, Maestro real e toque físico não verificados.
4. As sugestões pendentes da fatia 4 (`act` no `useHeaderViewModel.test` e `disabled` da `StudentRow`) não entraram: não são da Agenda, e a equipe do Login está na mesma área.


### Rodada 1

Achados do `03-review.md` (Fatia 5), corrigidos em `8762ae4`. Sem testes novos (regra do usuário); só ajustei os que quebraram.

1. **[IMPORTANTE] Banner e erro do campo com layout animation (risco do bug do Android do reanimated 4.7.1):** corrigido em `8762ae4`.
   - O `components/EnterDown.tsx` voltou da v1 (`41cef33`): fade de 8 pt por shared value, que já nasce visível com reduzir movimento.
   - O `LoginErrorBanner` e o erro do `TextField` usam o `EnterDown`, sem `entering` nem `exiting`, e saem sem animação.
   - Cobertura: os casos que conferiam o `entering` em `TextField.test` e `LoginErrorBanner.test` agora conferem que não há layout animation e que, com reduzir movimento, a view nasce com opacidade 1 e `translateY` 0. Os dois casos do banner viraram um, por isso a suíte foi de 646 para 645.
2. **[IMPORTANTE] Android: `scrollTo` antes do padding do teclado crescer:** corrigido em `8762ae4`.
   - O `useKeyboardReveal` devolve `onContentSizeChange`. No Android ele chama o `reveal()` de novo quando o conteúdo cresce, ou seja, com o padding já no layout nativo. O `LoginScreen` liga esse handler na `ScrollView`.
   - O `reveal()` do evento continua (é o que vale no iOS).
   - Sem teste novo. Não verificado em Android (sem JDK).
3. **Extra, no mesmo commit:** o aviso de `act` do `useHeaderViewModel.test` ainda aparecia sob a carga da suíte inteira.
   - Causa: o `notifyManager` do TanStack notifica num `setTimeout(0)` depois de a busca terminar.
   - Correção: o `afterEach` espera `isFetching() === 0` e esse tique dentro de `act`.
   - Resultado: 12/12 limpo isolado e 2 rodadas da suíte inteira com 0 avisos.

Verificação (`cd mobile`, HEAD `8762ae4`, árvore limpa):
```
yarn lint            → sem saída
yarn tsc             → sem saída
yarn format:check    → All matched files use Prettier code style!
yarn maestro:check   → Flows do Maestro ok: 14 arquivos, 102 ids conferidos.
yarn test            → Tests: 645 passed, 645 total (2 rodadas, 0 avisos de act)
```
Não rodei de novo no simulador. O `EnterDown` é o mesmo da v1, e a mudança é só na forma de entrar.

## Mensagens

→ chief: fatias 6 e 7 prontas na `v2-agenda` (`74320e1`, `f3350ca`), sem push. 595 testes verdes; lint, tsc, format e maestro:check limpos. Sem dependência nem mudança nativa.

→ chief (merge): arquivos compartilhados tocados:
- `constants/strings.ts`: só o bloco `agenda`;
- `.maestro/02` e `.maestro/07`: uma linha cada (`agenda-day-dropdown` → `agenda-week-strip`);
- `.maestro/README.md`: a linha do 04;
- `.maestro/scripts/testids.js`: `isComponentFunction` aceita `memo(function …)`.

`theme/sizes.ts` e `theme/motion.ts` não mudaram (os tokens da Agenda já existiam). O `Dropdown` ficou para o Boletim remover.

→ chief / Boletim: o `EmptyState` (compartilhado) ainda tem `entering` interno no ícone e nos textos. Pelo aviso do CI, no Android ele pode ficar invisível quando monta depois dos dados (dia vazio da Agenda, estados do Boletim). Vale um conserto único no componente, trocando por shared value como o `EnterDown`/`AgendaEnter`. Não mexi nele para não conflitar.

→ qa: a linha de agora depende do relógio do Mac (dia útil, 07:00–13:00). O flow 04 faz swipe no `agenda-pager` e confere `agenda-day-2025-03-18` com `selected: true`; observe se o Maestro dispara o swipe no meio do pager (abaixo da faixa).

## Fatia 9

- Worktree `/Users/fael_st/workspace/fiap/.claude/worktrees/v2`, branch `v2`, BASE `00ae80e`, último commit `9a4e784`. Sem push.
- Regras da v2: sem testes novos, sem TDD; só ajustei os testes existentes que quebraram.

### Commits

| commit | item |
|---|---|
| `b17ac61` fix(mobile): entradas por valor animado em tudo o que monta depois da tela | 1 |
| `9b1ed9c` fix(mobile): banner de agora anunciado uma vez só no Android | 2 |
| `ebc3a3b` feat(mobile): entrada do header uma vez por montagem das abas | 3 |
| `0b36c2d` feat(mobile): pull-to-refresh no Boletim e indicador teal nas três abas | 4 |
| `dfce487` refactor(mobile): remove o legado v1 que ficou sem uso | 5 |
| `ad2a5ac` refactor(mobile): remove a ilustração no-classroom da v1, sem uso na v2 | 5 |
| `9a4e784` docs: seção v2 (UI moderna) no README com as telas da v2 | 6 |

### O que mudou

1. **Risco Android.** `components/Entrance.tsx` é agora o único componente de entrada (fade + `offsetX/offsetY` + `scaleFrom`/`spring` opcionais, `enabled={false}` para montar já visível no 1º render de um crossfade; com reduzir movimento, fade `fast` sem atraso e sem deslocamento/escala). Saíram `components/EnterDown.tsx` e `features/lessons/components/AgendaEnter.tsx`; os usos (TextField, LoginErrorBanner, LessonsScreen, DayPage, Timetable, WeekStrip, NowBanner) passaram para o `Entrance`. Deixaram de usar `entering`/`exiting`: `EmptyState` (logo `ErrorState` também), `ProfileScreen` (cascata: o `/me` pode chegar depois da tela), `StudentRow` (selo "Atual" com pop e rádio), `LogoutRow` (crossfade pedir/confirmar) e `StudentChip` (troca de aluno).
   - Sobre o `exiting`: tirei também. A camada antiga some na hora e a nova entra em fade (`LogoutRow`, `StudentChip`, selo/rádio). Perde a metade de saída do crossfade, mas no Android uma view em `exiting` pode ficar presa por cima, e no `LogoutRow` ela fica na mesma área dos botões Cancelar/Sair.
   - `grep -rn "entering=\|exiting=" mobile/src` no fim: sobram só `LoginScreen.tsx` (halo, logo, card, itens 0–4, ajuda) e `CompactHeader.tsx` (`header-bar-enter`, `header-titles-enter`). Os dois montam junto com a tela. Nenhum `exiting`.
2. **NowBanner.** No iOS, `announceForAccessibility`. No Android, só a live region do card (que já existia). A live region fica `none` quando `announce` é falso (página não visível).
3. **Entrada do header uma vez por `AppTabs`.** `HeaderEntranceProvider` (em `CompactHeader.tsx`) envolve o `Tab.Navigator`. O 1º header que monta faz a entrada e marca o ref. Boletim e Perfil montam o header parado. Fora das abas (BootError, NoStudent) entra como antes. O conteúdo das abas já rodava só na montagem (as abas ficam montadas).
4. **Pull-to-refresh.** Agenda e Perfil já tinham. O Boletim ganhou `refreshing`/`onRefresh` no VM (refetch dos anos e do boletim do ano em tela, sem refetch com ano nulo) e o `RefreshControl` teal. O `progressBackgroundColor` `surfaceRaised` foi para a Agenda também, e o `onRefresh` da Agenda passou a usar `try/finally`. O refresh não refaz a cascata (as `key` não mudam).
5. **Limpeza** (com grep antes de cada remoção): `PrimaryButton`, `SecondaryButton`, `Dropdown` (e os testes de `PrimaryButton`/`Dropdown`), `hooks/useSkeletonPulse.ts`, `icons/CloseIcon.tsx`, `assets/no-classroom.png` e a string `common.closeListAccessibilityLabel`. No tema saíram os blocos "Legado v1": textVariants `bodyMedium`, `bodyBold`, `greeting`, `greetingName`, `titleV1`, `inputValue`, `labelV1`, `labelFocused`, `sectionTitle`, `emptyState`, `lessonSubject`, `termTitle`, `errorV1`, `captionPlain`, `subject` e `detail`; buttonVariants `primaryV1`/`secondaryV1`; cardVariants `dropdown`, `options`, `term` e `student`; colors `bulletBorder`; todas as chaves legadas de `sizes` (`actionBar`, `dropdown`, `termCard`, `studentCard`, `primaryButton`, `secondaryButton`, `tabBar`, `chevron`, `logoutIcon`, `bullet*`, `illustration`, `skeletonLesson*`, `inputLine`, `accordionOpenMaxHeight`); e `motion.pressedOpacity` e `motion.skeleton`. A cor `inputLine`, que só a splash usava, virou `colors.splashTrack`. Removi os testes `legado v1` de `Text.test` (sectionTitle) e de `Card.test` (student).
6. **README.** Seção "v2 (UI moderna)" com link no sumário, o aviso de que a entrega oficial é a v1 e a tabela de 4 prints `docs/media/v2-{login,agenda,boletim,perfil}.png` (360 px).
7. **Evidência.** API real da raiz (`yarn build && node dist/main`, porta 3333, `v2dev.db`, sem reset) e Metro do worktree na porta 8090 com `RCT_jsLocation`. O app instalado (debug, build de hoje, com RNSVG) carregou o bundle do worktree.
   - Vídeo: `evidencias/v2-final.mp4` (36 s): splash → Login (Gustavo) → Agenda → Boletim → Perfil → troca para a Joana → Agenda com o chip da Joana → Perfil → Sair (confirmação) → Login.
   - Prints em tamanho cheio: `evidencias/v2-final-{login,agenda,boletim,perfil}.png`.
   - Como na fatia 3 (esta máquina não deixa postar toque), usei um roteiro **temporário, não commitado**: `src/__demo__/autoplay.ts` + `ref` no `NavigationContainer` + `globalThis.__loginVm`/`__profileVm`. Ele digita pelo `onChangeText` real e chama os handlers reais dos VMs. Revertido (`git status` limpo).
   - Limpeza no fim: chave `RCT_jsLocation` removida, app encerrado, API e Metro 8090 parados. O PID 35131 (8081) não foi tocado.

### Verificação (rodada final)

- `yarn lint` ok · `yarn tsc` ok · `yarn format:check` ok · `yarn maestro:check`: "Flows do Maestro ok: 14 arquivos, 96 ids conferidos."
- `yarn test`: 602 passed, 602 total (eram 623; os 21 a menos são os testes de `PrimaryButton`/`Dropdown` e os dois `legado v1` removidos).
- **Intermitente:** em 2 de ~10 execuções da suíte inteira, 1 teste falhou, uma vez em `features/header/__tests__/useHeaderViewModel.test.tsx` e outra em `features/report-card/__tests__/useReportCardViewModel.test.tsx`. Depois disso foram 4 suítes inteiras verdes seguidas e 6 execuções isoladas desses dois arquivos (48/48). Não capturei a mensagem da falha (as execuções seguintes passaram). O padrão parece de timing sob carga (`waitFor`) e não de algo desta fatia, mas não confirmei.

### Não feito / ressalvas

- Aviso inline `X-refresh-error` de §2.15 (erro no refresh com dados em tela): não implementado. Hoje um refresh que falha só para o spinner, e os dados ficam.
- `progressViewOffset` no Android: não usei, porque o scroll fica abaixo do header fixo e não por baixo dele.
- §4.3 completa (tab bar entrando com `spring.gentle` e o conteúdo a partir de `3 × stagger` encadeado ao header) e o crossfade de cor da tab bar com reduzir movimento (ledger): fora deste acabamento enxuto.
- Android, Maestro em device e Docker não foram verificados nesta máquina (só `maestro:check` estático).
- Nenhuma mudança nativa, env ou migration.

## Mensagens

→ chief: fatia 9 PRONTO COM RESSALVAS. São 7 commits em `v2` (`b17ac61..9a4e784`), sem push. Agora só Login e header usam `entering`, e nada usa `exiting`. Ressalvas: o aviso `X-refresh-error` não foi feito; houve 2 falhas intermitentes de 1 teste cada (useHeaderViewModel/useReportCardViewModel), que não se repetiram em 10 execuções seguintes; e o README cita a branch `release/v2`, que ainda precisa ser criada a partir da `v2`.
