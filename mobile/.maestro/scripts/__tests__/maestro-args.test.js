/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { buildMaestroArgs, findMaestro } = require('../maestro-args');

describe('buildMaestroArgs', () => {
  it('roda o workspace inteiro quando não recebe flow', () => {
    expect(buildMaestroArgs([])).toEqual(['test', '.maestro']);
  });

  it('repassa as opções do test e mantém o workspace', () => {
    expect(buildMaestroArgs(['--include-tags', 'boletim'])).toEqual([
      'test',
      '--include-tags',
      'boletim',
      '.maestro',
    ]);
  });

  it('roda só o flow informado', () => {
    expect(buildMaestroArgs(['.maestro/04-aulas-navegar-dias.yaml'])).toEqual([
      'test',
      '.maestro/04-aulas-navegar-dias.yaml',
    ]);
  });

  it('move o --device para antes do test', () => {
    expect(
      buildMaestroArgs([
        '--device',
        'emulator-5554',
        '--include-tags',
        'login',
      ]),
    ).toEqual([
      '--device',
      'emulator-5554',
      'test',
      '--include-tags',
      'login',
      '.maestro',
    ]);
    expect(buildMaestroArgs(['--device=emulator-5554'])).toEqual([
      '--device=emulator-5554',
      'test',
      '.maestro',
    ]);
  });
});

describe('findMaestro', () => {
  it('usa o MAESTRO_BIN quando definido', () => {
    expect(findMaestro({ MAESTRO_BIN: '/opt/maestro/bin/maestro' })).toBe(
      '/opt/maestro/bin/maestro',
    );
  });

  it('procura o binário no PATH', () => {
    const dir = path.join(__dirname, 'fixtures-bin');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'maestro'), '');
    try {
      expect(findMaestro({ PATH: dir })).toBe(path.join(dir, 'maestro'));
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
