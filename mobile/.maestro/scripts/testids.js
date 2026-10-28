/**
 * Cruza os `id` usados nos flows do Maestro com os `testID` do código do app
 * (`src/`), para pegar um id errado sem precisar subir o emulador.
 *
 * Lê o JSX com o parser do Babel e segue a prop `testID` de componente em
 * componente: `<TermAccordion testID={`boletim-term-${n}`}>` repassa o id ao
 * `Accordion`, que o põe num `Pressable` e deriva `${testID}-content`. Assim um
 * sufixo só vale para ids que chegam ao componente que o declara. Props
 * `*TestID` (`loadingTestID`, `tabBarButtonTestID`) são seguidas pelo nome.
 */

const fs = require('fs');
const path = require('path');
const { parseSync } = require('@babel/core');
const YAML = require('yaml');

const VARIABLE = /\$\{[^}]+\}/g;
const FLOW_VARIABLE_SAMPLE = '0';
// Valor de `${x}` num testID: uma palavra seguida de partes numéricas
// (`12567`, `1`, `2025-03-17`). Não engole um `-sufixo` com letras, para um
// erro de digitação no meio do id não passar como parte variável.
const VARIABLE_VALUE = '[A-Za-z0-9]+(?:-[0-9]+)*';
// Marca o lugar da prop `testID` do componente numa fonte de regex.
const BASE = '\u0000';
const MAX_DEPTH = 12;
const NAMED_TEST_ID = /.TestID$/;
// JSX fora de função (raro) conta como de um componente sem prop `testID`.
const MODULE_SCOPE = '(module)';

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parse = source =>
  parseSync(source, {
    babelrc: false,
    configFile: false,
    filename: 'source.tsx',
    parserOpts: { plugins: ['typescript', 'jsx'] },
  });

/** Fontes de regex (ou `{ named }`) que uma expressão de testID pode gerar. */
function idSources(node) {
  if (!node) return [];
  switch (node.type) {
    case 'StringLiteral':
      return [escapeRegExp(node.value)];
    case 'TemplateLiteral':
      return [
        node.quasis
          .map((quasi, index) => {
            const expression = node.expressions[index];
            const text = escapeRegExp(quasi.value.cooked);
            if (!expression) return text;
            const isBase =
              expression.type === 'Identifier' && expression.name === 'testID';
            return text + (isBase ? BASE : VARIABLE_VALUE);
          })
          .join(''),
      ];
    case 'Identifier':
      if (node.name === 'testID') return [BASE];
      return NAMED_TEST_ID.test(node.name) ? [{ named: node.name }] : [];
    case 'MemberExpression':
      return !node.computed && NAMED_TEST_ID.test(node.property.name)
        ? [{ named: node.property.name }]
        : [];
    case 'LogicalExpression':
      return [...idSources(node.left), ...idSources(node.right)];
    case 'ConditionalExpression':
      return [...idSources(node.consequent), ...idSources(node.alternate)];
    case 'JSXExpressionContainer':
      return idSources(node.expression);
    default:
      return [];
  }
}

const elementName = name =>
  name.type === 'JSXMemberExpression'
    ? `${elementName(name.object)}.${name.property.name}`
    : name.name;

const isComponentFunction = node =>
  node?.type === 'ArrowFunctionExpression' ||
  node?.type === 'FunctionExpression';

/** Usos de testID por componente e os valores literais de cada prop `*TestID`. */
function collectUsages(sources) {
  const usages = new Map();
  const named = new Map();
  const addNamed = (name, value) =>
    named.set(name, [...(named.get(name) ?? []), escapeRegExp(value)]);

  const visit = (node, component) => {
    if (Array.isArray(node)) {
      node.forEach(child => visit(child, component));
      return;
    }
    if (!node || typeof node.type !== 'string') return;

    let current = component;
    if (node.type === 'FunctionDeclaration' && node.id) current = node.id.name;
    if (
      node.type === 'VariableDeclarator' &&
      node.id.type === 'Identifier' &&
      isComponentFunction(node.init)
    ) {
      current = node.id.name;
    }
    if (!usages.has(current)) usages.set(current, []);

    if (node.type === 'JSXOpeningElement') {
      for (const attribute of node.attributes) {
        // `{...props}`: o testID recebido pode ir junto (ex.: CpfInput).
        if (attribute.type === 'JSXSpreadAttribute') {
          usages
            .get(current)
            .push({ target: elementName(node.name), sources: [BASE] });
          continue;
        }
        const name = attribute.name.name;
        if (name === 'testID') {
          usages.get(current).push({
            target: elementName(node.name),
            sources: idSources(attribute.value),
          });
        } else if (
          NAMED_TEST_ID.test(name) &&
          attribute.value?.type === 'StringLiteral'
        ) {
          addNamed(name, attribute.value.value);
        }
      }
    }
    if (
      node.type === 'ObjectProperty' &&
      NAMED_TEST_ID.test(node.key.name ?? '') &&
      node.value.type === 'StringLiteral'
    ) {
      addNamed(node.key.name, node.value.value);
    }

    for (const [key, child] of Object.entries(node)) {
      if (key !== 'loc' && child && typeof child === 'object') {
        visit(child, current);
      }
    }
  };

  sources.forEach(source => visit(parse(source).program, MODULE_SCOPE));
  return { usages, named };
}

/**
 * Matcher dos testID que chegam a um elemento nativo, a partir das fontes
 * (`.ts`/`.tsx`) do app.
 */
function buildTestIdMatcher(sources) {
  const { usages, named } = collectUsages(sources);
  const terminals = new Set();
  const visited = new Set();

  const expand = (component, base, depth) => {
    const key = `${component}|${base}`;
    if (depth > MAX_DEPTH || visited.has(key)) return;
    visited.add(key);
    for (const { target, sources: idList } of usages.get(component)) {
      const resolved = idList.flatMap(source => {
        if (typeof source !== 'string') return named.get(source.named) ?? [];
        if (!source.includes(BASE)) return [source];
        return base === null ? [] : [source.split(BASE).join(base)];
      });
      for (const id of resolved) {
        if (usages.has(target)) expand(target, id, depth + 1);
        else terminals.add(id);
      }
    }
  };
  for (const component of usages.keys()) expand(component, null, 0);

  const regExps = [...terminals].map(source => new RegExp(`^${source}$`));
  return id => regExps.some(regExp => regExp.test(id));
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
  const matches = buildTestIdMatcher(
    listFiles(srcDir, isAppSource).map(file => fs.readFileSync(file, 'utf8')),
  );

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
  buildTestIdMatcher,
  checkFlows,
  extractFlowIds,
};
