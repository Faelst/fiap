# 03 — Review: app v2

## Fatias 1 e 2

Diff: `revisao/fatia-1-2.diff` (worktree `.claude/worktrees/v2`, branch `v2`, BASE `f9023f5`, commits `daf17fe..0af1bf5`, 54 arquivos). Abri os arquivos do tema e dos primitivos inteiros. Fora do diff, conferi só:
- se o `SecondaryButton`/`PrimaryButton` da v1 ainda renderiza legível com os tokens trocados;
- o `theme.ts` da `f9023f5`, para comparar o `button`/`tabLabel` antigos;
- se algum flow do Maestro usa os textos que mudaram (nenhum usa "TENTAR DE NOVO" nem `-illustration`).

Verificação no worktree (`mobile/`, HEAD `0af1bf5`, árvore limpa):
- `yarn lint && yarn tsc && yarn test && yarn format:check && yarn maestro:check` → exit 0: **70 suítes, 530 testes**, prettier ok, 14 arquivos e 90 ids. Bate com o `02-dev.md`.
- **Nenhuma dependência nova:** `package.json`, `yarn.lock`, `ios/` e `android/` sem mudança no diff.
- Olhei as duas evidências.

**Contraste (§1.3): recalculei pela fórmula WCAG a partir dos hex de `palette.ts`.** Todos os pares da tabela batem com o design, com no máximo 0,05 de diferença:

| Par | Razão |
|---|---|
| texto/`surfaceRaised` | 16,67 |
| `textSecondary` sobre preto / `surface` / `surfaceRaised` / `surfaceHigh` | 10,02 / 8,79 / 7,95 / 6,85 |
| `textTertiary` sobre preto / `surface` / `surfaceRaised` | 6,25 / 5,48 / 4,96 |
| `primary` sobre `surface` / `surfaceRaised` / `primaryMuted` | 13,15 / 11,90 / 9,67 |
| `textOnPrimary`/`primary` | 15,00 |
| `warning` sobre `surface` / `warningMuted` | 10,49 / 7,90 |
| `danger` sobre `surface` / `surfaceRaised` / `accentMuted` | 6,29 / 5,69 / 5,59 |
| `textOnPrimary` sobre `danger` / `warning` | 7,17 / 11,95 |
| barras sobre `surfaceHigh` | 10,25 / 8,17 / 4,90 |
| `borderInput` sobre `surface` / `surfaceSunken` | 3,61 / 3,86 |
| `textDisabled`/`surfaceHigh` | 3,63 |
| `pink`/branco | 4,33 |

Os três `*Muted` também batem com a mistura declarada:
- teal a 14 % sobre `#141414` = `#17332F`;
- rosa a 16 % = `#37141F`;
- âmbar a 14 % = `#352B1B`.

Conferido e sem achado:
- **Paleta e cores (§1.1/1.2):**
  - os valores estão iguais à tabela;
  - hex e rgba só em `palette.ts`, com uma guarda (`palette-only.test.js`) provada com mutação;
  - alfa fora de `colors`, e os nomes semânticos são os da §1.2;
  - legado num bloco marcado (`inputLine`, `bulletBorder`).
- **Raios, espaçamento, `opacities`, `sizes` e `motion`:** conferi chave por chave contra §1.4–1.10. `loginLogoScale` é derivado, e o legado está num bloco próprio.
- **`textVariants` (§1.8):** família, tamanho e altura de linha, cor e `tabular-nums` nas 5 numéricas; `headline` responsivo; `overline` é a única em caixa alta.
- **`cardVariants`/`buttonVariants` (§1.11):** todas com `borderWidth: 1`. A base da pílula tem borda transparente, então as variantes não mudam de tamanho.
- **`shadows`:** `BoxShadowValue` tipados, sem `elevation`. Desvio aceito no ledger: `gradients` com opacidade por parada, coberto por teste de regressão que lê o alfa no `Stop`.
- **Ícones (§2.1):** comparei a geometria dos 13 com a tabela, e as coordenadas são idênticas. Base comum com viewBox 24, traço `iconStroke`, pontas redondas, `fill="none"` e decorativos. Os pontos do Alert e do WifiOff são preenchidos.
- **`Avatar` + `initials` (§2.2):** tamanhos, tons, anel `accent` de 1,5, variantes de texto, escondido do leitor e teto de fonte. O teste de `initials` cobre acento, sobrenome com várias palavras e sobrenome vazio.
- **`PillButton` (§2.3):**
  - as 4 variantes, o desabilitado sem brilho e o `glowPrimary` só no primário habilitado;
  - `md`/`sm`/`xs` com `hitSlop` até 44;
  - carregando: o rótulo fica com opacidade 0 e continua no layout, o spinner aparece na cor do texto, `busy` + `disabled` e o rótulo de carregamento;
  - a mola de escala é cortada com reduzir movimento, e o ghost esmaece (opacidade, permitido).
- **`useSlidingIndicator` (§2.17):** modos `index` (mola `snappy`, `set` direto com reduzir movimento, sem animar na montagem) e `progress` (com limite contra overscroll). As contas ficam em worklets puros testados. `useActiveLayerStyle` virou hook pela regra dos hooks, que é o desvio declarado e correto.
- **`Skeleton` (§2.16):**
  - um `progress` por grupo, linear em 1200 ms e cancelado ao desmontar;
  - faixa de 120 só em `translateX`, com a largura medida no contêiner interno;
  - com reduzir movimento, sem faixa nem loop e opacidade 0,7;
  - fora do grupo, os skeletons da v1 continuam como antes (desvio declarado).
