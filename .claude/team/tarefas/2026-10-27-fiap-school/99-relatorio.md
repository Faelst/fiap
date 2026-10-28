# Relatório final — fiap-school (v1)

Branch de entrega: `release/v1`, que integra `spec/fiap-school`, `chore/tooling`,
`feat/api` e `feat/mobile`. Ela vai num único PR para `main`; o merge é do usuário.

## 1. O que foi feito

Um app React Native CLI (TypeScript + Restyle) para os responsáveis dos alunos da
FIAP School, seguindo o Figma do teste. As telas:

- **Splash animada** com o logo FIAP.
- **Login** por CPF (com máscara) e senha. A sessão é mantida.
- **Agenda:** os dias da semana num dropdown e as aulas do dia. O app abre no mesmo
  dia da semana de hoje.
- **Boletim:** turma e ano, com trimestres e disciplinas em acordeão.
- **Troca de aluno**, tela de **sem aluno**, **erro de rede** com "Tentar de novo"
  e **logout**.

Os dados vêm de uma **API própria em NestJS**, que substitui o JSON. O JSON oficial é
o seed dela. A API usa JWT, class-validator, decorators próprios, controllers → use
cases (cada um com teste), Prisma + SQLite com migrations e seed, Swagger, Docker e
logs sem dados sensíveis.

Qualidade:

- Testes: 298 unitários e 122 e2e na API; 440 testes de componente e ViewModel no
  app, com 98% de cobertura.
- 10 flows do Maestro.
- husky + commitlint.
- GitHub Actions: `api.yml`, `mobile.yml`, `maestro.yml` e `commitlint.yml`.
- O projeto foi feito com IA por SDD, usando o `/squad` (agents, protocolo e skills
  versionados em `.claude/`). Toda a trilha está nesta pasta: brief, plano, ledger,
  design, dev, reviews, segurança, QA e evidências.

## 2. Como foi feito

As decisões, com o porquê e o custo de cada uma, estão no `00-brief.md` (D1–D36) e
no `00-ledger.md` (uma linha `Decisão:` por item). As principais:

- **Monorepo.** `api/` e `mobile/` ficam lado a lado, sem workspaces. O mobile usa
  yarn 4 fixado na própria pasta; a raiz e a API usam yarn 1.
- **Escopo removido a pedido do usuário:** OTA (D34) e push (D12). Sem eles, os
  **Expo Modules foram removidos**, e o app é React Native CLI puro.
- **Agenda pela data do JSON.** Os dados são a semana fixa de 16 a 22/03/2025. O app
  abre no dia dessa semana que cai no mesmo dia da semana de hoje (D35).
- **zod para validação e zustand para estado.** O pedido falava em "zod para estado
  compartilhado"; a decisão está registrada no D7.
- **Segurança da API:**
  - bcrypt com comparação contra hash falso, para não revelar quais CPFs existem;
  - mesma resposta 401 para CPF inexistente e senha errada;
  - limite de login por IP e por CPF, este só para falhas e com reserva atômica;
  - JWT com exp, iss, aud e segredo de 32+ caracteres (gerado no volume do Docker);
  - 403 igual para aluno inexistente e aluno de outro responsável;
  - helmet; CORS e Swagger configurados em produção; logs com redação.
- **Segurança do app:**
  - token só no Keychain, sem sincronização com o iCloud;
  - o Keychain é limpo na primeira abertura depois de instalar o app;
  - mmkv guarda só o aluno selecionado;
  - logger com redação, e Reactotron fora do bundle de release;
  - Android release sem cleartext.
- **Ordem dos alunos:** segue a ordem do JSON (Rafael antes de Joana), pelo campo
  `GuardianStudent.position`.
- **APK de release fora do escopo.** Sem API pública, o APK não teria com quem falar.
  O CI gera um APK debug como artefato.

## 3. PR

Ainda não foi aberto: o repositório não tem remote. Quando o usuário informar o
nome, ele é criado público com `gh repo create` e abre um PR `release/v1` → `main`,
sem merge feito pelo time. Se esse PR entrar por squash ou rebase, nada precisa ser
rebaseado, porque as trilhas já estão dentro dele.

## 4. Testes

- **Developer:** TDD em cada tarefa, com o RED registrado no `02-dev.md`; suítes
  verdes em cada entrega.
- **QA (`05-qa.md`):**
  - ✅ A1–A8 (API com curl e Swagger no navegador);
  - ✅ M1–M9 e M12 no simulador iOS com a API real;
  - ✅ G1;
  - G2 só verificado de forma estática;
  - G3 corrigido depois do QA, com o Início rápido testado num clone limpo pelos
    dois caminhos do CocoaPods.
- **Não testado** (a máquina não tem JDK/SDK, Docker nem Maestro, e não há remote):
  - Android (build e execução);
  - os flows do Maestro;
  - a imagem Docker;
  - os workflows no GitHub;
  - VoiceOver e TalkBack reais;
  - o teclado de software na tela.

  A primeira execução do CI é a prova desses itens.

## 5. Review e segurança

- Cada tarefa passou por code review, com até 3 rodadas. Houve revisão final por
  trilha (api e mobile) com o code-reviewer e o cyber-security em paralelo, e as duas
  trilhas terminaram **SEGURAS**, sem bloqueantes.
- Correções importantes que saíram das revisões:
  - corrida no limite por CPF;
  - segredo do JWT;
  - token que sobrevivia à desinstalação no iOS;
  - `JWT_EXPIRES_IN` sem unidade;
  - dependências sem uso.
- Ficaram adiados (no ledger, sem impacto na entrega):
  - máquina de retry duplicada nos ViewModels;
  - ícone do app ainda do template;
  - actions sem pin por SHA;
  - app switcher sem cobertura;
  - abrir o 3º trimestre não rola a tela;
  - senha exibida com "•" em vez de "*".

## 6. Como rodar e entregar

Está tudo no `README.md` da raiz: Início rápido, API com yarn ou Docker, app iOS e
Android, credenciais, testes e Maestro.

Não há deploy em loja nem servidor.

Para entregar à FIAP:

1. Criar o repositório público.
2. Fazer o push da `release/v1`, abrir o PR e mergear.
3. Conferir o CI.
4. Enviar o link para liderancadev@fiap.com.br.

## 7. Pendências fora do código

1. **Nome do repositório no GitHub.** Ele destrava o PR, o CI e o link da entrega.
2. **Logo em SVG** (nó `4001:4` da Capa) e a ilustração `no-classroom` em @2x/@3x,
   exportados do Figma para `docs/figma/assets/`. Hoje o PNG 1× fica borrado no login
   e na splash.
3. **Primeira execução do CI:** conferir os jobs `docker`, `android` e `maestro`.
   Se algum falhar, abrir uma rodada de ajuste.
4. **Ambiente local:** parar o Metro antigo (`kill 35131`, porta 8081). Os vídeos
   originais em resolução cheia estão em `/.evidencias-originais/`, fora do git.
5. **Próximo projeto:** a v2 de UI, cujo pedido está em
   `.claude/team/tarefas/2026-10-28-app-v2/00-pedido.md`. Começa com brief e
   aprovação.
