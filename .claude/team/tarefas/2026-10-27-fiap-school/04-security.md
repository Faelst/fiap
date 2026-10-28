# 04 — Revisão de segurança

## Trilha api

- Escopo: `40c8577..650b5fe` (branch `feat/api`, worktree `.claude/worktrees/api`), diff em `revisao/branch-api.diff`. Li o código completo de `api/src`, `api/prisma`, `Dockerfile`, `.dockerignore`, `.env.example`, `docker-compose.yml` e `.github/workflows/api.yml`.
- Prova de conceito só local: `yarn build`, banco novo `file:./sec.db` com `prisma:setup`, `node dist/main` na porta 3999 (`NODE_ENV=production`, log JSON capturado). O banco e o servidor foram apagados no fim. Nenhum `migrate reset`, nenhum código alterado.
- Contexto considerado: teste técnico rodando local, sem dinheiro. Os dados sensíveis são CPF, nome e e-mail do responsável e as notas de menores. As credenciais do seed são públicas (vêm do enunciado e estão no README e no Swagger).

### Classificação de risco por arquivo (differential review)

| Risco | Arquivos |
|---|---|
| ALTO | `modules/auth/**` (login, JWT, strategy, throttler), `shared/guards/*` (JWT global, ownership), `config/env.validation.ts`, `config/trust-proxy.ts`, `app.setup.ts` |
| MÉDIO | `modules/students/**`, `modules/guardians/**`, `infra/logger/*`, `Dockerfile`, `docker-compose.yml`, `prisma/seed*.ts` |
| BAIXO | DTOs de resposta, Swagger, scripts de smoke, workflow de CI |

Blast radius: o `JwtAuthGuard` é `APP_GUARD` e protege as 5 rotas. Só `POST /api/auth/login` e `GET /api/health` são `@Public()`. O `StudentOwnershipGuard` fica na classe `StudentsController` e cobre as 3 rotas por aluno. Os repositórios de aluno não filtram por responsável (o comentário em `students.repository.ts:37` diz que o guard já conferiu), então a autorização depende inteira do guard. Hoje está correto. Uma rota nova por aluno fora desse controller precisaria do decorator.

### Achados

Nenhum BLOQUEANTE. 2 IMPORTANTES e 8 SUGESTÕES.

#### [IMPORTANTE 1] `JWT_SECRET` sem tamanho mínimo, e o segredo de exemplo é público e vai para o compose
- Arquivo: `api/src/config/env.validation.ts:79-81` (só `@IsString() @IsNotEmpty()`), `docker-compose.yml:19` (`JWT_SECRET: "troque-este-segredo-local"`), `docker-compose.yml:32` (`0.0.0.0:3333`), `api/.env.example:5`.
- Risco: qualquer pessoa que conheça o segredo assina um token válido por quanto tempo quiser, para qualquer `sub`. O segredo do compose está no repositório público. Um segredo curto também cai por força bruta offline a partir de um token legítimo (HS256).
- Prova (local): subi a API com `JWT_SECRET=a`. O boot passou. Um token forjado com `jsonwebtoken.sign({sub: <id do Gustavo>}, 'a', {expiresIn: '10y'})` levou `GET /api/me` a devolver 200 com os dados e os alunos dele.
- Cenário: o avaliador roda `docker compose up`. A porta fica aberta em todas as interfaces, e na mesma rede (Wi-Fi do evento ou da empresa) há outra pessoa. Ela forja um token com o segredo do repositório e lê agenda e boletim de qualquer responsável cujo id ela tenha. Os ids vazam no app, no log do cliente e em prints. Quem copiar o compose para um deploy herda o mesmo problema. No uso local o impacto é baixo porque os dados são do enunciado, mas o avaliador vai procurar exatamente isso.
- Correção: `@MinLength(32)` no `JWT_SECRET`. Recusar no boot o valor do `.env.example`/compose quando `NODE_ENV=production`, ou pelo menos dar `warn` (a imagem Docker roda com `production`). No compose, usar `JWT_SECRET: ${JWT_SECRET:-<placeholder local com 32+ caracteres>}`, para o avaliador poder sobrescrever sem editar o arquivo, e colocar no README um `openssl rand -base64 48`. Teste em `env.validation.spec.ts` para um segredo curto. Ver também a SUGESTÃO 6 (exigir `exp`).

#### [IMPORTANTE 2] Rate limit do login é só por IP, sem limite por CPF, e as senhas têm 6 dígitos
- Arquivo: `api/src/modules/auth/auth.module.ts:39-51`, `api/src/modules/auth/controllers/auth.controller.ts:23` (o `ThrottlerGuard` usa como chave o `req.ip`).
- Risco: força bruta distribuída contra um CPF conhecido. O espaço das senhas do seed é 10^6 (só dígitos). Com 5 tentativas por minuto por IP, um atacante com 200 IPs faz 1000 tentativas por minuto e percorre tudo em cerca de 17 h. Com IPv6, um único /64 dá endereços sem limite prático, porque o throttler usa o IP inteiro como chave. O CPF não precisa ser adivinhado: é dado pessoal que circula, e a resposta não revela se ele existe (isso está correto, ver abaixo).
- Cenário: um anônimo com uma lista de CPFs de pais da escola faz `POST /api/auth/login` em rodízio de IPs/IPv6, entra na conta e lê as notas e a agenda dos filhos.
- Correção: um segundo throttler com chave pelo CPF normalizado. Pode ser um `ThrottlerGuard` próprio com `getTracker` que lê `req.body.cpf`, tira o que não é dígito e usa algo como 10 tentativas a cada 15 min. Isso precisa ser feito no tracker, porque o guard roda antes do pipe que normaliza. O limite por IP continua. O custo aceito é que um atacante consegue travar o login de um CPF por 15 min (DoS leve), e o README deve registrar isso. Fazer e2e com dois IPs diferentes (`TRUST_PROXY` de teste) no mesmo CPF → 429.

#### [SUGESTÃO 3] CORS `*` é o padrão no código, não só no `.env.example`
- Arquivo: `api/src/config/env.validation.ts:94` (`CORS_ORIGINS = '*'`), `docker-compose.yml:21`, `api/src/app.setup.ts:34-37`.
- Risco: baixo, porque a autenticação é por Bearer e não por cookie, então um site de terceiros não aproveita a sessão do navegador. O problema é o padrão aberto (fail-open): esquecer a env em deploy libera tudo. Testado: preflight de `Origin: https://evil.example` → `Access-Control-Allow-Origin: *` com `authorization` permitido.
- Correção: sem padrão no código. Com a env ausente, CORS desligado (o app RN não precisa de CORS) ou lista vazia. O `*` fica explícito só no `.env.example` e no compose, com o comentário "só em dev".

#### [SUGESTÃO 4] Sem headers de segurança (helmet) e com `X-Powered-By: Express`
- Arquivo: `api/src/app.setup.ts:15-42`.
- Risco: baixo para uma API JSON. Revela a stack (`X-Powered-By: Express` em toda resposta, confirmado) e a UI do Swagger em `/docs` fica sem `X-Frame-Options`/CSP (clickjacking da página de docs).
- Correção: `app.use(helmet())`. A CSP padrão do helmet bloqueia os scripts inline do Swagger UI, então ajuste `contentSecurityPolicy` só para `/docs` ou desligue a CSP e mantenha o resto. O mínimo é `http.disable('x-powered-by')`.

