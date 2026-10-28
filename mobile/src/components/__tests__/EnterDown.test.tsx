import { ThemeProvider } from '@shopify/restyle';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  useReducedMotion,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motion, theme } from '../../theme';
import { EnterDown } from '../EnterDown';

jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  return {
    ...mock,
    useReducedMotion: jest.fn(() => false),
    withTiming: jest.fn((toValue: number) => toValue),
    withDelay: jest.fn((_delay: number, animation: number) => animation),
  };
});

const renderEnterDown = (delay?: number) =>
  render(
    <ThemeProvider theme={theme}>
      <EnterDown testID="enter" delay={delay}>
        <Text>conteúdo</Text>
      </EnterDown>
    </ThemeProvider>,
  );

describe('EnterDown', () => {
  beforeEach(() => {
    jest.mocked(useReducedMotion).mockReturnValue(false);
    jest.mocked(withTiming).mockClear();
    jest.mocked(withDelay).mockClear();
  });

  it('não usa animação de layout (entering): a visibilidade não depende dela', async () => {
    await renderEnterDown();

    expect(screen.getByTestId('enter')).not.toHaveProp('entering');
    expect(screen.getByText('conteúdo')).toBeOnTheScreen();
  });

  it('com reduzir movimento já monta visível e no lugar, sem animar', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    await renderEnterDown(120);

    expect(screen.getByTestId('enter')).toHaveStyle({
      opacity: 1,
      transform: [{ translateY: 0 }],
    });
    expect(withTiming).not.toHaveBeenCalled();
  });

  it('sem reduzir movimento entra de 8 pt abaixo, em base com easeOut, depois do atraso', async () => {
    await renderEnterDown(120);

    expect(withDelay).toHaveBeenCalledWith(120, expect.anything());
    expect(withTiming).toHaveBeenCalledWith(1, {
      duration: motion.base,
      easing: motion.easeOut,
    });
  });
});
