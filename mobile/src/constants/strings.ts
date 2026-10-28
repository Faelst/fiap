/**
 * Textos da interface, exatamente como na tela (01-design.md, seção 5). As
 * telas, os testes e o Maestro leem daqui para não duplicar texto.
 */
export const strings = {
  login: {
    logoLabel: 'FIAP School',
    cpfLabel: 'CPF',
    cpfHint: 'Somente números',
    passwordLabel: 'SENHA',
    passwordAccessibilityLabel: 'Senha',
    submit: 'FAZER LOGIN',
    submitAccessibilityLabel: 'Fazer login',
    submittingAccessibilityLabel: 'Entrando',
    error: {
      invalid: 'Usuário ou senha inválida.\nPode tentar novamente?',
      cpf: 'Confira o CPF digitado.',
      network:
        'Não conseguimos falar com o servidor.\nConfira sua conexão e tente de novo.',
      tooMany:
        'Muitas tentativas seguidas.\nAguarde um minuto e tente de novo.',
      server: 'Algo deu errado do nosso lado.\nTente de novo em instantes.',
      sessionExpired: 'Sua sessão expirou. Entre de novo.',
    },
  },
} as const;