#### [SUGESTÃO 5] Swagger ligado por padrão, inclusive na imagem `production`
- Arquivo: `api/src/config/env.validation.ts:112` (`SWAGGER_ENABLED = true`), `api/src/app.swagger.ts:15-16` (credencial na descrição), `docker-compose.yml:25`.
- Risco: baixo. `/docs`, `/docs-json` e `/docs-yaml` respondem 200 sem autenticação (testado) e mapeiam a superfície da API. A credencial que aparece já é pública. O Swagger é ferramenta pedida (D26), e por isso fica como sugestão.
- Correção: padrão `SWAGGER_ENABLED = NODE_ENV !== 'production'`. O compose já liga explicitamente, então o avaliador não perde nada.

#### [SUGESTÃO 6] Token sem `exp` é aceito, e não há `iss`/`aud`
- Arquivo: `api/src/modules/auth/strategies/jwt.strategy.ts:12-17`.
- Risco: só vale para quem tem o segredo, mas aumenta o estrago do IMPORTANTE 1. O passport-jwt só confere o `exp` quando ele existe. Testado: token assinado sem `exp` → `GET /api/me` 200. Sem `iss`/`aud`, um token emitido por outro serviço com o mesmo segredo também passa.
- Correção: `jsonWebTokenOptions: { maxAge: JWT_EXPIRES_IN }` na strategy (exige `iat` e limita a idade) e `issuer`/`audience` fixos no `signOptions` e na verificação.

#### [SUGESTÃO 7] `TRUST_PROXY=true` é aceito e anula o rate limit
- Arquivo: `api/src/config/trust-proxy.ts:37-39`, `api/.env.example:20-22`.
- Risco: com `true`, o express confia em qualquer `X-Forwarded-For`. Testado: com `TRUST_PROXY=true`, 8 logins seguidos do mesmo cliente, cada um com um `X-Forwarded-For: 10.0.0.N` diferente, deram 401 em todos e nenhum 429. O padrão `false` está correto e tem teste, mas o `.env.example` lista `true` como opção válida sem aviso (sharp edge de configuração).
- Correção: recusar `true` no `parseTrustProxy` (e exigir número de saltos ou lista de IPs) ou, no mínimo, `warn` no boot e o comentário "true confia em qualquer cliente: não use".

#### [SUGESTÃO 8] URL e query string vão inteiras para o log
- Arquivo: `api/src/infra/logger/logger.config.ts:42-64` (serializer padrão do pino-http) e `REDACTED_LOG_PATHS` (`*.cpf` só pega um nível, não `req.query.cpf`).
- Risco: baixo, porque nenhuma rota usa query string. Mas um cliente que mande token ou CPF na URL (bug do app ou ferramenta do avaliador) faz o dado parar no log, contra o A8. Testado: `GET /api/me?access_token=eyJ...` → o token aparece em `req.url` e em `req.query` no JSON do log.
- Correção: `serializers.req` que grava `url` sem a query (`url.split('?')[0]`) e não grava `query`, ou que redige `req.query.*`.

#### [SUGESTÃO 9] A imagem de runtime leva todas as devDependencies
- Arquivo: `api/Dockerfile:45` (`node_modules` do estágio `deps`, instalado com dev).
- Risco: baixo. Jest, ESLint, TypeScript, `@nestjs/cli`, ts-node e outros vão para a imagem que fica exposta. Isso aumenta a superfície e o volume de CVE que um scanner aponta. O comentário diz que `prisma` e `tsx` são necessários no boot, e são.
- Correção: um estágio `prod-deps` com `yarn install --production --frozen-lockfile`, e `prisma` e `tsx` em `dependencies` (ou seed compilado para JS). Opcional: fixar a base por digest.

#### [SUGESTÃO 10] `yarn audit` aponta 2 advisories em dependências de produção, sem caminho de exploração aqui
- Arquivo: `api/yarn.lock`.
- `multer` 2.4.0 (via `@nestjs/platform-express`), **high**, GHSA-q7qp-rjg7-q26m (DoS com `fileFilter` assíncrono). Não é alcançável: a API não tem `FileInterceptor` nem rota de upload, e o multer só entra em ação com eles.
- `js-yaml` 5.3.0 (via `@nestjs/swagger`), **moderate**, GHSA-r3ph-w7gj-g6xm (CPU com merge keys no parse). Não é alcançável: o Swagger só faz `dump` do documento para `/docs-yaml` e não lê YAML do cliente.
- Correção: atualizar o lock (`yarn upgrade @nestjs/platform-express @nestjs/swagger` ou `resolutions` com `multer >=2.5.0` e `js-yaml >=5.4.1`), para o avaliador não ver `1 High` no audit. Com dev, o `yarn audit` completo dá 5 (3 low, 1 moderate, 1 high), todos do mesmo grupo ou de ferramentas de dev.

### Verificado e seguro

- Senha com bcrypt (`bcryptjs` 3.0.3, custo 10). Não há hash nem senha em resposta ou log. O DTO limita a senha a 1–128 caracteres e recusa o que não é texto (array → 400).
- Enumeração de CPF: CPF inexistente compara contra o `DUMMY_PASSWORD_HASH` (mesmo custo 10). As medianas de 25 tentativas, duas vezes, deram 103,3/103,5 ms (CPF existente) e 103,2/103,1 ms (inexistente). Corpo e status 401 idênticos (`Usuário ou senha inválida.`).
- O throttler roda antes do pipe (guard antes de pipe), então corpo inválido também conta. O 6º login no minuto deu 429. Com `TRUST_PROXY=false` (padrão), o `X-Forwarded-For` não muda a chave (testado e coberto por e2e).
- JWT: `HS256` fixo na assinatura e na verificação. Testado: `alg: none` → 401, HS512 → 401, expirado → 401, `sub` numérico → 401, sem token na query (não usa `fromUrlQueryParameter`).
- Token de responsável apagado: `sub` inexistente → 401 no `/me` (use case) e nas rotas de aluno (guard `unknown-guardian`), testado com token forjado.
- `JWT_EXPIRES_IN` exige unidade (o `"3600"` virando ms está fechado). O padrão é 7d, conforme o D20.
- Guard global: só `auth/login` e `health` são `@Public()`. Sem token → 401 em todas as rotas protegidas, inclusive com `:year` inválido (o guard roda antes do `ParseYearPipe`).
- IDOR: Adelaide com o id do Rafael (aluno do Gustavo) → 403 em agenda, lista de boletins, boletim 2025 e boletim com ano inválido. Id inexistente, `%2e%2e` e id com `%00` → o mesmo 403 com o mesmo corpo. A verificação é uma consulta só (responsável + vínculo), sem diferença perceptível de tempo entre "não existe" e "é de outro".
- Mass assignment e validação: `whitelist` + `forbidNonWhitelisted` + `transform` globais. `role` extra → 400. `cpf` como objeto `{"$ne":1}` → 400. `__proto__` no corpo não muda nada (401 normal). JSON malformado → 400 sem stack. Corpo de 200 KB → 413. DTOs importados como valor (não `import type`).
- `@IsCpf` confere formato, dígitos verificadores e sequência repetida. O `normalizeCpf` não "limpa" texto fora do formato.
- O `ParseYearPipe` com `@RawParam` aceita só `^\d{4}$`, e o use case limita a faixa (evita 500 do Prisma com inteiro grande).
- SQL: só Prisma com query builder. Nenhum `$queryRaw*`/`$executeRaw*` em `src` nem em `prisma`.
- Dados pessoais na resposta: `/me` devolve o CPF mascarado (`***.294.560-**`, `maskCpf` com fallback de máscara total). O e-mail nunca sai. O login devolve só id, nome e sobrenome.
- Log: o corpo não é logado. `authorization`, `cookie` e `set-cookie` são removidos (`remove: true`). Busquei no log JSON da sessão de testes CPF (com e sem máscara), `123456`, `987654` e `eyJ`: só aparece o caso da query string (SUGESTÃO 8). O `x-request-id` do cliente só é aceito com `[A-Za-z0-9._-]{1,64}`, o que impede quebrar a linha do log. O 4xx não loga o corpo do erro.
- Pretty log só com `NODE_ENV=development` explícito. A imagem roda em JSON.
- Docker: runtime com `USER node`, toolchain de build só no estágio `deps`, `.dockerignore` exclui `.env*` e `*.db`, `HEALTHCHECK` sem credencial e `exec node` como PID 1.
- Git: `.env`, `*.db` e `src/generated` estão no `.gitignore` e nenhum é rastreado na branch (só `.env.example`). Não há segredo real no diff.
- Seed: só popula o banco vazio (`SEED_RESET=true` é necessário para recriar). As senhas do enunciado são esperadas no teste, e o README precisa dizer que são de demonstração.
- CI (`api.yml`): `pull_request` (não `_target`), `permissions: contents: read`, sem `secrets`, `.env` copiado do exemplo.
- Supply chain: todas as 913 entradas do `yarn.lock` resolvem para `registry.yarnpkg.com` com `integrity`. Os pacotes de auth são os oficiais (`bcryptjs` do dcodeIO, `passport-jwt`, `@nestjs/*`, `nestjs-pino`).