- **`EmptyState`/`ErrorState` (§2.16):**
  - círculo de 64 (`surfaceRaised`, ou `accentMuted` + ícone `danger`, 5,59 : 1) com glifo de 28, título `title`, descrição `body textSecondary` e ação;
  - o erro usa `PillButton secondary sm` com `RefreshIcon` em `primary`;
  - o `announce` da v1 (T13) e o shake curto foram mantidos.
- **Legado v1 funcionando:**
  - `tsc` limpo (todo `variant`/`color` da v1 existe no tema), e a suíte de telas da v1 inteira passa;
  - os renomes `*V1` preservam o login, a seleção e os botões antigos;
  - `PrimaryButton`/`SecondaryButton` passam a cor do texto explicitamente, então continuam legíveis com o `button` novo;
  - "FAZER LOGIN" e "AGENDA"/"BOLETIM" são literais em caixa alta, então não dependiam do `uppercase` que saiu.
- **Animações:** só `opacity`/`transform` (escala, `translateX`, `translateY`). Entradas com `ReduceMotion.System` e fade `Never` com reduzir movimento.
- **TDD:** RED registrado em cada arquivo novo, mais as mutações do brilho, do `stopOpacity` e da guarda. Os testes olham comportamento (estilo achatado, estado de acessibilidade, `onPress`, saída das contas), não o mock.

### [SUGESTÃO] Entrada do ícone do `EmptyState` diferente da §4.7
- Arquivo: mobile/src/components/EmptyState.tsx:44-50
- Problema: a §4.7 da v2 pede, para o ícone, "`FadeIn` + `scale 0.9 → 1` (`spring.gentle`)". O código usa um `Keyframe` com tempo fixo, de **0,96** → 1 em `base`, com o token da v1 `illustrationScaleFrom`. Os tokens da v2 que existem para isso (`popFrom: 0.9` e `spring.gentle`) ficam sem uso aqui. O desvio não está na lista de desvios do `02-dev.md`.
- Cenário: o ícone entra com um "pop" quase imperceptível (4 %) e sem a mola que o design escolheu para os estados. O teste fixa 0,96, então a divergência fica travada pelo próprio teste.
- Correção sugerida: escala inicial `motion.popFrom` com `springify()` usando `motion.spring.gentle` (ou um `Keyframe` equivalente), ajustando o teste. Se a escolha for proposital, registrar como desvio no `02-dev.md`/ledger.

### [SUGESTÃO] `motion.pressedOpacity` duplica `opacities.pressed`
- Arquivo: mobile/src/theme/motion.ts:52-53
- Problema: a §1.7 põe `pressed` em `opacities`, e o `PillButton` já usa `opacities.pressed`. O `motion.pressedOpacity` (0,6) continua fora do bloco legado, e os componentes da v1 usam essa chave.
- Cenário: alguém das próximas fatias usa `motion.pressedOpacity` num componente novo, e quando um dos dois valores mudar haverá duas opacidades de "pressionado" no app.
- Correção sugerida: mover `pressedOpacity` para o bloco `// Legado v1` do `motion.ts` (sai na fatia 9).

### Deixei de julgar
- **Contraste da faixa `none` do boletim:** a §1.2 especifica o selo "Sem nota" com texto `textTertiary` sobre `surfaceHigh`. Pela minha conta isso dá **4,27 : 1**, abaixo do AA (4,5) para texto pequeno, e o par não está na tabela da §1.3. Não há código nesta fatia (o `gradeBand` é da fatia 8), mas o token fica pronto para ser usado assim. Vai em Mensagens para o designer e o developer da fatia 8.
- **`boxShadow` no Android ≥ 9 e `tabular-nums` com a fonte embutida:** só o CI e o qa provam.
- **Mola real do indicador e movimento do shimmer:** o mock do Reanimated não anima. O developer viu no simulador.
- **Visual "misturado" das telas da v1:** esperado pela §1.12 até cada fatia. O texto `Tentar de novo` está na §5 da v2.
- **Push da `v2` feito pelo developer:** ambiente, já registrado no ledger.

### Veredito das Fatias 1 e 2
- **Spec ✅:**
  - fatia 1: paleta, cores, raios, sombras, opacidades, degradês, tipografia, tamanhos, movimento e bloco legado, com os testes de `Text`/`Card`;
  - fatia 2: ícones, `Avatar` + `initials`, `PillButton`, `useSlidingIndicator`, `Skeleton` com shimmer e `EmptyState`/`ErrorState` v2, com teste de componente;
  - os `PrimaryButton`/`SecondaryButton` continuam existindo;
  - desvios declarados: degradê por parada (aceito no ledger), hook de camada ativa, shimmer só no grupo, `*V1`, ícone nas 4 telas e "Tentar de novo". Todos são consequência do plano ou necessários para não quebrar a v1.
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 2 sugestões).

