const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;

/**
 * Lint dos arquivos staged de uma pasta (api/ ou mobile/), sem passar pelo
 * yarn (o yarn do PATH pode ser de outro projeto): usa os binários da própria
 * pasta, com ela como diretório de trabalho, para o eslint achar a config.
 * Se a pasta ainda não existe (trilha em outra branch), ignora; se existe mas
 * não foi instalada, pula o lint avisando claramente.
 */
function runIn(dir, files, commands) {
  const pkgDir = path.join(root, dir);
  if (!fs.existsSync(path.join(pkgDir, 'package.json'))) return [];
  if (!fs.existsSync(path.join(pkgDir, 'node_modules', '.bin'))) {
    console.warn(
      `\n!! lint-staged: ${dir}/node_modules não existe, LINT PULADO em ${files.length} arquivo(s). ` +
        `Rode "yarn install" em ${dir}/ para o pre-commit valer.\n`,
    );
    return [];
  }
  const args = files.map((f) => JSON.stringify(f)).join(' ');
  return commands.map(
    (cmd) => `sh -c 'cd ${dir} && exec ./node_modules/.bin/${cmd} "$@"' _ ${args}`,
  );
}

module.exports = {
  // a api já formata via eslint-plugin-prettier
  'api/**/*.{ts,js}': (files) =>
    runIn('api', files, ['eslint --fix --no-warn-ignored']),
  'mobile/**/*.{ts,tsx,js,jsx}': (files) =>
    runIn('mobile', files, ['eslint --fix', 'prettier --write']),
};
