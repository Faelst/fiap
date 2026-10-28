# Brief — app v2 (UI moderna, foco em UX)

Pedido literal: `00-pedido.md`. Base: v1 entregue na `release/v1`.

## 1. Pedido

Interface mais moderna em todo o app:

- **Visual:** mais efeitos, botões arredondados, inputs melhor formatados e login
  mais bem estruturado.
- **Aulas:** um calendário no lugar do dropdown. O dia escolhido vira um timetable,
  com uma linha no horário atual e a aula em andamento destacada.
- **Tab bar:** flutuante, com bordas arredondadas e uma 3ª aba, **Perfil**, com os
  dados pessoais, a troca de aluno e a saída.
- **Boletim:** mais moderno e fácil de entender.
- **UX em primeiro lugar.**

Esclarecimento do usuário em 2026-10-28: no Perfil, **"alterar o perfil" é só trocar
de aluno**.

## 2. Decisões

- **V1 [chief] Branch e escopo.** A v2 fica na branch `v2`, criada a partir da
  `release/v1`, no worktree `.claude/worktrees/v2`.
  - Só `mobile/` muda; a **API não muda**.
  - A entrega oficial ao teste continua sendo a v1, fiel ao Figma.
  - A v2 é uma evolução documentada no README. **Ao final, apenas criar a branch `release/v2`** a partir da `v2` (pedido do usuário em 2026-10-28), sem PR e sem merge na `main`.
- **V2 [chief] Mantém o que a v1 já tem:**
  - identidade FIAP: fundo preto, teal `#29F4D5`, rosa do selo e Montserrat;
  - stack: RN CLI, Restyle, MVVM, TanStack Query, zustand, zod, RHF e reanimated 4;
  - camada de dados, segurança e acessibilidade (reduzir movimento, leitor de tela,
    alvos ≥ 44).

  Muda a camada visual: tokens, componentes e telas.
- **V3 [usuário] Perfil.** Mostra:
  - os dados que a API já devolve: nome completo e CPF mascarado;
  - a lista de alunos vinculados, com o atual em destaque, e a troca de aluno ali
    mesmo, sem modal;
  - o botão Sair.

  Não há edição de dados nem rota nova.
- **V4 [chief] Calendário como faixa semanal.** O JSON tem só a semana de 16 a
  22/03/2025, então um mês mostraria quase tudo desabilitado.
  - Os 7 dias aparecem como chips, com dia da semana e número, e marcam os dias que
    têm aula.
  - O cabeçalho mostra "Março 2025".
  - Um swipe horizontal troca o dia.
  - O dia inicial continua sendo o mesmo dia da semana de hoje (D35 da v1).

  *Custo se errado:* trocar o componente da faixa por um mês.
- **V5 [chief] Timetable.** É uma grade vertical por hora, do início da primeira aula
  ao fim da última do dia, com margem. Cada aula é um bloco proporcional à duração.
  - A **linha de agora** usa a hora real do aparelho e só aparece no dia que
    corresponde a hoje.
  - A aula em andamento ganha destaque ("Agora", com borda e brilho teal).
  - As que já passaram ficam atenuadas.
  - Fora do horário de aulas, a linha fica acima ou abaixo da grade, ou some, e o
    texto diz "Aulas encerradas" ou "Próxima aula às 07:15".
  - A linha se atualiza a cada minuto, sem re-render da lista.
- **V6 [chief] Tab bar flutuante.**
  - É uma cápsula com raio total, flutuando acima da área segura de baixo.
  - Tem 3 abas: Agenda, Boletim e Perfil.
  - Um indicador animado (pílula teal) desliza até a aba ativa.
  - O conteúdo rola por baixo dela, com padding para o último item não ficar coberto.
- **V7 [chief] O header encolhe.**
  - O cabeçalho de cada aba mostra a saudação e um **chip do aluno**: nome, turma e
    avatar com iniciais.
  - Tocar no chip leva ao Perfil.
  - TROCAR PERFIL e SAIR saem do header e vão para o Perfil.
  - A barra de logo fica menor.
