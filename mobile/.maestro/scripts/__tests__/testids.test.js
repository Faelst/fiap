/**
 * @jest-environment node
 */

const {
  collectSourcePatterns,
  createTestIdMatcher,
  extractFlowIds,
} = require('../testids');

describe('collectSourcePatterns', () => {
  it('lê testID literal em JSX e em objeto', () => {
    const patterns = collectSourcePatterns(`
      <Box testID="agenda-screen" />
      <Button loadingTestID="login-submit-loading" />
      options={{ tabBarButtonTestID: 'tab-agenda' }}
    `);

    expect(patterns.literals).toEqual(
      expect.arrayContaining([
        'agenda-screen',
        'login-submit-loading',
        'tab-agenda',
      ]),
    );
  });

  it('lê os template literals de testID, inclusive os derivados da prop', () => {
    const patterns = collectSourcePatterns(
      [
        '<Card testID={`select-student-card-${student.rm}`} />',
        '<Text testID={`${testID}-label`} />',
        'testID={retryTestID ?? `${testID}-retry`}',
      ].join('\n'),
    );

    expect(patterns.templates).toEqual(
      expect.arrayContaining([
        'select-student-card-${student.rm}',
        '${testID}-label',
        '${testID}-retry',
      ]),
    );
  });
});

describe('createTestIdMatcher', () => {
  const matches = createTestIdMatcher({
    literals: ['agenda-day-dropdown', 'header-logout-button'],
    templates: [
      'select-student-card-${student.rm}',
      'boletim-term-${term.term}',
      '${testID}-subject-${subject.index}',
      '${testID}-result',
      '${testID}-option-${option.key}',
    ],
  });

  it('aceita um testID literal', () => {
    expect(matches('header-logout-button')).toBe(true);
  });

  it('aceita um testID de template com parte variável', () => {
    expect(matches('select-student-card-12567')).toBe(true);
  });

  it('aceita um testID derivado de outro (prop + sufixo), em cadeia', () => {
    expect(matches('agenda-day-dropdown-option-2025-03-17')).toBe(true);
    expect(matches('boletim-term-1-subject-0-result')).toBe(true);
  });

  it('recusa um testID que não existe no código', () => {
    expect(matches('header-logout')).toBe(false);
    expect(matches('agenda-day-dropdown-opcao-2025-03-17')).toBe(false);
  });

  it('recusa erro de digitação no meio de um id derivado', () => {
    // A parte variável de `boletim-term-${term.term}` não engole o resto.
    expect(matches('boletim-term-2-subjct-0-result')).toBe(false);
    expect(matches('select-student-card-12567-x')).toBe(false);
  });

  it('recusa sufixo derivado de uma base que não existe', () => {
    expect(matches('agenda-dropdown-option-2025-03-17')).toBe(false);
  });
});

describe('extractFlowIds', () => {
  it('acha os id em qualquer nível dos comandos, inclusive em runFlow', () => {
    const ids = extractFlowIds([
      { appId: 'br.com.fiap.school' },
      [
        { tapOn: { id: 'tab-boletim' } },
        { extendedWaitUntil: { visible: { id: 'boletim-screen' } } },
        {
          runFlow: {
            when: { platform: 'Android' },
            commands: [
              { assertVisible: { id: 'boletim-term-2-subject-0-grade' } },
            ],
          },
        },
        { inputText: '96929456004' },
      ],
    ]);

    expect(ids).toEqual([
      'tab-boletim',
      'boletim-screen',
      'boletim-term-2-subject-0-grade',
    ]);
  });

  it('troca variáveis ${...} do flow por um valor de exemplo', () => {
    const ids = extractFlowIds([
      {},
      [{ tapOn: { id: 'select-student-card-${RM}' } }],
    ]);

    expect(ids).toEqual(['select-student-card-0']);
  });
});

describe('checkFlows', () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const { checkFlows } = require('../testids');

  let root;
  const write = (file, content) => {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  const run = () =>
    checkFlows({
      flowsDir: path.join(root, 'flows'),
      srcDir: path.join(root, 'src'),
      appId: 'br.com.fiap.school',
    });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'maestro-check-'));
    write('src/Screen.tsx', '<Box testID="agenda-screen" />');
    write('src/__tests__/Fake.test.tsx', '<Box testID="so-no-teste" />');
    write('flows/config.yaml', 'flows:\n  - "*"\n');
  });

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it('sem erros quando os ids existem e o subflow existe', () => {
    write(
      'flows/01-ok.yaml',
      'appId: br.com.fiap.school\n---\n- runFlow: subflows/login.yaml\n- assertVisible:\n    id: agenda-screen\n',
    );
    write(
      'flows/subflows/login.yaml',
      'appId: br.com.fiap.school\n---\n- assertVisible:\n    id: agenda-screen\n',
    );

    expect(run()).toEqual({ flows: 2, ids: 2, errors: [] });
  });

  it('aponta id que só existe em teste ou em lugar nenhum', () => {
    write(
      'flows/01-ruim.yaml',
      'appId: br.com.fiap.school\n---\n- tapOn:\n    id: so-no-teste\n',
    );

    expect(run().errors).toEqual([
      '01-ruim.yaml: id "so-no-teste" não existe em src/',
    ]);
  });

  it('aponta appId errado, YAML inválido e subflow que não existe', () => {
    write('flows/01-app.yaml', 'appId: outro.app\n---\n- back\n');
    write('flows/02-yaml.yaml', 'appId: br.com.fiap.school\n---\n- tapOn: [\n');
    write(
      'flows/03-sub.yaml',
      'appId: br.com.fiap.school\n---\n- runFlow:\n    file: subflows/nao-existe.yaml\n',
    );

    const { errors } = run();

    expect(errors).toHaveLength(3);
    expect(errors[0]).toBe(
      '01-app.yaml: appId "outro.app" (esperado br.com.fiap.school)',
    );
    expect(errors[1]).toMatch(/^02-yaml\.yaml: YAML inválido/);
    expect(errors[2]).toBe(
      '03-sub.yaml: runFlow aponta para subflows/nao-existe.yaml, que não existe',
    );
  });
});