### Não coberto

- Não rodei o `supply-chain-risk-auditor` (scripts de coleta), porque ele não lê `yarn.lock` e a sessão não tem `gh` autenticado. Fiz só `yarn audit` e a conferência das origens no lock.
- Não construí a imagem Docker (sem Docker na máquina, R-Ambiente). A revisão do Dockerfile e do compose foi estática.
- As rotas `/devices` e `/demo/grades` (Tarefa 16) ainda não existem e ficam para a próxima rodada. Atenção ao `studentId` do corpo no `/demo/grades`, que não passa pelo guard de `params.id` (decisão do ledger).

### Resumo

| # | Severidade | Título |
|---|---|---|
| 1 | IMPORTANTE | `JWT_SECRET` sem mínimo; segredo público no compose em `0.0.0.0` |
| 2 | IMPORTANTE | Rate limit só por IP; sem limite por CPF (senhas de 6 dígitos) |
| 3 | SUGESTÃO | CORS `*` como padrão no código |
| 4 | SUGESTÃO | Sem helmet; `X-Powered-By` |
| 5 | SUGESTÃO | Swagger ligado por padrão em `production` |
| 6 | SUGESTÃO | JWT sem `exp` aceito; sem `iss`/`aud` |
| 7 | SUGESTÃO | `TRUST_PROXY=true` aceito anula o rate limit |
| 8 | SUGESTÃO | Query string no log |
| 9 | SUGESTÃO | devDependencies na imagem de runtime |
| 10 | SUGESTÃO | `multer`/`js-yaml` com advisory (não alcançáveis) |

**Veredito: SEGURO (0 bloqueantes).** Autenticação, autorização (IDOR), validação e log estão corretos e foram verificados com ataque local. Os dois IMPORTANTES são baratos (um validador e um tracker) e são exatamente o que um avaliador de boas práticas procura. Recomendo corrigir os dois, e também a 3, a 6 e a 7, que são de uma linha cada, numa rodada só.

## Mensagens

→ chief: trilha api SEGURA, 0 bloqueantes. Recomendo uma rodada com IMP 1 (`@MinLength(32)` no `JWT_SECRET` e placeholder do compose sobrescrevível por `${JWT_SECRET:-...}`) e IMP 2 (throttler por CPF normalizado, além do IP). A 3, a 6 e a 7 são baratas e podem entrar junto. A 10 é só `yarn upgrade`. Decisão sua: o compose em `0.0.0.0` é de propósito (celular na LAN), e com isso o IMP 1 pesa mais.
→ developer (se o chief abrir a rodada): o tracker por CPF precisa normalizar `req.body.cpf` por conta própria, porque o guard roda antes do pipe. O helmet padrão quebra o Swagger UI por CSP. Um segredo curto deve ter teste em `env.validation.spec.ts`.
→ code-reviewer: o `StudentsRepository` não filtra por responsável, e a autorização depende só do `@StudentOwnership()` na classe. Vale uma regra (ou teste) que garanta que toda rota `students/:id` fica nesse controller.
→ Tarefa 16: o `/demo/grades` recebe o `studentId` no corpo, então o guard por `params.id` não cobre. O use case precisa chamar o `checkAccess`, e o e2e Adelaide → aluno do Gustavo deve dar 403.

### Rodada 1

- Diff: `650b5fe..cd07f3f` (14 commits). Li os arquivos de segurança: `env.validation.ts`, `public-secrets.ts`, `trust-proxy.ts`, `app.setup.ts`, `auth.module.ts`, `login-throttle.ts`, `jwt.strategy.ts`, `jwt-auth.guard.ts`, `student-ownership.guard.ts`, `domain-error*.ts`, `logger.config.ts`, `Dockerfile`, `docker-compose.yml`, `.env.example` e `package.json`.
- Ataques refeitos no `dist` local na porta 3998, com banco novo `sec.db` (apagado no fim). Os testes de boot rodaram de uma pasta sem `.env`, para o `ConfigModule` não pegar o `.env` do worktree.

| # | Achado | Situação | Prova |
|---|---|---|---|
| IMP 1 | `JWT_SECRET` | **resolvido** (o risco que sobra foi aceito pelo chief, ver abaixo) | 31 caracteres → boot falha (`must be longer than or equal to 32 characters`). O do `.env.example` com `NODE_ENV=production` → boot falha com a mensagem do `openssl`. O padrão do compose com `production` → sobe com `warn` `JWT_SECRET é o valor de exemplo do repositório...` |
| IMP 2 | Throttler por CPF | **resolvido** | `TRUST_PROXY=1`, limite por IP 1000, um `X-Forwarded-For` diferente por tentativa, mesmo CPF alternando com e sem máscara: 10×401 e depois 429. A senha certa num IP novo também dá 429. Urlencoded com o mesmo CPF → 429. JSON com `cpf` duplicado (o último vale) → 429. `cpf` como array (JSON ou urlencoded repetido) → 400 no DTO, e não há bypass porque o tracker e o DTO usam o mesmo `normalizeCpf`/`isCpf`. Outro CPF continua em 401 |
| SUG 3 | CORS `*` padrão | **resolvido** | `NODE_ENV=production` sem `CORS_ORIGINS` → boot falha. Fora de produção continua `*` |
| SUG 4 | helmet / `X-Powered-By` | **resolvido** | `/api/health` sem `X-Powered-By`, com `nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`, CORP/COOP e CSP `default-src 'self'` |
| SUG 5 | Swagger em produção | **resolvido** | `production` sem a env → `/docs` 404. O `true` explícito (compose) liga |
| SUG 6 | JWT `exp`/`iss`/`aud` | **resolvido** | O token emitido traz `iss: fiap-school-api` e `aud: fiap-school-app`. Forjados com o segredo certo: sem `exp`, sem `iss`, sem `aud`, `aud` errado, sem `iat` e `iat` de 8 dias atrás com `exp` futuro → 401 `Sessão inválida ou expirada.`. Um `exp` de 10 anos passa, mas o `maxAge = JWT_EXPIRES_IN` derruba em 7 dias pelo `iat` (está correto) |
| SUG 7 | `TRUST_PROXY=true` | **resolvido** | Boot falha (`TRUST_PROXY deve ser false, número de saltos ou lista...`) |
| SUG 8 | Query no log | **resolvido** | `GET /api/me?access_token=eyJSEGREDO...&cpf=96929456004` → no log `url: "/api/me"` e nada de `query`. A busca por token, CPF (com e sem máscara) e senhas no log da sessão deu 0 ocorrências |
| SUG 9 | devDependencies na imagem | **resolvido no código** (sem build de Docker local) | Estágio `prod-deps` com `yarn install --production`. `prisma`, `tsx` e `dotenv` foram para `dependencies`, que é o necessário para `migrate` e seed no boot |
| SUG 10 | `multer`/`js-yaml` | **resolvido** | `resolutions` → `multer` 2.5.0 e `js-yaml` 5.5.0 (o do swagger). `yarn audit --groups dependencies`: **0 vulnerabilities** (352 pacotes). O audit completo dá 3 low, todos de dev |

