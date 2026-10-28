# FIAP School — app mobile

React Native CLI 0.88 + TypeScript + Restyle.
O passo a passo completo (API, contas e Android) fica no README da raiz.

```sh
cd mobile
corepack enable          # opcional: o yarn 4.18.1 já vem em .yarn/releases
yarn install
cd ios && pod install && cd ..
yarn start               # Metro na 8081 (sem watchman, ver metro.config.js)
yarn ios                 # ou: yarn ios --udid <id do simulador>
```

Atualizando uma cópia antiga: depois de puxar a mudança que trocou as
dependências nativas e o preset do babel, rode `cd ios && pod install` e suba o
Metro com `yarn start --reset-cache`, senão o cache antigo serve o bundle velho.

Scripts: `yarn lint`, `yarn tsc`, `yarn test`, `yarn format`, `yarn link:assets`
(relinka as fontes de `assets/fonts` depois de trocar algum arquivo).
