# Ledger — app-v2

Decisão: Perfil só com troca de aluno (usuário); calendário como faixa semanal (chief, V4).
v2: BASE f9023f5 (branch v2 a partir de release/v1, worktree .claude/worktrees/v2)
Design: designer aberto (01-design.md)
Decisão [usuário, 2026-10-28]: ao finalizar a v2, apenas criar a branch release/v2 (sem PR, sem merge na main e sem integrar à release/v1).
Design: 01-design.md entregue (9 fatias; sem lib nova) — aguardando aprovação do usuário com DV2/DV3/DV5/DV7/DV8/DV9.
Plano: 00-plano.md com 9 fatias. Design aprovado pelo usuário em 2026-10-28 ("aprovado, pode começar a implementação da v2").
Fatia 1: BASE f9023f5 (v2)
Fatias 1–2: entregue PRONTO COM RESSALVAS (commits daf17fe..0af1bf5) — review aberto. Desvio aceito: degradês com opacidade por parada (Stop do react-native-svg ignora rgba).
Ambiente: repositório Faelst/fiap criado pelo usuário (público, main e release/v1). O developer das fatias 1–2 fez push de `v2` para origin sem pedido — não desfeito (inofensivo); daqui em diante, developers da v2 NÃO fazem push (só o chief, e só a release/v2 no fim, conforme o usuário).
Fatias 1–2: concluídas (commits daf17fe..0af1bf5, review limpo). SUG EmptyState (popFrom + spring.gentle) e motion.pressedOpacity no legado → entram na fatia 3. Contraste do selo "Sem nota" (textTertiary/surfaceHigh 4,27:1) → fatia 8 usa textSecondary.
Fatia 3: BASE 0af1bf5 (v2)
Fatia 3: entregue PRONTO COM RESSALVAS (commits 3ccfd1c..dbecb4f) — review aberto.
Decisão: Maestro confere a linha do aluno por `selected: true` (iOS esconde filhos de elemento acessível, mesmo padrão da v1) — aceito.
Decisão: crossfade da cor dos itens da tab bar com reduzir movimento → fatia 9.
Fatia 3: concluída (commits 3ccfd1c..dbecb4f, review limpo). SUG StudentRow (atual sem papel de botão/desabilitada) + ReduceMotion.Never no selo/rádio + rótulo acessível "Sair deste aparelho?" na confirmação compacta → entram na fatia 4.
Decisão: fatias 6 e 7 (Agenda: faixa+grade e linha de agora) num developer só, para encurtar o prazo — mesma tela; revisão única maior.
Fatia 4: BASE dbecb4f (v2)
Fatia 4: entregue PRONTO COM RESSALVAS (commits cfd135b..0b9aa47) — review aberto.
Decisão: review da fatia 4 em paralelo com o developer da fatia 5 (Login) para encurtar o prazo — arquivos disjuntos (header/telas de estado vs login); correções da fatia 4, se houver, entram depois da fatia 5 na mesma branch — custo: conflito pequeno se ambos tocarem strings/tema.
Fatia 5: BASE 0b9aa47 (v2)
Fatia 4: concluída (commits cfd135b..0b9aa47, review limpo). SUG act em useHeaderViewModel.test e StudentRow sem disabled (handlers ausentes) → entram na fatia 6+7 (próximo developer), depois da fatia 5.
Decisão [usuário pediu equipes em paralelo]: squads paralelos — Login (fatia 5) na v2; Agenda (fatias 6+7) em v2-agenda; Boletim (fatia 8) em v2-boletim, ambos a partir de 0b9aa47 (fatia 4). Merge na v2 pelo chief ao fim de cada review; conflitos esperados em strings.ts, sizes e flows — custo: cota de uso consumida mais rápido.
Decisão [usuário, "remova parte de segurança e QA, para andar mais rapido"]: v2 sem revisão de segurança e sem QA; mantém review de código por equipe e uma revisão final de código enxuta; release/v2 é criada logo depois. Risco registrado: v2 sem validação de segurança/QA dedicada (a v1 continua sendo a entrega validada).
Decisão [usuário, "parte de test de component tbm, pode remover da v2"]: v2 sem testes novos de componente/unitários e sem TDD a partir da fatia 5; mantidos lint, tsc, suíte existente verde (testes de código removido são atualizados/removidos) e maestro:check. Risco registrado: código novo da v2 sem cobertura de teste.
Decisão: equipes Agenda e Boletim da v2 avisadas para não usar layout animation `entering` em conteúdo montado depois dos dados (bug Android do reanimated achado no Maestro da v1); usar animação por shared value (padrão EnterDown).
Fatia 8 (equipe Boletim): entregue PRONTO COM RESSALVAS (commits 52961e1..86e4e18, v2-boletim) — review aberto. Sem vídeo (simulador disputado entre equipes).
Decisão: equipes não gravam mais vídeo; uma gravação única do app integrado na v2 depois do merge. EmptyState/ErrorState sem `entering` (risco Android) → fatia 9. Desvios aceitos: `boletim-term-tab`, largura fixa 112 no segmento de ano, segmento de trimestre vira skeleton na troca de ano.
Fatia 5 (Login): entregue PRONTO COM RESSALVAS (commits 62e10c4..bbfb4e5, inclui as 2 SUG da fatia 4) — review aberto (revisor 2, em paralelo à revisão da fatia 8). Teclado: useKeyboardReveal (iOS automaticallyAdjustKeyboardInsets + scroll; Android soma altura do teclado) — sem prova visual.
Fatia 5: review REPROVADO (0 bloq, 2 IMP — banner/erro do campo com entering no Android; reveal do teclado no Android antes do padding crescer) — rodada 1/3 no mesmo developer.
Fatia 8: review APROVADO (0 bloq, 1 IMP — alvo de toque do SegmentedControl 34 em vez de 44) — rodada 1/3 curta na equipe Boletim.
Fatia 8: concluída (commits 52961e1..968ae9c; rodada 1 de uma linha conferida pelo chief no diff). Merge na v2 depois da rodada do Login (mesmo worktree em uso).
Fatias 6+7 (equipe Agenda): entregue PRONTO COM RESSALVAS (commits 74320e1..f3350ca, v2-agenda) — review aberto. EmptyState com entering (risco Android) → fatia 9.
Fatia 5: concluída (commits 62e10c4..8762ae4; rodada 1 conferida pelo chief: banner/erro do campo sem entering, reveal com onContentSizeChange).
Fatias 6+7: concluídas (commits 74320e1..f3350ca, review limpo). SUG NowBanner com liveRegion + announce (dupla leitura no Android) → fatia 9. Fatia 8 integrada na v2 sem conflito.
Integração: v2-boletim e v2-agenda mergeadas na v2 (1 conflito no flow 07, resolvido mantendo os dois lados); lint, tsc, 623 testes e maestro:check verdes. Fatia 9: BASE 00ae80e (v2)
Decisão: antes de criar release/v2, mergear origin/master (ícone, CI, Maestro local, docs, dropdown Android) na v2; conflitos resolvidos pelo chief preservando a UI da v2.
Fatia 9: entregue PRONTO COM RESSALVAS (commits b17ac61..9a4e784; entering só no Login e CompactHeader; 602 testes) — review rápido aberto em paralelo ao merge da master.

## 2026-10-28 — fechamento

- Fatia 9 revisada: APROVADO, 0 bloqueantes e 0 importantes (`03-review.md`).
- `origin/master` integrada na `v2` (becaedd). Conflitos nos flows 02, 04–08 ficaram com a versão da v2.
  Checks depois do merge: tsc, lint, format:check, maestro:check (15 arquivos, 96 ids) e 608 testes verdes.
- `release/v2` criada a partir da `v2` e enviada ao GitHub. Sem PR e sem merge, como pedido.
- O revisor da fatia 9 citou o IMPORTANTE nº 2 da fatia 5 (teclado no Android) como aberto, mas ele foi corrigido
  na rodada 1 da fatia 5 (`onContentSizeChange`) e não aparecia no diff da 9. Segue sem prova visual no Android.
- Fica como sugestão (não feita): a `Entrance` nascer visível com reduzir movimento.