**CSP do `/docs`:** o HTML do Swagger só tem `<script src>` do próprio `/docs` (nenhum inline e nenhum atributo `on*`), e a CSP não tem `upgrade-insecure-requests`. Renderizei `/docs` no Chrome headless (`--dump-dom`) e a UI montou as 6 rotas, sem `Refused`/CSP no log do Chrome. O único `new Function` do bundle é um fallback de `globalThis` dentro de `try/catch`. Fica para o qa a conferência interativa (Authorize + Try it out) num navegador normal.

**O aviso no boot é suficiente para o segredo do compose?** Para este contexto, sim. Ele é aceitável como decisão registrada, não como correção completa:
- O que mudou: o segredo do compose tem 32+ caracteres, pode ser trocado sem editar o arquivo (`JWT_SECRET=... docker compose up`), o boot avisa e o do `.env.example` é recusado em produção.
- O que sobra: com `docker compose up` sem a env, a porta fica em `0.0.0.0` com um segredo público. Quem estiver na mesma rede e tiver o id de um responsável assina um token válido para ele. Os dados são os do enunciado e as credenciais já são públicas, então o impacto real é baixo. Quem copiar o compose para um deploy recebe o aviso no log, mas o boot não para.
- Alternativa que mantém o comando único e elimina o segredo público, se o chief quiser: [SUGESTÃO nova R1-1] no `CMD`/entrypoint, sem `JWT_SECRET`, gerar um segredo aleatório na primeira subida e gravar em `/app/data/jwt-secret` (no volume, então os tokens sobrevivem a um restart). O compose deixa de ter padrão. Custo: ~5 linhas de shell e um passo a menos no README.

**Problemas novos no diff da correção:** nenhum BLOQUEANTE nem IMPORTANTE.
- `JwtAuthGuard.handleRequest` agora devolve 401 com mensagem fixa para qualquer erro do passport. Isso é bom, porque não vaza `jwt malformed`/`invalid signature`.
- O `DomainErrorFilter` só pega `DomainError`. O resto segue o filtro padrão, sem stack na resposta.
- O helmet manda `Strict-Transport-Security` também por http. O navegador ignora HSTS fora de https, então não há efeito em `http://IP:3333`. Só registro, não é achado.
- O segredo de exemplo com um espaço na frente escapa da recusa em produção (é comparação exata). Isso exige o operador fazer de propósito, então não é achado.
- O `helmet` 8.3.0 vem do registry oficial com `integrity` no lock.
- O `ownership-coverage.e2e-spec.ts` (`75660be`) atende à mensagem que deixei para o code-reviewer.

**Veredito da rodada 1: SEGURO (0 bloqueantes).** Os 10 achados foram tratados. O IMP 1 fica resolvido com o risco que sobra no compose aceito pelo chief, e a R1-1 é opcional.

## Mensagens (rodada 1)

→ chief: SEGURO, os 10 itens conferidos com ataque local e o audit de produção zerado. O aviso no boot basta para o teste técnico. Se quiser zerar o segredo público sem perder o `docker compose up` de um comando, a R1-1 (segredo gerado no volume na primeira subida) resolve com poucas linhas.
→ qa: abrir `/docs` num navegador comum, fazer Authorize + Try it out e conferir que o console não mostra violação de CSP. No Chrome headless a UI renderizou.

### Rodada 2

- Diff: `cd07f3f..7d16ad0` (3 commits: `130e273` limite por falha, `9d60e25` limites no compose, `7d16ad0` segredo gerado no volume).
- Ataques no `dist` local na porta 3997, com banco novo `sec.db`, rodando de uma pasta sem `.env`, com `TRUST_PROXY=1` e o limite por IP alto, para isolar o limite por CPF. O `docker-entrypoint.sh` rodou direto no macOS na porta 3996, com `JWT_SECRET_FILE` numa pasta temporária. Apaguei banco, arquivos de segredo e servidores no fim.

#### Limite de falhas por CPF (`LoginFailureLimitInterceptor`)

O que funciona (sequencial):
- Rodízio de `X-Forwarded-For`, com o CPF alternando com e sem máscara: 10×401 e depois 429. A senha certa num IP novo dá 429 durante a janela, com `Retry-After: 899`.
- 11 logins certos seguidos → 11×200 (login certo não gasta tentativa).
- 9 falhas, depois o login certo (200) e mais 10 falhas → 429 na 11ª. O sucesso zerou o contador, como projetado.
- Contornos com o CPF bloqueado:
  - urlencoded → 429
  - JSON com `cpf` duplicado (o último vale) → 429
  - `content-type: application/json; charset=utf-8` → 429
  - `cpf` como array (JSON, urlencoded repetido ou `cpf[]=`) → 400
  - `text/plain` → 400
  - dígitos Unicode de largura total → 400

  Nenhum contorno chega ao use case: o tracker e o DTO usam o mesmo `normalizeCpf`/`isCpf`.
- O 429 de CPF bloqueado sai antes do bcrypt. O bloqueio depende só de falhas, e CPF inexistente também falha, então ele não revela se o CPF existe.

##### [IMPORTANTE R2-1] Corrida: tentativas em paralelo passam todas, e a senha certa no meio delas entra
- Arquivo: `api/src/modules/auth/throttling/login-failure-limit.interceptor.ts:38-50`.
- Causa: o interceptor consulta o bloqueio (`blockedForMs`) antes do handler, mas só registra a falha (`registerFailure`) depois que o bcrypt termina, cerca de 100 ms depois. Toda requisição que chega nesse intervalo vê o contador antigo. Na rodada 1, o `ThrottlerGuard` incrementava antes do handler e por isso não tinha esse problema. É uma regressão da correção do IMP 2.
- Prova (local, `Promise.all` de requisições ao mesmo tempo, IPs diferentes no `X-Forwarded-For`, limite 10):
  - 100 senhas erradas para o Carlos → **100×401, nenhum 429**.
  - 100 tentativas para o Gustavo, com a senha certa na última → **99×401 e 1×200**. A senha certa entrou mesmo com 99 falhas no mesmo lote.
  - 30 tentativas para a Adelaide, com a certa na última → 29×401 e 1×200.
  - Com `curl` em segundo plano (chegada mais espalhada), 50 tentativas deram 11×401 e 39×429.
