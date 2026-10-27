const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;

/**
 * Roda eslint --fix e prettier --write nos arquivos staged de uma pasta
 * (api/ ou mobile/), com os binários da própria pasta. Se a pasta ou o
 * node_modules dela ainda não existe, ignora sem falhar.
 */
function forPackage(dir, files) {
  const pkgDir = path.join(root, dir);
  if (!fs.existsSync(path.join(pkgDir, 'package.json'))) return [];
  if (!fs.existsSync(path.join(pkgDir, 'node_modules', '.bin'))) {
    console.warn(`lint-staged: ${dir}/node_modules ausente, arquivos ignorados`);
    return [];
  }
  const args = files.map((f) => JSON.stringify(f)).join(' ');
  return [
    `yarn --cwd ${dir} eslint --fix ${args}`,
    `yarn --cwd ${dir} prettier --write ${args}`,
  ];
}

module.exports = {
  'api/**/*.{ts,tsx,js,jsx}': (files) => forPackage('api', files),
  'mobile/**/*.{ts,tsx,js,jsx}': (files) => forPackage('mobile', files),
};
