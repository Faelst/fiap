/**
 * Monta a linha de comando do Maestro para o `yarn maestro:test`. Sem flow nem pasta
 * nos argumentos, roda o workspace inteiro (`.maestro`). O `--device` é opção
 * global do Maestro e precisa vir antes do `test`.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');

const MAESTRO_VERSION = '2.11.0';

function buildMaestroArgs(argv, workspace = '.maestro') {
  const globalArgs = [];
  const testArgs = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--device' || arg === '--udid') {
      globalArgs.push(arg, argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--device=') || arg.startsWith('--udid=')) {
      globalArgs.push(arg);
    } else {
      testArgs.push(arg);
    }
  }
  const hasTarget = testArgs.some(arg => /\.ya?ml$|\.maestro/.test(arg));
  return [
    ...globalArgs,
    'test',
    ...testArgs,
    ...(hasTarget ? [] : [workspace]),
  ];
}

// O instalador oficial põe o binário em ~/.maestro/bin sem mexer no PATH da sessão.
function findMaestro(env = process.env) {
  if (env.MAESTRO_BIN) return env.MAESTRO_BIN;
  const dirs = (env.PATH || '').split(path.delimiter);
  dirs.push(path.join(os.homedir(), '.maestro', 'bin'));
  const names =
    process.platform === 'win32' ? ['maestro.bat', 'maestro'] : ['maestro'];
  for (const dir of dirs) {
    for (const name of names) {
      const candidate = path.join(dir, name);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

module.exports = { buildMaestroArgs, findMaestro, MAESTRO_VERSION };
