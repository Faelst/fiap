# Ledger — fiap-school

Decisão: trilhas api/ e mobile/ rodam em paralelo, cada uma no seu worktree — pastas separadas no monorepo, nenhum arquivo em comum além da raiz (tocada só pela trilha tooling) — custo se errado: conflito no merge do lint-staged/workflows, resolvível à mão.
Decisão: sem remote no GitHub, o fim de cada trilha é a branch local commitada; PRs abrem quando o usuário criar o repositório público — custo se errado: nenhum.
Decisão: agents do squad ainda têm texto do Safety Swap até a Tarefa 1; cada prompt de developer diz explicitamente o contexto do projeto e que o brief/plano vencem — custo se errado: developer seguir regra do SS (ex.: Expo Router), pego no review.
Tarefa 1: BASE 40c8577 (tooling)
Tarefa 3: BASE 40c8577 (api)
Tarefa 7: BASE 40c8577 (mobile)
Tarefa 1: developer aberto (tooling)
Tarefa 3: developer aberto (api)
Tarefa 7: developer aberto (mobile)
Design: designer aberto (01-design.md)
Decisão: OTA com expo-updates pedido pelo usuário durante o turno — entra como D34 e Tarefa 15 — custo se errado: nenhum, é pedido explícito.
Tarefa 1: entregue PRONTO COM RESSALVAS (commit 8d61283) — review aberto
Decisão: remover do CLAUDE.md o aviso "agents ainda citam Safety Swap" entra na Tarefa 2 (mesma branch tooling) — custo se errado: nenhum.
Tarefa 1: review APROVADO (0 bloq, 2 IMPORTANTES, 3 sugestões) — corrigir IMPORTANTE 1 e 2 + SUGESTÃO 4 e 5 na rodada 1/3; SUGESTÃO 3 adiado (chief.md citar a pasta atual é aceitável enquanto há uma tarefa só)
Decisão: a branch spec/fiap-school vira o primeiro PR para main; os PRs das trilhas abrem para main depois que ele for mergeado. Diffs de revisão usam sempre a BASE do ledger (40c8577), nunca main — custo se errado: PR das trilhas mostrar os commits da spec, resolvível com rebase.
Decisão: rotas por aluno usam o parâmetro `:id` (contrato do plano vence o texto do D21); o guard de ownership lê params.id; /demo/grades (Tarefa 16) valida o studentId do corpo no use case — custo se errado: guard deixar passar IDOR no demo, coberto por e2e da Tarefa 16.
Decisão: skills do SS sem uso continuam em .claude/skills (inofensivas, removê-las fica para a Tarefa 17 se quiser enxugar) — custo: nenhum.
Tarefa 1: rodada 1/3 (4 resolvidos pelo developer — IMP 1, IMP 2, SUG 4, SUG 5; commits 8d61283..ff99716) — re-review restrito aberto
Design: 01-design.md entregue
Decisão: texto do botão é "FAZER LOGIN" (Figma vence o "Entrar" do M1) — custo: nenhum.
Decisão: linhas de opção do dropdown e de disciplina com 44pt (acessibilidade) em vez de 36/37 do Figma — custo se errado: diferença visual de 8pt, revertível no tema.
Decisão: aceitas as escolhas do designer fora do Figma — fade no lugar de contagem de notas, logout sem confirmação, barra de ações fixa, ilustração reaproveitada no "sem aluno", erro de rede só com texto + botão — custo se errado: ajuste de UI localizado.
Decisão: chief exporta do Figma o logo (nó 4001:4) em SVG e a ilustração no-classroom em @2x/@3x, porque os PNG atuais são 1× e o logo borra no login — custo: nenhum.
Tarefa 3 e Tarefa 7: interrompidas pelo limite de uso; retomadas no mesmo agent após o reset
Decisão: export do logo SVG/@3x bloqueado — limite de chamadas do MCP do Figma no plano Starter; o mobile usa o PNG 1× por enquanto e o usuário exporta manualmente (nó 4001:4 → SVG; 2:66 → PNG @2x/@3x) para docs/figma/assets/ — custo: logo borrado no login até a troca (qa pega no M12).
Tarefa 1: concluída (commits 8d61283..ff99716, review limpo)
Decisão: se o PR da spec entrar na main por squash/rebase, as trilhas são rebaseadas com `git rebase --onto main 40c8577 <branch>` antes de abrir os PRs delas — fica para o fechamento (só pesa com remote) — custo: nenhum agora.
Tarefa 2: BASE ff99716 (tooling)
Tarefa 3: entregue PRONTO COM RESSALVAS (commit e1cf9b7) — review aberto
Decisão: modelo ganha AgendaDay(studentId,date) com Lesson dentro (developer) — necessário para devolver sáb/dom com lessons: [] (A4); contrato inalterado; brief atualizado — custo: nenhum.
Decisão: responsável sem aluno = Carlos Sem Aluno, CPF 314.159.265-90, senha 111111.
Decisão: Prisma 7.10.1 + adapter better-sqlite3, Nest 11.2.8, TS 5.9.3, bcryptjs (sem build nativo) — aceito.
Tarefa 3: `yarn prisma:reset` não executado — o Prisma 7 bloqueia reset por agente sem consentimento explícito do usuário; pedido ao usuário.
Tarefa 2: entregue PRONTO COM RESSALVAS (commits 45dcc6f..b3c9dc0) — review aberto
Tarefa 2: review REPROVADO (1 BLOQ — hooks dependem do yarn do PATH; 3 IMPORTANTES; 2 sugestões) — rodada 1/3 com todos os itens
Decisão: lint-staged chama eslint (sem prettier separado na api, que tem eslint-plugin-prettier) direto via binário da pasta, não `yarn lint`/`format` — desvio do plano aceito: os scripts miram a árvore toda — custo: nenhum.
Decisão: remoção do parágrafo Safety Swap do CLAUDE.md na Tarefa 2 foi pedida pelo chief (ledger anterior) — ok.
Tarefa 3: review REPROVADO (1 BLOQ — prisma generate no postinstall falha sem .env; 2 sugestões) — rodada 1/3 com o BLOQ + @@unique em TermResult; SUG do RED tardio só registrada
Decisão: ordem das aulas na agenda = ordem do JSON (campo order), que coincide com startTime nos dados oficiais; Tarefa 5 ordena por startTime e usa order como desempate — custo: nenhum.
Tarefa 2: rodada 1/3 (5 itens tratados; commits b3c9dc0..414cb6b) — re-review restrito aberto
Tarefa 2: concluída (commits 45dcc6f..414cb6b, review limpo; contrato do lint-staged já registrado acima). Trilha tooling parada até a Tarefa 17.
Tarefa 3: rodada 1/3 (BLOQ + SUG unique resolvidos pelo developer; commits e1cf9b7..c8df872) — re-review restrito aberto
Tarefa 3: concluída (commits e1cf9b7..c8df872, review limpo)
Decisão: api/dev.db local do worktree é recriado com prisma:setup (apagar + setup) antes do QA; reset só com consentimento do usuário — custo: nenhum.
Tarefa 4: BASE c8df872 (api)
Tarefa 7: entregue PRONTO COM RESSALVAS (commits 52649c8..bd67851) — review aberto
Decisão: mobile usa yarn 4.18.1 fixado na pasta (raiz e api em yarn 1) — evita o yarn 3 de ~/workspace sem env e trava a versão no CI; o mobile.yml (Tarefa 13) usa corepack e o README explica — custo se errado: dois yarns no repo, trocável só no mobile.
Decisão: RN 0.88.0 + Expo SDK 58 + reanimated 4 (D11 dizia 3; o par do RN 0.88 é o 4, API igual) — aceito.
Decisão: splash Android com logo de 180dp (limite do Android 12+) — aceito.
Tarefa 4: entregue PRONTO COM RESSALVAS (commit a5d38ab) — review aberto
Decisão: trust proxy entra na Tarefa 6; JWT_SECRET com tamanho mínimo vai para a revisão de segurança final; token de responsável apagado → use cases da Tarefa 5 devolvem 401 quando o responsável não existe — custo: nenhum.
Tarefa 4: review APROVADO (0 bloq, 1 IMP — JWT_EXPIRES_IN sem unidade vira ms; 1 SUG adiada) — rodada 1/3 só com o IMPORTANTE
Tarefa 4: rodada 1/3 (IMP resolvido pelo developer; commits a5d38ab..c36ace5) — re-review restrito aberto
Tarefa 7: review APROVADO (0 bloq, 1 IMP — modo escuro não forçado; 4 SUG) — rodada 1/3 com IMP + SUG settings.gradle + SUG restos do template + SUG palette/hitSlop (todas pequenas, antes de as telas reais começarem)
Tarefa 4: concluída (commits a5d38ab..c36ace5, review limpo); adiado — SUG "0s" aceito no JWT_EXPIRES_IN (erro de configuração, sem exemplo no repo)
Tarefa 5: BASE c36ace5 (api)
Tarefa 7: rodada 1/3 (IMP + 4 SUG resolvidos pelo developer; commits bd67851..6df8b24; Android não compilado) — re-review restrito aberto
Tarefa 7: concluída (commits 52649c8..6df8b24, review limpo; Android sem build local — prova no CI da Tarefa 13)
Tarefa 8: BASE 6df8b24 (mobile)
Tarefa 5: entregue PRONTO COM RESSALVAS (commit ea1473b) — review aberto
Tarefa 5: review APROVADO (0 bloq, 0 imp, 1 SUG — :year aceita 0x7E9/2025.0) — SUG entra na rodada 1/3 (correção pequena, evita comportamento estranho no contrato)
Tarefa 5: rodada 1/3 (SUG resolvida pelo developer; commits ea1473b..94e69d7) — re-review restrito aberto
Decisão: risco achado — ts-jest com isolatedModules emite metadado de tipo diferente do nest build, então e2e não cobrem comportamento que depende de design:paramtypes/DTOs; Tarefa 6 avalia rodar os e2e sem isolatedModules (ou sobre o build) e manter smoke no build — custo se ignorado: bug de validação que só aparece em produção.
Tarefa 5: concluída (commits ea1473b..94e69d7, review limpo; smoke no build confirmou 2025=200, 0x7E9=400)
Decisão: o risco de metadado ts-jest × build NÃO se confirmou (reviewer mediu design:paramtypes iguais nos dois); descartado — Tarefa 6 mantém só um smoke no build no CI como garantia barata.
Tarefa 6: BASE 94e69d7 (api)
Tarefa 3 (A6): yarn prisma:reset executado pelo chief com consentimento do usuário ("se for o banco do projeto da fiap pode resetar") em api/dev.db — sucesso, migration init + seed (3 responsáveis, 3 alunos)
Decisão: splash animada pedida pelo usuário vira Tarefa 8b (depois da 8, antes do Login); designer detalha a animação em 01-design.md 3.1/4.1 — custo: nenhum.
Design: splash animada especificada em 01-design.md 3.1 (nativa só fundo preto; JS com wipe + linha teal + pulo do selo; loop após 1500 ms; mínimo 1200 ms; timeout /me 8 s; trava 10 s; reduzir movimento = fades) — aceito.
Decisão: flow 03 do Maestro espera a Agenda com timeout de 12 s depois do launchApp (splash tem duração mínima) — vai para a Tarefa 14.
Tarefa 8: entregue PRONTO COM RESSALVAS (commits 6a35cae..a86adcd) — review aberto
Decisão: Reactotron só como destino do logger nesta tarefa; plugins de zustand/React Query (D15) adiados para a Tarefa 13, sempre sem rede/headers — custo: inspeção de estado menos cômoda em dev até lá.
Decisão: APK de release com HTTP em claro para a API local → network security config restrita ao host da API de demonstração entra na Tarefa 17 (CD do APK) — custo: nenhum agora.
Tarefa 8: review APROVADO (0 bloq, 0 imp, 7 SUG) — rodada 1/3 com as 7 sugestões (todas baratas; 1, 2 e 3 afetam QA/CI)
Tarefa 6: entregue PRONTO COM RESSALVAS (commits ffa4059..e0aa371; Dockerfile sem build local) — review aberto
Tarefa 6: review APROVADO (0 bloq, 0 imp, 3 SUG) — rodada 1/3 com as 3: seed só com banco vazio (ou SEED_RESET=true), job de docker build no api.yml, logger sem pino-pretty fora de dev explícito
Tarefa 6: rodada 1/3 (3 SUG resolvidas pelo developer; commits e0aa371..7a7b58c; job docker sem execução local) — re-review restrito aberto
Tarefa 6: re-review rodada 1 APROVADO; SUG nova (start:dev quebra no Windows) — rodada 2/3: NODE_ENV=development no .env.example, sem variável inline no script (avaliador pode usar Windows)
Tarefa 8: rodada 1/3 (7 SUG resolvidas pelo developer; commits a86adcd..d158e0f) — re-review restrito aberto
Tarefa 6: rodada 2/3 (SUG Windows resolvida pelo developer; commit 650b5fe) — re-review restrito aberto
Tarefa 6: concluída (commits ffa4059..650b5fe, review limpo; job docker sem execução real até haver remote)
Revisão final api: BASE 40c8577..650b5fe — code-reviewer (branch) + cyber-security abertos
Tarefa 8b: BASE pendente (aguarda re-review da Tarefa 8)
Tarefa 8: re-review rodada 1 APROVADO; 2 SUG novas (cause do ApiError carrega CPF/senha/Bearer; 'sessão expirada' em warn) — rodada 2/3 com as duas (dado sensível não pode ficar em objeto de erro)
Tarefa 8: rodada 2/3 (2 SUG resolvidas pelo developer; commit c5612af) — re-review restrito aberto
Tarefa 8: concluída (commits 6a35cae..c5612af, review limpo)
Tarefa 8b: BASE c5612af (mobile)
Revisão final api: code-reviewer APROVADO (0 bloq, 1 IMP — use cases lançam exceções HTTP do Nest, contra o D18; 5 SUG)
Decisão: corrigir o IMPORTANTE (erros de domínio + exception filter global, e2e de auth/me/students intocados como rede de segurança) e as SUG 2 (deps sem uso), 3 (repositório falso e GuardiansRepository no lugar certo), 4 (401 do guard em pt-BR), 5 (compose no filtro do api.yml) + o adiado "0s" no JWT_EXPIRES_IN — numa leva só, junto com os achados do cyber-security (aguardando). SUG 1 (throttle no Maestro) vai para a Tarefa 14.
Revisão final api: cyber-security SEGURO (0 bloq, 2 IMP — JWT_SECRET sem mínimo + placeholder no compose em 0.0.0.0; rate limit só por IP; 8 SUG)
Decisão: uma leva única de correção da trilha api com IMP do code-reviewer + SUG 2–5 + "0s", e IMP 1–2 + SUG 3–10 da segurança + teste de cobertura do ownership (todas as rotas com :id dão 403 para responsável alheio). Rodada final 1/3. Achado do /demo/grades vai para a Tarefa 16.
Revisão final api: rodada 1/3 (17 itens pelo developer; commits 650b5fe..cd07f3f) — re-review restrito do code-reviewer e do cyber-security abertos
Decisão: segredo padrão do docker-compose aceito em produção só com aviso no boot (o do .env.example é recusado) — preserva o "docker compose up" de um comando (D27) para o avaliador; README (T17) manda trocar com `openssl rand -base64 48` — custo se errado: quem expuser o compose na internet sem trocar o segredo fica vulnerável, mitigado pelo aviso.
Decisão: Maestro (T14) sobe a API com LOGIN_THROTTLE_LIMIT e LOGIN_THROTTLE_CPF_LIMIT altos.
Tarefa 8b: entregue PRONTO COM RESSALVAS (commits f8e0e5f..36b80bb) — review aberto
Revisão final api: re-review rodada 1 — code-reviewer APROVADO com 1 IMP novo (limite por CPF conta logins certos); cyber-security SEGURO com SUG opcional R1-1 (segredo gerado no volume)
Decisão: rodada 2/3 da trilha api — limite por CPF passa a contar só falhas e zera no sucesso (opção a); limites sobrescrevíveis no compose; aceita a R1-1: sem JWT_SECRET o container gera um segredo aleatório na 1ª subida e grava no volume (/app/data/jwt-secret), e o compose deixa de ter segredo padrão — revoga a decisão anterior de aceitar o placeholder do compose com aviso.
Tarefa 8b: review APROVADO (0 bloq, 1 IMP — fades viram corte com reduzir movimento; 1 SUG — keychain lento após trava) — rodada 1/3 com os dois + vídeo com reduzir movimento
Revisão final api: rodada 2/3 (3 itens pelo developer; commits cd07f3f..7d16ad0) — re-review restrito do code-reviewer e do cyber-security abertos
Tarefa 8b: rodada 1/3 (IMP + SUG resolvidos pelo developer; commit 7ce664d; vídeo reduce-motion) — re-review restrito aberto
Revisão final api: re-review rodada 2 — code-reviewer APROVADO com 2 IMP novos (rajada paralela passa o limite por CPF; falta .gitattributes eol=lf para o entrypoint no Windows). Decisão: ambos entram na rodada 3/3 (última), junto com o que o cyber-security apontar (aguardando).
Tarefa 8b: concluída (commits f8e0e5f..7ce664d, review limpo; vídeos login/app/reduce-motion em evidencias/)
Nota: no 03-review.md as mensagens da "Rodada 2" da revisão final api caíram dentro do bloco de Mensagens da Tarefa 8b (escrita simultânea) — conteúdo intacto, só posição; arrumar no fechamento.
Tarefa 9: BASE 7ce664d (mobile)
Revisão final api: re-review rodada 2 — cyber-security confirma R2-1 (corrida no limite por CPF; 100 tentativas paralelas sem 429; senha certa no lote entra); entrypoint aprovado. Rodada 3/3 (última): tryAcquire síncrono + e2e com Promise.all + .gitattributes eol=lf.
Revisão final api: rodada 3/3 (2 IMP pelo developer; commits 7d16ad0..b821797) — re-review restrito do code-reviewer e do cyber-security abertos
Revisão final api: cyber-security rodada 3 — SEGURO, sem pendências (R2-1 resolvido: 100 paralelas → 10×401 + 90×429, senha certa no fim → 429; 500 libera reservas)
Revisão final api: code-reviewer rodada 3 — APROVADO (0 bloq, 0 imp). Trilha api CONCLUÍDA até a Tarefa 16 (commits 40c8577..b821797, review e segurança limpos).
Tarefa api: adiado — SUG e2e de concorrência caso (b) dependente de tempo (pode dar vermelho esporádico em CI lento); entra na Tarefa 16, que volta a mexer na API (teto de rodadas da revisão final atingido, por isso não abri 4ª rodada).
Decisão: ao juntar as trilhas, `git add --renormalize mobile/android/gradlew.bat`.
Tarefa 9: entregue PRONTO COM RESSALVAS (commits 7f69878..b451016) — review aberto
Decisão: aceitas as escolhas do developer — 5xx mostra o texto de servidor do design (não o de conexão); o formulário treme em todo envio que falha — custo: uma linha cada se mudar.
Decisão: responsável sem aluno ir para App após o login é resolvido na Tarefa 10 (M7), que precisa consultar o /me pós-login.
Tarefa 9: review APROVADO (0 bloq, 1 IMP — teclado cobre o botão no Android com edge-to-edge; 2 SUG) — rodada 1/3 com os três
Decisão: Tarefa 13 — plugin do React Query no Reactotron NÃO serializa variáveis de mutations (senha do login); mutation de login com gcTime 0.
Tarefa 9: rodada 1/3 (IMP + 2 SUG resolvidos pelo developer; commit 473626f; Android sem prova visual) — re-review restrito aberto
Tarefa 9: concluída (commits 7f69878..473626f, review limpo; Android: teclado e TalkBack pendentes de prova em emulador — qa)
Tarefa 10: BASE 473626f (mobile)
Tarefa 10: entregue PRONTO COM RESSALVAS (commits 4334db2..d5b5c66; react-native-svg nativo) — review aberto
Decisão: ordem dos alunos no /me passa a seguir a ordem do JSON (Rafael antes de Joana, como no Figma), não firstName — revoga a ordenação por firstName da Tarefa 5; entra na Tarefa 16 (que volta à API) com e2e que fixa a ordem — custo: até lá o aluno padrão do Gustavo é Joana.
Decisão: seleção de aluno continua `fullScreenModal` (fiel ao Figma, com FECHAR); sem gesto de descer no iOS — custo: nenhum relevante.
Tarefa 10: review APROVADO (0 bloq, 1 IMP — alvo de toque de TROCAR PERFIL/SAIR com ~15pt; 2 SUG) — rodada 1/3 com o IMP + SUG opacidade como token; SUG foco inicial do leitor de tela na seleção → adiado para a Tarefa 13
Tarefa 10: rodada 1/3 (IMP + SUG opacidade resolvidos pelo developer; commit 1092f58) — re-review restrito aberto
Tarefa 10: concluída (commits 4334db2..1092f58, review limpo)
Tarefa 11: BASE 1092f58 (mobile)
Tarefa 11: entregue PRONTO COM RESSALVAS (commits f43a919..3b4b697) — review aberto
Decisão: animação do EmptyState (scale 0,96→1 + atraso do título, design 4.5) e anúncio do ErrorState no retry que falha (3.8) — componentes da T10 — vão para a Tarefa 13 (estados e animações) — custo: nenhum.
Tarefa 11: review APROVADO (0 bloq, 2 IMP no Dropdown — lista não limitada à janela; foco do leitor antes de o modal sair; 4 SUG) — rodada 1/3 com tudo, antes da T12 que reaproveita o Dropdown
Tarefa 11: rodada 1/3 (2 IMP + 4 SUG pelo developer; commit 4b64914) — re-review restrito aberto
Tarefa 11: concluída (commits f43a919..4b64914, review limpo); adiado — SUG ViewModel importando motion do tema (opcional)
Tarefa 12: BASE 4b64914 (mobile)
Tarefa 12: entregue PRONTO COM RESSALVAS (commits e091687..db80724; nada nativo) — review aberto
Decisão: aluno sem boletim mostra "Nenhum boletim disponível" (texto novo, não ocorre no seed) — aceito.
Decisão: com erro só no boletim do ano, o dropdown de ano continua visível para o usuário trocar de ano — desvio pequeno da 2.14 aceito.
Tarefa 12: concluída (commits e091687..db80724, review limpo). Todas as telas obrigatórias (R3–R9) implementadas.
Decisão: SUG da T12 (descrição do 404 troca para "conexão" durante o retry) entra na Tarefa 13, junto dos outros adiados de estados — custo: nenhum.
Tarefa 13: BASE db80724 (mobile)
Tarefa 13: interrompida pelo limite de 5 h; retomada no mesmo agent após o reset
Tarefa 13: entregue PRONTO COM RESSALVAS (commits 7fc41fc..2da2623; nada nativo; mobile.yml sem execução real) — review aberto
Decisão: Reactotron com inspector próprio (queries redigidas, mutations só chave/status, stores sem ações) no lugar do plugin pronto que vaza variables/token — aceito.
Decisão: job ios do mobile.yml só em workflow_dispatch (custo do runner macOS); iOS é provado no simulador a cada tarefa — aceito.
Decisão: silenciar o logger no ambiente de teste (ruído de ~200 linhas no Jest) — entra na rodada da T13 se houver, senão na T14.
Tarefa 13: review APROVADO (0 bloq, 1 IMP — duas abas anunciam o erro ao mesmo tempo; 2 SUG) — rodada 1/3 com tudo + logger silenciado no Jest
Tarefa 17 (parte 1 — README): BASE 414cb6b (tooling); Decisão: README adiantado em paralelo à T13 para encurtar o prazo; GIFs e APK em tag ficam para a parte 2, no fim — custo: algum retoque no README se T14–T16 mudarem comandos.
Decisão: OTA removido a pedido do usuário ("remover o OTA", 2026-10-28) — Tarefa 15 cancelada, D34 revogada; expo-updates não entra; Expo Modules continuam no projeto só para o push (D12, Tarefa 16) — custo: atualização sem loja deixa de existir.
Tarefa 17 (parte 1): entregue PRONTO COM RESSALVAS (commit 592eec9, README) — review aberto. Pendências do README após T14/T16 e parte 2 registradas no 02-dev.md (### Mensagens da parte 1).
Decisão: no fechamento, commitar 01-design.md a 04-security.md, revisao/ e evidencias/ (o README já aponta para eles).
Tarefa 13: rodada 1/3 (IMP + 2 SUG + logger silenciado pelo developer; commits 2da2623..176ab84) — re-review restrito aberto
Tarefa 13: concluída (commits 7fc41fc..176ab84, review limpo; mobile.yml e VoiceOver/TalkBack pendentes de execução real — qa/primeiro CI)
Tarefa 14: BASE 176ab84 (mobile)
Tarefa 17 (parte 1): review APROVADO (0 bloq, 3 IMP — CORS, pré-requisitos Android, Docker nunca executado sem aviso; 5 SUG) — rodada 1/3 com tudo. Execução real do job docker e do assembleDebug depende do repositório no GitHub (pendente com o usuário).
Tarefa 17 (parte 1): rodada 1/3 (3 IMP + 5 SUG pelo developer; commit 5c2d363) — re-review restrito aberto
Tarefa 17 (parte 1): re-review rodada 1 APROVADO com 1 IMP novo (Android físico via adb reverse + localhost não funciona: o app troca localhost por 10.0.2.2) — rodada 2/3: usar IP da máquina, remover adb reverse
Tarefa 17 (parte 1): rodada 2/3 (IMP Android físico pelo developer; commit a49030a) — re-review restrito aberto
Decisão: push removido a pedido do usuário ("remover o Push", 2026-10-28) — Tarefa 16 cancelada, D12 revogada, M10 fora do escopo; sem Device, /devices nem /demo/grades.
Decisão: sem OTA e sem push, os Expo Modules ficam sem uso → Tarefa 16b remove o Expo do app (enunciado: RN CLI e só dependências necessárias) — custo se errado: retrabalho nativo; mitigado por build iOS + CI Android.
Decisão: os ajustes da API que iam na T16 viram a Tarefa 16a (ordem dos alunos pelo JSON; e2e de concorrência sem dependência de tempo), em paralelo ao Maestro.
Tarefa 16a: BASE b821797 (api)
Tarefa 17 (parte 1): concluída (commits 592eec9..a49030a, review limpo); pendências da parte 2: grep dos provisórios, GIFs, remover push/OTA/Expo do texto, avisos de Docker/Android só após CI real.
Tarefa 16a: entregue PRONTO COM RESSALVAS (commits fc18502..00ae8cc; migration nova guardian_student_position) — review aberto
Tarefa 14: entregue PRONTO COM RESSALVAS (commits 32e5e94..db515e3; flows NÃO executados — sem Maestro/Java/SDK na máquina; checagem estática de testIDs no CI) — review aberto
Decisão: maestro.yml usa APK debug com bundle JS de produção embutido (sem Metro/LogBox); flows no iOS conferem o rótulo acessível do elemento pai; subflows em `subflows/` — aceitos.
Decisão: `yarn format:check` vermelho por transports.test.ts (T13) corrigido na rodada da T14.
Tarefa 16a: concluída (commits fc18502..00ae8cc, review limpo; 3 SUG opcionais adiadas). Trilha api concluída: 40c8577..00ae8cc.
Tarefa 14: review APROVADO (0 bloq, 0 imp, 2 SUG) — rodada 1/3 curta: format:check (transports.test.ts), limite do matcher registrado no .maestro/README (ligar sufixo ao componente se barato), MAESTRO_VERSION fixada numa versão estável atual
Tarefa 14: rodada 1/3 (format + matcher por componente + Maestro 2.11.0 pelo developer; commits db515e3..8ffd107) — re-review restrito aberto
Tarefa 14: concluída (commits 32e5e94..8ffd107, review limpo; M11 aberto até a primeira execução real dos flows)
Tarefa 16b: BASE 8ffd107 (mobile)
Tarefa 16b: entregue PRONTO COM RESSALVAS (commit 730a052; mudança nativa; Android só no CI) — review aberto
Decisão: plugin babel `@babel/plugin-transform-export-namespace-from` (o preset do Expo transformava o `export * as` do zod 4; sem ele o bundle de release quebra) — aceito.
Decisão: iOS mínimo volta a 15.1 (template RN 0.88; o 16.4 vinha do Expo) — aceito.
Decisão: `@expo/*` no yarn.lock só como dependência do gerador de assets do react-native-bootsplash; nada no bundle nem nos pods — aceito.
Pendência de ambiente: Metro antigo (PID 35131, porta 8081, config do Expo) ainda rodando; o classificador impediu o agent de parar — usuário precisa parar antes do QA.
Tarefa 16b: review APROVADO (0 bloq, 1 IMP — mobile/README.md:3 ainda cita Expo) — rodada 1/3
Tarefa 16b: concluída (commits 730a052..b6bdc22; rodada 1 só de README conferida pelo chief no diff — 1 arquivo, linha 3 + nota; grep de Expo vazio)
Revisão final mobile: BASE 40c8577..b6bdc22 — code-reviewer (branch) + cyber-security abertos
Revisão final mobile: cyber-security SEGURO (0 bloq, 2 IMP, 4 SUG). Decisão: IMP 1 (token no Keychain sobrevive à desinstalação no iOS) + SUG 3 (falha ao apagar o token não pode ser engolida) entram na leva única de correção da revisão final; IMP 2 (APK assinado com debug.keystore) e SUG 6 (cleartext só para o host da demo) são pré-requisitos da T17 parte 2 — APK em tag só com keystore de release em secrets; SUG 4 (app switcher) e SUG 5 (actions por SHA / checksum do Maestro) adiadas.
Revisão final mobile: code-reviewer APROVADO (0 bloq, 2 IMP, 6 SUG).
Decisão: leva única de correção da revisão final mobile (rodada 1/3): IMP remover react-native-gesture-handler/react-refresh/@types/react-refresh; segurança IMP 1 (marca de instalação limpa o Keychain) + SUG 3 (falha ao apagar token tratada); SUG código morto, textos no strings.ts, FadeInDown num helper único, focusManager ligado ao AppState, locales do zod fora do bundle se for barato. Adiados: máquina de retry duplicada nos ViewModels, ícone do app (precisa de arte), SUG 4/5 de segurança. IMP logo/ilustração 1× depende do usuário exportar do Figma.
Fila: pedido da v2 do app registrado em .claude/team/tarefas/2026-10-28-app-v2/00-pedido.md — começa só depois da v1 concluída e validada (brief + aprovação do usuário antes de código).
Revisão final mobile: rodada 1/3 (8 itens pelo developer; commits b6bdc22..537a032; gesture-handler removido = mudança nativa) — re-review restrito do code-reviewer e do cyber-security abertos
Revisão final mobile: cyber-security rodada 1 — SEGURO, sem pendências (IMP 1 e SUG 3 resolvidos); IMP 2/SUG 6 seguem como pré-requisitos do APK na T17.
Revisão final mobile: code-reviewer rodada 1 — APROVADO. Trilha mobile CONCLUÍDA (40c8577..537a032). Aberto só o logo/ilustração 1× (depende do usuário).
Integração: branch release/v1 (worktree .claude/worktrees/release) = spec/fiap-school + chore/tooling + feat/api + feat/mobile (merges --no-ff, só 1 conflito trivial no .gitignore), renormalização LF/CRLF aplicada; evidências comprimidas (71 MB → 8 MB; originais em /.evidencias-originais, fora do git).
Decisão: entrega como UM PR release/v1 → main (no lugar de spec → main + 3 PRs de trilha) — mais simples de revisar/mergear; o histórico das trilhas fica nos merges. Revoga a sequência de PRs registrada antes — custo: PR grande (mitigado pela trilha de revisão em .claude/team).
Decisão: T17 parte 2 (GIFs, README final) é feita direto na release/v1, depois do QA.
QA: aberto na release/v1.
QA (release/v1 44f6184): A1–A8 ✅, M1–M9/M12 ✅ no iOS, G1 ✅, G2 ✅ estático, G3 ❌ (README: bundle install com Ruby do sistema falha; README desatualizado com Expo/push/gesture-handler/"previsto"). Não testável aqui: Android, Maestro, VoiceOver, Docker, CI real.
Decisão: APK em tag (D32 "CD") sai do escopo da v1 — sem API pública o APK de release não teria com quem falar e exigiria keystore de release + cleartext; o README aponta o APK debug do artefato do mobile.yml para quem quiser instalar no emulador. Revoga o item do APK da T17 e encerra o IMP 2/SUG 6 da segurança mobile (não há APK distribuído).
Decisão: rolar a tela ao abrir o 3º trimestre e senha com "•" no lugar de "*" — adiados (a v2 refaz o boletim).
Tarefa 17 (parte 2): aberta na release/v1 (README final, GIFs, .prettierignore).
Tarefa 17 (parte 2): entregue PRONTO COM RESSALVAS (commits 77fa800..e32fe3b; Início rápido testado em clone limpo pelos caminhos A e B; GIFs 1,7 MB) — review aberto. QA e evidências do QA commitados e integrados (9de1c5e → release 51911a1).
Tarefa 17 (parte 2): review APROVADO (0 bloq, 2 IMP de uma linha — cd mobile/ios no Caminho B; linha revisao/ duplicada; 2 SUG — Gemfile.lock no .gitignore; aviso do Ruby enxuto) — rodada 1/3 com os quatro; conferência do chief sem nova rodada de review (combinado com o reviewer).
Tarefa 17 (parte 2): concluída (commits 77fa800..7dac2be; rodada 1 conferida pelo chief: links, cd, linha duplicada, Gemfile.lock). v1 PRONTA para PR; 99-relatorio.md escrito.