## Mensagens
→ chief: fatias 1 e 2 aprovadas. Recalculei todos os pares de contraste da §1.3 a partir dos hex, e eles batem. Nenhuma dependência nova, e a v1 continua funcionando (tsc e suíte inteira). As 2 sugestões são pequenas: a escala de entrada do ícone do `EmptyState` (0,96 timed em vez de 0,9 com `spring.gentle`) e o `pressedOpacity` duplicado.
→ designer / developer da fatia 8: o selo "Sem nota" da §1.2 (`textTertiary` sobre `surfaceHigh`) dá 4,27 : 1, abaixo do AA para texto pequeno. Usem `textSecondary` (6,85 : 1) no texto do selo, ou fundo `surface` (`textTertiary` 5,48 : 1).
→ developer (próxima rodada, se o chief aceitar): `EmptyState` com `motion.popFrom` + `spring.gentle` no ícone, ajustando o teste. `motion.pressedOpacity` para o bloco legado.

## Fatia 3

Diff: `revisao/fatia-3.diff` (BASE `0af1bf5`, commits `3ccfd1c..dbecb4f`, 37 arquivos). Abri inteiros a `FloatingTabBar`, o `useFloatingTabBarInset`, o `AppTabs`, o `ProfileScreen` e o `useProfileViewModel`, a `StudentRow` e a `LogoutRow`, os subflows e os flows tocados. Fora do diff, conferi só o `useLogout` (inalterado desde a v1, para confirmar o logout completo) e o `motion.ts` (posição do `pressedOpacity`).

Verificação no worktree (`mobile/`, HEAD `dbecb4f`, árvore limpa):
- `yarn lint && yarn tsc && yarn test && yarn format:check && yarn maestro:check` → exit 0: **75 suítes, 593 testes**, prettier ok, 14 arquivos e 100 ids.
- Nenhuma dependência nova nem mudança nativa: `package.json`, `yarn.lock`, `ios/` e `android/` sem diff.
- Olhei o `fatia-3-lado-a-lado.png`.

**As 2 sugestões das fatias 1–2: RESOLVIDAS.**
- O ícone do `EmptyState` agora entra com opacidade em `base` e escala de `popFrom` → 1 na mola `spring.gentle`, como pede a §4.7, e o teste foi ajustado.
- `motion.pressedOpacity` foi para o bloco `// Legado v1`, com nota para usar `opacities.pressed`.
- O `illustrationScaleFrom`, que ficou sem uso, saiu.

Conferido e sem achado:
- **Troca inline (V3/N5, DV8):** `onSelectStudent` chama `selectStudent(id)` do store na hora. Ignora o aluno atual e id de fora, anuncia "Agora mostrando …" e desfaz a confirmação de saída. As queries continuam com a chave por aluno (v1), então Agenda e Boletim mudam sem sair do Perfil. O `App.test` cobre o caso de ponta a ponta ("troca no Perfil atualiza a Agenda").
- **Sair (DV7):** o 1º toque vira "Sair deste aparelho?" + Cancelar + Sair na mesma altura (56), com crossfade `base` e `ReduceMotion.Never`. Sair chama o `useLogout` da v1, sem mudança, e o `signOut('manual')` apaga o token do keychain, o aluno salvo e o cache, sem tocar na marca de instalação. Trocar de aba (blur, por `useIsFocused`) ou de aluno desfaz a confirmação. O Cancelar fica desabilitado enquanto sai. O `App.test` cobre "Sair no Perfil volta ao Login".
- **Foco do leitor:** o efeito depois do commit leva o foco para Cancelar ao confirmar e de volta para "Sair da conta" ao cancelar. O `PillButton` passou a aceitar `ref`, com teste.
- **Tab bar (§2.4, V6/N1):**
  - cápsula `floating` de 64, `maxWidth` 420, `marginBottom = max(inset − s, m)`, `paddingHorizontal` `s`/`m` por breakpoint;
  - degradê `tabBarFade` com `pointerEvents="none"`, e o contêiner usa `box-none`, então o conteúdo atrás continua tocável;
  - indicador `primaryMuted` + `glowPrimarySoft` pelo `useSlidingIndicator` (mola `snappy`, direto com reduzir movimento);
  - duas camadas de cor por proximidade, a ativa e o complemento;
  - pop do ícone, cortado com reduzir movimento;
  - `tablist`/`tab` com `selected` e rótulos `Agenda`/`Boletim`/`Perfil`; os testIDs são os da §2.4/§7;
  - `backBehavior="firstRoute"`.
- **Padding:** `useFloatingTabBarInset` = 64 + distância da borda + `m`, no `paddingBottom` e no `scrollIndicatorInsets` das três abas (Header da v1 via `AppHeader` e `ScrollView` do Perfil). O NoStudent não passa o inset, porque não tem tab bar. Há teste da ligação (o `LessonsScreen.test` falha sem a prop).
- **Perfil (§3.5/4.6):**
  - card do responsável num elemento só (nome, "responsável", CPF como a API manda);
  - `Alunos` + dica só com 2 ou mais alunos;
  - `StudentRow` de 72: avatar `m`; o atual com selo e camada de borda teal + brilho em crossfade de opacidade; os outros com rádio de 22; a linha nova faz 0,98 → 1 na mola `pop`; com 1 aluno, role `text`, sem rádio e sem toque;
  - `LogoutRow` de 56 em `danger`;
  - entrada em cascata com teto e fade com reduzir movimento;
  - `RefreshControl` teal no `/me`.