- Cenário: um anônimo com um CPF conhecido e K IPs manda, a cada janela de 15 min, um lote simultâneo de até `5 × K` senhas, que é o teto do limite por IP. Com 200 IPs (ou um /64 IPv6, porque o limite por IP usa o endereço inteiro), são ~1000 senhas por janela, e não 10. As 10^6 senhas de 6 dígitos caem em cerca de 10 dias, ou menos com mais IPs. O limite por CPF volta a ser só o limite por IP, que é o problema do IMP 2.
- Correção: reservar a tentativa **de forma síncrona antes do handler**. No mesmo tick da checagem (o Node é single-thread, então checar e incrementar juntos não tem corrida), fazer algo como `const ok = limiter.tryAcquire(key)`, que conta a tentativa como falha provisória e devolve false se já está no limite (aí 429). Depois:
  - sucesso → `reset(key)`, como hoje;
  - `InvalidCredentialsError` → a falha já está contada, não faz nada;
  - outro erro (500, validação) → `release(key)` desconta a tentativa.
- Teste: e2e com `Promise.all` de 20 tentativas erradas para um CPF, com limite 10 → no máximo 10 respostas que não são 429. Variante com a senha certa na última → 429. O spec do limiter cobre `tryAcquire` no limite.

#### Limites no compose (`9d60e25`)
- `${VAR:-padrão}`: quem roda o compose pode afrouxar o limite (por exemplo, para o Maestro). Só o operador controla isso, e a env validation continua exigindo inteiro ≥ 1. Sem achado.

#### Segredo gerado no volume (`docker-entrypoint.sh`, resolve a R1-1)

| Cenário | Resultado |
|---|---|
| Sem `JWT_SECRET` | gera `jwt-secret` com 64 caracteres (48 bytes aleatórios em base64), `-rw-------`. O log só traz o caminho: a busca pelo segredo no log achou 0 ocorrências. A API sobe e o login funciona |
| Reboot | o mesmo arquivo é reaproveitado, sem segunda mensagem "gerado", e o token emitido antes do restart continua 200 |
| `JWT_SECRET=` vazio (o `${JWT_SECRET:-}` do compose) | trata como ausente e gera |
| `JWT_SECRET` definido | o arquivo é ignorado, e um token assinado com o segredo do arquivo dá 401 |
| Arquivo apagado, novo segredo gerado | o token antigo dá 401 (rotação por `docker compose down -v` ou apagando o arquivo) |
| Pasta sem escrita | `Permission denied` no `.tmp`. O `set -eu` aborta e a API **não sobe** (falha fechada, com a causa no log) |
| Arquivo com segredo curto (`abc`) | o `@MinLength(32)` recusa no boot, e o valor não aparece no log |

- Revisão estática:
  - `umask 077` antes de criar o `.tmp` (o arquivo nasce com 600, sem janela de leitura) e `mv` atômico no mesmo diretório.
  - O `chmod 600` é redundante, mas não atrapalha.
  - O dono é o processo, que é `node` por causa do `USER node`.
  - O segredo só vai para a env do processo (não entra no `docker inspect`, porque não está na config do container) e não é ecoado.
  - Volume nomeado: herda `/app/data` (dono `node`) da imagem.
  - Bind mount de root sem escrita: falha fechada, como na tabela.
- Não validei o `stat -c '%a %U'` do smoke dentro de um container real (sem Docker na máquina).
- O `public-secrets.ts` perdeu o segredo do compose, que não existe mais. Sem achado.

O risco que sobrava da rodada 1 (segredo público do compose em `0.0.0.0`) está **eliminado**.

#### Situação dos achados

| # | Situação |
|---|---|
| IMP 1 | resolvido (o risco residual sumiu com o entrypoint) |
| IMP 2 | **reaberto como R2-1**: o sequencial funciona, mas o paralelo burla o limite |
| SUG 3–10 | continuam resolvidos (o diff não mexe neles) |

**Veredito da rodada 2: SEGURO quanto a bloqueantes (0), com 1 IMPORTANTE reaberto (R2-1).** Não é bloqueante pelo critério do contexto (teste local, dados do enunciado), mas é exatamente o ataque que o limite por CPF promete impedir. Recomendo corrigir antes do PR: `tryAcquire` síncrono e um e2e com `Promise.all`.

## Mensagens (rodada 2)

→ chief: o entrypoint resolveu o segredo do compose por completo. O limite por CPF funciona em sequência, mas é burlado por concorrência (prova: 100 tentativas simultâneas → 100×401; com a senha certa no lote → 200). Recomendo uma rodada curta só com o R2-1.
→ developer: no interceptor, reserve a tentativa no mesmo tick da checagem (`tryAcquire`), conte como falha até provar sucesso e desconte em erro que não é de credencial. Faça um e2e com `Promise.all` de 20 contra limite 10, esperando ≤10 respostas que não sejam 429.

### Rodada 3

- Diff: `7d16ad0..b821797`. São dois commits: `7e80e60` (`tryAcquire`/`release` no limiter e no interceptor, mais o e2e de concorrência) e `b821797` (`.gitattributes`, sem impacto em segurança).
- Ataques no `dist` local, porta 3997, banco novo `sec.db` (apagado no fim), rodando de uma pasta sem `.env`. Configuração: `TRUST_PROXY=1`, limite por IP alto e limite por CPF 10/15 min (padrão).

**R2-1 (corrida no limite por CPF): RESOLVIDO.** O `tryAcquire` checa e incrementa no mesmo tick, antes do bcrypt. O `release` só roda em erro que não seja `InvalidCredentialsError`, e o `reset` só no sucesso.

| Lote simultâneo (`Promise.all`, IPs variados) | Rodada 2 | Rodada 3 |
|---|---|---|
| 100 senhas erradas (Carlos) | 100×401 | **10×401, 90×429** |
| 100 tentativas, a certa por último (Gustavo) | 99×401 + **200** | **10×401, 90×429, a certa → 429** |
| 30 tentativas, a certa por último (Adelaide) | 29×401 + **200** | **10×401, 20×429, a certa → 429** |

Sequencial:
- 10 falhas → 401. A 11ª → 429, e a senha certa em seguida também → 429.
- 9 falhas, depois a certa (200, zera o contador), depois mais 10 falhas → a 11ª dá 429.
- 11 logins certos seguidos → 11×200.

Erro que não é de credencial: para simular o 500, renomeei a tabela `Guardian` no `sec.db` com a API no ar.
- 15 tentativas com a senha certa → 15×500, nenhum 429.
- 15 com a senha errada → 15×500.
- Lote paralelo de 30 → 30×500.

Depois de restaurar a tabela:
- O login certo deu 200, então a reserva foi devolvida e o usuário não ficou bloqueado.
- 10 falhas + 1 voltaram a dar 429.

O log de erro (`PrismaClientKnownRequestError`) não tem CPF nem senha: a busca deu 0 ocorrências.

Pontos que avaliei e não viraram achado:
- Um login certo no meio de um lote zera as reservas em curso. Só quem acerta a senha dispara isso, e aí o atacante já entrou.
- O `release` depois de um `reset` não faz nada.
- A janela conta da primeira tentativa reservada.
- O e2e `auth-throttle-cpf-concurrency.e2e-spec.ts` cobre o lote simultâneo.

#### Situação final da trilha api

| # | Situação |
|---|---|
| IMP 1 `JWT_SECRET` | resolvido (rodadas 1 e 2; o segredo do Docker é gerado no volume) |
| IMP 2 throttler por CPF | resolvido (R2-1 fechado nesta rodada) |
| SUG 3–10 | resolvidas (rodada 1) |
| R1-1 segredo do compose | resolvido (rodada 2) |

Não coberto, igual às rodadas anteriores:
- Build e execução da imagem Docker, porque não há Docker na máquina.
- Teste interativo do Swagger UI num navegador comum, que fica com o qa.

**Veredito final da trilha api: SEGURO (0 bloqueantes, 0 importantes abertos).**

## Mensagens (rodada 3)

