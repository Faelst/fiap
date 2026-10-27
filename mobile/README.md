# FIAP School — app mobile

React Native CLI 0.88 + TypeScript + Restyle, com Expo Modules (SDK 58).
O passo a passo completo (API, contas e Android) fica no README da raiz.

```sh
cd mobile
corepack enable          # opcional: o yarn 4.18.1 já vem em .yarn/releases
yarn install
cd ios && pod install && cd ..
yarn start               # Metro na 8081 (sem watchman, ver metro.config.js)
yarn ios                 # ou: yarn ios --udid <id do simulador>
```

Scripts: `yarn lint`, `yarn tsc`, `yarn test`, `yarn format`, `yarn link:assets`
(relinka as fontes de `assets/fonts` depois de trocar algum arquivo).