- **MVVM:** a tela só renderiza, e o estado fica no `useProfileViewModel`, que recebe `focused` para o blur ser testável. Os componentes são de apresentação. Nenhum `services/` na View.
- **Maestro:**
  - `select-student` e `logout` passam pelo Perfil;
  - 04/05/06/07 tocam na aba depois do `select-student` (ele não volta à aba de antes);
  - 08 confere a Bianca como atual e sem dica;
  - 02 confere `tab-perfil`; 09 continua sem `tab-bar` (NoStudent).
  - O `selected: true` na linha está aceito no ledger, e os testIDs dos flows batem com o código (o `maestro:check` passa com 100 ids).
- **TDD:** RED registrado para cada arquivo novo, com mutações (camada inativa, blur, `ref`) e a regressão do selo na 1ª troca.

### [SUGESTÃO] A linha do aluno atual ainda reage ao toque
- Arquivo: mobile/src/features/profile/components/StudentRow.tsx:117-122 e :131/:142
- Problema: a linha do aluno atual continua `pressable` (role `button`, `disabled` só quando há 1 aluno) e faz o `pressScale` 0,97 no `onPressIn`. O ViewModel ignora o toque. A §3.5 diz "tocar no atual não faz nada (sem anúncio, sem animação)".
- Cenário: com 2 alunos, tocar no Rafael (atual) encolhe e volta a linha sem nenhum efeito, e o VoiceOver anuncia "botão, selecionado" num elemento que não faz nada.
- Correção sugerida: `disabled={!pressable || selected}` e `accessibilityRole` `button` só quando `pressable && !selected`. Isso também corta a escala no toque. Adicionar um teste de "atual não escala nem chama `onPress`".

### [SUGESTÃO] Com reduzir movimento, selo e rádio aparecem sem fade
- Arquivo: mobile/src/features/profile/components/StudentRow.tsx:47 e :222
- Problema: no ramo de reduzir movimento, o selo usa `FadeIn.duration(fast)` sem `.reduceMotion(ReduceMotion.Never)`. O `FadeIn` padrão segue o sistema, então com reduzir movimento ligado o fade é pulado e o selo e o rádio aparecem secos. Isso diverge da §4.6 ("reduzir movimento: igual" / "sem escala") e do padrão do próprio diff, que usa `Never` no `FadeOut` e na `LogoutRow`.
- Cenário: reduzir movimento ligado, trocar de aluno. A camada de destaque faz crossfade, mas o selo "Atual" aparece de uma vez.
- Correção sugerida: `.reduceMotion(ReduceMotion.Never)` nos dois `FadeIn` de entrada.

### Deixei de julgar
- Perfil sem logo/saudação no topo: é o `CompactHeader` da fatia 4 (ressalva 1).
- Crossfade de cor dos itens da tab bar com reduzir movimento: decisão do ledger, vai para a fatia 9.
- `selected: true` no Maestro: aceito no ledger. Só a execução real prova.
- Compact (320) da `LogoutRow`: sem a pergunta visível, o leitor cai em "Cancelar" sem o contexto "Sair deste aparelho?". O design pede que a pergunta suma no compact e não diz nada do rótulo acessível. Fica para o designer, se quiser ("Cancelar sair" / anúncio da pergunta).
- `boxShadow` da cápsula e do indicador e o recorte do degradê (96, maior que o contêiner) no Android: só o CI e o qa provam.
- Vídeo sem toque real (ressalva 4): limitação da máquina, já registrada.

### Veredito da Fatia 3
- **Spec ✅:** `FloatingTabBar` (2.4) com 3 abas e indicador animado, sem cobrir o conteúdo (N1). `useFloatingTabBarInset`. `ProfileScreen` + `useProfileViewModel` (3.5) com nome, CPF mascarado, alunos com o atual em destaque, troca na hora e Sair com logout completo (N5, V3). `tab-perfil`. Os subflows `logout` e `select-student` são novos, e os flows 02/04/05/06/07/08/10 foram ajustados. As sugestões das fatias 1–2 entraram. Nada além do plano.
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 2 sugestões).

## Mensagens
→ chief: fatia 3 aprovada. A troca inline, o logout completo (o `useLogout` da v1, sem mudança), o padding da tab bar e a acessibilidade das abas e da confirmação estão certos e cobertos por teste, inclusive de integração no `App.test`. As 2 sugestões são de uma linha cada e podem ir na fatia 4: a linha atual ainda escala ao toque, e o selo/rádio aparecem sem fade com reduzir movimento.
→ developer (fatia 4, se o chief aceitar): na `StudentRow`, `disabled={!pressable || selected}` e role `button` só quando trocável, com teste. `.reduceMotion(ReduceMotion.Never)` nos `FadeIn` do selo e do rádio.
→ designer (opcional): no compact a pergunta "Sair deste aparelho?" some, e o leitor de tela fica só com "Cancelar"/"Sair". Vale um rótulo acessível com o contexto?
→ qa: com VoiceOver, conferir o foco em Cancelar ao pedir para sair. Conferir também que o último item de cada aba fica acima da cápsula, e que tocar fora da cápsula (na área do degradê) atinge o conteúdo.

## Fatia 4

Diff: `revisao/fatia-4.diff` (BASE `dbecb4f`, commits `cfd135b..0b9aa47`, 47 arquivos). HEAD do worktree no momento da revisão: `0b9aa47`, árvore limpa. A fatia 5 ainda não tinha commit, então tudo o que rodei é só da fatia 4.