→ chief: o R2-1 está resolvido. Os lotes simultâneos param em exatamente 10 tentativas por CPF, a senha certa depois do limite leva 429 e o 500 devolve a reserva. A trilha api está SEGURA, sem pendência de segurança para o PR.
→ qa: continua pendente só a conferência do `/docs` (Authorize + Try it out, console sem violação de CSP) num navegador comum.

## Trilha mobile

- Escopo: `40c8577..b6bdc22` (branch `feat/mobile`, worktree `.claude/worktrees/mobile`), diff em `revisao/branch-mobile.diff`. Li inteiros `src/services/**` (http, logger, storage), `src/stores/**`, `src/app/**`, `src/features/auth/**`, os schemas e services de agenda e boletim, `src/navigation/RootStack.tsx`, a splash, `AndroidManifest.xml`, `app/build.gradle`, `gradle.properties`, `Info.plist`, `AppDelegate.swift`, `SceneDelegate.swift`, `.env.example`, `.gitignore`, `.yarnrc.yml`, `package.json`, `mobile.yml` e `maestro.yml`.
- Prova local, sem alterar código:
  - Gerei o bundle de release (`react-native bundle --dev false --minify true`) para Android e iOS em `/tmp/fiap-sec-bundle.OzMI`, fora do repo, e fiz grep nele.
  - Rodei `yarn npm audit` (produção e completo).
  - Comparei o sha256 do `.yarn/releases/yarn-4.18.1.cjs` com o pacote publicado no npm.
  - Testei se as issues do zod 4 carregam o valor recebido.
  - Rodei o jest de `src/services`, `src/stores` e `src/app`: 12 suites e 94 testes verdes.
- Contexto considerado: o app é para o responsável ver a agenda e o boletim de menores. Os dados sensíveis são o CPF, a senha e o JWT (7 dias, sem revogação no servidor, D20), além do nome e das notas dos alunos. Não há dinheiro, KYC nem push.

### Classificação de risco por arquivo (differential review)

| Risco | Arquivos |
|---|---|
| ALTO | `services/storage/secureStorage.ts`, `stores/session.store.ts`, `services/http/{client,interceptors,errors}.ts`, `features/auth/api/useLoginMutation.ts`, `android/app/build.gradle`, `AndroidManifest.xml`, `Info.plist` |
| MÉDIO | `services/logger/*`, `app/devtools.ts`, `app/stateInspector.ts`, `services/storage/mmkv.ts`, `services/http/parseResponse.ts`, schemas zod, `navigation/RootStack.tsx`, `.github/workflows/{mobile,maestro}.yml` |
| BAIXO | telas, componentes, tema, utils, flows do Maestro, testes |

Blast radius:
- Todo request passa por um único `http` (axios), que tem um interceptor de token e um de 401.
- O token é lido em um lugar só (`secureStorage`).
- A sessão inteira (`signIn`/`signOut`) fica no `session.store`, que é a única fonte de "logado" para o `RootStack`. Sem `signedIn`, só a rota Login existe. Não há deep link que alcance uma tela autenticada.
- Uma falha em `secureStorage` ou no `signOut` afeta todas as telas.

### Achados

Nenhum BLOQUEANTE. 2 IMPORTANTES e 4 SUGESTÕES.

#### [IMPORTANTE 1] No iOS, o token continua no Keychain depois que o app é desinstalado, e a reinstalação entra direto na conta
- Arquivo: `mobile/src/services/storage/secureStorage.ts:44-48` (gravação) e `mobile/src/stores/session.store.ts:47-52` (o `bootstrap` confia em qualquer token que encontrar).
- Risco: os itens do Keychain do iOS não somem quando o app é desinstalado, e o `accessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` não muda isso. Na reinstalação, o `bootstrap` lê o JWT antigo, o `/me` responde 200 e o app abre a agenda e o boletim do aluno. O responsável não precisa digitar nada. O JWT dura 7 dias e não pode ser revogado no servidor.
- Cenário: o responsável apaga o app achando que isso encerra a sessão. Pode ser um iPad da família, ou um aparelho repassado sem apagar tudo. Outra pessoa reinstala o FIAP School pela mesma Apple ID ou por TestFlight. A splash chama `GET /me` com o token antigo e cai nas abas, com o nome, a turma, as notas e as faltas do menor.
- Correção: guardar uma marca de instalação no mmkv, que é apagado junto com o app. Exemplo: `mmkv.getBoolean('installed')`. No `bootstrap`, se a marca não existir, rodar `Keychain.resetGenericPassword({ service })` antes do `loadToken` e gravar a marca. Junto, um teste no `session.store.test.ts` para o caso "sem marca, com token no keychain, termina em signedOut". No Android o problema não existe (a desinstalação apaga os dados), e o mesmo código não atrapalha lá.

#### [IMPORTANTE 2] O APK de release é assinado com o `debug.keystore` público do template (atenção na Tarefa 17)
- Arquivo: `mobile/android/app/build.gradle:102-105` (`release { signingConfig signingConfigs.debug }`) e `mobile/android/app/debug.keystore`, versionado com a senha `android`.
- Risco: hoje nada distribui o release, porque o CI só gera `assembleDebug`. Isso muda na T17, que publica o APK de release em tag (D32). A chave de debug do template do RN é a mesma em todos os projetos criados por ele e está no repositório público. O Android aceita como atualização qualquer APK com o mesmo `applicationId` e o mesmo certificado. O APK atualizado roda com o mesmo UID, então consegue ler o token pelo Keystore e capturar o CPF e a senha no próximo login.
- Cenário: o avaliador ou um responsável instala o APK da tag. Um atacante gera um APK `br.com.fiap.school` assinado com o `debug.keystore` do repositório e o distribui como "nova versão". Ao ser instalado por cima, ele lê `RN_KEYCHAIN`, decifra o JWT pelo Keystore do próprio app e o envia para fora.
- Correção (na T17): criar um keystore de release fora do repositório e guardá-lo em base64 nos GitHub Secrets, junto com a senha e o alias. O `signingConfigs.release` lê esses valores de variável de ambiente ou de `~/.gradle/gradle.properties`, e o job da tag decodifica o keystore só no runner. Fora do CI, o build local de release pode continuar com a chave de debug, desde que avise no log do Gradle. O APK publicado nunca usa a chave de debug.

#### [SUGESTÃO 3] Se apagar o token do keychain falhar, o logout não acontece de verdade e ninguém fica sabendo
- Arquivo: `mobile/src/services/storage/secureStorage.ts:52-59` e `mobile/src/stores/session.store.ts:63-72`.
- Risco: o `clearToken` zera a memória e engole o erro do `resetGenericPassword`, deixando só um `warn`. A tela vai para o Login, mas o token continua no disco. Na próxima abertura o `bootstrap` o lê e a sessão volta. É improvável, porque depende de falha do Keychain ou do Keystore, mas quando acontece o "Sair" não sai e o usuário não é avisado.
- Correção: se o reset falhar, tentar sobrescrever com `setGenericPassword` com valor vazio e tentar o reset de novo. Uma alternativa é gravar `loggedOut=true` no mmkv e fazer o `bootstrap` ignorar o token enquanto essa marca existir (ela some no próximo `signIn`). Registrar como `error`, não como `warn`.

