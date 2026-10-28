import { fireEvent, screen, within } from '@testing-library/react-native';

import { renderWithTheme } from '../../../../test/renderWithTheme';
import { theme } from '../../../../theme';
import type { ReportCardTerm } from '../../useReportCardViewModel';
import { SubjectAccordion } from '../SubjectAccordion';
import { TermAccordion } from '../TermAccordion';

const portugues = {
  key: '1-0',
  index: 0,
  name: 'Língua Portuguesa',
  grade: '9,5',
  absences: '0',
  resultAccessibilityLabel: 'Nota 9,5, 0 faltas',
  expanded: false,
};

const notReleased = {
  ...portugues,
  key: '2-0',
  grade: '-',
  absences: '-',
  resultAccessibilityLabel: 'Nota e faltas ainda não lançadas',
};

const term1: ReportCardTerm = {
  term: 1,
  title: '1º TRIMESTRE',
  accessibilityLabel: '1º trimestre',
  expanded: false,
  subjects: [
    portugues,
    {
      ...portugues,
      key: '1-1',
      index: 1,
      name: 'Matemática',
      grade: '8,0',
      absences: '2',
      resultAccessibilityLabel: 'Nota 8,0, 2 faltas',
    },
  ],
};

describe('SubjectAccordion', () => {
  const onToggle = jest.fn();
  const renderSubject = (subject = portugues) =>
    renderWithTheme(
      <SubjectAccordion
        testID="boletim-term-1-subject-0"
        subject={subject}
        onToggle={onToggle}
      />,
    );

  it('fechado: o nome da disciplina num botão recolhido, sem Nota e Faltas', async () => {
    await renderSubject();

    const header = screen.getByTestId('boletim-term-1-subject-0');
    expect(header).toHaveTextContent('Língua Portuguesa');
    expect(header).toHaveAccessibleName('Língua Portuguesa');
    expect(header).not.toBeExpanded();
    expect(header).toHaveStyle({ minHeight: theme.sizes.touchTarget });
    expect(screen.queryByText('Nota:')).toBeNull();
  });

  it('nome longo quebra em até 2 linhas', async () => {
    await renderSubject();

    expect(screen.getByText('Língua Portuguesa')).toHaveProp(
      'numberOfLines',
      2,
    );
  });

  it('aberto: "Nota:" 9,5 e "Faltas:" 0, lidos como um elemento só', async () => {
    await renderSubject({ ...portugues, expanded: true });

    expect(screen.getByTestId('boletim-term-1-subject-0')).toBeExpanded();
    expect(screen.getByText('Nota:')).toBeOnTheScreen();
    expect(screen.getByText('Faltas:')).toBeOnTheScreen();
    expect(
      screen.getByTestId('boletim-term-1-subject-0-grade', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('9,5');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-absences', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('0');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-result'),
    ).toHaveAccessibleName('Nota 9,5, 0 faltas');
  });

  it('não avaliado: "-" na nota e nas faltas', async () => {
    await renderSubject({ ...notReleased, expanded: true });

    expect(
      screen.getByTestId('boletim-term-1-subject-0-grade', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('-');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-absences', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('-');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-result'),
    ).toHaveAccessibleName('Nota e faltas ainda não lançadas');
  });

  it('tocar na disciplina chama onToggle', async () => {
    await renderSubject();

    await fireEvent.press(screen.getByTestId('boletim-term-1-subject-0'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('TermAccordion', () => {
  const onToggle = jest.fn();
  const onToggleSubject = jest.fn();

  beforeEach(() => {
    onToggle.mockClear();
    onToggleSubject.mockClear();
  });

  const renderTerm = (term = term1) =>
    renderWithTheme(
      <TermAccordion
        testID="boletim-term-1"
        term={term}
        onToggle={onToggle}
        onToggleSubject={onToggleSubject}
      />,
    );

  it('fechado: card "1º TRIMESTRE", recolhido, sem disciplinas montadas', async () => {
    await renderTerm();

    const header = screen.getByTestId('boletim-term-1');
    expect(header).toHaveTextContent('1º TRIMESTRE');
    expect(header).toHaveAccessibleName('1º trimestre');
    expect(header).not.toBeExpanded();
    expect(
      screen.queryByTestId('boletim-term-1-subject-0', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });

  it('tocar no trimestre chama onToggle', async () => {
    await renderTerm();

    await fireEvent.press(screen.getByTestId('boletim-term-1'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('aberto: as disciplinas na ordem, cada uma com o próprio testID', async () => {
    await renderTerm({ ...term1, expanded: true });

    const content = screen.getByTestId('boletim-term-1-content');
    expect(
      within(content).getByTestId('boletim-term-1-subject-0'),
    ).toHaveTextContent('Língua Portuguesa');
    expect(
      within(content).getByTestId('boletim-term-1-subject-1'),
    ).toHaveTextContent('Matemática');
  });

  it('tocar numa disciplina chama onToggleSubject com o índice dela', async () => {
    await renderTerm({ ...term1, expanded: true });

    await fireEvent.press(screen.getByTestId('boletim-term-1-subject-1'));

    expect(onToggleSubject).toHaveBeenCalledWith(1);
    expect(onToggle).not.toHaveBeenCalled();
  });
});
