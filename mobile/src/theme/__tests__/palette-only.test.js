/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../..');

/** Arquivos de produção em `src/` (sem testes nem utilitários de teste). */
function productionFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' || entry.name === 'test'
        ? []
        : productionFiles(full);
    }
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe('paleta', () => {
  it('hexadecimal e rgba só em theme/palette.ts (01-design.md da v2, 1.1)', () => {
    const offenders = productionFiles(src)
      .filter(file => file !== path.join(src, 'theme', 'palette.ts'))
      .filter(file =>
        /#[0-9a-f]{3,8}\b|rgba?\(/i.test(fs.readFileSync(file, 'utf8')),
      )
      .map(file => path.relative(src, file));

    expect(offenders).toEqual([]);
  });
});