- **V8 [chief] Boletim.**
  - Um seletor segmentado de ano no lugar do dropdown, porque são só 1 ou 2 anos.
  - Os trimestres viram abas ou segmentos.
  - Um card de resumo do trimestre com média e total de faltas.
  - Disciplinas em cards com:
    - nota grande;
    - barra de progresso de 0 a 10, colorida por faixa: ≥ 7 teal, 5–6,9 âmbar,
      < 5 rosa, sempre com rótulo além da cor;
    - faltas.
  - Trimestre não avaliado aparece como "Ainda não avaliado", num estado vazio
    amigável.
  - **Nada de acordeão aninhado.**
- **V9 [chief] Login.**
  - Card central com o logo.
  - Inputs com borda arredondada, rótulo flutuante, ícone e máscara de CPF.
  - Mostrar/ocultar senha.
  - Botão de pílula com loading.
  - Mensagem de erro inline, com o shake mantido.
  - Animação de entrada encadeada a partir da splash.
- **V10 [chief] Efeitos.**
  - Transições de tela com fade e slide sutil.
  - Entradas em cascata.
  - Feedback de toque com escala.
  - Skeletons com shimmer.
  - Pull-to-refresh com indicador teal.
  - Tudo em transform/opacity, com fallback para reduzir movimento.
  - **Sem novas dependências nativas**, salvo justificativa aprovada pelo chief.
- **V11 [chief] Testes.** Os testes unitários e de componente são atualizados, os
  ViewModels são preservados onde a lógica não muda, e os flows do Maestro e os
  testIDs são atualizados (aba Perfil, faixa de dias, segmentos do boletim). O CI
  continua verde.

## 3. Escopo

**Entra:** tema v2 (tokens e componentes), Login, tab bar flutuante + header
compacto, Agenda (faixa semanal + timetable + linha de agora), Boletim novo, aba
Perfil (dados, troca de aluno, sair), estados (loading, vazio, erro, sem aluno, boot
error) no novo visual, splash mantida com ajuste do encadeamento, testes e Maestro
atualizados, e uma seção "v2" no README com GIFs.

**Fora:** mudanças na API, edição de dados pessoais, tema claro, push, OTA, novas
libs nativas sem aprovação e o logo em SVG (continua dependendo do export do Figma).

## 4. Critérios de aceite

- **N1:** a tab bar flutuante tem 3 abas e o indicador animado. O conteúdo não fica
  coberto.
- **N2:** a faixa semanal mostra os 7 dias com marca de "tem aula". Abre no mesmo dia
  da semana de hoje, e tocar ou fazer swipe troca o dia.
- **N3:** o timetable é proporcional à duração das aulas. A linha de agora aparece no
  dia de hoje e se move com o relógio (teste com relógio injetado). A aula em
  andamento fica destacada e as passadas atenuadas. Fora do horário, aparece o texto
  correspondente.
- **N4:** o Boletim tem o ano em segmento, os trimestres em segmento e um resumo com
  média e faltas. Os cards de disciplina mostram a barra por faixa com rótulo
  textual, e trimestre não avaliado mostra estado próprio.
- **N5:** o Perfil mostra nome, CPF mascarado e a lista de alunos com o atual
  destacado. Trocar de aluno atualiza as abas, e Sair faz o logout completo.
- **N6:** no Login, os inputs são arredondados, o rótulo é flutuante, há
  mostrar/ocultar senha, o botão é de pílula e os erros aparecem inline.
- **N7:** todas as telas têm animações, com reduzir movimento respeitado e sem perder
  frames visíveis no iOS.
- **N8:** lint, tsc, testes e `maestro:check` passam, e os flows são atualizados.

## 5. Riscos

- Desvia do Figma de propósito, por isso não pode substituir a v1 na entrega.
- A faixa semanal e o timetable dependem da semana fixa do JSON. A "linha de agora"
  só aparece no dia da semana de hoje e no horário de aula (07:15 a 12:15 no seed).
- Android segue sem build local; a prova continua sendo o CI.

## 6. Aprovação

O usuário pediu "pode começar a v2, somente faz a troca de aluno" em 2026-10-28.
Isso aprova o escopo. **O design da v2 (`01-design.md`) é mostrado ao usuário antes
do código.**
