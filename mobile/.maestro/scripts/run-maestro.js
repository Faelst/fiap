#!/usr/bin/env node
/**
 * Roda os flows do Maestro localmente. Uso, em mobile/:
 *   yarn maestro:test                                   # todos os flows
 *   yarn maestro:test .maestro/04-aulas-navegar-dias.yaml
 *   yarn maestro:test --include-tags boletim
 *   yarn maestro:test --device emulator-5554
 * Pré-requisitos (API com o seed, app instalado): .maestro/README.md.
 */
const path = require('path');
const { spawnSync } = require('child_process');
const {
  buildMaestroArgs,
  findMaestro,
  MAESTRO_VERSION,
} = require('./maestro-args');

const maestro = findMaestro();
if (!maestro) {
  console.error(
    'Maestro não encontrado (nem no PATH, nem em ~/.maestro/bin). Instale com:',
  );
  console.error(
    `  curl -fsSL "https://get.maestro.mobile.dev" | MAESTRO_VERSION=${MAESTRO_VERSION} bash`,
  );
  console.error('Ou aponte o binário em MAESTRO_BIN.');
  process.exit(1);
}

const mobileDir = path.resolve(__dirname, '../..');
const args = buildMaestroArgs(process.argv.slice(2));
const result = spawnSync(maestro, args, { cwd: mobileDir, stdio: 'inherit' });
if (result.error) {
  console.error(`Falha ao executar o Maestro: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
