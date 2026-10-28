/**
 * @jest-environment node
 */

const { buildTestIdMatcher, extractFlowIds } = require('../testids');

// Fontes mínimas no formato do app: componentes do projeto repassam a prop
// `testID` e derivam ids dela; Box/Pressable/Text são nativos (terminais).
const ACCORDION = `
export function Accordion({ testID, children }) {
  return (
    <View>
      <Pressable testID={testID} onPress={() => {}}>{children}</Pressable>
      <Animated.View testID={\`\${testID}-content\`} />
    </View>
  );
}`;
const SUBJECT = `
export function SubjectAccordion({ testID }) {
  return (
    <Accordion testID={testID}>
      <Box testID={\`\${testID}-result\`} />
    </Accordion>
  );
}`;
const TERM = `
export function TermAccordion({ testID, term }) {
  return (
    <Accordion testID={testID}>
      {term.subjects.map(subject => (
        <SubjectAccordion testID={\`\${testID}-subject-\${subject.index}\`} />
      ))}
    </Accordion>
  );
}`;
const ERROR_STATE = `
export function ErrorState({ testID, retryTestID }) {
  return (
    <Animated.View testID={testID}>
      <Pressable testID={retryTestID ?? \`\${testID}-retry\`} />
    </Animated.View>
  );
}`;
const TAB_BAR = `
function TabItem({ testID }) {
  return (
    <Pressable testID={testID}>
      <Animated.View testID={testID ? \`\${testID}-active-layer\` : undefined} />
    </Pressable>
  );
}
export function TabBar({ options }) {
  return (
    <Box testID="tab-bar">
      <TabItem testID={options.tabBarButtonTestID} />
    </Box>
  );
}`;
const SCREENS = `
const tabs = { tabBarButtonTestID: 'tab-agenda' };
export function ReportCardScreen({ terms }) {
  return (
    <Screen testID="boletim-screen">
      <ErrorState testID="boletim-error" />
      {terms.map(term => (
        <TermAccordion testID={\`boletim-term-\${term.term}\`} term={term} />
      ))}
    </Screen>
  );
}
export function LessonsScreen() {
  return <Screen testID="agenda-screen"><LessonItem testID="agenda-lesson-0" /></Screen>;
}
export function Screen({ testID, children }) {
  return <Box testID={testID} flex={1}>{children}</Box>;
}
export function LoginScreen() {
  return <PrimaryButton testID="login-submit-button" loadingTestID="login-submit-loading" />;
}
export function PrimaryButton({ testID, loadingTestID }) {
  return <Pressable testID={testID}><Spinner testID={loadingTestID} /></Pressable>;
}`;

const matches = buildTestIdMatcher([
  ACCORDION,
  SUBJECT,
  TERM,
  ERROR_STATE,
  TAB_BAR,
  SCREENS,
]);

describe('buildTestIdMatcher', () => {
  it('aceita testID literal num elemento, também repassado por um componente', () => {
    expect(matches('tab-bar')).toBe(true);
    expect(matches('boletim-screen')).toBe(true);
  });

  it('aceita template com parte variável e recusa erro de digitação', () => {
    expect(matches('boletim-term-1')).toBe(true);
    expect(matches('boletim-term-1-x')).toBe(false);
  });

  it('aceita sufixos em cadeia (Term → Subject → Accordion)', () => {
    expect(matches('boletim-term-1-content')).toBe(true);
    expect(matches('boletim-term-1-subject-0')).toBe(true);
    expect(matches('boletim-term-1-subject-0-result')).toBe(true);
    expect(matches('boletim-term-1-subject-0-content')).toBe(true);
  });

  it('só aplica o sufixo de um componente a ids passados a ele', () => {
    expect(matches('agenda-lesson-0-result')).toBe(false);
    expect(matches('agenda-screen-content')).toBe(false);
    expect(matches('boletim-screen-retry')).toBe(false);
    expect(matches('boletim-error-retry')).toBe(true);
  });

  it('recusa erro de digitação no meio de um id derivado', () => {
    expect(matches('boletim-term-2-subjct-0-result')).toBe(false);
  });

  it('segue props *TestID até o elemento que as usa', () => {
    expect(matches('login-submit-loading')).toBe(true);
    expect(matches('tab-agenda')).toBe(true);
    expect(matches('tab-agenda-active-layer')).toBe(true);
    expect(matches('login-submit-button-loading')).toBe(false);
  });

  it('segue o testID repassado por spread de props', () => {
    const withSpread = buildTestIdMatcher([
      `export function UnderlineInput({ testID }) {
        return <TextInput testID={testID} />;
      }
      export function CpfInput({ onChangeText, ...props }) {
        return <UnderlineInput {...props} onChangeText={onChangeText} />;
      }
      export function LoginScreen() {
        return <CpfInput testID="login-cpf-input" />;
      }`,
    ]);

    expect(withSpread('login-cpf-input')).toBe(true);
  });

  it('recusa id que não existe', () => {
    expect(matches('header-logout')).toBe(false);
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