Abri inteiros `StudentChip`, `CompactHeader`, `TabScreenLayout`, `useHeaderViewModel`, `NoStudentScreen`, `BootErrorScreen`, a parte nova do `ErrorState`, `RootStack`/`types.ts` e os flows 02/07/08/09. Fora do diff, conferi só:
- o `useBootErrorViewModel`, inalterado: o retry decide `App`/`NoStudent`, e o 401 vai ao Login;
- o `useSessionStudent`, por causa do aviso de `act` abaixo.

Verificação (`mobile/`):
- `yarn lint && yarn tsc && yarn test && yarn format:check && yarn maestro:check` → exit 0: **75 suítes, 601 testes**, prettier ok, 14 arquivos e 102 ids.
- Nenhuma dependência nova nem mudança nativa.
- Rodei a suíte 4 vezes. Numa delas saíram 2 avisos de `act` (SUGESTÃO 1).

**As 3 sugestões da fatia 3: RESOLVIDAS.**
- A linha do aluno atual não é mais botão nem escala (`StudentRow.tsx:138,147`).
- O selo e o rádio entram com `FadeIn` + `ReduceMotion.Never`.
- No compact, os botões levam o contexto "Sair deste aparelho? Cancelar/Sair".

Os três itens têm RED registrado.

Conferido e sem achado:
- **Nada sobrou do modal:** grep em `src/` e `.maestro/` por `SelectStudent`, `select-student-`, `header-switch-student`, `header-logout-button`, `ActionBar`, `AppHeader`, `SectionTitle`, `StudentCard` e `useSelectStudent`.
  - Restam só asserções negativas nos testes (`queryByTestId(...)).toBeNull()`) e uma string sintética no teste do matcher do Maestro.
  - A rota `SelectStudent` saiu do `RootStack` e do `RootStackParamList`.
  - As strings `selectStudent.*`, `header.switchStudent*`/`logout*` e `motion.selectStudentBackDelay` saíram.
  - Não há config de deep link para quebrar.
- **Chip → Perfil:**
  - `onPressStudent` → `navigate('Perfil')`, também com 1 aluno;
  - pílula de 40 com `hitSlop` 2 (44), avatar `s`, "Rafael · 7EF", chevron 16 `textTertiary` e `pressScaleSmall`, sem escala com reduzir movimento;
  - crossfade por `key={student.id}` com `Never`;
  - role `button`, rótulo da v1 e hint "Abre o perfil".
  - Há teste de componente, de VM e de integração (`App.test`: chip no Boletim → Perfil → troca → Boletim com o aluno novo).
- **`CompactHeader` (§2.6):**
  - linha do logo de 56 (80 × 13, role `image`);
  - saudação `label` e título `headline`, os dois com role `header`;
  - divisória hairline com `opacity = clamp(scrollY / m)` na UI thread, alimentada pelo `useAnimatedScrollHandler` do `TabScreenLayout`;
  - `showChip={false}` no Perfil, sem saudação no BootError;
  - entrada §4.3 (com a repetição por aba registrada como ressalva da fatia 9).
- **`TabScreenLayout`:** header fixo + `Animated.ScrollView` com o inset da tab bar no `paddingBottom` e no `scrollIndicatorInsets`. O `RefreshControl` do Perfil foi mantido.
- **NoStudent (§3.6):** `CompactHeader` sem chip ("Olá, Carlos", "Sua conta"), `EmptyState` neutro centralizado na sobra e `PillButton secondary sm` "Sair" ligado ao `useNoStudentViewModel` (logout imediato da v1).
- **BootError (§3.7):**
  - só o logo + "Sem conexão";
  - `ErrorState` com `WifiOffIcon`, "Tentar de novo" `primary md` e "Sair" `ghost sm` em `secondaryAction`;
  - o anúncio ao leitor e o shake continuam no `ErrorState`;
  - o retry e o Sair offline seguem no VM da v1, com teste "Sair funciona sem API".
- **MVVM:** a tela só renderiza. O `useHeaderViewModel` encolheu para nome, aluno e `onPressStudent`, e o layout liga o VM ao header.
- **Flows:** 02 (chip pelo rótulo, título `Agenda`), 07 (Boletim → chip → Perfil → Joana → Boletim `2EM` + chip "aluno joana"), 08 (chip "aluno bianca"), 09 ("Sua conta", sem chip, sem `tab-bar`, Sair → Login). Os ids batem com o código.
- **Ambiguidade do flow 07 (dois `header-student-chip` montados):** não há ambiguidade que mude o resultado.
  - O header é fixo e fica na mesma posição nas três abas, então mesmo que o Maestro escolha o chip da Agenda escondida, a coordenada do toque cai no chip visível do Boletim.
  - As asserções de texto valem para os dois chips, que mostram o mesmo aluno, porque o aluno é global.
  - Com o `react-native-screens`, as abas inativas ficam fora da hierarquia nativa. O flow 07 da v1 já dependia disso no `assertNotVisible: agenda-day-dropdown`.
  - Não vejo motivo para um id por aba. Se a 1ª execução real acusar, a saída é um `index` no seletor ou um id por aba (`agenda-student-chip`).
- **TDD:** RED registrado por arquivo, com a nota honesta de que a 1ª rodada falhou pelo motivo errado e foi refeita. O `App.test` foi reescrito depois e está declarado assim.

