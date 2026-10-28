# FIAP School — app mobile

React Native CLI 0.88 + TypeScript + Restyle.
O passo a passo completo (API, contas e Android) fica no README da raiz.

```sh
cd mobile
corepack enable          # opcional: o yarn 4.18.1 já vem em .yarn/releases
yarn install
cd ios && pod install && cd ..   # CocoaPods do Homebrew; com bundler, veja abaixo
yarn start               # Metro na 8081 (sem watchman, ver metro.config.js)
yarn ios                 # precisa de Ruby 3 (ver abaixo); ou: yarn ios --udid <id>
```

CocoaPods: o `Gemfile` pede um Ruby 3 para o `bundle install` (o Ruby 2.6 do
macOS falha na gem `json`), e o `yarn ios` roda esse `bundle install` sozinho
na primeira vez. Sem Ruby 3, use o `pod install` do Homebrew e builde pelo
Xcode ou pelo `xcodebuild`. Os dois caminhos estão na seção iOS do README da
raiz.

Atualizando uma cópia antiga: depois de puxar a mudança que trocou as
dependências nativas e o preset do babel, rode `cd ios && pod install` e suba o
Metro com `yarn start --reset-cache`, senão o cache antigo serve o bundle velho.

Scripts: `yarn lint`, `yarn tsc`, `yarn test`, `yarn format`, `yarn maestro:check`,
`yarn maestro:install` e `yarn maestro:test` (flows em `.maestro/`, ver
`.maestro/README.md`), `yarn link:assets`
(relinka as fontes de `assets/fonts` depois de trocar algum arquivo).
