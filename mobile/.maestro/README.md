# Flows do Maestro

Um flow por caso de uso (brief, seção 6), usando `testID` e os responsáveis do
seed da API.

| Flow                              | Caso de uso                                                    |
| --------------------------------- | -------------------------------------------------------------- |
| `01-login-invalido.yaml`          | senha errada → mensagem de erro, continua no Login             |
| `02-login-sucesso.yaml`           | login → Agenda com o header (saudação, aluno, TROCAR PERFIL)   |
| `03-sessao-persistida.yaml`       | login → `stopApp` → `launchApp` → Agenda sem login             |
| `04-aulas-navegar-dias.yaml`      | dropdown de dias: segunda, terça e domingo (vazio)             |
| `05-boletim-2025.yaml`            | "7EF - 2025", 1º trimestre com nota e faltas, 2º trimestre `-` |
| `06-boletim-anos-anteriores.yaml` | troca para "6EF - 2024"                                        |
| `07-trocar-aluno.yaml`            | troca de aluno a partir do Boletim e continua no Boletim       |
| `08-um-aluno-sem-botao.yaml`      | responsável com 1 aluno não vê TROCAR PERFIL                   |
| `09-sem-aluno.yaml`               | responsável sem aluno vê o estado vazio                        |
| `10-logout.yaml`                  | SAIR → Login; reabrir o app continua no Login                  |

`subflows/` tem os passos repetidos (abrir o app limpo, login, trocar aluno,
sair). Eles só rodam chamados pelos flows (`config.yaml` pega só a raiz).

Contas usadas (seed): Gustavo `96929456004` / `123456` (Rafael e Joana),
Adelaide `50879567007` / `987654` (Bianca) e Carlos `31415926590` / `111111`
(sem aluno). Os flows escolhem o aluno pelo TROCAR PERFIL quando o dado
importa, então não dependem de qual aluno o `/me` traz primeiro, nem do dia de
hoje (o dia da Agenda é escolhido no dropdown).

## Pré-requisitos

- [Maestro CLI](https://docs.maestro.dev/getting-started/installing-maestro):
  `curl -fsSL "https://get.maestro.mobile.dev" | bash`.
- Java 17 (o Maestro roda na JVM).
- Simulador iOS ou emulador Android com o app instalado (`yarn ios` /
  `yarn android`), bundle id `br.com.fiap.school`.
- A API rodando com o seed e com os limites do login altos, porque os flows
  logam muitas vezes seguidas com o mesmo CPF. Em `api/.env`:

  ```
  LOGIN_THROTTLE_LIMIT=1000
  LOGIN_THROTTLE_CPF_LIMIT=1000
  ```

- `API_URL` do app apontando para essa API (`mobile/.env`; no emulador
  Android, `http://10.0.2.2:3333/api`). O `.env` entra no build nativo.

## Como rodar

Em `mobile/`:

```bash
maestro test .maestro                          # todos os flows
maestro test .maestro/04-aulas-navegar-dias.yaml   # um flow
maestro test .maestro --include-tags boletim   # por tag (login, agenda, boletim, alunos)
yarn maestro:check                             # checagem estática, sem Maestro
```

Com mais de um aparelho ligado, escolha com `maestro --device <id> test ...`.

`yarn maestro:check` confere, sem emulador, que os YAML são válidos, que o
`appId` é o do app, que os subflows existem e que todo `id` usado nos flows
existe como `testID` em `src/`. Ele roda no `mobile.yml` a cada PR.

No CI, o workflow `maestro.yml` sobe a API, builda o APK e roda os flows num
emulador Android. Ele roda pelo `workflow_dispatch` ou num PR com a label
`e2e`.

## Observações

- A splash tem duração mínima, então os flows esperam o Login ou a Agenda por
  até 12 s depois do `launchApp`.
- No iOS, o texto de dentro de um elemento acessível (ex.: nota e faltas, o
  nome do aluno no header) aparece só no rótulo do elemento. Por isso os flows
  conferem o rótulo (`Nota 9,5, 0 faltas`, `Aluno Rafael, ...`), que vale nas
  duas plataformas, e os textos internos (`9,5`, `-`) só no Android.