### [SUGESTÃO] Aviso de `act` intermitente no `useHeaderViewModel.test`
- Arquivo: mobile/src/features/header/__tests__/useHeaderViewModel.test.tsx:68-72
- Problema: o caso "sem /me no cache" monta o hook sem dado do `/me`. O `useMeQuery` dispara a busca, e a resposta chega depois do fim do teste. Ela chega pelo `notifyManager` do TanStack e, em seguida, pelo `selectStudent` no efeito do `useSessionStudent.ts:28`.
- Cenário: rodei `yarn test` 4 vezes. Numa delas saíram 2 avisos "An update to HookContainer inside a test was not wrapped in act(...)" nesse arquivo, e os stacks apontam para `notifyManager.ts:51` e `session.store.ts:69`. O 02-dev diz 0 avisos, e a T13 da v1 estabeleceu esse padrão (CI limpo).
- Correção sugerida: no fim do caso, esperar a query assentar (`await waitFor(() => expect(queryClient.isFetching()).toBe(0))`). Outra opção é deixar o `/me` sem resposta (handler MSW que não resolve) e desmontar no fim.

### [SUGESTÃO] Aluno atual "esmaecido" no VoiceOver
- Arquivo: mobile/src/features/profile/components/StudentRow.tsx:147
- Problema: a correção da minha sugestão da fatia 3 usou `disabled={!switchable}`. O `Pressable` mescla isso em `accessibilityState.disabled`, então o VoiceOver lê o aluno atual como "esmaecido/indisponível" (ressalva 3 do developer).
- Cenário: VoiceOver no Perfil com 2 alunos lê "Rafael da Silva, turma 7EF…, selecionado, esmaecido". "Esmaecido" soa como erro ou bloqueio, quando é só o atual.
- Correção sugerida: tirar o `disabled` e deixar a linha sem papel de botão e sem `onPress`/`onPressIn` quando não é trocável (`onPress={switchable ? onPress : undefined}`, idem para a escala). Um `Pressable` sem handler não recebe toque nem anuncia "esmaecido". É uma decisão de a11y pequena; o designer pode confirmar.

### Deixei de julgar
- Entrada do header a cada 1ª visita de aba (a §4.3 quer uma vez por `AppTabs`): ressalva registrada para a fatia 9.
- Tokens legados sem uso (`sectionTitle`, `greeting*`, `actionBar`, `studentCard`, `logoutIcon`): limpeza da fatia 9.
- Compact (320) do chip e a divisória acendendo com o dedo: sem gesto aqui. A divisória está coberta em teste de componente.
- Android, Maestro real e toque físico: ressalvas da máquina.

### Veredito da Fatia 4
- **Spec ✅:** `CompactHeader` + `StudentChip` (§2.6) nas 3 abas, com o chip levando ao Perfil. `ActionBar`, `Header` e `SelectStudentScreen` + VM e rota foram removidos. NoStudent e BootError estão no visual novo (§3.6, §3.7) com o comportamento da v1. Flows 02, 07, 08 e 09 atualizados. As 3 sugestões da fatia 3 entraram. A remoção de `StudentCard`/`SectionTitle` é consequência direta (ficaram sem uso).
- **Qualidade: APROVADO** (0 bloqueantes, 0 importantes, 2 sugestões).

## Mensagens
→ chief: fatia 4 aprovada. Do modal não sobrou nada (rota, tipo, testID ou string). O chip leva ao Perfil, e NoStudent e BootError mantêm o comportamento. O flow 07 com dois chips montados não é ambíguo na prática: o header fica na mesma posição em todas as abas, e o aluno é global. As 2 sugestões são pequenas e podem ir junto com a fatia 5: o aviso de `act` intermitente (1 em 4 execuções) no `useHeaderViewModel.test` e o "esmaecido" do aluno atual no VoiceOver.
→ developer (depois da fatia 5, se o chief aceitar):
- no `useHeaderViewModel.test`, esperar `isFetching() === 0` no caso "sem /me";
- na `StudentRow`, trocar `disabled` por handlers ausentes quando não é trocável. Mantém role `text`, sem escala e sem "esmaecido".
→ qa: no 1º run do Maestro, observar o flow 07 (toque no `header-student-chip` com Agenda e Boletim montados). Com VoiceOver, conferir o chip ("Aluno Rafael… botão, Abre o perfil") e a linha do aluno atual no Perfil.

## Fatia 5

Modo tarefa, revisão por diff + leitura dos arquivos (suíte não reexecutada; relatório do dev: lint/tsc/test/maestro:check verdes). Só BLOQUEANTE/IMPORTANTE.

Conferido sem achado: regra do ViewModel intacta (só a saída `cpf.error` separada de `errorMessage`); `canceled`, sessão expirada, shake e foco seguem no VM; `Screen` sem `scroll/keyboard/footer` (nenhum outro `<Screen>` os usava segundo o dev; o tsc passa); logo da splash e do Login usam a mesma conta `loginLogoTop` (Login: `insets.top` do Screen + `loginLogoTop`; splash: `loginLogoCenterY`), coerentes.

