/** Conventional commits em português; escopos conhecidos geram aviso, não erro. */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      ['api', 'mobile', 'ci', 'docs', 'spec', 'squad', 'deps', 'release'],
    ],
    // as mensagens são em português (nomes próprios, siglas): sem regra de caixa
    'subject-case': [0],
    // Comprimento vira aviso: o corpo costuma citar caminhos de arquivo longos,
    // e o histórico já mergeado na main tem linhas acima de 100 caracteres (que
    // não reescrevemos). Tipo e assunto continuam obrigatórios (config-conventional).
    'header-max-length': [1, 'always', 100],
    'body-max-line-length': [1, 'always', 100],
    'footer-max-line-length': [1, 'always', 100],
  },
};
