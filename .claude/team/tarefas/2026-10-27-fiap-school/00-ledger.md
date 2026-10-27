# Ledger — fiap-school

Decisão: trilhas api/ e mobile/ rodam em paralelo, cada uma no seu worktree — pastas separadas no monorepo, nenhum arquivo em comum além da raiz (tocada só pela trilha tooling) — custo se errado: conflito no merge do lint-staged/workflows, resolvível à mão.
Decisão: sem remote no GitHub, o fim de cada trilha é a branch local commitada; PRs abrem quando o usuário criar o repositório público — custo se errado: nenhum.
Decisão: agents do squad ainda têm texto do Safety Swap até a Tarefa 1; cada prompt de developer diz explicitamente o contexto do projeto e que o brief/plano vencem — custo se errado: developer seguir regra do SS (ex.: Expo Router), pego no review.