### [IMPORTANTE] Banner de erro monta depois do dado com layout animation `entering`/`exiting`
- Arquivo: mobile/src/features/auth/components/LoginErrorBanner.tsx:34-50 (usado em LoginScreen.tsx com `key={vm.errorMessage}`)
- Problema: o banner nasce depois do resultado da mutation (erro 401/429/rede) e remonta a cada erro, com `FadeInDown`/`FadeIn` em `entering` e `FadeOut` em `exiting`. É o padrão que o ledger (linha 27) manda evitar no Android (reanimated 4.7.1 deixa a view invisível); a v2 trocou o `Entrance`/shared value por `entering` direto.
- Cenário: Android, CPF válido + senha errada → o flow `01-login-invalido` espera `login-error-message` visível por 10 s; se a view ficar invisível, o flow falha e o usuário não vê o motivo do erro (só o leitor de tela anuncia). O mesmo vale para o erro do campo em `TextField.tsx:322` (`errorEntering`, aparece no blur, após o estado mudar).
- Correção sugerida: animar por shared value (padrão `EnterDown`/`Entrance` das outras fatias) e tirar `entering`/`exiting` do banner e do erro do campo; manter o `useEffect` de anúncio.

### [IMPORTANTE] Android: `reveal()` roda antes de o `keyboardInset` existir, então a rolagem é cortada
- Arquivo: mobile/src/hooks/useKeyboardReveal.ts:107-115
- Problema: no `keyboardDidShow` o hook faz `setKeyboardInset(...)` e logo chama `reveal()` → `scrollTo({y})`. O padding de baixo só cresce no render seguinte, então o `scrollTo` é limitado pela altura de conteúdo antiga e ninguém repete o reveal depois do layout novo. O dev marca como "não verificado em aparelho".
- Cenário: Android, telefone pequeno/médio, foco na Senha → o teclado sobe, o `scrollTo` clampa no máximo antigo e o botão "Entrar" pode ficar parcialmente atrás do teclado até o usuário rolar (o padding extra permite rolar, mas não é automático). No iOS o `automaticallyAdjustKeyboardInsets` tem corrida parecida com o `keyboardWillShow`, mas é do sistema e menos provável.
- Correção sugerida: disparar `reveal()` num `useEffect` dependente de `keyboardInset` (ou em `onContentSizeChange` da ScrollView) em vez de logo após o `setState`; validar num emulador Android antes do merge.

## Fatia 8

Diff: `revisao/fatia-8.diff` (branch `v2-boletim`, BASE `0b9aa47`, commits `52961e1..86e4e18`). Pelas regras novas do usuário, esta revisão cobre só correção, contrato, a11y grave e risco Android. Não cobre testes novos.

**Verificação** (worktree `v2-boletim/mobile`, HEAD `86e4e18`, árvore limpa):
- `yarn lint && yarn tsc && yarn test && yarn maestro:check` → exit 0: 73 suítes, 585 testes, 14 arquivos e 98 ids.
- Os 2 avisos de `act` que saem são os do `useHeaderViewModel.test`, que vem da base (fatia 4, já apontado lá). Nada desta fatia.

**Conferido e sem achado:**
- **Números contra `docs/data/responsaveis.json`.** Recalculei:

  | Boletim | Média (12 notas) | Arredondada | Faltas | Abaixo de 7 |
  |---|---|---|---|---|
  | Rafael 2025 T1 | 8,1667 | **8,2** | **14** | **1, Arte 6,5** → `gradeBand` 6,5 = "Atenção" |
  | Rafael 2024 T3 | — | 8,1 | — | Projeto 6 |
  | Joana 2025 T1 | — | 8,5 | 9 | — |

  O `averageGrade` faz a média só das notas lançadas, com uma casa. A faixa da média usa o valor arredondado (decisão registrada). Faltas `null` contam como 0. O `partial` só existe com um trimestre parcialmente lançado.
- **Trimestre inicial:** o maior com alguma nota lançada; sem nenhuma, o 1º. Dá T1 em 2025 e T3 em 2024. O "Ainda não avaliado" aparece quando o trimestre não tem nota (`summary.evaluated`).
- **Troca de aluno → ano mais recente:** o reset por `studentId` foi mantido (ano, retry, shake). O trimestre escolhido zera por `aluno:ano`. O retry escolhe a query que falhou. O 404 mantém a descrição durante o retry.
- **Risco Android:** nada do que a tela nova monta depois dos dados usa `entering`. Os segmentos, o resumo + legenda e os cards entram pelo `Entrance` (valor animado). Com reduzir movimento, que é o caso do emulador do CI, fazem só um fade `fast` por `withTiming`. A `GradeBar` usa `scaleX` por valor animado. O único `entering` que sobra é o do `EmptyState` compartilhado, no "Ainda não avaliado" e no boletim vazio, que está adiado para a fatia 9 no ledger.
- **a11y:** resumo, card e legenda são um elemento só cada um, com rótulo que traz a faixa por extenso (a cor nunca sozinha). A `GradeBar` fica escondida do leitor. O segmento é `tablist`/`tab` com `selected`, e com 1 opção vira pílula de role `text`.

### [IMPORTANTE] Itens do segmento com alvo de toque de 34, não 44
- **Arquivo:** mobile/src/components/SegmentedControl.tsx:36 e :88-93 (o container está em :167-178)
- **Problema:** o `Pressable` do item não tem altura própria. Ele estica na linha interna do container, que tem `padding="xs"` (4) e borda de 1. No `md`, a altura do toque fica em 44 − 2 − 8 = **34**, sem `hitSlop`. No `sm`, 36 − 10 = 26, mais o `hitSlop` de 4 em cima e embaixo = **34**. A §6.3 pede 44 nos dois: "segmento sm / md: 36 / 44, `hitSlop` 4 no sm". As contas do design consideram o item com a altura do container, mas o código desconta o padding. O V2 do brief manda manter "alvos ≥ 44" da v1, e na v1 a T10 tratou o mesmo caso como IMPORTANTE.
- **Cenário:** um toque nos 5 pt de cima ou de baixo do segmento "2º tri" cai no container, que não é pressionável, e nada acontece. O mesmo vale para o segmento de ano. Em VoiceOver e TalkBack não muda nada, mas no dedo o alvo é 23 % menor que o mínimo.
- **Correção sugerida:** `hitSlop` vertical calculado: `(sizes.touchTarget − alturaDoItem) / 2`, com `alturaDoItem = height − 2 × padding − 2`, o que dá 5 no `md` e 9 no `sm`. Outra opção é mover o padding do container para dentro do `Pressable`, para o item ocupar a altura toda.

