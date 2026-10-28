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
  },
};
