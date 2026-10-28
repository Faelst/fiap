## 9. Restrições globais

Copiadas literalmente em cada revisão:

- React Native **CLI** (não Expo managed, não expo-router) + TypeScript strict +
  **Restyle**. Nenhum `StyleSheet.create` com cor ou espaçamento literal: tudo
  vem do tema.
- MVVM: a View não importa `services/` nem axios; a lógica fica no
  `useXViewModel`.
- Dado remoto só via TanStack Query; estado global só via zustand; validação só
  via zod (app) e class-validator (API).
- Token só no keychain. Nunca logar token, senha ou CPF completo.
- API: controller sem regra de negócio; um use case = uma classe com `execute()`
  e um `.spec.ts`; use case depende da interface do repositório, não do Prisma.
- Rotas por aluno passam pelo guard de ownership.
- Toda tela tem animação de entrada (reanimated) e `testID` nos elementos que o
  Maestro usa.
- Boletim padrão = **2025**, só **T1** avaliado.
- Commits conventional (`feat(mobile): ...`), mensagens e PR em português.
- yarn em tudo.

## 10. Plano de alto nível (vira o `00-plano.md` após aprovação)