### Deixei de julgar
- Os ids `boletim-term-tab` (a §7.1 pede `boletim-term`), a largura fixa de 112 no segmento de ano e o segmento de trimestre virando skeleton na troca de ano: os três são desvios aceitos no ledger.
- O `entering` do `EmptyState`/`ErrorState` compartilhados: fica para a fatia 9 (ledger).
- Testes novos, vídeo, QA e Android: fora do escopo pelas regras novas do usuário.

### Veredito da Fatia 8
- **Spec ✅:** segmento de ano e de trimestre, resumo com média e faltas, cards com a barra por faixa e o rótulo textual, e o "Ainda não avaliado" (N4/V8), sem acordeão. Os números batem com o JSON.
- **Qualidade: APROVADO** (0 bloqueantes, 1 importante: o alvo de toque do segmento).

## Mensagens
→ chief: fatia 8 aprovada, e os números batem com o JSON. Nada monta com `entering` depois dos dados, fora o `EmptyState`, que já está na fatia 9. Uma correção antes ou junto do merge: os itens do `SegmentedControl` têm 34 de alvo, não 44 (`SegmentedControl.tsx:36` e `:88-93`). A correção é calcular o `hitSlop` vertical a partir da altura real do item.

## Fatias 6 e 7

Modo tarefa (branch `v2-agenda`, `74320e1..f3350ca`). Rodado no worktree: `yarn lint`, `yarn tsc`, `yarn maestro:check` (14 arquivos, 99 ids) e `yarn test` (74 suítes, 595 testes) passam.

Conferido sem achado: D35 (`initialAgendaDate` por dia da semana; troca de aluno zera `chosenDate`/retry e remonta o pager por `studentKey`); `useMinuteClock` só faz `setState` quando a fase muda, os minutos vão para shared value e só a página de hoje troca de identidade; `NowLine` só entra com `clock`, passado só quando `item.isToday`; `clockPhase` correto nas fronteiras (fim = início da próxima vira `lesson`, vão vira `break` apontando a próxima aula, antes da 1ª e depois da última); indicador da faixa lê `progress` do `onScroll` do pager; nada do que monta depois dos dados usa `entering` (`AgendaEnter` por shared value; só o `EmptyState` compartilhado, já para a fatia 9); flows 02/04/07 coerentes com os novos testIDs.

Nenhum BLOQUEANTE ou IMPORTANTE.

- SUGESTÃO (uma linha): `NowBanner.tsx:103-114` usa `accessibilityLiveRegion="polite"` e `announceForAccessibility`; no Android a troca de fase pode ser lida duas vezes (o comentário do dev diz "no iOS", o código anuncia nas duas plataformas).

**Veredito: APROVADO. Spec ✅, Qualidade APROVADO (0 bloqueantes).**

## Fatia 9

Modo tarefa, só pelo diff (`b17ac61..9a4e784`) e `git grep` no commit `9a4e784` (sem rodar nada no worktree; lint/tsc/602 testes/maestro:check pelo relatório do dev).

Conferido sem achado:
- `entering=`/`exiting=` restantes: só `LoginScreen` e `CompactHeader`, que montam com a tela. `LoginErrorBanner`, `TextField`, `EmptyState`, `LogoutRow` saíram de layout animation (a fatia 5 IMPORTANTE nº 1 fica resolvida por aqui).
- `LogoutRow`: sem `exiting`, a camada antiga é desmontada na hora; a nova é `Entrance` absoluta, então nada fica por cima do toque.
- `HeaderEntranceProvider`: o ref `played` marca na 1ª montagem do header da Agenda; Boletim e Perfil (lazy) montam parados; fora do provider entra sempre.
- Boletim: `onRefresh` refaz `yearsQuery` e, se há ano, `reportQuery`; `refreshing` volta no `finally`.
- Remoções: nenhum uso restante de `Dropdown`, `PrimaryButton`, `SecondaryButton`, `EnterDown`, `AgendaEnter`, `UnderlineInput` em `mobile/src` e `.maestro` (só comentários).
- README: diz que a entrega oficial é a v1 (`main`) e que a v2 não tem testes novos/QA/segurança.

Nenhum BLOQUEANTE ou IMPORTANTE.

- SUGESTÃO (uma linha): `Entrance.tsx` com reduzir movimento nasce com opacidade 0 e faz fade `fast`; o `EnterDown` antigo nascia visível (`progress` = 1). Se quiser manter "nasce visível", inicie `progress` em 1 quando `reducedMotion`.
- Ainda aberto da fatia 5: o reveal do teclado no Android (`useKeyboardReveal.ts`, IMPORTANTE nº 2) não aparece neste diff.

**Veredito: APROVADO. Spec ✅, Qualidade APROVADO (0 bloqueantes).**
