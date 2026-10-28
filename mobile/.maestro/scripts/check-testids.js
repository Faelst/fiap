#!/usr/bin/env node
/**
 * Checagem estática dos flows do Maestro (roda sem emulador nem Maestro):
 * YAML válido, appId do app, subflows que existem e todo `id` presente como
 * testID em `src/`. Uso, em mobile/: `yarn maestro:check`.
 */
const path = require('path');
const { checkFlows } = require('./testids');

const mobileDir = path.resolve(__dirname, '../..');
const { flows, ids, errors } = checkFlows({
  flowsDir: path.join(mobileDir, '.maestro'),
  srcDir: path.join(mobileDir, 'src'),
  appId: 'br.com.fiap.school',
});

if (errors.length > 0) {
  console.error(`Flows do Maestro com ${errors.length} problema(s):`);
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}
console.log(`Flows do Maestro ok: ${flows} arquivos, ${ids} ids conferidos.`);