#### [SUGESTÃO 4] Agenda e boletim aparecem no retrato do app switcher (opcional)
- Arquivo: `mobile/ios/FiapSchool/SceneDelegate.swift` (não há cobertura em `sceneWillResignActive`) e `mobile/android/app/src/main/java/br/com/fiap/school/MainActivity.kt` (sem `FLAG_SECURE`).
- Risco: o sistema tira um retrato da tela atual quando o app vai para o fundo. Ele aparece no seletor de apps (e no iOS fica salvo em disco). Quem pegar o aparelho desbloqueado vê as notas e as faltas do menor sem abrir o app.
- Correção: no iOS, colocar uma view de cobertura (fundo do tema com o logo) em `sceneWillResignActive` e tirar em `sceneDidBecomeActive`. No Android, usar `FLAG_SECURE` só no release (`if (!BuildConfig.DEBUG)`), porque ele deixa os prints do Maestro e do `screencap` pretos e o Maestro roda em APK debug.

#### [SUGESTÃO 5] CI: actions presas por tag, não por SHA, e o instalador do Maestro roda via `curl | bash` sem conferir checksum
- Arquivo: `.github/workflows/maestro.yml:147-152` (`curl -fsSL https://get.maestro.mobile.dev | bash`) e todos os `uses: ...@v4`/`@v2` nos dois workflows (`reactivecircus/android-emulator-runner@v2`, `gradle/actions/setup-gradle@v4` etc.).
- Risco: o `MAESTRO_VERSION` fixa a versão do binário, mas o script de instalação é baixado na hora e não tem verificação. Uma tag de action também pode ser movida. Se o script ou uma dessas actions for comprometido, o job inteiro roda código do atacante. O dano é limitado: `permissions: contents: read`, `pull_request` (não `pull_request_target`) e nenhum segredo. Mesmo assim, o artefato `mobile-android-debug-apk` poderia ser trocado por outro.
- Correção: prender as actions pelo SHA do commit, com comentário da versão, e deixar o Dependabot atualizar. Para o Maestro, baixar o zip `cli-2.11.0` da release do GitHub e conferir o `sha256sum` antes de descompactar.

#### [SUGESTÃO 6] HTTP em claro no release: manter o padrão seguro quando a T17 abrir exceção
- Arquivo: `mobile/android/app/src/main/AndroidManifest.xml:11` (`usesCleartextTraffic="${usesCleartextTraffic}"`) e `mobile/ios/FiapSchool/Info.plist:29-35`.
- Situação de hoje, correta:
  - O plugin Gradle do RN 0.88 (`AgpConfiguratorUtils.kt`) define `true` em `debug`/`debugOptimized` e `false` em `release`, então o APK de release não faz HTTP.
  - No iOS, `NSAllowsArbitraryLoads=false` e `NSAllowsLocalNetworking=true`. Isso libera HTTP só para IP, nome sem domínio e `.local`, também no release.
- Risco: o ledger já prevê uma network security config na T17 para o APK da tag. O caminho mais fácil seria `usesCleartextTraffic="true"` ou um `<base-config cleartextTrafficPermitted="true">`, e isso deixaria o CPF e a senha em claro para qualquer host.
- Correção (na T17): de preferência, a API de demonstração em HTTPS. Se for HTTP, usar `res/xml/network_security_config.xml` com `<domain-config cleartextTrafficPermitted="true">` apenas para o host da demonstração, com `base-config` sem cleartext, e só no sourceSet `release`. No README, avisar que o login trafega em claro nessa configuração.

### Verificado e seguro

- **Keychain no iOS:** `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` e sem `synchronizable`, então o token não vai para o iCloud Keychain nem para backup restaurável em outro aparelho. `WHEN_UNLOCKED_THIS_DEVICE_ONLY` seria mais estrito, e o app não precisa de acesso em background. É opcional.
- **Keychain no Android:** o react-native-keychain 10.0.0 usa por padrão AES-GCM com a chave no Keystore. `allowBackup="false"`. Na transferência entre aparelhos do Android 12 ou mais novo, o blob é copiado mas a chave do Keystore não, então o `loadToken` cai em `null`, que já é tratado.
- **mmkv:** só `selectedStudentId` vai para o disco (`partialize`, `session.store.ts:81`). Não há outro uso de mmkv nem de AsyncStorage. O cache do React Query fica só em memória, sem persister. O `guardian` não é persistido.
- **Logout e 401:**
  - O `signOut` apaga o token, faz `queryClient.clear()` e zera `guardian` e `selectedStudentId`.
  - O 401 só encerra a sessão se veio do token em uso naquele momento. Um 401 do `/auth/login` ou do token explícito do login não derruba a sessão.
  - Se o `/me` falhar depois do login, o token não é gravado. Se o keychain falhar, o `/me` sai do cache.
  - A mutation de login tem `gcTime: 0`.
- **Logger:**
  - A redação é feita pela chave (`authorization`, `password`, `cpf`, `token`…).
  - Um `Error` vira só nome e mensagem.
  - A `cause` do `ApiError` é só `{name, code, status, method, url sem query}`.
  - O `parseResponse` loga só o caminho e o código de cada issue. Testei que as issues do zod 4.6.7 não carregam o valor recebido.
  - Em produção o nível mínimo é `warn`.
  - A URL logada tem só o `studentId` (cuid), sem CPF.
- **Bundle de release (Android e iOS, gerados em /tmp):**
  - 0 ocorrências de `reactotron` (sem diferenciar maiúsculas), `connectReactotron`, `watchAppState`, `snapshotQueryCache`, `msw`, `adb reverse` e `localhost:3333`.
  - O `10.0.2.2` que aparece é a constante do `apiUrl.ts`.
  - Não achei nenhum segredo.
  - O `require` dentro de `if (__DEV__)` funciona como o ledger descreve.
- **`API_URL`:** é a única variável do `.env`. O `.env`/`.env.*` está no `.gitignore` e só o `.env.example` é versionado. O react-native-config grava o `.env` no BuildConfig e nos recursos (Android) e no binário (iOS). Tudo o que entrar ali é público, e hoje só entra a URL.
- **Manifest:** só a `MainActivity` é exportada, com `MAIN`/`LAUNCHER`. Não há intent-filter `VIEW`, deep link, `CFBundleURLTypes`, entitlements nem uso de `Linking`. As libs nativas não adicionam componentes ao manifest. O keychain só adiciona `USE_BIOMETRIC`/`USE_FINGERPRINT`, que não são usadas. O `DevSettingsActivity` do RN fica só no sourceSet debug.
- **Respostas da API:** todas passam por zod (`parseResponse`), e o `z.object` descarta chaves extras. O CPF do `/me` já chega mascarado. O `studentId` vai na URL com `encodeURIComponent`, e o `year` é número. Não há `dangerouslySetInnerHTML`, WebView nem `eval`.
- **Formulário de login:** a senha tem `secureTextEntry`, `textContentType="password"` e `autoCorrect={false}`. O CPF usa `number-pad` e o autofill de `username`.
- **Dependências:**
  - `yarn npm audit --environment production`: 0 advisories.
  - Audit completo: só ferramentas de dev. Aparecem deprecations do eslint 8 e do glob, `deepmerge` low no `@react-native-community/cli` e `uuid` moderate no `xcode`. Nenhum deles entra no app nem recebe entrada de atacante.
  - O sha256 do `yarn-4.18.1.cjs` versionado é igual ao do `@yarnpkg/cli-dist@4.18.1` do npm.
  - O lockfile resolve tudo por `npm:` com checksum. Os únicos patches são os builtin do yarn.
  - Os pacotes diretos são os oficiais.
