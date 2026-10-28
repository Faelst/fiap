/**
 * Cruza os `id` usados nos flows do Maestro com os `testID` do código do app
 * (`src/`), para pegar um id errado sem precisar subir o emulador.
 *
 * Os testID do código vêm de duas formas:
 * - literal: `testID="agenda-screen"`, `tabBarButtonTestID: 'tab-agenda'`;
 * - template: `select-student-card-${student.rm}`, ou derivado da prop do
 *   componente, `${testID}-label`, que vale para qualquer testID passado a ele.
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const LITERAL = /\w*[tT]estID\s*[=:]\s*(?:"([^"\n]+)"|'([^'\n]+)')/g;
const TEMPLATE_LINE = /[tT]estID[^\n]*/g;
const TEMPLATE = /`([^`\n]+)`/g;
const PROP_BASE = '${testID}';
const VARIABLE = /\$\{[^}]+\}/g;
const FLOW_VARIABLE_SAMPLE = '0';
// Valor de `${x}` num testID: uma palavra seguida de partes numéricas
// (`12567`, `1`, `2025-03-17`). Não engole um `-sufixo` com letras, para um
// erro de digitação no meio do id não passar como parte variável.
const VARIABLE_VALUE = '[A-Za-z0-9]+(?:-[0-9]+)*';

function collectSourcePatterns(source) {
  const literals = [];
  const templates = [];
  for (const match of source.matchAll(LITERAL)) {
    literals.push(match[1] ?? match[2]);
  }
  for (const [line] of source.matchAll(TEMPLATE_LINE)) {
    for (const match of line.matchAll(TEMPLATE)) {
      templates.push(match[1]);
    }
  }
  return { literals, templates };
}

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** `${x}` vira `VARIABLE_VALUE`; o resto é literal. */
function templateToRegExp(template) {
  const parts = template.split(VARIABLE).map(escapeRegExp);
  return new RegExp(`^${parts.join(VARIABLE_VALUE)}$`);
}

function createTestIdMatcher({ literals, templates }) {
  const known = new Set(literals);
  const absolute = [];
  const derived = [];
  for (const template of templates) {
    if (template.startsWith(PROP_BASE)) {
      derived.push(templateToRegExp(template.slice(PROP_BASE.length)));
    } else {
      absolute.push(templateToRegExp(template));
    }
  }

  const cache = new Map();
  const matches = id => {
    if (cache.has(id)) return cache.get(id);
    cache.set(id, false);
    let result = known.has(id) || absolute.some(regExp => regExp.test(id));
    // Derivado: alguma divisão base + sufixo em que a base também existe.
    for (let cut = 1; !result && cut < id.length; cut++) {
      const tail = id.slice(cut);
      if (derived.some(regExp => regExp.test(tail))) {
        result = matches(id.slice(0, cut));
      }
    }
    cache.set(id, result);
    return result;
  };
  return matches;
}

/** Os `id` de qualquer nível dos documentos YAML de um flow, em ordem. */
function extractFlowIds(documents) {
  const ids = [];
  const visit = node => {
    if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'id' && typeof value === 'string') {
          ids.push(value.replace(VARIABLE, FLOW_VARIABLE_SAMPLE));
        } else {
          visit(value);
        }
      }
    }
  };
  visit(documents);
  return ids;
}

function listFiles(dir, accept) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(full, accept);
      return accept(full) ? [full] : [];
    })
    .sort();
}

const isAppSource = file =>
  /\.(ts|tsx|js|jsx)$/.test(file) &&
  !/\.test\.[jt]sx?$/.test(file) &&
  !file.split(path.sep).includes('__tests__');

const isFlow = file =>
  /\.ya?ml$/.test(file) && path.basename(file) !== 'config.yaml';

/** `runFlow: arquivo.yaml` ou `runFlow: { file: arquivo.yaml }`. */
function extractRunFlowFiles(documents) {
  const files = [];
  const visit = node => {
    if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'runFlow' && typeof value === 'string') files.push(value);
        else if (key === 'runFlow' && typeof value?.file === 'string') {
          files.push(value.file);
        }
        visit(value);
      }
    }
  };
  visit(documents);
  return files;
}

/**
 * Confere cada flow de `flowsDir` (e subpastas): YAML válido, `appId` certo,
 * `runFlow` apontando para um arquivo que existe e todo `id` existindo como
 * testID no código de `srcDir` (fora dos testes).
 */
function checkFlows({ flowsDir, srcDir, appId }) {
  const patterns = { literals: [], templates: [] };
  for (const file of listFiles(srcDir, isAppSource)) {
    const found = collectSourcePatterns(fs.readFileSync(file, 'utf8'));
    patterns.literals.push(...found.literals);
    patterns.templates.push(...found.templates);
  }
  const matches = createTestIdMatcher(patterns);

  const flows = listFiles(flowsDir, isFlow);
  const errors = [];
  let ids = 0;
  for (const file of flows) {
    const name = path.relative(flowsDir, file);
    const parsed = YAML.parseAllDocuments(fs.readFileSync(file, 'utf8'));
    const invalid = parsed.flatMap(document => document.errors);
    if (invalid.length > 0) {
      errors.push(`${name}: YAML inválido (${invalid[0].message})`);
      continue;
    }
    const documents = parsed.map(document => document.toJS());
    const header = documents[0] ?? {};
    if (header.appId !== appId) {
      errors.push(`${name}: appId "${header.appId}" (esperado ${appId})`);
    }
    for (const target of extractRunFlowFiles(documents)) {
      if (!fs.existsSync(path.resolve(path.dirname(file), target))) {
        errors.push(`${name}: runFlow aponta para ${target}, que não existe`);
      }
    }
    for (const id of extractFlowIds(documents)) {
      ids++;
      if (!matches(id)) {
        errors.push(`${name}: id "${id}" não existe em src/`);
      }
    }
  }
  return { flows: flows.length, ids, errors };
}

module.exports = {
  checkFlows,
  collectSourcePatterns,
  createTestIdMatcher,
  extractFlowIds,
};
