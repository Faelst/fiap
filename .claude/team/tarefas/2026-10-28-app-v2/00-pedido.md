# Pedido — app v2 (fila: começa depois da v1 entregue e validada)

Registrado em 2026-10-28. Ainda não há brief: o chief escreve o `00-brief.md`
(skill `brainstorming`) quando a v1 (`2026-10-27-fiap-school`) estiver
concluída, validada e com os PRs abertos.

## Pedido do usuário (literal)

> ao finalizar todas as tarefa da v1 e ter validado, criar uma branch v2 para o
> app onde vamos criar uma interface mais moderna com mais efeitos nas pages,
> botoes a arredondados, inputs mais bem formatados, layout do login mais bem
> estruturado,
> tela de aulas ao invez de ser um drop box ser um calendario, onde selecionando
> o dia mostra as aulas do dia, e mostra uma linha que representa o horario e em
> que aula esta ocorrendo agora como um timetable, mas com um layout moderno, o
> navbar deve ser um navbar flutuante com bordas redondas, onde no navbar vai ter
> a terceira opção do perfil para onde vai ter as informações pessoais e poder
> alterar o perfil e poder deslogar
> boletim tambem, deixar mais modernizado e de facil intendimento para o usuario,
> priorizando o UX.
>
> refatorar todo o layout deixar mais moder e priorizando o User Experience.

## Itens extraídos (para o brief)

1. Branch `v2` do app, a partir da v1 validada.
2. Visual mais moderno em todo o app: mais efeitos nas telas, botões
   arredondados, inputs mais bem formatados.
3. Login com layout mais bem estruturado.
4. Aulas: calendário no lugar do dropdown; ao escolher o dia, mostra as aulas
   num timetable moderno com uma linha do horário atual e destaque da aula em
   andamento.
5. Tab bar flutuante com bordas arredondadas e uma 3ª aba **Perfil**: dados
   pessoais, trocar de aluno ("alterar o perfil") e sair.
6. Boletim mais moderno e fácil de entender.
7. Refatorar todo o layout priorizando UX.

## Pontos para resolver no brief (anotações do chief)

- **O teste da FIAP exige seguir o Figma.** A v2 se afasta dele de propósito, então
  a entrega oficial continua sendo a v1. A v2 fica numa branch própria, como
  evolução, e o README explica a diferença.
- **"Aula acontecendo agora":** a agenda do JSON é a semana fixa de 16 a 22/03/2025.
  A linha do horário usa a hora real do aparelho sobre o dia escolhido. O destaque
  só faz sentido no dia da semana de hoje, pela regra D35.
- **Calendário:** os dados só têm uma semana. Decidir entre uma faixa semanal e um
  mês com só esses dias habilitados.
- **Perfil:** quais dados pessoais mostrar. A API devolve nome, CPF mascarado e
  alunos; o e-mail existe no banco, mas não é exposto. "Alterar o perfil" é trocar
  de aluno ou editar dados? Editar dados exigiria rotas novas na API.
- **Design:** não há Figma para a v2. O designer cria a direção visual (tokens, tab
  bar flutuante, timetable, boletim) e o usuário aprova antes do código.
- **Testes:** os flows do Maestro e os testIDs mudam onde a navegação mudar
  (aba Perfil, calendário).