- **Workflows:**
  - `permissions: contents: read` nos dois.
  - O gatilho é `pull_request`, não `pull_request_target`.
  - Nenhum `${{ }}` com título, branch, label ou input aparece dentro de `run:`. O `inputs.ios` (boolean) e as labels só aparecem em `if:`.
  - O `JWT_SECRET` do job do Maestro é gerado com `openssl rand` e mascarado.
  - Usa `yarn install --immutable`.
  - Os artefatos (cobertura, APK debug com a URL do exemplo, relatório do Maestro, log da API, que já é redigido no lado da API) não têm segredo.

### Não coberto

- Build Android: não há JDK nem SDK na máquina, então não inspecionei o manifest final já mesclado. Conferi os manifests das libs um por um.
- A persistência do Keychain depois da desinstalação não foi reproduzida no simulador. O achado se apoia no comportamento documentado do iOS e no código, que não limpa o Keychain na primeira execução.
- O retrato do app switcher não foi observado num aparelho.

### Resumo

| # | Severidade | Situação |
|---|---|---|
| 1 | IMPORTANTE | Token sobrevive à desinstalação no iOS. Correção barata (marca de instalação no mmkv). |
| 2 | IMPORTANTE | Release assinado com a chave de debug pública. Não afeta esta branch, mas é obrigatório resolver na T17 antes de publicar o APK. |
| 3 | SUGESTÃO | Falha no reset do keychain deixa o logout sem efeito. |
| 4 | SUGESTÃO | Retrato do app switcher (opcional). |
| 5 | SUGESTÃO | Actions presas por SHA e checksum do Maestro. |
| 6 | SUGESTÃO | Cleartext da T17 restrito a um domínio. |

**Veredito da trilha mobile: SEGURO (0 bloqueantes; 2 importantes, 4 sugestões).**

## Mensagens (trilha mobile)

→ chief: nada bloqueia o PR da trilha mobile.
- IMP 1 (marca de instalação para limpar o Keychain no iOS) cabe numa rodada curta: uns 10 linhas e um teste no store.
- IMP 2 e SUG 6 são pré-requisitos da T17 (CD do APK), não desta branch: keystore de release em secret e cleartext só para o host da demonstração. Vale registrar no ledger.
- SUG 3 a 5 ficam a seu critério.
- Não mexi em nenhum arquivo do repo. Os bundles de prova estão em `/tmp/fiap-sec-bundle.OzMI` e podem ser apagados.

→ developer (se o chief abrir rodada): IMP 1 em `session.store.ts`/`secureStorage.ts`, com o teste "sem marca de instalação + token no keychain → signedOut e keychain limpo".

→ qa: no aparelho, conferir que o "Sair" seguido de fechar e reabrir o app volta ao Login. Se a SUG 4 entrar, conferir também o app switcher.

### Rodada 1 (trilha mobile)

- Escopo: `b6bdc22..537a032`. A correção é o commit `f9758e4`, que mexe em `secureStorage.ts` e nos testes. Os outros commits do intervalo também passaram pela revisão: foco do app via `AppState`, shim das traduções do zod no Metro, remoção do gesture-handler e do react-refresh, refactors de UI e de strings.
- Prova:
  - O jest de services, stores e app passou: 13 suites, 104 testes.
  - Gerei de novo o bundle de release do Android em `/tmp/fiap-sec-bundle.OzMI/r1`. Ele continua com 0 ocorrências de reactotron, inspector e msw, agora que o `metro.config.js` tem `resolveRequest` próprio.

#### IMP 1 (token de uma instalação anterior): resolvido
- O `loadToken` só lê o Keychain se a marca `secureStorage.installed` estiver no mmkv. Sem a marca, ele apaga o Keychain e devolve `null`. A marca é gravada quando o reset funciona e também em todo `setToken`.
- "Limpar dados" no Android apaga o mmkv junto com o resto. A marca some, a próxima abertura apaga o Keychain e o usuário vai para o Login. Se a chave do Keystore também tiver sido apagada, o resultado é o mesmo. A falha é sempre para o lado fechado.
- iOS:
  - Desinstalar apaga o mmkv, então o token velho é apagado na reinstalação. Esse era o achado.
  - "Descarregar app" mantém os dados, então a sessão continua, o que é correto.
  - Restaurar o backup em outro aparelho traz a marca, mas não o item `ThisDeviceOnly`, então o app vai para o Login.
- Se o app morrer entre o `setGenericPassword` e o `mmkv.set` no primeiro login, o token é apagado na abertura seguinte e o usuário loga de novo. A falha é para o lado fechado.
- Efeito colateral aceito: quem já tinha o app instalado de builds anteriores é deslogado uma vez. Não há usuário em produção.

#### SUG 3 (logout em que apagar o token falha): resolvido
- Se o `resetGenericPassword` falhar no `clearToken`, a falha vai para `logger.error`. O contexto é só o `Error` redigido (nome e mensagem), sem token. Também é gravada a marca `pendingClear`.
- Na abertura seguinte, com `pendingClear`, o token não é lido. O app tenta apagar de novo, e a marca só sai quando o reset funciona ou quando há um novo login.
- Respostas às perguntas do chief:
  - **O app fica preso sem conseguir logar?** Não.
    - Com o reset falhando sempre e o `set` funcionando, o `setGenericPassword` sobrescreve o item, grava `installed` e remove `pendingClear`. O login funciona e as aberturas seguintes leem o token novo.
    - Com o Keychain falhando por inteiro, o login mostra o erro de `storage` que já existia. Isso é o comportamento desejado (D9: sem Keychain não há sessão), não uma regressão.
  - **Corrida entre `bootstrap` e logout:** pela interface ela não acontece. O "Sair" só existe nas abas, que só aparecem depois que a splash resolve o `bootstrap`.
    - O único caso concorrente é o Keychain demorar mais que a trava de 10 s da splash e o usuário logar antes de o `loadToken` atrasado terminar.
    - Nos dois ramos novos, o `cached = null` acontece antes do `await` e o código não o toca depois. Um reset atrasado no máximo apaga do disco o token recém-gravado, e o pior caso é pedir login na próxima abertura (lado fechado).
    - O ramo antigo de leitura atrasada pode sobrescrever o `cached`, mas isso já existia antes desta rodada e não é do diff. Fica só registrado: é improvável (o Keychain precisaria travar mais de 10 s) e não abre a sessão de outra pessoa, porque um token salvo só existe se ninguém saiu daquela sessão.
- O foco do app (`appFocus.ts`) só refaz queries vencidas que estão na tela quando o app volta ao primeiro plano. Com o token expirado, o `/me` dá 401 e o interceptor encerra a sessão. Ficou mais seguro, não menos.

#### Problemas novos no diff
Nenhum. O shim do Metro só troca o índice das traduções do zod por um módulo local versionado (`metro/zod-locales.js`), sem entrada externa. As dependências foram removidas, nenhuma foi adicionada.

#### Situação dos achados da trilha mobile

| # | Situação |
|---|---|
| IMP 1 Keychain após desinstalação | resolvido (`f9758e4`) |
| IMP 2 keystore de debug no release | adiado para a T17 (APK em tag só com keystore de release) |
| SUG 3 logout com falha no Keychain | resolvido (`f9758e4`) |
| SUG 4 app switcher | adiado (opcional) |
| SUG 5 SHA das actions / checksum do Maestro | adiado |
| SUG 6 cleartext do release | adiado para a T17 (só para o host da demonstração) |

**Veredito da rodada 1 da trilha mobile: SEGURO (0 bloqueantes, 0 importantes abertos nesta branch).**

## Mensagens (trilha mobile, rodada 1)

→ chief: IMP 1 e SUG 3 estão resolvidos e o diff não trouxe problema novo. A trilha mobile está SEGURA para o PR. Ficam para a T17 o IMP 2 e a SUG 6.
